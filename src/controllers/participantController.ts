import { Request, Response } from "express";
import { prisma } from "..";

// Sign up a participant for an event
export const registerParticipant = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, email, phone, eventId, userId } = req.body;

  if (!name || !email || !phone || !eventId) {
    res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId, 10) },
    });

    if (!event) {
      res.status(404).json({ error: "Event not found" });
    }

    const participant = await prisma.participant.create({
      data: {
        name,
        email,
        phone,
        eventId: parseInt(eventId, 10),
        userId: userId ? parseInt(userId, 10) : null, // Optional user ID
      },
    });

    res.status(201).json(participant);
  } catch (error) {
    console.error("Error registering participant:", error);
    res.status(500).json({ error: "Failed to register participant" });
  }
};

// Get participants for an event
export const getParticipantsByEvent = async (req: Request, res: Response) => {
  const { eventId } = req.params;

  try {
    const participants = await prisma.participant.findMany({
      where: { eventId: parseInt(eventId, 10) },
      include: {
        user: true, // Include user details
        event: true, // Optionally include event details
      },
    });

    res.status(200).json(participants);
  } catch (error) {
    console.error("Error fetching participants:", error);
    res.status(500).json({ error: "Failed to fetch participants" });
  }
};
