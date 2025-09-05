# Vercel Deployment Guide for RentBridge

## 🚀 Frontend Deployment (Free)

### Prerequisites
1. Create a [Vercel account](https://vercel.com)
2. Install Vercel CLI: `npm i -g vercel`
3. Connect your GitHub repository to Vercel

### Deployment Steps

#### Option 1: GitHub Integration (Recommended)
1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Select the `frontend` folder as the root directory
6. Set Framework Preset to "Vite"
7. Add environment variables in Vercel dashboard:
   - `VITE_API_URL` = Your backend URL
   - `VITE_NODE_ENV` = production

#### Option 2: CLI Deployment
```bash
cd Projects/frontend
vercel
# Follow the prompts
```

### Frontend Environment Variables in Vercel
1. Go to Project Settings → Environment Variables
2. Add:
   - `VITE_API_URL`: Your backend API URL
   - `VITE_NODE_ENV`: production

## 🔧 Backend Deployment Options

### Option 1: Heroku (Recommended for Free Tier)
1. Create Heroku account
2. Install Heroku CLI
3. Deploy backend:
```bash
cd Projects/backend
heroku create your-app-name
heroku config:set MONGO_URI="your-mongodb-uri"
heroku config:set JWT_SECRET="your-jwt-secret"
heroku config:set CORS_ORIGIN="https://your-frontend.vercel.app"
git subtree push --prefix=Projects/backend heroku main
```

### Option 2: Railway
1. Create Railway account
2. Connect GitHub repository
3. Set environment variables in Railway dashboard
4. Deploy from `Projects/backend` folder

### Option 3: Vercel Serverless (Limited for databases)
```bash
cd Projects/backend
vercel
```
⚠️ Note: Vercel serverless has limitations with persistent database connections

## 📋 Environment Variables Setup

### Backend (.env in production)
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/rentbridge
JWT_SECRET=your-super-secure-jwt-secret
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.vercel.app
```

### Frontend (Vercel Environment Variables)
```env
VITE_API_URL=https://your-backend.herokuapp.com
VITE_NODE_ENV=production
```

## 🔗 Complete Setup Flow

1. **Deploy Backend First**:
   - Choose Heroku/Railway for backend
   - Set up MongoDB Atlas (free tier)
   - Configure environment variables
   - Note the backend URL

2. **Deploy Frontend**:
   - Set `VITE_API_URL` to your backend URL
   - Deploy to Vercel
   - Update backend CORS_ORIGIN with frontend URL

3. **Update CORS**:
   - Update backend `CORS_ORIGIN` with your Vercel frontend URL
   - Redeploy backend

## 💡 Free Tier Recommendations

- **Database**: MongoDB Atlas (Free 512MB)
- **Backend**: Heroku (Free tier) or Railway
- **Frontend**: Vercel (Free)
- **File Storage**: Cloudinary (Free tier)

## 🔍 Troubleshooting

### CORS Issues
- Ensure `CORS_ORIGIN` in backend matches your Vercel URL
- Check environment variables are set correctly

### Build Errors
- Run `npm run build` locally first
- Check all dependencies are in `package.json`
- Verify file paths and imports

### API Connection Issues
- Verify `VITE_API_URL` is correct
- Check backend is running and accessible
- Test API endpoints manually
