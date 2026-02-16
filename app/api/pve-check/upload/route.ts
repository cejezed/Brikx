// app/api/pve-check/upload/route.ts — Upload → Storage + DB + extract
// Auth required. Node.js runtime (pdf-parse/mammoth).
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";
import { extractDocument } from "@/lib/pveCheck/extract";

export const runtime = "nodejs";

const BUCKET = "pve-check-docs";

// DEV BYPASS — remove before production
const DEV_USER_ID = "00000000-0000-0000-0000-000000000000";

async function getAuthUserId(): Promise<
  { userId: string } | { error: NextResponse }
> {
  if (process.env.NODE_ENV === "development") {
    return { userId: DEV_USER_ID };
  }
  const auth = await requireAuth();
  if ("error" in auth) return { error: auth.error };
  return { userId: auth.user.id };
}

export async function POST(request: Request) {
  const auth = await getAuthUserId();
  if ("error" in auth) return auth.error;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Geen geldig bestand ontvangen" },
        { status: 400 },
      );
    }

    // Extract text + validate (limieten, magic bytes, scanned PDF detectie)
    const extracted = await extractDocument(file);
    const userId = auth.userId;

    // Upload to Supabase Storage
    const fileExt = file.name.includes(".")
      ? file.name.split(".").pop()
      : "bin";
    const storagePath = `${userId}/${crypto.randomUUID()}.${fileExt}`;
    const body = Buffer.from(await file.arrayBuffer());

    const upload = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(storagePath, body, {
        contentType: file.type,
        upsert: false,
      });

    if (upload.error) {
      return NextResponse.json(
        { error: `Upload naar storage mislukt: ${upload.error.message}` },
        { status: 500 },
      );
    }

    // Insert document record with doc_stats matching PveDocStats
    const docStats = {
      pageCount: extracted.pageCount,
      wordCount: extracted.wordCount,
      textHash: extracted.textHash,
    };

    const insert = await supabaseAdmin
      .from("pve_check_documents")
      .insert({
        user_id: userId,
        storage_path: storagePath,
        document_name: extracted.documentName,
        mime: extracted.mime,
        size: file.size,
        text_hash: extracted.textHash,
        doc_stats: docStats,
      })
      .select("id, document_name, text_hash, doc_stats")
      .single();

    if (insert.error || !insert.data) {
      return NextResponse.json(
        { error: `DB insert mislukt: ${insert.error?.message ?? "unknown"}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      documentId: insert.data.id,
      documentName: insert.data.document_name,
      textHash: insert.data.text_hash,
      docStats: insert.data.doc_stats,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Onverwachte fout bij upload";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
