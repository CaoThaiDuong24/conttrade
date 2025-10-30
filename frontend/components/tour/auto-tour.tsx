/**
 * AutoTour Component
 * Tự động bắt đầu tour cho lần đầu user truy cập page
 */

'use client';

import { useEffect } from 'react';
import { autoStartTour } from '@/lib/tour/driver-config';

interface AutoTourProps {
  tourName: string;
  delay?: number;
  enabled?: boolean;
}

export function AutoTour({ tourName, delay = 1500, enabled = true }: AutoTourProps) {
  useEffect(() => {
    if (enabled) {
      autoStartTour(tourName, delay);
    }
  }, [tourName, delay, enabled]);

  return null; // Component không render gì
}
