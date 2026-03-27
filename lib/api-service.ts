// lib/api-service.ts
// Frontend API service to connect your CourseCategoryCreator component to the backend

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

// ==================== COURSE CATEGORIES ====================

export async function fetchCourseCategories(params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  isDraft?: boolean;
  levelId?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.search) searchParams.set("search", params.search);
  if (params?.isActive !== undefined)
    searchParams.set("isActive", String(params.isActive));
  if (params?.isDraft !== undefined)
    searchParams.set("isDraft", String(params.isDraft));
  if (params?.levelId) searchParams.set("levelId", params.levelId);

  const res = await fetch(
    `${API_BASE}/api/course-categories?${searchParams.toString()}`
  );
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function fetchCourseCategory(id: string) {
  const res = await fetch(`${API_BASE}/api/course-categories/${id}`);
  if (!res.ok) throw new Error("Failed to fetch category");
  return res.json();
}

export async function createCourseCategory(data: {
  name: string;
  code: string;
  levelId?: string;
  durationTypeId?: string;
  description?: string;
  color?: string;
  icon?: string;
  categoryLogo?: string;
  categoryBackground?: string;
  isDraft?: boolean;
  createdBy?: string;
  certificateTemplate: {
    certificateName: string;
    passThreshold?: number;
    awardCategoryId?: string;
    includeRanking?: boolean;
    includeScore?: boolean;
    validityPeriod?: string;
    gradeA?: number;
    gradeB?: number;
    gradeC?: number;
    borderStyle?: string;
    backgroundColor?: string;
    primaryColor?: string;
    accentColor?: string;
    logoUrl?: string;
    backgroundPattern?: string;
    sealEnabled?: boolean;
    qrPosition?: string;
  };
}) {
  const res = await fetch(`${API_BASE}/api/course-categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create category");
  }
  return res.json();
}

export async function updateCourseCategory(
  id: string,
  data: Record<string, unknown>
) {
  const res = await fetch(`${API_BASE}/api/course-categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to update category");
  }
  return res.json();
}

export async function deleteCourseCategory(id: string) {
  const res = await fetch(`${API_BASE}/api/course-categories/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete category");
  return res.json();
}

export async function syncCourseCategory(id: string) {
  const res = await fetch(`${API_BASE}/api/course-categories/${id}/sync`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to sync category");
  return res.json();
}

// ==================== MASTER DATA ====================

export async function fetchCourseLevels() {
  const res = await fetch(`${API_BASE}/api/master-data/levels`);
  if (!res.ok) throw new Error("Failed to fetch levels");
  return res.json();
}

export async function createCourseLevel(data: {
  name: string;
  sortOrder?: number;
}) {
  const res = await fetch(`${API_BASE}/api/master-data/levels`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create level");
  }
  return res.json();
}

export async function fetchDurationTypes() {
  const res = await fetch(`${API_BASE}/api/master-data/duration-types`);
  if (!res.ok) throw new Error("Failed to fetch duration types");
  return res.json();
}

export async function createDurationType(data: {
  name: string;
  sortOrder?: number;
}) {
  const res = await fetch(`${API_BASE}/api/master-data/duration-types`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create duration type");
  }
  return res.json();
}

export async function fetchAwardCategories() {
  const res = await fetch(`${API_BASE}/api/master-data/award-categories`);
  if (!res.ok) throw new Error("Failed to fetch award categories");
  return res.json();
}

export async function createAwardCategory(data: {
  name: string;
  sortOrder?: number;
}) {
  const res = await fetch(`${API_BASE}/api/master-data/award-categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create award category");
  }
  return res.json();
}

// ==================== FILE UPLOAD ====================

export async function uploadFile(
  file: File,
  folder: string = "general"
): Promise<{ url: string; fileName: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const res = await fetch(`${API_BASE}/api/uploads`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to upload file");
  }

  const result = await res.json();
  return result.data;
}
