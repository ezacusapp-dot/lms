import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ================= UPDATE MODULE =================
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const moduleId = params.id;
    const body = await req.json();

    const { courseId, title, order, description } = body;

    // ✅ Check module exists
    const existingModule = await prisma.modules.findUnique({
      where: { id: moduleId },
    });

    if (!existingModule) {
      return NextResponse.json(
        { status: false, message: "Module not found" },
        { status: 404 }
      );
    }

    // ✅ Convert order
    let orderNumber: number | undefined = undefined;
    if (order !== undefined) {
      orderNumber = Number(order);

      if (isNaN(orderNumber)) {
        return NextResponse.json(
          { status: false, message: "Order must be number" },
          { status: 400 }
        );
      }
    }

    // ✅ If courseId बदलतोय तर validate कर
    if (courseId) {
      const course = await prisma.courses.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        return NextResponse.json(
          { status: false, message: "Invalid courseId" },
          { status: 400 }
        );
      }
    }

    // ✅ Duplicate order check (exclude current module)
    if (orderNumber !== undefined) {
      const duplicate = await prisma.modules.findFirst({
        where: {
          courseId: courseId || existingModule.courseId,
          order: orderNumber,
          NOT: {
            id: moduleId,
          },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { status: false, message: "Order already exists" },
          { status: 409 }
        );
      }
    }

    // ✅ UPDATE
    const updatedModule = await prisma.modules.update({
      where: { id: moduleId },
      data: {
        title: title ?? existingModule.title,
        description:
          description !== undefined
            ? description
            : existingModule.description,
        order: orderNumber ?? existingModule.order,

        // ✅ relation update
        ...(courseId && {
          courses: {
            connect: { id: courseId },
          },
        }),
      },
    });

    return NextResponse.json({
      status: true,
      message: "Module updated successfully",
      data: updatedModule,
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      {
        status: false,
        message: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}


// ================= DELETE MODULE =================
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const moduleId = params.id;

    // ✅ Check exists
    const module = await prisma.modules.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      return NextResponse.json(
        { status: false, message: "Module not found" },
        { status: 404 }
      );
    }

    // ✅ DELETE
    await prisma.modules.delete({
      where: { id: moduleId },
    });

    return NextResponse.json({
      status: true,
      message: "Module deleted successfully",
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      {
        status: false,
        message: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}