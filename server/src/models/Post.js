import mongoose from "mongoose";
const schema=new mongoose.Schema({
 author:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 platform:{type:String,enum:["Instagram","Facebook","Twitter","LinkedIn"],required:true},
 content:{type:String,required:true},
 image:String,
 status:{type:String,enum:["draft","scheduled","published"],default:"published"},
 scheduledAt:Date,
 likes:{type:Number,default:0},
 comments:{type:Number,default:0},
 shares:{type:Number,default:0},
 impressions:{type:Number,default:0}
},{timestamps:true});
export default mongoose.model("Post",schema);
