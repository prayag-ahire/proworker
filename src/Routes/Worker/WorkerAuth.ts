import { Router } from "express";
import { Request,Response } from "express";

const router = Router();

router.get('/worker',(req,res)=>{
    res.send("This is auth route testing ")
})

router.post("/signup",(req:Request,res:Response)=>{
    res.send({"signup":"this is signup"})
})

router.post("/login",(req:Request,res:Response)=>{
    res.send({"login":"prayag ahire"})
})

router.post("/logut",(req:Request,res:Response)=>{
    res.send({"logut":"prayag ahire"})
})

router.get("/profile",(req:Request,res:Response)=>{
    res.send({"profile":"this is profile"})
})

router.put("/profile",(req:Request,res:Response)=>{
    res.send({"profile":"prayag ahire"})
})

module.exports = router;