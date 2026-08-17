/**
 * WasenderAPI Client
 * Handles sending messages via WhatsApp
 */

const WASENDER_API_URL = "https://wasenderapi.com/api";
const WASENDER_API_KEY = process.env.WASENDER_API_KEY || "";

export class WasenderClient {
  private headers: HeadersInit;

  constructor() {
    this.headers = {
      "Authorization": `Bearer ${WASENDER_API_KEY}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Sends a plain text message to a WhatsApp number.
   * @param to Phone number with country code (e.g., '212612345678')
   * @param text The message text
   */
  async sendMessage(to: string, text: string) {
    if (!WASENDER_API_KEY) {
      console.warn("⚠️ WASENDER_API_KEY is not set. Skipping message send.");
      return null;
    }

    try {
      const response = await fetch(`${WASENDER_API_URL}/send-message`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({
          to,
          text
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("❌ WasenderAPI Error:", response.status, errorData);
        throw new Error(`WasenderAPI HTTP ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error("❌ Failed to send WhatsApp message:", err);
      throw err;
    }
  }

  /**
   * Sends an image message to a WhatsApp number.
   * @param to Phone number with country code
   * @param imageUrl Publicly accessible URL of the image
   * @param caption Optional caption for the image
   */
  async sendImageMessage(to: string, imageUrl: string, caption?: string) {
    if (!WASENDER_API_KEY) {
      console.warn("⚠️ WASENDER_API_KEY is not set. Skipping message send.");
      return null;
    }

    try {
      const response = await fetch(`${WASENDER_API_URL}/send-message`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({
          to,
          image: imageUrl,
          caption: caption || ""
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("❌ WasenderAPI Error:", response.status, errorData);
        throw new Error(`WasenderAPI HTTP ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error("❌ Failed to send WhatsApp image message:", err);
      throw err;
    }
  }
}

export const wasenderClient = new WasenderClient();
