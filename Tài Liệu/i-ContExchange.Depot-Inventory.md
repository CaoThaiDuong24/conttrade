# ĐẶC TẢ QUẢN LÝ TỒN KHO DEPOT — i‑ContExchange

Mã tài liệu: DEPOT-STOCK-SPEC-v1.0  
Ngày: 2025-09-22  
Ngôn ngữ: Tiếng Việt

Tài liệu này bổ sung đầy đủ, chi tiết và nhất quán với các đặc tả hiện có về nghiệp vụ quản lý tồn kho tại Depot (nhập–xuất–tồn), truy vấn tồn theo điều kiện (hãng tàu/owner, loại/size, tiêu chuẩn, tình trạng…), báo cáo theo kỳ, và tích hợp với các chứng từ vận hành (EDO/EIR/Delivery). Phần này mở rộng “Nhóm E — Giám định & Depot” đã có.

Tham chiếu quy ước chung & thuật ngữ: xem `i-ContExchange.Conventions-Glossary.md`.  
Tham chiếu API/DB/UI hiện có: `i-ContExchange.API.md`, `i-ContExchange.Database.md`, `i-ContExchange.UI.md`, `i-ContExchange.Screens.md`, `i-ContExchange.Workflow.md`, `i-ContExchange.Roles-Permissions.md`.

---

## 1. Mục tiêu & Phạm vi

- Cung cấp khả năng “quản lý kho” ở Depot cho container: ghi nhận nhập (IN), xuất (OUT), chuyển kho (TRANSFER), và tồn hiện tại (ONHAND).
- Truy vấn tồn theo Depot, hãng tàu/owner (owner_org_id), loại/size, tiêu chuẩn (WWT/CW/IICL), tình trạng (new/used), năm sản xuất, v.v.
- Báo cáo nhập–xuất theo kỳ (theo ngày/tháng) và tồn đầu–cuối kỳ, tuổi tồn (aging), và đối chiếu phí lưu bãi theo ngày (liên quan FE-E04, Phase 2).
- Tương thích với luồng chứng từ hiện tại: EDO/DO (WF-011), EIR (WF-013), Delivery (G01..G03).

Không nằm trong phạm vi: hoạch định kho bãi chi tiết theo vị trí ô/bãi (bin/slot), tối ưu xếp dỡ (có thể là phạm vi DMS chuyên sâu, Phase 3).

---

## 2. Thuật ngữ & Quy ước

- ONHAND: Tồn kho hiện tại tại một Depot (= IN lũy kế − OUT lũy kế, có xét TRANSFER).  
- Movement: Bút toán di chuyển kho: IN | OUT | TRANSFER (từ Depot A → Depot B).  
- Owner/Hãng tàu: ánh xạ `containers.owner_org_id` → `orgs`.  
- Size/Type/Standard: theo các trường `containers.size_ft`, `type`, `quality_standard` và enum đã quy định.  
- Chứng từ tham chiếu: EIR (Phiếu giao nhận), EDO/DO (Lệnh giao hàng), Delivery (đặt xe & sự kiện giao).

---

## 3. Yêu cầu nghiệp vụ

### 3.1. Nhập–Xuất–Chuyển–Tồn

1) Khi EIR được phát hành “nhận vào Depot” (inbound), hệ thống ghi bút toán Movement = IN tại Depot đó.  
2) Khi container rời Depot (cấp EIR outbound/hoàn tất Delivery/áp dụng EDO), hệ thống ghi Movement = OUT.  
3) Khi chuyển nội bộ giữa các Depot trong hệ sinh thái: ghi 2 bút toán: OUT tại Depot nguồn, IN tại Depot đích (Movement = TRANSFER với tham chiếu song song).  
4) Tồn ONHAND tính tại thời điểm T dựa trên các Movement đến trước T; đồng bộ trường `containers.current_depot_id` để phản ánh vị trí hiện tại.

### 3.2. Truy vấn & báo cáo

- Xem tồn hiện tại (ONHAND) theo depot + bộ lọc: owner_org_id (hãng), size_ft, type, quality_standard, condition, manufactured_year…  
- Báo cáo nhập–xuất theo kỳ: tổng IN/OUT, tồn đầu kỳ, tồn cuối kỳ, Net flow, chi tiết theo owner/size/standard.  
- Aging: nhóm số ngày tồn (0–7, 8–14, 15–30, 31–60, >60).  
- Xuất CSV.

### 3.3. Điều chỉnh & an toàn dữ liệu

- Cho phép “điều chỉnh tồn” (manual adjustment) khi phát hiện sai lệch, bắt buộc ghi rõ lý do, tài liệu chứng minh, và audit.  
- Quyền chỉnh sửa chặt chẽ (vai trò Depot Manager/Admin); mặc định deny-by-default.

---

## 4. Mô hình dữ liệu (DB) — bổ sung

Tham chiếu `i-ContExchange.Database.md`. Bổ sung bảng mới và chỉ mục phục vụ hiệu năng.

### 4.1. Bảng `depot_stock_movements`

Mục đích: làm “sổ cái kho” (stock ledger) để tính nhập–xuất–tồn và báo cáo theo kỳ.

Các cột (đề xuất):

- id UUID PK  
- container_id UUID NOT NULL → containers.id  
- depot_id UUID NOT NULL → depots.id  
- movement_type TEXT ENUM('IN','OUT','TRANSFER') NOT NULL  
- direction TEXT ENUM('IN','OUT') NOT NULL  
- ref_doc_type TEXT ENUM('EIR','EDO','DELIVERY','MANUAL','OTHER')  
- ref_doc_id UUID NULL  
- reason TEXT NULL (ví dụ: inbound via EIR, outbound delivery, transfer to depot B, manual adjustment)  
- occurred_at timestamptz NOT NULL (thời điểm hiệu lực)  
- created_by UUID → users.id  
- created_at timestamptz DEFAULT now()

Chỉ mục & ràng buộc:  
- INDEX (depot_id, occurred_at), INDEX (container_id, occurred_at) để báo cáo nhanh theo kỳ.  
- CHECK: movement_type IN ('IN','OUT','TRANSFER'); direction phù hợp với movement (TRANSFER ghi hai dòng: OUT depot A, IN depot B).  
- RLS: bật RLS, chỉ Depot Staff/Manager/Admin truy cập trong scope depot tương ứng.

### 4.2. Đồng bộ với `containers.current_depot_id`

- Sau khi ghi movement OUT: nếu không có IN kế tiếp, `current_depot_id` có thể set NULL (tùy quy ước).  
- Sau khi ghi movement IN: update `current_depot_id` = depot_id.

### 4.3. Views gợi ý

- `vw_depot_onhand` (depot_id, container_filters…, onhand_count) — tính bằng COUNT container join theo movement mới nhất +/− hoặc đếm trực tiếp theo `containers.current_depot_id`.  
- `vw_depot_kpi_period` (from, to, depot_id, in_qty, out_qty, opening, closing, net).

---

## 5. API (REST v1) — mở rộng Nhóm E (Giám định & Depot)

Tham chiếu `i-ContExchange.API.md`. Bổ sung các endpoint sau (mã mới liên tục với E01..E05):

- API-E06 GET `/api/v1/depots/{id}/stock`
  - Mục đích: Truy vấn tồn ONHAND theo bộ lọc.  
  - Quyền: PM-083 (DEPOT_VIEW_STOCK) trong scope depot.
  - Query: owner_org_id?, size_ft?, type?, quality_standard?, condition?, year_from?, year_to?, page, limit, sort.
  - 200: { items: [{ container_id, owner_org_id, size_ft, type, quality_standard, condition, manufactured_year }], total }

- API-E07 GET `/api/v1/depots/{id}/stock-movements`
  - Mục đích: Truy vấn nhật ký IN/OUT/TRANSFER theo kỳ.  
  - Quyền: PM-084 (DEPOT_VIEW_MOVEMENTS) — mới.
  - Query: from, to, movement_type?, owner_org_id?, container_id?, page, limit, sort=occurred_at:desc.

- API-E08 POST `/api/v1/depots/{id}/stock-adjustments`
  - Mục đích: Điều chỉnh tồn (ghi movement MANUAL IN/OUT).  
  - Quyền: PM-085 (DEPOT_ADJUST_STOCK) — mới; chỉ Depot Manager/Admin.
  - Body (schema: `schemas/api/depot.stockAdjustment.create.schema.json`): { container_id, direction: 'IN'|'OUT', reason, occurred_at }
  - 201: movement { id }

- API-E09 GET `/api/v1/depots/{id}/stock-report`
  - Mục đích: Báo cáo nhập–xuất–tồn theo kỳ & phân nhóm (owner/size/standard).  
  - Quyền: PM-083 hoặc PM-084 tùy phạm vi.
  - Query: from, to, group_by=owner|size|standard|none, export=csv?

- API-E10 POST `/api/v1/depots/transfers`
  - Mục đích: Chuyển nội bộ giữa các Depot (ghi OUT tại A, IN tại B).  
  - Quyền: PM-086 (DEPOT_TRANSFER_STOCK) — mới.
  - Body (schema: `schemas/api/depot.transfer.create.schema.json`): { container_id, from_depot_id, to_depot_id, reason?, occurred_at }
  - 201: { movements: [{ out_id }, { in_id }] }

Lưu ý idempotency: Với các POST E08/E10, hỗ trợ header `Idempotency-Key`.

### 5.1. JSON Schemas (định nghĩa hợp đồng)

Đặt tại `schemas/api/` (tham chiếu tài liệu Schemas README):

- `depot.stock.query.schema.json` — cho API-E06: bộ lọc hợp lệ.  
- `depot.stockMovements.query.schema.json` — cho API-E07.  
- `depot.stockAdjustment.create.schema.json` — cho API-E08.  
- `depot.stockReport.query.schema.json` — cho API-E09.  
- `depot.transfer.create.schema.json` — cho API-E10.

Các schema dùng draft-07, camelCase theo quy ước API.

---

## 6. Workflow (WF) — bổ sung

Tham chiếu `i-ContExchange.Workflow.md`. Bổ sung các mã WF liên tục sau WF-026:

- WF-027: Ghi Movement IN khi container vào Depot (inbound EIR)  
  - ACT: Depot Staff, Platform  
  - TRG: EIR inbound issued  
  - OUT: movement IN (occurred_at = thời điểm EIR), update `containers.current_depot_id`.

- WF-028: Ghi Movement OUT khi container rời Depot  
  - ACT: Depot Staff/Carrier, Platform  
  - TRG: EIR outbound/Delivery booked & picked up/EDO  
  - OUT: movement OUT, cập nhật `containers.current_depot_id` (NULL hoặc depot đích nếu transfer).

- WF-029: Chuyển nội bộ giữa các Depot (TRANSFER)  
  - ACT: Depot Manager  
  - TRG: Yêu cầu chuyển  
  - OUT: movement OUT tại depot A và IN tại depot B, có cặp ref lẫn nhau.

- WF-030: Truy vấn tồn ONHAND & lọc nâng cao  
  - ACT: Depot Staff/Manager  
  - OUT: lưới dữ liệu lọc theo owner/size/standard/condition.

- WF-031: Báo cáo nhập–xuất–tồn theo kỳ & Aging  
  - ACT: Depot Manager/Admin  
  - OUT: số liệu opening/in/out/closing, phân nhóm (owner/size/standard), xuất CSV.

- WF-032: Điều chỉnh tồn (Manual Adjustment)  
  - ACT: Depot Manager/Admin  
  - OUT: movement MANUAL (IN/OUT) kèm lý do + audit.

SLA khuyến nghị (Phụ lục C trong Workflow):  
- Ghi movement: ≤ 1 phút từ thời điểm chứng từ phát sinh.  
- Truy vấn tồn: P95 ≤ 300ms với bộ lọc cơ bản.

---

## 7. Vai trò & Quyền (RBAC)

Tham chiếu `i-ContExchange.Roles-Permissions.md`. Bổ sung các permission mới:

- PM-084 DEPOT_VIEW_MOVEMENTS — Xem nhật ký movement (scope: depot).  
- PM-085 DEPOT_ADJUST_STOCK — Điều chỉnh tồn (scope: depot).  
- PM-086 DEPOT_TRANSFER_STOCK — Chuyển nội bộ giữa các Depot (scope: global|org|depot tùy chính sách).

Vai trò gợi ý:  
- RL-DEPOT-STAFF: PM-083 (đã có), PM-084 (read).  
- RL-DEPOT-MANAGER: PM-083, PM-084, PM-085, PM-086.  
- RL-ADMIN: toàn quyền theo scope.

---

## 8. UI & Screens (Next.js)

Tham chiếu `i-ContExchange.UI.md` và `i-ContExchange.Screens.md`. Bổ sung màn hình:

- SCR-410 Tồn kho Depot (On-hand)
  - Route: `/depot/[depotId]/stock`
  - Thành phần: DataTable (UI-015), bộ lọc (owner/size/standard/condition), Export CSV, paging/sort.

- SCR-411 Nhật ký nhập–xuất (Movements)
  - Route: `/depot/[depotId]/stock-movements`
  - Thành phần: bộ lọc from–to, movement_type, container/owner; chi tiết cột occurred_at, ref_doc, reason.

- SCR-412 Báo cáo kỳ & Aging
  - Route: `/depot/[depotId]/stock-report`
  - Thành phần: form chọn kỳ, group_by; biểu đồ/tổng hợp (UI-015 + chart lib); Export CSV.

- SCR-413 Điều chỉnh tồn (Manual Adjustment)
  - Route: `/depot/[depotId]/stock-adjust`
  - Thành phần: form (container, direction IN/OUT, reason, occurred_at), cảnh báo & xác nhận; quyền PM-085.

UI/UX: tuân thủ i18n (`scr.depot.stock.*`), skeleton/loading, error state, và access guard theo permission.

---

## 9. Báo cáo & Câu truy vấn mẫu (gợi ý)

### 9.1. Tồn hiện tại theo Depot & bộ lọc

- Dựa trên `containers.current_depot_id = :depotId` và các điều kiện lọc: owner_org_id, size_ft, type, quality_standard…  
- Chỉ mục: `containers(current_depot_id, size_ft, quality_standard)`.

### 9.2. Báo cáo kỳ (opening, in, out, closing)

Pseudo-SQL:

```
opening = onhand(t = from - 1s)
in_qty = count(movement where direction = 'IN' and occurred_at ∈ [from, to])
out_qty = count(movement where direction = 'OUT' and occurred_at ∈ [from, to])
closing = opening + in_qty − out_qty
```

### 9.3. Aging

Tính ngày tồn = now() − max(ngày movement IN gần nhất) cho container đang onhand; nhóm theo thùng.

---

## 10. JSON Schemas (gợi ý rút gọn)

Ví dụ `schemas/api/depot.stockAdjustment.create.schema.json`:

```
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Depot Stock Adjustment Create",
  "type": "object",
  "properties": {
    "container_id": {"type": "string", "format": "uuid"},
    "direction": {"type": "string", "enum": ["IN","OUT"]},
    "reason": {"type": ["string","null"]},
    "occurred_at": {"type": "string", "format": "date-time"}
  },
  "required": ["container_id","direction","occurred_at"],
  "additionalProperties": false
}
```

---

## 11. NFR & Hiệu năng

- P95 truy vấn tồn ≤ 300ms, P99 ≤ 700ms với bộ lọc cơ bản; report kỳ có thể chạy nền nếu khối lượng lớn.  
- Index hóa theo truy vấn thực tế; partition theo thời gian cho `depot_stock_movements` nếu dữ liệu lớn.  
- RLS + audit: ghi `audit_logs` cho adjustment và transfer; idempotency cho POST.

---

## 12. Traceability Matrix (bổ sung)

- WF: WF-027..WF-032  
- FE: FE-E04 (lưu kho) liên quan phí, mở rộng FE-E* cho quản lý tồn; (mới) FE-DP01..DP04 (tùy chọn nội bộ)  
- RP: PM-083 (đã có), PM-084..PM-086 (mới)  
- SCR: SCR-410..413  
- DB: `depot_stock_movements`, views/report; liên quan `containers`, `depots`, `documents`, `deliveries`  
- API: E06..E10  
- UI: UI-015 (DataTable), UI-012 (Notification), tiện ích filter

---

## 13. Lộ trình triển khai đề xuất

1) Phase 1 (MVP kho): E06 (ONHAND), E07 (movements), DB `depot_stock_movements` + ghi tự động từ EIR/Delivery; SCR-410/411.  
2) Phase 2: E09 (report), aging, export CSV; SCR-412; tích phí lưu bãi (FE-E04).  
3) Phase 3: E08 (manual adjust), E10 (transfer), audit nâng cao, tích hợp DMS sâu và đồng bộ 2 chiều.

---

## 14. Ghi chú tương thích

- Không thay đổi quy ước đặt tên, chuẩn JSON/Schema (draft-07) và RBAC hiện hữu.  
- Hãng tàu được ánh xạ qua `owner_org_id` của `containers`; khi cần trình bày, hiển thị `orgs.name`.
