import express from "express";
import Post from "../models/Post.js";
import Notification from "../models/Notification.js";
import auth from "../middleware/auth.js";
const router=express.Router();

router.get("/stats",auth,async(req,res)=>{
 const posts=await Post.find({author:req.user._id});
 const total=posts.length;
 const published=posts.filter(p=>p.status==="published").length;
 const scheduled=posts.filter(p=>p.status==="scheduled").length;
 const drafts=posts.filter(p=>p.status==="draft").length;
 const likes=posts.reduce((s,p)=>s+p.likes,0);
 const comments=posts.reduce((s,p)=>s+p.comments,0);
 const shares=posts.reduce((s,p)=>s+p.shares,0);
 const impressions=posts.reduce((s,p)=>s+p.impressions,0);
 const byPlatform={};
 posts.forEach(p=>{byPlatform[p.platform]=(byPlatform[p.platform]||0)+1});
 res.json({total,published,scheduled,drafts,likes,comments,shares,impressions,byPlatform});
});

router.get("/notifications",auth,async(req,res)=>{
 res.json(await Notification.find({user:req.user._id}).sort({createdAt:-1}).limit(10));
});

export default router;
