import express from 'express';
import { requireAuth } from '../middleware/auth';
import { hasPermission } from '../auth/roles';
import Suggestion from '../models/Suggestion';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const userObj = req.user;

    let suggestions;
    // Admins and moderators see all suggestions. Members see only their own submissions.
    if (hasPermission(userObj.role, "content:moderate")) {
      suggestions = await Suggestion.find({ deletedAt: { $exists: false } })
        .populate("user", "name email phone churchBranch")
        .sort({ createdAt: -1 });
    } else {
      suggestions = await Suggestion.find({ user: userObj.id, deletedAt: { $exists: false } })
        .populate("user", "name email phone churchBranch")
        .sort({ createdAt: -1 });
    }

    res.json(suggestions);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Suggestions fetch failed", details: error.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const userObj = req.user;
    const { title, content, category } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const newSuggestion = await Suggestion.create({
      user: userObj.id,
      title,
      content,
      category: category || "Other",
      churchId: userObj.churchId || undefined,
      status: "review",
    });

    res.status(201).json(newSuggestion);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Suggestion submission failed", details: error.message });
  }
});

router.put('/', requireAuth, async (req, res) => {
  try {
    const userObj = req.user;
    if (!hasPermission(userObj.role, "content:moderate")) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { suggestionId, status } = req.body;

    if (!suggestionId || !status) {
      return res.status(400).json({ error: "Suggestion ID and status are required" });
    }

    if (!["review", "approved", "archived"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const suggestion = await Suggestion.findByIdAndUpdate(
      suggestionId,
      { status },
      { new: true }
    ).populate("user", "name email");

    if (!suggestion) {
      return res.status(404).json({ error: "Suggestion not found" });
    }

    res.json(suggestion);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Suggestion status update failed", details: error.message });
  }
});

export default router;
