import { Router } from "express"
import { Request,Response } from "express"

const worker = Router();


worker.get("/worker",(req:Request,res:Response)=>{
    // try{

    //     /*
    //     search = "plumber"
    //     price 1 for low to high
    //     price 2 for high to low
    //     rating 1 for low to high
    //     rating 2 for high to low
    //     location true or false
    //     userlocation codintes
    //     */
    //     const {search, price, rating, location , userLocation } = req.body;

        
    //     let query = {};

    //     if(search){
    //         query.category = { $regex: search, $options: "i" };
    //     }

    //     let sortOption = {};

    //     if (price === 1) sortOption.price = 1;
    //     if (price === 2) sortOption.price = -1;

    //     if (rating === 1) sortOption.rating = 1;
    //     if (rating === 2) sortOption.rating = -1;
    //     }


    // res.json({"workers":"this is workers"})
})

worker.get("/worker/:id",(req:Request,res:Response)=>{
    res.json({"worker/id":"this is the workers details"})
})



module.exports = worker;