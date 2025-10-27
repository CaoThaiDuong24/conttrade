'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

/**
 * MINIMAL TEST COMPONENT
 * Test if Calendar + Popover works in isolation
 */
export function TestCalendarSimple() {
  const [date, setDate] = useState<Date>();

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">🧪 Test Calendar Simple</h1>
      
      <div className="space-y-4">
        <p>Selected: {date ? format(date, 'dd/MM/yyyy') : 'None'}</p>
        
        {/* Test 1: Calendar without modal */}
        <div className="border p-4">
          <h2 className="font-semibold mb-2">Test 1: No Modal (should work)</h2>
          <Popover modal={false}>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'dd/MM/yyyy') : 'Pick date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 !z-[200]">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => {
                  console.log('✅ Date selected:', newDate);
                  setDate(newDate);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Test 2: Calendar inside modal */}
        <ModalTest />
      </div>
    </div>
  );
}

function ModalTest() {
  const [showModal, setShowModal] = useState(false);
  const [date, setDate] = useState<Date>();

  return (
    <div className="border p-4">
      <h2 className="font-semibold mb-2">Test 2: Inside Modal (testing z-index)</h2>
      <Button onClick={() => setShowModal(true)}>Open Modal</Button>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white p-8 rounded-lg max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold mb-4">Modal Content</h3>
            <p className="mb-4">Selected: {date ? format(date, 'dd/MM/yyyy') : 'None'}</p>
            
            <Popover modal={false}>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'dd/MM/yyyy') : 'Pick date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 !z-[200]">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    console.log('✅ Date selected in modal:', newDate);
                    setDate(newDate);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <div className="mt-4">
              <Button onClick={() => setShowModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
