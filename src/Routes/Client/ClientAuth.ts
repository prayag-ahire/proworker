import { Router } from "express";
import { Request,Response } from "express";


const userAuth = require("../userAuth");
const router = Router();

// this is the testing for user-authentication
router.get('/client',(req,res)=>{
    res.send("This is auth route testing ")
})

router.post("/signup",(req:Request,res:Response)=>{
    res.send({"signup":"this is signup"})
})

router.post("/login",(req:Request,res:Response)=>{
    res.send({"login":"prayag ahire"})
})

router.post("/logout",(req:Request,res:Response)=>{
    res.send({"logut":"prayag ahire"})
})

router.get("/profile",userAuth,(req:Request,res:Response)=>{
    res.send({"profile":"this is profile"})
})




router.put("/workers",userAuth,(req:Request,res:Response)=>{
    res.send({"profile":"prayag ahire"})
})

router.put("/booking",userAuth,(req:Request,res:Response)=>{
    res.send({"profile":"prayag ahire"})
})

router.put("/payment",userAuth,(req:Request,res:Response)=>{
    res.send({"profile":"prayag ahire"})
})

router.put("/reviews",userAuth,(req:Request,res:Response)=>{
    res.send({"profile":"prayag ahire"})
})

module.exports = router;
