// lib/api/courseCategory.ts

export const createCourseCategory = async (data: any) => {
  const res = await fetch("/api/course-categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
};