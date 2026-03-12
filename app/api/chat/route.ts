import { createAgentUIStreamResponse, type UIMessage } from "ai";
import { auth } from "@/auth";
import { createShoppingAgent } from "@/lib/ai/shopping-agent";

export async function POST(request: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await request.json();

    // Get the user's session and details
    const session = await auth();
    const user = session?.user;
    const userId = user?.id;

    // Create agent with user context (orders and grooming booking tools available)
    const agent = createShoppingAgent({
      userId: userId || null,
      userEmail: user?.email || null,
      userName: user?.name || null,
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
