import { response, Router } from "express"
import { Request,Response } from "express"

const Booking = Router();

Booking.post("/booking/create",(req:Request,res:Response)=>{

})

Booking.get("/workers/:id/slots",(req:Request,res:Response)=>{

})

Booking.put("/booking/:id/cancel",(req:Request,Res:Response)=>{

})

Booking.get("/booking/user/:userid",(req:Request,Res:Response)=>{

})

module.exports = Booking;