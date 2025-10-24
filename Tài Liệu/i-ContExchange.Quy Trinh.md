# **TÀI LIỆU MÔ TẢ QUY TRÌNH NGHIỆP VỤ HỆ THỐNG SÀN GIAO DỊCH CONTAINER**

## **PHẦN I: TỔNG QUAN VÀ CÁC VAI TRÒ TRÊN HỆ THỐNG**

### **1.1. Mục đích tài liệu**

Tài liệu này mô tả chi tiết các luồng quy trình nghiệp vụ, các bước tương tác của người dùng và các hoạt động xử lý của hệ thống Sàn giao dịch Container. Mục tiêu là cung cấp một cái nhìn rõ ràng và toàn diện về cách thức vận hành của nền tảng, phục vụ cho các đội ngũ phát triển, vận hành và quản lý.

### **1.2. Các vai trò người dùng (User Roles)**

Hệ thống được thiết kế để phục vụ nhiều vai trò khác nhau, mỗi vai trò có các quyền hạn và luồng nghiệp vụ riêng:

* **Khách vãng lai (Guest):** Người dùng chưa đăng nhập, có thể xem thông tin, tìm kiếm container nhưng không thể thực hiện giao dịch.  
* **Người Mua/Thuê (Buyer/Lessee):** Người dùng đã đăng ký và xác thực tài khoản, có nhu cầu tìm kiếm, hỏi thông tin, đặt mua hoặc thuê container.  
* **Người Bán/Cho Thuê (Seller/Lessor):** Người dùng đã đăng ký và xác thực tài khoản, có nhu cầu đăng tin bán hoặc cho thuê container.  
* **Quản trị viên Nền tảng (Platform Administrator):** Đội ngũ quản lý sàn giao dịch, chịu trách nhiệm kiểm duyệt, quản lý người dùng, giải quyết tranh chấp và vận hành chung.  
* **Nhân viên Depot (Depot Staff):** Đội ngũ tại các Depot vật lý, chịu trách nhiệm thực hiện các dịch vụ giám định, sửa chữa, và quản lý kho bãi.

---

## **PHẦN II: CÁC QUY TRÌNH NGHIỆP VỤ CHÍNH**

### **QUY TRÌNH 1: QUẢN LÝ TÀI KHOẢN NGƯỜI DÙNG**

Quy trình này bao gồm tất cả các bước từ khi người dùng mới tiếp cận nền tảng cho đến khi họ có một tài khoản được xác thực và sẵn sàng giao dịch.

1.1. Đăng ký tài khoản 1

* **Bước 1:** Người dùng truy cập trang "Đăng ký".  
* **Bước 2:** Chọn loại tài khoản: "Cá nhân" hoặc "Doanh nghiệp".  
* **Bước 3:** Điền thông tin theo biểu mẫu:  
  * **Cá nhân:** Họ tên, số điện thoại, email, mật khẩu.  
  * **Doanh nghiệp:** Tên công ty, mã số thuế, người đại diện, số điện thoại, email công ty, mật khẩu.  
* **Bước 4:** Đọc và đồng ý với các điều khoản dịch vụ của nền tảng.  
* **Bước 5:** Hệ thống gửi một mã xác thực (OTP) qua email hoặc SMS đã đăng ký.  
* **Bước 6:** Người dùng nhập mã OTP để hoàn tất đăng ký ban đầu. Tài khoản được tạo ở trạng thái "Chưa xác thực".

1.2. Xác thực danh tính (eKYC/eKYB)  
Đây là bước bắt buộc để có thể đăng tin hoặc thực hiện giao dịch, nhằm xây dựng một cộng đồng đáng tin cậy.

* **Bước 1:** Sau khi đăng nhập, người dùng được điều hướng đến trang xác thực danh tính.  
* **Bước 2 (Đối với Cá nhân \- eKYC):** 2  
  * Chụp ảnh 2 mặt Căn cước công dân/Hộ chiếu. Công nghệ OCR tự động trích xuất thông tin.5  
  * Thực hiện xác thực người thật (liveness detection) bằng cách chụp ảnh selfie hoặc quay video ngắn theo hướng dẫn.  
  * Hệ thống AI so sánh khuôn mặt và thông tin, sau đó gửi yêu cầu xác thực cho Quản trị viên.  
* **Bước 3 (Đối với Doanh nghiệp \- eKYB):** 6  
  * Tải lên bản scan/ảnh chụp Giấy chứng nhận đăng ký doanh nghiệp.  
  * Hệ thống xác thực thông tin doanh nghiệp (tên, mã số thuế).  
  * Người đại diện pháp luật thực hiện quy trình eKYC như đối với cá nhân.  
* **Bước 4:** Quản trị viên Nền tảng xem xét và phê duyệt yêu cầu xác thực.  
* **Bước 5:** Sau khi được phê duyệt, tài khoản người dùng sẽ được gắn huy hiệu "Đã xác thực".

**1.3. Đăng nhập, Đăng xuất và Quản lý hồ sơ**

* **Đăng nhập:** Người dùng nhập email/số điện thoại và mật khẩu. Hệ thống có thể tích hợp tùy chọn đăng nhập qua các mạng xã hội.1  
* **Quên mật khẩu:** Người dùng nhập email/số điện thoại để nhận liên kết hoặc mã OTP đặt lại mật khẩu mới.  
* **Quản lý hồ sơ:** Người dùng có thể cập nhật thông tin liên hệ, thay đổi mật khẩu, quản lý địa chỉ và xem lịch sử giao dịch của mình.1

1.4. Quản trị viên Nền tảng (Admin): Khởi tạo/Đăng ký tài khoản (theo chuẩn vận hành)

Lưu ý: Tài khoản Admin không tự đăng ký công khai. Việc khởi tạo, phân quyền và mời tham gia chỉ do Super Admin/Chủ sở hữu nền tảng thực hiện nhằm đảm bảo kiểm soát và tuân thủ.

* **Bước 1: Đề nghị tạo tài khoản Admin**  
  * Đầu mối vận hành/nhân sự gửi yêu cầu (ticket) kèm thông tin: họ tên, email công vụ, số điện thoại, bộ phận, vai trò nghiệp vụ dự kiến.
* **Bước 2: Duyệt và phân quyền sơ bộ**  
  * Super Admin xem xét, chọn nhóm quyền phù hợp (ví dụ: Duyệt tin, Quản lý người dùng, Giải quyết tranh chấp, Quản trị hệ thống).  
  * Nguyên tắc tối thiểu quyền (Least Privilege) và tách biệt nhiệm vụ (SoD) được áp dụng.
* **Bước 3: Gửi thư mời (invite) và liên kết một lần**  
  * Hệ thống phát hành liên kết thiết lập tài khoản dùng một lần (thời hạn hiệu lực ngắn, ví dụ 24 giờ) tới email công vụ đã đăng ký.
* **Bước 4: Thiết lập ban đầu bởi Admin**  
  * Đặt mật khẩu đáp ứng chính sách mạnh (độ dài tối thiểu, độ phức tạp, không trùng mật khẩu cũ).  
  * Bật xác thực đa yếu tố (MFA) bắt buộc: ưu tiên TOTP (Authenticator) hoặc SMS/Email OTP dự phòng.  
  * Xác nhận số điện thoại và thiết lập phương thức khôi phục an toàn.  
  * Chấp thuận Điều khoản sử dụng nội bộ và Chính sách bảo mật/tuân thủ.
* **Bước 5: Kích hoạt và ghi nhận nhật ký**  
  * Sau khi hoàn tất, tài khoản ở trạng thái "Hoạt động".  
  * Toàn bộ sự kiện khởi tạo, kích hoạt, phân quyền được ghi nhận vào nhật ký kiểm toán (Audit Log).

1.5. Đăng nhập Admin và phiên làm việc an toàn

* **Bước 1: Đăng nhập**  
  * Nhập email công vụ và mật khẩu.  
  * Bắt buộc **MFA** ở mọi lần đăng nhập (TOTP ưu tiên; OTP dự phòng).  
  * Tùy chọn: ràng buộc địa chỉ IP (IP allowlist) hoặc thiết bị tin cậy theo chính sách an ninh.
* **Bước 2: Kiểm tra phiên và điều kiện tuân thủ**  
  * Giới hạn số phiên đồng thời theo người dùng/quyền.  
  * Hạn mức thời gian không tương tác (idle timeout) ngắn hơn tài khoản thường (ví dụ: 10–15 phút).  
  * Hết hạn phiên bắt buộc định kỳ (absolute timeout), yêu cầu xác thực lại.
* **Bước 3: Nhật ký và cảnh báo bảo mật**  
  * Ghi lại: đăng nhập thành công/thất bại, thay đổi quyền, sửa cấu hình, duyệt/từ chối nội dung, thao tác nhạy cảm.  
  * Cảnh báo bất thường: đăng nhập từ vị trí lạ, nhiều lần thất bại, vượt ngưỡng thao tác.
* **Bước 4: Đăng xuất chủ động**  
  * Admin có thể đăng xuất toàn cục khỏi mọi thiết bị.  
  * Hệ thống tự động đăng xuất khi hết hạn phiên hoặc khi phát hiện rủi ro.

1.6. Khôi phục truy cập và khoá/mở khoá tài khoản Admin

* **Quên mật khẩu (và vẫn có MFA):**  
  * Thực hiện quy trình đặt lại mật khẩu qua email công vụ và xác thực MFA.  
  * Chính sách mật khẩu mạnh được kiểm tra khi đặt mới.
* **Mất phương tiện MFA:**  
  * Quy trình khôi phục yêu cầu xác minh danh tính nâng cao và phê duyệt của Super Admin (hoặc 2 người có thẩm quyền trở lên theo SoD).  
  * Nhật ký khôi phục được ghi nhận, có thể yêu cầu chữ ký số hoặc xác minh qua kênh nội bộ.
* **Khóa/mở khóa tài khoản:**  
  * Tự động khóa khi vượt ngưỡng đăng nhập thất bại; mở khóa qua quy trình phê duyệt.  
  * Khóa bắt buộc khi nghi ngờ rò rỉ; yêu cầu đổi mật khẩu và bật lại MFA khi mở khóa.
* **Nguyên tắc tuân thủ:**  
  * Định kỳ rà soát quyền Admin; thu hồi quyền khi thay đổi vai trò/công tác.  
  * Lưu trữ Audit Log theo thời hạn tuân thủ và sẵn sàng truy xuất phục vụ kiểm toán.

### **QUY TRÌNH 2: ĐĂNG TẢI VÀ QUẢN LÝ TIN BÁN/CHO THUÊ**

Luồng nghiệp vụ dành cho Người Bán/Cho Thuê để đưa container của họ lên sàn.

* **Bước 1:** Người Bán/Cho Thuê đăng nhập và chọn chức năng "Đăng tin mới".  
* **Bước 2:** Chọn loại giao dịch: "Bán Container" hoặc "Cho thuê Container".  
* **Bước 3:** Điền thông tin chi tiết về container vào biểu mẫu được chuẩn hóa 1:  
  * **Phân loại:** Container khô, lạnh, văn phòng, chuyên dụng...  
  * **Kích thước:** 10ft, 20ft, 40ft, 40HC, 45ft...  
  * **Tình trạng:** Mới, đã qua sử dụng.  
  * **Tiêu chuẩn chất lượng:** Cargo Worthy (CW), Wind and Watertight (WWT), IICL...  
  * **Vị trí:** Chọn Depot hoặc nhập địa chỉ cụ thể.  
  * **Giá:** Nhập giá bán (VNĐ) hoặc giá thuê (VNĐ/ngày, /tháng, /năm).  
  * **Mô tả chi tiết:** Các thông tin khác về lịch sử, sửa chữa, đặc điểm riêng.  
* **Bước 4:** Tải lên hình ảnh/video thực tế của container. Yêu cầu ảnh chụp rõ các góc, bên trong, bên ngoài, và các chi tiết hư hỏng (nếu có).  
* **Bước 5:** Xem lại toàn bộ thông tin và gửi tin đăng để chờ kiểm duyệt.  
* **Bước 6:** Quản trị viên Nền tảng kiểm tra tính hợp lệ, đầy đủ và trung thực của thông tin.  
  * **Nếu hợp lệ:** Duyệt và cho hiển thị công khai trên sàn.  
  * **Nếu không hợp lệ:** Từ chối và gửi thông báo cho người đăng kèm lý do để chỉnh sửa.  
* **Bước 7:** Người Bán/Cho Thuê có thể vào trang quản lý cá nhân để xem trạng thái, chỉnh sửa, tạm ẩn hoặc xóa các tin đã đăng.1

### **QUY TRÌNH 3: TÌM KIẾM VÀ GIAO DỊCH CONTAINER**

Luồng nghiệp vụ dành cho Người Mua/Thuê, từ lúc tìm kiếm đến khi hoàn tất giao dịch.

**3.1. Tìm kiếm và Lựa chọn**

* **Bước 1:** Người Mua/Thuê (hoặc Khách vãng lai) sử dụng thanh tìm kiếm hoặc bộ lọc nâng cao để tìm container.1  
  * **Các bộ lọc:** Loại giao dịch, loại container, kích thước, tình trạng, vị trí, khoảng giá, tiêu chuẩn chất lượng...  
* **Bước 2:** Hệ thống hiển thị danh sách các container phù hợp.  
* **Bước 3:** Người dùng nhấp vào một tin đăng để xem trang chi tiết, bao gồm đầy đủ thông tin, hình ảnh và thông tin về Người Bán/Cho Thuê (bao gồm cả điểm đánh giá uy tín).  
* **Bước 4:** Người dùng có thể lưu tin đăng vào "Danh sách yêu thích" để xem lại sau.

**3.2. Tương tác và Thương lượng**

* **Bước 1:** Người Mua/Thuê sử dụng hệ thống nhắn tin nội bộ của nền tảng để liên hệ với Người Bán/Cho Thuê, đặt câu hỏi hoặc thương lượng về giá.1  
* **Bước 2:** Hai bên trao đổi và thống nhất các điều khoản (giá cuối cùng, điều kiện giao nhận, các dịch vụ đi kèm).

3.3. Yêu cầu Dịch vụ Giá trị Gia tăng tại Depot (Tùy chọn)  
Đây là bước quan trọng trong mô hình "Phygital", giúp xây dựng niềm tin tuyệt đối.

* **Bước 1:** Trong quá trình thương lượng, Người Mua/Thuê có thể yêu cầu "Giám định chất lượng tại Depot" thông qua một nút chức năng trên nền tảng.  
* **Bước 2:** Yêu cầu được gửi đến Nhân viên Depot được chỉ định.  
* **Bước 3:** Nhân viên Depot tiến hành giám định container theo tiêu chuẩn quốc tế (ví dụ: IICL-6).8 Quy trình bao gồm kiểm tra toàn diện cấu trúc, sàn, vách, nóc, cửa và các chi tiết kỹ thuật.11  
* **Bước 4:** Báo cáo giám định chi tiết (kèm hình ảnh, video) được số hóa và tải lên nền tảng, gắn với tin đăng của container.  
* **Bước 5:** Dựa trên báo cáo, Người Mua/Thuê có thể:  
  * Tiếp tục giao dịch nếu hài lòng.  
  * Yêu cầu Người Bán/Cho Thuê thực hiện sửa chữa các lỗi được phát hiện. Nền tảng có thể cung cấp báo giá sửa chữa ngay tại Depot.  
  * Hủy bỏ giao dịch nếu chất lượng không đạt yêu cầu.

3.4. Hoàn tất Giao dịch và Thanh toán Ký quỹ (Escrow)  
Quy trình này đảm bảo an toàn tài chính cho cả hai bên.

* **Bước 1:** Sau khi thống nhất mọi điều khoản, Người Mua/Thuê chọn "Tiến hành thanh toán".  
* **Bước 2:** Người Mua/Thuê chuyển toàn bộ số tiền của giao dịch vào tài khoản ký quỹ trung gian do nền tảng quản lý (hợp tác với ngân hàng).14  
* **Bước 3:** Hệ thống xác nhận đã nhận tiền và thông báo cho Người Bán/Cho Thuê bắt đầu quá trình giao container.  
* **Bước 4:** Người Bán/Cho Thuê sắp xếp việc giao container đến địa điểm đã thỏa thuận hoặc chuẩn bị để Người Mua/Thuê đến nhận tại Depot.  
* **Bước 5:** Người Mua/Thuê nhận và kiểm tra container.  
* **Bước 6:** Người Mua/Thuê xác nhận "Đã nhận hàng thành công" trên nền tảng.  
* **Bước 7:** Lệnh xác nhận này sẽ kích hoạt việc giải ngân tự động số tiền từ tài khoản ký quỹ cho Người Bán/Cho Thuê (sau khi trừ phí giao dịch của sàn).16 Giao dịch hoàn tất.

**3.5. Đánh giá sau Giao dịch**

* **Bước 1:** Sau khi giao dịch hoàn tất, hệ thống sẽ mời cả hai bên đánh giá lẫn nhau.  
* **Bước 2:** Người dùng để lại đánh giá (xếp hạng sao) và bình luận về trải nghiệm giao dịch.  
* **Bước 3:** Đánh giá này sẽ được hiển thị công khai trên hồ sơ của người dùng, góp phần xây dựng hệ thống uy tín.1

### **QUY TRÌNH 4: GIẢI QUYẾT TRANH CHẤP**

Quy trình được kích hoạt khi có mâu thuẫn phát sinh trong quá trình giao dịch.

* **Bước 1:** Nếu có vấn đề (ví dụ: container không đúng mô tả), Người Mua/Thuê chọn chức năng "Khiếu nại/Báo cáo tranh chấp" trên trang quản lý giao dịch.  
* **Bước 2:** Việc này sẽ tạm thời đóng băng khoản tiền trong tài khoản ký quỹ (Escrow).  
* **Bước 3:** Người dùng điền vào biểu mẫu khiếu nại, cung cấp bằng chứng (hình ảnh, video, mô tả vấn đề).  
* **Bước 4:** Quản trị viên Nền tảng tiếp nhận vụ việc và đóng vai trò trung gian hòa giải.  
* **Bước 5:** Quản trị viên xem xét bằng chứng từ cả hai bên, đối chiếu với các thông tin trên sàn (báo cáo giám định, mô tả tin đăng, lịch sử trò chuyện).  
* **Bước 6:** Dựa trên quy chế hoạt động đã công bố, Quản trị viên đưa ra phán quyết:  
  * **Người Mua/Thuê đúng:** Hoàn tiền cho Người Mua/Thuê.  
  * **Người Bán/Cho Thuê đúng:** Giải ngân cho Người Bán/Cho Thuê.  
  * **Hòa giải:** Đề xuất phương án giải quyết (ví dụ: giảm giá, sửa chữa) và chỉ giải ngân một phần.

### **QUY TRÌNH 5: TÍCH HỢP DỊCH VỤ BẢO HIỂM**

Quy trình này cung cấp thêm một lớp bảo vệ cho người dùng.

* **Bước 1:** Trong quá trình chốt đơn hàng (trước bước thanh toán), hệ thống sẽ hiển thị tùy chọn "Mua bảo hiểm cho giao dịch".  
* **Bước 2:** Nền tảng, thông qua tích hợp API với các đối tác bảo hiểm (như PVI, Bảo Việt, Tokio Marine), sẽ hiển thị các gói bảo hiểm phù hợp (bảo hiểm vỏ container, bảo hiểm hàng hóa vận chuyển) cùng với báo giá.17  
* **Bước 3:** Nếu người dùng lựa chọn, phí bảo hiểm sẽ được cộng vào tổng giá trị giao dịch.  
* **Bước 4:** Sau khi thanh toán thành công, hợp đồng bảo hiểm điện tử sẽ được tự động tạo và gửi cho người dùng.

### **QUY TRÌNH 6: YÊU CẦU VÀ QUẢN LÝ VẬN CHUYỂN CONTAINER**

Quy trình này được kích hoạt sau khi Người Mua/Thuê đã hoàn tất giao dịch (ví dụ: đã thanh toán qua cổng ký quỹ) và muốn di chuyển container ra khỏi Depot.

**Bước 1: Yêu cầu Dịch vụ Vận chuyển**

* **Thời điểm:** Ngay sau khi giao dịch mua/thuê được xác nhận thành công trên nền tảng, hệ thống sẽ tự động hiển thị một tùy chọn "Sắp xếp Vận chuyển" cho Người Mua/Thuê.  
* **Lựa chọn:** Người dùng sẽ có hai phương án:  
  1. **Sử dụng Dịch vụ Vận chuyển Tích hợp:** Đây là lựa chọn được khuyến khích. Nền tảng sẽ hợp tác với một mạng lưới các công ty vận tải container uy tín để cung cấp dịch vụ này. Người dùng chỉ cần chọn phương án này để tiếp tục.    
  2. **Tự sắp xếp Vận chuyển:** Người dùng có thể tự điều xe của mình hoặc thuê một đơn vị vận tải bên ngoài. Trong trường hợp này, nền tảng sẽ cung cấp các giấy tờ cần thiết (như Lệnh Giao Hàng Điện tử \- EDO) cho người dùng để họ có thể tự làm việc với Depot.

**Bước 2: Cung cấp Thông tin và Ước tính Chi phí (Nếu chọn Dịch vụ Tích hợp)**

* **Nhập thông tin:** Người dùng sẽ được yêu cầu cung cấp các thông tin cần thiết cho việc giao hàng:  
  * Địa chỉ nhận container chính xác.  
  * Tên và số điện thoại người liên hệ tại điểm nhận.  
  * Thời gian giao hàng mong muốn (ngày, giờ).  
  * Các yêu cầu đặc biệt khác (ví dụ: đường vào nhỏ, cần xe cẩu hạ...).  
* **Ước tính chi phí:** Dựa trên thông tin người dùng cung cấp, hệ thống sẽ tự động tính toán và hiển thị chi phí vận chuyển ước tính. Chi phí này được xác định dựa trên nhiều yếu tố :    
  * **Khoảng cách vận chuyển:** Từ Depot đến địa điểm của khách hàng.  
  * **Loại container:** Kích thước và trọng lượng của container ảnh hưởng đến loại xe cần sử dụng.  
  * **Giá nhiên liệu:** Phụ phí biến động giá nhiên liệu có thể được áp dụng.    
  * **Thời điểm:** Chi phí có thể cao hơn vào mùa cao điểm hoặc các khung giờ đặc biệt.    
  * **Phí cầu đường, bến bãi:** Các chi phí liên quan trên tuyến đường vận chuyển.  
  * **Dịch vụ bổ sung:** Chi phí cho xe cẩu, bốc xếp nếu người dùng yêu cầu.

**Bước 3: Xác nhận và Thanh toán Phí Vận chuyển**

* Người dùng xem lại báo giá và xác nhận yêu cầu vận chuyển.  
* Phí vận chuyển có thể được thanh toán ngay trên nền tảng thông qua các cổng thanh toán đã tích hợp, tương tự như thanh toán cho giao dịch chính.

**Bước 4: Nền tảng Điều phối và Xử lý Thủ tục**

* **Booking xe:** Sau khi nhận được yêu cầu, hệ thống sẽ tự động gửi thông tin "booking" đến đối tác vận tải phù hợp trong mạng lưới.    
* **Chuẩn bị chứng từ:** Nền tảng sẽ thay mặt người dùng xử lý các thủ tục cần thiết để lấy container ra khỏi Depot, quan trọng nhất là:  
  * **Lệnh Giao Hàng (Delivery Order \- D/O):** Đây là chứng từ do hãng tàu (hoặc chủ sở hữu container) phát hành, cho phép người nhận hàng lấy container ra khỏi cảng/Depot.  
  * **Lệnh Giao Hàng Điện tử (EDO):** Để tối ưu hóa quy trình, nền tảng sẽ ưu tiên sử dụng EDO. Người dùng sẽ nhận được mã nhận container qua email/SMS để cung cấp cho tài xế.    
* **Thông quan (nếu cần):** Đối với các container mới nhập khẩu, nền tảng có thể cung cấp dịch vụ hỗ trợ làm thủ tục thông quan tờ khai để đủ điều kiện lấy hàng.  

**Bước 5: Lấy Container tại Depot và Giao hàng**

* Tài xế từ đối tác vận tải sẽ đến Depot được chỉ định.  
* Tài xế xuất trình Lệnh Giao Hàng (D/O hoặc mã EDO) cho bộ phận quản lý tại Depot.    
* Sau khi xác thực, Depot sẽ tiến hành giao container cho tài xế. Tại thời điểm này, hai bên sẽ cùng ký vào **Phiếu Giao Nhận Container (Equipment Interchange Receipt \- EIR)**. Phiếu EIR ghi lại tình trạng chi tiết của container (hư hỏng, móp méo nếu có) tại lúc rời khỏi Depot, đây là chứng từ rất quan trọng để xác định trách nhiệm nếu có phát sinh hư hỏng về sau.    
* Container được vận chuyển đến địa chỉ của người dùng.

**Bước 6: Theo dõi, Nhận hàng và Hoàn tất**

* **Theo dõi thời gian thực:** Người dùng có thể theo dõi vị trí và lộ trình di chuyển của xe vận chuyển container ngay trên ứng dụng di động của nền tảng (thông qua định vị GPS).    
* **Nhận hàng:** Khi container được giao đến nơi, người dùng kiểm tra tình trạng container và xác nhận đã nhận hàng trên ứng dụng.  
* **Hoàn tất:** Quy trình vận chuyển kết thúc. Toàn bộ chứng từ liên quan (EIR, biên bản giao nhận) sẽ được số hóa và lưu trữ trong lịch sử giao dịch của người dùng trên nền tảng.

Bằng cách tích hợp quy trình vận chuyển này, nền tảng không chỉ là nơi mua bán mà còn trở thành một nhà cung cấp giải pháp logistics "một cửa", mang lại sự tiện lợi tối đa và giải quyết triệt để các khâu phức tạp cho khách hàng sau khi giao dịch.

