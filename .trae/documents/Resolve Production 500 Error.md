Based on the troubleshooting steps performed, the "Internal Server Error" (HTTP 500) on your production site is caused by **missing environment variables** in your Vercel deployment.

I have verified that the application **works correctly locally** (returns HTTP 200 OK) after I added the `SANITY_API_READ_TOKEN` to your local configuration. This confirms the code is healthy, but the production server lacks the necessary credentials to fetch data from Sanity.

### **Required Action: Update Vercel Environment Variables**

You must manually add the following environment variables to your Vercel Project Settings (Settings -> Environment Variables).

**Copy these values from your local `.env.local` file:**

1.  **`SANITY_API_READ_TOKEN`**
    *   *Critical:* This is the missing piece causing the 500 error. The app crashes because it cannot authenticate with Sanity to fetch live content.
2.  **`SANITY_API_WRITE_TOKEN`**
    *   *Required:* For write operations (syncing products, etc.).
3.  **`NEXT_PUBLIC_SANITY_PROJECT_ID`**: `ubqcgegx`
4.  **`NEXT_PUBLIC_SANITY_DATASET`**: `production`
5.  **`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`** & **`CLERK_SECRET_KEY`**
    *   Ensure these match your production Clerk keys.

### **Secondary Action: Push Dependency Fixes**
I have fixed a missing dependency (`@sanity/client`) and updated `pnpm-lock.yaml` locally. You need to push these changes to your git repository so Vercel can rebuild the project correctly.

**Run these commands in your terminal:**
```bash
git add package.json pnpm-lock.yaml tsconfig.json sanity/lib/live.ts
git commit -m "Fix build dependencies and Sanity configuration"
git push
```

### **Summary of Resolution**
1.  **Identified Cause**: Missing `SANITY_API_READ_TOKEN` in production and missing `@sanity/client` dependency.
2.  **Verified Fix**: Local build and server are now working perfectly (HTTP 200).
3.  **Next Step**: Update Vercel Env Vars and `git push` to deploy the fix.
