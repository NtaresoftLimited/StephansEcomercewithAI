import { createAgentUIStreamResponse, type UIMessage } from "ai";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createShoppingAgent } from "@/lib/ai/shopping-agent";

export async function POST(request: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await request.json();

    // Get the user's session and details
    const { userId } = await auth();
    const user = userId ? await currentUser() : null;

    // Create agent with user context (orders and grooming booking tools available)
    const agent = createShoppingAgent({
      userId,
      userEmail: user?.emailAddresses?.[0]?.emailAddress || null,
      userName: user?.fullName || user?.firstName || null,
    });

    return createAgentUIStreamResponse({
      agent,
      messages,
    });
  } catch (error) {
    console.error("Error in chat route:", error);
    return new Response(JSON.stringify({ error: "Failed to process chat request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
