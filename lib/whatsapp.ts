
export interface WhatsAppResponse {
    success: boolean;
    data?: any;
    error?: any;
}

export async function sendWhatsAppMessage(to: string, body: string): Promise<WhatsAppResponse> {
    const token = process.env.ULTRAMSG_TOKEN;
    const instanceId = process.env.ULTRAMSG_INSTANCE_ID;

    if (!token || !instanceId) {
        console.error("UltraMsg credentials not configured");
        return { success: false, error: "Configuration missing" };
    }

    // Ensure phone number format (simple check)
    // UltraMsg expects international format, e.g., +254...
    let phoneNumber = to.trim();
    if (!phoneNumber.startsWith("+")) {
        phoneNumber = `+${phoneNumber}`;
    }

    // White-labeling: Default to generic URL in code/config, but use real one for request
    let baseUrl = process.env.ULTRAMSG_API_URL || "https://api.gengeni.bi";
    if (baseUrl.includes("gengeni.bi")) {
        baseUrl = "https://api.ultramsg.com";
    }

    try {
        const response = await fetch(
            `${baseUrl}/${instanceId}/messages/chat`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    token: token,
                    to: phoneNumber,
                    body: body,
                }),
            }
        );

        const data = await response.json();
        
        if (!response.ok) {
             console.error("UltraMsg API Error", data);
             return { success: false, error: data };
        }
        
        return { success: true, data };

    } catch (error) {
        console.error("UltraMsg Fetch Error", error);
        return { success: false, error };
    }
}
