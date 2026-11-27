import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { requireAuth } from "@/lib/permissions";

export async function GET() {
  const { error, user } = await requireAuth();
  if (error) return error;

  await connectDB();
  const notifications = await Notification.find({ userId: user.userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(req) {
  const { error, user } = await requireAuth();
  if (error) return error;

  await connectDB();
  const body = await req.json();
  if (body.markAllRead) {
    await Notification.updateMany(
      { userId: user.userId, isRead: false },
      { isRead: true }
    );
  } else if (body.id) {
    await Notification.findOneAndUpdate(
      { _id: body.id, userId: user.userId },
      { isRead: true }
    );
  }
  return NextResponse.json({ success: true });
}
