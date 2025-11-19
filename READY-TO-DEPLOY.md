# ✅ ĐÃ SẴN SÀNG DEPLOY

## 📦 Các File Đã Chuẩn Bị

### Hướng Dẫn Deploy:
- ✅ `DEPLOY-UBUNTU.md` - Hướng dẫn 3 bước siêu đơn giản
- ✅ `QUICK-DEPLOY.md` - Hướng dẫn deploy nhanh 5 phút
- ✅ `DEPLOY-STEPS.md` - Chi tiết từng bước
- ✅ `BUILD-AND-DEPLOY.md` - Hướng dẫn đầy đủ nhất

### Scripts Hỗ Trợ:
- ✅ `push-to-github.ps1` - Script push code từ Windows
- ✅ `scripts/deployment/create-env.sh` - Script tạo file .env tự động
- ✅ `scripts/deployment/ubuntu-deploy.sh` - Script deploy tự động trên Ubuntu
- ✅ `scripts/deployment/update-app.sh` - Script update ứng dụng

### Cấu Hình:
- ✅ `docker-compose.yml` - Cấu hình Docker
- ✅ `Dockerfile.backend` - Docker cho backend
- ✅ `Dockerfile.frontend` - Docker cho frontend
- ✅ `ecosystem.config.js` - Cấu hình PM2
- ✅ `.env.example` - Mẫu environment variables

---

## 🚀 CÁCH DEPLOY

### Option 1: Tự Động (Khuyến Nghị)

**1. Trên Windows - Push code:**
```powershell
.\push-to-github.ps1
```

**2. Trên Ubuntu - Deploy:**
```bash
wget https://raw.githubusercontent.com/CaoThaiDuong24/conttrade/master/scripts/deployment/ubuntu-deploy.sh
chmod +x ubuntu-deploy.sh
sudo ./ubuntu-deploy.sh
```

**3. Truy cập:**
```
http://your-server-ip
```

### Option 2: Docker

**Trên Ubuntu:**
```bash
# Cài Docker
curl -fsSL https://get.docker.com | sudo sh
sudo apt install docker-compose -y

# Clone và start
git clone https://github.com/CaoThaiDuong24/conttrade.git /var/www/lta
cd /var/www/lta
nano .env  # Điền thông tin
sudo docker-compose up -d
```

---

## 📝 NHỮNG ĐIỀU CẦN LƯU Ý

### Trước Khi Deploy:

1. **Đẩy code lên GitHub:**
   ```powershell
   .\push-to-github.ps1
   ```

2. **Đảm bảo server Ubuntu đáp ứng:**
   - RAM: 2GB+
   - Disk: 20GB+
   - Ubuntu 20.04+
   - Có SSH access

3. **Chuẩn bị thông tin:**
   - IP server
   - SSH credentials
   - Password cho database (tự chọn)

### Trong Quá Trình Deploy:

1. **Script tự động sẽ làm:**
   - Cài Node.js, PostgreSQL, Nginx, PM2
   - Clone code từ GitHub
   - Tạo database
   - Build backend & frontend
   - Start ứng dụng

2. **Bạn chỉ cần:**
   - Nhập thông tin khi được hỏi
   - Đợi script chạy xong (~15-20 phút)

### Sau Khi Deploy:

1. **Kiểm tra ứng dụng:**
   ```bash
   pm2 list
   pm2 logs
   ```

2. **Truy cập và test:**
   - Frontend: `http://your-server-ip:3000`
   - Backend API: `http://your-server-ip:3006/api/v1`

3. **Setup thêm (Optional):**
   - SSL/HTTPS: `sudo ./scripts/deployment/setup-ssl.sh`
   - Auto backup: Thêm vào crontab
   - Firewall: `sudo ufw enable`

---

## 🔄 CẬP NHẬT SAU NÀY

Khi có code mới:

**1. Trên Windows:**
```powershell
.\push-to-github.ps1
```

**2. Trên Ubuntu:**
```bash
cd /var/www/lta
sudo ./scripts/deployment/update-app.sh
```

⏱️ **1-2 phút** - Zero downtime!

---

## 📚 TÀI LIỆU CHI TIẾT

Đọc file tương ứng nếu cần:

| File | Mô Tả |
|------|-------|
| `DEPLOY-UBUNTU.md` | Hướng dẫn 3 bước đơn giản nhất |
| `QUICK-DEPLOY.md` | Deploy nhanh 5 phút |
| `DEPLOY-STEPS.md` | Chi tiết từng bước |
| `BUILD-AND-DEPLOY.md` | Hướng dẫn đầy đủ, 3 phương án |
| `DEPLOYMENT-GUIDE.md` | Hướng dẫn gốc chi tiết |

---

## 🆘 CẦN GIÚP ĐỠ?

### Xem Logs:
```bash
pm2 logs                    # PM2
sudo docker-compose logs -f # Docker
```

### Restart:
```bash
pm2 restart all                # PM2
sudo docker-compose restart    # Docker
```

### Monitor:
```bash
cd /var/www/lta/scripts/deployment
sudo ./monitor.sh --full
```

---

## ✨ TIPS

1. **Luôn backup trước khi update:**
   ```bash
   cd /var/www/lta/scripts/deployment
   sudo ./database.sh backup
   ```

2. **Kiểm tra logs thường xuyên:**
   ```bash
   pm2 logs --lines 100
   ```

3. **Monitor hệ thống:**
   ```bash
   pm2 monit
   htop
   df -h
   ```

4. **Test trước khi production:**
   - Test login
   - Test các chức năng chính
   - Kiểm tra permissions

---

## 🎉 SẴN SÀNG!

Bây giờ bạn có thể:

1. ✅ Push code lên GitHub: `.\push-to-github.ps1`
2. ✅ SSH vào Ubuntu server
3. ✅ Chạy script deploy tự động
4. ✅ Truy cập ứng dụng

**Chúc bạn deploy thành công! 🚀**

---

> Ngày tạo: 30/10/2025  
> Repository: https://github.com/CaoThaiDuong24/conttrade
