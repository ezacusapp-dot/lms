// app/api/master-data/levels/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateMasterData } from "@/lib/validations";
import type { ApiResponse, MasterDataResponse } from "@/types/course-category";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // 🔥 allow React app
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};


// ==================== GET ALL COURSE LEVELS ====================
// ================= GET COURSE LEVELS =================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // ✅ WHERE (clean pattern)
    const where: any = {
      isActive: true,
    };

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    // ✅ COUNT
    const total = await prisma.courseLevel.count({ where });

    // ✅ FETCH
    const levels = await prisma.courseLevel.findMany({
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
      data: levels,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error: any) {
    console.error("COURSE LEVEL ERROR:", error);

    return NextResponse.json(
      { status: false, message: error.message },
      { status: 500 }
    );
  }
}

// ==================== CREATE COURSE LEVEL ====================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const errors = validateMasterData(body);
    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: errors.join(", ") },
        { status: 400,headers: corsHeaders }
      );
    }

    // Check for duplicate
    const existing = await prisma.courseLevel.findUnique({
      where: { name: body.name },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Course level with this name already exists" },
        { status: 409,headers: corsHeaders }
      );
    }

    // Get max sort order
    const maxOrder = await prisma.courseLevel.aggregate({
      _max: { sortOrder: true },
    });

    const level = await prisma.courseLevel.create({
      data: {
        name: body.name,
        sortOrder: body.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
      },
    });

    const response: ApiResponse<MasterDataResponse> = {
      success: true,
      data: level as unknown as MasterDataResponse,
      message: "Course level created successfully",
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("POST /api/master-data/levels error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create course level" },
      { status: 500,headers: corsHeaders }
    );
  }
}
