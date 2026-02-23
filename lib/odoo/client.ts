
/**
 * Odoo JSON-RPC Client for integration
 */

const ODOO_URL = process.env.ODOO_URL || "https://erp.stephanspetstore.co.tz";
const ODOO_DB = process.env.ODOO_DB || "Stephans";
const ODOO_USER = process.env.ODOO_USER || "info@stephanspetstore.co.tz";
const ODOO_PASSWORD = process.env.ODOO_PASSWORD || "Stephan@3202";

export class OdooClient {
    private uid: number | null = null;

    private async authenticate(): Promise<number> {
        if (this.uid) return this.uid;

        const response = await fetch(`${ODOO_URL}/jsonrpc`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "call",
                params: {
                    service: "common",
                    method: "authenticate",
                    args: [ODOO_DB, ODOO_USER, ODOO_PASSWORD, {}]
                },
                id: Date.now()
            }),
            signal: AbortSignal.timeout(5000) // 5s timeout
        });

        const data = await response.json();
        if (data.error) throw new Error(`Odoo Auth Error: ${JSON.stringify(data.error)}`);

        this.uid = data.result;
        if (!this.uid) throw new Error("Odoo Auth failed: UID is null");

        return this.uid;
    }

    async executeKw(model: string, method: string, args: any[], kwargs: any = {}): Promise<any> {
        const uid = await this.authenticate();

        const response = await fetch(`${ODOO_URL}/jsonrpc`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "call",
                params: {
                    service: "object",
                    method: "execute_kw",
                    args: [ODOO_DB, uid, ODOO_PASSWORD, model, method, args, kwargs]
                },
                id: Date.now()
            }),
            signal: AbortSignal.timeout(5000) // 5s timeout
        });

        const data = await response.json();
        if (data.error) throw new Error(`Odoo API Error: ${JSON.stringify(data.error)}`);

        return data.result;
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
            [],
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
                ["website_published", "=", true]
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

