import { PrismaClient } from "@prisma/client";
import { Response, Request } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import fs from 'fs';
import path from "path";
import {v4 as uuid} from "uuid"

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_URL);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

type Measures = {
    measure_uuid: string;
    measure_datetime: Date;
    measure_type: string;
    has_confirmed: boolean;
    image_url: string;
    costumer_id: string;
};

// Criação do Costumer
export const CreateCostumer = async (req: Request, res: Response) => {
    try {
        const newCostumer = await prisma.costumer.create({data:{}})
        return res.status(201).send(newCostumer);
        
    } catch (error) {
        return res.status(500).send(error)
    }
}

// UPLOAD DE IMAGENS
export const Upload  = async (req: Request, res: Response) => {
    const { image, costumer_code, measure_type} = req.body;

    // CONDIÇÃO PARA VERIFICAR DADOS DA REQUISIÇÃO
    if(!image || !costumer_code || !measure_type){
        return res.status(400).json({
                error_code: "INVALID_DATA",
                error_description: "Faltam dados na requisição!"
        })
    }

    // FILTRO PARA PEGAR LEITURAS NO MÊS ESPECÍFICO
    var mouth = new Date().getMonth() + 1;
   
    const all_measures = await prisma.measures.findMany(
        {
            where:{
                measure_datetime:{
                    gte: new Date(2024, mouth -1, 1),
                    lt: new Date(2024, mouth + 1, 1)
                }
            }
        }
    );

    const measures_in_mouth = all_measures.filter((measure: Measures) => {
        const datemeasure = new Date(measure.measure_datetime);
        return datemeasure.getMonth() + 1 === mouth && measure.costumer_id === costumer_code;
    })

    if(measures_in_mouth.length > 0){
        return res.status(409).json(
            {
                error_code: "DOUBLE_REPORT",
                error_description: "Leitura do mês já realizada"
            }
        );
    }
    else{

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash'})

        const img = image.replace(/^data:image\/png;base64,/, "");

        const file = path.join("src/img/", `medida-${uuid()}.png`);

        fs.writeFile(file, img, 'base64', (err) => {
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
            { inlineData: {data: img, mimeType: 'image/png' }}
        ])
        console.log(file)
        const value = result.response.text();
        try {
            const newMeasure = await prisma.measures.create({
                data:{
                    measure_type: measure_type,
                    image_url: `src/img/imagem${uuid()}.png`,
                    costumer_id: costumer_code
                }
            })
        
            return res.status(201).send({
                measure_url: file,
                measure_value: value,
                measure_uuid: newMeasure.measure_uuid
            })  
        } catch (error) {
            return res.status(500).send(error)
        }
        
    }
}


// Confirmação de valor
export const Confirm = async (req: Request, res: Response) => {
    const { measure_uuid, confirmed_value } = req.body;

    // VALIDAÇÃO DOS PARÂMETROS
    if(!measure_uuid || !confirmed_value){
        return res.status(400).send({
            error_code: "INVALID_DATA",
            error_description: "Os dados fornecidos no corpo da requisição são inválidos"
        })
    }

    // VERIFICAÇÃO DO CÓDIGO DE LEITURA
    const measure_exists = await prisma.measures.findFirst({
        where:{
            measure_uuid: measure_uuid
        }
    })

    if(!measure_exists){
        return res.status(404).json({
            error_code: "MEASURE_NOT_FOUND",
            error_description: "Leitura do mês já realizada"
        })
    }

    // VERIFICAÇÃO DA COMFIRMAÇÃO DA LEITURA
    const measure_confirmed = await prisma.measures.findFirst({
        where:{
            measure_uuid: measure_uuid
        }
    })
    if(measure_confirmed?.has_confirmed === true){
        return res.status(409).json({
            error_code: "CONFIRMATION_DUPLICATE",
            error_description: "Leitura do mês já realizada"
        })
    }
    else{
        await prisma.measures.update({
            data:{
                has_confirmed: true
            },
            where:{
                measure_uuid: measure_uuid
            }
        })
        .then(() => {
            return res.send(200).json({
                success: true
            });
        })
        .catch((error: Error) => {
            return res.status(500).send(error);
        })
    }
}

// Listagem de Measures
export const List = async (req: Request, res: Response) => {
    let costumer_code = req.params.costumer_code;
    let measure_type = req.query.measure_type;

    const measures_list = await prisma.measures.findMany();

    const measures_filter_code = measures_list.filter((measures: Measures) => {
        return measures.costumer_id === costumer_code;
    })

    const measures_filter_type = measures_list.filter((measures: Measures) => {
        return measures.measure_type === measure_type && measures.costumer_id === costumer_code;
    })

    if(measures_filter_code.length < 1){
        return res.status(404).json({
            error_code: "MEASURES_NOT_FOUND",
            error_description: "Nenhuma leitura encontrada"
        })
    }
    if(!measure_type || measure_type === ""){
        return res.status(200).json({
            costumer_code: costumer_code,
            measures: measures_filter_code
        })
    }
    if(measure_type === "WATER" || measure_type ==="GAS"){
        return res.status(200).json({
            costumer_code: costumer_code,
            measures: measures_filter_type,
            test:measure_type
        })
    }
    else{
        return res.status(400).json({
            error_code: "INVALID_TYPE",
            error_description: 'Tipo de medição não permitida',
            test: measure_type
        })
    }
}