import { Request, Response } from "express";
import { prisma } from "..";

// Create an Event
export const createEvent = async (req: Request, res: Response) => {
  try {
    const {
      creatorName,
      eventName,
      location,
      dateTime,
      maxSpots,
      contact,
      image,
      userId, // Ensure this is passed in the request body
    } = req.body;

    if (!userId) {
      res
        .status(400)
        .json({ message: "User ID is required to create an event." });
      return;
    }

    const numericUserId =
      typeof userId === "string" ? parseInt(userId, 10) : userId;

    // Create a new event with the required user relation
    const event = await prisma.event.create({
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
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get All Events
export const getAllEvents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const events = await prisma.event.findMany({
      // include: { participants: true }, // Include participants for debugging
    });
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

// Get Single Event
export const getEventById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id, 10) },
      include: { participants: true },
    });

    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }
    res.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Failed to fetch event" });
  }
};
