import { NextResponse } from "next/server";
import pkg from "../../../package.json";

export async function GET() {
  const version = (pkg as any).version ?? "unknown";
  const name = (pkg as any).name ?? "unknown";
  const commit =
    process.env.CF_PAGES_COMMIT_SHA ??
    process.env.COMMIT_SHA ??
    process.env.VERCEL_GIT_COMMIT_SHA ??
    "unknown";
  const buildId = process.env.NEXT_BUILD_ID ?? "unknown";
  const environment =
    process.env.CF_PAGES_BRANCH ??
    process.env.NODE_ENV ??
    process.env.VERCEL_ENV ??
    "unknown";
  const deploymentUrl =
    process.env.CF_PAGES_URL ??
    process.env.VERCEL_URL ??
    "unknown";
  const timestamp = new Date().toISOString();

  return NextResponse.json({
    app: name,
    version,
    commit,
    buildId,
    environment,
    deploymentUrl,
    timestamp,
  });
}
