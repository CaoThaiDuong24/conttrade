/**
 * Test script để kiểm tra Driver.js buttons trong console
 * Cách sử dụng: Copy toàn bộ file này và paste vào browser console
 */

// Function để kiểm tra tất cả buttons
function debugDriverButtons() {
  console.log('=== DRIVER.JS BUTTON DEBUG ===');
  console.log('');
  
  // Get all buttons
  const closeBtn = document.querySelector('.driver-popover-close-btn');
  const doneBtn = document.querySelector('.driver-popover-done-btn');
  const nextBtn = document.querySelector('.driver-popover-next-btn');
  const prevBtn = document.querySelector('.driver-popover-prev-btn');
  
  // Check existence
  console.log('📊 BUTTON EXISTENCE:');
  console.log('Close button:', closeBtn ? '✅ Found' : '❌ Not found');
  console.log('Done button:', doneBtn ? '✅ Found' : '❌ Not found');
  console.log('Next button:', nextBtn ? '✅ Found' : '❌ Not found');
  console.log('Prev button:', prevBtn ? '✅ Found' : '❌ Not found');
  console.log('');
  
  // Check close button
  if (closeBtn) {
    console.log('🔍 CLOSE BUTTON DETAILS:');
    const styles = window.getComputedStyle(closeBtn);
    console.log('  Display:', styles.display);
    console.log('  Visibility:', styles.visibility);
    console.log('  Opacity:', styles.opacity);
    console.log('  Pointer events:', styles.pointerEvents);
    console.log('  Z-index:', styles.zIndex);
    console.log('  Cursor:', styles.cursor);
    console.log('  Position:', styles.position);
    console.log('  Width:', styles.width);
    console.log('  Height:', styles.height);
    console.log('  Top:', styles.top);
    console.log('  Right:', styles.right);
    
    // Check all event listeners
    const listeners = getEventListeners(closeBtn);
    console.log('  Event listeners:', listeners);
    console.log('  Has _handlerAttached flag:', !!(closeBtn as any)._handlerAttached);
    console.log('');
  }
  
  // Check done button
  if (doneBtn) {
    console.log('🔍 DONE BUTTON DETAILS:');
    const styles = window.getComputedStyle(doneBtn);
    console.log('  Display:', styles.display);
    console.log('  Visibility:', styles.visibility);
    console.log('  Opacity:', styles.opacity);
    console.log('  Pointer events:', styles.pointerEvents);
    console.log('  Z-index:', styles.zIndex);
    console.log('  Cursor:', styles.cursor);
    console.log('  Has _handlerAttached flag:', !!(doneBtn as any)._handlerAttached);
    console.log('');
  }
  
  // Test manual click
  console.log('🧪 MANUAL CLICK TEST:');
  if (closeBtn) {
    console.log('Try clicking close button manually...');
    closeBtn.addEventListener('click', () => {
      console.log('✅ CLOSE BUTTON CLICKED (test listener)');
    }, { once: true });
  }
  
  if (doneBtn) {
    console.log('Try clicking done button manually...');
    doneBtn.addEventListener('click', () => {
      console.log('✅ DONE BUTTON CLICKED (test listener)');
    }, { once: true });
  }
  
  console.log('');
  console.log('=== END DEBUG ===');
}

// Function để test click programmatically
function testClickCloseButton() {
  const closeBtn = document.querySelector('.driver-popover-close-btn');
  if (closeBtn) {
    console.log('🖱️ Simulating click on close button...');
    closeBtn.click();
  } else {
    console.error('❌ Close button not found');
  }
}

function testClickDoneButton() {
  const doneBtn = document.querySelector('.driver-popover-done-btn');
  if (doneBtn) {
    console.log('🖱️ Simulating click on done button...');
    doneBtn.click();
  } else {
    console.error('❌ Done button not found');
  }
}

// Function để attach test handlers
function attachTestHandlers() {
  console.log('🔧 Attaching test handlers to all buttons...');
  
  const closeBtn = document.querySelector('.driver-popover-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      console.log('✅ CLOSE clicked (test - capture)', e);
    }, { capture: true });
    
    closeBtn.addEventListener('click', (e) => {
      console.log('✅ CLOSE clicked (test - normal)', e);
    });
    
    console.log('✓ Close button handlers attached');
  }
  
  const doneBtn = document.querySelector('.driver-popover-done-btn');
  if (doneBtn) {
    doneBtn.addEventListener('click', (e) => {
      console.log('✅ DONE clicked (test - capture)', e);
    }, { capture: true });
    
    doneBtn.addEventListener('click', (e) => {
      console.log('✅ DONE clicked (test - normal)', e);
    });
    
    console.log('✓ Done button handlers attached');
  }
  
  const nextBtn = document.querySelector('.driver-popover-next-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      console.log('➡️ NEXT clicked (test)', e);
    }, { capture: true });
    
    console.log('✓ Next button handler attached');
  }
  
  const prevBtn = document.querySelector('.driver-popover-prev-btn');
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      console.log('⬅️ PREV clicked (test)', e);
    }, { capture: true });
    
    console.log('✓ Prev button handler attached');
  }
}

// Function để watch DOM changes
function watchButtonChanges() {
  console.log('👀 Watching for button changes...');
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        const closeBtn = document.querySelector('.driver-popover-close-btn');
        const doneBtn = document.querySelector('.driver-popover-done-btn');
        
        if (closeBtn || doneBtn) {
          console.log('🔄 Buttons detected in DOM:', {
            close: !!closeBtn,
            done: !!doneBtn
          });
        }
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('✓ Observer started');
  
  return observer;
}

// Export functions to window
window.debugDriverButtons = debugDriverButtons;
window.testClickCloseButton = testClickCloseButton;
window.testClickDoneButton = testClickDoneButton;
window.attachTestHandlers = attachTestHandlers;
window.watchButtonChanges = watchButtonChanges;

console.log('✅ Test functions loaded!');
console.log('');
console.log('Available commands:');
console.log('  debugDriverButtons()     - Chi tiết về tất cả buttons');
console.log('  testClickCloseButton()   - Test click close button');
console.log('  testClickDoneButton()    - Test click done button');
console.log('  attachTestHandlers()     - Attach test handlers to buttons');
console.log('  watchButtonChanges()     - Watch for DOM changes');
console.log('');
console.log('💡 Tip: Chạy debugDriverButtons() sau khi start tour');
