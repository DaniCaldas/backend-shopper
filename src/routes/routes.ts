import { Router, Response, Request } from "express";
import { Confirm, CreateCostumer, Foto, List, Upload } from "../controller/Controller";

const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.send('OK')
});

router.post('/upload', Upload);
router.post("/costumer", CreateCostumer);
router.patch('/confirm', Confirm);
router.get('/:costumer_code/list', List)

export default router;