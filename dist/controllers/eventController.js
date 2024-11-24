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
exports.getEventById = exports.getAllEvents = exports.createEvent = void 0;
const __1 = require("..");
// Create an Event
const createEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { creatorName, eventName, location, dateTime, maxSpots, contact, image, userId, // Ensure this is passed in the request body
         } = req.body;
        if (!userId) {
            res
                .status(400)
                .json({ message: "User ID is required to create an event." });
            return;
        }
        const numericUserId = typeof userId === "string" ? parseInt(userId, 10) : userId;
        // Create a new event with the required user relation
        const event = yield __1.prisma.event.create({
            data: {
                creatorName,
                eventName,
                location,
                dateTime: new Date(dateTime),
                maxSpots: Number(maxSpots),
                contact,
                image: image || null,
                user: {
                    connect: { id: numericUserId }, // Connect the event to the user
                },
            },
        });
        res.status(201).json({ message: "Event created successfully", event });
    }
    catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.createEvent = createEvent;
// Get All Events
const getAllEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const events = yield __1.prisma.event.findMany({
        // include: { participants: true }, // Include participants for debugging
        });
        res.json(events);
    }
    catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ error: "Failed to fetch events" });
    }
});
exports.getAllEvents = getAllEvents;
// Get Single Event
const getEventById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const event = yield __1.prisma.event.findUnique({
            where: { id: parseInt(id, 10) },
            include: { participants: true },
        });
        if (!event) {
            res.status(404).json({ error: "Event not found" });
            return;
        }
        res.json(event);
    }
    catch (error) {
        console.error("Error fetching event:", error);
        res.status(500).json({ error: "Failed to fetch event" });
    }
});
exports.getEventById = getEventById;
//# sourceMappingURL=eventController.js.map