# 🔐 Hệ Thống Cấu Hình Phân Quyền Động - README

## 📋 Tổng Quan

Hệ thống quản lý phân quyền dựa trên vai trò (RBAC - Role-Based Access Control) với giao diện cấu hình động, cho phép Admin quản lý roles, permissions, và user assignments mà không cần code.

## ✨ Tính Năng

### 🎯 Core Features
- ✅ **Role Management:** Tạo, sửa, xóa roles với level hierarchy
- ✅ **Permission Management:** Quản lý 53 permissions theo 11 modules
- ✅ **Permission Matrix:** Gán permissions cho roles trực quan qua ma trận
- ✅ **User Assignment:** Gán roles cho users với search & filter
- ✅ **Real-time Update:** Thay đổi có hiệu lực ngay lập tức
- ✅ **Statistics Dashboard:** Xem tổng quan và phân bố roles

### 🔒 Security Features
- JWT Authentication
- Admin-only access (Level 100)
- System role protection
- Cascade delete prevention
- Audit trail logging

## 🚀 Quick Start

### 1. Access

```
URL: http://localhost:3000/admin/rbac
Credentials: admin@i-contexchange.vn / admin123
```

### 2. Tạo Role Mới

```
1. Vào /admin/rbac/roles
2. Click "Tạo Role Mới"
3. Điền: code, name, level
4. Click "Tạo"
```

### 3. Gán Permissions

```
1. Vào /admin/rbac/matrix
2. Tìm role vừa tạo (cột)
3. Check permissions cần gán (hàng)
4. Click "Lưu Thay Đổi"
```

### 4. Gán Role cho User

```
1. Vào /admin/rbac/users
2. Tìm user cần gán
3. Click "Gán Roles"
4. Check roles muốn gán
5. Click "Lưu"
```

## 📁 File Structure

```
backend/src/routes/admin/
└── rbac.ts                           # ✅ Backend API endpoints

app/[locale]/admin/rbac/
├── page.tsx                          # ✅ Dashboard/Overview
├── roles/page.tsx                    # ✅ Role management
├── matrix/page.tsx                   # ✅ Permission matrix
├── users/page.tsx                    # ✅ User assignment
└── permissions/page.tsx              # ⚠️ (Optional - có thể dùng matrix)

Tài Liệu/
├── MA-TRAN-PHAN-QUYEN-HE-THONG-RBAC.md          # ✅ Ma trận đầy đủ
├── HUONG-DAN-CAU-HINH-PHAN-QUYEN-DONG.md        # ✅ User guide
└── RBAC-DYNAMIC-CONFIG-README.md                # ✅ This file
```

## 🔌 API Endpoints

### Roles
```
GET    /api/v1/admin/rbac/roles          # List all roles
GET    /api/v1/admin/rbac/roles/:id      # Get role details
POST   /api/v1/admin/rbac/roles          # Create role
PUT    /api/v1/admin/rbac/roles/:id      # Update role
DELETE /api/v1/admin/rbac/roles/:id      # Delete role
```

### Permissions
```
GET    /api/v1/admin/rbac/permissions           # List all permissions
POST   /api/v1/admin/rbac/permissions           # Create permission
PUT    /api/v1/admin/rbac/permissions/:id       # Update permission
DELETE /api/v1/admin/rbac/permissions/:id       # Delete permission
```

### Assignments
```
POST   /api/v1/admin/rbac/role-permissions/assign     # Assign permissions to role
GET    /api/v1/admin/rbac/permission-matrix            # Get full matrix
POST   /api/v1/admin/rbac/user-roles/assign            # Assign roles to user
GET    /api/v1/admin/rbac/users/:userId/roles          # Get user's roles
```

### Statistics
```
GET    /api/v1/admin/rbac/stats                        # Get RBAC statistics
```

## 📊 Ma Trận Phân Quyền

### Current State: 53 Permissions × 10 Roles

```
┌────────────────────┬───────┬──────────┬─────────┐
│ Role               │ Perms │ % Total  │ Level   │
├────────────────────┼───────┼──────────┼─────────┤
│ Admin              │ 53/53 │ 100%     │ 100     │
│ Config Manager     │ 16/53 │  30%     │  80     │
│ Depot Manager      │  9/53 │  17%     │  30     │
│ Seller             │ 12/53 │  23%     │  10     │
│ Buyer              │ 12/53 │  23%     │  10     │
│ Finance            │  3/53 │   6%     │  70     │
│ Price Manager      │  2/53 │   4%     │  60     │
│ Customer Support   │  2/53 │   4%     │  50     │
│ Inspector          │  4/53 │   8%     │  25     │
│ Depot Staff        │  4/53 │   8%     │  20     │
└────────────────────┴───────┴──────────┴─────────┘
```

### Permission Categories

```
Configuration (16)    ████████████████  30%
Depot (7)             ███████           13%
Admin (5)             █████              9%
Listings (5)          █████              9%
RFQ/Quote (5)         █████              9%
Orders (4)            ████               8%
Reviews/Disputes (3)  ███                6%
Public (3)            ███                6%
Finance (2)           ██                 4%
Inspection (2)        ██                 4%
Support (1)           █                  2%
──────────────────────────────────────────
TOTAL: 53            ███████████████  100%
```

## 🎨 UI Components

### 1. Dashboard (`/admin/rbac`)
- Overview cards: roles, permissions, users, assignments
- Quick action buttons
- Role distribution chart
- Navigation links

### 2. Role Management (`/admin/rbac/roles`)
- Table view: code, name, level, perm count, user count
- Create/Edit/Delete dialog
- Permission detail link
- System role protection

### 3. Permission Matrix (`/admin/rbac/matrix`)
- Table: permissions (rows) × roles (columns)
- Checkboxes for assignment
- Search & filter by category
- Bulk save with change tracking
- Admin column disabled (always true)

### 4. User Assignment (`/admin/rbac/users`)
- User table with current roles
- Search by email/name
- Role selection dialog
- Checkbox multi-select
- Save with validation

## 🔧 Customization

### Tạo Role Mới

```typescript
// Example: Content Moderator Role
{
  code: "content_moderator",
  name: "Kiểm duyệt nội dung",
  description: "Duyệt tin đăng và Q&A",
  level: 40
}

// Permissions:
- PM-001: VIEW_PUBLIC_LISTINGS
- PM-002: SEARCH_LISTINGS
- PM-070: ADMIN_REVIEW_LISTING
- PM-023: MANAGE_QA
```

### Tạo Permission Mới

```typescript
// Example: Custom Analytics Permission
{
  code: "PM-200",
  name: "VIEW_ANALYTICS_REPORT",
  description: "Xem báo cáo analytics chi tiết",
  category: "analytics"
}
```

### Gán Permissions Động

```typescript
// Via API
POST /api/v1/admin/rbac/role-permissions/assign
{
  "roleId": "role-content_moderator",
  "permissionIds": ["perm-pm-070", "perm-pm-023"],
  "scope": "GLOBAL"
}

// Via UI
/admin/rbac/matrix → Toggle checkboxes → Save
```

## 🧪 Testing

### Manual Testing

```bash
# 1. Login as admin
curl -X POST http://localhost:3001/api/v1/auth/login \
  -d '{"email":"admin@i-contexchange.vn","password":"admin123"}'

# 2. Create role
curl -X POST http://localhost:3001/api/v1/admin/rbac/roles \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"code":"test_role","name":"Test","level":20}'

# 3. Assign permissions
curl -X POST http://localhost:3001/api/v1/admin/rbac/role-permissions/assign \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"roleId":"role-test_role","permissionIds":["perm-pm-001"]}'

# 4. Assign to user
curl -X POST http://localhost:3001/api/v1/admin/rbac/user-roles/assign \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"userId":"user-xxx","roleIds":["role-test_role"]}'
```

### UI Testing

```
✅ Dashboard loads with stats
✅ Create new role
✅ Edit role details
✅ Cannot delete system role
✅ Cannot delete role with users
✅ Permission matrix displays correctly
✅ Toggle permissions work
✅ Save changes persists
✅ User search works
✅ Assign roles to user
✅ Remove roles from user
```

## 📈 Performance

### Optimization Tips

1. **Frontend Caching**
```typescript
// Cache permissions in localStorage
localStorage.setItem('userPermissions', JSON.stringify(permissions))
```

2. **Lazy Loading**
```typescript
// Only load matrix when needed
useEffect(() => {
  if (activeTab === 'matrix') {
    fetchMatrix()
  }
}, [activeTab])
```

3. **Debounce Search**
```typescript
const debouncedSearch = useMemo(
  () => debounce((term) => setSearchTerm(term), 300),
  []
)
```

4. **Batch Operations**
```typescript
// Assign multiple roles at once
POST /user-roles/assign
{
  "userId": "...",
  "roleIds": ["role-1", "role-2", "role-3"]
}
```

## 🐛 Troubleshooting

### Common Issues

#### 1. "Cannot delete role with users"
**Solution:** Unassign users first, then delete role

#### 2. "Permission code already exists"
**Solution:** Use unique code or edit existing permission

#### 3. "Access denied"
**Solution:** Check if user has admin role (PM-071)

#### 4. Changes not reflected
**Solution:** 
- Clear browser cache
- Logout & login again
- Check JWT token expiry

### Debug Commands

```sql
-- Check user roles
SELECT * FROM user_roles WHERE user_id = 'user-xxx';

-- Check role permissions
SELECT * FROM role_permissions WHERE role_id = 'role-xxx';

-- Get full matrix
SELECT p.code, r.code, rp.id IS NOT NULL as has_perm
FROM permissions p
CROSS JOIN roles r
LEFT JOIN role_permissions rp 
  ON p.id = rp.permission_id AND r.id = rp.role_id;
```

## 📚 Documentation

- **[MA-TRAN-PHAN-QUYEN-HE-THONG-RBAC.md](./MA-TRAN-PHAN-QUYEN-HE-THONG-RBAC.md)** - Ma trận đầy đủ 53×10
- **[HUONG-DAN-CAU-HINH-PHAN-QUYEN-DONG.md](./HUONG-DAN-CAU-HINH-PHAN-QUYEN-DONG.md)** - User guide chi tiết
- **[Quick-Start-RBAC.md](./Quick-Start-RBAC.md)** - Quick start guide
- **[RBAC-TEST-GUIDE.md](./RBAC-TEST-GUIDE.md)** - Testing guide

## 🎯 Next Steps

### Phase 1: Current Implementation ✅
- [x] Backend API endpoints
- [x] Frontend UI pages
- [x] Permission matrix view
- [x] User assignment
- [x] Documentation

### Phase 2: Enhancements 🚀
- [ ] Bulk user assignment
- [ ] Role templates
- [ ] Permission groups
- [ ] Import/Export matrix
- [ ] Audit log viewer

### Phase 3: Advanced Features 🔮
- [ ] Time-based permissions
- [ ] Context-based access
- [ ] Approval workflow
- [ ] Permission delegation
- [ ] A/B testing permissions

## 💡 Best Practices

1. **Naming Convention**
   - Role codes: `lowercase_underscore`
   - Permission codes: `PM-XXX`
   - Descriptive names in Vietnamese

2. **Level Assignment**
   - Reserve 90-100 for super admins
   - Use 10-unit increments (10, 20, 30...)
   - Leave gaps for future roles

3. **Permission Design**
   - Group by module
   - One action per permission
   - Clear, descriptive names
   - Document dependencies

4. **Security**
   - Never expose admin credentials
   - Audit all permission changes
   - Regular security reviews
   - Principle of least privilege

## 🤝 Contributing

Để đóng góp cho hệ thống RBAC:

1. Fork repository
2. Create feature branch
3. Implement changes
4. Write tests
5. Update documentation
6. Submit pull request

## 📞 Support

**Email:** support@i-contexchange.vn  
**Documentation:** https://docs.i-contexchange.vn/rbac  
**GitHub:** https://github.com/CaoThaiDuong24/conttrade

---

**© 2025 i-ContExchange Vietnam**

**Version:** 1.0  
**Last Updated:** 24/10/2025  
**Status:** ✅ Production Ready
