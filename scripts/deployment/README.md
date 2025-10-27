# Deployment Scripts

> **📖 Xem hướng dẫn đầy đủ tại:** [`DEPLOYMENT-GUIDE.md`](../../DEPLOYMENT-GUIDE.md)

Thư mục này chứa các script tự động hóa để deploy ứng dụng trên Ubuntu Server.

## 📦 Danh Sách Scripts

| Script | Mô Tả | Sử Dụng |
|--------|-------|---------|
| `ubuntu-deploy.sh` | Deploy lần đầu (tự động hóa hoàn toàn) | `sudo ./ubuntu-deploy.sh` |
| `quick-setup.sh` | Setup nhanh đơn giản | `sudo ./quick-setup.sh` |
| `update-app.sh` | Cập nhật ứng dụng (zero-downtime) | `sudo ./update-app.sh` |
| `rollback.sh` | Rollback về version cũ | `sudo ./rollback.sh` |
| `monitor.sh` | Giám sát hệ thống | `sudo ./monitor.sh` |
| `database.sh` | Quản lý database | `sudo ./database.sh` |
| `setup-ssl.sh` | Cài đặt SSL/HTTPS | `sudo ./setup-ssl.sh` |
| `.env.template` | Template cho environment variables | - |

## 🚀 Quick Start

```bash
# Upload scripts lên server
scp -r scripts/deployment/* user@your-server:/tmp/

# SSH vào server
ssh user@your-server

# Cấp quyền và chạy
cd /tmp/deployment
sudo chmod +x *.sh
sudo ./ubuntu-deploy.sh
```

## 📖 Xem Hướng Dẫn Đầy Đủ

**Toàn bộ hướng dẫn chi tiết có trong file:** [`DEPLOYMENT-GUIDE.md`](../../DEPLOYMENT-GUIDE.md)

Bao gồm:
- ✅ Chuẩn bị deploy từ A-Z
- ✅ Hướng dẫn deploy lần đầu  
- ✅ Cập nhật và rollback
- ✅ Quản lý database
- ✅ Giám sát và troubleshooting
- ✅ Best practices
