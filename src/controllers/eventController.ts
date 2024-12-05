import { Request, Response } from "express";
import { prisma } from "..";
import axios from 'axios';

const openCage = process.env.OPEN_CAGE_API_KEY;

if (!openCage) {
  throw new Error('OPEN_CAGE_API_KEY is not defined in the environment variables');
}

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
      latitude,
      longitude, // Added latitude and longitude

    } = req.body;

    if (!userId) {
      res
        .status(400)
        .json({ message: "User ID and points are required to create an event." });
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
        latitude: parseFloat(latitude), // Store latitude
        longitude: parseFloat(longitude), // Store longitude
        user: {
          connect: { id: numericUserId }, // Connect the event to the user
        },
      },
    });

    // Update the creator's points after creating the event
    await prisma.user.update({
      where: { id: numericUserId },
      data: {
        points: {
          increment: 10, // Increment points by the event's points
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
      include: { participants: true }, // Include participants for calculations
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

export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  const eventId = parseInt(req.params.eventId); // Event ID passed in the request
  const userId = req.body.userId; // Assuming the user is authenticated and `userId` is passed in the JWT token

  try {
    // Step 1: Fetch the event to check if the user is the creator
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      res.status(404).json({ message: "Event not found." });
      return;
    }

    if (event.userId !== userId) {
      res.status(403).json({ message: "You are not authorized to delete this event." });
      return;
    }

    // Step 2: Delete the participants associated with the event (optional)
    await prisma.participant.deleteMany({
      where: { eventId: eventId }, // Deletes all participants for this event
    });

    // Step 3: Delete the event
    await prisma.event.delete({
      where: { id: eventId },
    });

    // Step 4: Update the creator's points (subtract points, e.g., 10 points)
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        points: {
          decrement: 10, // Subtract 10 points for deleting the event
        },
      },
    });

    res.status(200).json({
      message: "Event deleted successfully and points deducted from creator.",
      user: updatedUser, // Optionally return the updated user with new points
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getCoordinates = async (req: Request, res: Response): Promise<void> => {
  const { address } = req.body;

  if (!address) {
    res.status(400).send({ error: 'Address is required' });
    return
  }

  try {
    // Make the API request to OpenCage Geocoder
    const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json`, {
      params: {
        q: address,      // The address to geocode
        key: openCage, // Your API key
        language: 'en',  // Language for the results
      },
    });

    // Check if results are returned
    if (response.data.results.length > 0) {
      const location = response.data.results[0]; // Take the first result
      const { lat, lng } = location.geometry;  // Get the coordinates
      res.json({
        latitude: lat,
        longitude: lng,
        formatted_address: location.formatted, // Optional: Return the formatted address
      });
      return
    } else {
      res.status(404).send({ error: 'Address not found' });
      return
    }
  } catch (error) {
    console.error('Error fetching geocoding data:', error);
    res.status(500).send({ error: 'Error geocoding address' });
    return
  }
}