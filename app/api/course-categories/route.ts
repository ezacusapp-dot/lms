// app/api/course-categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateCategoryCreate } from "@/lib/validations";
import type {
  CreateCourseCategoryRequest,
  ApiResponse,
  CourseCategoryResponse,
  PaginatedResponse,
} from "@/types/course-category";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // 🔥 allow React app
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// Include relations for full response
const categoryIncludes = {
  level: true,
  durationType: true,
  certificateTemplate: {
    include: {
      awardCategory: true,
    },
  },
};


// ==================== GET ALL CATEGORIES ====================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const isActive = searchParams.get("isActive");
    const isDraft = searchParams.get("isDraft");
    const levelId = searchParams.get("levelId");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    if (isDraft !== null && isDraft !== undefined) {
      where.isDraft = isDraft === "true";
    }

    if (levelId) {
      where.levelId = levelId;
    }

    const [categories, total] = await Promise.all([
      prisma.courseCategory.findMany({
        where,
        include: categoryIncludes,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.courseCategory.count({ where }),
    ]);

    const response: PaginatedResponse<CourseCategoryResponse> = {
      success: true,
      data: categories as unknown as CourseCategoryResponse[],
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

   // return NextResponse.json(response);
   return NextResponse.json(response, {
  headers: corsHeaders,
});
  } catch (error) {
    console.error("GET /api/course-categories error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch course categories" },
      { status: 500 ,headers: corsHeaders}
    );
  }
}

// ==================== CREATE CATEGORY ====================
export async function POST(request: NextRequest) {
  try {
    const body: CreateCourseCategoryRequest = await request.json();

    // Validate
    const validationErrors = validateCategoryCreate(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          message: validationErrors.join(", "),
        },
        { status: 400 ,headers: corsHeaders}
      );
    }

    // Check for duplicate code
    const existingCategory = await prisma.courseCategory.findUnique({
      where: { code: body.code },
    });

    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: "Category with this code already exists",
        },
        { status: 409 ,headers: corsHeaders}
      );
    }

    // Create category with nested certificate template in a transaction
    const category = await prisma.$transaction(async (tx) => {
      const newCategory = await tx.courseCategory.create({
        data: {
          name: body.name,
          code: body.code,
          description: body.description || null,
          color: body.color || "#49205E",
          icon: body.icon || null,
          categoryLogo: body.categoryLogo || null,
          categoryBackground: body.categoryBackground || null,
          isDraft: body.isDraft || false,
          isActive: true,
          createdBy: body.createdBy || null,
          synced: false,

          // Connect to master data relations
          ...(body.levelId && {
            level: { connect: { id: body.levelId } },
          }),
          ...(body.durationTypeId && {
            durationType: { connect: { id: body.durationTypeId } },
          }),

          // Create linked certificate template
          certificateTemplate: {
            create: {
              certificateName: body.certificateTemplate.certificateName,
              passThreshold: body.certificateTemplate.passThreshold ?? 75,
              includeRanking: body.certificateTemplate.includeRanking ?? true,
              includeScore: body.certificateTemplate.includeScore ?? true,
              validityPeriod:
                body.certificateTemplate.validityPeriod || "Lifetime",
              gradeA: body.certificateTemplate.gradeA ?? 90,
              gradeB: body.certificateTemplate.gradeB ?? 75,
              gradeC: body.certificateTemplate.gradeC ?? 60,
              borderStyle: body.certificateTemplate.borderStyle || "classic",
              backgroundColor:
                body.certificateTemplate.backgroundColor || "#FFFFFF",
              primaryColor:
                body.certificateTemplate.primaryColor || "#49205E",
              accentColor: body.certificateTemplate.accentColor || "#BC579E",
              logoUrl: body.certificateTemplate.logoUrl || null,
              backgroundPattern:
                body.certificateTemplate.backgroundPattern || null,
              sealEnabled: body.certificateTemplate.sealEnabled ?? true,
              qrPosition:
                body.certificateTemplate.qrPosition || "bottom-right",

              // Connect award category if provided
              ...(body.certificateTemplate.awardCategoryId && {
                awardCategory: {
                  connect: { id: body.certificateTemplate.awardCategoryId },
                },
              }),
            },
          },
        },
        include: categoryIncludes,
      });

      return newCategory;
    });

    const response: ApiResponse<CourseCategoryResponse> = {
      success: true,
      data: category as unknown as CourseCategoryResponse,
      message: body.isDraft
        ? "Category saved as draft"
        : "Category created successfully",
    };
return NextResponse.json(response, {
    status: 201,
    headers: corsHeaders,
  });
   // return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("POST /api/course-categories error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create course category" },
      { status: 500,headers: corsHeaders }
    );
  }
}
