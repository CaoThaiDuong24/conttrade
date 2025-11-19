'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Use NEXT_PUBLIC_API_URL for image paths
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface ImageGalleryImage {
  id: string;
  media_url: string;
  media_type: string;
  alt?: string;
}

export interface ImageGalleryProps {
  images: ImageGalleryImage[];
  variant?: 'grid' | 'carousel' | 'masonry';
  aspectRatio?: 'square' | 'video' | 'auto';
  showThumbnails?: boolean;
  enableLightbox?: boolean;
  className?: string;
}

export function ImageGallery({
  images,
  variant = 'carousel',
  aspectRatio = 'video',
  showThumbnails = true,
  enableLightbox = true,
  className = '',
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);

  // Navigate images
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'Escape') setLightboxOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, goToPrevious, goToNext]);

  // Get image URL
  const getImageUrl = (image: ImageGalleryImage) => {
    if (image.media_url.startsWith('http')) {
      return image.media_url;
    }
    return `${API_URL}${image.media_url}`;
  };

  // Handle zoom
  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const resetZoom = () => setZoom(1);

  // Open lightbox
  const openLightbox = (index: number) => {
    if (enableLightbox) {
      setCurrentIndex(index);
      setLightboxOpen(true);
      resetZoom();
    }
  };

  if (!images || images.length === 0) {
    return (
      <Card className={cn('flex items-center justify-center bg-gray-100', className)}>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Không có hình ảnh</p>
        </div>
      </Card>
    );
  }

  // Grid variant
  if (variant === 'grid') {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => openLightbox(index)}
            >
              <Image
                src={getImageUrl(image)}
                alt={image.alt || `Image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {enableLightbox && (
          <ImageLightbox
            images={images}
            currentIndex={currentIndex}
            open={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
            onPrevious={goToPrevious}
            onNext={goToNext}
            getImageUrl={getImageUrl}
            zoom={zoom}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onResetZoom={resetZoom}
          />
        )}
      </div>
    );
  }

  // Masonry variant
  if (variant === 'masonry') {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative mb-4 break-inside-avoid rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => openLightbox(index)}
            >
              <Image
                src={getImageUrl(image)}
                alt={image.alt || `Image ${index + 1}`}
                width={400}
                height={300}
                className="w-full h-auto"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {enableLightbox && (
          <ImageLightbox
            images={images}
            currentIndex={currentIndex}
            open={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
            onPrevious={goToPrevious}
            onNext={goToNext}
            getImageUrl={getImageUrl}
            zoom={zoom}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onResetZoom={resetZoom}
          />
        )}
      </div>
    );
  }

  // Carousel variant (default)
  const aspectRatioClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: 'aspect-auto',
  }[aspectRatio];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Image */}
      <div
        className={cn(
          'relative rounded-lg overflow-hidden bg-gray-100 cursor-pointer',
          aspectRatioClass
        )}
        onClick={() => openLightbox(currentIndex)}
      >
        <Image
          src={getImageUrl(images[currentIndex])}
          alt={images[currentIndex].alt || `Image ${currentIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
          priority
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {images.map((image, index) => (
            <div
              key={image.id}
              className={cn(
                'relative aspect-square rounded-md overflow-hidden bg-gray-100 cursor-pointer transition-all',
                index === currentIndex
                  ? 'ring-2 ring-primary ring-offset-2'
                  : 'hover:opacity-80'
              )}
              onClick={() => setCurrentIndex(index)}
            >
              <Image
                src={getImageUrl(image)}
                alt={image.alt || `Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 25vw, 12.5vw"
              />
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {enableLightbox && (
        <ImageLightbox
          images={images}
          currentIndex={currentIndex}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onPrevious={goToPrevious}
          onNext={goToNext}
          getImageUrl={getImageUrl}
          zoom={zoom}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onResetZoom={resetZoom}
        />
      )}
    </div>
  );
}

// Lightbox Component
interface ImageLightboxProps {
  images: ImageGalleryImage[];
  currentIndex: number;
  open: boolean;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  getImageUrl: (image: ImageGalleryImage) => string;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

function ImageLightbox({
  images,
  currentIndex,
  open,
  onClose,
  onPrevious,
  onNext,
  getImageUrl,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: ImageLightboxProps) {
  const currentImage = images[currentIndex];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-0">
        <div className="relative w-full h-[95vh] flex items-center justify-center">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Zoom Controls */}
          <div className="absolute top-4 left-4 z-50 flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="bg-white/20 hover:bg-white/30 text-white"
              onClick={onZoomOut}
              disabled={zoom <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="bg-white/20 hover:bg-white/30 text-white"
              onClick={onResetZoom}
            >
              <span className="text-xs">{Math.round(zoom * 100)}%</span>
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="bg-white/20 hover:bg-white/30 text-white"
              onClick={onZoomIn}
              disabled={zoom >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          {/* Main Image */}
          <div className="relative w-full h-full flex items-center justify-center overflow-auto">
            <div
              style={{
                transform: `scale(${zoom})`,
                transition: 'transform 0.2s ease-out',
              }}
            >
              <Image
                src={getImageUrl(currentImage)}
                alt={currentImage.alt || `Image ${currentIndex + 1}`}
                width={1200}
                height={800}
                className="max-w-full max-h-[90vh] w-auto h-auto object-contain"
                priority
              />
            </div>
          </div>

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white"
                onClick={onPrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white"
                onClick={onNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/20 text-white px-4 py-2 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ImageGallery;
