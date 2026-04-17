import { addMinutes, differenceInSeconds, parseISO } from "date-fns";
import type { LiveSession } from "@/types";

/** True when current time is past scheduledAt + duration (API may still say "live"). */
export function isScheduledWindowOver(session: LiveSession): boolean {
  if (!Number.isFinite(session.duration)) return false;

  const endAt = addMinutes(parseISO(session.scheduledAt), session.duration);
  return differenceInSeconds(endAt, new Date()) <= 0;
}

/** True only when the API says live and the scheduled window has not ended. */
export function isLiveOnAir(session: LiveSession): boolean {
  return session.status === "live" && !isScheduledWindowOver(session);
}
