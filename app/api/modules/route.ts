import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ CORS HEADERS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ✅ Common Response Helper
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

// ================= COMMON VALIDATION =================
function validateModuleInput(body: any) {
  const { courseId, title, order } = body;

  if (!courseId || typeof courseId !== "string") {
    return "Course is required";
  }

  if (!title || typeof title !== "string") {
    return "Title is required";
  }

  if (order === undefined || typeof order !== "number") {
    return "Order must be a number";
  }

  return null;
}

// ================= CREATE MODULE =================
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Validation
    const validationError = validateModuleInput(body);
    if (validationError) {
      return jsonResponse(
        { status: false, message: validationError },
        400
      );
    }

    const { courseId, title, order, description } = body;

    // ✅ Check course exists
    const course = await prisma.courses.findUnique({
      where: { id: courseId },
      select: { id: true },
    });

    if (!course) {
      return jsonResponse(
        { status: false, message: "Invalid courseId" },
        400
      );
    }

    // ✅ Create module
    const module = await prisma.modules.create({
      data: {
        courseId,
        title: title.trim(),
        order,
        description: description?.trim() || null,
      },
    });

    return jsonResponse({
      status: true,
      message: "Module created successfully",
      data: module,
    });

  } catch (error: any) {
    console.error(error);

    // ✅ Prisma unique constraint error
    if (error.code === "P2002") {
      return jsonResponse(
        { status: false, message: "Order already exists for this course" },
        409
      );
    }

    return jsonResponse(
      { status: false, message: "Internal Server Error" },
      500
    );
  }
}

// ================= GET MODULE LIST =================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "10"), 1),
      100
    );

    const courseId = searchParams.get("courseId") || undefined;
    const search = searchParams.get("search") || undefined;

    const skip = (page - 1) * limit;

    const where: {
      courseId?: string;
      title?: {
        contains: string;
        mode: "insensitive";
      };
    } = {};

    if (courseId) where.courseId = courseId;

    if (search) {
      where.title = {
        contains: search,
        mode: "insensitive",
      };
    }

    // ✅ Parallel queries
    const [total, modules] = await Promise.all([
      prisma.modules.count({ where }),
      prisma.modules.findMany({
        where,
        skip,
        take: limit,
        orderBy: { order: "asc" },
        include: {
          courses: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
    ]);

    return jsonResponse({
      status: true,
      message: "Module list fetched successfully",
      data: modules,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error(error);

    return jsonResponse(
      { status: false, message: "Internal Server Error" },
      500
    );
  }
}