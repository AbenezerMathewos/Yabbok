import express from 'express';
import { Types } from "mongoose";
import { requireAuth } from '../middleware/auth';
import { hasPermission } from '../auth/roles';
import AuditLog from '../models/AuditLog';
import Church from '../models/Church';
import Notification from '../models/Notification';
import User from '../models/User';

const router = express.Router();

const defaultChurches = [
  {
    name: "Addis Ababa Kale Hiywet Church (HQ)",
    city: "Addis Ababa",
    region: "Addis Ababa",
    description: "The central headquarters of the Ethiopian Kale Hiywet Church, coordinating youth fellowships nationwide.",
    memberCount: 1540,
  },
  {
    name: "Hawassa Yeheyz Kale Hiywet Church",
    city: "Hawassa",
    region: "Sidama",
    description: "A vibrant southern regional fellowship center with a strong focus on evangelism and choir service.",
    memberCount: 780,
  },
  {
    name: "Adama Geda Kale Hiywet Church",
    city: "Adama",
    region: "Oromia",
    description: "An active community of university students and local youth participating in regional prayer gatherings.",
    memberCount: 420,
  },
  {
    name: "Bahir Dar Kale Hiywet Church",
    city: "Bahir Dar",
    region: "Amhara",
    description: "A growing fellowship focusing on bible study, leadership mentorship, and charity projects.",
    memberCount: 310,
  },
  {
    name: "Jimma Kale Hiywet Church",
    city: "Jimma",
    region: "Oromia",
    description: "Uniting local youth members through worship programs, Sunday school teaching, and retreat events.",
    memberCount: 290,
  },
];

async function notifySuperAdmins(title: string, message: string, referenceId: Types.ObjectId) {
  const superAdmins = await User.find({ role: "super_admin", status: "active" }).select("_id");
  if (superAdmins.length === 0) return;

  await Notification.insertMany(
    superAdmins.map((admin) => ({
      user: admin._id,
      title,
      message,
      type: "approval",
      referenceId,
    }))
  );
}

async function notifySubmitter(
  church: { submittedBy?: Types.ObjectId | string; _id: Types.ObjectId; name: string },
  title: string,
  message: string
) {
  if (!church.submittedBy) return;

  await Notification.create({
    user: church.submittedBy,
    title,
    message,
    type: "approval",
    referenceId: church._id,
  });
}

router.get('/', async (req, res) => {
  try {
    const { getToken } = require('next-auth/jwt');
    const secret = process.env.NEXTAUTH_SECRET || "yabbok-super-secret-key-12345";
    const user = await getToken({ req, secret });

    const isChurchAdmin = user?.role === "admin" || user?.role === "super_admin";
    const includeAll = req.query.includeAll === "true" && isChurchAdmin;

    const query = includeAll
      ? { deletedAt: { $exists: false } }
      : { status: "verified", deletedAt: { $exists: false } };

    let churches: any = await Church.find(query as any)
      .populate("submittedBy", "name email role")
      .populate("verifiedBy", "name email role")
      .sort({ status: 1, pendingAction: -1, name: 1 });

    if ((await Church.countDocuments({})) === 0) {
      await Church.insertMany(defaultChurches);
      churches = await Church.find(query as any)
        .populate("submittedBy", "name email role")
        .populate("verifiedBy", "name email role")
        .sort({ status: 1, pendingAction: -1, name: 1 });
    }

    res.json(churches);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Churches fetch failed", details: error.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!hasPermission(user.role, "church:create")) {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }
    if (user.role !== "admin" && user.role !== "super_admin") {
      return res.status(403).json({ error: "Only Admin and Super Admin can manage churches" });
    }

    const { name, city, region, description, leaderId } = req.body;

    if (!name || !city || !region || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newChurch = await Church.create({
      name,
      city,
      region,
      description,
      leaderId: leaderId || null,
      memberCount: 0,
      status: user.role === "super_admin" ? "verified" : "pending",
      pendingAction: user.role === "super_admin" ? null : "create",
      submittedBy: user.id,
      submittedAt: new Date(),
      verifiedBy: user.role === "super_admin" ? user.id : undefined,
      verifiedAt: user.role === "super_admin" ? new Date() : undefined,
    });

    await AuditLog.create({
      actor: user.id,
      action: user.role === "super_admin" ? "church.created" : "church.create_requested",
      targetId: newChurch._id,
      targetType: "Church",
      details: `${user.name || user.email || user.role} submitted church branch "${name}".`,
    });

    if (user.role !== "super_admin") {
      await notifySuperAdmins("Church approval needed", `"${name}" was submitted for approval.`, newChurch._id);
    }

    res.status(201).json(newChurch);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Church creation failed", details: error.message });
  }
});

router.patch('/', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!hasPermission(user.role, "church:update:any") && !hasPermission(user.role, "church:verify")) {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }
    if (user.role !== "admin" && user.role !== "super_admin") {
      return res.status(403).json({ error: "Only Admin and Super Admin can manage churches" });
    }

    const { churchId, action, name, city, region, description, leaderId, memberCount } = req.body;

    if (!churchId) {
      return res.status(400).json({ error: "Church ID is required" });
    }

    const church = await Church.findById(churchId);
    if (!church || church.deletedAt) {
      return res.status(404).json({ error: "Church not found" });
    }

    if (action === "approve") {
      if (!hasPermission(user.role, "church:verify") || user.role !== "super_admin") {
        return res.status(403).json({ error: "Only Super Admin can approve church changes" });
      }

      if (church.pendingAction === "delete") {
        church.status = "archived";
        church.deletedAt = new Date();
      } else if (church.pendingAction === "update" && church.pendingChanges) {
        church.set(church.pendingChanges);
        church.status = "verified";
      } else {
        church.status = "verified";
      }

      church.pendingAction = null;
      church.pendingChanges = null;
      church.verifiedBy = user.id;
      church.verifiedAt = new Date();
      await church.save();

      await AuditLog.create({
        actor: user.id,
        action: "church.approved",
        targetId: church._id,
        targetType: "Church",
        details: `Super Admin approved church change for "${church.name}".`,
      });

      await notifySubmitter(church, "Church change approved", `"${church.name}" has been approved.`);

      return res.json(church);
    }

    if (action === "reject") {
      if (user.role !== "super_admin") {
        return res.status(403).json({ error: "Only Super Admin can reject church changes" });
      }

      if (church.pendingAction === "create") {
        church.status = "archived";
        church.deletedAt = new Date();
      }

      church.pendingAction = null;
      church.pendingChanges = null;
      await church.save();

      await AuditLog.create({
        actor: user.id,
        action: "church.rejected",
        targetId: church._id,
        targetType: "Church",
        details: `Super Admin rejected church change for "${church.name}".`,
      });

      await notifySubmitter(church, "Church change rejected", `"${church.name}" was rejected by Super Admin.`);

      return res.json(church);
    }

    if (!name || !city || !region || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const changes = {
      name,
      city,
      region,
      description,
      leaderId: leaderId || null,
      memberCount: Number.isFinite(Number(memberCount)) ? Number(memberCount) : church.memberCount,
    };

    if (user.role === "super_admin") {
      church.set({
        ...changes,
        status: "verified",
        pendingAction: null,
        pendingChanges: null,
        verifiedBy: user.id,
        verifiedAt: new Date(),
      });
    } else {
      church.pendingAction = church.status === "pending" && church.pendingAction === "create" ? "create" : "update";
      if (church.pendingAction === "create") {
        church.set(changes);
      } else {
        church.pendingChanges = changes;
      }
      church.submittedBy = user.id;
      church.submittedAt = new Date();
    }

    await church.save();

    await AuditLog.create({
      actor: user.id,
      action: user.role === "super_admin" ? "church.updated" : "church.update_requested",
      targetId: church._id,
      targetType: "Church",
      details: `${user.name || user.email || user.role} updated church branch "${name}".`,
    });

    if (user.role !== "super_admin") {
      await notifySuperAdmins("Church update approval needed", `"${name}" has pending updates.`, church._id);
    }

    res.json(church);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Church update failed", details: error.message });
  }
});

router.delete('/', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!hasPermission(user.role, "church:update:any")) {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }
    if (user.role !== "admin" && user.role !== "super_admin") {
      return res.status(403).json({ error: "Only Admin and Super Admin can manage churches" });
    }

    const { churchId } = req.body;

    if (!churchId) {
      return res.status(400).json({ error: "Church ID is required" });
    }

    const church = await Church.findById(churchId);
    if (!church || church.deletedAt) {
      return res.status(404).json({ error: "Church not found" });
    }

    if (user.role === "super_admin") {
      church.status = "archived";
      church.deletedAt = new Date();
      church.pendingAction = null;
      church.pendingChanges = null;
      church.verifiedBy = user.id;
      church.verifiedAt = new Date();
    } else {
      church.pendingAction = "delete";
      church.pendingChanges = null;
      church.submittedBy = user.id;
      church.submittedAt = new Date();
    }

    await church.save();

    await AuditLog.create({
      actor: user.id,
      action: user.role === "super_admin" ? "church.deleted" : "church.delete_requested",
      targetId: church._id,
      targetType: "Church",
      details: `${user.name || user.email || user.role} requested deletion for "${church.name}".`,
    });

    if (user.role !== "super_admin") {
      await notifySuperAdmins("Church delete approval needed", `"${church.name}" was requested for deletion.`, church._id);
    }

    res.json(church);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Church delete failed", details: error.message });
  }
});

export default router;
