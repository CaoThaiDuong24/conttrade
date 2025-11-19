/**
 * BROWSER CONSOLE TEST SCRIPT
 * Copy và paste script này vào Console (F12) trên trang login
 * để debug positioning của tour
 */

console.log('%c🧪 LOGIN TOUR DEBUG SCRIPT', 'background: #222; color: #bada55; font-size: 20px; padding: 10px;');
console.log('');

// 1. Kiểm tra tất cả elements có tồn tại không
console.log('%c📋 CHECK ELEMENTS:', 'background: #0066cc; color: white; font-size: 14px; padding: 5px;');
console.log('');

const elements = {
  '#email': 'Email input field',
  '#password': 'Password input field',
  '#remember': 'Remember checkbox',
  '#forgot-password-link': 'Forgot password link',
  '#login-submit-button': 'Login button',
  '#quick-login-section': 'Quick login section',
  '.quick-login-admin': 'Admin button',
  '.quick-login-buyer': 'Buyer button',
  '.quick-login-seller': 'Seller button',
  '.quick-login-manager': 'Manager button',
  '#social-login-section': 'Social login section',
  '#signup-link': 'Signup link'
};

let allFound = true;

Object.entries(elements).forEach(([selector, description]) => {
  const element = document.querySelector(selector);
  if (element) {
    console.log(`✅ ${selector} - ${description}`, element);
    
    // Show element position
    const rect = element.getBoundingClientRect();
    console.log(`   Position: x=${Math.round(rect.left)}, y=${Math.round(rect.top)}, width=${Math.round(rect.width)}, height=${Math.round(rect.height)}`);
  } else {
    console.error(`❌ ${selector} - NOT FOUND!`);
    allFound = false;
  }
});

console.log('');

if (allFound) {
  console.log('%c✅ ALL ELEMENTS FOUND!', 'background: green; color: white; font-size: 14px; padding: 5px;');
} else {
  console.log('%c❌ SOME ELEMENTS MISSING!', 'background: red; color: white; font-size: 14px; padding: 5px;');
}

console.log('');

// 2. Kiểm tra Driver.js có load không
console.log('%c🔍 CHECK DRIVER.JS:', 'background: #0066cc; color: white; font-size: 14px; padding: 5px;');
console.log('');

if (typeof window.driver !== 'undefined') {
  console.log('✅ Driver.js loaded');
} else {
  console.error('❌ Driver.js NOT loaded!');
}

console.log('');

// 3. Test manual positioning với Driver.js
console.log('%c🎯 TEST POSITIONING:', 'background: #0066cc; color: white; font-size: 14px; padding: 5px;');
console.log('');

console.log('Để test positioning, chạy function sau trong console:');
console.log('');
console.log('%ctestTourPositioning()', 'background: #333; color: #0f0; font-size: 14px; padding: 5px; font-family: monospace;');
console.log('');

// Function để test positioning
window.testTourPositioning = function() {
  console.clear();
  console.log('%c🎯 TESTING TOUR POSITIONING...', 'background: #222; color: #bada55; font-size: 16px; padding: 10px;');
  console.log('');
  
  // Import driver
  import('driver.js').then(({ driver }) => {
    const testDriver = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      progressText: 'Bước {{current}}/{{total}}',
      nextBtnText: 'Tiếp →',
      prevBtnText: '← Trước',
      doneBtnText: '✓ Xong',
      smoothScroll: false,
      stagePadding: 10,
      popoverOffset: 20,
      
      onHighlightStarted: (element, step) => {
        console.log(`%cHighlighting: ${step.popover?.title}`, 'color: blue; font-weight: bold;');
        
        if (element) {
          const rect = element.getBoundingClientRect();
          console.log(`Element position: x=${Math.round(rect.left)}, y=${Math.round(rect.top)}`);
        }
      },
      
      onNextClick: () => {
        console.log('%c✅ NEXT clicked', 'color: green; font-weight: bold;');
        testDriver.moveNext();
      },
      
      onPrevClick: () => {
        console.log('%c✅ PREV clicked', 'color: green; font-weight: bold;');
        testDriver.movePrevious();
      },
      
      onCloseClick: () => {
        console.log('%c✅ CLOSE clicked', 'color: green; font-weight: bold;');
        testDriver.destroy();
      }
    });
    
    testDriver.setSteps([
      {
        popover: {
          title: '🧪 Test Positioning',
          description: 'Tour này dùng để test positioning. Click Tiếp để xem từng element.'
        }
      },
      {
        element: '#email',
        popover: {
          title: '📧 Email (LEFT)',
          description: 'Popover phải hiển thị bên TRÁI input field',
          side: 'left',
          align: 'center'
        }
      },
      {
        element: '#password',
        popover: {
          title: '🔒 Password (LEFT)',
          description: 'Popover phải hiển thị bên TRÁI input field',
          side: 'left',
          align: 'center'
        }
      },
      {
        element: '#remember',
        popover: {
          title: '💾 Remember (BOTTOM)',
          description: 'Popover phải hiển thị bên DƯỚI checkbox',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#forgot-password-link',
        popover: {
          title: '🔑 Forgot Password (BOTTOM)',
          description: 'Popover phải hiển thị bên DƯỚI link',
          side: 'bottom',
          align: 'end'
        }
      },
      {
        element: '#login-submit-button',
        popover: {
          title: '✅ Login Button (LEFT)',
          description: 'Popover phải hiển thị bên TRÁI button',
          side: 'left',
          align: 'center'
        }
      },
      {
        element: '.quick-login-admin',
        popover: {
          title: '⚡ Admin Button (BOTTOM)',
          description: 'Popover phải hiển thị bên DƯỚI button',
          side: 'bottom',
          align: 'center'
        }
      }
    ]);
    
    testDriver.drive();
    console.log('✅ Test tour started!');
  }).catch(err => {
    console.error('❌ Error loading driver.js:', err);
  });
};

// 4. Helper function để check viewport
window.checkViewport = function() {
  console.log('%c📐 VIEWPORT INFO:', 'background: #0066cc; color: white; font-size: 14px; padding: 5px;');
  console.log('');
  console.log(`Window size: ${window.innerWidth}x${window.innerHeight}`);
  console.log(`Document size: ${document.documentElement.scrollWidth}x${document.documentElement.scrollHeight}`);
  console.log(`Scroll position: x=${window.scrollX}, y=${window.scrollY}`);
};

// 5. Helper để highlight element
window.highlightElement = function(selector) {
  const element = document.querySelector(selector);
  if (element) {
    element.style.border = '3px solid red';
    element.style.backgroundColor = 'yellow';
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    console.log(`✅ Highlighted: ${selector}`);
    
    setTimeout(() => {
      element.style.border = '';
      element.style.backgroundColor = '';
    }, 3000);
  } else {
    console.error(`❌ Element not found: ${selector}`);
  }
};

console.log('');
console.log('%c📝 AVAILABLE COMMANDS:', 'background: #0066cc; color: white; font-size: 14px; padding: 5px;');
console.log('');
console.log('testTourPositioning()   - Test tour với positioning mới');
console.log('checkViewport()         - Xem thông tin viewport');
console.log('highlightElement(sel)   - Highlight element (vd: highlightElement("#email"))');
console.log('');
console.log('%c🚀 Ready to test!', 'background: green; color: white; font-size: 14px; padding: 5px;');
