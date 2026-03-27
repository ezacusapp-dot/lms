import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateMasterData } from "@/lib/validations";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173", // allow React app
  "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ==================== UPDATE (PUT) ====================
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const body = await request.json();

    // Validation
    const errors = validateMasterData(body);
    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: errors.join(", ") },
        { status: 400, headers: corsHeaders }
      );
    }

    // Duplicate check excluding current record
    const existing = await prisma.awardCategory.findFirst({
      where: {
        name: body.name,
        NOT: { id },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Award category already exists" },
        { status: 409, headers: corsHeaders }
      );
    }

    const updated = await prisma.awardCategory.update({
      where: { id },
      data: {
        name: body.name,
        sortOrder: body.sortOrder,
      },
    });

    return NextResponse.json(
      { success: true, data: updated, message: "Updated successfully" },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ==================== DELETE (PERMANENT) ====================
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Permanent delete
    await prisma.awardCategory.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true, message: "Deleted Successfully" },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("DELETE error:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Record not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to delete" },
      { status: 500, headers: corsHeaders }
    );
  }
}