// types/course-category.ts

// ==================== REQUEST TYPES ====================

export interface CreateCourseCategoryRequest {
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

  // Nested certificate template
  certificateTemplate: CreateCertificateTemplateRequest;
}

export interface UpdateCourseCategoryRequest {
  name?: string;
  code?: string;
  levelId?: string;
  durationTypeId?: string;
  description?: string;
  color?: string;
  icon?: string;
  categoryLogo?: string;
  categoryBackground?: string;
  isDraft?: boolean;
  isActive?: boolean;

  // Nested certificate template update
  certificateTemplate?: UpdateCertificateTemplateRequest;
}

export interface CreateCertificateTemplateRequest {
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
}

export interface UpdateCertificateTemplateRequest
  extends Partial<CreateCertificateTemplateRequest> {}

export interface CreateMasterDataRequest {
  name: string;
  sortOrder?: number;
}

// ==================== RESPONSE TYPES ====================

export interface CourseCategoryResponse {
  id: string;
  name: string;
  code: string;
  description: string | null;
  color: string;
  icon: string | null;
  categoryLogo: string | null;
  categoryBackground: string | null;
  isDraft: boolean;
  isActive: boolean;
  synced: boolean;
  syncedAt: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  level: MasterDataResponse | null;
  durationType: MasterDataResponse | null;
  certificateTemplate: CertificateTemplateResponse | null;
}

export interface CertificateTemplateResponse {
  id: string;
  certificateName: string;
  passThreshold: number;
  includeRanking: boolean;
  includeScore: boolean;
  validityPeriod: string;
  gradeA: number;
  gradeB: number;
  gradeC: number;
  borderStyle: string;
  backgroundColor: string;
  primaryColor: string;
  accentColor: string;
  logoUrl: string | null;
  backgroundPattern: string | null;
  sealEnabled: boolean;
  qrPosition: string;
  awardCategory: MasterDataResponse | null;
  createdAt: string;
  updatedAt: string;
}

export interface MasterDataResponse {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
