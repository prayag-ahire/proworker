import { Request,Response,NextFunction } from "express"
import jwt from "jsonwebtoken";


const userAuth = (req:Request,res:Response,next:NextFunction)=>{
    const token = req.headers.authorization?.split(' ')[1];

    if(!token){
        return res.status(401).json({msg:"Authorization denied"});
    }

    try{
        const decoded = jwt.verify(token,"SkillSecret");

    }catch(err){
        res.status(401).json({msg:"Token is not valid"});
    }
}

module.exports = userAuth;