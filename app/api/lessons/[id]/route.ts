import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ================= GET SINGLE =================
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lesson = await prisma.lessons.findUnique({
      where: { id: params.id },
    });

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: "Lesson not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: lesson },
      { headers: corsHeaders }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch lesson" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ================= UPDATE =================
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const updated = await prisma.lessons.update({
      where: { id: params.id },
      data: {
        moduleId: body.moduleId,
        title: body.title,
        contentType: body.contentType,
        fileUrl: body.fileUrl,
        order: body.order,
      },
    });

    return NextResponse.json(
      { success: true, data: updated },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to update" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ================= DELETE =================
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.lessons.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { success: true, message: "Deleted successfully" },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to delete" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ================= OPTIONS =================
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}