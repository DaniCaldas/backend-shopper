"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Controller_1 = require("../controller/Controller");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.send('OK');
});
router.post('/upload', Controller_1.Upload);
router.post("/costumer", Controller_1.CreateCostumer);
router.patch('/confirm', Controller_1.Confirm);
router.get('/:costumer_code/list', Controller_1.List);
exports.default = router;
