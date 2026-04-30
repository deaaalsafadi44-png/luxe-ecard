import { NextRequest, NextResponse } from "next/server";

const backendOrigin =
  process.env.VOWLINK_BACKEND_ORIGIN ?? "http://127.0.0.1:5000";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const guestParam = request.nextUrl.searchParams.get("guest");

  const target = new URL(
    `${backendOrigin}/api/invitations/${encodeURIComponent(slug)}`,
  );
  if (guestParam) {
    target.searchParams.set("guest", guestParam);
  }

  let upstream: Response;
  try {
    upstream = await fetch(target.toString(), { cache: "no-store" });
  } catch {
    return NextResponse.json(
      { message: "Backend unreachable. Is vowlink-backend running on port 5000?" },
      { status: 502 },
    );
  }

  const body = await upstream.text();
  return new NextResponse(body, {
    status: upstream.status,
    headers: {
      "Content-Type":
        upstream.headers.get("Content-Type") ?? "application/json",
    },
  });
}
