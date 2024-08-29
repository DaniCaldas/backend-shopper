import { PrismaClient } from "@prisma/client";
import { Response, Request } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import fs from 'fs';
import path from "path";
import { v4 as uuidv4 } from 'uuid';

const key = "AIzaSyAneHIkZky1TyzQIy4kTPbfZSn0m_1AEPI";
const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(key);
const fileManager = new GoogleAIFileManager(key);

export const UploadFile = async () =>{
    try {    
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash'})
        
        var img1 = path.join(__dirname, './triangulo.png');
        var img = Buffer.from(fs.readFileSync(img1)).toString('base64');
      
        const result = await model.generateContent([
            'return me only the number',
            { inlineData: {data: img, mimeType: 'image/png' }}
        ]);
        console.log(result.response.text())
        return result.response.text()
    } catch (error) {
        console.log(error)
        return error;
    }

}


export const Upload  = async (req: Request, res: Response) => {
    try {
        const { image, customer_code, measure_datetime, measure_type} = req.body;
        console.log("aqui")
        const newMeasure = await prisma.measures.create({
            data:{
                measure_uuid: uuidv4(),
                measure_datetime: measure_datetime,
                measure_type: measure_type,
                has_confirmed: false,
                image_url: image,
                costumer_id: customer_code
            }
        })
        .then((response) => {
            return res.status(200).json({
                measure_uuid: response.measure_uuid,
                measure_value: UploadFile,
                measure_url: `dsadasd`
            })
        })
        .catch((error) => {
            return res.status(500).send(error)
        })
    } catch (error) {
        return error
    }
}