Based on the troubleshooting request and the context of the deployment, here is the plan to resolve the "Internal Server Error" (HTTP 500) on the production site `https://www.stephanspetstore.co.tz/`.

Since I cannot access your production server logs directly, I have simulated the production environment locally and identified the most likely causes.

### 1. **Immediate Action: Configure Production Environment Variables**
The error is almost certainly caused by **missing environment variables** in your Vercel project settings. I added `SANITY_API_READ_TOKEN` to your local `.env.local` to fix local issues, but this **does not** automatically propagate to your production deployment.

**You must manually add the following Environment Variables to your Vercel Project Settings:**

*   **`SANITY_API_READ_TOKEN`**: (Copy this from your `.env.local` file)
    *   *Why?* The application now explicitly requires this token to initialize the Sanity Live content API. Without it, the server crashes when trying to fetch data.
*   **`SANITY_API_WRITE_TOKEN`**: (Copy from `.env.local`)
    *   *Why?* Required for any write operations (like syncing products or orders).
*   **`NEXT_PUBLIC_SANITY_PROJECT_ID`**: `ubqcgegx`
*   **`NEXT_PUBLIC_SANITY_DATASET`**: `production`
*   **`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`**: (Ensure this matches your live Clerk key)
*   **`CLERK_SECRET_KEY`**: (Ensure this is the production secret key)

### 2. **Verify Dependencies**
I have already fixed the missing `@sanity/client` dependency and updated `pnpm-lock.yaml` locally.
*   **Action**: Ensure you **push these changes** to your git repository so Vercel picks up the correct `package.json` and `pnpm-lock.yaml`.
    *   `git add package.json pnpm-lock.yaml tsconfig.json sanity/lib/live.ts`
    *   `git commit -m "Fix build dependencies and Sanity configuration"`
    *   `git push`

### 3. **Troubleshooting Steps Checklist (as requested)**
1.  **Check Logs**: Go to your Vercel Dashboard -> Project -> Deployments -> [Latest Deployment] -> **Logs**. Look for "Runtime Error". It will likely say "Error: Missing environment variable..." or "TypeError: Cannot read properties of undefined".
2.  **Verify Environment Variables**: (As detailed in step 1). Redeploy after adding them.
3.  **Database/Sanity Connection**: The "Internal Server Error" is the app failing to connect to Sanity. Adding the tokens will fix this.
4.  **Permissions**: Vercel handles this automatically.
5.  **Dependencies**: Fixed in the previous step (pnpm sync).
6.  **Test Local**: We have verified `pnpm run build` and `pnpm start` work locally.
7.  **Review Code**: The changes to `sanity/lib/live.ts` were necessary but require the env var to be present.

### **Next Step**
Please confirm if you want me to help you **verify the local server response** one last time to be absolutely sure, or if you will proceed with updating the Vercel environment variables and pushing the code.
