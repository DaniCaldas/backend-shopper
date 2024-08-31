"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.List = exports.Confirm = exports.Upload = exports.CreateCostumer = void 0;
const client_1 = require("@prisma/client");
const generative_ai_1 = require("@google/generative-ai");
const server_1 = require("@google/generative-ai/server");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const key = "AIzaSyAneHIkZky1TyzQIy4kTPbfZSn0m_1AEPI";
const prisma = new client_1.PrismaClient();
const genAI = new generative_ai_1.GoogleGenerativeAI(key);
const fileManager = new server_1.GoogleAIFileManager(key);
// Criação do Costumer
const CreateCostumer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newCostumer = yield prisma.costumer.create({ data: {} });
        return res.status(201).send(newCostumer);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.CreateCostumer = CreateCostumer;
// UPLOAD DE IMAGENS
const Upload = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { image, costumer_code, measure_type } = req.body;
    // CONDIÇÃO PARA VERIFICAR DADOS DA REQUISIÇÃO
    if (!image || !costumer_code || !measure_type) {
        return res.status(400).json({
            error_code: "INVALID_DATA",
            error_description: "Faltam dados na requisição!"
        });
    }
    // FILTRO PARA PEGAR LEITURAS NO MÊS ESPECÍFICO
    var mouth = new Date().getMonth() + 1;
    const all_measures = yield prisma.measures.findMany({
        where: {
            measure_datetime: {
                gte: new Date(2024, mouth - 1, 1),
                lt: new Date(2024, mouth + 1, 1)
            }
        }
    });
    const measures_in_mouth = all_measures.filter((measure) => {
        const datemeasure = new Date(measure.measure_datetime);
        return datemeasure.getMonth() + 1 === mouth && measure.costumer_id === costumer_code;
    });
    if (measures_in_mouth.length > 0) {
        return res.status(409).json({
            error_code: "DOUBLE_REPORT",
            error_description: "Leitura do mês já realizada"
        });
    }
    else {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const img = image.replace(/^data:image\/png;base64,/, "");
        const file = path_1.default.join("src/img/", `medida-${(0, uuid_1.v4)()}.png`);
        fs_1.default.writeFile(file, img, 'base64', (err) => {
            if (err) {
                console.error('Erro ao salvar a imagem:', err);
                return;
            }
            setTimeout(() => {
                fs_1.default.unlink(file, (err) => {
                    if (err) {
                        console.error('Erro ao deletar a imagem:', err);
                        return;
                    }
                    console.log('Imagem temporária deletada.');
                });
            }, 30000); // Deleta após 30 segundos
        });
        const result = yield model.generateContent([
            'return me only the result number of image',
            { inlineData: { data: img, mimeType: 'image/png' } }
        ]);
        console.log(file);
        const value = result.response.text();
        try {
            const newMeasure = yield prisma.measures.create({
                data: {
                    measure_type: measure_type,
                    image_url: `src/img/imagem${(0, uuid_1.v4)()}.png`,
                    costumer_id: costumer_code
                }
            });
            return res.status(201).send({
                measure_url: file,
                measure_value: value,
                measure_uuid: newMeasure.measure_uuid
            });
        }
        catch (error) {
            return res.status(500).send(error);
        }
    }
});
exports.Upload = Upload;
// Confirmação de valor
const Confirm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { measure_uuid, confirmed_value } = req.body;
    // VALIDAÇÃO DOS PARÂMETROS
    if (!measure_uuid || !confirmed_value) {
        return res.status(400).send({
            error_code: "INVALID_DATA",
            error_description: "Os dados fornecidos no corpo da requisição são inválidos"
        });
    }
    // VERIFICAÇÃO DO CÓDIGO DE LEITURA
    const measure_exists = yield prisma.measures.findFirst({
        where: {
            measure_uuid: measure_uuid
        }
    });
    if (!measure_exists) {
        return res.status(404).json({
            error_code: "MEASURE_NOT_FOUND",
            error_description: "Leitura do mês já realizada"
        });
    }
    // VERIFICAÇÃO DA COMFIRMAÇÃO DA LEITURA
    const measure_confirmed = yield prisma.measures.findFirst({
        where: {
            measure_uuid: measure_uuid
        }
    });
    if ((measure_confirmed === null || measure_confirmed === void 0 ? void 0 : measure_confirmed.has_confirmed) === true) {
        return res.status(409).json({
            error_code: "CONFIRMATION_DUPLICATE",
            error_description: "Leitura do mês já realizada"
        });
    }
    else {
        yield prisma.measures.update({
            data: {
                has_confirmed: true
            },
            where: {
                measure_uuid: measure_uuid
            }
        })
            .then(() => {
            return res.send(200).json({
                success: true
            });
        })
            .catch((error) => {
            return res.status(500).send(error);
        });
    }
});
exports.Confirm = Confirm;
// Listagem de Measures
const List = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let costumer_code = req.params.costumer_code;
    let measure_type = req.query.measure_type;
    const measures_list = yield prisma.measures.findMany();
    const measures_filter_code = measures_list.filter((measures) => {
        return measures.costumer_id === costumer_code;
    });
    const measures_filter_type = measures_list.filter((measures) => {
        return measures.measure_type === measure_type && measures.costumer_id === costumer_code;
    });
    if (measures_filter_code.length < 1) {
        return res.status(404).json({
            error_code: "MEASURES_NOT_FOUND",
            error_description: "Nenhuma leitura encontrada"
        });
    }
    if (!measure_type || measure_type === "") {
        return res.status(200).json({
            costumer_code: costumer_code,
            measures: measures_filter_code
        });
    }
    if (measure_type === "WATER" || measure_type === "GAS") {
        return res.status(200).json({
            costumer_code: costumer_code,
            measures: measures_filter_type,
            test: measure_type
        });
    }
    else {
        return res.status(400).json({
            error_code: "INVALID_TYPE",
            error_description: 'Tipo de medição não permitida',
            test: measure_type
        });
    }
});
exports.List = List;
