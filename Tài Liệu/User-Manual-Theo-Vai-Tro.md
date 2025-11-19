# 📖 Hướng Dẫn Sử Dụng Hệ Thống i-ContExchange

## 🎯 Tổng Quan Hệ Thống

i-ContExchange là nền tảng quản lý và trao đổi container với hệ thống phân quyền dựa trên vai trò (RBAC). Mỗi người dùng sẽ có quyền truy cập khác nhau tùy thuộc vào vai trò được gán.

---

## 👑 Hướng Dẫn Cho Admin

### Quyền Truy Cập
- Toàn quyền hệ thống
- Quản lý người dùng và phân quyền
- Xem tất cả báo cáo và thống kê
- Cấu hình hệ thống

### Menu Navigation
```
📊 Dashboard
⚙️ Admin
  👥 User Management - Quản lý người dùng
  🛡️ Role Management - Quản lý vai trò
  🔑 Permissions - Quản lý quyền
  🏢 Organizations - Quản lý tổ chức
  🔧 System Settings - Cài đặt hệ thống
🛒 Marketplace - Quản lý marketplace
📋 Orders - Quản lý đơn hàng
🏭 Depot - Quản lý kho bãi
🔍 Inspection - Quản lý kiểm định
💰 Financial - Quản lý tài chính
⚠️ Disputes - Quản lý tranh chấp
👤 Account - Tài khoản cá nhân
```

### Hướng Dẫn Sử Dụng

#### 1. Quản Lý Người Dùng
- **Xem danh sách:** Menu > Admin > User Management
- **Tạo người dùng mới:** Nút "Create User"
- **Chỉnh sửa thông tin:** Click vào user name
- **Phân quyền:** Tab "Roles" > Assign/Remove roles
- **Deactivate user:** Change status to "Inactive"

#### 2. Quản Lý Vai Trò
- **Xem roles:** Menu > Admin > Role Management  
- **Tạo role mới:** Nút "Create Role"
- **Gán permissions:** Select role > Tab "Permissions"
- **Set hierarchy:** Adjust role level (0-100)

#### 3. Monitoring Hệ Thống
- **User activity:** Admin > System Settings > Audit Logs
- **System health:** Dashboard > System Status
- **Performance:** Dashboard > Performance Metrics

---

## 🛒 Hướng Dẫn Cho Buyer

### Quyền Truy Cập
- Xem và tìm kiếm listings
- Tạo và quản lý đơn hàng
- Xem lịch sử giao dịch
- Quản lý hồ sơ cá nhân

### Menu Navigation
```
📊 Dashboard
🛒 Marketplace
  📋 Browse Listings - Duyệt listings
📋 Orders  
  📋 My Orders - Đơn hàng của tôi
👤 Account - Tài khoản cá nhân
```

### Hướng Dẫn Sử Dụng

#### 1. Tìm Kiếm Container
- **Browse listings:** Menu > Marketplace > Browse Listings
- **Filter:** Size, condition, location, price
- **Sort:** Price, date, location
- **View details:** Click on listing card

#### 2. Đặt Hàng
- **Select container:** Click "Request Quote"
- **Fill requirements:** Quantity, delivery date, special requests
- **Submit request:** Review và submit
- **Track status:** Menu > Orders > My Orders

#### 3. Quản Lý Đơn Hàng
- **View orders:** Menu > Orders > My Orders
- **Order status:** Pending → Confirmed → Shipped → Delivered
- **Communication:** Message center với seller
- **Payment:** Handle invoices và payments

---

## 💰 Hướng Dẫn Cho Seller

### Quyền Truy Cập
- Tạo và quản lý listings
- Xử lý đơn hàng từ buyers
- Xem báo cáo bán hàng
- Quản lý inventory

### Menu Navigation
```
📊 Dashboard
🛒 Marketplace
  📋 Browse Listings - Duyệt tất cả listings
  📦 My Listings - Listings của tôi
  ➕ Create Listing - Tạo listing mới
📋 Orders
  📋 My Orders - Đơn hàng của tôi
👤 Account - Tài khoản cá nhân
```

### Hướng Dẫn Sử Dụng

#### 1. Tạo Listing
- **Create new:** Menu > Marketplace > Create Listing
- **Container info:** Type, size, condition, age
- **Pricing:** Base price, negotiable options
- **Location:** Current location, available for pickup
- **Photos:** Upload multiple high-quality images
- **Description:** Detailed condition report

#### 2. Quản Lý Listings
- **View all:** Menu > Marketplace > My Listings
- **Edit listing:** Click edit icon
- **Update availability:** Mark as sold/available
- **Pricing adjustments:** Update pricing
- **Promote:** Feature listing for visibility

#### 3. Xử Lý Đơn Hàng
- **New orders:** Dashboard > Recent Orders
- **Review requests:** Check buyer requirements
- **Send quotes:** Price, terms, delivery options
- **Confirm orders:** Accept/reject with terms
- **Arrange delivery:** Coordinate logistics

---

## 🏭 Hướng Dẫn Cho Depot Staff

### Quyền Truy Cập
- Quản lý inventory kho bãi
- Xử lý hàng nhập/xuất
- Sắp xếp và di chuyển container
- Báo cáo tình trạng kho

### Menu Navigation
```
📊 Dashboard
🏭 Depot
  📦 Inventory - Quản lý tồn kho
  🚛 Receiving - Xử lý hàng nhập
  🚢 Delivery - Xử lý hàng xuất
👤 Account - Tài khoản cá nhân
```

### Hướng Dẫn Sử Dụng

#### 1. Quản Lý Inventory
- **View inventory:** Menu > Depot > Inventory
- **Search containers:** By ID, size, owner
- **Location tracking:** Yard position, stack level
- **Condition updates:** Regular condition checks
- **Move containers:** Update positions

#### 2. Receiving Operations
- **Incoming containers:** Menu > Depot > Receiving
- **Check documentation:** BOL, customs papers
- **Physical inspection:** Damage assessment
- **Position assignment:** Assign yard location
- **Update system:** Record receipt

#### 3. Delivery Operations
- **Outgoing containers:** Menu > Depot > Delivery
- **Verify orders:** Check pickup authorization
- **Load preparation:** Position for pickup
- **Documentation:** Release papers, condition report
- **Update status:** Mark as delivered

---

## 🔍 Hướng Dẫn Cho Inspector

### Quyền Truy Cập
- Tạo và quản lý báo cáo kiểm định
- Xem lịch sử inspection
- Upload ảnh và tài liệu
- Phê duyệt condition reports

### Menu Navigation
```
📊 Dashboard
🔍 Inspection
  📋 Inspection Reports - Báo cáo kiểm định
  ➕ Create Report - Tạo báo cáo mới
👤 Account - Tài khoản cá nhân
```

### Hướng Dẫn Sử Dụng

#### 1. Tạo Báo Cáo Kiểm Định
- **New inspection:** Menu > Inspection > Create Report
- **Container ID:** Scan/enter container number
- **Visual inspection:** Exterior/interior condition
- **Structural check:** Walls, floor, ceiling, doors
- **Measurements:** Length, width, height verification
- **Photo documentation:** Multiple angles, damage details
- **Condition rating:** Grade A/B/C/D
- **Recommendations:** Repair needs, certification

#### 2. Quản Lý Reports
- **View reports:** Menu > Inspection > Inspection Reports
- **Edit reports:** Update existing reports
- **Status tracking:** Draft → Review → Approved
- **Export reports:** PDF generation
- **Archive:** Completed inspections

---

## ⚙️ Hướng Dẫn Cho Operator

### Quyền Truy Cập
- Vận hành hệ thống hàng ngày
- Xử lý yêu cầu support
- Monitoring system performance
- Backup và maintenance

### Menu Navigation
```
📊 Dashboard
🛒 Marketplace - Giám sát marketplace
📋 Orders - Giám sát orders
🏭 Depot - Giám sát depot operations
👤 Account - Tài khoản cá nhân
```

### Hướng Dẫn Sử Dụng

#### 1. System Monitoring
- **Dashboard overview:** Real-time metrics
- **User activity:** Active users, recent actions
- **System alerts:** Error notifications
- **Performance:** Response times, load metrics

#### 2. Support Operations
- **User requests:** Help desk tickets
- **Issue resolution:** Troubleshooting guide
- **Escalation:** Forward to appropriate teams
- **Documentation:** Update knowledge base

---

## 🔐 Security Best Practices

### Cho Tất Cả Users

1. **Password Security**
   - Sử dụng password mạnh (8+ ký tự, mixed case, numbers, symbols)
   - Không chia sẻ credentials
   - Thay đổi password định kỳ

2. **Session Management**
   - Logout khi không sử dụng
   - Không để máy không khóa
   - Kiểm tra active sessions trong Account settings

3. **Data Protection**
   - Không screenshot sensitive data
   - Verify recipients trước khi share information
   - Report suspicious activities

### Cho Admin

1. **User Management**
   - Regular access reviews
   - Immediate deactivation for terminated users
   - Monitor login logs
   - Audit role assignments

2. **System Security**
   - Regular backup verification
   - Monitor system logs
   - Update permissions as needed
   - Security incident response

---

## 📞 Support và Help

### Self-Help Resources
- **Knowledge Base:** Menu > Help > Knowledge Base
- **FAQ:** Common questions và answers
- **Video Tutorials:** Step-by-step guides
- **System Status:** Current system health

### Contact Support
- **Email:** support@i-contexchange.vn
- **Phone:** (84) 28-1234-5678
- **Business Hours:** Mon-Fri 8:00-18:00 ICT
- **Emergency:** 24/7 for critical issues

### Escalation Process
1. **Level 1:** Self-service resources
2. **Level 2:** General support team
3. **Level 3:** Technical specialists
4. **Level 4:** Development team

---

*Cập nhật lần cuối: $(Get-Date -Format "dd/MM/yyyy")*