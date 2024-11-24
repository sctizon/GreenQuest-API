"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const express_winston_1 = __importDefault(require("express-winston"));
const winston_1 = __importDefault(require("winston"));
const eventRoutes_1 = __importDefault(require("./routes/eventRoutes"));
const participantRoutes_1 = __importDefault(require("./routes/participantRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
exports.prisma = new client_1.PrismaClient();
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        app.use((0, cors_1.default)());
        app.use(express_1.default.json());
        app.use(body_parser_1.default.urlencoded({ extended: false })); // Create application/x-www-form-urlencoded parser
        // Log the whole request and response body
        express_winston_1.default.requestWhitelist.push("body");
        express_winston_1.default.responseWhitelist.push("body");
        // Logger
        app.use(express_winston_1.default.logger({
            transports: [new winston_1.default.transports.Console()],
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.json()),
            meta: false,
            msg: "HTTP {{req.method}} {{req.url}}",
            colorize: false,
        }));
        app.get("/", (_, res) => {
            // Route to test if the server is running
            res.send("Hello World!");
        });
        app.use("/uploads", express_1.default.static("uploads")); // Serve static files from the 'uploads' folder
        app.use("/api/events", eventRoutes_1.default);
        app.use("/api/participants", participantRoutes_1.default);
        app.use("/api/users", userRoutes_1.default);
        // Catch unregistered routes
        app.all("*", (req, res) => {
            res.status(404).json({ error: `Route ${req.originalUrl} not found` });
        });
        // Error logger
        app.use(express_winston_1.default.errorLogger({
            transports: [new winston_1.default.transports.Console()],
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.json()),
        }));
        app.listen(port, () => {
            console.log(`Server is listening on port ${port}`);
        });
    });
}
main()
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    yield exports.prisma.$connect();
}))
    .catch((e) => __awaiter(void 0, void 0, void 0, function* () {
    console.error(e);
    yield exports.prisma.$disconnect();
    process.exit(1);
}));
//# sourceMappingURL=index.js.map