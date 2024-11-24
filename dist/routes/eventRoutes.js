"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const eventController_1 = require("../controllers/eventController");
const uploadMiddleware_1 = require("../middlewares/uploadMiddleware");
const router = express_1.default.Router();
router.post('/', uploadMiddleware_1.upload.single('image'), eventController_1.createEvent);
router.get('/', eventController_1.getAllEvents);
router.get('/:id', eventController_1.getEventById);
exports.default = router;
//# sourceMappingURL=eventRoutes.js.map