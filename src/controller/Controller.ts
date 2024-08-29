import { PrismaClient } from "@prisma/client";
import { Response, Request, response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import fs from 'fs';
import path from "path";

const key = "AIzaSyAneHIkZky1TyzQIy4kTPbfZSn0m_1AEPI";
const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(key);
const fileManager = new GoogleAIFileManager(key);


export const Foto = async (req: Request, res: Response) => {
    try {
        const { image } = req.body;

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash'})

        const file = path.join("src/img/", "imagem.png");

        fs.writeFile(file, image, 'base64', (err) => {
            if (err) {
                console.error('Erro ao salvar a imagem:', err);
                return;
            }
            setTimeout(() => {
                fs.unlink(file, (err) => {
                    if (err) {
                        console.error('Erro ao deletar a imagem:', err);
                        return;
                    }
                    console.log('Imagem temporária deletada.');
                });
            }, 30000); // Deleta após 30 segundos
            
        })

        const result = await model.generateContent([
            'return me only the result number of image',
            { inlineData: {data: image, mimeType: 'image/png' }}
        ])
        return res.status(200).send(result.response.text());
    } catch (error) {
        res.status(500).send(error);  
    }
}

export const CreateCostumer = async (req: Request, res: Response) => {
    const { costumer_code } = req.body;

    let newCostumer  = prisma.costumer.create({data:{}})
    .then((response) => {
        return res.status(201).send(response);
    })
    .catch((error) => {
        return res.status(500).send(error)
    })
}

export const Upload  = async (req: Request, res: Response) => {
    const { image, customer_code, measure_type} = req.body;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash'})

    var img1 = path.join(__dirname, './triangulo.png');
    var img = Buffer.from(fs.readFileSync(img1)).toString('base64');
    
    const result = await model.generateContent([
        'return me only the number',
        { inlineData: {data: img, mimeType: 'image/png' }}
    ])
    const value = result.response.text();
    const newMeasure = await prisma.measures.create({
        data:{
            measure_type: measure_type,
            image_url: image,
            costumer_id: customer_code
        }
    })
    .then((response) => {
        return res.status(201).send({
            measure_url: image,
            measure_value: value,
            measure_uuid: response.measure_uuid
        })
    })
    .catch((error) => {
        return res.status(500).send(error)
    })
}