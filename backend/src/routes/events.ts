import express from 'express';
import { requireAuth } from '../middleware/auth';
import { hasPermission } from '../auth/roles';
import { createEvent, listEvents } from '../services/eventService';
import Event from '../models/Event';

const router = express.Router();

// GET /api/events
router.get('/', async (req, res) => {
  try {
    const { getToken } = require('next-auth/jwt');
    const secret = process.env.NEXTAUTH_SECRET || "yabbok-super-secret-key-12345";
    const user = await getToken({ req, secret });

    let shouldIncludeAll = false;
    if (req.query.includeAll === "true") {
      if (user && ["super_admin", "admin", "moderator", "church_leader"].includes(user.role as string)) {
        shouldIncludeAll = true;
      }
    }

    const events = await listEvents(shouldIncludeAll);
    res.json(events);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Events fetch failed", details: error.message });
  }
});

// POST /api/events
router.post('/', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!hasPermission(user.role, "event:create:any") && !hasPermission(user.role, "event:create:own")) {
      return res.status(403).json({ error: "Forbidden: Only admins and super admins can create events." });
    }

    if (user.role !== "admin" && user.role !== "super_admin") {
      return res.status(403).json({ error: "Forbidden: Only admins and super admins can create events." });
    }

    const newEvent = await createEvent({
      ...req.body,
      organizer: user.id,
      churchId: user.role === "super_admin" || user.role === "admin" ? req.body.churchId : user.churchId,
      approvalStatus: user.role === "super_admin" ? "approved" : "pending",
    });

    res.status(201).json(newEvent);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/events/:id
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!hasPermission(user.role, "event:create:any") && !hasPermission(user.role, "event:create:own")) {
      return res.status(403).json({ error: "Forbidden: Only admins and super admins can update events." });
    }

    if (user.role !== "admin" && user.role !== "super_admin") {
      return res.status(403).json({ error: "Forbidden: Only admins and super admins can update events." });
    }

    const { id } = req.params;
    const body = req.body;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const allowedFields = [
      "title", "description", "category", "date", "endDate", 
      "location", "isLive", "liveMeetingUrl", "livePlatform",
      "photoAdUrl", "videoAdUrl", "voiceAdUrl"
    ];

    for (const key of allowedFields) {
      if (key in body) {
        (event as any)[key] = body[key];
      }
    }

    if ("date" in body) event.date = new Date(body.date);
    if ("endDate" in body) event.endDate = body.endDate ? new Date(body.endDate) : undefined;

    if (user.role === "super_admin") {
      if (body.approvalStatus) {
        event.approvalStatus = body.approvalStatus;
      }
    } else {
      event.approvalStatus = "pending";
    }

    await event.save();
    res.json(event);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Event update failed", details: error.message });
  }
});

// DELETE /api/events/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!hasPermission(user.role, "event:create:any") && !hasPermission(user.role, "event:create:own")) {
      return res.status(403).json({ error: "Forbidden: Only admins and super admins can delete events." });
    }
    if (user.role !== "admin" && user.role !== "super_admin") {
      return res.status(403).json({ error: "Forbidden: Only admins and super admins can delete events." });
    }

    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    event.deletedAt = new Date();
    await event.save();

    res.json({ success: true });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Event deletion failed", details: error.message });
  }
});

// POST /api/events/:id/rsvp
router.post('/:id/rsvp', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const event = await Event.findOneAndUpdate(
      { _id: id, approvalStatus: "approved", deletedAt: { $exists: false } },
      { $addToSet: { attendees: user.id } },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ registered: true, attendeeCount: event.attendees.length });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Event RSVP failed", details: error.message });
  }
});

// DELETE /api/events/:id/rsvp
router.delete('/:id/rsvp', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const event = await Event.findByIdAndUpdate(
      id,
      { $pull: { attendees: user.id } },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ registered: false, attendeeCount: event.attendees.length });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Event RSVP removal failed", details: error.message });
  }
});

// GET /api/events/:id/attendees
router.get('/:id/attendees', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!hasPermission(user.role, "event:rsvp:view")) {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions to view attendees" });
    }

    const { id } = req.params;

    const event = await Event.findById(id)
      .populate("attendees", "name email phone churchBranch role")
      .select("title date attendees");

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json(event);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Event attendees fetch failed", details: error.message });
  }
});

export default router;
