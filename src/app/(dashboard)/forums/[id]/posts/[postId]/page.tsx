"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks";
import { forumsApi } from "@/lib/api/forums";
import { getInitials } from "@/lib/utils";
import type { ForumPost, Comment, User } from "@/types";
import { format, parseISO, formatDistanceToNow } from "date-fns";

function PostDetailPageContent() {
  const params = useParams();
  const forumId = params.id as string;
  const postId = params.postId as string;
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useT();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  // Track optimistic updates - maps id to optimistic liked state
  const [optimisticPostLikes, setOptimisticPostLikes] = useState<Map<string, boolean>>(new Map());
  const [optimisticCommentLikes, setOptimisticCommentLikes] = useState<Map<string, boolean>>(new Map());

  const { data: postData, isLoading: postLoading } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => forumsApi.getPost(postId),
  });

  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ["post-comments", postId],
    queryFn: () => forumsApi.getComments(postId, 1, 100),
  });

  // Helper to get effective liked state for post
  const getPostIsLiked = (postItem: ForumPost) => {
    if (optimisticPostLikes.has(postItem._id)) {
      return optimisticPostLikes.get(postItem._id)!;
    }
    return !!(postItem as any).isLiked;
  };

  // Helper to get effective liked state for comment
  const getCommentIsLiked = (comment: Comment) => {
    if (optimisticCommentLikes.has(comment._id)) {
      return optimisticCommentLikes.get(comment._id)!;
    }
    return !!(comment as any).isLiked;
  };

  const createCommentMutation = useMutation({
    mutationFn: ({ content, parentId }: { content: string; parentId?: string }) =>
      forumsApi.createComment(postId, content, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
      setNewComment("");
      setReplyTo(null);
      toast({ title: t("Comment added!") });
    },
    onError: () => {
      toast({ title: t("Failed to add comment"), variant: "destructive" });
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
    onError: (_, { id }) => {
      // Clear optimistic state on error - revert to server state
      setOptimisticPostLikes((prev) => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
      toast({ title: t("Failed to update vote"), variant: "destructive" });
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
    onError: (_, { commentId }) => {
      // Clear optimistic state on error - revert to server state
      setOptimisticCommentLikes((prev) => {
        const newMap = new Map(prev);
        newMap.delete(commentId);
        return newMap;
      });
      toast({ title: t("Failed to update vote"), variant: "destructive" });
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

  const post = postData?.data;
  const rawComments = commentsData?.data || [];

  // Helper to get parent ID (handles both object and string)
  const getParentId = (comment: any): string | null => {
    if (!comment.parent) return null;
    if (typeof comment.parent === 'string') return comment.parent;
    if (typeof comment.parent === 'object' && comment.parent !== null) {
      return comment.parent._id || null;
    }
    return null;
  };

  // Build a map of all comments by ID for quick lookup
  const commentMap = new Map<string, Comment>();
  
  // First pass: collect all comments (including nested replies)
  const flattenComments = (commentList: any[]): Comment[] => {
    const result: Comment[] = [];
    for (const comment of commentList) {
      result.push(comment);
      // If API returns nested replies, flatten them
      if (comment.replies && Array.isArray(comment.replies) && comment.replies.length > 0) {
        for (const reply of comment.replies) {
          // Ensure reply has parent set to this comment
          result.push({ ...reply, parent: reply.parent || comment._id });
        }
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

  const isLoading = postLoading || commentsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-lg font-medium"><T>Post not found</T></h2>
        <p className="text-muted-foreground mt-1">
          <T>This post may have been removed or doesn&apos;t exist.</T>
        </p>
        <Button asChild className="mt-4">
          <Link href={`/forums/${forumId}`}><T>Back to Forum</T></Link>
        </Button>
      </div>
    );
  }

  const CommentCard = ({ comment, depth = 0 }: { comment: Comment; depth?: number }) => {
    const isOwner = user?._id === (comment.user as User)?._id;
    const replies = getChildComments(comment._id);
    const parentId = getParentId(comment);
    const parentComment = parentId ? commentMap.get(parentId) : null;
    
    // Get liked state using helper (handles optimistic updates)
    const isCommentLiked = getCommentIsLiked(comment);
    const serverIsLiked = !!(comment as any).isLiked;
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
                {isOwner && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        <T>Edit</T>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        <T>Delete</T>
                      </DropdownMenuItem>
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
                <CommentCard key={reply._id} comment={reply} depth={depth + 1} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/forums/${forumId}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {post.isPinned && <Pin className="h-4 w-4 text-primary fill-primary" />}
            {post.isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
            <h1 className="text-2xl font-bold">{post.title}</h1>
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
                  const serverPostIsLiked = !!(post as any).isLiked;
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
        <CardHeader>
          <CardTitle className="text-lg">
            <T>Comments</T> ({comments.length})
          </CardTitle>
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
                <CommentCard key={comment._id} comment={comment} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
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
