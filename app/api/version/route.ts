import { NextResponse } from "next/server";
import pkg from "../../../package.json";

export async function GET() {
  const version = (pkg as any).version ?? "unknown";
  const name = (pkg as any).name ?? "unknown";
  const commit = process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.COMMIT_SHA ?? "unknown";
  const buildId = process.env.NEXT_BUILD_ID ?? "unknown";
  const vercelEnv = process.env.VERCEL_ENV ?? "unknown";
  const vercelUrl = process.env.VERCEL_URL ?? "unknown";
  const timestamp = new Date().toISOString();

  return NextResponse.json({
    app: name,
    version,
    commit,
    buildId,
    vercelEnv,
    vercelUrl,
    timestamp,
  });
}
