"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { liveSessionChatApi } from "@/lib/api/live-session-chat";

export function useLiveSessionChat(courseIdOrSlug?: string, enabled = true) {
  const queryClient = useQueryClient();
  const queryKey = useMemo(
    () => ["live-session-chat", courseIdOrSlug],
    [courseIdOrSlug]
  );

  const messagesQuery = useQuery({
    queryKey,
    queryFn: () => liveSessionChatApi.list(courseIdOrSlug!, 1, 50),
    enabled: enabled && !!courseIdOrSlug,
    refetchInterval: enabled && courseIdOrSlug ? 5000 : false,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (message: string) => liveSessionChatApi.send(courseIdOrSlug!, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    queryKey,
    messagesQuery,
    sendMessageMutation,
  };
}
