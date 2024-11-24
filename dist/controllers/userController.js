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
exports.getUserProfile = exports.loginUser = exports.registerUser = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
// const secret = process.env.JWT_SECRET
// if (!secret) {
//   throw new Error('JWT_SECRET is not defined in the environment variables');
// }
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
        res.status(400).json({ message: "All fields are required." });
        return;
    }
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400).json({ message: "Invalid email format." });
        return;
    }
    // Password strength validation
    if (password.length < 8) {
        res
            .status(400)
            .json({ message: "Password must be at least 8 characters long." });
        return;
    }
    try {
        // Check if user already exists
        const existingUser = yield prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: "Email is already registered." });
            return;
        }
        // Hash the password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Save the user
        const newUser = yield prisma.user.create({
            data: { fullName, email, password: hashedPassword },
        });
        // Generate JWT token
        // const token = jwt.sign(
        //   { userId: newUser.id, email: newUser.email },
        //   secret,
        //   { expiresIn: '1h' }
        // );
        res
            .status(201)
            .json({ message: "User registered successfully", user: newUser });
    }
    catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: "Email and password are required." });
        return;
    }
    try {
        // Check if user exists
        const user = yield prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ message: "Invalid email or password." });
            return;
        }
        // Verify password
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: "Invalid email or password." });
            return;
        }
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, fullName: user.fullName }, process.env.JWT_SECRET || "fallback-secret-key", { expiresIn: "1d" } // Token validity: 1 day
        );
        // Include fullName and token in the response
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                userId: user.id,
                email: user.email,
                fullName: user.fullName, // Include the user's full name
            },
        });
    }
    catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.loginUser = loginUser;
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "Unauthorized: No token provided." });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "fallback-secret-key");
        console.log("Decoded token:", decoded);
        const userId = decoded.userId;
        console.log("Extracted userId:", userId);
        if (!userId) {
            res.status(401).json({ message: "Unauthorized: Invalid token." });
            return;
        }
        // Fetch user data from the database
        const user = yield prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        // Fetch events created by the user using `userId`
        const eventsCreatedCount = yield prisma.event.count({
            where: { userId }, // Directly filter by `userId`
        });
        // Fetch events the user participated in using the `Participant` table
        const eventsParticipatedCount = yield prisma.participant.count({
            where: { userId }, // Directly filter by `userId` in the `Participant` model
        });
        res.status(200).json({
            fullName: user.fullName,
            email: user.email,
            eventsCreated: eventsCreatedCount,
            eventsParticipated: eventsParticipatedCount,
        });
    }
    catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});
exports.getUserProfile = getUserProfile;
//# sourceMappingURL=userController.js.map