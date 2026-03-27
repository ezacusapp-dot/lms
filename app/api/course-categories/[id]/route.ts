// app/api/course-categories/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type {
  UpdateCourseCategoryRequest,
  ApiResponse,
  CourseCategoryResponse,
} from "@/types/course-category";

const categoryIncludes = {
  level: true,
  durationType: true,
  certificateTemplate: {
    include: {
      awardCategory: true,
    },
  },
};

// ==================== GET SINGLE CATEGORY ====================
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } } // ✅ FIXED
) {
  try {
    const id = String(params.id); // ✅ FIXED

    const category = await prisma.courseCategory.findUnique({
      where: { id },
      include: categoryIncludes,
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    const response: ApiResponse<CourseCategoryResponse> = {
      success: true,
      data: category as unknown as CourseCategoryResponse,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

// ==================== UPDATE CATEGORY ====================
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } } // ✅ FIXED
) {
  try {
   const id = String(params.id); // ✅ FIXED
    const body: UpdateCourseCategoryRequest = await request.json();

    const existing = await prisma.courseCategory.findUnique({
      where: { id },
      include: { certificateTemplate: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // Check duplicate code
    if (body.code && body.code !== existing.code) {
      const duplicateCode = await prisma.courseCategory.findUnique({
        where: { code: body.code },
      });

      if (duplicateCode) {
        return NextResponse.json(
          { success: false, error: "Category with this code already exists" },
          { status: 409 }
        );
      }
    }

    const updatedCategory = await prisma.$transaction(async (tx) => {
      const categoryUpdateData: any = {};

      if (body.name !== undefined) categoryUpdateData.name = body.name;
      if (body.code !== undefined) categoryUpdateData.code = body.code;
      if (body.description !== undefined) categoryUpdateData.description = body.description;
      if (body.color !== undefined) categoryUpdateData.color = body.color;
      if (body.icon !== undefined) categoryUpdateData.icon = body.icon;
      if (body.categoryLogo !== undefined) categoryUpdateData.categoryLogo = body.categoryLogo;
      if (body.categoryBackground !== undefined) categoryUpdateData.categoryBackground = body.categoryBackground;
      if (body.isDraft !== undefined) categoryUpdateData.isDraft = body.isDraft;
      if (body.isActive !== undefined) categoryUpdateData.isActive = body.isActive;

      // Relations
      if (body.levelId !== undefined) {
        categoryUpdateData.level = body.levelId
          ? { connect: { id: body.levelId } }
          : { disconnect: true };
      }

      if (body.durationTypeId !== undefined) {
        categoryUpdateData.durationType = body.durationTypeId
          ? { connect: { id: body.durationTypeId } }
          : { disconnect: true };
      }

      // Certificate template update
      if (body.certificateTemplate && existing.certificateTemplate) {
        const certData: any = {};

        const certFields = [
          "certificateName",
          "passThreshold",
          "includeRanking",
          "includeScore",
          "validityPeriod",
          "gradeA",
          "gradeB",
          "gradeC",
          "borderStyle",
          "backgroundColor",
          "primaryColor",
          "accentColor",
          "logoUrl",
          "backgroundPattern",
          "sealEnabled",
          "qrPosition",
        ] as const;

        for (const field of certFields) {
          if (body.certificateTemplate[field] !== undefined) {
            certData[field] = body.certificateTemplate[field];
          }
        }

        if (body.certificateTemplate.awardCategoryId !== undefined) {
          certData.awardCategory = body.certificateTemplate.awardCategoryId
            ? { connect: { id: body.certificateTemplate.awardCategoryId } }
            : { disconnect: true };
        }

        await tx.certificateTemplate.update({
          where: { id: existing.certificateTemplate.id },
          data: certData,
        });
      }

      categoryUpdateData.synced = false;
      categoryUpdateData.syncedAt = null;

      return await tx.courseCategory.update({
        where: { id },
        data: categoryUpdateData,
        include: categoryIncludes,
      });
    });

    const response: ApiResponse<CourseCategoryResponse> = {
      success: true,
      data: updatedCategory as unknown as CourseCategoryResponse,
      message: "Category updated successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// ==================== DELETE CATEGORY ====================
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } } // ✅ FIXED
) {
  try {
    const id = String(params.id);// ✅ FIXED

    const existing = await prisma.courseCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    await prisma.courseCategory.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete category" },
      { status: 500 }
    );
  }
}