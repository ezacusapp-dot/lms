// lib/validations.ts

import { CreateCourseCategoryRequest } from "@/types/course-category";

export function validateCategoryCreate(data: CreateCourseCategoryRequest): string[] {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push("Category name is required");
  }

  if (!data.code || data.code.trim().length === 0) {
    errors.push("Category code is required");
  }

  if (!data.certificateTemplate) {
    errors.push("Certificate template is required");
  } else {
    if (
      !data.certificateTemplate.certificateName ||
      data.certificateTemplate.certificateName.trim().length === 0
    ) {
      errors.push("Certificate name is required");
    }

    const { gradeA, gradeB, gradeC, passThreshold } = data.certificateTemplate;

    if (gradeA !== undefined && gradeB !== undefined && gradeA <= gradeB) {
      errors.push("Grade A threshold must be higher than Grade B");
    }

    if (gradeB !== undefined && gradeC !== undefined && gradeB <= gradeC) {
      errors.push("Grade B threshold must be higher than Grade C");
    }

    if (
      passThreshold !== undefined &&
      gradeC !== undefined &&
      passThreshold > gradeC
    ) {
      errors.push("Pass threshold should not exceed Grade C threshold");
    }

    if (passThreshold !== undefined && (passThreshold < 0 || passThreshold > 100)) {
      errors.push("Pass threshold must be between 0 and 100");
    }
  }

  return errors;
}

export function validateMasterData(data: { name?: string }): string[] {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push("Name is required");
  }

  return errors;
}
