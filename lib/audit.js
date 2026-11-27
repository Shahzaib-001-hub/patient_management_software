import AuditLog from "@/models/AuditLog";

export async function logAudit({
  user,
  action,
  resourceType,
  resourceId = "",
  patientId = null,
  details = "",
  req = null,
}) {
  try {
    const ipAddress =
      req?.headers?.get("x-forwarded-for") ||
      req?.headers?.get("x-real-ip") ||
      "";
    await AuditLog.create({
      userId: user?.userId || null,
      userName: user?.name || "System",
      userRole: user?.role || "system",
      action,
      resourceType,
      resourceId: resourceId ? String(resourceId) : "",
      patientId: patientId || null,
      details,
      ipAddress,
    });
  } catch (err) {
    console.error("Audit log error:", err.message);
  }
}
