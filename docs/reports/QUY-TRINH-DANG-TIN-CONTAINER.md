# Quy Trình Đăng Tin Bán/Cho Thuê Container

Dựa trên tài liệu quy trình nghiệp vụ của hệ thống, dưới đây là các bước chi tiết để một Người Bán/Cho Thuê (Seller/Lessor) có thể đăng tải một tin mới về container lên sàn giao dịch.

### **Bước 1: Đăng nhập và Khởi tạo**
- Người dùng (vai trò Người Bán/Cho Thuê) đăng nhập vào tài khoản đã được xác thực.
- Từ trang quản trị cá nhân hoặc thanh điều hướng, chọn chức năng **"Đăng tin mới"**.

### **Bước 2: Chọn Loại Giao dịch**
- Hệ thống yêu cầu người dùng chọn một trong hai loại hình giao dịch:
  - **Bán Container**
  - **Cho thuê Container**

### **Bước 3: Điền Thông tin Chi tiết về Container**
- Người dùng cần hoàn thành một biểu mẫu (form) được chuẩn hóa với các trường thông tin bắt buộc và tùy chọn:
  - **Phân loại Container**: Lựa chọn từ danh sách (VD: Container khô, Container lạnh, Container văn phòng, Container chuyên dụng).
  - **Kích thước**: Chọn kích thước tiêu chuẩn (VD: 10ft, 20ft, 40ft, 40HC, 45ft).
  - **Tình trạng**: Chọn "Mới" hoặc "Đã qua sử dụng".
  - **Tiêu chuẩn chất lượng**: Chọn các tiêu chuẩn được công nhận (VD: Cargo Worthy (CW), Wind and Watertight (WWT), IICL).
  - **Vị trí**: Chọn từ danh sách Depot có sẵn hoặc nhập một địa chỉ cụ thể nơi container đang được lưu trữ.
  - **Giá**:
    - Nhập giá bán (đơn vị: VNĐ) nếu là giao dịch bán.
    - Nhập giá thuê và đơn vị thời gian (VD: VNĐ/ngày, VNĐ/tháng) nếu là giao dịch cho thuê.
  - **Mô tả chi tiết**: Một trường văn bản tự do để người dùng cung cấp thêm thông tin về lịch sử sử dụng, các sửa chữa đã thực hiện, hoặc bất kỳ đặc điểm riêng nào của container.

### **Bước 4: Tải lên Hình ảnh và Video**
- Đây là bước quan trọng để tăng tính minh bạch và tin cậy.
- Người dùng phải tải lên hình ảnh/video thực tế của container.
- **Yêu cầu**: Hình ảnh cần rõ nét, chụp từ nhiều góc độ khác nhau:
  - Toàn cảnh bên ngoài (4 mặt).
  - Bên trong container.
  - Sàn container.
  - Các chi tiết hư hỏng, móp méo, hoặc rỉ sét (nếu có).

### **Bước 5: Xem lại và Gửi tin**
- Trước khi hoàn tất, hệ thống hiển thị một trang tóm tắt toàn bộ thông tin đã nhập.
- Người dùng kiểm tra lại lần cuối và nhấn nút **"Gửi tin để kiểm duyệt"**.

### **Bước 6: Quy trình Kiểm duyệt của Quản trị viên**
- Tin đăng mới sẽ ở trạng thái "Chờ duyệt".
- **Quản trị viên Nền tảng (Platform Administrator)** sẽ nhận được thông báo và tiến hành kiểm tra:
  - Tính hợp lệ và đầy đủ của thông tin.
  - Tính trung thực của hình ảnh so với mô tả.
- **Kết quả kiểm duyệt**:
  - **Duyệt (Approve)**: Nếu tin đăng hợp lệ, Quản trị viên sẽ duyệt và tin sẽ được hiển thị công khai trên sàn giao dịch.
  - **Từ chối (Reject)**: Nếu thông tin không hợp lệ, thiếu sót hoặc sai sự thật, Quản trị viên sẽ từ chối và gửi thông báo cho người đăng, nêu rõ lý do cần chỉnh sửa.

### **Bước 7: Quản lý Tin đăng**
- Sau khi tin được đăng (hoặc bị từ chối), Người Bán/Cho Thuê có thể truy cập vào trang quản lý cá nhân để:
  - Xem trạng thái của tất cả các tin đã đăng (Chờ duyệt, Đã duyệt, Bị từ chối).
  - **Chỉnh sửa** lại thông tin của tin đăng.
  - **Tạm ẩn** tin đăng khỏi sàn giao dịch.
  - **Xóa** tin đăng vĩnh viễn.
