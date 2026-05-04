/**
 * Validates if a given datetime string falls within business hours:
 * - Monday to Friday
 * - Between 08:00 AM and 05:00 PM
 * Assumes the input is intended for the UTC+8 (Asia/Manila) timezone.
 */
export function validateBusinessSchedule(scheduledAtStr: string): { valid: boolean; message?: string } {
  if (!scheduledAtStr) {
    return { valid: false, message: "Schedule date and time are required." };
  }

  // Parse the date. The incoming string from datetime-local input is usually local time
  // e.g., "2026-04-28T14:30". We can treat it as the literal wall-clock time in UTC+8.
  const date = new Date(scheduledAtStr);
  
  if (isNaN(date.getTime())) {
    return { valid: false, message: "Invalid date format." };
  }

  // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return { valid: false, message: "Schedules are only allowed from Monday to Friday." };
  }

  // Get the hour and minute.
  const hours = date.getHours();
  const minutes = date.getMinutes();

  // Validate time between 08:00 and 17:00
  if (hours < 8) {
    return { valid: false, message: "Appointments cannot be scheduled before 8:00 AM." };
  }
  
  if (hours > 17 || (hours === 17 && minutes > 0)) {
    return { valid: false, message: "Appointments cannot be scheduled after 5:00 PM." };
  }

  return { valid: true };
}
