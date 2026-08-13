import { Types } from "mongoose";
import { NextResponse } from "next/server";
import { getCurrentUser, handleApiError, requireAnyPermission } from "@/backend/auth/session";
import { hasPermission } from "@/backend/auth/roles";
import { connectToDatabase } from "@/backend/lib/mongodb";
import AuditLog from "@/backend/models/AuditLog";
import Church from "@/backend/models/Church";
import Notification from "@/backend/models/Notification";
import User from "@/backend/models/User";

// In-memory or pre-defined seeds for Ethiopian Kale Hiywet Churches
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

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const user = await getCurrentUser();
    const isChurchAdmin = user?.role === "admin" || user?.role === "super_admin";
    const { searchParams } = new URL(req.url);
    const includeAll = searchParams.get("includeAll") === "true" && isChurchAdmin;

    const query = includeAll
      ? { deletedAt: { $exists: false } }
      : { status: "verified", deletedAt: { $exists: false } };

    let churches = await Church.find(query)
      .populate("submittedBy", "name email role")
      .populate("verifiedBy", "name email role")
      .sort({ status: 1, pendingAction: -1, name: 1 });

    // Seed default churches if the collection is empty.
    if ((await Church.countDocuments({})) === 0) {
      await Church.insertMany(defaultChurches);
      churches = await Church.find(query)
        .populate("submittedBy", "name email role")
        .populate("verifiedBy", "name email role")
        .sort({ status: 1, pendingAction: -1, name: 1 });
    }

    return NextResponse.json(churches);
  } catch (error) {
    return handleApiError(error, "Churches fetch failed");
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAnyPermission(["church:create"]);
    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json({ error: "Only Admin and Super Admin can manage churches" }, { status: 403 });
    }

    const body = await req.json();
    const { name, city, region, description, leaderId } = body;

    if (!name || !city || !region || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

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

    return NextResponse.json(newChurch, { status: 201 });
  } catch (error) {
    return handleApiError(error, "Church creation failed");
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireAnyPermission(["church:update:any", "church:verify"]);
    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json({ error: "Only Admin and Super Admin can manage churches" }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { churchId, action, name, city, region, description, leaderId, memberCount } = body;

    if (!churchId) {
      return NextResponse.json({ error: "Church ID is required" }, { status: 400 });
    }

    const church = await Church.findById(churchId);
    if (!church || church.deletedAt) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    if (action === "approve") {
      if (!hasPermission(user.role, "church:verify") || user.role !== "super_admin") {
        return NextResponse.json({ error: "Only Super Admin can approve church changes" }, { status: 403 });
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

      return NextResponse.json(church);
    }

    if (action === "reject") {
      if (user.role !== "super_admin") {
        return NextResponse.json({ error: "Only Super Admin can reject church changes" }, { status: 403 });
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

      return NextResponse.json(church);
    }

    if (!name || !city || !region || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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

    return NextResponse.json(church);
  } catch (error) {
    return handleApiError(error, "Church update failed");
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireAnyPermission(["church:update:any"]);
    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json({ error: "Only Admin and Super Admin can manage churches" }, { status: 403 });
    }

    await connectToDatabase();
    const { churchId } = await req.json();

    if (!churchId) {
      return NextResponse.json({ error: "Church ID is required" }, { status: 400 });
    }

    const church = await Church.findById(churchId);
    if (!church || church.deletedAt) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
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

    return NextResponse.json(church);
  } catch (error) {
    return handleApiError(error, "Church delete failed");
  }
}
