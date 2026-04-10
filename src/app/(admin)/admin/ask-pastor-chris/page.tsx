"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageCircleQuestion,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  MoreVertical,
  Send,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { pastorChrisApi, type PastorChrisQuestion } from "@/lib/api/pastor-chris";
import { getInitials } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

function StatusBadge({ status }: { status: PastorChrisQuestion["status"] }) {
  if (status === "answered") {
    return (
      <Badge className="gap-1 bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
        <CheckCircle className="h-3 w-3" />
        Answered
      </Badge>
    );
  }
  if (status === "dismissed") {
    return (
      <Badge variant="outline" className="gap-1 text-gray-500 border-gray-200">
        <XCircle className="h-3 w-3" />
        Dismissed
      </Badge>
    );
  }
  return (
    <Badge className="gap-1 bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
      <Clock className="h-3 w-3" />
      Pending
    </Badge>
  );
}

export default function AdminAskPastorChrisPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedQuestion, setSelectedQuestion] = useState<PastorChrisQuestion | null>(null);
  const [answerDialogOpen, setAnswerDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [answer, setAnswer] = useState("");

  const queryKey = ["admin-pastor-chris-questions", statusFilter];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      pastorChrisApi.adminGetQuestions(
        1,
        50,
        statusFilter === "all" ? undefined : statusFilter
      ),
  });

  const { data: statsData } = useQuery({
    queryKey: ["admin-pastor-chris-stats"],
    queryFn: () => pastorChrisApi.adminGetStats(),
  });

  const questions = data?.data || [];
  const stats = statsData?.data;

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof pastorChrisApi.adminUpdateQuestion>[1];
    }) => pastorChrisApi.adminUpdateQuestion(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pastor-chris-questions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-pastor-chris-stats"] });
      setAnswerDialogOpen(false);
      setAnswer("");
      setSelectedQuestion(null);
      toast.success("Question updated successfully");
    },
    onError: () => toast.error("Failed to update question"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => pastorChrisApi.adminDeleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pastor-chris-questions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-pastor-chris-stats"] });
      setDeleteDialogOpen(false);
      setSelectedQuestion(null);
      toast.success("Question deleted");
    },
    onError: () => toast.error("Failed to delete question"),
  });

  const handleOpenAnswer = (q: PastorChrisQuestion) => {
    setSelectedQuestion(q);
    setAnswer(q.answer || "");
    setAnswerDialogOpen(true);
  };

  const handleOpenView = (q: PastorChrisQuestion) => {
    setSelectedQuestion(q);
    setViewDialogOpen(true);
  };

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestion) return;
    updateMutation.mutate({
      id: selectedQuestion._id,
      payload: { answer: answer.trim(), status: "answered" },
    });
  };

  const handleDismiss = (q: PastorChrisQuestion) => {
    updateMutation.mutate({ id: q._id, payload: { status: "dismissed" } });
  };

  const handleReopen = (q: PastorChrisQuestion) => {
    updateMutation.mutate({ id: q._id, payload: { status: "pending" } });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-3">
        <MessageCircleQuestion className="h-7 w-7 text-[#0052CC]" />
        <div>
          <h1 className="text-2xl font-sans font-bold text-black">Ask Pastor Chris</h1>
          <p className="text-sm text-gray-600 font-sans">Review, respond and manage submitted questions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Questions", value: stats?.total ?? "–", color: "text-black" },
          { label: "Pending", value: stats?.pending ?? "–", color: "text-amber-600" },
          { label: "Answered", value: stats?.answered ?? "–", color: "text-green-600" },
          { label: "Dismissed", value: stats?.dismissed ?? "–", color: "text-gray-500" },
        ].map((s) => (
          <Card key={s.label} className="rounded-xl border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
              <p className="text-xs text-gray-500 font-sans mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <Card className="rounded-xl border-gray-200 shadow-sm">
        <CardHeader className="pb-0 pt-4 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-sans font-bold text-gray-700">Questions</CardTitle>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-8 text-xs rounded-lg border-gray-200">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="answered">Answered</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-0 mt-3">
          {isLoading ? (
            <div className="space-y-px">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-50 animate-pulse" />
              ))}
            </div>
          ) : questions.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <MessageCircleQuestion className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="font-sans text-sm">No questions found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {questions.map((q) => (
                <div
                  key={q._id}
                  className="flex items-start gap-3 px-4 py-4 hover:bg-gray-50/60 transition-colors"
                >
                  {/* Avatar */}
                  <Avatar className="h-8 w-8 border border-gray-200 shrink-0 mt-0.5">
                    <AvatarImage src={q.askedBy?.avatar} />
                    <AvatarFallback className="bg-gray-100 text-gray-600 text-xs font-sans font-medium">
                      {getInitials(q.askedBy?.name || "?")}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-sans text-xs font-semibold text-gray-900">
                        {q.askedBy?.name}
                      </span>
                      {q.askedBy?.network && (
                        <span className="text-xs text-gray-400">· {q.askedBy.network}</span>
                      )}
                      <StatusBadge status={q.status} />
                    </div>
                    <p className="font-sans text-sm text-gray-700 line-clamp-2 leading-relaxed">
                      {q.question}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(q.createdAt), { addSuffix: true })}
                      {q.status === "answered" && q.answeredAt && (
                        <span className="ml-2 text-green-600">
                          · Answered {formatDistanceToNow(new Date(q.answeredAt), { addSuffix: true })}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {q.status === "pending" && (
                      <Button
                        size="sm"
                        className="h-7 px-3 text-xs rounded-lg bg-[#0052CC] hover:bg-[#003d99] text-white font-bold"
                        onClick={() => handleOpenAnswer(q)}
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Answer
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-gray-500 hover:bg-gray-200">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl border-gray-200 w-44">
                        <DropdownMenuItem
                          onClick={() => handleOpenView(q)}
                          className="rounded-lg cursor-pointer"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Full
                        </DropdownMenuItem>
                        {q.status !== "pending" && (
                          <DropdownMenuItem
                            onClick={() => handleOpenAnswer(q)}
                            className="rounded-lg cursor-pointer"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            {q.status === "answered" ? "Edit Answer" : "Answer"}
                          </DropdownMenuItem>
                        )}
                        {q.status === "pending" && (
                          <DropdownMenuItem
                            onClick={() => handleDismiss(q)}
                            className="rounded-lg cursor-pointer text-gray-500"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Dismiss
                          </DropdownMenuItem>
                        )}
                        {q.status === "dismissed" && (
                          <DropdownMenuItem
                            onClick={() => handleReopen(q)}
                            className="rounded-lg cursor-pointer"
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            Re-open
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedQuestion(q);
                            setDeleteDialogOpen(true);
                          }}
                          className="rounded-lg cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Answer Dialog */}
      <Dialog open={answerDialogOpen} onOpenChange={setAnswerDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-sans font-bold text-black">
              {selectedQuestion?.status === "answered" ? "Edit Answer" : "Answer Question"}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 leading-relaxed">
              {selectedQuestion?.question}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAnswer}>
            <div className="space-y-3 py-2">
              <Label htmlFor="answer" className="font-sans font-semibold text-sm">
                Response from Pastor Chris
              </Label>
              <Textarea
                id="answer"
                placeholder="Type the answer here..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={7}
                maxLength={5000}
                className="rounded-lg border-gray-200 resize-none font-sans text-sm"
              />
              <p className={cn(
                "text-xs text-right",
                answer.length > 4500 ? "text-red-500" : "text-gray-400"
              )}>
                {answer.length} / 5000
              </p>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setAnswerDialogOpen(false); setAnswer(""); }}
                className="rounded-lg border-gray-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending || answer.trim().length === 0}
                className="bg-[#0052CC] hover:bg-[#003d99] text-white font-bold rounded-lg"
              >
                {updateMutation.isPending ? "Saving..." : (
                  <><Send className="h-4 w-4 mr-2" />Publish Answer</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Full Question Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-sans font-bold text-black flex items-center gap-2">
              <Avatar className="h-7 w-7 border border-gray-200">
                <AvatarImage src={selectedQuestion?.askedBy?.avatar} />
                <AvatarFallback className="bg-gray-100 text-xs font-sans font-medium text-gray-600">
                  {getInitials(selectedQuestion?.askedBy?.name || "?")}
                </AvatarFallback>
              </Avatar>
              {selectedQuestion?.askedBy?.name}
            </DialogTitle>
            {selectedQuestion?.askedBy?.network && (
              <DialogDescription>{selectedQuestion.askedBy.network}</DialogDescription>
            )}
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Question</p>
              <p className="font-sans text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                {selectedQuestion?.question}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {selectedQuestion && formatDistanceToNow(new Date(selectedQuestion.createdAt), { addSuffix: true })}
              </p>
            </div>
            {selectedQuestion?.answer && (
              <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
                <p className="text-xs font-semibold text-[#0052CC] mb-2">
                  Pastor Chris
                  {selectedQuestion.answeredAt && (
                    <span className="font-normal text-gray-400 ml-2">
                      · {formatDistanceToNow(new Date(selectedQuestion.answeredAt), { addSuffix: true })}
                    </span>
                  )}
                </p>
                <p className="font-sans text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {selectedQuestion.answer}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewDialogOpen(false)}
              className="rounded-lg border-gray-200"
            >
              Close
            </Button>
            {selectedQuestion && (
              <Button
                className="bg-[#0052CC] hover:bg-[#003d99] text-white font-bold rounded-lg"
                onClick={() => {
                  setViewDialogOpen(false);
                  handleOpenAnswer(selectedQuestion);
                }}
              >
                <Send className="h-4 w-4 mr-2" />
                {selectedQuestion.status === "answered" ? "Edit Answer" : "Answer"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-xl border-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-sans font-bold text-black">Delete Question</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the question and any answer. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg border-gray-200">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedQuestion && deleteMutation.mutate(selectedQuestion._id)}
              className="rounded-lg bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
