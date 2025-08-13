# 🚀 Running NT Social Media App Locally

## 🎯 Current Status

Your NT social media app is ready to run! Here's how to get it up and running:

## 📋 Prerequisites Check

✅ **Node.js & npm**: Installed  
✅ **Backend dependencies**: Installed (`backend/node_modules/`)  
✅ **Frontend dependencies**: Installed (`frontend/node_modules/`)  
❌ **MongoDB**: Not installed locally  

## 🔧 Option 1: Quick Setup with MongoDB Atlas (Recommended)

### **Step 1: Setup MongoDB Atlas (Free Cloud Database)**

1. **Create Account**: Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. **Create Free Cluster**: Choose M0 Sandbox (FREE)
3. **Create Database User**: Username/password authentication
4. **Whitelist IP**: Allow access from anywhere (0.0.0.0/0)
5. **Get Connection String**: Copy from Atlas dashboard

### **Step 2: Update Environment Variables**

```bash
# Edit backend/.env
cd /mnt/workspace/NT/backend
nano .env
```

Replace the MongoDB URI with your Atlas connection string:
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/social_media_db
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
NODE_ENV=development
```

### **Step 3: Start the Servers**

```bash
# Terminal 1 - Start Backend
cd /mnt/workspace/NT/backend
npm start

# Terminal 2 - Start Frontend
cd /mnt/workspace/NT/frontend
npm start
```

---

## 🔧 Option 2: Install MongoDB Locally

### **Install MongoDB on Fedora Linux**

```bash
# Add MongoDB repository
sudo tee /etc/yum.repos.d/mongodb-org-7.0.repo <<EOF
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/9/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-7.0.asc
EOF

# Install MongoDB
sudo dnf install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify installation
mongosh --version
```

### **Then Start the App**

```bash
# Terminal 1 - Backend
cd /mnt/workspace/NT/backend
npm start

# Terminal 2 - Frontend  
cd /mnt/workspace/NT/frontend
npm start
```

---

## 🌐 Access Your App

After starting both servers:

- **🌐 Frontend**: http://localhost:3000
- **🔧 Backend API**: http://localhost:5000
- **📊 API Health**: http://localhost:5000/api/auth/health

---

## 🔧 Option 3: Docker Setup (Advanced)

If you prefer Docker:

```bash
# Create docker-compose.yml in root directory
cd /mnt/workspace/NT

cat > docker-compose.yml <<EOF
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/social_media_db
      - JWT_SECRET=your_jwt_secret_key_here
    depends_on:
      - mongodb

volumes:
  mongodb_data:
EOF

# Start with Docker
docker-compose up
```

---

## 🚀 Expected Output

### **Backend Console:**
```
Connected to MongoDB
Server is running on port 5000
Environment: development
```

### **Frontend Console:**
```
Compiled successfully!

You can now view frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

---

## ✨ Features You Can Test

Once running, you can:

1. **🔐 Register/Login**: Create new accounts
2. **📝 Create Posts**: Add text and image posts
3. **💬 Comments**: Add and interact with comments
4. **❤️ Likes**: Like posts and comments
5. **🗑️ Delete Features**: Test the beautiful deletion UI:
   - Click "⋯" on your posts for dropdown menu
   - Click "🗑️ Delete" on comments for confirmation modal
6. **👥 Social Features**: Follow/unfollow users

---

## 🐛 Troubleshooting

### **Common Issues:**

**Backend won't start:**
```bash
# Check if port 5000 is in use
lsof -i :5000
# Kill process if needed
kill -9 <PID>
```

**Frontend won't start:**
```bash
# Check if port 3000 is in use
lsof -i :3000
# Use different port
PORT=3001 npm start
```

**Database connection error:**
- Verify MongoDB is running: `sudo systemctl status mongod`
- Check connection string in `.env`
- For Atlas: Verify IP whitelist and credentials

**CORS errors:**
- Make sure both frontend and backend are running
- Check that CORS is configured in `backend/server.js`

---

## 🎯 Next Steps

After testing locally:

1. **🚀 Deploy to Production**: Follow `DEPLOYMENT_GUIDE.md`
2. **📱 Mobile Testing**: Test responsive design on mobile
3. **🔧 Customize**: Add your own features and styling
4. **📊 Monitor**: Check logs and performance

---

## 💡 Pro Tips

- **Development**: Use `npm run dev` in backend for auto-reload
- **Debugging**: Check browser console and Network tab
- **Database**: Use MongoDB Compass to view your data
- **API Testing**: Use Postman or Thunder Client to test endpoints

Your NT social media app is now ready to run! Choose the option that works best for your setup. 🚀
