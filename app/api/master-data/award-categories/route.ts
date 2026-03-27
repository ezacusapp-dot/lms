// app/api/master-data/award-categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateMasterData } from "@/lib/validations";
import type { ApiResponse, MasterDataResponse } from "@/types/course-category";
const corsHeaders = {
   "Access-Control-Allow-Origin": "http://localhost:5173", // 🔥 allow React app
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ==================== GET ALL AWARD CATEGORIES ====================
// ================= GET AWARD CATEGORIES =================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // ✅ CLEAN WHERE (same as courses)
    const where: any = {
      isActive: true,
    };

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    // ✅ COUNT (same pattern)
    const total = await prisma.awardCategory.count({ where });

    // ✅ FETCH (same structure)
    const awardCategories = await prisma.awardCategory.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        sortOrder: "asc",
      },
    });

    // ✅ SAME RESPONSE FORMAT
    return NextResponse.json({
      status: true,
      data: awardCategories,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error: any) {
    console.error("AWARD CATEGORY ERROR:", error);

    return NextResponse.json(
      { status: false, message: error.message },
      { status: 500 }
    );
  }
}

// ==================== CREATE AWARD CATEGORY ====================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const errors = validateMasterData(body);
    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: errors.join(", ") },
        { status: 400 ,headers: corsHeaders}
      );
    }

    // Check for duplicate
    const existing = await prisma.awardCategory.findUnique({
      where: { name: body.name },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Award category with this name already exists" },
        { status: 409,headers: corsHeaders }
      );
    }

    // Get max sort order
    const maxOrder = await prisma.awardCategory.aggregate({
      _max: { sortOrder: true },
    });

    const awardCategory = await prisma.awardCategory.create({
      data: {
        name: body.name,
        sortOrder: body.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
      },
    });

    const response: ApiResponse<MasterDataResponse> = {
      success: true,
      data: awardCategory as unknown as MasterDataResponse,
      message: "Award category created successfully",
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("POST /api/master-data/award-categories error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create award category" },
      { status: 500 ,headers: corsHeaders}
    );
  }
}
