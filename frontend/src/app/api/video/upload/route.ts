import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const inputType = formData.get("input_type") as string | null;
    const inputContent = formData.get("input_content") as string | null;
    const title = formData.get("title") as string | null;
    const sourceUrl = formData.get("source_url") as string | null;
    const videoMetadata = formData.get("video_metadata") as string | null;

    if (!file) {
      return NextResponse.json({ detail: "No file provided" }, { status: 400 });
    }

    const backendForm = new FormData();
    backendForm.append("file", file);
    if (inputType) backendForm.append("input_type", inputType);
    if (inputContent) backendForm.append("input_content", inputContent);
    if (title) backendForm.append("title", title);
    if (sourceUrl) backendForm.append("source_url", sourceUrl);
    if (videoMetadata) backendForm.append("video_metadata", videoMetadata);

    const forwardedHeaders: Record<string, string> = {};
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      forwardedHeaders["Authorization"] = authHeader;
    } else {
      const cookies = request.cookies;
      const accessToken = cookies.get("sb-access-token") || cookies.get("access_token") || cookies.get("token");
      if (accessToken) {
        forwardedHeaders["Authorization"] = `Bearer ${accessToken.value}`;
      }
    }

    const response = await fetch(`${API_BASE_URL}/video/upload`, {
      method: "POST",
      body: backendForm as unknown as FormData,
      headers: forwardedHeaders,
    });

    const text = await response.text();
    console.log("[VideoUploadProxy] status:", response.status, "body:", text);
    const payload = text ? JSON.parse(text) : { detail: "Invalid backend response" };
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    return NextResponse.json({ detail: error instanceof Error ? error.message : "Upload failed" }, { status: 500 });
  }
}