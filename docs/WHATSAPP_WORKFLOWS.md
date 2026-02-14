# WhatsApp Integration Workflows

This document outlines the workflows for the new WhatsApp Integration system, including Payments and Verification.

## 1. Overview
The system uses **UltraMsg** as a gateway to send and receive WhatsApp messages. It acts as a middleware between the Next.js Frontend and the Odoo Backend.

**Key Features:**
-   **Payment Links:** Send secure payment URLs via WhatsApp.
-   **Verification:** Confirm appointments or high-value orders via simple replies ("VERIFY").
-   **Automated Status:** Customers can check status by replying "STATUS".

## 2. Workflows

### A. Payment Workflow
**Trigger:** Order Created in Next.js / Odoo.

1.  **System Action:** Calls `sendPaymentLinkToWhatsApp(phone, orderId, amount, name)`.
2.  **Customer Experience:**
    -   Receives WhatsApp: "Hello [Name], Order #[ID] confirmed. Pay here: [Link]"
    -   Clicks link -> Redirects to Secure Checkout Page.
3.  **Completion:**
    -   Payment Success Webhook triggers `sendPaymentReceipt()`.
    -   Customer receives: "✅ Payment Received!"

### B. Verification Workflow
**Trigger:** High-value Order (>500k TZS) or Grooming Appointment Booking.

1.  **System Action:** Calls `requestVerification(refId, phone, type, details)`.
2.  **Customer Experience:**
    -   Receives: "🔒 Verification Request for [Details]. Reply VERIFY to confirm."
3.  **Customer Action:** Replies "VERIFY" or "YES".
4.  **System Response:**
    -   Webhook (`api/whatsapp/webhook`) receives message.
    -   Calls `handleVerificationReply(phone)`.
    -   Updates Odoo status (e.g., `appointment.state = 'confirmed'`).
    -   Replies: "✅ Verification Successful!"

### C. Help & Status
**Trigger:** Customer replies "HELP" or "MENU".

1.  **System Action:** Sends a list of available commands:
    -   *VERIFY*: Confirm pending actions.
    -   *STATUS*: Check order status.
    -   *PAY*: Get payment link.

## 3. Configuration
Ensure the following Environment Variables are set in `.env`:

```env
ULTRAMSG_TOKEN=your_token
ULTRAMSG_INSTANCE_ID=your_instance_id
ULTRAMSG_API_URL=https://api.ultramsg.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 4. Troubleshooting
-   **Message Not Sent:** Check `ULTRAMSG_TOKEN` and ensure phone number format is International (e.g., +255...).
-   **Webhook Not Triggering:** Ensure UltraMsg dashboard has the correct Webhook URL: `https://your-domain.com/api/whatsapp/webhook`.
