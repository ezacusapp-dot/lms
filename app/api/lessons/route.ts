import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ================= GET ALL =================
// ================= GET LESSONS =================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const moduleId = searchParams.get("moduleId") || "";
    const contentType = searchParams.get("contentType") || "";

    const skip = (page - 1) * limit;

    // ✅ WHERE (same style as courses)
    const where: any = {};

    if (search) {
      where.title = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (moduleId) {
      where.moduleId = moduleId;
    }

    if (contentType) {
      where.contentType = contentType;
    }

    // ✅ COUNT (same as courses)
    const total = await prisma.lessons.count({ where });

    // ✅ FETCH (same structure)
    const lessons = await prisma.lessons.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc", // same as courses
      },
      include: {
        module: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // ✅ RESPONSE SAME FORMAT
    return NextResponse.json({
      status: true,
      data: lessons,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error: any) {
    console.error("LESSON ERROR:", error);

    return NextResponse.json(
      { status: false, message: error.message },
      { status: 500 }
    );
  }
}

// ================= CREATE =================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { moduleId, title, contentType, fileUrl, order } = body;

    if (!moduleId || !title || !contentType) {
      return NextResponse.json(
        { success: false, error: "Required fields missing" },
        { status: 400, headers: corsHeaders }
      );
    }

    const lesson = await prisma.lessons.create({
      data: {
        moduleId,
        title,
        contentType,
        fileUrl,
        order,
      },
    });

    return NextResponse.json(
      { success: true, data: lesson },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to create lesson" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ================= OPTIONS =================
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}