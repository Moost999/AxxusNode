"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assistantController_1 = require("../controllers/assistantController");
const router = (0, express_1.Router)();
// Rotas para Assistants
router.post('/create-assistant', assistantController_1.assistantController.createAssistant);
router.get('/user/:userId', assistantController_1.assistantController.getAssistants);
router.get('/:id', assistantController_1.assistantController.getAssistantById);
router.patch('/:id', assistantController_1.assistantController.updateAssistant);
router.delete('/:id', assistantController_1.assistantController.deleteAssistant);
exports.default = router;
