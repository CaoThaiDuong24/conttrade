/**
 * CALENDAR PICKER TROUBLESHOOTING SCRIPT
 * Paste this in browser console when calendar doesn't work
 */

console.log('🔍 CALENDAR PICKER DIAGNOSTIC TOOL');
console.log('='.repeat(60));

// Function to run diagnostics
function diagnoseCalendar() {
  console.log('\n1️⃣ Checking Modal Overlay...');
  const modalOverlay = document.querySelector('.fixed.inset-0.z-\\[100\\]');
  if (modalOverlay) {
    console.log('✓ Modal found');
    const overlayStyle = getComputedStyle(modalOverlay);
    console.log('  - z-index:', overlayStyle.zIndex);
    console.log('  - pointer-events:', overlayStyle.pointerEvents);
    console.log('  - position:', overlayStyle.position);
    
    if (overlayStyle.pointerEvents === 'auto') {
      console.warn('⚠️  WARNING: Modal overlay has pointer-events: auto');
      console.warn('   This might block clicks on popover!');
    }
  } else {
    console.log('❌ Modal not found');
  }

  console.log('\n2️⃣ Checking Popover Content...');
  const popover = document.querySelector('[data-slot="popover-content"]');
  if (popover) {
    console.log('✓ Popover found');
    const popoverStyle = getComputedStyle(popover);
    console.log('  - z-index:', popoverStyle.zIndex);
    console.log('  - position:', popoverStyle.position);
    console.log('  - display:', popoverStyle.display);
    console.log('  - visibility:', popoverStyle.visibility);
    console.log('  - opacity:', popoverStyle.opacity);
    console.log('  - pointer-events:', popoverStyle.pointerEvents);
    
    const rect = popover.getBoundingClientRect();
    console.log('  - Bounding box:', {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      visible: rect.width > 0 && rect.height > 0
    });

    if (popoverStyle.pointerEvents === 'none') {
      console.error('❌ ERROR: Popover has pointer-events: none!');
      console.log('💡 FIX: Run fixPointerEvents()');
    }

    if (parseInt(popoverStyle.zIndex) <= 100) {
      console.error('❌ ERROR: Popover z-index too low!');
      console.log('💡 FIX: Run fixZIndex()');
    }
  } else {
    console.log('❌ Popover not found (calendar not open?)');
    console.log('💡 Try clicking "Chọn ngày" button first');
  }

  console.log('\n3️⃣ Checking Calendar Component...');
  const calendar = document.querySelector('.rdp'); // react-day-picker class
  if (calendar) {
    console.log('✓ Calendar found');
    const calendarStyle = getComputedStyle(calendar);
    console.log('  - pointer-events:', calendarStyle.pointerEvents);
    console.log('  - position:', calendarStyle.position);
    
    if (calendarStyle.pointerEvents === 'none') {
      console.error('❌ ERROR: Calendar has pointer-events: none!');
    }
  } else {
    console.log('❌ Calendar not found');
  }

  console.log('\n4️⃣ Checking for Overlapping Elements...');
  if (popover) {
    const rect = popover.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const elementAtCenter = document.elementFromPoint(centerX, centerY);
    
    console.log('Element at popover center:', elementAtCenter);
    if (elementAtCenter && !popover.contains(elementAtCenter)) {
      console.error('❌ ERROR: Another element is covering the popover!');
      console.log('  Covering element:', elementAtCenter);
      const coveringStyle = getComputedStyle(elementAtCenter);
      console.log('  - z-index:', coveringStyle.zIndex);
      console.log('  - pointer-events:', coveringStyle.pointerEvents);
    } else {
      console.log('✓ No overlapping elements detected');
    }
  }

  console.log('\n5️⃣ Checking Portal Rendering...');
  const portal = document.querySelector('[data-radix-popper-content-wrapper]');
  if (portal) {
    console.log('✓ Radix Portal found');
    console.log('  Parent:', portal.parentElement?.tagName);
    console.log('  Should be: BODY');
    
    if (portal.parentElement?.tagName !== 'BODY') {
      console.warn('⚠️  WARNING: Portal not rendering to body');
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('='.repeat(60));
}

// Auto-fix functions
function fixZIndex() {
  console.log('\n🔧 Fixing z-index...');
  const popover = document.querySelector('[data-slot="popover-content"]');
  if (popover) {
    popover.style.zIndex = '99999';
    console.log('✓ Z-index set to 99999');
    console.log('💡 Try clicking calendar again');
  } else {
    console.log('❌ Popover not found');
  }
}

function fixPointerEvents() {
  console.log('\n🔧 Fixing pointer-events...');
  const popover = document.querySelector('[data-slot="popover-content"]');
  if (popover) {
    popover.style.pointerEvents = 'auto';
    console.log('✓ Pointer-events set to auto');
    console.log('💡 Try clicking calendar again');
  } else {
    console.log('❌ Popover not found');
  }
  
  // Also check modal
  const modal = document.querySelector('.fixed.inset-0.z-\\[100\\]');
  if (modal) {
    const currentEvents = getComputedStyle(modal).pointerEvents;
    console.log('Modal pointer-events:', currentEvents);
    if (currentEvents === 'auto') {
      console.log('💡 Consider setting modal pointer-events: none on backdrop');
      console.log('   But keep pointer-events: auto on modal content');
    }
  }
}

function highlightPopover() {
  console.log('\n🎨 Highlighting popover...');
  const popover = document.querySelector('[data-slot="popover-content"]');
  if (popover) {
    popover.style.outline = '5px solid red';
    popover.style.outlineOffset = '2px';
    console.log('✓ Popover highlighted in red');
    setTimeout(() => {
      popover.style.outline = '';
      popover.style.outlineOffset = '';
      console.log('✓ Highlight removed');
    }, 3000);
  } else {
    console.log('❌ Popover not found');
  }
}

function testClickability() {
  console.log('\n🖱️  Testing clickability...');
  const popover = document.querySelector('[data-slot="popover-content"]');
  if (!popover) {
    console.log('❌ Popover not found - open calendar first');
    return;
  }

  const rect = popover.getBoundingClientRect();
  console.log('Popover position:', { top: rect.top, left: rect.left });
  
  const testPoints = [
    { x: rect.left + 10, y: rect.top + 10, label: 'Top-left' },
    { x: rect.left + rect.width/2, y: rect.top + rect.height/2, label: 'Center' },
    { x: rect.left + rect.width - 10, y: rect.top + 10, label: 'Top-right' },
  ];

  console.log('\nTesting click points:');
  testPoints.forEach(point => {
    const element = document.elementFromPoint(point.x, point.y);
    const isInPopover = popover.contains(element);
    console.log(`  ${point.label}:`, isInPopover ? '✓ Clickable' : '❌ Blocked');
    if (!isInPopover) {
      console.log('    Blocking element:', element);
    }
  });
}

// Export functions to window
window.diagnoseCalendar = diagnoseCalendar;
window.fixZIndex = fixZIndex;
window.fixPointerEvents = fixPointerEvents;
window.highlightPopover = highlightPopover;
window.testClickability = testClickability;

console.log('\n📝 AVAILABLE COMMANDS:');
console.log('  diagnoseCalendar()    - Run full diagnostic');
console.log('  fixZIndex()           - Fix z-index issue');
console.log('  fixPointerEvents()    - Fix pointer-events issue');
console.log('  highlightPopover()    - Highlight popover (3s)');
console.log('  testClickability()    - Test if popover is clickable');

console.log('\n🚀 QUICK START:');
console.log('  1. Open "Đánh dấu sẵn sàng pickup" form');
console.log('  2. Click "Chọn ngày" button');
console.log('  3. Run: diagnoseCalendar()');
console.log('  4. Follow suggested fixes');

console.log('\n' + '='.repeat(60));

// Auto-run if popover already exists
setTimeout(() => {
  const popover = document.querySelector('[data-slot="popover-content"]');
  if (popover) {
    console.log('\n🔍 Popover detected! Running auto-diagnostic...\n');
    diagnoseCalendar();
  }
}, 1000);
