// app/api/projects/[projectId]/moodboard/upload/route.ts
// ✅ v3.13: Moodboard image upload API endpoint
// Uploads gecomprimeerde afbeeldingen naar Supabase Storage
// ✅ v3.13.1: Added authentication & authorization checks

import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";

const BUCKET_NAME = "project-moodboard";
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB (al gecomprimeerd client-side)
const MAX_IMAGES_PER_PROJECT = 10;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface UploadResponse {
  success: boolean;
  url?: string;
  signedUrl?: string;
  error?: string;
}

/**
 * Verify that the user is authenticated and owns the project
 */
async function verifyProjectOwnership(projectId: string): Promise<{
  authorized: boolean;
  userId?: string;
  error?: string;
}> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createRouteHandlerClient<any>({ cookies });

    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return { authorized: false, error: "Niet ingelogd" };
    }

    const userId = session.user.id;

    // Check if project belongs to user (wizard_drafts table)
    const { data: draft, error: draftError } = await supabase
      .from("wizard_drafts")
      .select("id, user_id")
      .eq("id", projectId)
      .single();

    if (draftError || !draft) {
      return { authorized: false, error: "Project niet gevonden" };
    }

    if (draft.user_id !== userId) {
      return { authorized: false, error: "Geen toegang tot dit project" };
    }

    return { authorized: true, userId };
  } catch (error) {
    console.error("[Moodboard] Auth error:", error);
    return { authorized: false, error: "Authenticatie fout" };
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
): Promise<NextResponse<UploadResponse>> {
  try {
    const { projectId } = await params;

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: "Project ID is verplicht" },
        { status: 400 }
      );
    }

    // ✅ Verify authentication and project ownership
    const auth = await verifyProjectOwnership(projectId);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || "Niet geautoriseerd" },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Geen bestand ontvangen" },
        { status: 400 }
      );
    }

    // Valideer file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Alleen JPG, PNG en WebP zijn toegestaan" },
        { status: 400 }
      );
    }

    // Valideer file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "Bestand is te groot (max 2MB)" },
        { status: 400 }
      );
    }

    // Check bestaand aantal afbeeldingen voor dit project
    const { data: existingFiles, error: listError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .list(projectId);

    if (listError) {
      console.error("[Moodboard Upload] Error listing files:", listError);
      // Ga door, bucket bestaat mogelijk nog niet voor dit project
    }

    if (existingFiles && existingFiles.length >= MAX_IMAGES_PER_PROJECT) {
      return NextResponse.json(
        { success: false, error: `Maximum ${MAX_IMAGES_PER_PROJECT} afbeeldingen per project` },
        { status: 400 }
      );
    }

    // Genereer unieke bestandsnaam
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const uuid = crypto.randomUUID();
    const fileName = `${uuid}.${ext}`;
    const filePath = `${projectId}/${fileName}`;

    // Converteer File naar ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload naar Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("[Moodboard Upload] Upload error:", uploadError);
      return NextResponse.json(
        { success: false, error: "Upload mislukt: " + uploadError.message },
        { status: 500 }
      );
    }

    // Genereer signed URL voor toegang (1 uur geldig)
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, 3600); // 1 hour

    if (signedUrlError) {
      console.error("[Moodboard Upload] Signed URL error:", signedUrlError);
      // Upload was succesvol, return path anyway
      return NextResponse.json({
        success: true,
        url: uploadData.path,
      });
    }

    return NextResponse.json({
      success: true,
      url: uploadData.path,
      signedUrl: signedUrlData.signedUrl,
    });
  } catch (error) {
    console.error("[Moodboard Upload] Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Er is een onverwachte fout opgetreden" },
      { status: 500 }
    );
  }
}

// GET: Haal alle moodboard afbeeldingen voor een project op
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
): Promise<NextResponse> {
  try {
    const { projectId } = await params;

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: "Project ID is verplicht" },
        { status: 400 }
      );
    }

    // ✅ Verify authentication and project ownership
    const auth = await verifyProjectOwnership(projectId);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || "Niet geautoriseerd" },
        { status: 401 }
      );
    }

    // List files in project folder
    const { data: files, error: listError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .list(projectId);

    if (listError) {
      console.error("[Moodboard GET] List error:", listError);
      return NextResponse.json(
        { success: false, error: "Kon afbeeldingen niet ophalen" },
        { status: 500 }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json({
        success: true,
        images: [],
      });
    }

    // Genereer signed URLs voor alle afbeeldingen
    const images = await Promise.all(
      files.map(async (file) => {
        const filePath = `${projectId}/${file.name}`;
        const { data: signedUrlData } = await supabaseAdmin.storage
          .from(BUCKET_NAME)
          .createSignedUrl(filePath, 3600);

        return {
          name: file.name,
          path: filePath,
          signedUrl: signedUrlData?.signedUrl || null,
          createdAt: file.created_at,
        };
      })
    );

    return NextResponse.json({
      success: true,
      images,
    });
  } catch (error) {
    console.error("[Moodboard GET] Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Er is een onverwachte fout opgetreden" },
      { status: 500 }
    );
  }
}

// DELETE: Verwijder een moodboard afbeelding
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
): Promise<NextResponse> {
  try {
    const { projectId } = await params;
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get("fileName");

    if (!projectId || !fileName) {
      return NextResponse.json(
        { success: false, error: "Project ID en bestandsnaam zijn verplicht" },
        { status: 400 }
      );
    }

    // ✅ Verify authentication and project ownership
    const auth = await verifyProjectOwnership(projectId);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || "Niet geautoriseerd" },
        { status: 401 }
      );
    }

    const filePath = `${projectId}/${fileName}`;

    const { error: deleteError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (deleteError) {
      console.error("[Moodboard DELETE] Delete error:", deleteError);
      return NextResponse.json(
        { success: false, error: "Kon afbeelding niet verwijderen" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Moodboard DELETE] Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Er is een onverwachte fout opgetreden" },
      { status: 500 }
    );
  }
}
