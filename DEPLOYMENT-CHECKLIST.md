# Checklist Deploy Ubuntu Production

## 📋 Pre-Deployment Checklist

### Server Setup
- [ ] Ubuntu 20.04+ installed
- [ ] Server có ít nhất 2GB RAM
- [ ] Domain name đã trỏ về server IP (nếu dùng domain)
- [ ] SSH access với sudo privileges
- [ ] Firewall cấu hình đúng (ports 22, 80, 443)

### Dependencies
- [ ] Node.js 20.x installed
- [ ] PostgreSQL installed và running
- [ ] PM2 installed (nếu dùng PM2) hoặc Docker installed (nếu dùng Docker)
- [ ] Nginx installed (nếu không dùng Docker)

### Security
- [ ] SSH key authentication enabled
- [ ] Root login disabled
- [ ] Fail2ban installed (optional)
- [ ] UFW firewall enabled
- [ ] SSL certificate ready (nếu có domain)

---

## 🔧 Configuration Checklist

### Environment Variables
- [ ] `.env` created từ `.env.example`
- [ ] `backend/.env` created từ `backend/.env.example`
- [ ] Database URL configured
- [ ] JWT_SECRET changed từ default
- [ ] NEXTAUTH_SECRET changed từ default
- [ ] CORS_ORIGIN set to production domain
- [ ] API URLs set to production URLs

### Database
- [ ] PostgreSQL database created
- [ ] PostgreSQL user created với permissions
- [ ] Database connection tested
- [ ] Backup strategy planned

### Files & Permissions
- [ ] Uploads directory writable
- [ ] Logs directory writable
- [ ] Environment files secured (chmod 600)
- [ ] Git repository cloned

---

## 🚀 Deployment Checklist

### Build
- [ ] `npm install` completed (frontend)
- [ ] `npm install` completed (backend)
- [ ] `npm run build` successful (frontend)
- [ ] `npm run build` successful (backend)
- [ ] No TypeScript errors
- [ ] No linting errors

### Database Migration
- [ ] `npx prisma generate` completed
- [ ] `npx prisma migrate deploy` completed
- [ ] Seed data loaded (if needed)
- [ ] Database structure verified

### PM2 Deployment (if using PM2)
- [ ] `ecosystem.config.js` configured
- [ ] PM2 started successfully
- [ ] PM2 startup script configured
- [ ] PM2 save completed
- [ ] Processes auto-restart on server reboot

### Docker Deployment (if using Docker)
- [ ] `docker-compose.yml` configured
- [ ] `.dockerignore` present
- [ ] Images built successfully
- [ ] Containers started
- [ ] Container health checks passing
- [ ] Volume mounts working
- [ ] Networks configured

### Nginx
- [ ] Nginx installed
- [ ] Site config created
- [ ] Config syntax tested (`nginx -t`)
- [ ] Site enabled
- [ ] Nginx restarted
- [ ] Reverse proxy working

---

## ✅ Post-Deployment Checklist

### Verification
- [ ] Frontend accessible (http://your-domain.com or IP:3000)
- [ ] Backend API accessible (http://your-domain.com/api or IP:3006)
- [ ] Database queries working
- [ ] File uploads working
- [ ] Authentication working
- [ ] All main features tested

### Monitoring
- [ ] Application logs accessible
- [ ] Error tracking configured
- [ ] PM2 logs/Docker logs verified
- [ ] Database logs checked
- [ ] Nginx logs checked

### Performance
- [ ] Load time acceptable
- [ ] API response time acceptable
- [ ] Memory usage normal
- [ ] CPU usage normal
- [ ] Disk space sufficient

### Security
- [ ] HTTPS working (if configured)
- [ ] SSL certificate valid
- [ ] Security headers present
- [ ] CORS working correctly
- [ ] Rate limiting configured (if needed)
- [ ] SQL injection protection verified
- [ ] XSS protection verified

### Backup
- [ ] Automated backup script configured
- [ ] Manual backup tested
- [ ] Restore procedure tested
- [ ] Backup storage configured
- [ ] Backup retention policy set

---

## 🔄 Maintenance Checklist

### Daily
- [ ] Check application logs for errors
- [ ] Monitor disk space
- [ ] Check application uptime

### Weekly
- [ ] Review error logs
- [ ] Check database size
- [ ] Verify backups are running
- [ ] Review access logs for suspicious activity

### Monthly
- [ ] Update system packages (`apt update && apt upgrade`)
- [ ] Update Node.js dependencies (security patches)
- [ ] Review and rotate logs
- [ ] Test backup restore procedure
- [ ] Review SSL certificate expiry
- [ ] Check disk usage trends

### Quarterly
- [ ] Full system audit
- [ ] Performance optimization review
- [ ] Security audit
- [ ] Update documentation

---

## 🆘 Emergency Contacts & Procedures

### Rollback Procedure
```bash
# PM2
pm2 stop all
git checkout <previous-commit>
bash scripts/deployment/deploy.sh

# Docker
docker-compose down
git checkout <previous-commit>
bash scripts/deployment/docker-deploy.sh
```

### Quick Fixes
```bash
# Restart application
pm2 restart all          # PM2
docker-compose restart   # Docker

# Check logs
pm2 logs                 # PM2
docker-compose logs -f   # Docker

# Database backup NOW
bash scripts/deployment/backup.sh

# Health check
bash scripts/deployment/health-check.sh
```

### Support Contacts
- System Admin: [Your Contact]
- Database Admin: [Your Contact]
- DevOps Team: [Your Contact]
- Emergency Hotline: [Your Number]

---

## 📝 Sign-off

- [ ] All checklist items completed
- [ ] Application tested and verified
- [ ] Documentation updated
- [ ] Team notified of deployment
- [ ] Deployment date/time recorded

**Deployed by:** _______________  
**Date:** _______________  
**Time:** _______________  
**Version/Commit:** _______________
