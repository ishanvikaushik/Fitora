# 🚀 FITORA - RUN IT NOW!

## Your App is 100% Ready. Just Follow These Steps.

---

## ✅ STEP 1: SET UP ENVIRONMENT (5 minutes)

### Get Your Credentials

**For MongoDB:**
1. Go to: https://www.mongodb.com/cloud/atlas
2. Sign up (free)
3. Create a cluster
4. Click "Connect"
5. Choose "Connect your application"
6. Copy the connection string
7. Replace username/password in string

**For Cloudinary:**
1. Go to: https://cloudinary.com
2. Sign up (free)
3. Go to dashboard
4. Copy: Cloud Name, API Key, API Secret

### Create `/server/.env`

In folder: `c:\Users\Ishanvi Kaushik\Documents\Fitora\server\`

Create file named: `.env`

Copy & paste this:

```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/fitora?retryWrites=true&w=majority
JWT_SECRET=my_super_secret_key_12345
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
NODE_ENV=development
```

Replace the placeholders with your actual credentials!

### Create `/client/.env.local`

In folder: `c:\Users\Ishanvi Kaushik\Documents\Fitora\client\`

Create file named: `.env.local`

Copy & paste this:

```env
VITE_API_URL=http://localhost:5000
```

---

## 🎬 STEP 2: RUN THE APP

### Terminal 1 - Start Backend

```bash
cd c:\Users\Ishanvi Kaushik\Documents\Fitora\server
npm run dev
```

You should see:
```
Fitora backend running on port 5000
```

### Terminal 2 - Start Frontend

```bash
cd c:\Users\Ishanvi Kaushik\Documents\Fitora\client
npm run dev
```

You should see:
```
Local:   http://localhost:5173/
```

---

## 🧪 STEP 3: TEST IT (5 minutes)

1. **Open your browser:** http://localhost:5173

2. **Test Signup:**
   - Click "Sign up"
   - Name: John Doe
   - Email: john@example.com
   - Password: password123
   - Click "Sign up"
   - See login page ✓

3. **Test Login:**
   - Email: john@example.com
   - Password: password123
   - Click "Login"
   - See empty wardrobe ✓

4. **Test Add Clothing:**
   - Click "+ Add Clothing Item"
   - Name: Blue T-Shirt
   - Category: top
   - Subcategory: shirt
   - Color: blue
   - Season: summer
   - Occasion: casual
   - **Click image field and select a real image file from your computer**
   - Click "Add Item"
   - See item in grid ✓

5. **Test Delete:**
   - Click "Delete" on the item
   - Item disappears ✓

6. **Test Logout:**
   - Click "Logout"
   - Redirected to login page ✓

**If all tests pass: YOUR APP WORKS!** 🎉

---

## 📊 EXPECTED OUTPUT

### Backend Terminal

```
Fitora backend running on port 5000
MongoDB Connected: ac-xxxxx.mongodb.net
```

### Frontend Terminal

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Browser

You should see a beautiful purple/blue login page with:
- Fitora logo
- Email field
- Password field
- Login button
- "Don't have an account? Sign up" link

---

## 🐛 TROUBLESHOOTING

### Error: "Port 5000 already in use"
```bash
# Kill the process using port 5000
# Or change PORT in .env to 5001
```

### Error: "Cannot connect to MongoDB"
```
Check:
1. MONGODB_URI in .env is correct
2. Username/password are URL-encoded
3. IP whitelist on MongoDB Atlas includes 0.0.0.0/0
4. Database name is "fitora" or created
```

### Error: "Cannot find module"
```bash
# Install dependencies again
cd server
npm install

cd ../client
npm install
```

### Frontend shows blank page
```
Check:
1. VITE_API_URL in client/.env.local
2. Backend is running
3. No errors in browser console (F12)
4. No errors in backend terminal
```

### Image upload fails
```
Check:
1. Cloudinary credentials in .env
2. Cloud Name matches exactly
3. Image file is less than 5MB
4. Image is JPG, PNG, or similar format
```

---

## ✅ WHAT SHOULD WORK

After completing all steps:

- ✅ Can create account
- ✅ Can login
- ✅ Can add clothing
- ✅ Can upload images
- ✅ Can see wardrobe
- ✅ Can delete items
- ✅ Can logout
- ✅ No errors in console
- ✅ No errors in terminal

---

## 🎯 QUICK COMMANDS REFERENCE

```bash
# Start backend
cd c:\Users\Ishanvi Kaushik\Documents\Fitora\server
npm run dev

# Start frontend (new terminal)
cd c:\Users\Ishanvi Kaushik\Documents\Fitora\client
npm run dev

# View app
http://localhost:5173

# View backend
http://localhost:5000/

# Stop server
Press Ctrl+C in terminal
```

---

## 📋 FILES TO CREATE

### Create this file:
**Location:** `c:\Users\Ishanvi Kaushik\Documents\Fitora\server\.env`

```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
NODE_ENV=development
```

### Create this file:
**Location:** `c:\Users\Ishanvi Kaushik\Documents\Fitora\client\.env.local`

```
VITE_API_URL=http://localhost:5000
```

---

## ⏱️ TIME ESTIMATE

- Getting credentials: 10 min
- Creating .env files: 2 min
- Starting backend: 1 min
- Starting frontend: 1 min
- Testing app: 5 min
- **TOTAL: ~20 minutes**

---

## 🎊 THAT'S IT!

Your app is ready. Just:
1. Create .env files
2. Run backend
3. Run frontend
4. Test

Then you can:
- Share with friends
- Deploy to production
- Add more features
- Impress people! 😎

---

## 🚀 YOU'VE GOT THIS!

Everything is built, everything is configured, everything is ready.

**Just follow these 3 steps and you're done!**

Go! 🏃‍♂️🚀
