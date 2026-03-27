import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateMasterData } from "@/lib/validations";
import type { ApiResponse, MasterDataResponse } from "@/types/course-category";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ================= GET =================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where: any = { isActive: true };

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    const total = await prisma.awardCategory.count({ where });

    const awardCategories = await prisma.awardCategory.findMany({
      where,
      skip,
      take: limit,
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(
      {
        status: true,
        data: awardCategories,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { headers: corsHeaders } // ✅ added
    );

  } catch (error: any) {
    console.error("AWARD CATEGORY ERROR:", error);

    return NextResponse.json(
      { status: false, message: error.message },
      { status: 500, headers: corsHeaders } // ✅ added
    );
  }
}

// ================= POST =================
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

    const existing = await prisma.awardCategory.findUnique({
      where: { name: body.name },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Award category already exists" },
        { status: 409, headers: corsHeaders }
      );
    }

    const maxOrder = await prisma.awardCategory.aggregate({
      _max: { sortOrder: true },
    });

    const awardCategory = await prisma.awardCategory.create({
      data: {
        name: body.name,
        sortOrder:
          body.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
      },
    });

    const response: ApiResponse<MasterDataResponse> = {
      success: true,
      data: awardCategory as unknown as MasterDataResponse,
      message: "Award category created successfully",
    };

    return NextResponse.json(response, {
      status: 201,
      headers: corsHeaders, // ✅ added
    });

  } catch (error) {
    console.error("POST award-categories error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to create award category" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ================= OPTIONS =================
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}