/**
 * TourButton Component
 * Nút để bắt đầu interactive tour
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle, Play } from 'lucide-react';

interface TourButtonProps {
  tourName: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function TourButton({
  tourName,
  variant = 'outline',
  size = 'default',
  showLabel = true,
  label,
  className,
}: TourButtonProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleClick = async () => {
    if (!isMounted) return;
    
    // Dynamic import để đảm bảo chỉ chạy ở client
    const { startTour } = await import('@/lib/tour/driver-config');
    startTour(tourName);
  };

  if (!isMounted) return null;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={className}
    >
      <Play className="mr-2 h-4 w-4" />
      {showLabel && (label || 'Hướng dẫn')}
    </Button>
  );
}

/**
 * TourHelp Component
 * Nút help icon để trigger tour
 */
export function TourHelpButton({
  tourName,
  className,
}: {
  tourName: string;
  className?: string;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleClick = async () => {
    if (!isMounted) return;
    
    const { startTour } = await import('@/lib/tour/driver-config');
    startTour(tourName);
  };

  if (!isMounted) return null;

  return (
    <Button
      variant="default"
      size="icon"
      onClick={handleClick}
      className={`rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg ${className || ''}`}
      title="Xem hướng dẫn"
    >
      <HelpCircle className="h-5 w-5" />
    </Button>
  );
}

/**
 * TourResetButton Component (for dev/testing)
 */
export function TourResetButton({ tourName }: { tourName: string }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (process.env.NODE_ENV !== 'development' || !isMounted) {
    return null;
  }

  const handleReset = async () => {
    const { resetTour } = await import('@/lib/tour/driver-config');
    resetTour(tourName);
    alert(`Tour "${tourName}" has been reset. Refresh page to see it again.`);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleReset}
    >
      Reset Tour
    </Button>
  );
}
