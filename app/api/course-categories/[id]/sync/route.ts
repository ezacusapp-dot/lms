// app/api/course-categories/[id]/sync/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ==================== SYNC CATEGORY TO ALL PLATFORMS ====================
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const category = await prisma.courseCategory.findUnique({
      where: { id },
      include: {
        level: true,
        durationType: true,
        certificateTemplate: {
          include: { awardCategory: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // Simulate syncing to multiple platforms
    const syncTargets = [
      "Super Admin Panel",
      "School Admin Panels",
      "Student Dashboards",
      "Public Website",
      "Certificate Engine",
      "Course Builder",
      "Analytics Dashboard",
      "Master Data",
    ];

    const syncResults = await Promise.all(
      syncTargets.map(async (target) => {
        // Simulate API call to each platform
        await new Promise((resolve) =>
          setTimeout(resolve, Math.random() * 200 + 100)
        );
        return {
          target,
          status: "synced" as const,
          syncedAt: new Date().toISOString(),
        };
      })
    );

    // Mark category as synced in database
    await prisma.courseCategory.update({
      where: { id },
      data: {
        synced: true,
        syncedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        categoryId: id,
        syncResults,
      },
      message: `Category synced to ${syncTargets.length} platforms`,
    });
  } catch (error) {
    console.error("POST /api/course-categories/[id]/sync error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sync category" },
      { status: 500 }
    );
  }
}
