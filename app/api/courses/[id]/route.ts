import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ================= UPDATE COURSE =================
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id;
    const body = await req.json();

    const {
      title,
      categoryId,
      levelId,
      duration,
      description,
      createdBy,
    } = body;

    // ✅ Check course exists
    const existingCourse = await prisma.courses.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      return NextResponse.json(
        { status: false, message: "Course not found" },
        { status: 404 }
      );
    }

    // ✅ Validation
    if (!title) {
      return NextResponse.json(
        { status: false, message: "Title is required" },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { status: false, message: "Category is required" },
        { status: 400 }
      );
    }

    if (!levelId) {
      return NextResponse.json(
        { status: false, message: "Level is required" },
        { status: 400 }
      );
    }

    if (!duration) {
      return NextResponse.json(
        { status: false, message: "Duration is required" },
        { status: 400 }
      );
    }

    // ✅ Optional FK check (recommended)
    const categoryExists = await prisma.courseCategory.findUnique({
      where: { id: categoryId },
    });

    if (!categoryExists) {
      return NextResponse.json(
        { status: false, message: "Invalid categoryId" },
        { status: 400 }
      );
    }

    const levelExists = await prisma.courseLevel.findUnique({
      where: { id: levelId },
    });

    if (!levelExists) {
      return NextResponse.json(
        { status: false, message: "Invalid levelId" },
        { status: 400 }
      );
    }

    // ✅ Update
    const updatedCourse = await prisma.courses.update({
      where: { id: courseId },
      data: {
        title,
        categoryId,
        levelId,
        duration,
        description,
        createdBy,
      },
    });

    return NextResponse.json({
      status: true,
      message: "Course Updated Successfully",
      data: updatedCourse,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}


// ================= DELETE COURSE =================
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id;

    // ✅ Check exists
    const existingCourse = await prisma.courses.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      return NextResponse.json(
        { status: false, message: "Course Not Found" },
        { status: 404 }
      );
    }

    // ✅ Delete
    await prisma.courses.delete({
      where: { id: courseId },
    });

    return NextResponse.json({
      status: true,
      message: "Course Deleted successfully",
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}