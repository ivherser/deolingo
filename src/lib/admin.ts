export function parseAdminEmails(raw: string | undefined): Set<string> {
  return new Set((raw ?? "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean));
}

export function isAdminEmail(email: string, raw = process.env.ADMIN_EMAILS): boolean {
  return parseAdminEmails(raw).has(email.trim().toLowerCase());
}
