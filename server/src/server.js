import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js";
import dashboardRoutes from "./routes/dashboard.js";

dotenv.config();
const app=express();
app.use(cors());
app.use(express.json());
app.get("/",(req,res)=>res.json({message:"Social Media Dashboard API is running"}));
app.use("/api/auth",authRoutes);
app.use("/api/posts",postRoutes);
app.use("/api/dashboard",dashboardRoutes);

const PORT=process.env.PORT||5000;

async function connectDatabase(){
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/social_dashboard";

  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
    return null;
  } catch (error) {
    console.warn("MongoDB connection failed, starting in-memory database:", error.message);
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    console.log("Connected to in-memory MongoDB");
    return mongoServer;
  }
}

connectDatabase()
  .then(()=>app.listen(PORT,()=>console.log(`Server running on http://localhost:${PORT}`)))
  .catch(e=>{console.error("Database startup failed:",e.message);process.exit(1)});
