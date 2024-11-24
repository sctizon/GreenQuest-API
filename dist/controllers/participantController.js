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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParticipantsByEvent = exports.registerParticipant = void 0;
const __1 = require("..");
// Sign up a participant for an event
const registerParticipant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, phone, eventId, userId } = req.body;
    if (!name || !email || !phone || !eventId) {
        res.status(400).json({ error: "Missing required fields" });
    }
    try {
        const event = yield __1.prisma.event.findUnique({
            where: { id: parseInt(eventId, 10) },
        });
        if (!event) {
            res.status(404).json({ error: "Event not found" });
        }
        const participant = yield __1.prisma.participant.create({
            data: {
                name,
                email,
                phone,
                eventId: parseInt(eventId, 10),
                userId: userId ? parseInt(userId, 10) : null, // Optional user ID
            },
        });
        res.status(201).json(participant);
    }
    catch (error) {
        console.error("Error registering participant:", error);
        res.status(500).json({ error: "Failed to register participant" });
    }
});
exports.registerParticipant = registerParticipant;
// Get participants for an event
const getParticipantsByEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { eventId } = req.params;
    try {
        const participants = yield __1.prisma.participant.findMany({
            where: { eventId: parseInt(eventId, 10) },
            include: {
                user: true, // Include user details
                event: true, // Optionally include event details
            },
        });
        res.status(200).json(participants);
    }
    catch (error) {
        console.error("Error fetching participants:", error);
        res.status(500).json({ error: "Failed to fetch participants" });
    }
});
exports.getParticipantsByEvent = getParticipantsByEvent;
//# sourceMappingURL=participantController.js.map