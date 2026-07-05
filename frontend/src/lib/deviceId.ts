/**
 * Generates (once) and persists a stable device ID in localStorage so the
 * backend recognizes this browser across logins/logouts — this is what
 * makes the "max 2 devices" restriction meaningful instead of counting
 * every login as a new device.
 */
const DEVICE_ID_KEY = "akm_lms_device_id";

export function getDeviceId(): string {
  if (typeof window === "undefined") return "server";

  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}
