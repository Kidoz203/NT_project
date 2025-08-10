# 🚀 NT - Modern Social Media App

<div align="center">
  <h3>A feature-rich social media platform with beautiful UI and modern architecture</h3>
  
  ![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)
  ![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js)
  ![MongoDB](https://img.shields.io/badge/MongoDB-6.x-47A248?style=for-the-badge&logo=mongodb)
  ![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express)

  **[🌐 Live Demo](#) • [📚 Documentation](#) • [🚀 Deploy Now](#deployment)**
</div>

---

## ✨ Features

### 🔐 **Authentication & Security**
- ✅ Secure user registration & login
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Protected routes & middleware
- ✅ Input validation & sanitization

### 👤 **User Profiles & Social**
- ✅ Customizable user profiles with avatars
- ✅ Follow/unfollow system
- ✅ User search & discovery
- ✅ Follower/following counts
- ✅ Bio and personal information

### 📝 **Posts & Content**
- ✅ Create posts with rich text
- ✅ Image upload support
- ✅ **Post deletion with beautiful UI** 🆕
- ✅ Like/unlike functionality
- ✅ Visibility settings (public/private/followers)
- ✅ Real-time updates

### 💬 **Comments & Interactions**
- ✅ Comment on posts
- ✅ **Comment deletion with confirmation modals** 🆕
- ✅ Like/unlike comments
- ✅ Nested comment display
- ✅ Real-time comment updates

### 🎨 **Modern UI/UX**
- ✅ **Beautiful animated dropdowns & modals** 🆕
- ✅ Responsive design for all devices
- ✅ Smooth animations & transitions
- ✅ Loading states & error handling
- ✅ Professional styling with Styled Components

---

## 🛠️ Technology Stack

<table>
<tr>
<td>

### **Frontend**
- **React 19** with TypeScript
- **Styled Components** for styling
- **React Query** for state management
- **React Hook Form** + Yup validation
- **React Router** for navigation
- **Axios** for HTTP requests

</td>
<td>

### **Backend**
- **Node.js** + Express.js
- **MongoDB** with Mongoose ODM
- **JWT** authentication
- **Multer** for file uploads
- **bcryptjs** password hashing
- **CORS** + security middleware

</td>
</tr>
</table>

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 16+ 
- MongoDB (local or Atlas)
- npm/yarn

### **Installation**

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/NT.git
cd NT

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install

# 4. Set up environment variables (see below)

# 5. Start development servers
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm start
```

### **Environment Setup**

Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/social_media_db
JWT_SECRET=your_super_secure_jwt_secret_key_here_make_it_long_and_random
NODE_ENV=development
```

### **Access the App**
- 🌐 **Frontend:** http://localhost:3000
- 🔧 **Backend API:** http://localhost:5000

---

## 📁 Project Structure

```
NT/
├── 📁 backend/
│   ├── 📁 middleware/         # Authentication & file upload
│   ├── 📁 models/             # MongoDB schemas (User, Post)
│   ├── 📁 routes/             # API endpoints
│   ├── 📁 uploads/            # User uploaded files
│   ├── 📄 server.js           # Express server setup
│   └── 📄 package.json
├── 📁 frontend/
│   ├── 📁 public/             # Static assets
│   ├── 📁 src/
│   │   ├── 📁 components/     # React components
│   │   ├── 📁 contexts/       # React contexts (Auth)
│   │   ├── 📁 pages/          # Main pages (Home, Login, etc.)
│   │   ├── 📁 styles/         # Global styles
│   │   ├── 📁 types/          # TypeScript definitions
│   │   ├── 📁 utils/          # API client & utilities
│   │   └── 📄 App.tsx         # Main app component
│   └── 📄 package.json
├── 📄 DEPLOYMENT_GUIDE.md     # Step-by-step deployment
├── 📄 HOSTING_OPTIONS.md      # Free hosting comparison
├── 📄 FEATURE_SUMMARY.md     # Latest features overview
└── 📄 README.md               # This file
```

---

## 🔗 API Endpoints

<details>
<summary><strong>🔐 Authentication</strong></summary>

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

</details>

<details>
<summary><strong>👤 Users</strong></summary>

- `GET /api/users/:username` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/:id/follow` - Follow user
- `POST /api/users/:id/unfollow` - Unfollow user
- `GET /api/users/search/:query` - Search users

</details>

<details>
<summary><strong>📝 Posts</strong></summary>

- `GET /api/posts` - Get all posts (paginated)
- `GET /api/posts/user/:userId` - Get user posts
- `POST /api/posts` - Create new post
- `PUT /api/posts/:postId` - Update post
- `DELETE /api/posts/:postId` - **Delete post** 🆕
- `POST /api/posts/:postId/like` - Like/unlike post

</details>

<details>
<summary><strong>💬 Comments</strong></summary>

- `POST /api/posts/:postId/comments` - Add comment
- `DELETE /api/posts/:postId/comments/:commentId` - **Delete comment** 🆕
- `POST /api/posts/:postId/comments/:commentId/like` - Like/unlike comment

</details>

---

## 🎨 New Features Showcase

### **🗑️ Post Deletion with Elegant UI**
- Beautiful animated dropdown menu
- Smooth confirmation modals
- Professional hover effects
- Loading states during deletion

### **💬 Comment Management**
- Enhanced delete buttons with icons
- Confirmation modals prevent accidents
- Smart permissions (owner + post author)
- Seamless UX with animations

### **🎭 UI/UX Improvements**
- Keyframe animations for all modals
- Click-outside-to-close functionality
- Consistent color theming
- Responsive design patterns

---

## 🌐 Deployment

### **🆓 Free Hosting (Recommended)**

| Component | Platform | Free Tier |
|-----------|----------|-----------|
| **Frontend** | [Vercel](https://vercel.com) | Unlimited |
| **Backend** | [Render](https://render.com) | 750 hrs/month |
| **Database** | [MongoDB Atlas](https://cloud.mongodb.com) | 512MB |

### **🚀 One-Click Deploy**

1. **Push to GitHub** (this repo)
2. **Connect to Vercel** (frontend)
3. **Connect to Render** (backend)
4. **Setup MongoDB Atlas** (database)

**📖 Detailed Guide:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)  
**🔧 All Options:** [HOSTING_OPTIONS.md](./HOSTING_OPTIONS.md)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **MongoDB** for the robust database solution
- **Vercel & Render** for free hosting platforms
- **Open Source Community** for inspiration and tools

---

<div align="center">
  <h3>⭐ Star this repo if you found it helpful!</h3>
  
  **[🚀 Deploy Now](./DEPLOYMENT_GUIDE.md) • [💬 Report Issues](https://github.com/yourusername/NT/issues) • [📧 Contact](mailto:your.email@example.com)**
</div>
