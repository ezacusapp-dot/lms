import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateMasterData } from "@/lib/validations";
import type { ApiResponse, MasterDataResponse } from "@/types/course-category";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ==================== GET ALL ====================
// ================= GET VALIDITY PERIODS =================
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
    const total = await prisma.validityPeriod.count({ where });

    // ✅ FETCH
    const data = await prisma.validityPeriod.findMany({
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
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error: any) {
    console.error("VALIDITY PERIOD ERROR:", error);

    return NextResponse.json(
      { status: false, message: error.message },
      { status: 500 }
    );
  }
}

// ==================== CREATE ====================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const errors = validateMasterData(body);
    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: errors.join(", ") },
        { status: 400, headers: corsHeaders }
      );
    }

    // Duplicate check
    const existing = await prisma.validityPeriod.findUnique({
      where: { name: body.name },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Validity period already exists" },
        { status: 409, headers: corsHeaders }
      );
    }

    // Sort order logic
    const maxOrder = await prisma.validityPeriod.aggregate({
      _max: { sortOrder: true },
    });

    const newItem = await prisma.validityPeriod.create({
      data: {
        name: body.name,
        sortOrder:
          body.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
      },
    });

    const response: ApiResponse<MasterDataResponse> = {
      success: true,
      data: newItem as unknown as MasterDataResponse,
      message: "Validity period created successfully",
    };

    return NextResponse.json(response, {
      status: 201,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("POST validity-periods error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create validity period" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ==================== OPTIONS (CORS FIX) ====================
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}