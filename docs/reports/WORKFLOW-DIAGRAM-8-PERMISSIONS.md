# 🔄 WORKFLOW DIAGRAM - LISTING PERMISSIONS (8 PERMISSIONS THỰC TẾ)

**Ngày:** 4 tháng 10, 2025  
**Trạng thái:** ✅ Verified với Database  

---

## 📊 TỔNG QUAN CHÍNH XÁC

**Thực tế trong Database: 8 PERMISSIONS (PM-XXX format)**

### **Sơ đồ phân loại:**
```
LISTING PERMISSIONS (8 total)
├── PUBLIC/GUEST (2 permissions)
│   ├── PM-001: VIEW_PUBLIC_LISTINGS
│   └── PM-002: SEARCH_LISTINGS
│
├── SELLER MANAGEMENT (5 permissions)
│   ├── PM-010: CREATE_LISTING
│   ├── PM-011: EDIT_LISTING
│   ├── PM-012: PUBLISH_LISTING
│   ├── PM-013: ARCHIVE_LISTING
│   └── PM-014: DELETE_LISTING
│
└── ADMIN MODERATION (1 permission)
    └── PM-070: ADMIN_REVIEW_LISTING
```

### **❌ Lưu ý về "13 permissions":**
- **5 legacy** (listings.*) CHỈ TỒN TẠI TRONG CODE CŨ
- **8 new** (PM-XXX) TỒN TẠI TRONG DATABASE
- **Tổng số thực tế hoạt động: 8 permissions**

---

## 🎯 WORKFLOW ĐẦY ĐỦ - 8 PERMISSIONS

### **PHASE 1: GUEST/PUBLIC USER (2 permissions)**

```
┌─────────────────────────────────────────────────────────────┐
│               GUEST USER / PUBLIC ACCESS                    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Visit /listings       │
              │  (No login required)   │
              └────────────────────────┘
                           │
           ┌───────────────┴───────────────┐
           ▼                               ▼
    ┌─────────────┐                ┌─────────────┐
    │   PM-001    │                │   PM-002    │
    │ VIEW_PUBLIC │                │   SEARCH    │
    │  LISTINGS   │                │  LISTINGS   │
    └─────────────┘                └─────────────┘
           │                               │
           ▼                               ▼
    View approved                   Filter/Search
    listings only                   - By location
                                   - By price
                                   - By container type
                                   - By deal type
```

**Permissions:**
- ✅ **PM-001:** Xem tin đã approved (status = 'approved')
- ✅ **PM-002:** Tìm kiếm, lọc tin đăng

---

### **PHASE 2: SELLER WORKFLOW (7 permissions)**

```
┌─────────────────────────────────────────────────────────────┐
│                   SELLER USER                               │
│  Inherits: PM-001, PM-002 + Seller-specific permissions     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   Login as Seller      │
              │   Role: seller         │
              └────────────────────────┘
                           │
                           ▼
        ╔══════════════════════════════════════╗
        ║     SELLER LISTING MANAGEMENT         ║
        ╚══════════════════════════════════════╝
                           │
    ┌──────────────────────┼──────────────────────┐
    │                      │                      │
    ▼                      ▼                      ▼
┌─────────┐          ┌─────────┐          ┌─────────┐
│ PM-010  │          │ PM-011  │          │ PM-012  │
│ CREATE  │──────────│  EDIT   │──────────│ PUBLISH │
│ LISTING │   NEW    │ LISTING │  SUBMIT  │ LISTING │
└─────────┘          └─────────┘          └─────────┘
    │                      │                      │
    │                      │                      │
    ▼                      ▼                      ▼
/sell/new            /sell/my-listings    Change status
   │                      │                 draft → pending
   │                      │                      │
   ▼                      ▼                      ▼
Create new          Edit own listings    Send to admin
Status: draft       (draft/rejected)     for review
                                              │
                                              ▼
                                    Status: pending_review
                                              │
            ┌─────────────────────────────────┤
            │                                 │
            ▼                                 ▼
       ┌─────────┐                      ┌─────────┐
       │ PM-013  │                      │ PM-014  │
       │ ARCHIVE │                      │ DELETE  │
       │ LISTING │                      │ LISTING │
       └─────────┘                      └─────────┘
            │                                 │
            ▼                                 ▼
    Hide from public                  Permanently
    Status: archived                  remove listing
    (Can unarchive)                   (draft/rejected only)
```

**Seller Permissions Chi Tiết:**

1. **PM-010 (CREATE_LISTING):**
   - Route: `/sell/new`
   - API: `POST /api/v1/listings`
   - Initial status: `draft` hoặc `pending_review`
   - Fields: title, description, price, facets, location

2. **PM-011 (EDIT_LISTING):**
   - Route: `/sell/my-listings`, `/sell/edit/:id`
   - API: `PUT /api/v1/listings/:id`
   - Allowed statuses: `draft`, `rejected`, `pending_review`
   - Cannot edit: `approved`, `archived`, `sold`

3. **PM-012 (PUBLISH_LISTING):**
   - Action: Submit for admin review
   - Status change: `draft` → `pending_review`
   - Triggers: Admin notification
   - Queue: Admin review queue

4. **PM-013 (ARCHIVE_LISTING):**
   - Action: Hide from marketplace
   - Status change: `approved`/`active` → `archived`
   - Reversible: Can unarchive later
   - Use case: Temporarily unavailable

5. **PM-014 (DELETE_LISTING):**
   - Action: Permanent deletion
   - Allowed statuses: `draft`, `rejected`
   - Cannot delete: `approved`, `active`, `sold`
   - Irreversible action

---

### **PHASE 3: ADMIN REVIEW WORKFLOW (8 permissions)**

```
┌─────────────────────────────────────────────────────────────┐
│                      ADMIN USER                             │
│  Has ALL 8 permissions: PM-001, 002, 010-014, 070          │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   Login as Admin       │
              │   Role: admin          │
              └────────────────────────┘
                           │
                           ▼
        ╔══════════════════════════════════════╗
        ║      ADMIN LISTING MODERATION         ║
        ╚══════════════════════════════════════╝
                           │
                           ▼
              ┌────────────────────────┐
              │  /admin/listings       │
              │  View all listings     │
              └────────────────────────┘
                           │
                           ▼
                   ┌───────────────┐
                   │   PM-070      │
                   │ ADMIN_REVIEW  │
                   │   LISTING     │
                   └───────────────┘
                           │
            ┌──────────────┴──────────────┐
            ▼                             ▼
    ┌──────────────┐            ┌──────────────┐
    │   APPROVE    │            │    REJECT    │
    │      ✅      │            │      ❌      │
    └──────────────┘            └──────────────┘
            │                             │
            ▼                             ▼
 Status: pending_review         Status: pending_review
         ↓                               ↓
    approved                         rejected
         │                               │
         ▼                               ▼
 API: PUT /admin/listings/:id    API: PUT /admin/listings/:id
 Body: {status: "approved"}      Body: {status: "rejected",
                                       reason: "..."}
         │                               │
         ▼                               ▼
 Listing becomes public          Seller can edit & resubmit
 (appears in /listings)          Rejection reason displayed
                                 in /sell/my-listings
```

**Admin Permission Chi Tiết:**

**PM-070 (ADMIN_REVIEW_LISTING):**
- **Route:** `/admin/listings`
- **API Endpoint:** `PUT /api/v1/admin/listings/:id/status`
- **Actions:**
  
  **A. APPROVE:**
  ```json
  Request:
  PUT /api/v1/admin/listings/{id}/status
  Body: { "status": "approved" }
  
  Result:
  - listing.status = "approved"
  - listing.updatedAt = now()
  - Listing visible in public /listings
  - Seller sees "Đã duyệt" badge
  ```
  
  **B. REJECT:**
  ```json
  Request:
  PUT /api/v1/admin/listings/{id}/status
  Body: { 
    "status": "rejected",
    "reason": "Ảnh không rõ, giá không hợp lý"
  }
  
  Result:
  - listing.status = "rejected"
  - listing.rejectionReason = "..."
  - listing.updatedAt = now()
  - Seller sees "Bị từ chối" with reason
  - Seller can edit (PM-011) and resubmit (PM-012)
  ```

**UI Features (Admin):**
- ✅ Quick action buttons (Green "Duyệt" + Red "Từ chối")
- ✅ Reject dialog với validation (min 10 characters)
- ✅ Confirmation prompt before approve
- ✅ Inline rejection reason display
- ✅ Success/error alerts
- ✅ Filter by status, dealType, search

---

## 📋 PERMISSION MATRIX

### **Role-Permission Mapping:**

| Permission | Code | Guest | Buyer | Seller | Admin | Description |
|-----------|------|-------|-------|--------|-------|-------------|
| View Public | PM-001 | ✅ | ✅ | ✅ | ✅ | Xem tin approved |
| Search | PM-002 | ✅ | ✅ | ✅ | ✅ | Tìm kiếm, lọc |
| Create | PM-010 | ❌ | ❌ | ✅ | ✅ | Tạo tin mới |
| Edit | PM-011 | ❌ | ❌ | ✅ | ✅ | Sửa tin của mình |
| Publish | PM-012 | ❌ | ❌ | ✅ | ✅ | Gửi duyệt |
| Archive | PM-013 | ❌ | ❌ | ✅ | ✅ | Ẩn tin |
| Delete | PM-014 | ❌ | ❌ | ✅ | ✅ | Xóa tin |
| Review | PM-070 | ❌ | ❌ | ❌ | ✅ | Duyệt/Từ chối (Admin only) |

**Total by Role:**
- **Guest:** 2 permissions
- **Buyer:** 2 permissions  
- **Seller:** 7 permissions
- **Admin:** 8 permissions (ALL)

---

## 🔄 COMPLETE USER JOURNEY

### **Journey 1: Seller tạo & Admin duyệt tin**

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: SELLER CREATES LISTING                              │
└─────────────────────────────────────────────────────────────┘
    Seller login → /sell/new
         │
         ▼ (PM-010: CREATE_LISTING)
    Fill form: title, price, facets, location
         │
         ▼
    Submit: POST /api/v1/listings
         │
         ▼
    Created: status = "draft" or "pending_review"
         │
         ▼
    Redirect: /sell/my-listings
    
┌─────────────────────────────────────────────────────────────┐
│ Step 2: SELLER PUBLISHES (if draft)                        │
└─────────────────────────────────────────────────────────────┘
    Seller sees listing in "Tin nháp" (draft)
         │
         ▼ (PM-012: PUBLISH_LISTING)
    Click "Gửi duyệt" button
         │
         ▼
    Status: "draft" → "pending_review"
         │
         ▼
    Admin notification: New listing pending
    
┌─────────────────────────────────────────────────────────────┐
│ Step 3: ADMIN REVIEWS                                       │
└─────────────────────────────────────────────────────────────┘
    Admin login → /admin/listings
         │
         ▼ (PM-070: ADMIN_REVIEW_LISTING)
    View listings with status = "pending_review"
         │
         ├─────────────┬─────────────┐
         ▼             ▼             ▼
    View details   Filter        Search
                                     │
                    ┌────────────────┴────────────────┐
                    ▼                                 ▼
            ┌──────────────┐                 ┌──────────────┐
            │   APPROVE    │                 │    REJECT    │
            └──────────────┘                 └──────────────┘
                    │                                 │
                    ▼                                 ▼
            Click "Duyệt"                    Click "Từ chối"
                    │                                 │
                    ▼                                 ▼
            Confirm dialog                   Enter reason (min 10 chars)
                    │                                 │
                    ▼                                 ▼
            API: approved                    API: rejected + reason
                    │                                 │
                    ▼                                 ▼
            Success alert                    Success alert
    
┌─────────────────────────────────────────────────────────────┐
│ Step 4: SELLER SEES RESULT                                  │
└─────────────────────────────────────────────────────────────┘
    Seller visits /sell/my-listings
         │
         ├────────────────┬────────────────┐
         ▼                ▼                ▼
    If APPROVED:    If REJECTED:     If PENDING:
         │                │                │
         ▼                ▼                ▼
    Badge: "Đã duyệt"  Badge: "Bị từ chối"  Badge: "Chờ duyệt"
    Status: approved   + Rejection reason   Status: pending
         │                │                      │
         ▼                ▼                      ▼
    Visible in       Can EDIT (PM-011)      Wait for admin
    /listings        Can RESUBMIT (PM-012)
                     Can DELETE (PM-014)
```

### **Journey 2: Seller quản lý tin đã duyệt**

```
┌─────────────────────────────────────────────────────────────┐
│ SELLER MANAGES APPROVED LISTING                             │
└─────────────────────────────────────────────────────────────┘
    Listing status: "approved"
    Visible in public /listings
         │
         ├─────────────────┬─────────────────┐
         ▼                 ▼                 ▼
    ┌─────────┐      ┌─────────┐      ┌─────────┐
    │ PM-011  │      │ PM-013  │      │ PM-014  │
    │  EDIT   │      │ ARCHIVE │      │ DELETE  │
    └─────────┘      └─────────┘      └─────────┘
         │                 │                 │
         ▼                 ▼                 ▼
    Update info      Hide from public   Cannot delete
    (requires        (temp unavailable)  (must archive first)
     re-approval?)
```

---

## 🎯 STATUS FLOW DIAGRAM

```
                    LISTING STATUS LIFECYCLE
                              
    [CREATE]                                    
       │ (PM-010)
       ▼
   ┌────────┐
   │ DRAFT  │◄─────────┐
   └────────┘           │
       │                │ (PM-011: Edit)
       │ (PM-012)       │
       ▼                │
┌──────────────┐        │
│PENDING_REVIEW│────────┤
└──────────────┘        │
       │                │
       │ (PM-070)       │
       ├────────┬───────┘
       ▼        ▼
  ┌─────────┐ ┌─────────┐
  │APPROVED │ │REJECTED │
  └─────────┘ └─────────┘
       │           │
       │           │ (PM-011: Edit)
       │           │ (PM-012: Resubmit)
       │           │ (PM-014: Delete)
       │           └──────────────┐
       │                          │
       │ (PM-013)                 │
       ▼                          │
  ┌─────────┐                     │
  │ARCHIVED │                     │
  └─────────┘                     │
       │                          │
       │ (Unarchive)              │
       └──────────────────────────┘
                                  
  Legend:
  ─── Normal flow
  ··· Conditional flow
  (XX) Required permission
```

---

## 📊 API ENDPOINTS & PERMISSIONS

### **Public Endpoints (PM-001, PM-002):**
```
GET /api/v1/listings
  - Permission: PM-001 (VIEW_PUBLIC_LISTINGS)
  - Filter: status IN ('approved', 'active')
  - Query params: search, location, priceMin, priceMax, dealType
  - Returns: Public listings only
```

### **Seller Endpoints:**
```
POST /api/v1/listings
  - Permission: PM-010 (CREATE_LISTING)
  - Auth: Required (seller role)
  - Body: { title, description, price, facets, locationDepotId }
  - Creates: status = "pending_review"

PUT /api/v1/listings/:id
  - Permission: PM-011 (EDIT_LISTING)
  - Auth: Required (owner only)
  - Allowed statuses: draft, pending_review, rejected
  - Body: Updated fields

PUT /api/v1/listings/:id/publish
  - Permission: PM-012 (PUBLISH_LISTING)
  - Auth: Required (owner only)
  - Status change: draft → pending_review

PUT /api/v1/listings/:id/archive
  - Permission: PM-013 (ARCHIVE_LISTING)
  - Auth: Required (owner only)
  - Status change: approved → archived

DELETE /api/v1/listings/:id
  - Permission: PM-014 (DELETE_LISTING)
  - Auth: Required (owner only)
  - Allowed statuses: draft, rejected
```

### **Admin Endpoints:**
```
GET /api/v1/admin/listings
  - Permission: PM-070 (ADMIN_REVIEW_LISTING)
  - Auth: Required (admin role)
  - Returns: All listings (any status)
  - Filters: status, dealType, search

PUT /api/v1/admin/listings/:id/status
  - Permission: PM-070 (ADMIN_REVIEW_LISTING)
  - Auth: Required (admin role)
  - Body: { status: "approved" } OR { status: "rejected", reason: "..." }
  - Updates: listing.status, listing.rejectionReason
```

---

## ✅ VERIFICATION CHECKLIST

### **Database:**
- [x] 8 permissions exist (PM-001, 002, 010-014, 070)
- [x] Admin role has all 8 permissions
- [x] Seller role has 7 permissions (no PM-070)
- [x] Buyer role has 2 permissions (PM-001, 002)
- [x] rejectionReason column exists in listings table

### **Backend:**
- [x] POST /api/v1/listings (PM-010)
- [x] PUT /api/v1/listings/:id (PM-011)
- [x] PUT /api/v1/admin/listings/:id/status (PM-070)
- [x] Permission checks in middleware
- [x] Role-based authorization

### **Frontend:**
- [x] /sell/new uses PM-010
- [x] /sell/my-listings uses PM-011
- [x] /admin/listings uses PM-070
- [x] Quick action buttons (Approve/Reject)
- [x] Reject dialog with validation
- [x] Inline rejection reason display

### **Code:**
- [x] middleware.ts updated with PM-XXX
- [x] rbac.ts updated with PM-XXX
- [x] No legacy permissions in active code
- [x] Permission mapper created

---

## 🎉 SUMMARY

**Số lượng permissions THỰC TẾ: 8** (không phải 13)

**Phân loại:**
- **Public:** 2 permissions (PM-001, PM-002)
- **Seller:** 5 permissions (PM-010 to PM-014)
- **Admin:** 1 permission (PM-070)

**Legacy permissions (5) KHÔNG tồn tại trong DB:**
- listings.read ❌
- listings.write ❌
- listings.delete ❌
- listings.approve ❌
- listings.moderate ❌

**Workflow hoàn chỉnh:**
1. ✅ Guest view & search (PM-001, PM-002)
2. ✅ Seller create & manage (PM-010 to PM-014)
3. ✅ Admin review & moderate (PM-070)

**Trạng thái:** ✅ **HOÀN CHỈNH & HOẠT ĐỘNG ĐÚNG**
