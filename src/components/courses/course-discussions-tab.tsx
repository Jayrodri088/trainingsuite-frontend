"use client";

import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { coursesApi } from "@/lib/api/courses";
import { T, useT } from "@/components/t";

export function CourseDiscussionsTab({ courseIdOrSlug }: { courseIdOrSlug: string }) {
  const { t } = useT();
  const { data: forumResponse, isLoading, isError } = useQuery({
    queryKey: ["course-forum", courseIdOrSlug],
    queryFn: () => coursesApi.getForum(courseIdOrSlug),
    retry: false,
  });

  const forum = forumResponse?.data;

  if (isLoading) {
    return (
      <Card className="rounded-[12px] border-gray-200">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#0052CC]" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !forum) {
    return (
      <Card className="rounded-[12px] border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-5 w-5 text-[#0052CC]" />
            <T>Discussions</T>
          </CardTitle>
          <CardDescription>
            <T>Course discussions and Q&A happen in the community forums. Browse topics or start a new discussion.</T>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="rounded-[10px] bg-[#0052CC] hover:bg-[#003d99]">
            <Link href="/forums">
              <T>Go to Community</T>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-[12px] border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-5 w-5 text-[#0052CC]" />
          {forum.title}
        </CardTitle>
        {forum.description && (
          <CardDescription>{forum.description}</CardDescription>
        )}
        {forum.postCount != null && (
          <p className="text-sm text-gray-600">
            {(forum.postCount || 0).toLocaleString()} <T>topics</T>
          </p>
        )}
      </CardHeader>
      <CardContent>
        <Button asChild className="rounded-[10px] bg-[#0052CC] hover:bg-[#003d99]">
          <Link href={`/forums/${forum._id}`}>
            <T>View discussions</T>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
