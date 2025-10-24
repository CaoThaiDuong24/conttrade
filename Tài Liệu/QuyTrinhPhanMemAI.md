#  **QUY TRÌNH TIÊU CHUẨN PHÁT TRIỂN PHẦN MỀM TÍCH HỢP TRÍ TUỆ NHÂN TẠO (AI-DRIVEN SDLC)**

| Tên tài liệu | Quy Trình Tiêu Chuẩn Phát Triển Phần Mềm Tích Hợp AI |
| :---- | :---- |
| **Mã tài liệu** | QT-PTMN-AI-V1.2 |
| **Phiên bản** | 1.2 |
| **Ngày ban hành** | 23/09/2025 |
| **Tình trạng** | Chính thức |

## **CHƯƠNG 1: TỔNG QUAN**

### **1.1. Mục đích**

Tài liệu này quy định quy trình, tiêu chuẩn và trách nhiệm cho các hoạt động phát triển phần mềm tại công ty, với việc tích hợp sâu rộng các công cụ Trí tuệ nhân tạo (AI) như Large Language Models (LLMs) và các trợ lý lập trình (AI Coding Assistants).

Mục tiêu là:

* **Tối ưu hóa hiệu suất:** Tăng tốc độ phân tích, thiết kế, lập trình và kiểm thử.  
* **Đảm bảo chất lượng:** Giảm thiểu sai sót do con người, đảm bảo tính nhất quán và đồng bộ trên toàn dự án.  
* **Chuẩn hóa tài liệu:** Tạo ra các bộ tài liệu dự án đầy đủ, chi tiết và là "Nguồn chân lý duy nhất" (Single Source of Truth) cho mọi giai đoạn.

### **1.2. Phạm vi áp dụng**

Quy trình này được áp dụng bắt buộc cho tất cả các dự án phát triển phần mềm mới tại công ty.

### **1.3. Nguyên tắc cốt lõi**

1. **Con người duyệt, AI thực thi (Human-in-the-Loop):** AI là một trợ lý cao cấp. Mọi sản phẩm do AI tạo ra (tài liệu, CSDL, mã nguồn) phải được nhân sự có chuyên môn (Kiến trúc sư, Trưởng nhóm Kỹ thuật) rà soát, tinh chỉnh và phê duyệt trước khi chuyển sang giai đoạn tiếp theo.  
2. **Tài liệu là "Nguồn chân lý duy nhất" (Single Source of Truth):** Mỗi giai đoạn sẽ tạo ra một bộ tài liệu "đóng băng" (frozen). Giai đoạn sau phải tuân thủ tuyệt đối tài liệu của giai đoạn trước.  
3. **Quản lý thay đổi nghiêm ngặt (Strict Change Management):** Mọi yêu cầu thay đổi bắt buộc phải được đánh giá tác động và thực hiện lại từ Giai đoạn 1 (Phân tích & Thiết kế) để đảm bảo tính nhất quán trên toàn hệ thống.  
4. **Kỹ năng Prompt Engineering là chìa khóa:** Chất lượng đầu ra của AI phụ thuộc trực tiếp vào chất lượng câu lệnh (prompt). Toàn bộ nhân sự tham gia dự án phải được đào tạo để xây dựng các prompt chi tiết, rõ ràng và đầy đủ ngữ cảnh.

### **1.4. Công cụ áp dụng**

* **AI Phân tích & Thiết kế:** Google Gemini, OpenAI ChatGPT-4, hoặc các LLM tương đương.  
* **AI Hỗ trợ Lập trình:** Github Copilot.  
* **Quản lý phiên bản:** Git.  
* **Quản lý dự án:** Jira / Trello hoặc công cụ tương đương.

## **CHƯƠG 2: CÁC GIAI ĐOẠN CỦA QUY TRÌNH**

### **GIAI ĐOẠN 1: PHÂN TÍCH & THIẾT KẾ**

* **Mục tiêu:** Tạo ra bộ tài liệu đặc tả hệ thống hoàn chỉnh, chi tiết và nhất quán tuyệt đối. Bộ tài liệu này là nền tảng cho toàn bộ dự án.  
* **Đầu vào:** Yêu cầu ban đầu từ khách hàng/Product Owner.  
* **Nhân sự chịu trách nhiệm:** Business Analyst, Solution Architect.  
* **Vai trò của AI:** Hệ thống hóa yêu cầu, tạo các bản nháp tài liệu, vẽ biểu đồ, đề xuất cấu trúc, thiết kế CSDL và API.

#### **Các bước thực hiện & Đầu ra tương ứng:**

1. **Xây dựng Đặc tả Yêu cầu Phần mềm (SRS):**  
   * *Thực hiện:* Đưa yêu cầu thô vào LLM để phân tích, phân loại thành yêu cầu chức năng, phi chức năng và viết thành tài liệu SRS chuẩn.  
   * *Prompt mẫu:* "Bạn hãy đóng vai trò là một Business Analyst chuyên nghiệp. Dựa vào bản mô tả yêu cầu dự án thô sau đây: \[Dán toàn bộ yêu cầu thô của khách hàng vào đây\]. Hãy phân tích và viết lại thành một tài liệu Đặc tả Yêu cầu Phần mềm (SRS) hoàn chỉnh theo chuẩn IEEE 830\. Tài liệu cần phân rõ các mục: Yêu cầu chức năng, Yêu cầu phi chức năng (hiệu năng, bảo mật, khả năng mở rộng), và các ràng buộc hệ thống."  
   * *Đầu ra:* **DOC-SRS-1.0** \- Tài liệu Đặc tả Yêu cầu Phần mềm.  
2. **Mô tả Workflows & Nghiệp vụ:**  
   * *Thực hiện:* Yêu cầu LLM dựa trên DOC-SRS-1.0 để xây dựng tất cả các luồng nghiệp vụ dưới dạng biểu đồ (Mermaid syntax) và mô tả chi tiết.  
   * *Prompt mẫu:* "Từ tài liệu DOC-SRS-1.0 đã cung cấp, hãy xác định và mô tả chi tiết luồng nghiệp vụ '\[Tên luồng nghiệp vụ, ví dụ: Quy trình đặt hàng trực tuyến\]'. Hãy tạo ra một biểu đồ flowchart bằng Mermaid syntax để minh họa luồng này, sau đó diễn giải chi tiết từng bước trong biểu đồ. Đánh mã workflow này là WF-xxx."  
   * *Đầu ra:* **DOC-WF-1.0** \- Tài liệu Mô tả Luồng nghiệp vụ.  
3. **Mô tả Tính năng & Chức năng:**  
   * *Thực hiện:* Từ mỗi workflow trong DOC-WF-1.0, yêu cầu LLM phân rã thành các tính năng (features) và chức năng (functions) chi tiết.  
   * *Prompt mẫu:* "Dựa vào workflow WF-001: Quy trình đặt hàng trực tuyến, hãy phân rã thành một danh sách các tính năng (features) chính. Với mỗi tính năng, hãy tiếp tục chia nhỏ thành các chức năng (functions) cụ thể. Ví dụ: Tính năng 'Quản lý giỏ hàng' có các chức năng 'Thêm sản phẩm vào giỏ', 'Xóa sản phẩm khỏi giỏ', 'Cập nhật số lượng'. Hãy đánh mã theo quy tắc F-xxx cho tính năng và F-xxx.yy cho chức năng."  
   * *Đầu ra:* **DOC-FUNC-1.0** \- Tài liệu Mô tả Tính năng.  
4. **Xác định Người dùng, Vai trò & Phân quyền:**  
   * *Thực hiện:* Dựa vào DOC-FUNC-1.0, yêu cầu LLM đề xuất các vai trò người dùng và tạo ma trận phân quyền chi tiết.  
   * *Prompt mẫu:* "Dựa vào danh sách chức năng trong tài liệu DOC-FUNC-1.0, hãy đề xuất các nhóm người dùng (Roles) phù hợp cho hệ thống này (ví dụ: Quản trị viên, Nhân viên bán hàng, Khách hàng). Sau đó, tạo một ma trận phân quyền dưới dạng bảng Markdown. Các hàng là danh sách chức năng (mã F-xxx.yy), các cột là các vai trò đã đề xuất. Đánh dấu 'X' vào ô tương ứng nếu vai trò đó có quyền truy cập chức năng."  
   * *Đầu ra:* **DOC-AUTH-1.0** \- Tài liệu Phân quyền & Vai trò người dùng.  
5. **Thiết kế Tham số Cấu hình Hệ thống:**  
   * *Thực hiện:* Yêu cầu LLM rà soát toàn bộ tài liệu và liệt kê tất cả các yếu tố có thể cấu hình bởi Admin để tăng tính linh hoạt cho hệ thống.  
   * *Prompt mẫu:* "Với mục tiêu giúp quản trị viên (Admin) có thể tùy chỉnh hệ thống tối đa mà không cần can thiệp mã nguồn, hãy rà soát toàn bộ tài liệu DOC-SRS-1.0 và DOC-FUNC-1.0 và đề xuất một danh sách các tham số hệ thống có thể cấu hình được. Ví dụ: Số sản phẩm trên mỗi trang, thời gian timeout của phiên đăng nhập, mẫu email thông báo, v.v."  
   * *Đầu ra:* **DOC-CONFIG-1.0** \- Tài liệu Tham số Cấu hình Hệ thống.  
6. **Đặc tả Chi tiết Màn hình:**  
   * *Thược hiện:* Cho mỗi chức năng yêu cầu tương tác người dùng, yêu cầu LLM mô tả chi tiết các thành phần trên màn hình (UI components, fields, buttons...).  
   * *Prompt mẫu:* "Dựa vào chức năng F-001.01: Thêm sản phẩm vào giỏ hàng, hãy đặc tả chi tiết cho màn hình SCR-001: Chi tiết sản phẩm. Mô tả cần bao gồm: (1) Danh sách các thành phần giao diện (UI components) như hình ảnh sản phẩm, tên, giá, mô tả. (2) Các trường nhập liệu (input fields) như ô nhập số lượng. (3) Các nút bấm (buttons) như 'Thêm vào giỏ hàng', 'Mua ngay'. (4) Luồng xử lý khi người dùng tương tác với từng thành phần."  
   * *Đầu ra:* **DOC-SCREEN-1.0** \- Tài liệu Đặc tả Màn hình.  
7. **Thiết kế Cơ sở dữ liệu (PostgreSQL):**  
   * *Thực hiện:* Cung cấp toàn bộ tài liệu nghiệp vụ cho LLM để thiết kế schema CSDL. Nhấn mạnh việc tách các bảng Master Data.  
   * *Prompt mẫu:* "Bạn hãy đóng vai trò là một Database Architect. Dựa vào các tài liệu DOC-WF-1.0 và DOC-FUNC-1.0, hãy thiết kế một sơ đồ CSDL quan hệ tối ưu cho PostgreSQL. Yêu cầu: (1) Xác định tất cả các bảng, các trường với kiểu dữ liệu phù hợp, khóa chính, khóa ngoại. (2) Đặc biệt chú trọng tách các dữ liệu có thể trở thành Master Data/Danh mục (ví dụ: danh mục tỉnh/thành, trạng thái đơn hàng) ra các bảng riêng. (3) Xuất kết quả dưới dạng script SQL DDL để tạo bảng."  
   * *Đầu ra:* **DOC-DB-1.0** \- Tài liệu Thiết kế CSDL.  
8. **Đặc tả API Backend (C\#, .NET):**  
   * *Thực hiện:* Với mỗi màn hình và chức năng, yêu cầu LLM tạo đặc tả API chi tiết theo chuẩn OpenAPI 3.0.  
   * *Prompt mẫu:* "Dựa trên màn hình SCR-001 và chức năng F-001.01, hãy viết đặc tả API chi tiết cho hành động 'Thêm sản phẩm vào giỏ hàng' theo chuẩn OpenAPI 3.0. API sẽ được xây dựng bằng C\# .NET. Đặc tả cần bao gồm: (1) Endpoint (ví dụ: POST /api/cart/items). (2) Mô tả request body (DTO) chi tiết. (3) Các HTTP status code có thể trả về (ví dụ: 200, 400, 401, 500\) và cấu trúc response body tương ứng cho từng trường hợp."  
   * *Đầu ra:* **DOC-API-1.0** \- Tài liệu Đặc tả API.  
9. **Đặc tả Giao diện & Trải nghiệm Người dùng (UI/UX \- Next.js):**  
   * *Thực hiện:* Yêu cầu LLM đề xuất Design System, mô tả các quy tắc về responsive, đa ngôn ngữ.  
   * *Prompt mẫu:* "Hãy đề xuất một Design System cơ bản cho dự án của chúng tôi (sử dụng Next.js và Tailwind CSS). Yêu cầu: (1) Một bảng màu hiện đại, có đủ các biến cho chế độ sáng và tối. (2) Quy định về typography (font-family, size, weight). (3) Quy tắc về responsive design cho 3 breakpoint chính: mobile, tablet, desktop. (4) Cấu trúc thư mục và quy tắc để hỗ trợ đa ngôn ngữ, với Tiếng Việt là mặc định."  
   * *Đầu ra:* **DOC-UIUX-1.0** \- Tài liệu Đặc tả UI/UX.

**Kết thúc giai đoạn:** Toàn bộ 9 bộ tài liệu trên được phê duyệt và "đóng băng". Chúng trở thành đầu vào bắt buộc cho các giai đoạn sau.

### **GIAI ĐOẠN 2: HIỆN THỰC CƠ SỞ DỮ LIỆU**

* **Mục tiêu:** Tạo ra CSDL vật lý hoàn chỉnh, khớp 100% với thiết kế và chứa đầy đủ dữ liệu khởi tạo.  
* **Đầu vào:** DOC-DB-1.0.  
* **Nhân sự chịu trách nhiệm:** Database Administrator, Backend Developer.  
* **Vai trò của AI:** Tạo script, sinh dữ liệu mẫu (seed data) logic, hỗ trợ đối chiếu.

#### **Các bước thực hiện:**

1. **Tạo Cấu trúc CSDL:**  
   * *Thực hiện:* Chạy script DDL từ DOC-DB-1.0 để tạo CSDL và các bảng.  
2. **Tạo Dữ liệu Khởi tạo (Seed Data):**  
   * *Thực hiện:* Yêu cầu LLM tạo các script SQL để chèn dữ liệu mẫu (ít nhất 20 bản ghi/bảng).  
   * *Prompt mẫu:* "Từ schema của bảng Products và Users trong DOC-DB-1.0, hãy viết một script SQL (PostgreSQL) để chèn 20 bản ghi dữ liệu mẫu (mock data) vào mỗi bảng. Dữ liệu phải logic, đa dạng và bao quát các kiểu dữ liệu khác nhau trong bảng."  
3. **Kiểm tra & Đối chiếu:**  
   * *Thực hiện:* Sử dụng công cụ để xuất schema từ CSDL vừa tạo và so sánh với thiết kế.  
   * *Prompt mẫu:* "Dưới đây là hai schema CSDL dưới dạng DDL. Schema A là thiết kế ban đầu, Schema B là schema được export từ CSDL thực tế. Hãy so sánh và chỉ ra mọi điểm khác biệt giữa chúng, bao gồm khác biệt về tên bảng, tên trường, kiểu dữ liệu, constraints, và indexes. \[Dán Schema A\] \[Dán Schema B\]"  
4. **Tinh chỉnh và Hoàn thiện:**  
   * *Thực hiện:* Nếu có khác biệt, cập nhật lại CSDL. Lặp lại bước 3 cho đến khi schema thực tế khớp 100% với thiết kế.

**Đầu ra:** CSDL đã được triển khai và sẵn sàng kết nối.

### **GIAI ĐOẠN 3: HIỆN THỰC BACKEND & API**

* **Mục tiêu:** Xây dựng toàn bộ logic nghiệp vụ phía server và các API một cách chi tiết, hiệu quả, tuân thủ nghiêm ngặt đặc tả và đảm bảo chất lượng thông qua kiểm thử và review.  
* **Đầu vào:** DOC-API-1.0, DOC-FUNC-1.0, DOC-DB-1.0, CSDL đã hoàn thiện.  
* **Nhân sự chịu trách nhiệm:** Backend Developer, Tech Lead.  
* **Vai trò của AI:** Hỗ trợ phân rã công việc, viết mã nguồn, tạo unit test & integration test, review và tối ưu hóa code.

#### **Các bước thực hiện:**

1. **Lập Kế hoạch và Phân rã Công việc:**  
   * *Thực hiện:* Dựa trên danh sách API trong DOC-API-1.0, Trưởng nhóm Kỹ thuật phân rã công việc thành các task nhỏ cho từng API hoặc cụm chức năng.  
   * *Prompt mẫu:* "Dựa trên tài liệu DOC-API-1.0, hãy phân rã công việc hiện thực backend cho cụm chức năng 'Quản lý Đơn hàng' (bao gồm API-005, API-006, API-007) thành các task chi tiết trên Jira/Trello. Ví dụ: 'Task 1: Tạo DTOs và Models cho Order', 'Task 2: Implement Logic cho API-005 Create Order', 'Task 3: Viết Unit Test cho Order Service', 'Task 4: Implement API-006 Get Order Details'."  
2. **Hiện thực API và Logic nghiệp vụ:**  
   * *Thực hiện:* Lập trình viên nhận task và tập trung hiện thực dứt điểm từng API/Module. Sử dụng Github Copilot để tăng tốc độ viết code dựa trên đặc tả.  
   * *Prompt mẫu (dưới dạng comment trong code cho Github Copilot):*  
     // Based on DOC-API-1.0 (API-005: Create Order)  
     // This method should:  
     // 1\. Validate the input Order DTO.  
     // 2\. Check product availability in stock.  
     // 3\. Calculate the total price.  
     // 4\. Save the new order to the database.  
     // 5\. Return the created order with a 201 status code.  
     \[HttpPost\]  
     public async Task\<IActionResult\> CreateOrder(\[FromBody\] CreateOrderDto orderDto)  
     {  
         // Github Copilot will generate the code here  
     }

3. **Viết Unit Test và Integration Test:**  
   * *Thực hiện:* Sau khi hoàn thành logic cho một API, lập trình viên phải viết các bài kiểm thử tương ứng. Unit test để kiểm tra từng hàm, integration test để kiểm tra luồng hoạt động của API từ đầu đến cuối (request \-\> logic \-\> database).  
   * *Prompt mẫu (Unit Test):* "Hãy viết các unit test bằng xUnit và Moq cho phương thức CreateOrder ở trên. Các test case cần bao gồm: (1) Trường hợp thành công với dữ liệu hợp lệ. (2) Trường hợp thất bại khi DTO không hợp lệ. (3) Trường hợp thất bại khi sản phẩm không đủ tồn kho."  
   * *Prompt mẫu (Integration Test):* "Hãy viết một kịch bản integration test cho endpoint POST /api/orders sử dụng .NET Test Host. Kịch bản cần: (1) Chuẩn bị dữ liệu trong test database. (2) Gửi một HTTP request hợp lệ đến endpoint. (3) Xác thực rằng HTTP response trả về status 201 và dữ liệu trong database đã được tạo chính xác."  
4. **Review, Tối ưu hóa Code và Kiểm thử thủ công:**  
   * *Thực hiện:* Lập trình viên tạo Pull Request (PR) để Trưởng nhóm review. Sử dụng AI để hỗ trợ rà soát code tìm lỗi tiềm ẩn hoặc các điểm cần tối ưu. Sau khi PR được duyệt, kiểm thử lại API bằng công cụ (Postman, Insomnia) để đảm bảo không có lỗi phát sinh.  
   * *Prompt mẫu (Code Review):* "Hãy đóng vai trò là một Senior Developer. Dưới đây là một đoạn code C\# cho chức năng tạo đơn hàng. Hãy review và chỉ ra các vấn đề tiềm ẩn về hiệu năng, bảo mật, khả năng đọc hiểu và đề xuất cách cải thiện. \[Dán đoạn code vào đây\]"  
5. **Cập nhật Tài liệu và Báo cáo:**  
   * *Thực hiện:* Sau khi một cụm chức năng hoàn tất, sử dụng công cụ (Swagger) để tự động tạo tài liệu từ code. Đối chiếu và cập nhật lại DOC-API-1.0 nếu có bất kỳ thay đổi nào so với thiết kế ban đầu. Viết báo cáo hoàn thành.  
   * *Prompt mẫu:* "Dưới đây là đặc tả API ban đầu (DOC-API-1.0) và file swagger.json được tạo tự động từ code. Hãy so sánh chúng và cập nhật lại phần mô tả (description) trong DOC-API-1.0 để phản ánh chính xác và chi tiết hơn những gì đã được hiện thực trong code. \[Dán nội dung DOC-API-1.0\] \[Dán nội dung swagger.json\]"

**Đầu ra:** Toàn bộ mã nguồn backend đã được review và kiểm thử, các API hoạt động ổn định, tài liệu API được cập nhật chính xác.

### **GIAI ĐOẠN 4: HIỆN THỰC FRONTEND**

* **Mục tiêu:** Xây dựng giao diện người dùng hoàn chỉnh, tối ưu trải nghiệm và tương tác chính xác với backend qua API, đảm bảo từng màn hình được hoàn thiện một cách độc lập và chất lượng cao.  
* **Đầu vào:** DOC-SCREEN-1.0, DOC-UIUX-1.0, DOC-API-1.0 (đã cập nhật), DOC-AUTH-1.0, DOC-WF-1.0.  
* **Nhân sự chịu trách nhiệm:** Frontend Developer, UI/UX Designer.  
* **Vai trò của AI:** Hỗ trợ tạo danh mục màn hình, luồng điều hướng, đặc tả kỹ thuật chi tiết, phân rã công việc, và viết mã nguồn.

#### **Các bước thực hiện:**

1. **Xây dựng Danh mục Màn hình và Luồng Điều hướng:**  
   * *Thực hiện:* Dựa trên các tài liệu phân tích, yêu cầu AI tạo ra một danh sách đầy đủ các màn hình và một biểu đồ mô tả luồng di chuyển của người dùng giữa các màn hình đó.  
   * *Prompt mẫu:* "Dựa vào DOC-WF-1.0 (Luồng nghiệp vụ) và DOC-SCREEN-1.0 (Đặc tả màn hình), hãy thực hiện hai việc: (1) Tạo một danh sách đầy đủ tất cả các màn hình cần hiện thực, gán mã SCR-xxx cho mỗi màn hình. (2) Xây dựng một biểu đồ luồng điều hướng người dùng (User Flow) bằng Mermaid syntax, thể hiện sự tương tác và cách chuyển đổi qua lại giữa các màn hình này."  
   * *Đầu ra:* **DOC-FE-FLOW-1.0** \- Tài liệu Danh mục Màn hình và Luồng điều hướng.  
2. **Tạo Đặc tả Kỹ thuật Chi tiết cho Từng Màn hình:**  
   * *Thực hiện:* Với mỗi màn hình trong danh mục, yêu cầu AI tạo ra một bản đặc tả kỹ thuật cực kỳ chi tiết, phục vụ trực tiếp cho lập trình viên.  
   * *Prompt mẫu:* "Với màn hình SCR-005: Form đặt hàng, hãy tạo một tài liệu đặc tả kỹ thuật chi tiết cho lập trình viên Frontend. Tài liệu cần bao gồm các mục sau: (1) Danh sách các UI component tái sử dụng (từ Design System) và các component mới cần tạo. (2) Mô tả chi tiết từng luồng logic trên màn hình (ví dụ: logic validation form, công thức tính toán tổng tiền tự động). (3) Liệt kê chính xác các API endpoint (từ DOC-API-1.0) được sử dụng, kèm theo mô tả dữ liệu request và cách xử lý response. (4) Ghi rõ các vai trò người dùng (từ DOC-AUTH-1.0) được phép truy cập và tương tác với màn hình này."  
   * *Đầu ra:* **DOC-SCREEN-TECH-1.0** \- Tài liệu Đặc tả Kỹ thuật Màn hình.  
3. **Lập Kế hoạch Coding và Phân rã Công việc:**  
   * *Thực hiện:* Dựa trên đặc tả kỹ thuật, yêu cầu AI phân rã công việc hiện thực một màn hình thành các task nhỏ, dễ quản lý.  
   * *Prompt mẫu:* "Dựa trên tài liệu DOC-SCREEN-TECH-1.0 cho màn hình SCR-005, hãy phân rã công việc hiện thực màn hình này thành các task nhỏ hơn để tạo trên Jira/Trello. Ví dụ: 'Task 1: Dựng layout cơ bản với các component có sẵn', 'Task 2: Implement logic validate cho form', 'Task 3: Tích hợp API GET để lấy danh sách sản phẩm', 'Task 4: Tích hợp API POST để gửi đơn hàng', 'Task 5: Xử lý trạng thái loading và thông báo lỗi/thành công'."  
4. **Hiện thực và Báo cáo (theo từng màn hình):**  
   * *Thực hiện:* Lập trình viên tập trung hiện thực dứt điểm từng màn hình theo phương châm "xong và tốt nhất". Sử dụng Github Copilot để tăng tốc quá trình viết mã.  
   * *Prompt mẫu (dưới dạng comment trong code cho Github Copilot):*  
     // Based on DOC-SCREEN-TECH-1.0 (SCR-005: Order Form).  
     // This component handles the order creation form.  
     // It fetches product list using API-010 and submits the form data using API-005.  
     // Form validation logic must be strictly implemented as described.  
     export default function OrderForm() {  
       // Github Copilot will generate the code here  
     }

   * Sau khi hoàn thành một màn hình (code, tự kiểm tra, review), lập trình viên viết báo cáo hoàn thành.  
   * *Prompt mẫu (cho báo cáo):* "Hãy viết một báo cáo ngắn gọn về việc hoàn thành màn hình SCR-005. Báo cáo cần có các nội dung: (1) Trạng thái: Hoàn thành. (2) Các chức năng đã được hiện thực theo đúng đặc tả. (3) Link tới Pull Request để review code. (4) Các ghi chú đặc biệt (nếu có)."

**Đầu ra:** Toàn bộ mã nguồn frontend, hệ thống có thể tương tác được, kèm theo các tài liệu DOC-FE-FLOW-1.0, DOC-SCREEN-TECH-1.0 và báo cáo hoàn thành cho từng màn hình.

### **GIAI ĐOẠN 5: KIỂM THỬ TOÀN DIỆN**

* **Nhân sự chịu trách nhiệm:** QA/QC Engineer.  
* **Vai trò của AI:** Hỗ trợ lập kế hoạch kiểm thử, viết kịch bản kiểm thử, tạo script kiểm thử tự động.

#### **Các bước thực hiện:**

1. **Lập Kế hoạch Kiểm thử (Test Plan):**  
   * *Prompt mẫu:* "Dựa trên DOC-SRS-1.0 và DOC-FUNC-1.0, hãy tạo một bản Kế hoạch Kiểm thử (Test Plan) tổng thể. Kế hoạch cần nêu rõ: mục tiêu, phạm vi, các loại hình kiểm thử sẽ thực hiện (Integration, System, Performance), môi trường kiểm thử, và tiêu chí pass/fail."  
2. **Viết Kịch bản Kiểm thử (Test Case):**  
   * *Prompt mẫu:* "Dựa trên chức năng F-002.01: Đăng nhập vào hệ thống, hãy viết các kịch bản kiểm thử (Test Case) chi tiết dưới dạng bảng. Các cột bao gồm: ID, Mô tả, Các bước thực hiện, Dữ liệu đầu vào, Kết quả mong đợi. Hãy bao gồm cả trường hợp thành công, thất bại (sai mật khẩu), và trường hợp biên (tên đăng nhập/mật khẩu chứa ký tự đặc biệt)."  
3. **Thực hiện Kiểm thử:**  
   * **Kiểm thử Tích hợp (Integration Testing):** Đảm bảo Frontend, Backend và CSDL giao tiếp chính xác.  
   * **Kiểm thử Hệ thống (System Testing):** Thực hiện toàn bộ test case trên môi trường Staging. Ghi nhận và báo cáo lỗi (bug).  
   * **Kiểm thử Chấp nhận của Người dùng (UAT):** Tổ chức buổi cho người dùng cuối kiểm thử và xác nhận.  
4. **Kiểm thử Tự động (Automation Testing):**  
   * *Prompt mẫu:* "Hãy viết một script kiểm thử tự động bằng Playwright (sử dụng TypeScript) cho luồng nghiệp vụ 'Đăng nhập thành công'. Script cần thực hiện các bước: (1) Mở trang đăng nhập. (2) Tìm và điền email, mật khẩu. (3) Nhấn nút đăng nhập. (4) Kiểm tra xem đã chuyển hướng đến trang dashboard và có hiển thị tên người dùng hay không."

**Đầu ra:** Báo cáo kiểm thử, danh sách lỗi đã được khắc phục, hệ thống sẵn sàng để triển khai.

### **GIAI ĐOẠN 6: TRIỂN KHAI & VẬN HÀNH**

* **Nhân sự chịu trách nhiệm:** DevOps Engineer, System Admin.  
* **Vai trò của AI:** Hỗ trợ viết script CI/CD, tạo file cấu hình.

#### **Các bước thực hiện:**

1. **Thiết lập CI/CD:**  
   * *Prompt mẫu:* "Hãy viết một file cấu hình github-actions.yml cho một pipeline CI/CD. Pipeline này cần được kích hoạt khi có push vào nhánh main. Các bước bao gồm: (1) Checkout code. (2) Setup Node.js và .NET Core. (3) Build ứng dụng frontend (Next.js). (4) Build ứng dụng backend (.NET). (5) Chạy unit test cho cả frontend và backend. (6) (Tùy chọn) Deploy lên môi trường Staging."  
2. **Triển khai (Deployment):**  
   * *Thực hiện:* Triển khai ứng dụng lên môi trường Production.  
3. **Giám sát và Bảo trì:**  
   * *Thực hiện:* Cài đặt các công cụ giám sát, ghi log. Khi có yêu cầu thay đổi hoặc sửa lỗi, tuân thủ quy trình Quản lý Thay đổi.

**Đầu ra:** Hệ thống hoạt động trên môi trường Production.

## **CHƯƠNG 3: QUY TRÌNH QUẢN LÝ THAY ĐỔI**

1. **Tiếp nhận yêu cầu:** Mọi yêu cầu thay đổi (Change Request \- CR) phải được tạo và quản lý trên hệ thống.  
2. **Phân tích tác động:**  
   * *Thực hiện:* Business Analyst và Solution Architect sử dụng LLM để phân tích tác động của CR đến toàn bộ các tài liệu ở Giai đoạn 1\.  
   * *Prompt mẫu:* "Một yêu cầu thay đổi (CR) mới được đề xuất: '\[Mô tả chi tiết yêu cầu thay đổi, ví dụ: Thêm phương thức thanh toán bằng ví điện tử\]'. Dựa vào toàn bộ bộ tài liệu dự án đã có (DOC-SRS-1.0, DOC-WF-1.0, DOC-DB-1.0, DOC-API-1.0...), hãy phân tích và liệt kê tất cả các tài liệu và các mục cần phải cập nhật để đáp ứng yêu cầu này. Đánh giá sơ bộ mức độ ảnh hưởng (thấp, trung bình, cao) đến từng phần."  
3. **Phê duyệt:** CR được phê duyệt bởi cấp có thẩm quyền.  
4. **Thực hiện thay đổi:** Quay trở lại **Giai đoạn 1**, cập nhật lại bộ tài liệu tương ứng.  
5. **Lan truyền thay đổi:** Các giai đoạn sau (2, 3, 4, 5\) được thực hiện lại dựa trên các tài liệu đã được cập nhật để đảm bảo tính nhất quán.