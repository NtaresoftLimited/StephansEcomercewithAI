# System Architecture: Odoo - Next.js - WhatsApp

## 1. High-Level Architecture

```mermaid
graph TD
    User((User))
    WA[WhatsApp (UltraMsg)]
    Next[Next.js Frontend]
    Odoo[Odoo ERP]
    
    User -- "Browses" --> Next
    Next -- "JSON-RPC" --> Odoo
    Next -- "REST API" --> WA
    WA -- "Webhook" --> Next
    WA -- "Message" --> User
    User -- "Reply" --> WA
```

## 2. Components

### A. Next.js Frontend (The Hub)
Acts as the central orchestrator. It holds the UI logic and the Integration Middleware.
-   **`lib/odoo`**: JSON-RPC client for communicating with Odoo. Handles Product Sync and Order Pushing.
-   **`lib/whatsapp`**: Wrapper for UltraMsg API. Handles sending logic.
-   **`lib/verification`**: Middleware state manager. Tracks pending verifications (In-memory/DB).
-   **`app/api/whatsapp/webhook`**: The listener for incoming WhatsApp messages.

### B. Odoo ERP (The Source of Truth)
Stores all business data: Products, Inventory, Orders, Customers.
-   **Products:** Synced to Next.js via `api/odoo/sync`.
-   **Orders:** Received from Next.js via JSON-RPC.
-   **Status:** Updates are polled or triggered via verification middleware.

### C. WhatsApp (UltraMsg Gateway)
Handles the "Last Mile" communication.
-   **Outbound:** Notifications, Payment Links, OTPs.
-   **Inbound:** Customer replies (Verify, Help, etc.).

## 3. Data Flow Examples

### Product Sync (Odoo -> Next.js)
1.  Next.js Cron/API triggers `syncProducts()`.
2.  `lib/odoo` calls Odoo `product.template.search_read`.
3.  Data is mapped to Sanity Schema.
4.  Sanity Client updates the Content Lake.

### Order Verification (Next.js <-> WhatsApp <-> Odoo)
1.  User places order in Next.js.
2.  Next.js detects "High Risk" or "Appointment".
3.  Next.js creates `VerificationRequest` and sends WhatsApp.
4.  User replies "VERIFY".
5.  `api/whatsapp/webhook` catches reply.
6.  `lib/verification` matches reply to phone number.
7.  `lib/odoo` calls Odoo to update record status.

## 4. Security Considerations
-   **Webhook Security:** The webhook endpoint should verify a secret token from UltraMsg (if supported) or validate the payload structure.
-   **Payment Links:** Links should be unique and expire after a set time (e.g., 24h).
-   **Data Privacy:** Minimal PII is sent over WhatsApp (First Name, Order ID only).
