"use client";

import { useState } from "react";
import { Bell, Loader2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { liveSessionsApi, type LiveSessionReminder } from "@/lib/api/live-sessions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { T, useT } from "@/components/t";
import { format, parseISO } from "date-fns";

const REMINDER_OPTIONS = [
  { value: 15 as const, labelKey: "15 minutes before", labelShort: "15 min" },
  { value: 60 as const, labelKey: "1 hour before", labelShort: "1 hour" },
  { value: 1440 as const, labelKey: "1 day before", labelShort: "1 day" },
];

export function SetReminderDialog({
  sessionId,
  sessionTitle,
  open,
  onOpenChange,
  currentReminder: currentReminderProp,
}: {
  sessionId: string;
  sessionTitle?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentReminder?: LiveSessionReminder | null;
}) {
  const { t } = useT();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<15 | 60 | 1440 | null>(null);

  const { data: reminderData } = useQuery({
    queryKey: ["live-session-reminder", sessionId],
    queryFn: () => liveSessionsApi.getReminder(sessionId),
    enabled: open && !!sessionId,
  });

  const currentReminder = currentReminderProp ?? reminderData?.data ?? null;

  const setReminderMutation = useMutation({
    mutationFn: (minutesBefore: 15 | 60 | 1440) =>
      liveSessionsApi.setReminder(sessionId, minutesBefore),
    onSuccess: (_, minutesBefore) => {
      queryClient.invalidateQueries({ queryKey: ["live-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["live-session-reminder", sessionId] });
      const option = REMINDER_OPTIONS.find((o) => o.value === minutesBefore);
      toast.success(t("Reminder set") + ` — ${option ? t(option.labelKey) : ""}`);
      onOpenChange(false);
      setSelected(null);
    },
    onError: (err: Error & { response?: { data?: { error?: string } } }) => {
      toast.error(err.response?.data?.error || err.message || t("Failed to set reminder"));
    },
  });

  const removeReminderMutation = useMutation({
    mutationFn: () => liveSessionsApi.removeReminder(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["live-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["live-session-reminder", sessionId] });
      toast.success(t("Reminder removed"));
      onOpenChange(false);
      setSelected(null);
    },
    onError: (err: Error & { response?: { data?: { error?: string } } }) => {
      toast.error(err.response?.data?.error || err.message || t("Failed to remove reminder"));
    },
  });

  const handleSet = () => {
    if (selected != null) {
      setReminderMutation.mutate(selected);
    }
  };

  const isLoading = setReminderMutation.isPending || removeReminderMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="rounded-xl border-gray-200 bg-white shadow-lg sm:max-w-[400px] font-sans"
        showCloseButton={true}
      >
        <DialogHeader>
          <DialogTitle className="font-sans font-bold text-black text-lg flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#0052CC]" />
            <T>Set reminder</T>
          </DialogTitle>
          <DialogDescription className="font-sans text-gray-600 text-sm">
            {sessionTitle ? (
              <>
                <T>Get notified before</T> &quot;{sessionTitle}&quot;
              </>
            ) : (
              <T>Get notified before this live session starts.</T>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {currentReminder?.remindAt ? (
            <p className="text-sm font-sans text-gray-600 flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600 shrink-0" />
              <T>Reminder set for</T>{" "}
              {format(parseISO(currentReminder.remindAt), "MMM d, h:mm a")}
            </p>
          ) : null}

          <p className="text-sm font-sans font-medium text-black">
            <T>When should we remind you?</T>
          </p>
          <div className="grid gap-2">
            {REMINDER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelected(opt.value)}
                disabled={isLoading}
                className={`flex items-center justify-between w-full rounded-lg border px-4 py-3 text-left font-sans text-sm transition-colors ${
                  selected === opt.value
                    ? "border-[#0052CC] bg-[#0052CC]/5 text-[#0052CC]"
                    : "border-gray-200 bg-white text-black hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                <span>{t(opt.labelKey)}</span>
                {selected === opt.value && <Check className="h-4 w-4 text-[#0052CC]" />}
              </button>
            ))}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 flex flex-col-reverse sm:flex-row">
          {currentReminder ? (
            <Button
              type="button"
              variant="outline"
              className="rounded-lg border-gray-200 text-gray-700 hover:bg-gray-50 font-sans font-medium order-2 sm:order-1"
              onClick={() => removeReminderMutation.mutate()}
              disabled={isLoading}
            >
              <T>Remove reminder</T>
            </Button>
          ) : null}
          <Button
            type="button"
            className="rounded-lg bg-[#0052CC] hover:bg-[#003d99] text-white font-sans font-semibold order-1 sm:order-2"
            onClick={handleSet}
            disabled={selected == null || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : currentReminder ? (
              <T>Update reminder</T>
            ) : (
              <T>Set reminder</T>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
