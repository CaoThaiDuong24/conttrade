import sgMail from '@sendgrid/mail';

// Initialize SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@i-contexchange.vn';
const FROM_NAME = process.env.FROM_NAME || 'i-ContExchange';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    if (!SENDGRID_API_KEY) {
      console.warn('SendGrid API key not configured. Email not sent.');
      console.log('Email would be sent to:', options.to);
      console.log('Subject:', options.subject);
      return;
    }

    await sgMail.send({
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    });

    console.log('Email sent successfully to:', options.to);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// ===== SELLER APPLICATION EMAIL TEMPLATES =====

export const sendApplicationReceivedEmail = async (
  userEmail: string,
  userName: string,
  applicationCode: string
): Promise<void> => {
  const subject = '📋 Đã nhận đơn đăng ký trở thành Nhà Cung Cấp';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .code { font-size: 24px; font-weight: bold; color: #667eea; text-align: center; padding: 15px; background: #f0f3ff; border-radius: 8px; letter-spacing: 2px; }
        .timeline { margin: 20px 0; }
        .timeline-item { display: flex; align-items: flex-start; margin: 15px 0; }
        .timeline-icon { width: 30px; height: 30px; background: #667eea; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-weight: bold; }
        .timeline-content { margin-left: 15px; }
        .timeline-title { font-weight: bold; color: #667eea; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .info-list { list-style: none; padding: 0; }
        .info-list li { padding: 8px 0; border-bottom: 1px solid #eee; }
        .info-list li:last-child { border-bottom: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Đã Nhận Đơn Đăng Ký</h1>
        </div>
        <div class="content">
          <p>Xin chào <strong>${userName}</strong>,</p>
          
          <p>Chúng tôi đã nhận được đơn đăng ký trở thành <strong>Nhà Cung Cấp</strong> của bạn trên nền tảng <strong>i-ContExchange</strong>.</p>
          
          <div class="box">
            <p style="margin: 0 0 10px 0; text-align: center; color: #666;">Mã đơn của bạn:</p>
            <div class="code">${applicationCode}</div>
          </div>
          
          <div class="box">
            <h3 style="margin-top: 0; color: #667eea;">📋 Quy trình xử lý (3-5 ngày làm việc):</h3>
            
            <div class="timeline">
              <div class="timeline-item">
                <div class="timeline-icon">1</div>
                <div class="timeline-content">
                  <div class="timeline-title">Kiểm tra tự động</div>
                  <p style="margin: 5px 0 0 0; color: #666;">Xác thực thông tin và tài liệu</p>
                </div>
              </div>
              
              <div class="timeline-item">
                <div class="timeline-icon">2</div>
                <div class="timeline-content">
                  <div class="timeline-title">Thẩm định (1-2 ngày)</div>
                  <p style="margin: 5px 0 0 0; color: #666;">Xác minh MST/CCCD, giấy phép kinh doanh</p>
                </div>
              </div>
              
              <div class="timeline-item">
                <div class="timeline-icon">3</div>
                <div class="timeline-content">
                  <div class="timeline-title">Xác minh kho bãi (1-2 ngày)</div>
                  <p style="margin: 5px 0 0 0; color: #666;">Kiểm tra địa chỉ, ảnh kho, sức chứa</p>
                </div>
              </div>
              
              <div class="timeline-item">
                <div class="timeline-icon">4</div>
                <div class="timeline-content">
                  <div class="timeline-title">Thông báo kết quả (1 ngày)</div>
                  <p style="margin: 5px 0 0 0; color: #666;">Duyệt / Từ chối / Yêu cầu bổ sung</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="box">
            <h3 style="margin-top: 0; color: #667eea;">📞 Cần hỗ trợ?</h3>
            <ul class="info-list">
              <li><strong>Email:</strong> support@i-contexchange.vn</li>
              <li><strong>Hotline:</strong> 1900-xxxx (8:00-18:00, T2-T6)</li>
              <li><strong>Mã đơn:</strong> ${applicationCode}</li>
            </ul>
          </div>
          
          <p style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/vi/seller-application-status" class="button">
              Theo dõi trạng thái đơn
            </a>
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            <em>Chú ý: Vui lòng không trả lời email này. Nếu cần hỗ trợ, vui lòng liên hệ qua email support hoặc hotline.</em>
          </p>
        </div>
        
        <div class="footer">
          <p>© 2025 i-ContExchange. All rights reserved.</p>
          <p>Nền tảng giao dịch container hàng đầu Việt Nam</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  await sendEmail({ to: userEmail, subject, html });
};

export const sendApplicationApprovedEmail = async (
  userEmail: string,
  userName: string,
  applicationCode: string,
  businessName: string
): Promise<void> => {
  const subject = '🎉 Chúc mừng! Đơn đăng ký của bạn đã được duyệt';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0 0; font-size: 16px; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .success-box { background: linear-gradient(135deg, #e8f8f5 0%, #d5f5e3 100%); padding: 25px; border-radius: 10px; text-align: center; margin: 20px 0; border: 2px solid #38ef7d; }
        .success-icon { font-size: 60px; margin-bottom: 10px; }
        .box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #38ef7d; }
        .button { display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; font-weight: bold; font-size: 16px; }
        .features { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
        .feature-item { background: white; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e0e0e0; }
        .feature-icon { font-size: 30px; margin-bottom: 5px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Chúc Mừng!</h1>
          <p>Bạn đã trở thành Nhà Cung Cấp</p>
        </div>
        <div class="content">
          <div class="success-box">
            <div class="success-icon">✅</div>
            <h2 style="margin: 0; color: #11998e;">Đơn đăng ký đã được duyệt!</h2>
            <p style="margin: 10px 0 0 0; color: #666;">Mã đơn: <strong>${applicationCode}</strong></p>
          </div>
          
          <p>Xin chào <strong>${userName}</strong>,</p>
          
          <p>Chúng tôi vui mừng thông báo rằng đơn đăng ký của <strong>${businessName}</strong> đã được <strong>phê duyệt</strong>!</p>
          
          <p>Tài khoản của bạn đã được nâng cấp lên <strong>Nhà Cung Cấp</strong> và bạn có thể bắt đầu sử dụng các tính năng sau:</p>
          
          <div class="features">
            <div class="feature-item">
              <div class="feature-icon">📦</div>
              <strong>Đăng tin bán</strong>
              <p style="font-size: 13px; color: #666; margin: 5px 0 0 0;">Container mới & đã qua sử dụng</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">💬</div>
              <strong>Nhận RFQ</strong>
              <p style="font-size: 13px; color: #666; margin: 5px 0 0 0;">Yêu cầu báo giá từ buyer</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">💰</div>
              <strong>Tạo báo giá</strong>
              <p style="font-size: 13px; color: #666; margin: 5px 0 0 0;">Trả lời và tạo quote</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">📊</div>
              <strong>Quản lý đơn hàng</strong>
              <p style="font-size: 13px; color: #666; margin: 5px 0 0 0;">Theo dõi đơn hàng bán ra</p>
            </div>
          </div>
          
          <div class="box">
            <h3 style="margin-top: 0; color: #11998e;">🚀 Bắt đầu ngay:</h3>
            <ol style="padding-left: 20px;">
              <li style="margin: 10px 0;"><strong>Đăng tin đầu tiên:</strong> Vào "Dashboard Seller" → "Tạo listing mới"</li>
              <li style="margin: 10px 0;"><strong>Cập nhật thông tin kho:</strong> Kiểm tra thông tin depot của bạn</li>
              <li style="margin: 10px 0;"><strong>Thiết lập thanh toán:</strong> Xác nhận thông tin ngân hàng</li>
              <li style="margin: 10px 0;"><strong>Nhận RFQ:</strong> Kiểm tra các yêu cầu báo giá mới</li>
            </ol>
          </div>
          
          <p style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/vi/dashboard/seller" class="button">
              Vào Dashboard Seller
            </a>
          </p>
          
          <div class="box" style="background: #fff3cd; border-left-color: #ffc107;">
            <p style="margin: 0;"><strong>💡 Mẹo thành công:</strong></p>
            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
              <li>Đăng ảnh container chất lượng cao</li>
              <li>Mô tả chi tiết, rõ ràng</li>
              <li>Trả lời RFQ nhanh chóng (trong 24h)</li>
              <li>Giá cạnh tranh và hợp lý</li>
            </ul>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            <em>Nếu có bất kỳ câu hỏi nào, vui lòng liên hệ support@i-contexchange.vn hoặc gọi 1900-xxxx.</em>
          </p>
        </div>
        
        <div class="footer">
          <p>© 2025 i-ContExchange. All rights reserved.</p>
          <p>Chúc bạn kinh doanh thành công! 🚀</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  await sendEmail({ to: userEmail, subject, html });
};

export const sendApplicationRejectedEmail = async (
  userEmail: string,
  userName: string,
  applicationCode: string,
  rejectionReason: string
): Promise<void> => {
  const subject = '❌ Đơn đăng ký của bạn không được duyệt';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e74c3c; }
        .reason-box { background: #fee; padding: 20px; border-radius: 8px; border: 1px solid #e74c3c; }
        .button { display: inline-block; padding: 12px 30px; background: #e74c3c; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Đơn Không Được Duyệt</h1>
        </div>
        <div class="content">
          <p>Xin chào <strong>${userName}</strong>,</p>
          
          <p>Rất tiếc, sau khi xem xét kỹ lưỡng, chúng tôi không thể phê duyệt đơn đăng ký <strong>${applicationCode}</strong> của bạn vào thời điểm này.</p>
          
          <div class="reason-box">
            <h3 style="margin-top: 0; color: #e74c3c;">Lý do từ chối:</h3>
            <p style="margin: 0;">${rejectionReason}</p>
          </div>
          
          <div class="box">
            <h3 style="margin-top: 0; color: #e74c3c;">📋 Bạn có thể làm gì tiếp theo?</h3>
            <ol style="padding-left: 20px;">
              <li style="margin: 10px 0;">Xem xét kỹ lý do từ chối ở trên</li>
              <li style="margin: 10px 0;">Chuẩn bị lại tài liệu theo yêu cầu</li>
              <li style="margin: 10px 0;">Nộp lại đơn đăng ký mới sau 7 ngày</li>
            </ol>
          </div>
          
          <div class="box">
            <h3 style="margin-top: 0; color: #e74c3c;">📞 Cần giải thích thêm?</h3>
            <p>Nếu bạn cần thêm thông tin chi tiết về quyết định này, vui lòng liên hệ:</p>
            <ul style="list-style: none; padding: 0;">
              <li style="padding: 5px 0;"><strong>Email:</strong> support@i-contexchange.vn</li>
              <li style="padding: 5px 0;"><strong>Hotline:</strong> 1900-xxxx (8:00-18:00, T2-T6)</li>
              <li style="padding: 5px 0;"><strong>Mã đơn:</strong> ${applicationCode}</li>
            </ul>
          </div>
          
          <p style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/vi/become-seller" class="button">
              Nộp đơn mới
            </a>
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            <em>Chúng tôi rất tiếc về quyết định này và hy vọng có thể hợp tác với bạn trong tương lai.</em>
          </p>
        </div>
        
        <div class="footer">
          <p>© 2025 i-ContExchange. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  await sendEmail({ to: userEmail, subject, html });
};

export const sendApplicationInfoRequiredEmail = async (
  userEmail: string,
  userName: string,
  applicationCode: string,
  requiredInfo: string
): Promise<void> => {
  const subject = '⚠️ Cần bổ sung thông tin cho đơn đăng ký';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f39c12; }
        .warning-box { background: #fff4e5; padding: 20px; border-radius: 8px; border: 1px solid #f39c12; }
        .button { display: inline-block; padding: 12px 30px; background: #f39c12; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .deadline { background: #ffe6e6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #ff6b6b; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Cần Bổ Sung Thông Tin</h1>
        </div>
        <div class="content">
          <p>Xin chào <strong>${userName}</strong>,</p>
          
          <p>Chúng tôi đang xem xét đơn đăng ký <strong>${applicationCode}</strong> của bạn. Tuy nhiên, chúng tôi cần thêm một số thông tin để hoàn tất quá trình thẩm định.</p>
          
          <div class="warning-box">
            <h3 style="margin-top: 0; color: #f39c12;">📋 Thông tin cần bổ sung:</h3>
            <p style="margin: 0; white-space: pre-line;">${requiredInfo}</p>
          </div>
          
          <div class="deadline">
            <p style="margin: 0; font-size: 16px;"><strong>⏰ Hạn bổ sung: 7 ngày từ hôm nay</strong></p>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Sau thời gian này, đơn của bạn sẽ bị hủy tự động</p>
          </div>
          
          <div class="box">
            <h3 style="margin-top: 0; color: #f39c12;">📝 Cách bổ sung thông tin:</h3>
            <ol style="padding-left: 20px;">
              <li style="margin: 10px 0;">Nhấn vào nút "Bổ sung thông tin" bên dưới</li>
              <li style="margin: 10px 0;">Cập nhật các thông tin được yêu cầu</li>
              <li style="margin: 10px 0;">Upload lại tài liệu (nếu cần)</li>
              <li style="margin: 10px 0;">Nhấn "Gửi lại" để hoàn tất</li>
            </ol>
          </div>
          
          <p style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/vi/seller-application-status?id=${applicationCode}" class="button">
              Bổ sung thông tin ngay
            </a>
          </p>
          
          <div class="box">
            <h3 style="margin-top: 0; color: #f39c12;">💡 Lưu ý quan trọng:</h3>
            <ul style="padding-left: 20px;">
              <li style="margin: 8px 0;">Đảm bảo thông tin chính xác và đầy đủ</li>
              <li style="margin: 8px 0;">Tài liệu phải rõ ràng, không bị mờ</li>
              <li style="margin: 8px 0;">File size tối đa 10MB, định dạng PDF/JPG/PNG</li>
              <li style="margin: 8px 0;">Phản hồi càng sớm, xử lý càng nhanh</li>
            </ul>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            <em>Nếu có thắc mắc, vui lòng liên hệ support@i-contexchange.vn hoặc gọi 1900-xxxx.</em>
          </p>
        </div>
        
        <div class="footer">
          <p>© 2025 i-ContExchange. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  await sendEmail({ to: userEmail, subject, html });
};
