import express from "express";
import Post from "../models/Post.js";
import Notification from "../models/Notification.js";
import auth from "../middleware/auth.js";
const router=express.Router();

router.get("/",auth,async(req,res)=>{
 const posts=await Post.find({author:req.user._id}).sort({createdAt:-1});
 res.json(posts);
});

router.post("/",auth,async(req,res)=>{
 const post=await Post.create({...req.body,author:req.user._id});
 await Notification.create({user:req.user._id,message:`New ${post.platform} post created`,type:"post"});
 res.status(201).json(post);
});

router.put("/:id",auth,async(req,res)=>{
 const post=await Post.findOneAndUpdate({_id:req.params.id,author:req.user._id},req.body,{new:true});
 if(!post)return res.status(404).json({message:"Post not found"});
 res.json(post);
});

router.delete("/:id",auth,async(req,res)=>{
 const post=await Post.findOneAndDelete({_id:req.params.id,author:req.user._id});
 if(!post)return res.status(404).json({message:"Post not found"});
 res.json({message:"Post deleted"});
});

router.patch("/:id/engagement",auth,async(req,res)=>{
 const post=await Post.findOneAndUpdate(
  {_id:req.params.id,author:req.user._id},
  {$set:{likes:req.body.likes||0,comments:req.body.comments||0,shares:req.body.shares||0,impressions:req.body.impressions||0}},
  {new:true}
 );
 if(!post)return res.status(404).json({message:"Post not found"});
 res.json(post);
});

export default router;
