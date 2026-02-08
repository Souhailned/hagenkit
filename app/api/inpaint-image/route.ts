import { NextResponse } from "next/server";
import { triggerInpaintTask, type EditMode } from "@/app/actions/images";

export async function POST(request: Request) {
  try {
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
