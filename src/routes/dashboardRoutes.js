"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dashboardController_1 = require("../controllers/dashboardController");
const auth_1 = require("../middleware/auth"); // Certifique-se do caminho correto
const router = express_1.default.Router();
router.get("/stats", auth_1.authenticate, dashboardController_1.dashboardController.getStats);
exports.default = router;
