/**
 * This configuration file lets you run `$ sanity [command]` in this folder
 * Go to https://www.sanity.io/docs/cli to learn more.
 **/
import { defineCliConfig } from "sanity/cli";
import dotenv from "dotenv";

// Load .env for Sanity CLI
dotenv.config({ path: ".env" });
// Load .env.local for Sanity CLI overrides
dotenv.config({ path: ".env.local" });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const organizationId = process.env.NEXT_PUBLIC_SANITY_ORG_ID;

if (!organizationId || !projectId || !dataset) {
  throw new Error(
    "NEXT_PUBLIC_SANITY_ORG_ID, NEXT_PUBLIC_SANITY_PROJECT_ID, or NEXT_PUBLIC_SANITY_DATASET is not set"
  );
}

export default defineCliConfig({
  app: {
    organizationId,
    entry: "./app/(admin)/admin/page.tsx",
  },
  api: { projectId, dataset },
});
