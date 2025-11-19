/**
 * Simple Tour Test Component
 * Component đơn giản để test driver.js hoạt động
 */

'use client';

import { useEffect } from 'react';

export function SimpleTourTest() {
  useEffect(() => {
    // Log để biết component đã mount
    console.log('SimpleTourTest mounted');
    
    // Add global function để test từ console
    if (typeof window !== 'undefined') {
      (window as any).testTour = async () => {
        console.log('=== STARTING TOUR TEST ===');
        
        try {
          // Dynamic import driver.js
          const { driver } = await import('driver.js');
          
          console.log('Driver.js loaded successfully');
          
          // Function to attach manual handlers
          const attachHandlers = (driver: any) => {
            setTimeout(() => {
              const closeBtn = document.querySelector('.driver-popover-close-btn');
              const doneBtn = document.querySelector('.driver-popover-done-btn');
              
              if (closeBtn && !(closeBtn as any)._fixed) {
                (closeBtn as any)._fixed = true;
                closeBtn.addEventListener('click', (e) => {
                  console.log('❌ CLOSE CLICKED');
                  e.preventDefault();
                  e.stopPropagation();
                  driver.destroy();
                }, { capture: true });
                console.log('✅ Close handler attached');
              }
              
              if (doneBtn && !(doneBtn as any)._fixed) {
                (doneBtn as any)._fixed = true;
                doneBtn.addEventListener('click', (e) => {
                  console.log('✓ DONE CLICKED');
                  e.preventDefault();
                  e.stopPropagation();
                  driver.destroy();
                }, { capture: true });
                console.log('✅ Done handler attached');
              }
            }, 200);
          };
          
          // Create simple tour
          const driverObj = driver({
            showProgress: true,
            showButtons: ['next', 'previous', 'close'],
            progressText: 'Step {{current}}/{{total}}',
            nextBtnText: 'Next →',
            prevBtnText: '← Back',
            doneBtnText: '✓ Done',
            animate: true,
            allowClose: true,
            smoothScroll: true,
            onHighlighted: (element: any, step: any, opts: any) => {
              console.log('Step:', step.popover?.title);
              attachHandlers(opts.driver);
            },
            onDestroyStarted: () => {
              console.log('✅ onDestroyStarted - Tour is closing!');
            },
            onDestroyed: () => {
              console.log('✅ onDestroyed - Tour closed successfully!');
            },
          });
          
          const steps = [
            {
              popover: {
                title: '🎯 Test Tour',
                description: 'This is a test tour. Try clicking X button or Done button.',
              }
            },
            {
              element: '#email',
              popover: {
                title: '📧 Email Field',
                description: 'This is the email input.',
                side: 'bottom' as const,
              }
            },
            {
              element: '#password',
              popover: {
                title: '🔒 Password Field',
                description: 'This is the password input. This is the LAST step - Done button should appear.',
                side: 'bottom' as const,
              }
            },
          ];
          
          console.log('Setting steps:', steps);
          driverObj.setSteps(steps);
          
          console.log('Starting tour...');
          driverObj.drive();
          
          // Initial attach
          attachHandlers(driverObj);
          
          console.log('Tour started successfully!');
          console.log('Driver object:', driverObj);
          
          return driverObj;
        } catch (error) {
          console.error('❌ Error starting tour:', error);
        }
      };
      
      console.log('✅ Global testTour() function ready!');
      console.log('💡 Run "testTour()" in console to start test tour');
      
      // Add debug function for close button
      (window as any).debugCloseButton = () => {
        const closeBtn = document.querySelector('.driver-popover-close-btn');
        if (!closeBtn) {
          console.error('❌ Close button not found!');
          return;
        }
        
        console.log('✅ Close button found:', closeBtn);
        console.log('📊 Button styles:', window.getComputedStyle(closeBtn));
        console.log('📍 Position:', {
          top: closeBtn.getBoundingClientRect().top,
          right: closeBtn.getBoundingClientRect().right,
          width: closeBtn.getBoundingClientRect().width,
          height: closeBtn.getBoundingClientRect().height,
        });
        console.log('🖱️ Pointer events:', window.getComputedStyle(closeBtn).pointerEvents);
        console.log('👁️ Visibility:', window.getComputedStyle(closeBtn).visibility);
        console.log('🎨 Display:', window.getComputedStyle(closeBtn).display);
        console.log('📏 Z-index:', window.getComputedStyle(closeBtn).zIndex);
        
        // Try to click it programmatically
        console.log('🔨 Attempting to click...');
        (closeBtn as HTMLElement).click();
      };
      
      console.log('🐛 Run "debugCloseButton()" to debug close button');
    }
    
    return () => {
      console.log('SimpleTourTest unmounted');
    };
  }, []);
  
  return null;
}
