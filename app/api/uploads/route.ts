// app/api/uploads/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/svg+xml",
  "image/webp",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// ==================== UPLOAD FILE ====================
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type: ${file.type}. Allowed: PNG, JPG, SVG, WebP`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds 5MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
        },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const ext = path.extname(file.name);
    const baseName = path
      .basename(file.name, ext)
      .replace(/[^a-zA-Z0-9-_]/g, "");
    const uniqueName = `${baseName}-${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, uniqueName);

    // Write file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return public URL
    const publicUrl = `/uploads/${folder}/${uniqueName}`;

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        fileName: uniqueName,
        originalName: file.name,
        size: file.size,
        type: file.type,
      },
      message: "File uploaded successfully",
    });
  } catch (error) {
    console.error("POST /api/uploads error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
