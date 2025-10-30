# 🚀 DEPLOY LÊN UBUNTU - 3 BƯỚC

## Bước 1: Trên Windows - Push Code

```powershell
.\push-to-github.ps1
```

## Bước 2: Trên Ubuntu - Deploy

```bash
wget https://raw.githubusercontent.com/CaoThaiDuong24/conttrade/master/scripts/deployment/ubuntu-deploy.sh
chmod +x ubuntu-deploy.sh
sudo ./ubuntu-deploy.sh
```

## Bước 3: Truy Cập

```
http://your-server-ip
```

---

## 📖 Đọc Thêm

- **Chi tiết:** `BUILD-AND-DEPLOY.md`
- **Các bước:** `DEPLOY-STEPS.md`
- **Nhanh:** `QUICK-DEPLOY.md`

---

## 🔄 Update Lần Sau

**Windows:**
```powershell
.\push-to-github.ps1
```

**Ubuntu:**
```bash
cd /var/www/lta
sudo ./scripts/deployment/update-app.sh
```

---

**Dễ vậy thôi! 🎉**
