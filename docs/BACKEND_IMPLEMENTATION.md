# 🔧 BACKEND IMPLEMENTATION GUIDE

## Overview
This guide walks you through completing the backend controllers and models to make the frontend work.

---

## Step 1: Install Backend Dependencies

```bash
cd server
npm install mongoose bcrypt jsonwebtoken cloudinary dotenv
npm install -D @types/node @types/express @types/bcrypt @types/jsonwebtoken
```

If you haven't already, make sure these are in package.json:
```json
{
  "dependencies": {
    "express": "^4.x.x",
    "mongoose": "^7.x.x",
    "bcrypt": "^5.x.x",
    "jsonwebtoken": "^9.x.x",
    "cloudinary": "^1.x.x",
    "multer": "^1.x.x",
    "cors": "^2.x.x",
    "dotenv": "^16.x.x"
  }
}
```

---

## Step 2: Set Up Environment Variables

Create `/server/.env` file:

```bash
# Copy from .env.example
cp .env.example .env

# Then edit .env with your actual credentials
```

**Required Credentials:**
1. **MongoDB URI** - From MongoDB Atlas
2. **JWT Secret** - Can be any random string
3. **Cloudinary** - From cloudinary.com

---

## Step 3: Create User Model

File: `/server/src/models/User.ts`

```typescript
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false, // Don't return password by default
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
```

---

## Step 4: Create Clothing Model

File: `/server/src/models/Clothing.ts`

```typescript
import mongoose from 'mongoose';

interface IClothing extends mongoose.Document {
  userId: mongoose.Schema.Types.ObjectId;
  name: string;
  category: 'top' | 'bottom' | 'footwear' | 'accessory';
  subcategory: string;
  color: string[];
  season: string[];
  occasion: string[];
  imageUrl: string;
  tags: string[];
  lastWorn?: Date;
}

const clothingSchema = new mongoose.Schema<IClothing>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a clothing name'],
    },
    category: {
      type: String,
      enum: ['top', 'bottom', 'footwear', 'accessory'],
      required: true,
    },
    subcategory: {
      type: String,
      required: true,
    },
    color: {
      type: [String],
      required: true,
    },
    season: {
      type: [String],
      enum: ['all', 'summer', 'winter', 'spring', 'fall'],
      default: ['all'],
    },
    occasion: {
      type: [String],
      enum: ['casual', 'formal', 'party', 'sporty'],
      default: ['casual'],
    },
    imageUrl: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    lastWorn: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IClothing>('Clothing', clothingSchema);
```

---

## Step 5: Create Auth Controller

File: `/server/src/controllers/auth.controller.ts`

```typescript
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Generate JWT Token
const generateToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRY || '7d',
  });
};

// @route   POST /api/auth/signup
// @desc    Register a user
// @access  Public
export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({ name, email, password });
    await user.save();

    // Generate token
    const token = generateToken(user._id.toString());

    // Return user and token
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/auth/login
// @desc    Login a user
// @access  Public
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id.toString());

    // Return user and token
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/auth/me
// @desc    Get current user (protected route)
// @access  Private
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).userId);
    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
```

---

## Step 6: Create Clothing Controller

File: `/server/src/controllers/clothing.controller.ts`

```typescript
import { Request, Response } from 'express';
import Clothing from '../models/Clothing';

// @route   POST /api/clothes
// @desc    Add a clothing item
// @access  Private
export const addClothing = async (req: Request, res: Response) => {
  try {
    const { name, category, subcategory, color, season, occasion } = req.body;
    const imageUrl = (req as any).imageUrl; // Set by upload controller

    if (!name || !category || !subcategory || !color || !imageUrl) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const clothing = new Clothing({
      userId: (req as any).userId,
      name,
      category,
      subcategory,
      color: [color], // Convert to array
      season: season ? [season] : ['all'],
      occasion: occasion ? [occasion] : ['casual'],
      imageUrl,
    });

    await clothing.save();
    res.status(201).json(clothing);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/clothes
// @desc    Get all clothing items for user
// @access  Private
export const getAllClothes = async (req: Request, res: Response) => {
  try {
    const clothes = await Clothing.find({ userId: (req as any).userId });
    res.status(200).json(clothes);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/clothes/:id
// @desc    Get a single clothing item
// @access  Private
export const getClothingById = async (req: Request, res: Response) => {
  try {
    const clothing = await Clothing.findOne({
      _id: req.params.id,
      userId: (req as any).userId,
    });

    if (!clothing) {
      return res.status(404).json({ message: 'Clothing not found' });
    }

    res.status(200).json(clothing);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/clothes/:id
// @desc    Update a clothing item
// @access  Private
export const updateClothing = async (req: Request, res: Response) => {
  try {
    let clothing = await Clothing.findOne({
      _id: req.params.id,
      userId: (req as any).userId,
    });

    if (!clothing) {
      return res.status(404).json({ message: 'Clothing not found' });
    }

    // Update fields
    Object.assign(clothing, req.body);

    // Update image if provided
    if ((req as any).imageUrl) {
      clothing.imageUrl = (req as any).imageUrl;
    }

    await clothing.save();
    res.status(200).json(clothing);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/clothes/:id
// @desc    Delete a clothing item
// @access  Private
export const deleteClothing = async (req: Request, res: Response) => {
  try {
    const clothing = await Clothing.findOneAndDelete({
      _id: req.params.id,
      userId: (req as any).userId,
    });

    if (!clothing) {
      return res.status(404).json({ message: 'Clothing not found' });
    }

    res.status(200).json({ message: 'Clothing deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
```

---

## Step 7: Create Upload Controller

File: `/server/src/controllers/upload.controller.ts`

```typescript
import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @route   POST /api/upload
// @desc    Upload image to Cloudinary
// @access  Private
export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    // Upload to Cloudinary from buffer
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'fitora/wardrobe',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(req.file!.buffer);
    });

    const uploadResult = result as any;
    res.status(200).json({
      imageUrl: uploadResult.secure_url,
      message: 'Image uploaded successfully',
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
```

---

## Step 8: Create Auth Middleware

File: `/server/src/middleware/auth.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export default authMiddleware;
```

---

## Step 9: Create Upload Middleware

File: `/server/src/middleware/upload.middleware.ts`

```typescript
import multer from 'multer';

// Store file in memory instead of disk
const storage = multer.memoryStorage();

// File filter
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Accept image files only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export default upload;
```

---

## Step 10: Update Routes

### Auth Routes
File: `/server/src/routes/auth.routes.ts`

```typescript
import { Router } from 'express';
import { signup, login, getCurrentUser } from '../controllers/auth.controller';
import authMiddleware from '../middleware/auth.middleware';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authMiddleware, getCurrentUser);

export default router;
```

### Clothing Routes
File: `/server/src/routes/clothing.routes.ts`

```typescript
import { Router } from 'express';
import {
  addClothing,
  getAllClothes,
  getClothingById,
  updateClothing,
  deleteClothing,
} from '../controllers/clothing.controller';
import authMiddleware from '../middleware/auth.middleware';
import upload from '../middleware/upload.middleware';

const router = Router();

router.use(authMiddleware); // All clothing routes are protected

router.post('/', upload.single('image'), addClothing);
router.get('/', getAllClothes);
router.get('/:id', getClothingById);
router.put('/:id', upload.single('image'), updateClothing);
router.delete('/:id', deleteClothing);

export default router;
```

### Upload Routes
File: `/server/src/routes/upload.routes.ts` (Already created, just verify)

```typescript
import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware';
import upload from '../middleware/upload.middleware';
import { uploadImage } from '../controllers/upload.controller';

const router = Router();

router.post('/', authMiddleware, upload.single('image'), uploadImage);

export default router;
```

---

## Step 11: Update Main Server File

File: `/server/src/server.ts`

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Routes
import authRoutes from './routes/auth.routes';
import clothingRoutes from './routes/clothing.routes';
import uploadRoutes from './routes/upload.routes';
import outfitRoutes from './routes/outfit.routes';

// Load environment variables
dotenv.config();

const app = express();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clothes', clothingRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/outfits', outfitRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## Step 12: Test Your Backend

### Install Postman
Download from: https://www.postman.com/downloads/

### Test Endpoints

**1. Signup**
```
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**2. Login**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```
Copy the returned `token`!

**3. Add Clothing**
```
POST http://localhost:5000/api/clothes
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: multipart/form-data

Form fields:
- name: "Blue T-Shirt"
- category: "top"
- subcategory: "shirt"
- color: "blue"
- season: "summer"
- occasion: "casual"
- image: (select an image file)
```

**4. Get All Clothes**
```
GET http://localhost:5000/api/clothes
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## Step 13: Run Your Backend

```bash
cd server
npm run dev
```

You should see:
```
MongoDB connected
Server running on port 5000
```

---

## ✅ Checklist

- [ ] Dependencies installed
- [ ] .env file created with credentials
- [ ] User model created
- [ ] Clothing model created
- [ ] Auth controller created
- [ ] Clothing controller created
- [ ] Upload controller created
- [ ] All middleware created
- [ ] All routes updated
- [ ] Server file updated
- [ ] Backend running locally
- [ ] All endpoints tested in Postman
- [ ] Connected to MongoDB
- [ ] Cloudinary uploads working
- [ ] Ready to connect frontend

---

You're done with the backend! Now your frontend will work perfectly. 🚀
