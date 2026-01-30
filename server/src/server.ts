import dotenv from "dotenv";
import app from "./app";//since we are using module NodeNext in tsconfig.json then .ts is automatically resolved so don't mention while importing
import connectDB from "./config/db";

dotenv.config();
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Fitora backend running on port ${PORT}`);
});
