# 🤖 ML Integration Guide - Fitora with Hugging Face

Add powerful AI/ML features to your Fitora app using Hugging Face models. Transform your wardrobe app with intelligent recommendations!

---

## 🎯 ML Features You Can Add

### 1. **Outfit Recommendation Engine** ⭐ RECOMMENDED
**What it does:** Suggests outfit combinations based on occasion, weather, and style.

**Technology:** Hugging Face Transformers + Semantic Search

**Complexity:** Medium | **Time:** 2-3 hours

**How it works:**
- User selects occasion (e.g., "business meeting")
- System analyzes wardrobe items
- AI suggests matching outfits
- User can rate suggestions → model improves

---

### 2. **Clothing Item Classifier**
**What it does:** Automatically categorize items by category, style, color even if user makes mistakes.

**Technology:** Vision Transformer (ViT) or EfficientNet

**Complexity:** Easy | **Time:** 1-2 hours

**How it works:**
- User uploads image
- AI automatically detects: category, color, style, season
- Fills form automatically
- User confirms/edits

---

### 3. **Weather-Based Outfit Suggestions**
**What it does:** Recommend outfits based on real-time weather.

**Technology:** Hugging Face Transformers + Weather API

**Complexity:** Medium | **Time:** 2 hours

**How it works:**
- Gets current weather from OpenWeather API
- Analyzes temperature, conditions
- Suggests appropriate items from wardrobe
- Shows outfit combinations

---

### 4. **Style Analysis & Personal Fashion Advisor**
**What it does:** Analyzes your clothing choices and suggests improvements.

**Technology:** BERT or DistilBERT NLP

**Complexity:** Medium | **Time:** 2-3 hours

**How it works:**
- Analyzes colors, patterns, styles in wardrobe
- Identifies gaps (e.g., "no winter outerwear")
- Suggests items to buy
- Provides styling tips

---

### 5. **Occasion-Based Outfit Generation**
**What it does:** AI suggests complete outfits for specific events.

**Technology:** GPT-2 + Semantic Matching

**Complexity:** Medium | **Time:** 2 hours

**How it works:**
- User inputs occasion (wedding, date, gym, casual)
- AI generates outfit suggestions
- Ranks by match score
- User can save as "Outfit"

---

## ⚡ QUICK START: Add Outfit Recommendation Engine

This is the easiest and most useful feature. Takes 2-3 hours!

---

### Step 1: Install Dependencies

```bash
cd c:\Users\Ishanvi Kaushik\Documents\Fitora\server
npm install @xenova/transformers dotenv axios
```

**What these do:**
- `@xenova/transformers` - Run Hugging Face models in Node.js
- `dotenv` - Load environment variables
- `axios` - Make API calls

---

### Step 2: Create ML Service

Create file: `server/src/services/ml.service.ts`

```typescript
import { pipeline } from '@xenova/transformers';

// Initialize the model (runs on first use)
let embeddingModel: any = null;

// Get embeddings for text (converts words to numbers AI understands)
export async function getEmbedding(text: string): Promise<number[]> {
  if (!embeddingModel) {
    // Use Hugging Face's free embedding model
    embeddingModel = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    );
  }
  
  const embedding = await embeddingModel(text, {
    pooling: 'mean',
    normalize: true,
  });
  
  return Array.from(embedding.data);
}

// Calculate similarity between two text pieces (0 = different, 1 = identical)
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Generate outfit recommendations
export async function recommendOutfits(
  occasion: string,
  userClothes: any[],
  topN: number = 5
): Promise<any[]> {
  // Get AI understanding of the occasion
  const occasionEmbedding = await getEmbedding(occasion);
  
  // Score each clothing item
  const scored = await Promise.all(
    userClothes.map(async (item) => {
      const itemDescription = `${item.name} ${item.category} ${item.color} ${item.subcategory}`;
      const itemEmbedding = await getEmbedding(itemDescription);
      
      // Calculate how well this item matches the occasion
      const score = cosineSimilarity(occasionEmbedding, itemEmbedding);
      
      return {
        item,
        score,
        reason: generateReason(occasion, item, score),
      };
    })
  );
  
  // Return top N recommendations
  return scored.sort((a, b) => b.score - a.score).slice(0, topN);
}

// Generate human-readable explanation
function generateReason(occasion: string, item: any, score: number): string {
  const confidence = Math.round(score * 100);
  
  if (confidence >= 80) {
    return `Perfect match for ${occasion}`;
  } else if (confidence >= 60) {
    return `Good choice for ${occasion}`;
  } else {
    return `Could work for ${occasion}`;
  }
}
```

---

### Step 3: Create API Controller

Create file: `server/src/controllers/ai.controller.ts`

```typescript
import { Request, Response } from 'express';
import { recommendOutfits } from '../services/ml.service';
import Clothing from '../models/Clothing';

// GET /ai/recommend?occasion=business%20meeting
export async function getOutfitRecommendations(req: Request, res: Response) {
  try {
    const { occasion } = req.query;
    const userId = (req as any).user.id; // From auth middleware
    
    if (!occasion) {
      return res.status(400).json({ error: 'Occasion is required' });
    }
    
    // Get user's clothes
    const userClothes = await Clothing.find({ user: userId });
    
    if (userClothes.length === 0) {
      return res.status(400).json({ 
        error: 'Add some clothes to your wardrobe first!' 
      });
    }
    
    // Get recommendations
    const recommendations = await recommendOutfits(
      occasion as string,
      userClothes,
      5
    );
    
    res.json({
      occasion,
      recommendations: recommendations.map((r) => ({
        item: r.item,
        matchScore: Math.round(r.score * 100), // Convert to percentage
        reason: r.reason,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
```

---

### Step 4: Create API Route

Create/update file: `server/src/routes/ai.routes.ts`

```typescript
import { Router } from 'express';
import { getOutfitRecommendations } from '../controllers/ai.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Protected route - user must be logged in
router.get('/recommend', authenticateToken, getOutfitRecommendations);

export default router;
```

---

### Step 5: Register Route in App

Edit file: `server/src/app.ts`

Add this line in the imports section:

```typescript
import aiRoutes from './routes/ai.routes';
```

Add this line before the export statement:

```typescript
app.use('/ai', aiRoutes);
```

---

### Step 6: Frontend Integration

Create file: `client/src/pages/Recommendations.tsx`

```typescript
import React, { useState } from 'react';
import { axiosInstance } from '../api/axiosConfig';

export default function Recommendations() {
  const [occasion, setOccasion] = useState('casual');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const occasions = [
    'casual',
    'business meeting',
    'date night',
    'gym workout',
    'formal event',
    'beach',
    'outdoor adventure',
  ];

  const handleGetRecommendations = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/ai/recommend', {
        params: { occasion },
      });
      setRecommendations(response.data.recommendations);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">AI Outfit Recommendations</h1>

      <div className="mb-8 p-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
        <label className="block text-white font-semibold mb-4">
          What's the occasion?
        </label>
        <select
          value={occasion}
          onChange={(e) => setOccasion(e.target.value)}
          className="w-full p-3 rounded mb-4"
        >
          {occasions.map((occ) => (
            <option key={occ} value={occ}>
              {occ.charAt(0).toUpperCase() + occ.slice(1)}
            </option>
          ))}
        </select>

        <button
          onClick={handleGetRecommendations}
          disabled={loading}
          className="w-full bg-white text-purple-600 font-bold py-3 rounded hover:bg-gray-100"
        >
          {loading ? 'Getting Recommendations...' : 'Get Recommendations'}
        </button>
      </div>

      {recommendations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="p-6 border-2 border-purple-300 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{rec.item.name}</h2>
                  <p className="text-gray-600">
                    {rec.item.category} • {rec.item.color}
                  </p>
                </div>
                <div className="bg-purple-600 text-white px-4 py-2 rounded-full font-bold">
                  {rec.matchScore}%
                </div>
              </div>

              {rec.item.imageUrl && (
                <img
                  src={rec.item.imageUrl}
                  alt={rec.item.name}
                  className="w-full h-48 object-cover rounded mb-4"
                />
              )}

              <p className="text-sm text-gray-700 italic">{rec.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### Step 7: Add Route to Navigation

Edit file: `client/src/App.tsx`

Add this route to your Router:

```typescript
import Recommendations from './pages/Recommendations';

// Inside Routes:
<Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
```

Add navigation link in header:

```typescript
<Link to="/recommendations" className="nav-link">
  🤖 AI Recommendations
</Link>
```

---

### Step 8: Test It!

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
cd client
npm run dev
```

Visit: `http://localhost:5173/recommendations`

1. Add some clothes to your wardrobe
2. Select an occasion
3. Click "Get Recommendations"
4. See AI-powered suggestions!

---

## 📊 Expected Output

```json
{
  "occasion": "business meeting",
  "recommendations": [
    {
      "item": {
        "name": "Blue Blazer",
        "category": "jacket",
        "color": "blue"
      },
      "matchScore": 94,
      "reason": "Perfect match for business meeting"
    },
    {
      "item": {
        "name": "White Dress Shirt",
        "category": "top",
        "color": "white"
      },
      "matchScore": 92,
      "reason": "Perfect match for business meeting"
    }
  ]
}
```

---

## 🚀 Other ML Features (Pre-built Templates)

### Image Classification

```typescript
// Automatically detect clothing category from image
import { pipeline } from '@xenova/transformers';

const classifier = await pipeline(
  'zero-shot-image-classification',
  'Xenova/clip-vit-base-patch32'
);

const result = await classifier(imageUrl, [
  'shirt',
  'pants',
  'dress',
  'jacket',
  'shoes',
]);

// Result: { label: 'shirt', score: 0.95 }
```

---

### Text Generation (Style Advice)

```typescript
// Generate fashion tips
import { pipeline } from '@xenova/transformers';

const generator = await pipeline('text-generation', 'Xenova/gpt2');

const advice = await generator(
  'For a professional business look, you should wear',
  {
    max_new_tokens: 20,
  }
);

// Result: "a well-fitted blazer with neutral colors and polished shoes"
```

---

### Sentiment Analysis (User Feedback)

```typescript
// Analyze if user liked the recommendation
const sentiment = await pipeline('sentiment-analysis');

const result = await sentiment('This outfit looks amazing!');
// Result: { label: 'POSITIVE', score: 0.99 }
```

---

## 🎨 Available Hugging Face Models

### Recommended for Fitora

| Model | Use Case | Size | Speed |
|-------|----------|------|-------|
| `Xenova/all-MiniLM-L6-v2` | Text embeddings (recommended) | 22 MB | ⚡ Fast |
| `Xenova/clip-vit-base-patch32` | Image classification | 150 MB | ⚡ Medium |
| `Xenova/bert-base-cased` | Text understanding | 110 MB | ⚡ Fast |
| `Xenova/distilbert-base-uncased` | Lightweight text processing | 67 MB | ⚡ Very Fast |
| `Xenova/gpt2` | Text generation | 124 MB | ⚡ Medium |

---

## 🔧 Troubleshooting

### Model Download Issues

**Problem:** "Error downloading model"

**Solution:**
```bash
# Clear model cache
rm -r ~/.cache/huggingface/

# Try again - it will redownload
npm run dev
```

---

### Performance Issues

**Problem:** "Recommendations take too long"

**Solution:**
1. Use lighter model: `Xenova/distilbert-base-uncased` instead of BERT
2. Cache embeddings in database (calculate once, use many times)
3. Run on GPU if available

---

### Out of Memory

**Problem:** "JavaScript heap out of memory"

**Solution:**
```bash
# Run Node with more memory
set NODE_OPTIONS=--max-old-space-size=4096
npm run dev
```

---

## 💡 Pro Tips

### 1. Cache Embeddings for Performance

Instead of calculating embeddings every time, store them:

```typescript
// In Clothing model, add:
embeddings: {
  type: [Number],
  default: [],
}

// When adding clothes, save embedding:
const embedding = await getEmbedding(description);
clothing.embeddings = embedding;
```

---

### 2. Batch Process with Queue

For many items, use a queue:

```typescript
import Bull from 'bull';

const embeddingQueue = new Bull('embeddings');

embeddingQueue.process(async (job) => {
  return await getEmbedding(job.data.text);
});
```

---

### 3. Add User Feedback Loop

Let users rate recommendations:

```typescript
router.post('/recommend/:id/rate', (req, res) => {
  const { rating } = req.body; // 1-5 stars
  // Store rating to improve future recommendations
});
```

---

## 📚 Next Steps

1. **Implement Outfit Recommendations** (follow Step 1-8 above)
2. **Add image classification** for auto-categorization
3. **Integrate weather API** for weather-based suggestions
4. **Deploy ML service** to production
5. **Monitor performance** and optimize

---

## 🎯 Deployment Considerations

### On Vercel (Frontend)

No changes needed - Hugging Face calls go through your backend.

### On Render/Railway (Backend)

1. Add build step to download models:

```json
{
  "buildCommand": "npm install && npm run build"
}
```

2. Models will be cached in node_modules

3. First request might be slow (~30s) as model loads, then instant

---

## 💰 Cost Analysis

**Hugging Face Models:** FREE ✅
- No API keys needed
- No rate limits
- Runs on your server
- Open source

**Hosting Impact:**
- Vercel: No change
- Render: May need standard plan ($7/month) for larger models
- Railway: $5/month base + usage

---

## 🤝 Community Resources

- **Hugging Face Docs:** https://huggingface.co/docs/transformers.js/
- **Model Hub:** https://huggingface.co/models
- **Community Discord:** https://discord.com/invite/JfAtqEZZVe

---

## ✨ Example Features Map

```
Fitora App
├── Core Features (Already Built) ✅
│   ├── User Auth
│   ├── Wardrobe CRUD
│   └── Image Upload
│
└── ML Features (Add These)
    ├── Outfit Recommendations ⭐ (Easy - 2 hours)
    ├── Image Classification 
    ├── Weather-Based Suggestions
    ├── Style Analysis
    └── Fashion Advisor
```

---

**Ready to add AI?** Start with [Outfit Recommendations](#quick-start-add-outfit-recommendation-engine)! 🚀

It's easier than you think, and your users will love it! 🎉
