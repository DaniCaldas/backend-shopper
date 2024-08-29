import { Router, Response, Request } from "express";
import { CreateCostumer, Foto, Upload } from "../controller/Controller";

const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.send('OK')
});

router.post("/teste", Foto)
router.post('/upload', Upload);
router.post("/costumer", CreateCostumer);

export default router;