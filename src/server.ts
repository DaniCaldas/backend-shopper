import express from 'express';
import cors from 'cors';
import { router } from './routes/router';

const app = express();
app.use(cors);
app.use(router)

app.listen(process.env.PORT || 8000, () => console.log("running !"));