# 🚀 Deployment Guide

This guide covers deploying the Collaborative Task Board to various platforms.

## 📋 Prerequisites

- GitHub repository with your code
- Node.js 16+ installed locally
- Accounts on deployment platforms (optional)

## 🌐 Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Connect to Vercel**:
   ```bash
   npm i -g vercel
   vercel login
   ```

2. **Deploy**:
   ```bash
   cd Task-Board
   vercel --prod
   ```

3. **Configure Environment Variables**:
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add: `REACT_APP_SERVER_URL=https://your-backend-url.herokuapp.com`

### Option 2: Netlify

1. **Connect to Netlify**:
   ```bash
   npm i -g netlify-cli
   netlify login
   ```

2. **Deploy**:
   ```bash
   cd Task-Board
   netlify deploy --prod --dir=client/build
   ```

3. **Configure Environment Variables**:
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Add: `REACT_APP_SERVER_URL=https://your-backend-url.herokuapp.com`

### Option 3: GitHub Pages

1. **Install gh-pages**:
   ```bash
   cd client
   npm install --save-dev gh-pages
   ```

2. **Add to package.json**:
   ```json
   "homepage": "https://yourusername.github.io/task-board",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d build"
   }
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

## 🖥️ Backend Deployment

### Option 1: Heroku

1. **Install Heroku CLI**:
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Create Heroku App**:
   ```bash
   cd server
   heroku create your-task-board-api
   ```

3. **Deploy**:
   ```bash
   git subtree push --prefix server heroku main
   ```

### Option 2: Railway

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Deploy**:
   ```bash
   cd server
   railway deploy
   ```

### Option 3: Render

1. **Connect Repository**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Connect your GitHub repository
   - Select the `server` folder as root directory

2. **Configure**:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node.js

## 🔧 Environment Variables

### Frontend
```env
REACT_APP_SERVER_URL=https://your-backend-url.herokuapp.com
```

### Backend
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:pass@host:port/db  # For PostgreSQL
```

## 📊 Production Optimizations

### Frontend
- Enable gzip compression
- Use CDN for static assets
- Implement service workers for caching
- Optimize bundle size with code splitting

### Backend
- Use PostgreSQL instead of SQLite
- Implement Redis for session management
- Add rate limiting
- Enable HTTPS
- Add logging and monitoring

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Ensure backend URL is correct in frontend environment variables
   - Check CORS configuration in server

2. **Socket Connection Failed**:
   - Verify backend is running and accessible
   - Check firewall settings
   - Ensure WebSocket support on hosting platform

3. **Database Issues**:
   - For production, migrate from SQLite to PostgreSQL
   - Check database connection strings
   - Ensure database is accessible from hosting platform

## 📈 Monitoring

### Recommended Tools
- **Frontend**: Vercel Analytics, Google Analytics
- **Backend**: Heroku Metrics, New Relic
- **Database**: PostgreSQL monitoring tools
- **Errors**: Sentry for error tracking

## 🔒 Security Checklist

- [ ] Enable HTTPS
- [ ] Add input validation
- [ ] Implement rate limiting
- [ ] Add authentication (JWT/OAuth)
- [ ] Use environment variables for secrets
- [ ] Enable CORS properly
- [ ] Add request logging
- [ ] Implement error handling

## 📝 Post-Deployment

1. **Test all features** in production
2. **Monitor performance** and errors
3. **Set up alerts** for downtime
4. **Document** any custom configurations
5. **Share** the live demo URL

## 🎯 Live Demo URLs

After deployment, your application will be available at:

- **Frontend**: `https://your-app.vercel.app` (or your chosen platform)
- **Backend**: `https://your-api.herokuapp.com` (or your chosen platform)

Update the README.md with these URLs for easy access!
