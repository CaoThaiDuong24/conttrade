/**
 * Driver.js Configuration for Interactive Tours
 * Cấu hình tour hướng dẫn tương tác cho toàn dự án
 */

import { driver, DriveStep, Config, Driver } from 'driver.js';
import 'driver.js/dist/driver.css';

// Custom styling cho tour
export const tourConfig: Config = {
  showProgress: true,
  showButtons: ['next', 'previous'],
  allowClose: false, // Disable default close button
  progressText: 'Bước {{current}}/{{total}}',
  nextBtnText: 'Tiếp theo →',
  prevBtnText: '← Quay lại',
  doneBtnText: '✓ Hoàn thành',
  animate: true,
  smoothScroll: true,
  allowKeyboardControl: true,
  disableActiveInteraction: false,
  popoverClass: 'driverjs-theme',
  onPopoverRender: (popover, { config, state }) => {
    setTimeout(() => {
      const wrapper = popover.wrapper;
      const footer = wrapper.querySelector('.driver-popover-footer');
      
      if (!footer) return;
      
      // Get driver instance
      const driver = (window as any).__currentDriver;
      if (!driver) return;
      
      // Add custom close button
      const customCloseBtn = document.createElement('button');
      customCloseBtn.className = 'custom-close-btn';
      customCloseBtn.innerHTML = '×';
      customCloseBtn.style.cssText = `
        position: absolute;
        top: 8px;
        right: 8px;
        width: 32px;
        height: 32px;
        border: none;
        background: transparent;
        color: #999;
        font-size: 24px;
        line-height: 1;
        cursor: pointer;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.2s;
      `;
      
      customCloseBtn.onmouseover = () => {
        customCloseBtn.style.background = 'rgba(0,0,0,0.1)';
        customCloseBtn.style.color = '#333';
      };
      
      customCloseBtn.onmouseout = () => {
        customCloseBtn.style.background = 'transparent';
        customCloseBtn.style.color = '#999';
      };
      
      customCloseBtn.onclick = () => {
        console.log('Custom close clicked');
        driver.destroy();
      };
      
      wrapper.style.position = 'relative';
      wrapper.appendChild(customCloseBtn);
      
      console.log('✅ Custom close button added');
      
      // Fix Next/Prev/Done buttons
      const nextBtn = footer.querySelector('.driver-popover-next-btn') as HTMLElement;
      const prevBtn = footer.querySelector('.driver-popover-prev-btn') as HTMLElement;
      const doneBtn = footer.querySelector('.driver-popover-done-btn') as HTMLElement;
      
      if (nextBtn) {
        const newNext = nextBtn.cloneNode(true) as HTMLElement;
        nextBtn.replaceWith(newNext);
        newNext.onclick = () => {
          console.log('Next clicked');
          driver.moveNext();
        };
      }
      
      if (prevBtn) {
        const newPrev = prevBtn.cloneNode(true) as HTMLElement;
        prevBtn.replaceWith(newPrev);
        newPrev.onclick = () => {
          console.log('Prev clicked');
          driver.movePrevious();
        };
      }
      
      if (doneBtn) {
        const newDone = doneBtn.cloneNode(true) as HTMLElement;
        doneBtn.replaceWith(newDone);
        newDone.onclick = () => {
          console.log('Done clicked');
          driver.destroy();
        };
      }
      
    }, 50);
  },
};

/**
 * Tạo driver instance với config
 */
export function createTour(config?: Partial<Config>): Driver {
  return driver({
    ...tourConfig,
    ...config,
  });
}

/**
 * Tour Steps cho từng trang
 */

// 1. Dashboard Tour
export const dashboardTourSteps: DriveStep[] = [
  {
    element: '#sidebar-navigation',
    popover: {
      title: '🧭 Menu Điều Hướng',
      description: 'Đây là menu chính. Menu sẽ thay đổi tùy theo vai trò của bạn (Admin, Seller, Buyer, v.v.)',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#user-profile-button',
    popover: {
      title: '👤 Thông Tin Tài Khoản',
      description: 'Click vào đây để xem thông tin cá nhân, cài đặt, hoặc đăng xuất.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '#notifications-button',
    popover: {
      title: '🔔 Thông Báo',
      description: 'Theo dõi các thông báo quan trọng về đơn hàng, tin nhắn, và cập nhật hệ thống.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '#language-toggle',
    popover: {
      title: '🌍 Đổi Ngôn Ngữ',
      description: 'Chuyển đổi giữa Tiếng Việt và English.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '#dashboard-stats',
    popover: {
      title: '📊 Thống Kê Tổng Quan',
      description: 'Xem các số liệu quan trọng: tổng đơn hàng, doanh thu, container đang quản lý.',
      side: 'top',
      align: 'start',
    },
  },
  {
    element: '#recent-activities',
    popover: {
      title: '📋 Hoạt Động Gần Đây',
      description: 'Danh sách các hoạt động mới nhất của bạn trên hệ thống.',
      side: 'top',
      align: 'start',
    },
  },
];

// 2. Listings Page Tour
export const listingsTourSteps: DriveStep[] = [
  {
    popover: {
      title: '🎉 Chào Mừng Đến Trang Listings',
      description: 'Đây là nơi bạn có thể tìm kiếm, xem và quản lý các container listings. Hãy để tôi hướng dẫn bạn!',
    },
  },
  {
    element: '#search-input',
    popover: {
      title: '🔍 Tìm Kiếm',
      description: 'Nhập từ khóa để tìm kiếm container theo tên, vị trí, hoặc mô tả.',
      side: 'bottom',
    },
  },
  {
    element: '#filter-buttons',
    popover: {
      title: '🎛️ Bộ Lọc',
      description: 'Lọc container theo loại (buy/sell/rent), kích thước (20ft/40ft), tình trạng (mới/cũ), giá cả, v.v.',
      side: 'bottom',
    },
  },
  {
    element: '#create-listing-button',
    popover: {
      title: '➕ Tạo Listing Mới',
      description: 'Click vào đây để đăng bán hoặc cho thuê container của bạn. (Chỉ dành cho Seller)',
      side: 'left',
    },
  },
  {
    element: '.listing-card:first-child',
    popover: {
      title: '📦 Container Card',
      description: 'Mỗi card hiển thị thông tin container: hình ảnh, giá, kích thước, tình trạng, và vị trí.',
      side: 'top',
    },
  },
  {
    element: '.listing-favorite-button:first',
    popover: {
      title: '⭐ Yêu Thích',
      description: 'Click vào biểu tượng tim để lưu container vào danh sách yêu thích.',
      side: 'top',
    },
  },
  {
    element: '.listing-view-button:first',
    popover: {
      title: '👁️ Xem Chi Tiết',
      description: 'Click để xem thông tin đầy đủ về container, hình ảnh chi tiết, và thông tin người bán.',
      side: 'top',
    },
  },
];

// 3. Create Listing Tour
export const createListingTourSteps: DriveStep[] = [
  {
    popover: {
      title: '📝 Tạo Listing Mới',
      description: 'Hãy điền thông tin về container bạn muốn đăng bán hoặc cho thuê. Tôi sẽ hướng dẫn bạn từng bước!',
    },
  },
  {
    element: '#listing-title-input',
    popover: {
      title: '📌 Tiêu Đề',
      description: 'Nhập tiêu đề hấp dẫn cho listing. VD: "Container 40ft New - High Cube"',
      side: 'bottom',
    },
  },
  {
    element: '#deal-type-select',
    popover: {
      title: '🏷️ Loại Giao Dịch',
      description: 'Chọn Bán (Sale), Cho thuê (Rent), hoặc Cả hai.',
      side: 'bottom',
    },
  },
  {
    element: '#container-size-select',
    popover: {
      title: '📏 Kích Thước',
      description: 'Chọn kích thước container: 20ft, 40ft, hoặc 45ft.',
      side: 'bottom',
    },
  },
  {
    element: '#container-condition-select',
    popover: {
      title: '⚙️ Tình Trạng',
      description: 'Chọn tình trạng: Mới (New), Đã qua sử dụng (Used), hoặc Tân trang (Refurbished).',
      side: 'bottom',
    },
  },
  {
    element: '#price-input',
    popover: {
      title: '💰 Giá',
      description: 'Nhập giá bán hoặc giá thuê (theo ngày/tháng). Giá hợp lý sẽ thu hút nhiều người mua hơn!',
      side: 'bottom',
    },
  },
  {
    element: '#location-input',
    popover: {
      title: '📍 Vị Trí',
      description: 'Nhập vị trí container đang được lưu trữ. VD: "Cảng Sài Gòn, TPHCM"',
      side: 'bottom',
    },
  },
  {
    element: '#description-textarea',
    popover: {
      title: '📄 Mô Tả',
      description: 'Viết mô tả chi tiết về container: đặc điểm, ưu điểm, lịch sử sử dụng, v.v.',
      side: 'top',
    },
  },
  {
    element: '#image-upload',
    popover: {
      title: '📸 Hình Ảnh',
      description: 'Upload hình ảnh rõ nét của container. Nhiều ảnh sẽ giúp listing của bạn nổi bật hơn!',
      side: 'top',
    },
  },
  {
    element: '#submit-button',
    popover: {
      title: '✅ Đăng Listing',
      description: 'Kiểm tra lại thông tin và click để đăng listing. Listing sẽ được admin duyệt trước khi công khai.',
      side: 'top',
    },
  },
];

// 4. Orders Page Tour
export const ordersTourSteps: DriveStep[] = [
  {
    popover: {
      title: '📦 Quản Lý Đơn Hàng',
      description: 'Theo dõi tất cả đơn hàng của bạn - từ đang chờ đến đã hoàn thành.',
    },
  },
  {
    element: '#order-tabs',
    popover: {
      title: '📑 Tabs Trạng Thái',
      description: 'Lọc đơn hàng theo trạng thái: Tất cả, Chờ xác nhận, Đã xác nhận, Đang vận chuyển, Hoàn thành.',
      side: 'bottom',
    },
  },
  {
    element: '.order-card:first-child',
    popover: {
      title: '📋 Thông Tin Đơn Hàng',
      description: 'Mỗi card hiển thị: Mã đơn, Container, Giá, Trạng thái, Ngày tạo.',
      side: 'top',
    },
  },
  {
    element: '.order-status-badge:first',
    popover: {
      title: '🏷️ Trạng Thái',
      description: 'Badge màu sắc hiển thị trạng thái hiện tại của đơn hàng.',
      side: 'top',
    },
  },
  {
    element: '.order-action-buttons:first',
    popover: {
      title: '⚡ Thao Tác',
      description: 'Xem chi tiết, Hủy đơn, Liên hệ người bán, Xác nhận đã nhận.',
      side: 'top',
    },
  },
];

// 5. Admin Users Tour
export const adminUsersTourSteps: DriveStep[] = [
  {
    popover: {
      title: '👥 Quản Lý Người Dùng',
      description: 'Trang quản lý tất cả users trong hệ thống. Chỉ dành cho Admin!',
    },
  },
  {
    element: '#create-user-button',
    popover: {
      title: '➕ Tạo User Mới',
      description: 'Thêm user mới vào hệ thống với email, password, và phân quyền.',
      side: 'bottom',
    },
  },
  {
    element: '#users-search',
    popover: {
      title: '🔍 Tìm Kiếm User',
      description: 'Tìm user theo tên, email, hoặc role.',
      side: 'bottom',
    },
  },
  {
    element: '#users-table',
    popover: {
      title: '📊 Bảng Users',
      description: 'Danh sách tất cả users với thông tin: Email, Tên, Roles, Ngày tạo, Trạng thái.',
      side: 'top',
    },
  },
  {
    element: '.user-role-badges:first',
    popover: {
      title: '🎭 Vai Trò',
      description: 'Mỗi user có thể có nhiều roles: Admin, Seller, Buyer, Depot Staff, Inspector, v.v.',
      side: 'top',
    },
  },
  {
    element: '.user-edit-button:first',
    popover: {
      title: '✏️ Chỉnh Sửa User',
      description: 'Cập nhật thông tin user, thay đổi roles, hoặc cấp/thu hồi permissions.',
      side: 'left',
    },
  },
];

// 6. Settings Page Tour
export const settingsTourSteps: DriveStep[] = [
  {
    popover: {
      title: '⚙️ Cài Đặt Tài Khoản',
      description: 'Tùy chỉnh thông tin cá nhân và preferences của bạn.',
    },
  },
  {
    element: '#profile-section',
    popover: {
      title: '👤 Thông Tin Cá Nhân',
      description: 'Cập nhật tên, email, số điện thoại, địa chỉ.',
      side: 'right',
    },
  },
  {
    element: '#avatar-upload',
    popover: {
      title: '📸 Avatar',
      description: 'Upload ảnh đại diện của bạn.',
      side: 'bottom',
    },
  },
  {
    element: '#password-section',
    popover: {
      title: '🔐 Đổi Mật Khẩu',
      description: 'Thay đổi mật khẩu để bảo mật tài khoản.',
      side: 'right',
    },
  },
  {
    element: '#notification-preferences',
    popover: {
      title: '🔔 Tùy Chọn Thông Báo',
      description: 'Chọn loại thông báo bạn muốn nhận: Email, SMS, In-app.',
      side: 'right',
    },
  },
];

// 7. Login Page Tour
export const loginTourSteps: DriveStep[] = [
  {
    popover: {
      title: '🎯 Chào Mừng Đến Trang Đăng Nhập',
      description: 'Đây là trang đăng nhập của i-ContExchange. Chúng tôi sẽ hướng dẫn bạn cách sử dụng các tính năng đăng nhập.',
    },
  },
  {
    element: '#email',
    popover: {
      title: '📧 Email',
      description: 'Nhập địa chỉ email của bạn. Ví dụ: admin@i-contexchange.vn',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#password',
    popover: {
      title: '🔒 Mật Khẩu',
      description: 'Nhập mật khẩu của bạn. Click vào icon mắt bên phải để hiện/ẩn mật khẩu.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#remember',
    popover: {
      title: '💾 Ghi Nhớ Đăng Nhập',
      description: 'Tích vào đây nếu bạn muốn hệ thống ghi nhớ thông tin đăng nhập của bạn.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#forgot-password-link',
    popover: {
      title: '🔑 Quên Mật Khẩu?',
      description: 'Nếu bạn quên mật khẩu, click vào đây để khôi phục qua email.',
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '#login-submit-button',
    popover: {
      title: '✅ Đăng Nhập',
      description: 'Click vào nút này sau khi điền đầy đủ thông tin để đăng nhập vào hệ thống.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '#quick-login-section',
    popover: {
      title: '🚀 Đăng Nhập Nhanh - 10 Tài Khoản Demo',
      description: 'Hệ thống có 10 tài khoản demo với các vai trò khác nhau. Click vào button để tự động điền thông tin đăng nhập.',
      side: 'top',
      align: 'start',
    },
  },
  {
    element: '.quick-login-admin',
    popover: {
      title: '⚡ Admin - Quản Trị Viên',
      description: 'Tài khoản Admin có toàn quyền quản lý hệ thống. Email: admin@i-contexchange.vn, Password: admin123',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '.quick-login-buyer',
    popover: {
      title: '🛒 Buyer - Người Mua',
      description: 'Tài khoản Buyer dùng để tìm kiếm và mua container. Email: buyer@example.com, Password: buyer123',
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '.quick-login-seller',
    popover: {
      title: '🏪 Seller - Người Bán',
      description: 'Tài khoản Seller dùng để đăng bán container và quản lý đơn hàng. Email: seller@example.com, Password: seller123',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '.quick-login-manager',
    popover: {
      title: '👨‍💼 Manager - Quản Lý Kho',
      description: 'Tài khoản Manager quản lý vận hành kho container. Email: manager@example.com, Password: manager123',
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '#social-login-section',
    popover: {
      title: '🌐 Đăng Nhập Mạng Xã Hội',
      description: 'Bạn cũng có thể đăng nhập bằng Google hoặc Facebook để nhanh và tiện lợi hơn.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '#signup-link',
    popover: {
      title: '📝 Chưa Có Tài Khoản?',
      description: 'Nếu bạn chưa có tài khoản, click vào đây để đăng ký mới. Quá trình đăng ký rất đơn giản!',
      side: 'top',
      align: 'center',
    },
  },
];

// Helper: Start tour by name
export function startTour(tourName: string): Driver | undefined {
  const tours: Record<string, DriveStep[]> = {
    dashboard: dashboardTourSteps,
    listings: listingsTourSteps,
    createListing: createListingTourSteps,
    orders: ordersTourSteps,
    adminUsers: adminUsersTourSteps,
    settings: settingsTourSteps,
    login: loginTourSteps,
  };

  const steps = tours[tourName];
  if (!steps) {
    console.error(`Tour "${tourName}" not found`);
    return undefined;
  }

  // Filter out steps với elements không tồn tại
  const validSteps = steps.filter(step => {
    if (!step.element) return true;
    
    if (typeof step.element === 'string') {
      const element = document.querySelector(step.element);
      if (!element) {
        console.warn(`Element not found: ${step.element}`);
        return false;
      }
    }
    
    return true;
  });

  if (validSteps.length === 0) {
    console.error('No valid steps found for tour');
    return undefined;
  }

  console.log(`Starting tour "${tourName}" with ${validSteps.length} steps`);

  // Function to force destroy tour
  const forceDestroy = (driverInstance: Driver) => {
    console.log('💥 FORCE DESTROY CALLED');
    try {
      driverInstance.destroy();
      console.log('✅ Driver.destroy() called');
    } catch (e) {
      console.error('❌ destroy() failed:', e);
    }
    
    // Also manually remove all driver elements
    try {
      const overlay = document.querySelector('.driver-overlay');
      const popover = document.querySelector('.driver-popover');
      const activeEl = document.querySelector('.driver-active-element');
      
      if (overlay) overlay.remove();
      if (popover) popover.remove();
      if (activeEl) activeEl.classList.remove('driver-active-element');
      
      console.log('✅ DOM elements removed manually');
    } catch (e) {
      console.error('❌ Manual cleanup failed:', e);
    }
  };

  // Function to fix button click events
  const fixButtonClicks = (driverInstance: Driver) => {
    setTimeout(() => {
      console.log('� Fixing button clicks...');
      
      const popover = document.querySelector('.driver-popover') as HTMLElement;
      if (!popover) {
        console.warn('❌ Popover not found');
        return;
      }
      
      // Get all buttons
      const closeBtn = popover.querySelector('.driver-popover-close-btn') as HTMLElement;
      const nextBtn = popover.querySelector('.driver-popover-next-btn') as HTMLElement;
      const prevBtn = popover.querySelector('.driver-popover-prev-btn') as HTMLElement;
      const doneBtn = popover.querySelector('.driver-popover-done-btn') as HTMLElement;
      
      console.log('Buttons:', { close: !!closeBtn, next: !!nextBtn, prev: !!prevBtn, done: !!doneBtn });
      
      // Direct event attachment without overlay
      if (closeBtn) {
        // Remove all existing listeners
        const newClose = closeBtn.cloneNode(true) as HTMLElement;
        closeBtn.replaceWith(newClose);
        
        // Add single click listener
        newClose.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('❌ Close clicked');
          forceDestroy(driverInstance);
          return false;
        };
        console.log('✅ Close fixed');
      }
      
      if (nextBtn) {
        const newNext = nextBtn.cloneNode(true) as HTMLElement;
        nextBtn.replaceWith(newNext);
        
        newNext.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('➡️ Next clicked');
          driverInstance.moveNext();
          return false;
        };
        console.log('✅ Next fixed');
      }
      
      if (prevBtn) {
        const newPrev = prevBtn.cloneNode(true) as HTMLElement;
        prevBtn.replaceWith(newPrev);
        
        newPrev.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('⬅️ Prev clicked');
          driverInstance.movePrevious();
          return false;
        };
        console.log('✅ Prev fixed');
      }
      
      if (doneBtn) {
        const newDone = doneBtn.cloneNode(true) as HTMLElement;
        doneBtn.replaceWith(newDone);
        
        newDone.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('✓ Done clicked');
          forceDestroy(driverInstance);
          return false;
        };
        console.log('✅ Done fixed');
      }
      
    }, 100);
  };

  // Create driver instance
  const driverObj = driver({
    ...tourConfig,
    onHighlighted: (element, step, opts) => {
      console.log(`📍 Step highlighted: ${step.popover?.title || 'No title'}`);
      // Store driver instance globally for onPopoverRender
      (window as any).__currentDriver = opts.driver;
      // Fix button clicks on each step
      fixButtonClicks(opts.driver);
    },
    onNextClick: (element) => {
      console.log('➡️ Next button clicked');
    },
    onPrevClick: (element) => {
      console.log('⬅️ Previous button clicked');
    },
    onCloseClick: (element) => {
      console.log('❌ Close button clicked (Driver.js callback)');
    },
    onDestroyStarted: () => {
      console.log(`🔚 Tour "${tourName}" is being destroyed`);
      if (!hasSeenTour(tourName)) {
        markTourAsSeen(tourName);
      }
    },
    onDestroyed: () => {
      console.log(`✅ Tour "${tourName}" destroyed successfully`);
      // Remove escape key handler
      document.removeEventListener('keydown', escapeHandler);
      // Clean up global reference
      delete (window as any).__currentDriver;
    },
  });
  
  // Store driver instance globally
  (window as any).__currentDriver = driverObj;
  
  // Add global escape key handler
  const escapeHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      console.log('⌨️ ESC key pressed - destroying tour');
      forceDestroy(driverObj);
    }
  };
  document.addEventListener('keydown', escapeHandler);
  console.log('⌨️ ESC key handler added');
  
  // Add overlay click handler to close tour
  setTimeout(() => {
    const overlay = document.querySelector('.driver-overlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        console.log('🖱️ Overlay clicked - destroying tour');
        forceDestroy(driverObj);
      }, { capture: true });
      console.log('🖱️ Overlay click handler added');
    }
  }, 300);
  
  driverObj.setSteps(validSteps);
  driverObj.drive();
  
  // Initial fix button clicks
  fixButtonClicks(driverObj);
  
  return driverObj;
}

// Helper: Check if user has seen tour
export function hasSeenTour(tourName: string): boolean {
  const key = `tour_seen_${tourName}`;
  return localStorage.getItem(key) === 'true';
}

// Helper: Mark tour as seen
export function markTourAsSeen(tourName: string) {
  const key = `tour_seen_${tourName}`;
  localStorage.setItem(key, 'true');
}

// Helper: Reset tour (for testing)
export function resetTour(tourName: string) {
  const key = `tour_seen_${tourName}`;
  localStorage.removeItem(key);
}

// Auto-start tour for first-time users
export function autoStartTour(tourName: string, delay: number = 1000) {
  if (!hasSeenTour(tourName)) {
    setTimeout(() => {
      startTour(tourName);
      markTourAsSeen(tourName);
    }, delay);
  }
}
