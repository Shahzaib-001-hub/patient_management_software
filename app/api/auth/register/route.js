import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Patient from "@/models/Patient";
import { hashPassword, signSessionToken, getCookieOptions } from "@/lib/auth";
import { getNextSequence } from "@/lib/counters";
import { logAudit } from "@/lib/audit";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      dateOfBirth,
      gender,
      countryCode = "+92",
      timezone = "Asia/Karachi",
      address = "",
      consentAccepted = false,
    } = body;

    if (!firstName || !lastName || !email || !phone || !password || !dateOfBirth || !gender) {
      return NextResponse.json(
        { error: "Please fill in all required registration fields" },
        { status: 400 }
      );
    }

    if (!consentAccepted) {
      return NextResponse.json(
        { error: "Telehealth and privacy consent is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    const user = await User.create({
      name: fullName,
      email: normalizedEmail,
      passwordHash,
      role: "patient",
      phone: phone.trim(),
    });

    const patientId = await getNextSequence("PRWC");
    const patient = await Patient.create({
      patientId,
      userId: user._id,
      personalInfo: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: new Date(dateOfBirth),
        gender,
      },
      contact: {
        phone: phone.trim(),
        email: normalizedEmail,
        address: address.trim(),
        countryCode,
        timezone,
      },
      patientType: "online",
      registration: {
        date: new Date(),
        source: "Online Self-Registration",
      },
      consentRecords: [
        {
          version: "1.0",
          type: "Online Consultation & Privacy Consent",
          consentedAt: new Date(),
        },
      ],
      createdBy: user._id,
    });

    user.patientProfileId = patient._id;
    await user.save();

    const token = await signSessionToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: "patient",
      patientProfileId: patient._id.toString(),
    });

    await logAudit({
      user: { userId: user._id, name: user.name, role: "patient" },
      action: "REGISTER_PATIENT",
      resourceType: "Patient",
      resourceId: patient._id,
      patientId: patient._id,
      details: `Online patient registered (${patientId})`,
      req,
    });

    const res = NextResponse.json(
      {
        user: {
          userId: user._id,
          name: user.name,
          email: user.email,
          role: "patient",
          patientProfileId: patient._id,
        },
        patientId,
        redirectTo: "/patient/dashboard",
      },
      { status: 201 }
    );

    res.cookies.set({ ...getCookieOptions(), value: token });
    return res;
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
