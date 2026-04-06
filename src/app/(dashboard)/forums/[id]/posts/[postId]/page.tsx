"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  MessageSquare,
  ArrowLeft,
  Pin,
  Lock,
  Eye,
  Clock,
  Reply,
  MoreVertical,
  Trash2,
  Edit,
  Loader2,
  Send,
  ThumbsUp,
  ChevronRight,
} from "lucide-react";
import { T, useT } from "@/components/t";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks";
import { forumsApi } from "@/lib/api/forums";
import { getInitials, getErrorMessage, isAxiosHttpStatus } from "@/lib/utils";
import type { Forum, ForumPost, Comment, User } from "@/types";
import { format, parseISO, formatDistanceToNow } from "date-fns";

function PostDetailPageContent() {
  const params = useParams();
  const forumId = params.id as string;
  const postId = params.postId as string;
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useT();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [commentSort, setCommentSort] = useState<"latest" | "oldest" | "mostLiked">("oldest");
  // Track optimistic updates - maps id to optimistic liked state
  const [optimisticPostLikes, setOptimisticPostLikes] = useState<Map<string, boolean>>(new Map());
  const [optimisticCommentLikes, setOptimisticCommentLikes] = useState<Map<string, boolean>>(new Map());

  const {
    data: postData,
    isLoading: postLoading,
    isSuccess: postQuerySuccess,
    isError: postError,
    error: postQueryError,
    refetch: refetchPost,
  } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => forumsApi.getPost(postId),
    retry: (failureCount, error) =>
      !isAxiosHttpStatus(error, 404) && failureCount < 3,
  });

  const postLoaded = postQuerySuccess && !!postData?.data;

  const {
    data: commentsData,
    isLoading: commentsLoading,
    isError: commentsError,
    error: commentsQueryError,
    refetch: refetchComments,
  } = useQuery({
    queryKey: ["post-comments", postId, commentSort],
    queryFn: () => forumsApi.getComments(postId, 1, 100, commentSort),
    enabled: postLoaded,
    retry: (failureCount, error) =>
      !isAxiosHttpStatus(error, 404) && failureCount < 3,
  });

  const post = postData?.data;

  // Helper to get effective liked state for post
  const getPostIsLiked = (postItem: ForumPost) => {
    if (optimisticPostLikes.has(postItem._id)) {
      return optimisticPostLikes.get(postItem._id)!;
    }
    return !!postItem.isLiked;
  };

  // Helper to get effective liked state for comment
  const getCommentIsLiked = (comment: Comment) => {
    if (optimisticCommentLikes.has(comment._id)) {
      return optimisticCommentLikes.get(comment._id)!;
    }
    return !!comment.isLiked;
  };

  const commentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const createCommentMutation = useMutation({
    mutationFn: ({ content, parentId }: { content: string; parentId?: string }) =>
      forumsApi.createComment(postId, content, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
      setNewComment("");
      // Keep replyTo so the reply form stays visible and thread doesn't collapse
      toast({ title: t("Comment added!") });
      setTimeout(() => commentTextareaRef.current?.focus(), 100);
    },
    onError: (err) => {
      toast({ title: getErrorMessage(err), description: t("Something went wrong. Try again."), variant: "destructive" });
    },
  });

  // Like/unlike post mutation - uses correct method based on current state
  const likePostMutation = useMutation({
    mutationFn: async ({ id, isCurrentlyLiked }: { id: string; isCurrentlyLiked: boolean }) => {
      if (isCurrentlyLiked) {
        return forumsApi.unlikePost(id);
      }
      return forumsApi.likePost(id);
    },
    onMutate: async ({ id, isCurrentlyLiked }) => {
      // Optimistic update - store the new desired state
      setOptimisticPostLikes((prev) => {
        const newMap = new Map(prev);
        newMap.set(id, !isCurrentlyLiked);
        return newMap;
      });
      return { id, isCurrentlyLiked };
    },
    onSuccess: (_, { id }) => {
      // Clear optimistic state - server state will be authoritative after refetch
      setOptimisticPostLikes((prev) => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
    onError: (err, { id }) => {
      setOptimisticPostLikes((prev) => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
      toast({ title: getErrorMessage(err), description: t("Something went wrong. Try again."), variant: "destructive" });
    },
  });

  // Like/unlike comment mutation - uses correct method based on current state
  const likeCommentMutation = useMutation({
    mutationFn: async ({ commentId, isCurrentlyLiked }: { commentId: string; isCurrentlyLiked: boolean }) => {
      if (isCurrentlyLiked) {
        return forumsApi.unlikeComment(commentId);
      }
      return forumsApi.likeComment(commentId);
    },
    onMutate: async ({ commentId, isCurrentlyLiked }) => {
      // Optimistic update - store the new desired state
      setOptimisticCommentLikes((prev) => {
        const newMap = new Map(prev);
        newMap.set(commentId, !isCurrentlyLiked);
        return newMap;
      });
      return { commentId, isCurrentlyLiked };
    },
    onSuccess: (_, { commentId }) => {
      // Clear optimistic state - server state will be authoritative after refetch
      setOptimisticCommentLikes((prev) => {
        const newMap = new Map(prev);
        newMap.delete(commentId);
        return newMap;
      });
      queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
    },
    onError: (err, { commentId }) => {
      setOptimisticCommentLikes((prev) => {
        const newMap = new Map(prev);
        newMap.delete(commentId);
        return newMap;
      });
      toast({ title: getErrorMessage(err), description: t("Something went wrong. Try again."), variant: "destructive" });
    },
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast({ title: t("Please enter a comment"), variant: "destructive" });
      return;
    }
    createCommentMutation.mutate({
      content: newComment,
      parentId: replyTo?._id,
    });
  };

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => forumsApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      toast({ title: t("Comment deleted") });
    },
    onError: (err) => {
      toast({ title: getErrorMessage(err), variant: "destructive" });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: () => forumsApi.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-posts", forumId] });
      toast({ title: t("Post deleted") });
      router.push(`/forums/${forumId}`);
    },
    onError: (err) => {
      toast({ title: getErrorMessage(err), variant: "destructive" });
    },
  });

  const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);
  const [showDeletePostConfirm, setShowDeletePostConfirm] = useState(false);

  const rawComments = commentsData?.data || [];

  // Helper to get parent ID
  const getParentId = (comment: Comment): string | null => {
    return comment.parent || null;
  };

  // Build a map of all comments by ID for quick lookup
  const commentMap = new Map<string, Comment>();
  
  // First pass: collect all comments (including nested replies)
  const flattenComments = (commentList: Comment[], parentId?: string): Comment[] => {
    const result: Comment[] = [];
    for (const comment of commentList) {
      const normalizedComment = parentId
        ? { ...comment, parent: comment.parent || parentId }
        : comment;
      result.push(normalizedComment);

      if (comment.replies && Array.isArray(comment.replies) && comment.replies.length > 0) {
        result.push(...flattenComments(comment.replies, normalizedComment._id));
      }
    }
    return result;
  };

  const comments = flattenComments(rawComments);
  
  // Build comment map
  comments.forEach(c => commentMap.set(c._id, c));

  // Organize comments into threads
  const rootComments = comments.filter((c) => !getParentId(c));
  
  // Get all child comments for a parent (recursive through all nested levels)
  const getChildComments = (parentId: string): Comment[] => {
    return comments.filter((c) => getParentId(c) === parentId);
  };

  const isLoading = postLoading || (postLoaded && commentsLoading);
  const hasError = postError || commentsError;
  const isNotFound =
    isAxiosHttpStatus(postQueryError, 404) ||
    isAxiosHttpStatus(commentsQueryError, 404) ||
    (!postLoading && !postError && !post);
  const refetchAll = () => {
    refetchPost();
    refetchComments();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isNotFound) {
    return (
      <div className="space-y-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground">
          <Link href="/forums" className="hover:text-foreground">
            <T>Forums</T>
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">
            <T>Post</T>
          </span>
        </nav>
        <Card>
          <CardContent className="pt-6 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="font-medium text-lg">
              <T>This post is no longer available</T>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              <T>It may have been removed, or this link is out of date.</T>
            </p>
            <Button asChild className="mt-6">
              <Link href={`/forums/${forumId}`}>
                <T>Back to Forum</T>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="space-y-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground">
          <Link href="/forums" className="hover:text-foreground">
            <T>Forums</T>
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">
            <T>Post</T>
          </span>
        </nav>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="font-medium">
              <T>Something went wrong</T>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              <T>We couldn&apos;t load this page. Please try again.</T>
            </p>
            <Button className="mt-4" onClick={refetchAll}>
              <T>Try again</T>
            </Button>
            <Button variant="outline" className="mt-3 ml-2" asChild>
              <Link href={`/forums/${forumId}`}>
                <T>Back to Forum</T>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const CommentCard = ({
    comment,
    depth = 0,
    onDeleteComment,
    canDeleteComment,
  }: {
    comment: Comment;
    depth?: number;
    onDeleteComment?: (c: Comment) => void;
    canDeleteComment?: (c: Comment) => boolean;
  }) => {
    const isOwner = user?._id === (comment.user as User)?._id;
    const canDelete = canDeleteComment?.(comment) ?? false;
    const replies = getChildComments(comment._id);
    const parentId = getParentId(comment);
    const parentComment = parentId ? commentMap.get(parentId) : null;
    
    // Get liked state using helper (handles optimistic updates)
    const isCommentLiked = getCommentIsLiked(comment);
    const serverIsLiked = !!comment.isLiked;
    const serverLikeCount = comment.likes || 0;
    
    // Adjust display count based on optimistic state vs server state
    const displayLikeCount = (() => {
      if (isCommentLiked === serverIsLiked) return serverLikeCount;
      if (isCommentLiked && !serverIsLiked) return serverLikeCount + 1;
      if (!isCommentLiked && serverIsLiked) return Math.max(0, serverLikeCount - 1);
      return serverLikeCount;
    })();

    return (
      <div className={depth > 0 ? "ml-4 sm:ml-8 border-l-2 border-primary/20 pl-3 sm:pl-4" : ""}>
        <div className="py-3 sm:py-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <Avatar className="h-7 w-7 sm:h-8 sm:w-8 shrink-0">
              <AvatarImage src={comment.user?.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs sm:text-sm">
                {getInitials(comment.user?.name || "?")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-medium text-sm">{comment.user?.name || "Anonymous"}</span>
                {parentComment && depth > 0 && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Reply className="h-3 w-3" />
                    <span className="text-primary">@{parentComment.user?.name || "Anonymous"}</span>
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(parseISO(comment.createdAt), { addSuffix: true })}
                </span>
                {comment.isEdited && (
                  <span className="text-xs text-muted-foreground">(<T>edited</T>)</span>
                )}
              </div>
              <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
              <div className="flex items-center gap-2 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 text-xs gap-1 ${isCommentLiked ? "text-primary bg-primary/10" : ""}`}
                  onClick={() => likeCommentMutation.mutate({ commentId: comment._id, isCurrentlyLiked: isCommentLiked })}
                  title={t(isCommentLiked ? "Remove upvote" : "Upvote this comment")}
                >
                  <ThumbsUp className={`h-3 w-3 ${isCommentLiked ? "fill-primary" : ""}`} />
                  <span>{displayLikeCount}</span>
                  <span className="hidden sm:inline">{isCommentLiked ? t("Upvoted") : t("Upvote")}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setReplyTo(comment)}
                >
                  <Reply className="h-3 w-3 mr-1" />
                  <T>Reply</T>
                </Button>
                {(isOwner || canDelete) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {isOwner && (
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          <T>Edit</T>
                        </DropdownMenuItem>
                      )}
                      {(isOwner || canDelete) && (
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive cursor-pointer"
                          onClick={() => onDeleteComment?.(comment)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          <T>Delete</T>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </div>
        {replies.length > 0 && (
          <div className="mt-1">
            {depth === 0 && replies.length > 0 && (
              <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>{replies.length} {replies.length === 1 ? t("reply") : t("replies")}</span>
              </div>
            )}
            <div className="space-y-0">
              {replies.map((reply) => (
                <CommentCard
                  key={reply._id}
                  comment={reply}
                  depth={depth + 1}
                  onDeleteComment={onDeleteComment}
                  canDeleteComment={canDeleteComment}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const forumTitle =
    post &&
    typeof post.forum === "object" &&
    post.forum !== null &&
    "title" in post.forum
      ? (post.forum as Forum).title
      : undefined;

  const isPostOwner = !!post && !!user && String((post.user as User)?._id ?? post.user) === user._id;
  const isAdmin = user?.role === "admin";
  const canModeratePost = isPostOwner || isAdmin;
  const canDeleteCommentFn = (c: Comment) =>
    !!user && (String((c.user as User)?._id ?? c.user) === user._id || user.role === "admin");
  const onDeleteCommentFn = (c: Comment) => setCommentToDelete(c);

  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground font-sans">
        <Link href="/forums" className="hover:text-foreground transition-colors"><T>Forums</T></Link>
        <ChevronRight className="h-4 w-4 shrink-0" />
        <Link href={`/forums/${forumId}`} className="hover:text-foreground transition-colors truncate max-w-[180px] sm:max-w-none">
          {forumTitle ?? t("Forum")}
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0" />
        <span className="text-foreground font-medium truncate">{post.title}</span>
      </nav>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/forums/${forumId}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {post.isPinned && <Pin className="h-4 w-4 text-primary fill-primary" />}
            {post.isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
            <h1 className="text-2xl font-bold truncate">{post.title}</h1>
            {canModeratePost && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive cursor-pointer"
                    onClick={() => setShowDeletePostConfirm(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    <T>Delete post</T>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Post Content */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={post.user?.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(post.user?.name || "?")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">{post.user?.name || "Anonymous"}</span>
                <span className="text-sm text-muted-foreground">
                  {format(parseISO(post.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{post.content}</p>
              </div>
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                {(() => {
                  const isPostLiked = getPostIsLiked(post);
                  const serverPostIsLiked = !!post.isLiked;
                  const serverPostLikeCount = post.likes || 0;
                  const displayPostLikeCount = (() => {
                    if (isPostLiked === serverPostIsLiked) return serverPostLikeCount;
                    if (isPostLiked && !serverPostIsLiked) return serverPostLikeCount + 1;
                    if (!isPostLiked && serverPostIsLiked) return Math.max(0, serverPostLikeCount - 1);
                    return serverPostLikeCount;
                  })();
                  
                  return (
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 px-3 gap-1 ${isPostLiked ? "text-primary bg-primary/10" : "text-muted-foreground"}`}
                      onClick={() => likePostMutation.mutate({ id: post._id, isCurrentlyLiked: isPostLiked })}
                      title={t(isPostLiked ? "Remove upvote" : "Upvote this post")}
                    >
                      <ThumbsUp className={`h-4 w-4 ${isPostLiked ? "fill-primary" : ""}`} />
                      <span>{displayPostLikeCount}</span>
                      <span className="hidden sm:inline">{isPostLiked ? t("Upvoted") : t("Upvote")}</span>
                    </Button>
                  );
                })()}
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{post.viewCount || 0} <T>views</T></span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{comments.length} <T>comments</T></span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comment Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {replyTo ? <><T>Reply to</T> {replyTo.user?.name}</> : <T>Add a Comment</T>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {post.isLocked ? (
            <div className="text-center py-4 text-muted-foreground">
              <Lock className="h-8 w-8 mx-auto mb-2" />
              <p><T>This discussion is locked and no longer accepting comments.</T></p>
            </div>
          ) : (
            <form onSubmit={handleSubmitComment} className="space-y-3">
              {replyTo && (
                <div className="flex items-center justify-between p-2 bg-muted rounded-lg text-sm">
                  <span><T>Replying to:</T> &quot;{replyTo.content.substring(0, 50)}...&quot;</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyTo(null)}
                  >
                    <T>Cancel</T>
                  </Button>
                </div>
              )}
              <Textarea
                ref={commentTextareaRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={t("Write your comment...")}
                rows={3}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={createCommentMutation.isPending}>
                  {createCommentMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <T>Posting...</T>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      <T>Post Comment</T>
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Comments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">
            <T>Comments</T> ({comments.length})
          </CardTitle>
          <Select value={commentSort} onValueChange={(v: "latest" | "oldest" | "mostLiked") => setCommentSort(v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="oldest"><T>Oldest first</T></SelectItem>
              <SelectItem value="latest"><T>Latest first</T></SelectItem>
              <SelectItem value="mostLiked"><T>Most liked</T></SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p><T>No comments yet. Be the first to comment!</T></p>
            </div>
          ) : (
            <div className="divide-y">
              {rootComments.map((comment) => (
                <CommentCard
                  key={comment._id}
                  comment={comment}
                  onDeleteComment={onDeleteCommentFn}
                  canDeleteComment={canDeleteCommentFn}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeletePostConfirm} onOpenChange={setShowDeletePostConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle><T>Delete post?</T></AlertDialogTitle>
            <AlertDialogDescription>
              <T>This will permanently delete the post and all its comments. This action cannot be undone.</T>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel><T>Cancel</T></AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                deletePostMutation.mutate();
                setShowDeletePostConfirm(false);
              }}
            >
              {deletePostMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <T>Delete</T>}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!commentToDelete} onOpenChange={(open) => !open && setCommentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle><T>Delete comment?</T></AlertDialogTitle>
            <AlertDialogDescription>
              <T>This will permanently delete this comment and any replies. This action cannot be undone.</T>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel><T>Cancel</T></AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (commentToDelete) {
                  deleteCommentMutation.mutate(commentToDelete._id);
                  setCommentToDelete(null);
                }
              }}
            >
              {deleteCommentMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <T>Delete</T>}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function PostDetailPage() {
  return (
    <ProtectedRoute>
      <PostDetailPageContent />
    </ProtectedRoute>
  );
}
