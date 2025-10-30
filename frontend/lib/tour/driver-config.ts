/**
 * Driver.js Configuration for Interactive Tours
 * Cấu hình tour hướng dẫn tương tác cho toàn dự án
 */

import { driver, DriveStep, Config } from 'driver.js';
// ❌ REMOVED: CSS import moved to driver-custom.css to avoid conflicts
// import 'driver.js/dist/driver.css';

// Custom styling cho tour
export const tourConfig: Config = {
  showProgress: true,
  showButtons: ['next', 'previous', 'close'],
  progressText: 'Bước {{current}}/{{total}}',
  nextBtnText: 'Tiếp theo →',
  prevBtnText: '← Quay lại',
  doneBtnText: '✓ Hoàn thành',
  animate: true,
  allowClose: true,
  disableActiveInteraction: false,
  popoverClass: 'driverjs-theme',
  // ✅ CRITICAL: Overlay and highlight config
  overlayColor: 'rgb(0, 0, 0)', // Pure black overlay
  overlayOpacity: 0.85, // 85% opacity for strong contrast
  popoverOffset: 10, // Space between element and popover
  stagePadding: 8, // More padding around highlighted element
  stageRadius: 8, // Border radius of highlighted element
  smoothScroll: true, // Smooth scroll to element
};

/**
 * Tạo driver instance với config
 */
export function createTour(config?: Partial<Config>) {
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

// 7. Login Page Tour - FIXED POSITIONING
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
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#forgot-password-link',
    popover: {
      title: '🔑 Quên Mật Khẩu?',
      description: 'Nếu bạn quên mật khẩu, click vào đây để khôi phục qua email.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '#login-submit-button',
    popover: {
      title: '✅ Đăng Nhập',
      description: 'Click vào nút này sau khi điền đầy đủ thông tin để đăng nhập vào hệ thống.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#quick-login-section',
    popover: {
      title: '🚀 Đăng Nhập Nhanh - 10 Tài Khoản Demo',
      description: 'Hệ thống có 10 tài khoản demo với các vai trò khác nhau. Click vào button để tự động điền thông tin đăng nhập.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '.quick-login-admin',
    popover: {
      title: '⚡ Admin - Quản Trị Viên',
      description: 'Tài khoản Admin có toàn quyền quản lý hệ thống. Email: admin@i-contexchange.vn, Password: admin123',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '.quick-login-buyer',
    popover: {
      title: '🛒 Buyer - Người Mua',
      description: 'Tài khoản Buyer dùng để tìm kiếm và mua container. Email: buyer@example.com, Password: buyer123',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '.quick-login-seller',
    popover: {
      title: '🏪 Seller - Người Bán',
      description: 'Tài khoản Seller dùng để đăng bán container và quản lý đơn hàng. Email: seller@example.com, Password: seller123',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '.quick-login-manager',
    popover: {
      title: '👨‍💼 Manager - Quản Lý Kho',
      description: 'Tài khoản Manager quản lý vận hành kho container. Email: manager@example.com, Password: manager123',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '#social-login-section',
    popover: {
      title: '🌐 Đăng Nhập Mạng Xã Hội',
      description: 'Bạn cũng có thể đăng nhập bằng Google hoặc Facebook để nhanh và tiện lợi hơn.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#signup-link',
    popover: {
      title: '📝 Chưa Có Tài Khoản?',
      description: 'Nếu bạn chưa có tài khoản, click vào đây để đăng ký mới. Quá trình đăng ký rất đơn giản!',
      side: 'bottom',
      align: 'center',
    },
  },
];

// 8. Sell New Listing Tour - Comprehensive Guide
export const sellNewTourSteps: DriveStep[] = [
  {
    popover: {
      title: '🎉 Chào Mừng Đến Trang Đăng Tin Mới',
      description: 'Chúng tôi sẽ hướng dẫn bạn qua 5 bước để tạo một tin đăng container chuyên nghiệp. Hãy bắt đầu!',
    },
  },
  {
    element: '#progress-steps-indicator',
    popover: {
      title: '📊 Thanh Tiến Trình',
      description: 'Theo dõi tiến độ hoàn thành tin đăng của bạn qua 5 bước: Thông số → Hình ảnh → Giá cả → Vị trí → Xem lại.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#deal-type-section',
    popover: {
      title: '🏷️ Bước 1: Chọn Loại Giao Dịch',
      description: 'Chọn loại giao dịch: Bán (SALE), Thuê (RENTAL), Thuê dài hạn (LEASE), hoặc Đấu giá (AUCTION). Loại giao dịch sẽ ảnh hưởng đến thông tin giá cả.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#container-size-select',
    popover: {
      title: '📏 Kích Thước Container',
      description: 'Chọn kích thước container: 20ft (TEU), 40ft (FEU), 45ft, v.v. Kích thước ảnh hưởng đến giá và không gian lưu trữ.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#container-type-select',
    popover: {
      title: '📦 Loại Container',
      description: 'Chọn loại container: Dry (khô), Reefer (lạnh), Open Top (nóc mở), Flat Rack (sàn phẳng), Tank (bồn), v.v.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#quality-standard-select',
    popover: {
      title: '⭐ Tiêu Chuẩn Chất Lượng',
      description: 'Chọn tiêu chuẩn: ISO (quốc tế), IICL (hiệp hội container), CW (có thể vận chuyển), AS-IS (hiện trạng), v.v.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#condition-select',
    popover: {
      title: '🔧 Tình Trạng Container',
      description: 'Chọn tình trạng: Mới (New), Đã qua sử dụng (Used), Tân trang (Refurbished), hoặc Hư hỏng (Damaged).',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#title-description-section',
    popover: {
      title: '✍️ Tiêu Đề và Mô Tả',
      description: 'Nhập tiêu đề hấp dẫn (10-200 ký tự) và mô tả chi tiết (20-2000 ký tự). Nếu để trống, hệ thống sẽ tự động tạo dựa trên thông số container.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#media-upload-section',
    popover: {
      title: '📸 Bước 2: Upload Hình Ảnh & Video',
      description: 'Upload tối đa 10 ảnh (mỗi ảnh ≤ 5MB) và 1 video MP4 (≤ 100MB). Ảnh đầu tiên sẽ là ảnh đại diện. Kéo thả file hoặc click để chọn.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#pricing-section',
    popover: {
      title: '💰 Bước 3: Thiết Lập Giá Cả',
      description: 'Nhập giá bán hoặc giá thuê, chọn tiền tệ (VND, USD, EUR...). Nếu chọn loại thuê, cần chọn đơn vị thời gian (ngày/tuần/tháng/năm).',
      side: 'bottom',
      align: 'start',
    },
  },
  
  // ============ 🆕 RENTAL MANAGEMENT TOUR STEPS (chỉ hiển thị khi chọn RENTAL/LEASE) ============
  // Note: Các steps này sẽ tự động skip nếu element không tồn tại (user chọn SALE)
  {
    element: '#rental-management-section',
    popover: {
      title: '📦 Quản Lý Container Cho Thuê',
      description: 'Thiết lập số lượng container, thời gian thuê, chính sách đặt cọc và gia hạn. Các thông tin này giúp quản lý chặt chẽ việc cho thuê container. (Chỉ hiển thị khi chọn Cho thuê)',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#quantity-inventory-section',
    popover: {
      title: '🔢 Số Lượng Container',
      description: 'Nhập tổng số container và số lượng hiện có sẵn. Hệ thống sẽ tự động theo dõi số lượng đã thuê và đang bảo trì. Đảm bảo: Có sẵn + Đang thuê + Bảo trì = Tổng số.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#rental-duration-section',
    popover: {
      title: '⏰ Thời Gian Thuê',
      description: 'Đặt thời gian thuê tối thiểu và tối đa để kiểm soát chu kỳ cho thuê. VD: Tối thiểu 3 tháng, tối đa 12 tháng. Để trống tối đa = không giới hạn.',
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '#deposit-policy-section',
    popover: {
      title: '💰 Chính Sách Đặt Cọc',
      description: 'Bật tùy chọn yêu cầu đặt cọc và thiết lập số tiền (thường 20-50% giá thuê 1 kỳ). Có thể thêm phí trả muộn để bảo vệ tài sản.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#renewal-policy-section',
    popover: {
      title: '🔄 Chính Sách Gia Hạn',
      description: 'Cho phép khách hàng gia hạn hợp đồng thuê tự động. Thiết lập số ngày thông báo trước và % điều chỉnh giá khi gia hạn (+/-/0%).',
      side: 'top',
      align: 'center',
    },
  },
  
  {
    element: '#depot-select',
    popover: {
      title: '📍 Bước 4: Chọn Depot Lưu Trữ',
      description: 'Chọn depot/kho nơi container đang được lưu trữ. Chỉ có thể chọn depot còn chỗ trống. Xem số chỗ trống bên cạnh tên depot.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#location-notes-textarea',
    popover: {
      title: '📝 Ghi Chú Vị Trí (Tùy Chọn)',
      description: 'Thêm thông tin chi tiết về vị trí container: khu vực trong depot, hướng dẫn tiếp cận, điều kiện đặc biệt, v.v.',
      side: 'top',
      align: 'start',
    },
  },
  {
    element: '#review-section',
    popover: {
      title: '👀 Bước 5: Xem Lại Thông Tin',
      description: 'Kiểm tra kỹ tất cả thông tin trước khi gửi: loại giao dịch, thông số container, giá cả, vị trí, media. Đảm bảo mọi thứ chính xác.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '#submit-listing-button',
    popover: {
      title: '✅ Gửi Duyệt Tin Đăng',
      description: 'Click để gửi tin đăng. Tin sẽ được admin duyệt trước khi xuất hiện trên hệ thống. Bạn có thể theo dõi trạng thái tại "Quản lý tin đăng".',
      side: 'top',
      align: 'center',
    },
  },
  {
    popover: {
      title: '🎊 Hoàn Thành!',
      description: 'Bạn đã nắm được cách tạo tin đăng container. Mọi thắc mắc vui lòng liên hệ hỗ trợ. Chúc bạn bán hàng thành công!',
    },
  },
];

// Helper: Start tour by name
export function startTour(tourName: string) {
  const tours: Record<string, DriveStep[]> = {
    dashboard: dashboardTourSteps,
    listings: listingsTourSteps,
    createListing: createListingTourSteps,
    orders: ordersTourSteps,
    adminUsers: adminUsersTourSteps,
    settings: settingsTourSteps,
    login: loginTourSteps, // ✅ ADDED login tour
    sellNew: sellNewTourSteps, // ✅ ADDED sell new listing tour
  };

  const steps = tours[tourName];
  if (!steps) {
    console.error(`Tour "${tourName}" not found`);
    return;
  }

  // Filter valid steps
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
    console.error('No valid steps found');
    return;
  }

  // Create driver with explicit button handlers
  const driverObj = createTour({
    onNextClick: () => {
      console.log('✅ NEXT clicked');
      driverObj.moveNext();
    },
    onPrevClick: () => {
      console.log('✅ PREV clicked');
      driverObj.movePrevious();
    },
    onCloseClick: () => {
      console.log('✅ CLOSE clicked');
      driverObj.destroy();
    },
    onDestroyed: () => {
      console.log('Tour completed');
      markTourAsSeen(tourName);
    },
  });

  driverObj.setSteps(validSteps);
  driverObj.drive();
  
  console.log(`🎯 Tour "${tourName}" started with ${validSteps.length} steps`);
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
