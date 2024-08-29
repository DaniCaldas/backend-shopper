import { Router, Response, Request } from "express";
import { Upload, UploadFile } from "../controller/Controller";

const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.send('OK')
});

router.get('/w', () => UploadFile() )
router.post('/upload', () => Upload)

export default router;