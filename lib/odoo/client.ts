
/**
 * Odoo JSON-RPC Client for integration
 * Uses fresh authentication for each request to avoid stale session issues
 * in serverless environments (Vercel).
 */

const ODOO_URL = process.env.ODOO_URL || "https://erp.stephanspetstore.co.tz";
const ODOO_DB = process.env.ODOO_DB || "Stephans";
const ODOO_USER = process.env.ODOO_USER || "info@stephanspetstore.co.tz";
const ODOO_PASSWORD = process.env.ODOO_PASSWORD || "Stephan@3202";

export class OdooClient {
    private sessionId: string | null = null;
    private uid: number | null = null;
    private sessionTimestamp: number = 0;
    private static readonly SESSION_TTL_MS = 15 * 60 * 1000; // 15 minutes

    private async authenticate(forceRefresh = false): Promise<{ uid: number; sessionId: string }> {
        const now = Date.now();
        const isExpired = (now - this.sessionTimestamp) > OdooClient.SESSION_TTL_MS;

        if (this.uid && this.sessionId && !forceRefresh && !isExpired) {
            return { uid: this.uid, sessionId: this.sessionId };
        }

        console.log(`🔑 Authenticating with Odoo via /web/session/authenticate (URL=${ODOO_URL}, DB=${ODOO_DB}, User=${ODOO_USER})`);

        try {
            const response = await fetch(`${ODOO_URL}/web/session/authenticate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    params: {
                        db: ODOO_DB,
                        login: ODOO_USER,
                        password: ODOO_PASSWORD,
                    }
                }),
                signal: AbortSignal.timeout(15000)
            });

            if (!response.ok) {
                throw new Error(`Odoo Auth HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            if (data.error) {
                const errMsg = data.error.data?.message || data.error.message || JSON.stringify(data.error);
                throw new Error(`Odoo Auth Error: ${errMsg}`);
            }

            const result = data.result;
            if (!result || !result.uid || !result.session_id) {
                throw new Error("Odoo Auth failed: No UID or Session ID returned");
            }

            const uid = result.uid as number;
            const sessionId = result.session_id as string;

            this.uid = uid;
            this.sessionId = sessionId;
            this.sessionTimestamp = now;

            console.log(`🔑 Authenticated! UID: ${uid}, Session: ${sessionId.substring(0, 8)}...`);
            return { uid, sessionId };
        } catch (err: any) {
            console.error(`❌ Odoo Auth Error: ${err.message}`);
            this.uid = null;
            this.sessionId = null;
            throw err;
        }
    }

    async authenticateUser(login: string, password: string): Promise<number | null> {
        console.log(`🔑 Authenticating user ${login} with Odoo...`);
        try {
            const response = await fetch(`${ODOO_URL}/web/session/authenticate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    params: {
                        db: ODOO_DB,
                        login: login,
                        password: password,
                    }
                }),
                signal: AbortSignal.timeout(15000)
            });

            const data = await response.json();
            if (data.error) {
                console.error("❌ Odoo User Auth Error:", JSON.stringify(data.error, null, 2));
                return null;
            }

            return data.result?.uid || null;
        } catch (err) {
            console.error("❌ Odoo User Auth Network Error:", err);
            return null;
        }
    }

    async executeKw(model: string, method: string, args: any[], kwargs: any = {}): Promise<any> {
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                const { uid, sessionId } = await this.authenticate(attempt > 1);

                // For /web/dataset/call_kw, the format is slightly different 
                const response = await fetch(`${ODOO_URL}/web/dataset/call_kw/${model}/${method}`, {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "Cookie": `session_id=${sessionId}`
                    },
                    body: JSON.stringify({
                        jsonrpc: "2.0",
                        params: {
                            model,
                            method,
                            args,
                            kwargs,
                        },
                        id: Date.now()
                    }),
                    signal: AbortSignal.timeout(20000)
                });

                if (!response.ok) {
                    if (response.status === 404) throw new Error("Odoo endpoint not found (404)");
                    if (response.status === 401 || response.status === 403) {
                        if (attempt === 1) continue; // Retry with fresh auth
                    }
                    throw new Error(`HTTP ${response.status} from Odoo`);
                }

                const data = await response.json();
                if (data.error) {
                    const errMsg = data.error.data?.message || data.error.message || JSON.stringify(data.error);
                    
                    // If Odoo says session expired or invalid, retry with fresh auth
                    if (errMsg.toLowerCase().includes("session") || errMsg.toLowerCase().includes("expired")) {
                        if (attempt === 1) {
                            console.warn("⚠️ Odoo session expired, retrying with fresh auth...");
                            continue;
                        }
                    }
                    throw new Error(errMsg);
                }

                return data.result;
            } catch (err: any) {
                if (attempt === 2) {
                    throw new Error(`Odoo API Error (${model}.${method}): ${err.message}`);
                }
                console.warn(`⚠️ Odoo call failed (attempt ${attempt}), retrying: ${err.message}`);
                // Clear state to force fresh auth on next attempt
                this.uid = null;
                this.sessionId = null;
            }
        }
    }

    async searchRead(model: string, domain: any[] = [], fields: string[] = [], limit?: number): Promise<any[]> {
        return this.executeKw(model, "search_read", [domain], {
            fields,
            limit
        });
    }

    /**
     * Get product variants (product.product) for a product template
     * Odoo uses product.template for the base product and product.product for variants
     */
    async getProductVariants(templateId: number): Promise<any[]> {
        return this.searchRead(
            "product.product",
            [["product_tmpl_id", "=", templateId]],
            [
                "id",
                "name",
                "display_name",
                "lst_price",
                "list_price",
                "qty_available",
                "weight",
                "volume",
                "default_code",
                "barcode",
                "image_variant_1920",
                "product_template_attribute_value_ids",
                "attribute_line_ids"
            ]
        );
    }

    /**
     * Get additional product images from product.image model
     * This is where extra gallery images are stored in Odoo e-commerce
     */
    async getProductImages(templateId: number): Promise<any[]> {
        return this.searchRead(
            "product.image",
            [["product_tmpl_id", "=", templateId]],
            ["id", "name", "image_1920", "sequence"]
        );
    }

    /**
     * Get all brands (product.brand)
     */
    async getBrands(): Promise<any[]> {
        return this.searchRead(
            "product.brand",
            [["active", "=", true]],
            ["id", "name", "logo"]
        );
    }

    /**
     * Get product attribute values (e.g., sizes, weights, colors)
     */
    async getProductAttributeValues(attributeIds: number[]): Promise<any[]> {
        if (!attributeIds.length) return [];
        return this.searchRead(
            "product.template.attribute.value",
            [["id", "in", attributeIds]],
            ["id", "name", "display_name", "attribute_id", "product_attribute_value_id", "price_extra"]
        );
    }

    /**
     * Get full product details including variants and images
     */
    async getProductWithDetails(templateId: number): Promise<{
        template: any;
        variants: any[];
        images: any[];
    }> {
        const [template] = await this.searchRead(
            "product.template",
            [["id", "=", templateId]],
            [
                "id",
                "name",
                "list_price",
                "description_sale",
                "description",
                "categ_id",
                "qty_available",
                "image_1920",
                "brand_id",
                "product_variant_ids",
                "attribute_line_ids"
            ],
            1
        );

        if (!template) {
            throw new Error(`Product template ${templateId} not found`);
        }

        const [variants, images] = await Promise.all([
            this.getProductVariants(templateId),
            this.getProductImages(templateId)
        ]);

        return { template, variants, images };
    }
    /**
     * Get a brand by its slug (name)
     * Performs a case-insensitive search
     */
    async getBrandBySlug(slug: string): Promise<any | null> {
        // Simple slug to name conversion (replace dashes with spaces)
        // Adjust logic if you have a specific slug field in Odoo
        const name = slug.replace(/-/g, " ");

        const brands = await this.searchRead(
            "product.brand",
            [["name", "ilike", name]],
            ["id", "name", "logo"],
            1
        );

        return brands.length > 0 ? brands[0] : null;
    }

    /**
     * Get products for a specific brand
     */
    async getProductsByBrand(brandId: number): Promise<any[]> {
        return this.searchRead(
            "product.template",
            [
                ["brand_id", "=", brandId],
                ["sale_ok", "=", true],
                ["website_published", "=", true],
                ["active", "=", true]
            ],
            [
                "id",
                "name",
                "list_price",
                "description_sale",
                "image_1920",
                "default_code"
            ]
        );
    }
}

export const odoo = new OdooClient();

