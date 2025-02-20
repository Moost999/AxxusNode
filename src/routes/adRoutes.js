"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adController_1 = require("../controllers/adController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Ver anúncio
router.post('/view', auth_1.authenticate, adController_1.AdController.viewAd);
// Obter status de anúncios
router.get('/status', auth_1.authenticate, adController_1.AdController.getAdStatus);
exports.default = router;
