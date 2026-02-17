import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { triggerInpaintTask, type EditMode } from "@/app/actions/images";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit
    const identifier = session.user.id;
    const rateLimitResult = await checkRateLimit(identifier, "ai");
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const body = (await request.json()) as {
      imageId?: string;
      prompt?: string;
      mode?: EditMode;
      maskDataUrl?: string;
    };

    if (!body.imageId || !body.prompt) {
      return NextResponse.json(
        { error: "Missing required fields: imageId, prompt" },
        { status: 400 }
      );
    }

    const mode = body.mode || "add";
    const result = await triggerInpaintTask(
      body.imageId,
      body.prompt,
      mode,
      body.maskDataUrl
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      ...result.data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to trigger image edit",
      },
      { status: 500 }
    );
  }
}
