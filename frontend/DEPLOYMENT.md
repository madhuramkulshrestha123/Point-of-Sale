# DEPLOYMENT GUIDE

This guide will help you deploy the POS System to production.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Docker Deployment (Optional)](#docker-deployment-optional)
- [Production Checklist](#production-checklist)

---

## Prerequisites

- Node.js 18+ installed
- MongoDB database (local or MongoDB Atlas)
- PM2 (for process management) or Docker
- Domain name (for production)
- SSL certificate (recommended)

---

## Environment Configuration

### Backend (.env)

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
# For production, use MongoDB Atlas or your own MongoDB server
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pos_system?retryWrites=true&w=majority

# JWT Configuration
# IMPORTANT: Generate a strong secret in production!
# Run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_very_long_and_random_secret_key_here_at_least_64_characters
JWT_EXPIRE=7d

# CORS Configuration
# Update with your frontend domain
FRONTEND_URL=https://your-frontend-domain.com

# Optional: Email Configuration
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-password

# Optional: Payment Gateways
# STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
# STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
```

### Frontend (.env)

Create a `.env` file in the root directory:

```env
# Backend API URL (Update with your production backend URL)
VITE_API_URL=https://your-backend-domain.com/api

# App Configuration
VITE_APP_NAME=Point of Sale System
VITE_APP_VERSION=1.0.0
```

---

## Backend Deployment

### Option 1: Deploy with PM2

1. **Install dependencies:**
   ```bash
   cd backend
   npm install --production
   ```

2. **Create PM2 ecosystem file (`ecosystem.config.js`):**
   ```javascript
   module.exports = {
     apps: [{
       name: 'pos-backend',
       script: 'server.js',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 5000
       },
       env_production: {
         NODE_ENV: 'production'
       },
       // Auto restart on memory limit
       max_memory_restart: '1G',
       // Restart on file changes
       watch: false,
       // Log files
       error_file: './logs/pm2-err.log',
       out_file: './logs/pm2-out.log',
       // Keep running after logout
       kill_timeout: 3000
     }]
   };
   ```

3. **Start with PM2:**
   ```bash
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```

4. **Monitor the application:**
   ```bash
   pm2 status
   pm2 logs pos-backend
   ```

### Option 2: Deploy with Docker

1. **Create `Dockerfile` in backend directory:**
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   
   EXPOSE 5000
   
   CMD ["node", "server.js"]
   ```

2. **Build and run:**
   ```bash
   docker build -t pos-backend .
   docker run -d -p 5000:5000 --env-file .env --name pos-backend pos-backend
   ```

---

## Frontend Deployment

### Build for Production

1. **Update `.env` with production API URL:**
   ```env
   VITE_API_URL=https://your-backend-domain.com/api
   ```

2. **Build the application:**
   ```bash
   npm run build
   ```

3. **Preview the production build:**
   ```bash
   npm run preview
   ```

### Deploy to Static Hosting

#### Option 1: Nginx

1. **Install Nginx:**
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

2. **Configure Nginx (`/etc/nginx/sites-available/pos`):**
   ```nginx
   server {
       listen 80;
       server_name your-frontend-domain.com;
       root /var/www/pos-frontend/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # API Proxy (optional - if you want to proxy API through same domain)
       location /api/ {
           proxy_pass http://your-backend-server:5000/api/;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```

3. **Enable the site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/pos /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

#### Option 2: Vercel

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Set environment variables in Vercel dashboard:**
   - `VITE_API_URL` = `https://your-backend-domain.com/api`

#### Option 3: Netlify

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy:**
   ```bash
   netlify deploy --prod --dir=dist
   ```

3. **Or create `netlify.toml`:**
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

---

## Docker Deployment (Optional)

### Docker Compose (Full Stack)

Create `docker-compose.yml` in the root directory:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    container_name: pos-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: your_secure_password
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    networks:
      - pos-network

  backend:
    build: ./backend
    container_name: pos-backend
    restart: unless-stopped
    env_file: ./backend/.env
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
    networks:
      - pos-network

  frontend:
    build: .
    container_name: pos-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - pos-network

volumes:
  mongodb_data:

networks:
  pos-network:
    driver: bridge
```

---

## Production Checklist

### Security
- [ ] Generate strong JWT secret (64+ random characters)
- [ ] Enable HTTPS/SSL certificates
- [ ] Update CORS origins to production domains only
- [ ] Remove all console.logs in production (use environment-based logging)
- [ ] Set secure HTTP headers (Helmet.js is already configured)
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting on API endpoints
- [ ] Set up firewall rules
- [ ] Regular security audits

### Database
- [ ] Use MongoDB Atlas or managed MongoDB service
- [ ] Enable database authentication
- [ ] Set up automated backups
- [ ] Create database indexes for performance
- [ ] Monitor database performance

### Monitoring
- [ ] Set up application monitoring (PM2, New Relic, etc.)
- [ ] Configure error tracking (Sentry, etc.)
- [ ] Set up server monitoring (CPU, Memory, Disk)
- [ ] Configure log rotation
- [ ] Set up alerts for critical errors

### Performance
- [ ] Enable compression (already configured)
- [ ] Set up CDN for static assets
- [ ] Optimize images and assets
- [ ] Enable browser caching
- [ ] Use lazy loading for routes

### Backup & Recovery
- [ ] Set up automated database backups
- [ ] Configure file backups for important data
- [ ] Test recovery procedures
- [ ] Document disaster recovery plan

### Environment Variables
- [ ] All secrets are in `.env` files (not in code)
- [ ] `.env` files are in `.gitignore`
- [ ] Backup `.env.example` files are created
- [ ] Environment variables documented

---

## Common Issues & Solutions

### CORS Issues
If you're getting CORS errors, ensure:
1. `FRONTEND_URL` in backend `.env` matches your frontend domain
2. CORS middleware is properly configured in `server.js`

### Database Connection Issues
1. Verify MongoDB connection string is correct
2. Check firewall allows MongoDB port (27017)
3. Ensure MongoDB user has proper permissions

### API Not Accessible
1. Check backend is running and accessible
2. Verify `VITE_API_URL` in frontend `.env` is correct
3. Check network requests in browser DevTools

### Build Fails
1. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
2. Clear Vite cache: `rm -rf node_modules/.vite`
3. Check Node.js version (18+ required)

---

## Post-Deployment

1. **Test all features:**
   - Login/Register
   - Product management
   - Sales transactions
   - Payment processing
   - Reports and analytics
   - PWA functionality

2. **Monitor logs:**
   ```bash
   # Backend logs
   pm2 logs pos-backend
   
   # Nginx logs
   sudo tail -f /var/log/nginx/access.log
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Set up automated tasks:**
   ```bash
   # Backup script (add to crontab)
   0 2 * * * /path/to/backup-script.sh
   
   # PM2 restart on crash
   pm2 restart pos-backend --watch
   ```

---

## Support

For issues or questions:
1. Check the logs first
2. Review environment variables
3. Test API endpoints directly
4. Check database connectivity

---

**Remember:** Never commit `.env` files to version control. Always use `.env.example` files with placeholder values.
