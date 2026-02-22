"use client";

import { useRef, useEffect } from "react";
import { Send, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { coursesApi, type CourseChatMessage } from "@/lib/api/courses";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInitials, normalizeUploadUrl } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { T, useT } from "@/components/t";
import { toast } from "sonner";
import { useAuth } from "@/hooks";
import { useState } from "react";

export function CourseChatPanel({ courseIdOrSlug }: { courseIdOrSlug: string }) {
  const { t } = useT();
  const auth = useAuth();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");

  const { data: chatData, isLoading } = useQuery({
    queryKey: ["course-chat", courseIdOrSlug],
    queryFn: () => coursesApi.getChat(courseIdOrSlug, 1, 100),
    refetchInterval: 20000,
  });

  const sendMutation = useMutation({
    mutationFn: (message: string) => coursesApi.sendChatMessage(courseIdOrSlug, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-chat", courseIdOrSlug] });
      setInputValue("");
    },
    onError: (err: Error & { response?: { data?: { error?: string } } }) => {
      toast.error(err.response?.data?.error || err.message || t("Failed to send message"));
    },
  });

  const messages = (chatData?.data ?? []) as CourseChatMessage[];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || sendMutation.isPending) return;
    if (!auth?.user) {
      toast.error(t("Sign in to post a message"));
      return;
    }
    sendMutation.mutate(trimmed);
  };

  return (
    <div className="flex flex-col h-full rounded-[12px] border border-gray-200 bg-white shadow-sm overflow-hidden font-sans">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-gray-50">
        <MessageSquare className="h-5 w-5 text-[#0052CC]" />
        <h3 className="font-sans font-bold text-black text-sm">
          <T>Course chat</T>
        </h3>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 min-h-[280px] max-h-[400px] overflow-y-auto p-4"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#0052CC]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-300 mb-3" />
            <p className="font-sans text-gray-600 text-sm">
              <T>No messages yet.</T>
            </p>
            <p className="font-sans text-gray-500 text-xs mt-1">
              <T>Drop a question or comment for this course.</T>
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const user = typeof msg.user === "object" ? msg.user : { _id: "", name: "?", avatar: undefined };
              const isOwn = auth?.user?._id === user._id;
              return (
                <div
                  key={msg._id}
                  className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className="h-8 w-8 shrink-0 rounded-full border border-gray-200">
                    <AvatarImage src={normalizeUploadUrl(user.avatar)} />
                    <AvatarFallback className="bg-[#0052CC]/10 text-[#0052CC] text-xs">
                      {getInitials(user.name || "?")}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`max-w-[85%] rounded-[10px] px-3 py-2 ${
                      isOwn
                        ? "bg-[#0052CC] text-white"
                        : "bg-gray-100 text-black border border-gray-200"
                    }`}
                  >
                    {!isOwn && (
                      <p className="text-xs font-semibold text-gray-700 mb-0.5">
                        {user.name || t("User")}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                    <p
                      className={`text-[10px] mt-1 ${
                        isOwn ? "text-white/80" : "text-gray-500"
                      }`}
                    >
                      {format(parseISO(msg.createdAt), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {auth?.user ? (
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 p-3 border-t border-gray-200 bg-white"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t("Ask a question or share a comment...")}
            maxLength={2000}
            className="flex-1 rounded-[10px] border border-gray-200 px-4 py-2.5 text-sm font-sans text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/30 focus:border-[#0052CC]"
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() || sendMutation.isPending}
            className="rounded-[10px] bg-[#0052CC] hover:bg-[#003d99] text-white font-sans font-semibold shrink-0 h-[42px] px-4"
          >
            {sendMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      ) : (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-center">
          <p className="text-sm font-sans text-gray-600">
            <T>Sign in to join the course chat.</T>
          </p>
        </div>
      )}
    </div>
  );
}
