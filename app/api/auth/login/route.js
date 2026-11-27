import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import {
  verifyPassword,
  signSessionToken,
  getCookieOptions,
} from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { ROLE_HOME_ROUTES } from "@/lib/permissions";

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      "+passwordHash"
    );

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Account is deactivated. Please contact clinic admin." },
        { status: 403 }
      );
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      return NextResponse.json(
        { error: "Account temporarily locked due to failed attempts. Try again later." },
        { status: 429 }
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await user.save();
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    user.lastLoginAt = new Date();
    await user.save();

    const token = await signSessionToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      patientProfileId: user.patientProfileId
        ? user.patientProfileId.toString()
        : null,
    });

    await logAudit({
      user: { userId: user._id, name: user.name, role: user.role },
      action: "LOGIN",
      resourceType: "User",
      resourceId: user._id,
      details: `User logged in (${user.role})`,
      req,
    });

    const res = NextResponse.json({
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        patientProfileId: user.patientProfileId,
      },
      redirectTo: ROLE_HOME_ROUTES[user.role] || "/",
    });

    res.cookies.set({ ...getCookieOptions(), value: token });
    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
