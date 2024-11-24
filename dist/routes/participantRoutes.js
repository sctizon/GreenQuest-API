"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const participantController_1 = require("../controllers/participantController");
const router = express_1.default.Router();
router.post('/:id/signup', participantController_1.registerParticipant); // Sign up a participant for an event
router.get('/:id/participants', participantController_1.getParticipantsByEvent); // Get all participants for a specific event
exports.default = router;
//# sourceMappingURL=participantRoutes.js.map