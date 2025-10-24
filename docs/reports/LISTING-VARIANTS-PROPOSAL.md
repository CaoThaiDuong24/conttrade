# Đề Xuất Nâng Cấp: Hỗ Trợ Nhiều Tình Trạng Container Trong Một Tin Đăng (Listing with Variants)

**Ngày tạo:** 23/10/2025
**Người đề xuất:** GitHub Copilot

## 1. Bối Cảnh và Vấn Đề

Hệ thống hiện tại được thiết kế theo mô hình **một-tin-đăng-cho-một-loại-sản-phẩm**. Điều này có nghĩa là mỗi tin đăng (listing) chỉ có thể đại diện cho một nhóm container có cùng đặc điểm (kích thước, loại, và quan trọng nhất là **tình trạng**).

**Vấn đề:**
Khi một người bán muốn bán một lô container có nhiều tình trạng khác nhau (ví dụ: 5 container "Cargo Worthy" và 5 container "As-Is"), họ buộc phải tạo nhiều tin đăng riêng biệt.

- **Bất tiện cho người bán:** Tốn thời gian, khó quản lý nhiều tin đăng cho cùng một lô hàng.
- **Trải nghiệm không tốt cho người mua:** Khó tìm và so sánh tất cả các lựa chọn từ cùng một người bán.

## 2. Phân Tích Kịch Bản Nghiệp Vụ (Mở Rộng)

Để làm rõ hơn, chúng ta sẽ phân tích hai kịch bản chính: một từ phía người bán và một từ phía người mua.

### 2.1. Kịch Bản Người Bán: Đăng Bán Một Lô Container Đa Dạng

**Tình huống:**
- **Người bán A** có một lô 50 container 20ft tại Cảng Hải Phòng.
- Lô hàng này không đồng nhất về chất lượng và được phân loại như sau:
  - **20 chiếc** tình trạng `Cargo Worthy (CW)` - giá **$2200/cont**.
  - **25 chiếc** tình trạng `Wind & Watertight (WWT)` - giá **$1800/cont**.
  - **5 chiếc** tình trạng `As-Is` (mua theo hiện trạng) - giá **$1300/cont**.

**Hành động với giải pháp "Listing with Variants":**
1.  Người bán A tạo **một tin đăng duy nhất** với tiêu đề "Bán lô 50 container 20ft tại Hải Phòng".
2.  Trong phần "Biến thể sản phẩm", người bán thêm 3 dòng:
    - **Biến thể 1:** Tình trạng: `Cargo Worthy`, Số lượng: `20`, Đơn giá: `$2200`.
    - **Biến thể 2:** Tình trạng: `Wind & Watertight`, Số lượng: `25`, Đơn giá: `$1800`.
    - **Biến thể 3:** Tình trạng: `As-Is`, Số lượng: `5`, Đơn giá: `$1300`.
3.  Người bán đăng tin. Toàn bộ lô hàng được quản lý tập trung trong một listing.

### 2.2. Kịch Bản Người Mua: Mua Lẻ Từ Nhiều Biến Thể

**Tình huống:**
- **Người mua B** xem tin đăng của Người bán A.
- Người mua B có nhu cầu đa dạng: cần một vài container chất lượng tốt để vận chuyển hàng hóa và một vài container cũ hơn để làm kho.
- Cụ thể, họ muốn mua:
  - **2 chiếc** tình trạng `Cargo Worthy (CW)`.
  - **3 chiếc** tình trạng `Wind & Watertight (WWT)`.

**Hành động với giải pháp "Listing with Variants":**
1.  Trên trang chi tiết sản phẩm, Người mua B thấy rõ các lựa chọn:
    | Tình trạng | Số lượng còn lại | Đơn giá | Số lượng mua |
    | :--- | :--- | :--- | :--- |
    | Cargo Worthy | 20 | $2200 | `[ ô nhập liệu ]` |
    | Wind & Watertight | 25 | $1800 | `[ ô nhập liệu ]` |
    | As-Is | 5 | $1300 | `[ ô nhập liệu ]` |
2.  Người mua B nhập số lượng mong muốn vào các ô tương ứng:
    - Nhập `2` vào ô "Số lượng mua" của dòng `Cargo Worthy`.
    - Nhập `3` vào ô "Số lượng mua" của dòng `Wind & Watertight`.
3.  Hệ thống tự động tính toán tổng giá trị đơn hàng (hoặc yêu cầu báo giá):
    - `(2 * $2200) + (3 * $1800) = $4400 + $5400 = $9800`.
4.  Người mua B tiến hành yêu cầu báo giá hoặc đặt hàng. Yêu cầu này sẽ chứa thông tin chi tiết về 2 loại sản phẩm họ đã chọn.

**Kết quả:**
- **Người bán A** nhận được một yêu cầu báo giá/đơn hàng rõ ràng, chi tiết cho 5 container từ lô hàng của mình.
- **Hệ thống tự động cập nhật số lượng còn lại:**
  - `Cargo Worthy`: 20 - 2 = 18 chiếc còn lại.
  - `Wind & Watertight`: 25 - 3 = 22 chiếc còn lại.
- Tin đăng vẫn hoạt động với số lượng đã được cập nhật, sẵn sàng cho người mua tiếp theo.

---

## 3. Đề Xuất Giải Pháp: "Listing with Variants"

Để giải quyết vấn đề này, chúng tôi đề xuất nâng cấp hệ thống để hỗ trợ khái niệm **"biến thể sản phẩm" (Product Variants)** ngay trong một tin đăng.

### 3.1. Ý Tưởng Cốt Lõi

Cho phép một `listing` chứa nhiều **biến thể (variants)**, mỗi biến thể có **tình trạng (condition)**, **số lượng (quantity)**, và **đơn giá (price)** riêng.

### 3.2. Thay Đổi Cấu Trúc Dữ Liệu (Backend)

**Bảng `listings`:**
- Giữ nguyên cấu trúc hiện tại. Bảng này sẽ đại diện cho thông tin chung của sản phẩm (ví dụ: "Container 20ft Standard", địa điểm, mô tả chung).
- Có thể xem xét loại bỏ các trường `quantity`, `price_amount`, `condition` khỏi bảng này nếu chúng được chuyển hoàn toàn sang `listing_variants`.

**Tạo bảng mới `listing_variants`:**
Bảng này sẽ lưu trữ thông tin chi tiết cho từng nhóm container trong một tin đăng.

| Tên cột | Kiểu dữ liệu | Mô tả | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Khóa chính | |
| `listing_id` | `UUID` | Khóa ngoại, liên kết đến `listings.id` | Bắt buộc |
| `condition` | `String` | Tình trạng của nhóm container | `CW`, `WWT`, `AS-IS`, v.v. |
| `quantity` | `Int` | Số lượng container cho biến thể này | |
| `price_amount` | `Decimal` | Đơn giá cho mỗi container trong biến thể này | |
| `price_currency` | `String` | Loại tiền tệ (ví dụ: `USD`) | |
| `created_at` | `DateTime` | Thời gian tạo | |
| `updated_at` | `DateTime` | Thời gian cập nhật | |

### 3.3. Luồng Hoạt Động Mới (Frontend & Backend)

**1. Tạo/Cập Nhật Tin Đăng:**
- **Giao diện:** Trang tạo/chỉnh sửa tin đăng cần được cập nhật.
  - Thay vì một trường `quantity` và `price` duy nhất, sẽ có một khu vực "Biến thể sản phẩm".
  - Người bán có thể "Thêm biến thể", sau đó chọn `Tình trạng`, nhập `Số lượng` và `Đơn giá`.
  - Giao diện cho phép thêm, sửa, xóa nhiều dòng biến thể.
- **Backend:**
  - API `POST /listings` và `PUT /listings/:id` cần được cập nhật để nhận một mảng các đối tượng `variants`.
  - Khi tạo/cập nhật listing, backend sẽ xử lý logic để tạo/cập nhật các bản ghi tương ứng trong bảng `listing_variants`.

**2. Hiển Thị Chi Tiết Tin Đăng:**
- **Giao diện:**
  - Trang chi tiết sản phẩm sẽ hiển thị thông tin chung từ bảng `listings`.
  - Thay vì hiển thị một mức giá duy nhất, trang sẽ hiển thị một bảng hoặc danh sách các biến thể có sẵn. Mỗi dòng bao gồm: Tình trạng, Giá, Số lượng còn lại.
  - Người mua có thể nhập số lượng muốn mua cho từng biến thể.
- **Backend:**
  - API `GET /listings/:id` cần trả về thông tin của listing kèm theo một mảng `variants` liên quan.

**3. Tạo Báo Giá (Quote) và Đơn Hàng (Order):**
- Khi người mua yêu cầu báo giá hoặc đặt hàng, dữ liệu gửi lên backend sẽ bao gồm thông tin chi tiết về các biến thể và số lượng được chọn.
- Backend sẽ dựa vào đó để tạo các mục (line items) trong báo giá/đơn hàng, đảm bảo tính đúng đắn về giá và số lượng cho từng loại tình trạng.

## 4. Lợi Ích Của Giải Pháp

- **Tối ưu cho người bán:** Quản lý tập trung, giảm thiểu công sức đăng bán.
- **Trải nghiệm tốt hơn cho người mua:** Dễ dàng so sánh các lựa chọn và đưa ra quyết định mua hàng nhanh chóng.
- **Tăng tính chính xác:** Giảm thiểu nhầm lẫn về giá và tình trạng khi tạo báo giá và đơn hàng.
- **Nền tảng linh hoạt:** Dễ dàng mở rộng để hỗ trợ thêm các thuộc tính khác trong tương lai (ví dụ: màu sắc, năm sản xuất) mà không cần thay đổi lớn về cấu trúc.

## 5. Kế Hoạch Triển Khai (Gợi ý)

1.  **Giai đoạn 1: Backend**
    - Cập nhật Prisma schema: Thêm model `ListingVariant`.
    - Chạy migration để tạo bảng mới trong database.
    - Cập nhật các API endpoint liên quan đến `listings` (create, update, get).
2.  **Giai đoạn 2: Frontend**
    - Cập nhật giao diện trang tạo/chỉnh sửa tin đăng.
    - Cập nhật giao diện trang chi tiết tin đăng.
    - Cập nhật luồng yêu cầu báo giá và đặt hàng.
3.  **Giai đoạn 3: Kiểm thử và Hoàn thiện**
    - Viết test case cho các luồng nghiệp vụ mới.
    - Thu thập phản hồi từ người dùng thử và tinh chỉnh.

## 6. Phân Tích Chi Tiết Thông Tin Cần Thiết Theo Tình Trạng Container

Để tăng cường sự tin tưởng và cung cấp đầy đủ thông tin cho người mua, mỗi "biến thể" không chỉ nên có `Tình trạng`, `Số lượng`, `Giá`. Tùy vào tình trạng, người bán cần cung cấp thêm các thông tin chuyên sâu.

Dưới đây là phân tích các trường thông tin quan trọng cho từng loại tình trạng container:

### 6.1. Container Mới 100% (New)

Đối với container mới, người mua quan tâm đến chất lượng từ nhà sản xuất và các tiêu chuẩn kỹ thuật.

**Thông tin cần thiết:**
- **`Năm sản xuất (Year of Manufacture)`**: Bắt buộc, là yếu tố khẳng định "mới".
- **`Nhà sản xuất (Manufacturer)`**: Tên thương hiệu sản xuất (ví dụ: CIMC, Singamas) để đánh giá chất lượng.
- **`Giấy chứng nhận (Certificates)`**: Các giấy tờ đi kèm như chứng nhận chất lượng từ nhà máy (Factory Certificate), báo cáo kiểm định chất lượng (Quality Inspection Report).
- **`Tấm biển CSC (CSC Plate)`**: Thông tin chi tiết trên tấm biển CSC (Container Safety Convention), xác nhận container đủ tiêu chuẩn vận hành quốc tế.
- **`Chế độ bảo hành (Warranty)`**: Thông tin bảo hành từ nhà sản xuất (nếu có).

### 6.2. Container Đã Tân Trang (Refurbished)

Với container tân trang, người mua muốn biết rõ về "lịch sử" của container và chất lượng của công việc tân trang.

**Thông tin cần thiết:**
- **`Năm sản xuất gốc (Original Year of Manufacture)`**: Để biết tuổi đời thực của khung sườn container.
- **`Ngày tân trang (Date of Refurbishment)`**: Cho biết công việc sửa chữa mới được thực hiện khi nào.
- **`Chi tiết công việc đã làm (Refurbishment Details)`**: Danh sách hoặc mô tả các hạng mục đã được xử lý. Ví dụ:
  - *Sơn mới toàn bộ (loại sơn gì?)*
  - *Thay sàn gỗ mới (độ dày bao nhiêu?)*
  - *Sửa chữa các vết móp, thủng.*
  - *Thay gioăng cửa (door gasket).*
- **`Bảo hành sau tân trang (Post-Refurbishment Warranty)`**: Thời gian bảo hành cho các hạng mục đã sửa chữa (ví dụ: bảo hành 12 tháng không bị thấm, dột).
- **`Hình ảnh Trước & Sau (Before & After Photos)`**: Cực kỳ hữu ích để người mua thấy được sự khác biệt và chất lượng công việc.

### 6.3. Container Đã Qua Sử Dụng (Used)

Đây là loại phổ biến nhất. Người mua cần thông tin chi tiết để đánh giá rủi ro và mức độ hao mòn.

**Thông tin cần thiết:**
- **`Năm sản xuất (Year of Manufacture)`**: Yếu tố quan trọng nhất để xác định tuổi thọ.
- **`Phân loại chất lượng (Condition Grade)`**: Ngoài các tình trạng chung như `CW`, `WWT`, có thể cần các phân loại chi tiết hơn (ví dụ: IICL-5, UCIRC).
- **`Báo cáo kiểm định gần nhất (Latest Inspection Report)`**: Nếu có một báo cáo từ một đơn vị kiểm định độc lập thì sẽ rất giá trị.
- **`Lịch sử sử dụng (Usage History)`**: Nếu biết (thường khó), ví dụ: "chỉ dùng chở hàng khô", "từng chở hàng đông lạnh".
- **`Hình ảnh chi tiết (Detailed Photos)`**: Rất quan trọng. Cần có hình ảnh chụp rõ các góc cạnh:
  - *Bên trong và bên ngoài.*
  - *Các vết móp, rỉ sét (nếu có).*
  - *Sàn container.*
  - *Trần container.*
  - *Cửa và bộ phận khóa.*
  - *Gioăng cửa (để kiểm tra độ kín).*

### 6.4. Container Hư Hỏng (Damaged / As-Is)

Với loại này, sự minh bạch về mức độ hư hỏng là chìa khóa. Người mua thường là các đơn vị có khả năng tự sửa chữa hoặc dùng vào mục đích không yêu cầu độ kín.

**Thông tin cần thiết:**
- **`Mô tả chi tiết hư hỏng (Detailed Damage Description)`**: Mô tả rõ ràng và định vị các hư hỏng. Ví dụ:
  - *"Thủng một lỗ 10x15cm ở vách trái."*
  - *"Sàn gỗ bị gãy ở gần cửa."*
  - *"Cửa bên phải bị cong, không đóng kín được."*
- **`Hình ảnh chụp cận cảnh hư hỏng (Close-up Photos of Damage)`**: Chụp rõ từng điểm hư hỏng đã mô tả.
- **`Ước tính chi phí sửa chữa (Estimated Repair Cost)`**: Nếu người bán có kinh nghiệm, việc đưa ra một ước tính chi phí sửa chữa (không bắt buộc) có thể giúp người mua ra quyết định nhanh hơn.
- **`Ghi chú "Bán theo hiện trạng" (As-Is Note)`**: Cần có một ghi chú rõ ràng rằng container được bán "nguyên trạng" và người bán không chịu trách nhiệm bảo hành hay sửa chữa sau khi giao dịch.

### Đề xuất cập nhật cấu trúc `listing_variants`

Để lưu trữ các thông tin bổ sung này, có hai hướng:
1.  **Thêm nhiều cột mới:** Thêm các cột như `year_of_manufacture`, `refurbishment_details`, v.v. vào bảng `listing_variants`. (Ít linh hoạt)
2.  **Sử dụng cột JSONB:** Thêm một cột `attributes` kiểu `JSONB`. Cột này sẽ chứa một đối tượng JSON với các cặp key-value tương ứng với thông tin cần thiết cho từng tình trạng. (Linh hoạt và dễ mở rộng nhất)

**Ví dụ với cột `attributes` (JSONB):**
- **Biến thể "Tân trang":**
  ```json
  {
    "original_year": 2010,
    "refurbishment_date": "2025-09-15",
    "refurbishment_details": "New paint, new floor, new door seals.",
    "warranty": "6 months for water leaks"
  }
  ```
- **Biến thể "Hư hỏng":**
  ```json
  {
    "year_of_manufacture": 2005,
    "damage_description": "Hole on left panel (10x15cm), floorboards broken near door.",
    "as_is_note": "Sold as-is, no warranty."
  }
  ```
Giải pháp dùng JSONB được khuyến nghị vì tính linh hoạt của nó.

## 7. Mở Rộng Phân Tích cho Kịch Bản Cho Thuê Container (Leasing)

Mô hình "Listing with Variants" hoàn toàn có thể mở rộng để áp dụng cho cả kịch bản cho thuê container. Tuy nhiên, việc cho thuê có những đặc thù riêng về mặt thông tin và cấu trúc giá.

### 7.1. Sự Khác Biệt Chính Giữa Bán và Cho Thuê

- **Bán (Sale):** Giao dịch một lần, chuyển giao quyền sở hữu vĩnh viễn. Giá được tính trên mỗi đơn vị sản phẩm.
- **Cho Thuê (Lease):** Giao dịch có thời hạn, không chuyển giao quyền sở hữu. Giá được tính theo đơn vị thời gian (ngày, tháng). Kèm theo đó là các điều khoản về đặt cọc, bảo hiểm và điều kiện trả lại.

### 7.2. Tác Động Đến Cấu Trúc Dữ Liệu

Để hỗ trợ cả hai kịch bản, chúng ta cần một vài điều chỉnh:

**1. Bảng `listings`:**
- Thêm một cột `deal_type` để phân biệt rõ ràng giữa tin bán và tin cho thuê.
  - `deal_type`: `ENUM('SALE', 'LEASE')`

**2. Bảng `listing_variants`:**
- Cột `price_amount` cần được hiểu theo ngữ cảnh của `deal_type`.
  - Nếu `deal_type` là `SALE`, `price_amount` là giá bán.
  - Nếu `deal_type` là `LEASE`, `price_amount` là giá cho thuê (ví dụ: giá thuê theo ngày).
- Cần thêm các thông tin đặc thù cho việc cho thuê. Giải pháp tốt nhất vẫn là sử dụng cột `attributes` (JSONB).

### 7.3. Thông Tin Cần Thiết cho Biến Thể "Cho Thuê"

Khi người bán đăng tin cho thuê, mỗi biến thể (dựa trên tình trạng container) cần có các thông tin sau:

- **`Đơn giá cho thuê (Lease Rate)`**: Cần ghi rõ đơn vị thời gian. Ví dụ: `$5/ngày` hoặc `$120/tháng`.
  - `price_amount`: 5
  - `price_currency`: USD
  - `attributes.lease_period`: "day"
- **`Thời gian thuê tối thiểu (Minimum Lease Term)`**: Điều khoản bắt buộc. Ví dụ: "30 ngày", "6 tháng".
  - `attributes.min_lease_term`: "30 days"
- **`Tiền đặt cọc (Security Deposit)`**: Số tiền người thuê phải cọc để đảm bảo cho các hư hỏng có thể xảy ra.
  - `attributes.security_deposit`: 500
- **`Điều khoản bảo hiểm (Insurance Requirements)`**: Ghi rõ người thuê có cần mua bảo hiểm cho container hay không.
  - `attributes.insurance_required`: true/false
- **`Phí Giao/Nhận (Drop-off/Pick-up Fees)`**: Chi phí vận chuyển container đến địa điểm của người thuê và chi phí lấy về sau khi hết hạn thuê.
  - `attributes.delivery_fee`: 150
  - `attributes.pickup_fee`: 150
- **`Điều kiện khi trả container (Return Conditions)`**: Mô tả tình trạng yêu cầu của container khi người thuê trả lại (ví dụ: "sạch sẽ, không rác", "sơn lại nếu có hư hỏng").
  - `attributes.return_conditions`: "Must be returned clean and empty."

### 7.4. Cập Nhật Luồng Hoạt Động

- **Giao diện tìm kiếm/đăng tin:**
  - Người bán khi đăng tin sẽ chọn "Loại giao dịch": `Bán` hoặc `Cho Thuê`.
  - Tùy vào lựa chọn này, form nhập thông tin cho các biến thể sẽ hiển thị các trường tương ứng (giá bán hoặc giá thuê/ngày, tiền cọc, v.v.).
  - Người mua có thể lọc kết quả tìm kiếm theo `Bán` hoặc `Cho Thuê`.
- **Trang chi tiết sản phẩm:**
  - Nếu là tin cho thuê, giao diện sẽ hiển thị rõ ràng giá thuê theo ngày/tháng, tiền cọc và các điều khoản khác.
  - Người mua sẽ chọn số lượng, thời gian dự kiến thuê để gửi yêu cầu.
- **Backend:**
  - Logic tạo báo giá/hợp đồng sẽ phân nhánh dựa trên `deal_type`.
  - Hợp đồng cho thuê sẽ phức tạp hơn, bao gồm ngày bắt đầu, ngày kết thúc, các điều khoản đã nêu.

Việc mở rộng này giúp nền tảng trở nên toàn diện hơn, đáp ứng được cả hai nhu cầu lớn nhất trên thị trường container.
