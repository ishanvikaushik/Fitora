# Fitora App - Complete Setup & Deployment Guide

## 🎯 Project Overview
Fitora is a personal wardrobe & outfit generation app with:
- User authentication (JWT)
- Wardrobe management (CRUD)
- Image uploads (via Cloudinary)
- Outfit generation (rule-based)

---

## 📦 Current State
- ✅ Frontend: React + TypeScript + Tailwind CSS (routing, auth context, API layer)
- ✅ Backend: Express + TypeScript (routes, controllers set up)
- ⚠️ Database: MongoDB (needs connection setup)
- ⚠️ Image Storage: Cloudinary (needs credentials)
- ⚠️ Authentication: JWT (needs .env setup)

---

## 🗄️ DATABASE CONNECTIVITY - EXACT STEPS

### Step 1: Choose Your Database (MongoDB)
We recommend **MongoDB Atlas** (cloud-based, free tier available):

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new project (e.g., "Fitora")
4. Click "Build a Cluster"
5. Select **Free** tier
6. Choose region closest to you (e.g., us-east-1)
7. Create cluster (takes 1-5 minutes)

### Step 2: Get Connection String
1. In MongoDB Atlas, click "Connect" on your cluster
2. Choose "Connect your application"
3. Select **Node.js** as driver
4. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/database`)

### Step 3: Create Environment Variables

**Server Setup (.env file in `/server` folder):**

```env
# Database
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/fitora?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRY=7d

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Server
PORT=5000
NODE_ENV=development
```

### Step 4: Set Up Cloudinary (Image Upload)

1. Go to https://cloudinary.com/
2. Sign up for free account
3. Go to Dashboard → Settings
4. Copy:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
5. Add these to your `.env` file

### Step 5: Update MongoDB Connection in Backend

**File: `/server/src/config/db.ts`**

```typescript
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI!);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};
```

### Step 6: Update Server Entry Point

**File: `/server/src/server.ts`**

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/auth.routes';
import clothingRoutes from './routes/clothing.routes';
import outfitRoutes from './routes/outfit.routes';
import uploadRoutes from './routes/upload.routes';

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clothes', clothingRoutes);
app.use('/api/outfits', outfitRoutes);
app.use('/api/upload', uploadRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 🚀 LOCAL DEVELOPMENT

### Step 1: Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### Step 2: Set Up Environment Files

**Create `/server/.env`:**
```bash
cp /server/.env.example /server/.env
# Edit .env with your MongoDB URI, JWT_SECRET, Cloudinary credentials
```

**Create `/client/.env.local`:**
```bash
cp /client/.env.example /client/.env.local
# For local dev, this should be:
# VITE_API_URL=http://localhost:5000/api
```

### Step 3: Run Backend & Frontend

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

Both should start on `localhost:5173` (frontend) and `localhost:5000` (backend).

---

## 🔧 MODELS YOU NEED TO COMPLETE

### User Model (`/server/src/models/User.ts`)
```typescript
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
```

### Clothing Model (`/server/src/models/Clothing.ts`)
```typescript
import mongoose from 'mongoose';

const clothingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  category: { type: String, enum: ['top', 'bottom', 'footwear', 'accessory'], required: true },
  subcategory: { type: String, required: true },
  color: [String],
  season: [String],
  occasion: [String],
  imageUrl: { type: String, required: true },
  tags: [String],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Clothing', clothingSchema);
```

---

## 📱 FRONTEND ENVIRONMENT SETUP

**Client .env.local for production:**
```env
VITE_API_URL=https://your-backend-url.com/api
```

---

## 🌐 DEPLOYMENT TO VERCEL & OTHER PLATFORMS

### Option 1: Deploy Frontend to Vercel (FREE)

1. Push your code to GitHub
2. Go to https://vercel.com
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables:
   - `VITE_API_URL=https://your-backend-url.com/api`
6. Deploy!

### Option 2: Deploy Backend to Render (FREE)

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: fitora-backend
   - **Runtime**: Node
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `npm run start`
5. Add environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `NODE_ENV=production`
6. Deploy!

### Option 3: Deploy Backend to Railway (FREE)

1. Go to https://railway.app
2. Connect GitHub
3. Create new project from GitHub repository
4. Add variables in dashboard
5. Deploy!

### Option 4: Deploy to Heroku (PAID but easy)

1. Install Heroku CLI
2. Run: `heroku create fitora-backend`
3. Set environment variables: `heroku config:set MONGODB_URI=...`
4. Deploy: `git push heroku main`

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] MongoDB Atlas cluster created & connection string obtained
- [ ] Cloudinary account created & credentials added to `.env`
- [ ] JWT_SECRET generated and stored securely
- [ ] All models (User, Clothing, Outfit) created
- [ ] All controllers (auth, clothing, outfit, upload) completed
- [ ] All routes registered in server
- [ ] Frontend `.env.local` configured with backend URL
- [ ] Frontend tests run locally
- [ ] Backend tests run locally
- [ ] `.gitignore` includes `.env` files (don't commit secrets!)
- [ ] Backend deployed & tested
- [ ] Frontend deployed & connected to backend
- [ ] CORS properly configured on backend
- [ ] JWT tokens working in production
- [ ] Image upload to Cloudinary working

---

## 🔐 SECURITY NOTES

1. **Never** commit `.env` files with real credentials
2. Use different `JWT_SECRET` for production
3. Enable HTTPS in production
4. Use environment-specific configurations
5. On Vercel/Render/Railway, add secrets via their dashboard (not in code)
6. For production MongoDB, enable IP whitelist in Atlas

---

## 📚 NEXT STEPS AFTER DEPLOYMENT

1. Complete outfit generation logic (rule-based)
2. Add AI integration (OpenAI/Gemini) for recommendations
3. Add weather API integration
4. Build saved outfits feature
5. Add user preferences
6. Build calendar/planning feature
7. Add analytics dashboard

---

## 🆘 TROUBLESHOOTING

**MongoDB Connection Error:**
- Check connection string in .env
- Verify IP whitelist in MongoDB Atlas (add 0.0.0.0/0 for development)
- Check username/password are URL-encoded

**Cloudinary Upload Failing:**
- Verify credentials in .env
- Check API key & secret are correct (not just Cloud Name)

**CORS Errors:**
- Ensure backend has `cors()` middleware
- Frontend and backend should have matching domain in production

**Token Not Working:**
- Check JWT_SECRET is same on backend
- Verify token format in Authorization header: `Bearer YOUR_TOKEN`

---

This guide covers everything you need for local development and deployment! 🚀
