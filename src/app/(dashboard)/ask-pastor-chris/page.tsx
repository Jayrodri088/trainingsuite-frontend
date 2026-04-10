"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircleQuestion, Send, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { pastorChrisApi, type PastorChrisQuestion } from "@/lib/api/pastor-chris";
import { T, useT } from "@/components/t";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

function StatusBadge({ status }: { status: PastorChrisQuestion["status"] }) {
  if (status === "answered") {
    return (
      <Badge className="gap-1 bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
        <CheckCircle className="h-3 w-3" />
        <T>Answered</T>
      </Badge>
    );
  }
  if (status === "dismissed") {
    return (
      <Badge variant="outline" className="gap-1 text-gray-500 border-gray-200">
        <XCircle className="h-3 w-3" />
        <T>Dismissed</T>
      </Badge>
    );
  }
  return (
    <Badge className="gap-1 bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
      <Clock className="h-3 w-3" />
      <T>Pending</T>
    </Badge>
  );
}

function QuestionCard({ q }: { q: PastorChrisQuestion }) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useT();

  return (
    <Card className="rounded-xl border-gray-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-sans text-sm font-medium text-gray-900 leading-relaxed">
              {q.question}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {formatDistanceToNow(new Date(q.createdAt), { addSuffix: true })}
            </p>
          </div>
          <StatusBadge status={q.status} />
        </div>

        {q.status === "answered" && q.answer && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#0052CC] hover:underline"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  <T>Hide answer</T>
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  <T>View answer</T>
                </>
              )}
            </button>
            {expanded && (
              <div className="mt-3 rounded-lg bg-blue-50 border border-blue-100 p-4">
                <p className="text-xs font-semibold text-[#0052CC] mb-2">
                  {t("Pastor Chris")}
                  {q.answeredAt && (
                    <span className="font-normal text-gray-400 ml-2">
                      · {formatDistanceToNow(new Date(q.answeredAt), { addSuffix: true })}
                    </span>
                  )}
                </p>
                <p className="font-sans text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {q.answer}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AskPastorChrisPage() {
  const { t } = useT();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [question, setQuestion] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["my-pastor-chris-questions"],
    queryFn: () => pastorChrisApi.getMyQuestions(1, 50),
  });

  const questions = data?.data || [];
  const pendingCount = questions.filter((q) => q.status === "pending").length;
  const answeredCount = questions.filter((q) => q.status === "answered").length;

  const submitMutation = useMutation({
    mutationFn: (q: string) => pastorChrisApi.askQuestion(q),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-pastor-chris-questions"] });
      setDialogOpen(false);
      setQuestion("");
      toast.success(t("Your question has been submitted. We'll notify you when it's answered."));
    },
    onError: () => {
      toast.error(t("Failed to submit your question. Please try again."));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim().length < 10) {
      toast.error(t("Please write at least 10 characters for your question."));
      return;
    }
    submitMutation.mutate(question.trim());
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-sans font-bold text-black flex items-center gap-2">
            <MessageCircleQuestion className="h-7 w-7 text-[#0052CC]" />
            <T>Ask Pastor Chris</T>
          </h1>
          <p className="font-sans text-gray-600 mt-1 text-sm">
            <T>Submit questions on life and ministry directly to Pastor Chris, your mentor and life coach.</T>
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="shrink-0 bg-[#0052CC] hover:bg-[#003d99] text-white font-bold rounded-lg"
        >
          <Send className="h-4 w-4 mr-2" />
          <T>Ask a Question</T>
        </Button>
      </div>

      {/* Stats */}
      {questions.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Card className="rounded-xl border-gray-200">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-black">{questions.length}</p>
              <p className="text-xs text-gray-500 font-sans mt-0.5"><T>Questions Asked</T></p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-gray-200">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
              <p className="text-xs text-gray-500 font-sans mt-0.5"><T>Awaiting Answer</T></p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-gray-200 col-span-2 sm:col-span-1">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-green-600">{answeredCount}</p>
              <p className="text-xs text-gray-500 font-sans mt-0.5"><T>Answered</T></p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Questions list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <Card className="rounded-xl border-gray-200 border-dashed">
          <CardContent className="py-16 text-center">
            <MessageCircleQuestion className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-sans font-bold text-gray-700 text-lg mb-1">
              <T>No questions yet</T>
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
              <T>Have a question about life or ministry? Ask Pastor Chris — your mentor and life coach.</T>
            </p>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-[#0052CC] hover:bg-[#003d99] text-white font-bold rounded-lg"
            >
              <Send className="h-4 w-4 mr-2" />
              <T>Ask Your First Question</T>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <QuestionCard key={q._id} q={q} />
          ))}
        </div>
      )}

      {/* Submit Question Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-sans font-bold text-black flex items-center gap-2">
              <MessageCircleQuestion className="h-5 w-5 text-[#0052CC]" />
              <T>Ask Pastor Chris</T>
            </DialogTitle>
            <DialogDescription>
              <T>Write your question on life or ministry. Be as specific as possible for the best response.</T>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="question" className="font-sans font-semibold text-sm">
                  <T>Your Question</T>
                </Label>
                <Textarea
                  id="question"
                  placeholder={t("e.g. How do I balance ministry work with my family life?")}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  rows={5}
                  maxLength={2000}
                  className="rounded-lg border-gray-200 resize-none font-sans text-sm"
                />
                <p className={cn(
                  "text-xs text-right",
                  question.length > 1800 ? "text-red-500" : "text-gray-400"
                )}>
                  {question.length} / 2000
                </p>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setDialogOpen(false); setQuestion(""); }}
                className="rounded-lg border-gray-200"
              >
                <T>Cancel</T>
              </Button>
              <Button
                type="submit"
                disabled={submitMutation.isPending || question.trim().length < 10}
                className="bg-[#0052CC] hover:bg-[#003d99] text-white font-bold rounded-lg"
              >
                {submitMutation.isPending ? (
                  <T>Submitting...</T>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    <T>Submit Question</T>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
