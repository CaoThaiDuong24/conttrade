"use client";

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Download,
  Maximize2,
  Play
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaItem {
  id?: string;
  url: string;
  type: 'image' | 'video';
  alt?: string;
}

interface ImageGalleryProps {
  media: MediaItem[];
  featured?: boolean;
  dealType?: 'sale' | 'rental';
  className?: string;
  productInfo?: {
    condition?: string;
    size?: string;
    location?: string;
  };
}

export function ImageGallery({ 
  media, 
  featured, 
  dealType, 
  className,
  productInfo
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Filter valid media items
  const validMedia = media.filter(item => {
    const isValid = item.url && 
      item.url !== '/placeholder.jpg' && 
      !item.url.startsWith('blob:');
    
    console.log('🔍 FILTER DEBUG:', {
      url: item.url,
      isValid: isValid,
      hasUrl: !!item.url,
      notPlaceholder: item.url !== '/placeholder.jpg',
      notBlob: !item.url?.startsWith('blob:'),
      isLocalhost: item.url?.includes('localhost')
    });
    
    return isValid;
  });

  const currentMedia = validMedia[currentIndex];

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
  }, []);

  const navigateLightbox = useCallback((direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setLightboxIndex(prev => prev === 0 ? validMedia.length - 1 : prev - 1);
    } else {
      setLightboxIndex(prev => prev === validMedia.length - 1 ? 0 : prev + 1);
    }
  }, [validMedia.length]);

  const navigateGallery = useCallback((direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentIndex(prev => prev === 0 ? validMedia.length - 1 : prev - 1);
    } else {
      setCurrentIndex(prev => prev === validMedia.length - 1 ? 0 : prev + 1);
    }
  }, [validMedia.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLightboxOpen) {
        if (e.key === 'Escape') {
          closeLightbox();
        } else if (e.key === 'ArrowLeft') {
          navigateLightbox('prev');
        } else if (e.key === 'ArrowRight') {
          navigateLightbox('next');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, navigateLightbox, closeLightbox]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isLightboxOpen]);

  // If no valid media, show placeholder
  if (validMedia.length === 0) {
    return (
      <div className="relative">
        <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden rounded-lg">
          <div className="text-center text-gray-500">
            <div className="w-16 h-16 mx-auto mb-3 bg-gray-300/50 rounded-xl flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2"/>
                <polyline points="21,15 16,10 5,21" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <p className="text-sm font-medium mb-1">Chưa có hình ảnh</p>
            <p className="text-xs text-gray-400">Hình ảnh sẽ được hiển thị tại đây</p>
          </div>
        </div>
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {featured && (
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md border-0 px-2 py-1 text-xs font-semibold">
              ⭐ Nổi bật
            </Badge>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <Badge 
            variant={dealType === 'sale' ? 'default' : 'secondary'}
            className={cn(
              "shadow-md border-0 px-2 py-1 text-xs font-semibold",
              dealType === 'sale' 
                ? "bg-gradient-to-r from-green-600 to-green-700 text-white" 
                : "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
            )}
          >
            {dealType === 'sale' ? '💰 Bán' : '📅 Cho thuê'}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Gallery */}
      <div className="relative">
        {/* Main Media Display */}
        <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 relative group cursor-pointer overflow-hidden rounded-lg" onClick={() => openLightbox(currentIndex)}>
          {currentMedia?.type === 'image' ? (
            <img
              src={currentMedia.url}
              alt={currentMedia.alt || `Container image ${currentIndex + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onLoad={() => {
                console.log('✅ IMAGE LOADED:', currentMedia.url);
              }}
              onError={(e) => {
                console.log('❌ IMAGE ERROR:', currentMedia.url);
                // Handle broken images
                (e.target as HTMLImageElement).src = '/placeholder.jpg';
              }}
            />
          ) : currentMedia?.type === 'video' ? (
            <video
              src={currentMedia.url}
              className="w-full h-full object-cover"
              controls
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          ) : null}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-md px-3 py-1.5 flex items-center space-x-2">
              <Maximize2 className="w-3.5 h-3.5 text-gray-700" />
              <span className="text-xs font-medium text-gray-700">Xem lớn</span>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {validMedia.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white shadow-md border-0 w-8 h-8 rounded-full opacity-70 hover:opacity-100 transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                navigateGallery('prev');
              }}
            >
              <ChevronLeft className="w-4 h-4 text-gray-700" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white shadow-md border-0 w-8 h-8 rounded-full opacity-70 hover:opacity-100 transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                navigateGallery('next');
              }}
            >
              <ChevronRight className="w-4 h-4 text-gray-700" />
            </Button>
          </>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {featured && (
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md border-0 px-2 py-1 text-xs font-semibold">
              ⭐ Nổi bật
            </Badge>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <Badge 
            variant={dealType === 'sale' ? 'default' : 'secondary'}
            className={cn(
              "shadow-md border-0 px-2 py-1 text-xs font-semibold",
              dealType === 'sale' 
                ? "bg-gradient-to-r from-green-600 to-green-700 text-white" 
                : "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
            )}
          >
            {dealType === 'sale' ? '💰 Bán' : '📅 Cho thuê'}
          </Badge>
        </div>

        {/* Counter */}
        {validMedia.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium shadow-md">
            {currentIndex + 1} / {validMedia.length}
          </div>
        )}

        {/* Photo indicator for multiple images */}
        {validMedia.length > 1 && (
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium shadow-md flex items-center space-x-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <span>+{validMedia.length - 1}</span>
          </div>
        )}
      </div>

      {/* Thumbnail Strip - Compact */}
      {validMedia.length > 1 && (
        <div className="mt-3">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {validMedia.map((item, index) => (
              <button
                key={index}
                className={cn(
                  "flex-shrink-0 w-16 h-12 rounded-md overflow-hidden border transition-all duration-200 hover:shadow-sm",
                  index === currentIndex 
                    ? "border-blue-500 ring-1 ring-blue-500/40 shadow-sm transform scale-105" 
                    : "border-gray-200 hover:border-gray-300"
                )}
                onClick={() => setCurrentIndex(index)}
              >
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.jpg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center relative">
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      preload="metadata"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Play className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}
                {/* Active indicator */}
                {index === currentIndex && (
                  <div className="absolute inset-0 bg-blue-500/10 border border-blue-500"></div>
                )}
              </button>
            ))}
          </div>
          {/* Quick info for product assessment */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Nhấn vào hình ảnh để xem chi tiết</span>
              <span className="font-medium">{validMedia.length} ảnh</span>
            </div>
            {/* Product quick info */}
            {productInfo && (
              <div className="mt-1.5 flex flex-wrap gap-2 text-xs">
                {productInfo.condition && (
                  <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                    {productInfo.condition}
                  </span>
                )}
                {productInfo.size && (
                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    {productInfo.size}
                  </span>
                )}
                {productInfo.location && (
                  <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                    📍 {productInfo.location}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-6 right-6 text-white hover:bg-white/20 z-10 w-12 h-12 rounded-full"
            onClick={closeLightbox}
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Navigation */}
          {validMedia.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 w-12 h-12 rounded-full"
                onClick={() => navigateLightbox('prev')}
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 w-12 h-12 rounded-full"
                onClick={() => navigateLightbox('next')}
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            </>
          )}

          {/* Media Content */}
          <div className="max-w-[95vw] max-h-[90vh] flex items-center justify-center">
            {validMedia[lightboxIndex]?.type === 'image' ? (
              <img
                src={validMedia[lightboxIndex].url}
                alt={`Lightbox image ${lightboxIndex + 1}`}
                className="max-w-full max-h-full object-contain shadow-2xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.jpg';
                }}
              />
            ) : (
              <video
                src={validMedia[lightboxIndex].url}
                className="max-w-full max-h-full shadow-2xl"
                controls
                autoPlay
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>

          {/* Bottom Info Bar */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white px-6 py-3 rounded-full flex items-center space-x-4">
            {/* Counter */}
            <span className="text-sm font-medium">
              {lightboxIndex + 1} / {validMedia.length}
            </span>
            
            {/* Divider */}
            <div className="w-px h-4 bg-white/30"></div>
            
            {/* Download Button (for images) */}
            {validMedia[lightboxIndex]?.type === 'image' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 h-8 px-3"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = validMedia[lightboxIndex].url;
                  link.download = `container-image-${lightboxIndex + 1}.jpg`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Tải xuống
              </Button>
            )}
          </div>

          {/* Keyboard hint */}
          <div className="absolute top-6 left-6 text-white/60 text-sm">
            <p>ESC để đóng • ← → để điều hướng</p>
          </div>
        </div>
      )}
    </>
  );
}