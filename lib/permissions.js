import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export const ROLES = {
  SUPER_ADMIN: "super_admin",
  CLINIC_ADMIN: "clinic_admin",
  DOCTOR: "doctor",
  RECEPTIONIST: "receptionist",
  REHAB_STAFF: "rehab_staff",
  ACCOUNTANT: "accountant",
  PATIENT: "patient",
};

export const ROLE_LABELS = {
  super_admin: "Super Admin",
  clinic_admin: "Clinic Admin",
  doctor: "Doctor",
  receptionist: "Receptionist",
  rehab_staff: "Rehabilitation Staff",
  accountant: "Accountant",
  patient: "Patient",
};

export const ROLE_HOME_ROUTES = {
  super_admin: "/admin/dashboard",
  clinic_admin: "/admin/dashboard",
  doctor: "/doctor/dashboard",
  receptionist: "/admin/appointments",
  rehab_staff: "/admin/exercises",
  accountant: "/admin/billing",
  patient: "/patient/dashboard",
};

export const PERMISSIONS = {
  // Staff & System
  MANAGE_STAFF: [ROLES.SUPER_ADMIN, ROLES.CLINIC_ADMIN],
  MANAGE_CLINIC_SETTINGS: [ROLES.SUPER_ADMIN, ROLES.CLINIC_ADMIN],
  VIEW_AUDIT_LOGS: [ROLES.SUPER_ADMIN, ROLES.CLINIC_ADMIN],

  // Patients
  VIEW_PATIENTS: [
    ROLES.SUPER_ADMIN,
    ROLES.CLINIC_ADMIN,
    ROLES.DOCTOR,
    ROLES.RECEPTIONIST,
    ROLES.REHAB_STAFF,
    ROLES.ACCOUNTANT,
  ],
  CREATE_PATIENT: [ROLES.SUPER_ADMIN, ROLES.CLINIC_ADMIN, ROLES.RECEPTIONIST],
  EDIT_PATIENT: [
    ROLES.SUPER_ADMIN,
    ROLES.CLINIC_ADMIN,
    ROLES.RECEPTIONIST,
    ROLES.DOCTOR,
  ],
  ARCHIVE_PATIENT: [ROLES.SUPER_ADMIN, ROLES.CLINIC_ADMIN],

  // Appointments
  VIEW_APPOINTMENTS: [
    ROLES.SUPER_ADMIN,
    ROLES.CLINIC_ADMIN,
    ROLES.DOCTOR,
    ROLES.RECEPTIONIST,
    ROLES.REHAB_STAFF,
    ROLES.PATIENT,
  ],
  MANAGE_APPOINTMENTS: [
    ROLES.SUPER_ADMIN,
    ROLES.CLINIC_ADMIN,
    ROLES.RECEPTIONIST,
    ROLES.DOCTOR,
  ],

  // Clinical: Assessments, Diagnoses, Treatment Plans (Accountant & Receptionist excluded)
  VIEW_CLINICAL: [ROLES.SUPER_ADMIN, ROLES.CLINIC_ADMIN, ROLES.DOCTOR],
  WRITE_CLINICAL: [ROLES.SUPER_ADMIN, ROLES.DOCTOR],

  // Medical Documents
  VIEW_DOCUMENTS: [
    ROLES.SUPER_ADMIN,
    ROLES.CLINIC_ADMIN,
    ROLES.DOCTOR,
    ROLES.RECEPTIONIST,
    ROLES.PATIENT,
  ],
  UPLOAD_DOCUMENTS: [
    ROLES.SUPER_ADMIN,
    ROLES.CLINIC_ADMIN,
    ROLES.DOCTOR,
    ROLES.RECEPTIONIST,
    ROLES.PATIENT,
  ],

  // Exercises & Rehabilitation
  MANAGE_EXERCISES: [
    ROLES.SUPER_ADMIN,
    ROLES.CLINIC_ADMIN,
    ROLES.REHAB_STAFF,
    ROLES.DOCTOR,
  ],
  ASSIGN_REHAB: [
    ROLES.SUPER_ADMIN,
    ROLES.CLINIC_ADMIN,
    ROLES.DOCTOR,
    ROLES.REHAB_STAFF,
  ],
  VIEW_REHAB: [
    ROLES.SUPER_ADMIN,
    ROLES.CLINIC_ADMIN,
    ROLES.DOCTOR,
    ROLES.REHAB_STAFF,
    ROLES.PATIENT,
  ],

  // Billing & Payments
  VIEW_BILLING: [
    ROLES.SUPER_ADMIN,
    ROLES.CLINIC_ADMIN,
    ROLES.ACCOUNTANT,
    ROLES.RECEPTIONIST,
    ROLES.PATIENT,
  ],
  MANAGE_BILLING: [
    ROLES.SUPER_ADMIN,
    ROLES.CLINIC_ADMIN,
    ROLES.ACCOUNTANT,
    ROLES.RECEPTIONIST,
  ],

  // Reports
  VIEW_ADMIN_REPORTS: [
    ROLES.SUPER_ADMIN,
    ROLES.CLINIC_ADMIN,
    ROLES.ACCOUNTANT,
  ],
  VIEW_DOCTOR_REPORTS: [ROLES.SUPER_ADMIN, ROLES.CLINIC_ADMIN, ROLES.DOCTOR],
};

export function hasPermission(role, permissionKey) {
  if (!role || !permissionKey) return false;
  const allowed = PERMISSIONS[permissionKey];
  if (!allowed) return false;
  return allowed.includes(role);
}

export async function requireAuth(allowedRoles = null) {
  const user = await getSessionUser();
  if (!user) {
    return {
      error: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      ),
      user: null,
    };
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return {
      error: NextResponse.json(
        { error: "Forbidden: insufficient permissions" },
        { status: 403 }
      ),
      user: null,
    };
  }

  return { error: null, user };
}

export async function requirePermission(permissionKey) {
  const user = await getSessionUser();
  if (!user) {
    return {
      error: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      ),
      user: null,
    };
  }

  if (!hasPermission(user.role, permissionKey)) {
    return {
      error: NextResponse.json(
        { error: "Forbidden: your role cannot perform this action" },
        { status: 403 }
      ),
      user: null,
    };
  }

  return { error: null, user };
}
