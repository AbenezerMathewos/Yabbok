import { NextResponse } from "next/server";
import { requireUser, handleApiError } from "@/backend/auth/session";
import { connectToDatabase } from "@/backend/lib/mongodb";
import User from "@/backend/models/User";
import RSVP from "@/backend/models/RSVP";
import BenevolenceRequest from "@/backend/models/BenevolenceRequest";
import CounselingRequest from "@/backend/models/CounselingRequest";

export async function GET(req: Request) {
  try {
    const userObj = await requireUser();
    if (userObj.role !== "super_admin" && userObj.role !== "moderator" && userObj.role !== "church_leader") {
      return NextResponse.json({ error: "Forbidden: Leader access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "members";

    await connectToDatabase();
    let csvData = "";
    let filename = `yabbok_${type}_report.csv`;

    if (type === "members") {
      const users = await User.find().select("name email phone gender churchBranch region role status createdAt").lean();
      csvData = "Name,Email,Phone,Gender,Church Branch,Region,Role,Status,Registered At\n";
      users.forEach((u: any) => {
        csvData += `"${u.name || ""}","${u.email || ""}","${u.phone || ""}","${u.gender || ""}","${u.churchBranch || ""}","${u.region || ""}","${u.role || ""}","${u.status || ""}","${new Date(u.createdAt).toLocaleDateString()}"\n`;
      });
    } else if (type === "attendance") {
      const rsvps = await RSVP.find().populate("user", "name email phone churchBranch").populate("event", "title date location").lean();
      csvData = "Ticket Code,Event Title,Member Name,Member Phone,Church Branch,Checked In,RSVP Date\n";
      rsvps.forEach((r: any) => {
        csvData += `"${r.ticketCode || ""}","${r.event?.title || ""}","${r.user?.name || ""}","${r.user?.phone || ""}","${r.user?.churchBranch || ""}","${r.checkedIn ? "YES" : "NO"}","${new Date(r.createdAt).toLocaleDateString()}"\n`;
      });
    } else if (type === "benevolence") {
      const requests = await BenevolenceRequest.find().populate("user", "name email phone").lean();
      csvData = "Applicant Name,Category,Amount Requested,Description,Status,Date\n";
      requests.forEach((b: any) => {
        csvData += `"${b.user?.name || ""}","${b.category || ""}","${b.amountRequested || 0}","${(b.description || "").replace(/"/g, '""')}","${b.status || ""}","${new Date(b.createdAt).toLocaleDateString()}"\n`;
      });
    } else if (type === "counseling") {
      const requests = await CounselingRequest.find().populate("user", "name email phone").lean();
      csvData = "Member Name,Topic,Urgency,Preferred Contact,Status,Requested Date\n";
      requests.forEach((c: any) => {
        csvData += `"${c.user?.name || ""}","${c.topic || ""}","${c.urgency || ""}","${c.preferredContact || ""}","${c.status || ""}","${new Date(c.createdAt).toLocaleDateString()}"\n`;
      });
    }

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    return handleApiError(err, "Failed to generate CSV export");
  }
}
