'use client'

import { useState } from 'react'
import { 
  Camera,
  Upload,
  Download,
  Image as ImageIcon,
  Grid3X3,
  Layout,
  Trash2,
  Plus
} from 'lucide-react'
import ImageGallery from '@/components/ImageGallery'

interface ImageItem {
  id: string
  src: string
  alt: string
  date: string
  name: string
  category: "plan" | "trip"
}

interface GalleryTabProps {
  tripImages: ImageItem[]
  onSaveImages: (images: ImageItem[]) => void
  isRainTheme: boolean
}

export default function GalleryTab({
  tripImages,
  onSaveImages,
  isRainTheme
}: GalleryTabProps) {
  const [uploadMode, setUploadMode] = useState<'single' | 'multiple'>('multiple')
  
  // Plan images are static for Tennessee trip
  const planImages: ImageItem[] = [
    {
      id: 'plan-1',
      src: '/1.jpeg',
      alt: 'Tennessee Trip Plan - Page 1: Detailed itinerary with daily activities, costs, and route planning',
      date: 'Created: Aug 25, 2024',
      name: 'Tennessee Trip Plan - Page 1',
      category: 'plan' as const
    },
    {
      id: 'plan-2', 
      src: '/2.jpeg',
      alt: 'Tennessee Trip Plan - Page 2: Budget breakdown by day, fuel costs, and total trip expenses',
      date: 'Created: Aug 25, 2024',
      name: 'Tennessee Trip Plan - Page 2', 
      category: 'plan' as const
    }
  ]

  const handleImageUpload = (files: FileList) => {
    const newImages = Array.from(files).map(file => ({
      id: `trip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      src: URL.createObjectURL(file),
      alt: file.name,
      date: new Date().toISOString(),
      name: file.name,
      category: 'trip' as const
    }))
    
    onSaveImages([...tripImages, ...newImages])
  }

  const handleDeleteImage = (imageId: string) => {
    const updatedImages = tripImages.filter(image => image.id !== imageId)
    onSaveImages(updatedImages)
  }

  const exportAllImages = async () => {
    // Create a zip-like download experience by downloading images one by one
    for (const image of tripImages) {
      try {
        const response = await fetch(image.src)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = image.name || `trip-image-${image.id}.jpg`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        console.error('Download failed for image:', image.name, error)
      }
    }
  }

  const totalImages = planImages.length + tripImages.length
  const totalSize = tripImages.length * 0.5 // Rough estimate in MB

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            isRainTheme ? 'bg-cyan-500/20' : 'bg-cyan-100'
          }`}>
            <Camera className={`w-5 h-5 ${
              isRainTheme ? 'text-cyan-400' : 'text-cyan-600'
            }`} />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${
              isRainTheme ? 'text-white' : 'text-gray-900'
            }`}>Trip Gallery</h1>
            <p className={`text-sm ${
              isRainTheme ? 'text-slate-300' : 'text-gray-600'
            }`}>Manage your trip photos and planning documents</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {tripImages.length > 0 && (
            <button
              onClick={exportAllImages}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm ${
                isRainTheme 
                  ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
              }`}
            >
              <Download className="w-4 h-4" />
              Export All
            </button>
          )}
        </div>
      </div>

      {/* Gallery Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`rounded-xl shadow-lg border p-4 text-center ${
          isRainTheme 
            ? 'bg-white/10 backdrop-blur-sm border-white/20' 
            : 'bg-white border-gray-200'
        }`}>
          <div className={`p-2 rounded-lg mx-auto mb-2 w-fit ${
            isRainTheme ? 'bg-blue-500/20' : 'bg-blue-100'
          }`}>
            <ImageIcon className={`w-5 h-5 ${
              isRainTheme ? 'text-blue-400' : 'text-blue-600'
            }`} />
          </div>
          <p className={`text-2xl font-bold ${
            isRainTheme ? 'text-white' : 'text-gray-900'
          }`}>{totalImages}</p>
          <p className={`text-xs ${
            isRainTheme ? 'text-slate-300' : 'text-gray-600'
          }`}>Total Images</p>
        </div>

        <div className={`rounded-xl shadow-lg border p-4 text-center ${
          isRainTheme 
            ? 'bg-white/10 backdrop-blur-sm border-white/20' 
            : 'bg-white border-gray-200'
        }`}>
          <div className={`p-2 rounded-lg mx-auto mb-2 w-fit ${
            isRainTheme ? 'bg-green-500/20' : 'bg-green-100'
          }`}>
            <Camera className={`w-5 h-5 ${
              isRainTheme ? 'text-green-400' : 'text-green-600'
            }`} />
          </div>
          <p className={`text-2xl font-bold ${
            isRainTheme ? 'text-white' : 'text-gray-900'
          }`}>{tripImages.length}</p>
          <p className={`text-xs ${
            isRainTheme ? 'text-slate-300' : 'text-gray-600'
          }`}>Trip Photos</p>
        </div>

        <div className={`rounded-xl shadow-lg border p-4 text-center ${
          isRainTheme 
            ? 'bg-white/10 backdrop-blur-sm border-white/20' 
            : 'bg-white border-gray-200'
        }`}>
          <div className={`p-2 rounded-lg mx-auto mb-2 w-fit ${
            isRainTheme ? 'bg-purple-500/20' : 'bg-purple-100'
          }`}>
            <Layout className={`w-5 h-5 ${
              isRainTheme ? 'text-purple-400' : 'text-purple-600'
            }`} />
          </div>
          <p className={`text-2xl font-bold ${
            isRainTheme ? 'text-white' : 'text-gray-900'
          }`}>{planImages.length}</p>
          <p className={`text-xs ${
            isRainTheme ? 'text-slate-300' : 'text-gray-600'
          }`}>Plan Images</p>
        </div>

        <div className={`rounded-xl shadow-lg border p-4 text-center ${
          isRainTheme 
            ? 'bg-white/10 backdrop-blur-sm border-white/20' 
            : 'bg-white border-gray-200'
        }`}>
          <div className={`p-2 rounded-lg mx-auto mb-2 w-fit ${
            isRainTheme ? 'bg-orange-500/20' : 'bg-orange-100'
          }`}>
            <Upload className={`w-5 h-5 ${
              isRainTheme ? 'text-orange-400' : 'text-orange-600'
            }`} />
          </div>
          <p className={`text-2xl font-bold ${
            isRainTheme ? 'text-white' : 'text-gray-900'
          }`}>{totalSize.toFixed(1)}</p>
          <p className={`text-xs ${
            isRainTheme ? 'text-slate-300' : 'text-gray-600'
          }`}>MB Approx</p>
        </div>
      </div>

      {/* Upload Area */}
      <div className={`rounded-xl shadow-lg border p-6 ${
        isRainTheme 
          ? 'bg-white/10 backdrop-blur-sm border-white/20' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg ${
            isRainTheme ? 'bg-green-500/20' : 'bg-green-100'
          }`}>
            <Upload className={`w-5 h-5 ${
              isRainTheme ? 'text-green-400' : 'text-green-600'
            }`} />
          </div>
          <h2 className={`text-lg font-semibold ${
            isRainTheme ? 'text-white' : 'text-gray-900'
          }`}>Upload Trip Photos</h2>
        </div>

        <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isRainTheme 
            ? 'border-white/20 hover:border-white/40 hover:bg-white/5' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}>
          <Upload className={`w-12 h-12 mx-auto mb-4 ${
            isRainTheme ? 'text-slate-400' : 'text-gray-400'
          }`} />
          <h3 className={`text-lg font-medium mb-2 ${
            isRainTheme ? 'text-white' : 'text-gray-900'
          }`}>Upload Your Trip Photos</h3>
          <p className={`text-sm mb-4 ${
            isRainTheme ? 'text-slate-300' : 'text-gray-600'
          }`}>
            Drag and drop your images here, or click to select files
          </p>
          
          <input
            type="file"
            multiple
            accept="image/*"
            capture="environment"
            onChange={(e) => {
              if (e.target.files) {
                handleImageUpload(e.target.files)
              }
            }}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg cursor-pointer transition-colors font-medium ${
              isRainTheme 
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white' 
                : 'bg-cyan-600 hover:bg-cyan-700 text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            Select Images
          </label>
          
          <p className={`text-xs mt-2 ${
            isRainTheme ? 'text-slate-400' : 'text-gray-500'
          }`}>
            Supports JPG, PNG, WEBP files
          </p>
        </div>
      </div>

      {/* Image Gallery Component */}
      <div className={`rounded-xl shadow-lg border overflow-hidden ${
        isRainTheme 
          ? 'bg-white/10 backdrop-blur-sm border-white/20' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                isRainTheme ? 'bg-indigo-500/20' : 'bg-indigo-100'
              }`}>
                <Grid3X3 className={`w-5 h-5 ${
                  isRainTheme ? 'text-indigo-400' : 'text-indigo-600'
                }`} />
              </div>
              <h2 className={`text-lg font-semibold ${
                isRainTheme ? 'text-white' : 'text-gray-900'
              }`}>Image Gallery</h2>
            </div>
            
            {tripImages.length > 0 && (
              <p className={`text-sm ${
                isRainTheme ? 'text-slate-300' : 'text-gray-600'
              }`}>
                {tripImages.length} photos uploaded
              </p>
            )}
          </div>
        </div>

        <div className="p-6">
          <ImageGallery
            title=""
            planImages={planImages}
            tripImages={tripImages}
            onUpload={handleImageUpload}
          />
        </div>
      </div>

      {/* Trip Photos List (if any) */}
      {tripImages.length > 0 && (
        <div className={`rounded-xl shadow-lg border p-6 ${
          isRainTheme 
            ? 'bg-white/10 backdrop-blur-sm border-white/20' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${
              isRainTheme ? 'bg-red-500/20' : 'bg-red-100'
            }`}>
              <Trash2 className={`w-5 h-5 ${
                isRainTheme ? 'text-red-400' : 'text-red-600'
              }`} />
            </div>
            <h2 className={`text-lg font-semibold ${
              isRainTheme ? 'text-white' : 'text-gray-900'
            }`}>Manage Trip Photos</h2>
          </div>
          
          <div className="space-y-3">
            {tripImages.map((image) => (
              <div key={image.id} className={`flex items-center justify-between p-3 rounded-lg ${
                isRainTheme ? 'bg-white/5' : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-3">
                  <img 
                    src={image.src} 
                    alt={image.alt}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div>
                    <p className={`font-medium ${
                      isRainTheme ? 'text-white' : 'text-gray-900'
                    }`}>{image.name}</p>
                    <p className={`text-sm ${
                      isRainTheme ? 'text-slate-400' : 'text-gray-500'
                    }`}>
                      {new Date(image.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDeleteImage(image.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    isRainTheme 
                      ? 'hover:bg-red-500/20 text-red-400' 
                      : 'hover:bg-red-100 text-red-600'
                  }`}
                  title="Delete image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
