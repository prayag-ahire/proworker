import { Router } from "express";
import { Request,Response } from "express";

const router = Router();


router.post("/signup",(req:Request,res:Response)=>{
    res.send({"signup":"this is signup"})
})

router.post("/login",(req:Request,res:Response)=>{
    res.send({"login":"prayag ahire"})
})

router.post("/logout",(req:Request,res:Response)=>{
    res.send({"logut":"prayag ahire"})
})

module.exports = router;