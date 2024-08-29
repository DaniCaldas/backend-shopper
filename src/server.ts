import express from 'express';
import cors from 'cors';
import router  from './routes/routes';
import dotenv from  'dotenv'
import { UploadFile } from './controller/Controller';

dotenv.config()
const app = express();
app.use(express.json());
app.use(cors());
app.use(router);

app.listen(process.env.PORT, () => console.log("running na porta: " + process.env.PORT));