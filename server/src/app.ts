import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.routes'
import clothingRoutes from "./routes/clothing.routes";
import uploadRoutes from "./routes/upload.routes";
import outfitRoutes from "./routes/outfit.routes";

const app= express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Fitora backend is running ");
});

app.use("/auth",authRoutes);
app.use("/clothes", clothingRoutes);
app.use("/upload",uploadRoutes);
app.use("/outfits", outfitRoutes);
export default app;

