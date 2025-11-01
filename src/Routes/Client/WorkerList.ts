import { Router } from "express"
import { Request,Response } from "express"

const worker = Router();


worker.get("/workers",(req:Request,res:Response)=>{
    res.json({"workers":"this is workers"})
})

worker.get("/worker/:id",(req:Request,res:Response)=>{
    // i need to make changes in this api for search filter
    res.json({"worker/id":"this is the workers details"})
})



module.exports = worker;