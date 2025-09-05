#!/bin/bash

# RentBridge Deployment Script

echo "🚀 Starting RentBridge deployment process..."

# Check if we're in the right directory
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the Projects directory"
    exit 1
fi

echo "📦 Building frontend..."
cd frontend
npm install
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful!"
else
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "🔧 Checking backend dependencies..."
cd ../backend
npm install

echo "✅ Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Deploy backend to Heroku/Railway"
echo "2. Deploy frontend to Vercel"
echo "3. Update environment variables"
echo ""
echo "See VERCEL_DEPLOYMENT.md for detailed instructions"
