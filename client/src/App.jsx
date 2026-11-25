import React,{useEffect,useState} from "react";
import axios from "axios";

const API="http://localhost:5000/api";
const authHeaders=t=>({headers:{Authorization:`Bearer ${t}`}});

function Login({onLogin}){
 const [register,setRegister]=useState(false),[form,setForm]=useState({name:"",email:"",password:""}),[msg,setMsg]=useState("");
 const submit=async e=>{
  e.preventDefault();
  try{
   const r=await axios.post(API+(register?"/auth/register":"/auth/login"),form);
   if(register){setMsg("Account created. Please login.");setRegister(false)}
   else onLogin(r.data);
  }catch(e){setMsg(e.response?.data?.message||"Request failed")}
 };
 return <div className="login"><div className="login-card">
  <div className="brand">Pulse<span>Board</span></div><h1>{register?"Create account":"Welcome back"}</h1>
  <p>Social media management made simple.</p>{msg&&<div className="msg">{msg}</div>}
  <form onSubmit={submit}>{register&&<input placeholder="Full name" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>}
  <input type="email" placeholder="Email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
  <input type="password" placeholder="Password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
  <button>{register?"Create Account":"Login"}</button></form>
  <button className="link" onClick={()=>setRegister(!register)}>{register?"Already have an account? Login":"Create a new account"}</button>
 </div></div>
}

function App(){
 const [session,setSession]=useState(()=>JSON.parse(localStorage.getItem("session")||"null"));
 if(!session)return <Login onLogin={d=>{localStorage.setItem("session",JSON.stringify(d));setSession(d)}}/>;
 return <Dashboard session={session} logout={()=>{localStorage.clear();setSession(null)}}/>
}

function Dashboard({session,logout}){
 const token=session.token,user=session.user;
 const [stats,setStats]=useState(null),[posts,setPosts]=useState([]),[notes,setNotes]=useState([]),[view,setView]=useState("overview");
 const [showCreate,setShowCreate]=useState(false);
 const [form,setForm]=useState({platform:"Instagram",content:"",status:"published",scheduledAt:"",impressions:0,likes:0,comments:0,shares:0});
 const load=async()=>{
  const h=authHeaders(token);
  const [s,p,n]=await Promise.all([axios.get(API+"/dashboard/stats",h),axios.get(API+"/posts",h),axios.get(API+"/dashboard/notifications",h)]);
  setStats(s.data);setPosts(p.data);setNotes(n.data);
 };
 useEffect(()=>{load()},[]);
 const create=async e=>{
  e.preventDefault();
  try{await axios.post(API+"/posts",{...form,impressions:Number(form.impressions),likes:Number(form.likes),comments:Number(form.comments),shares:Number(form.shares),scheduledAt:form.scheduledAt||null},authHeaders(token));
  setShowCreate(false);setForm({platform:"Instagram",content:"",status:"published",scheduledAt:"",impressions:0,likes:0,comments:0,shares:0});load()}
  catch(e){alert(e.response?.data?.message||"Could not create post")}
 };
 const remove=async id=>{if(confirm("Delete this post?")){await axios.delete(API+"/posts/"+id,authHeaders(token));load()}};
 const engagement=stats?Math.round(((stats.likes+stats.comments+stats.shares)/(stats.impressions||1))*10000)/100:0;

 return <div className="shell">
  <aside className="sidebar"><div className="brand">Pulse<span>Board</span></div>
   <div className="profile"><div className="avatar">{user.name?.[0]?.toUpperCase()}</div><div><b>{user.name}</b><small>Creator account</small></div></div>
   <nav><button className={view==="overview"?"active":""} onClick={()=>setView("overview")}>▦ Overview</button>
   <button className={view==="posts"?"active":""} onClick={()=>setView("posts")}>◉ Content</button>
   <button className={view==="analytics"?"active":""} onClick={()=>setView("analytics")}>⌁ Analytics</button>
   <button className={view==="notifications"?"active":""} onClick={()=>setView("notifications")}>♢ Notifications</button></nav>
   <button className="logout" onClick={logout}>↪ Logout</button>
  </aside>
  <main className="content"><header><div><h1>{view==="overview"?"Good morning, "+user.name+" 👋":view[0].toUpperCase()+view.slice(1)}</h1><p>Here is what's happening with your social channels.</p></div>
   <button onClick={()=>setShowCreate(true)}>＋ Create Post</button></header>

   {view==="overview"&&stats&&<><section className="cards">
    <Stat icon="👥" label="Total Reach" value={stats.impressions.toLocaleString()} change="+12.5%"/>
    <Stat icon="❤️" label="Engagement" value={engagement+"%"} change="+4.2%"/>
    <Stat icon="◎" label="Posts Published" value={stats.published} change="+8.1%"/>
    <Stat icon="↗" label="Total Shares" value={stats.shares.toLocaleString()} change="+18.7%"/>
   </section>
   <section className="two"><div className="panel"><div className="panel-title"><h2>Platform Performance</h2><span>All time</span></div>
    {["Instagram","Facebook","Twitter","LinkedIn"].map(p=><div className="platform" key={p}><div className="platform-name"><i className={"dot "+p.toLowerCase()}></i><b>{p}</b></div><div className="bar"><span style={{width:Math.min(100,(stats.byPlatform[p]||0)*18+8)+"%"}}></span></div><strong>{stats.byPlatform[p]||0} posts</strong></div>)}
   </div><div className="panel"><div className="panel-title"><h2>Content Status</h2></div>
    <div className="donut"><div><b>{stats.total}</b><small>Total posts</small></div></div>
    <div className="legend"><span>● Published <b>{stats.published}</b></span><span>● Scheduled <b>{stats.scheduled}</b></span><span>● Drafts <b>{stats.drafts}</b></span></div>
   </div></section></>}

   {view==="posts"&&<section className="panel"><div className="panel-title"><h2>Your Posts</h2><span>{posts.length} total</span></div>{posts.length===0?<p className="empty">No posts yet. Create your first post.</p>:posts.map(p=><Post key={p._id} p={p} remove={remove}/>)}</section>}

   {view==="analytics"&&stats&&<section className="analytics-grid"><Metric title="Impressions" value={stats.impressions}/><Metric title="Likes" value={stats.likes}/><Metric title="Comments" value={stats.comments}/><Metric title="Shares" value={stats.shares}/><Metric title="Engagement Rate" value={engagement+"%"}/><Metric title="Published Posts" value={stats.published}/></section>}

   {view==="notifications"&&<section className="panel"><div className="panel-title"><h2>Notifications</h2></div>{notes.length?notes.map(n=><div className="notification" key={n._id}><span>🔔</span><div>{n.message}<small>{new Date(n.createdAt).toLocaleString()}</small></div></div>):<p className="empty">No notifications.</p>}</section>}
  </main>

  {showCreate&&<div className="modal"><div className="modal-card"><div className="panel-title"><h2>Create Post</h2><button className="close" onClick={()=>setShowCreate(false)}>×</button></div>
   <form onSubmit={create}><label>Platform<select value={form.platform} onChange={e=>setForm({...form,platform:e.target.value})}><option>Instagram</option><option>Facebook</option><option>Twitter</option><option>LinkedIn</option></select></label>
   <label>Content<textarea rows="5" placeholder="What do you want to share?" required value={form.content} onChange={e=>setForm({...form,content:e.target.value})}/></label>
   <div className="form-row"><label>Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="published">Published</option><option value="scheduled">Scheduled</option><option value="draft">Draft</option></select></label>
   <label>Scheduled time<input type="datetime-local" value={form.scheduledAt} onChange={e=>setForm({...form,scheduledAt:e.target.value})}/></label></div>
   <div className="form-row"><label>Impressions<input type="number" value={form.impressions} onChange={e=>setForm({...form,impressions:e.target.value})}/></label><label>Likes<input type="number" value={form.likes} onChange={e=>setForm({...form,likes:e.target.value})}/></label></div>
   <button>Create Post</button></form>
  </div></div>}
 </div>
}

function Stat({icon,label,value,change}){return <div className="stat"><span className="stat-icon">{icon}</span><small>{label}</small><strong>{value}</strong><em>{change}</em></div>}
function Metric({title,value}){return <div className="metric"><span>{title}</span><b>{typeof value==="number"?value.toLocaleString():value}</b><small>Compared with previous period</small></div>}
function Post({p,remove}){return <div className="post"><div className="post-main"><span className={"platform-tag "+p.platform.toLowerCase()}>{p.platform}</span><p>{p.content}</p><small>{new Date(p.createdAt).toLocaleString()}</small></div><div className="post-stats"><span>👁 {p.impressions}</span><span>♥ {p.likes}</span><span>💬 {p.comments}</span><span>↗ {p.shares}</span><button onClick={()=>remove(p._id)}>Delete</button></div></div>}

export default App;
