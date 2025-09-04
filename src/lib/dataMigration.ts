import { TripStorage } from './tripStorage'
import { dbService } from './database'
import { Trip } from '@/types/trip'
import toast from 'react-hot-toast'

export class DataMigration {
  /**
   * Migrate all local trips to the database for a logged-in user
   */
  static async migrateLocalTripsToDatabase(userId: string): Promise<{ success: boolean, migratedCount: number, errors: string[] }> {
    const result = {
      success: true,
      migratedCount: 0,
      errors: [] as string[]
    }

    try {
      // Get all local trips
      const localTrips = TripStorage.getAllTrips()
      
      if (localTrips.length === 0) {
        return result
      }

      console.log(`Found ${localTrips.length} local trips to migrate`)

      // Migrate each trip
      for (const localTrip of localTrips) {
        try {
          console.log(`Migrating trip: ${localTrip.name}`)
          
          // Create trip in database
          const { trip: createdTrip, error } = await dbService.createTrip(localTrip, userId)
          
          if (error) {
            result.errors.push(`Failed to migrate "${localTrip.name}": ${error.message}`)
            result.success = false
            continue
          }

          if (!createdTrip) {
            result.errors.push(`Failed to migrate "${localTrip.name}": No trip returned`)
            result.success = false
            continue
          }

          // Migrate expenses
          for (const expense of localTrip.expenses) {
            const { error: expenseError } = await dbService.addExpense(
              createdTrip.id,
              {
                category: expense.category,
                description: expense.description,
                expected_amount: expense.expected_amount,
                actual_amount: expense.actual_amount,
                date: expense.date,
                paid_by: expense.paid_by
              },
              userId
            )

            if (expenseError) {
              result.errors.push(`Failed to migrate expense "${expense.description}" for trip "${localTrip.name}": ${expenseError.message}`)
            }
          }

          result.migratedCount++
          console.log(`Successfully migrated trip: ${localTrip.name}`)
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          result.errors.push(`Failed to migrate "${localTrip.name}": ${errorMessage}`)
          result.success = false
        }
      }

      // If migration was successful, clear local storage
      if (result.success && result.errors.length === 0) {
        this.clearLocalData()
        console.log('Migration completed successfully, local data cleared')
      } else {
        console.log(`Migration completed with ${result.errors.length} errors`)
      }

      return result
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      result.errors.push(`Migration failed: ${errorMessage}`)
      result.success = false
      return result
    }
  }

  /**
   * Check if there's local data that needs migration
   */
  static hasLocalDataToMigrate(): boolean {
    try {
      const localTrips = TripStorage.getAllTrips()
      const hasLegacyData = Boolean(
        localStorage.getItem('trip-plan') || 
        localStorage.getItem('trip-expenses')
      )
      
      return localTrips.length > 0 || hasLegacyData
    } catch (error) {
      console.error('Error checking for local data:', error)
      return false
    }
  }

  /**
   * Get count of local trips that would be migrated
   */
  static getLocalTripsCount(): number {
    try {
      return TripStorage.getAllTrips().length
    } catch (error) {
      console.error('Error getting local trips count:', error)
      return 0
    }
  }

  /**
   * Clear all local trip data
   */
  static clearLocalData(): void {
    try {
      // Clear new format data
      localStorage.removeItem('trip-planner-trips')
      localStorage.removeItem('trip-planner-current-trip')
      localStorage.removeItem('trip-planner-templates')
      
      // Clear legacy data
      localStorage.removeItem('trip-plan')
      localStorage.removeItem('trip-expenses')
      
      console.log('Local trip data cleared')
    } catch (error) {
      console.error('Error clearing local data:', error)
    }
  }

  /**
   * Create a backup of local data before migration
   */
  static createLocalDataBackup(): string {
    try {
      const backupData = {
        trips: TripStorage.getAllTrips(),
        currentTripId: TripStorage.getCurrentTripId(),
        templates: TripStorage.getTemplates(),
        legacyPlan: localStorage.getItem('trip-plan'),
        legacyExpenses: localStorage.getItem('trip-expenses'),
        timestamp: new Date().toISOString()
      }

      const backupJson = JSON.stringify(backupData, null, 2)
      
      // Create downloadable backup file
      const blob = new Blob([backupJson], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `trip-planner-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      return backupJson
    } catch (error) {
      console.error('Error creating backup:', error)
      throw error
    }
  }

  /**
   * Restore data from backup
   */
  static restoreFromBackup(backupData: string): { success: boolean, error?: string } {
    try {
      const data = JSON.parse(backupData)
      
      // Restore trips
      if (data.trips && Array.isArray(data.trips)) {
        localStorage.setItem('trip-planner-trips', JSON.stringify(data.trips))
      }
      
      // Restore current trip
      if (data.currentTripId) {
        localStorage.setItem('trip-planner-current-trip', data.currentTripId)
      }
      
      // Restore templates
      if (data.templates && Array.isArray(data.templates)) {
        localStorage.setItem('trip-planner-templates', JSON.stringify(data.templates))
      }
      
      // Restore legacy data
      if (data.legacyPlan) {
        localStorage.setItem('trip-plan', data.legacyPlan)
      }
      if (data.legacyExpenses) {
        localStorage.setItem('trip-expenses', data.legacyExpenses)
      }

      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid backup format'
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Show migration prompt to user
   */
  static async promptUserForMigration(userId: string): Promise<boolean> {
    if (!this.hasLocalDataToMigrate()) {
      return true // No migration needed
    }

    const tripsCount = this.getLocalTripsCount()
    
    // Don't show migration prompt if no trips
    if (tripsCount === 0) {
      return true
    }
    
    return new Promise((resolve) => {
      try {
        const shouldMigrate = confirm(
          `You have ${tripsCount} trip(s) stored locally. Would you like to sync them to the cloud so you can share them with others?\n\n` +
          'This will move your trips to the database where they can be accessed from any device and shared with fellow travelers.\n\n' +
          'Click OK to migrate your trips, or Cancel to keep them local only.'
        )

        if (shouldMigrate) {
          // Show migration in progress
          toast.loading('Migrating your trips to the cloud...', { id: 'migration' })
          
          this.migrateLocalTripsToDatabase(userId)
            .then((result) => {
              toast.dismiss('migration')
              
              if (result.success && result.errors.length === 0) {
                toast.success(`Successfully migrated ${result.migratedCount} trip(s) to the cloud!`)
                resolve(true)
              } else {
                toast.error(`Migration completed with ${result.errors.length} error(s). Check console for details.`)
                console.error('Migration errors:', result.errors)
                resolve(result.migratedCount > 0) // Partial success
              }
            })
            .catch((error) => {
              toast.dismiss('migration')
              toast.error('Migration failed. Your local trips are still available.')
              console.error('Migration failed:', error)
              resolve(false)
            })
        } else {
          resolve(false) // User chose not to migrate
        }
      } catch (error) {
        console.error('Error in migration prompt:', error)
        resolve(false)
      }
    })
  }

  /**
   * Sync down user's cloud trips to local storage (for offline access)
   */
  static async syncCloudTripsToLocal(userId: string): Promise<void> {
    try {
      const { trips, error } = await dbService.getUserTrips(userId)
      
      if (error) {
        console.error('Failed to sync cloud trips:', error)
        return
      }

      // Store cloud trips locally for offline access
      if (trips.length > 0) {
        for (const trip of trips) {
          TripStorage.saveTrip(trip)
        }
        console.log(`Synced ${trips.length} cloud trips to local storage`)
      }
      
    } catch (error) {
      console.error('Error syncing cloud trips to local:', error)
    }
  }
}
