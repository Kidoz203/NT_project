#!/bin/bash

echo "🚀 Preparing Social Media App for Deployment"
echo "============================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - Social Media App with post/comment deletion features"
else
    echo "📁 Git repository already exists"
    echo "💾 Committing latest changes..."
    git add .
    git commit -m "Prepare for deployment - production configuration added"
fi

echo ""
echo "✅ Deployment files created:"
echo "   - render.yaml (Backend deployment config)"
echo "   - frontend/vercel.json (Frontend deployment config)" 
echo "   - backend/Dockerfile (Container deployment)"
echo "   - backend/.env.production (Production environment template)"
echo "   - DEPLOYMENT_GUIDE.md (Complete deployment instructions)"

echo ""
echo "🎯 Next Steps:"
echo "1. Push your code to GitHub:"
echo "   git remote add origin https://github.com/yourusername/your-repo.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "2. Follow the DEPLOYMENT_GUIDE.md for step-by-step hosting instructions"
echo ""
echo "3. Free hosting options ready:"
echo "   🗄️  Database: MongoDB Atlas (Free 512MB)"
echo "   🖥️  Backend:  Render.com (Free 750 hours/month)"
echo "   🌐 Frontend: Vercel (Free unlimited)"
echo ""
echo "🎉 Your social media app is ready for the world!"

# Make the script executable
chmod +x deploy.sh
