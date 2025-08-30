'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { 
  Upload, 
  Download, 
  X, 
  Camera, 
  Plus,
  Grid3X3,
  Layout,
  Maximize2
} from 'lucide-react'

interface ImageItem {
  id: string
  src: string
  alt: string
  name: string
  category: 'plan' | 'trip' | 'food' | 'accommodation' | 'activity'
  date?: string
}

interface ImageGalleryProps {
  title: string
  planImages?: ImageItem[]
  tripImages?: ImageItem[]
  onUpload?: (files: FileList) => void
}

export default function ImageGallery({ 
  title, 
  planImages = [], 
  tripImages = [], 
  onUpload 
}: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'collage'>('collage')
  const [activeTab, setActiveTab] = useState<'plan' | 'trip'>('plan')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && onUpload) {
      onUpload(files)
    }
  }

  const handleDownload = async (image: ImageItem) => {
    try {
      const response = await fetch(image.src)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = image.name || 'trip-image.jpg'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const currentImages = activeTab === 'plan' ? planImages : tripImages

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Tab Switcher */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('plan')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'plan'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Trip Plans
            </button>
            <button
              onClick={() => setActiveTab('trip')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'trip'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Trip Photos ({tripImages.length})
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('collage')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'collage'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Collage View"
            >
              <Layout className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Grid View"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>

          {/* Upload Button */}
          {activeTab === 'trip' && (
            <button
              onClick={handleUpload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {currentImages.length === 0 ? (
        <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center">
            {activeTab === 'plan' ? (
              <>
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-600">Trip Plans</p>
                <p className="text-sm text-gray-500">Your trip planning images will appear here</p>
              </>
            ) : (
              <>
                <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-600">No photos yet</p>
                <p className="text-sm text-gray-500">Upload your trip photos to get started</p>
                <button
                  onClick={handleUpload}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Upload Photos
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className={
          viewMode === 'collage' 
            ? "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]"
            : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        }>
          {currentImages.map((image, index) => (
            <div
              key={image.id}
              className={`
                relative group rounded-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg
                ${viewMode === 'collage' ? getCollageClass(index, currentImages.length) : 'aspect-square'}
              `}
              onClick={() => setSelectedImage(image)}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedImage(image)
                    }}
                    className="p-2 bg-white rounded-full text-gray-700 hover:text-blue-600 transition-colors"
                    title="View Full Size"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDownload(image)
                    }}
                    className="p-2 bg-white rounded-full text-gray-700 hover:text-green-600 transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Category Badge */}
              <div className="absolute top-2 left-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(image.category)}`}>
                  {image.category}
                </span>
              </div>

              {/* Date Badge */}
              {image.date && (
                <div className="absolute bottom-2 right-2">
                  <span className="px-2 py-1 text-xs bg-black bg-opacity-50 text-white rounded-full">
                    {new Date(image.date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Full Screen Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full text-gray-700 hover:text-red-600 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="relative max-h-[80vh] max-w-full">
              <Image
                src={selectedImage.src}
                alt={selectedImage.alt}
                width={800}
                height={600}
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            </div>
            
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded-lg">
              <h3 className="font-semibold">{selectedImage.alt}</h3>
              {selectedImage.date && (
                <p className="text-sm opacity-75">{new Date(selectedImage.date).toLocaleDateString()}</p>
              )}
              <button
                onClick={() => handleDownload(selectedImage)}
                className="mt-2 flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}

function getCollageClass(index: number, total: number): string {
  // Create an interesting collage layout
  const patterns = [
    'md:col-span-2 md:row-span-2', // Large square
    'md:row-span-2', // Tall
    '', // Normal
    'md:col-span-2', // Wide
    '', // Normal
    'md:row-span-2', // Tall
  ]
  
  return patterns[index % patterns.length] || ''
}

function getCategoryColor(category: string): string {
  const colors = {
    plan: 'bg-blue-100 text-blue-800',
    trip: 'bg-green-100 text-green-800',
    food: 'bg-orange-100 text-orange-800',
    accommodation: 'bg-purple-100 text-purple-800',
    activity: 'bg-pink-100 text-pink-800'
  }
  return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}
