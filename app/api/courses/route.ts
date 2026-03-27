import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ CORS HEADERS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ✅ Common JSON response helper
function jsonResponse(data: any, status: number = 200) {
  return NextResponse.json(data, {
    status,
    headers: corsHeaders,
  });
}

// ================= OPTIONS (CORS PREFLIGHT) =================
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// ================= CREATE COURSE =================
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      title,
      categoryId,
      levelId,
      duration,
      description,
      createdBy,
    } = body;

    if (!title) {
      return jsonResponse(
        { status: false, message: "Title is required" },
        400
      );
    }

    // ✅ Duplicate check
    const existing = await prisma.courses.findFirst({
      where: { title },
    });

    if (existing) {
      return jsonResponse(
        { status: false, message: "Course already exists" },
        409
      );
    }

    // ✅ Create course
    const course = await prisma.courses.create({
      data: {
        title,
        duration,
        description,
        createdBy,

        ...(categoryId && {
          CourseCategory: {
            connect: { id: categoryId },
          },
        }),

        ...(levelId && {
          CourseLevel: {
            connect: { id: levelId },
          },
        }),
      },
    });

    return jsonResponse({
      status: true,
      message: "Course created successfully",
      data: course,
    });

  } catch (error: any) {
    console.error(error);
    return jsonResponse(
      { status: false, message: error.message },
      500
    );
  }
}

// ================= GET COURSES =================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const levelId = searchParams.get("levelId") || "";

    const skip = (page - 1) * limit;

    const where: any = {};

    // 🔍 Search filter
    if (search) {
      where.title = {
        contains: search,
        mode: "insensitive",
      };
    }

    // 🎯 Filters
    if (categoryId) where.categoryId = categoryId;
    if (levelId) where.levelId = levelId;

    // 📊 Count
    const total = await prisma.courses.count({ where });

    // 📦 Fetch data
    const courses = await prisma.courses.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        CourseCategory: {
          select: { id: true, name: true },
        },
        CourseLevel: {
          select: { id: true, name: true },
        },
        Modules: {
          orderBy: { order: "asc" },
        },
      },
    });

    return jsonResponse({
      status: true,
      data: courses,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error: any) {
    console.error(error);
    return jsonResponse(
      { status: false, message: error.message },
      500
    );
  }
}