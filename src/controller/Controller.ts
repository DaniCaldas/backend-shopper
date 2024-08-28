import { PrismaClient } from "@prisma/client";
import { Response, Request } from "express";

const api = process.env.GEMINI_API_URL;
const key = process.env.GEMINI_API_KEY;
const prisma = new PrismaClient();

export const upload = async (req: Request, res:Response) =>{
    try {    
        const {image, costumer_code, measure_datetime, measure_type} = req.body;
        const dados = await prisma.table.create({
            data:{
                image, 
                costumer_code, 
                measure_datetime, 
                measure_type
            }
        });
        return res.status(200).json({

        })
    } catch (error) {}

}

