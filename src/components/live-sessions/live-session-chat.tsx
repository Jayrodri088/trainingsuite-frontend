"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useLiveSessionChat } from "@/hooks";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage, getInitials } from "@/lib/utils";
import type { LiveSession, LiveSessionChatMessage, User } from "@/types";
import { T, useT } from "@/components/t";

interface LiveSessionChatProps {
  session: LiveSession;
  currentUser?: User | null;
}

export function LiveSessionChat({ session, currentUser }: LiveSessionChatProps) {
  const { t } = useT();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const courseIdOrSlug = session.course?._id || session.course?.slug;
  const { messagesQuery, sendMessageMutation } = useLiveSessionChat(courseIdOrSlug, !!courseIdOrSlug);
  const messages = useMemo(
    () => ((messagesQuery.data?.data || []) as LiveSessionChatMessage[]),
    [messagesQuery.data?.data]
  );

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollTop = viewport.scrollHeight;
  }, [messages.length]);

  const canChat = Boolean(currentUser);

  const normalizedMessages = useMemo(
    () =>
      messages.map((chatMessage) => {
        const user = typeof chatMessage.user === "string" ? null : chatMessage.user;
        const isOwnMessage = user?._id === currentUser?._id;
        return { ...chatMessage, user, isOwnMessage };
      }),
    [messages, currentUser?._id]
  );

  const handleSubmit = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    sendMessageMutation.mutate(trimmed, {
      onSuccess: () => {
        setMessage("");
      },
      onError: (error) => {
        toast({
          title: getErrorMessage(error) || t("Failed to send message"),
          variant: "destructive",
        });
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <T>Live Chat</T>
        </CardTitle>
        <CardDescription>
          {courseIdOrSlug ? (
            <T>Chat with other attendees during the session.</T>
          ) : (
            <T>This session is not linked to a course chat.</T>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!courseIdOrSlug ? (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            <T>Attach this session to a course to enable chat.</T>
          </div>
        ) : (
          <>
        <div
          ref={viewportRef}
          className="h-[360px] overflow-y-auto rounded-lg border bg-muted/20 p-4"
        >
          {messagesQuery.isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-[78%]" />
              <Skeleton className="h-12 w-[62%]" />
              <Skeleton className="h-12 w-[84%]" />
            </div>
          ) : normalizedMessages.length > 0 ? (
            <div className="space-y-4">
              {normalizedMessages.map((chatMessage) => {
                const user = chatMessage.user;

                return (
                  <div key={chatMessage._id} className="flex items-start gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(user?.name || "?")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{user?.name || "User"}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(chatMessage.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap break-words text-sm text-foreground">
                        {chatMessage.message}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
              <MessageSquare className="mb-3 h-8 w-8" />
              <p className="text-sm"><T>No messages yet. Start the conversation.</T></p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={canChat ? t("Type a message...") : t("Sign in to chat")}
            disabled={!canChat || sendMessageMutation.isPending}
          />
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canChat || !message.trim() || sendMessageMutation.isPending}
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
