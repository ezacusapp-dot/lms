import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateMasterData } from "@/lib/validations";
import type { ApiResponse, MasterDataResponse } from "@/types/course-category";

// ✅ CORS HEADERS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ================= OPTIONS (IMPORTANT) =================
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// ================= GET DURATION TYPES =================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
    };

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    const total = await prisma.courseDurationType.count({ where });

    const durationTypes = await prisma.courseDurationType.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        sortOrder: "asc",
      },
    });

    // ✅ ADD HEADERS HERE
    return NextResponse.json(
      {
        status: true,
        data: durationTypes,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { headers: corsHeaders }
    );

  } catch (error: any) {
    console.error("DURATION TYPE ERROR:", error);

    return NextResponse.json(
      { status: false, message: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ================= CREATE DURATION TYPE =================
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

    // ✅ Duplicate check
    const existing = await prisma.courseDurationType.findUnique({
      where: { name: body.name },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Duration type already exists" },
        { status: 409, headers: corsHeaders }
      );
    }

    // ✅ Get max sort order
    const maxOrder = await prisma.courseDurationType.aggregate({
      _max: { sortOrder: true },
    });

    const durationType = await prisma.courseDurationType.create({
      data: {
        name: body.name,
        sortOrder: body.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
      },
    });

    const response: ApiResponse<MasterDataResponse> = {
      success: true,
      data: durationType as unknown as MasterDataResponse,
      message: "Duration type created successfully",
    };

    return NextResponse.json(response, {
      status: 201,
      headers: corsHeaders,
    });

  } catch (error) {
    console.error("POST error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to create duration type" },
      { status: 500, headers: corsHeaders }
    );
  }
}