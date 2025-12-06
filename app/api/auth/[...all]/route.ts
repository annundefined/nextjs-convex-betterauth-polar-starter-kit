import { nextJsHandler } from "@convex-dev/better-auth/nextjs";
import { NextRequest, NextResponse } from "next/server";

const handler = nextJsHandler();

export const { GET } = handler;

// Wrap POST to gracefully handle sign-out after account deletion
export async function POST(request: NextRequest) {
  const response = await handler.POST(request);
  
  // If sign-out fails with 400 (session already deleted), return success anyway
  // This handles the edge case where account deletion removes session before sign-out
  if (response.status === 400 && request.nextUrl.pathname.endsWith("/sign-out")) {
    return NextResponse.json({ success: true }, { status: 200 });
  }
  
  return response;
}
