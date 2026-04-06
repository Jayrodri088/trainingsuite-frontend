import type { Course } from "@/types";

export function isExistingCourse(course: Course | null | undefined): course is Course {
  return Boolean(course?._id && course.title);
}
