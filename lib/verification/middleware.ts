import { sendWhatsAppMessage } from "@/lib/whatsapp";
// In a real scenario, import the Odoo client to perform write operations
// import { odooClient } from "@/lib/odoo/client";

export type VerificationType = "appointment" | "large_order" | "account_creation";

interface VerificationRequest {
  id: string; // Unique ID for this verification attempt
  referenceId: string; // Odoo ID (Order ID, Appointment ID)
  type: VerificationType;
  phoneNumber: string;
  status: "pending" | "verified" | "expired";
  createdAt: Date;
}

// In-memory store for demo purposes (Replace with Database/Redis/Odoo Model)
const verificationStore: Map<string, VerificationRequest> = new Map();

/**
 * Initiates a verification request via WhatsApp
 */
export async function requestVerification(
  referenceId: string,
  phoneNumber: string,
  type: VerificationType,
  details: string
) {
  const verificationId = Math.random().toString(36).substring(7);
  
  const request: VerificationRequest = {
    id: verificationId,
    referenceId,
    type,
    phoneNumber,
    status: "pending",
    createdAt: new Date(),
  };

  // Save to store (or DB)
  verificationStore.set(phoneNumber, request); // Keying by phone for easy lookup in webhook

  const message = `
🔒 *Verification Request*

Ref: ${referenceId}
Details: ${details}

Please reply with *VERIFY* to confirm this action.
  `.trim();

  await sendWhatsAppMessage(phoneNumber, message);
  return verificationId;
}

/**
 * Handles the verification confirmation (called by Webhook)
 */
export async function handleVerificationReply(phoneNumber: string): Promise<boolean> {
  const request = verificationStore.get(phoneNumber);

  if (!request || request.status !== "pending") {
    return false; // No pending request found
  }

  // 1. Update Local Status
  request.status = "verified";
  verificationStore.set(phoneNumber, request);

  // 2. Update Odoo (Mock Logic)
  console.log(`[Middleware] Updating Odoo for Ref ${request.referenceId} -> Verified`);
  // await odooClient.updateStatus(request.referenceId, 'verified');

  // 3. Notify Admin (Optional)
  // await sendWhatsAppMessage(ADMIN_PHONE, `Verified: ${request.referenceId}`);

  return true;
}
