import { response, Router } from "express"
import { Request,Response } from "express"

const payment = Router();

payment.post("/payment/order",(req:Request,res:Response)=>{

})

payment.post("/payment/verify",(req:Request,res:Response)=>{

})

payment.get("/payment/status/:bookingid",(req:Request,res:Response)=>{
    
})

module.exports = payment; 