import { NextResponse } from "next/server";
import { connectToDatabase } from "@/backend/lib/mongodb";
import { handleApiError, requirePermission } from "@/backend/auth/session";
import AuditLog from "@/backend/models/AuditLog";
import Report from "@/backend/models/Report";

export async function GET() {
  try {
    await requirePermission("content:report:view");
    await connectToDatabase();

    const reports = await Report.find({})
      .populate("reporter", "name email churchBranch")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json(reports);
  } catch (error) {
    return handleApiError(error, "Reports fetch failed");
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await requirePermission("content:report:view");
    const { reportId, status, resolutionNote } = await req.json();

    if (!reportId || !["open", "reviewing", "resolved", "dismissed"].includes(status)) {
      return NextResponse.json({ error: "Invalid report update" }, { status: 400 });
    }

    await connectToDatabase();

    const report = await Report.findByIdAndUpdate(
      reportId,
      { status, assignedTo: admin.id, resolutionNote: resolutionNote || "" },
      { new: true }
    );

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    await AuditLog.create({
      actor: admin.id,
      action: "REPORT_REVIEW",
      targetId: report._id,
      targetType: "Report",
      details: `Report marked ${status}${resolutionNote ? `: ${resolutionNote}` : ""}`,
    });

    return NextResponse.json(report);
  } catch (error) {
    return handleApiError(error, "Report update failed");
  }
}
