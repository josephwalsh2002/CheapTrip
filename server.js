require("dotenv").config();
const express=require("express"),cors=require("cors"),path=require("path");
const app=express(); app.use(cors()); app.use(express.json()); app.use(express.static(path.join(__dirname,"public")));
const PORT=process.env.PORT||3000, TOKEN=process.env.DUFFEL_ACCESS_TOKEN;
app.get("/",(req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));
app.get("/health",(req,res)=>res.json({status:"ok",duffelConfigured:Boolean(TOKEN)}));
app.post("/api/flights/search",async(req,res)=>{
 try{
  if(!TOKEN)return res.status(500).json({error:"DUFFEL_ACCESS_TOKEN is not configured."});
  const {origin,destination,departureDate,returnDate,adults=1,cabinClass="economy"}=req.body;
  if(!origin||!destination||!departureDate)return res.status(400).json({error:"Origin, destination and departure date are required."});
  const o=origin.trim().toUpperCase(), d=destination.trim().toUpperCase();
  const slices=[{origin:o,destination:d,departure_date:departureDate}];
  if(returnDate)slices.push({origin:d,destination:o,departure_date:returnDate});
  const r=await fetch("https://api.duffel.com/air/offer_requests",{method:"POST",headers:{"Authorization":`Bearer ${TOKEN}`,"Duffel-Version":"v2","Content-Type":"application/json"},body:JSON.stringify({data:{slices,passengers:Array.from({length:Math.max(1,Number(adults)||1)},()=>({type:"adult"})),cabin_class:cabinClass,max_connections:2}})});
  const data=await r.json(); if(!r.ok)return res.status(r.status).json({error:"Duffel flight search failed",details:data}); res.json(data);
 }catch(e){res.status(500).json({error:"Flight search failed",details:e.message});}
});
app.listen(PORT,()=>console.log(`CheapTrip backend running on port ${PORT}`));