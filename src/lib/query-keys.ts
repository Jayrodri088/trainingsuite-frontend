import type { QueryClient } from "@tanstack/react-query";
import type { Course } from "@/types";

type CachedCourseList = {
  data?: Course[];
};

type CourseIdentifiers = {
  id?: string;
  slug?: string;
};

export const courseQueryKeys = {
  all: ["courses"] as const,
  course: (idOrSlug: string) => ["course", idOrSlug] as const,
  curriculum: (idOrSlug: string) => ["course-curriculum", idOrSlug] as const,
  ratings: (idOrSlug: string, page?: number) =>
    page === undefined
      ? (["course-ratings", idOrSlug] as const)
      : (["course-ratings", idOrSlug, page] as const),
  related: (categoryId?: string) => ["related-courses", categoryId] as const,
  enrollments: ["enrollments"] as const,
  enrollmentCheck: ["enrollment-check"] as const,
  adminTopCourses: ["admin-top-courses"] as const,
  adminCourses: ["admin-courses"] as const,
  adminCoursesSelect: ["admin-courses-select"] as const,
} as const;

function matchesCourseIdentifier(course: Course, identifiers: CourseIdentifiers) {
  if (identifiers.id && course._id === identifiers.id) {
    return true;
  }

  if (identifiers.slug && course.slug === identifiers.slug) {
    return true;
  }

  return false;
}

function removeCourseFromList(oldData: unknown, identifiers: CourseIdentifiers) {
  if (!oldData || typeof oldData !== "object" || !("data" in oldData)) {
    return oldData;
  }

  const typedData = oldData as CachedCourseList;
  if (!Array.isArray(typedData.data)) {
    return oldData;
  }

  return {
    ...typedData,
    data: typedData.data.filter((course) => !matchesCourseIdentifier(course, identifiers)),
  };
}

export function invalidateCourseCollections(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: courseQueryKeys.all }),
    queryClient.invalidateQueries({ queryKey: courseQueryKeys.adminCourses }),
    queryClient.invalidateQueries({ queryKey: courseQueryKeys.adminTopCourses }),
    queryClient.invalidateQueries({ queryKey: courseQueryKeys.adminCoursesSelect }),
    queryClient.invalidateQueries({ queryKey: courseQueryKeys.enrollments }),
    queryClient.invalidateQueries({ queryKey: courseQueryKeys.enrollmentCheck }),
    queryClient.invalidateQueries({ queryKey: ["related-courses"] }),
  ]);
}

export function invalidateCourseDetails(queryClient: QueryClient, idOrSlug: string) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: courseQueryKeys.course(idOrSlug) }),
    queryClient.invalidateQueries({ queryKey: courseQueryKeys.curriculum(idOrSlug) }),
    queryClient.invalidateQueries({ queryKey: courseQueryKeys.ratings(idOrSlug) }),
  ]);
}

export function invalidateAllCourseDetails(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ["course"] }),
    queryClient.invalidateQueries({ queryKey: ["course-curriculum"] }),
    queryClient.invalidateQueries({ queryKey: ["course-ratings"] }),
  ]);
}

export function removeDeletedCourseFromCache(queryClient: QueryClient, identifiers: CourseIdentifiers) {
  queryClient.setQueriesData({ queryKey: courseQueryKeys.all }, (oldData) =>
    removeCourseFromList(oldData, identifiers)
  );
  queryClient.setQueriesData({ queryKey: courseQueryKeys.adminCourses }, (oldData) =>
    removeCourseFromList(oldData, identifiers)
  );
  queryClient.setQueriesData({ queryKey: courseQueryKeys.adminTopCourses }, (oldData) =>
    removeCourseFromList(oldData, identifiers)
  );
  queryClient.setQueriesData({ queryKey: courseQueryKeys.adminCoursesSelect }, (oldData) =>
    removeCourseFromList(oldData, identifiers)
  );
  queryClient.removeQueries({ queryKey: ["related-courses"] });

  if (identifiers.id) {
    queryClient.removeQueries({ queryKey: courseQueryKeys.course(identifiers.id) });
    queryClient.removeQueries({ queryKey: courseQueryKeys.curriculum(identifiers.id) });
    queryClient.removeQueries({ queryKey: courseQueryKeys.ratings(identifiers.id) });
  }

  if (identifiers.slug && identifiers.slug !== identifiers.id) {
    queryClient.removeQueries({ queryKey: courseQueryKeys.course(identifiers.slug) });
    queryClient.removeQueries({ queryKey: courseQueryKeys.curriculum(identifiers.slug) });
    queryClient.removeQueries({ queryKey: courseQueryKeys.ratings(identifiers.slug) });
  }

  queryClient.removeQueries({ queryKey: ["course"] });
  queryClient.removeQueries({ queryKey: ["course-curriculum"] });
  queryClient.removeQueries({ queryKey: ["course-ratings"] });
}
