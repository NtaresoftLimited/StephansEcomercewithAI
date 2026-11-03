
/**
 * Odoo JSON-RPC Client for integration
 * Uses fresh authentication for each request to avoid stale session issues
 * in serverless / edge environments.
 */

import { normalizeInternationalPhone } from "@/lib/phone";

const ODOO_URL = process.env.ODOO_URL || "https://erp.stephanspetstore.co.tz";
const ODOO_DB = process.env.ODOO_DB || "Stephans";
const ODOO_USER = process.env.ODOO_USER || "info@stephanspetstore.co.tz";
const ODOO_PASSWORD = process.env.ODOO_PASSWORD || "Stephan@3202";

export class OdooClient {
    private uid: number | null = null;
    private lastAuth: number = 0;
    private static readonly AUTH_TTL = 10 * 60 * 1000; // 10 minutes cache

    private async getUid(): Promise<number> {
        const now = Date.now();
        if (this.uid && (now - this.lastAuth < OdooClient.AUTH_TTL)) {
            return this.uid;
        }

        console.log(`🔑 Odoo Stateless Auth... (DB=${ODOO_DB}, User=${ODOO_USER})`);
        try {
            const response = await fetch(`${ODOO_URL}/jsonrpc`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "User-Agent": "StephansPetStore/1.0" },
                next: { revalidate: 300 },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    method: "call",
                    params: {
                        service: "common",
                        method: "authenticate",
                        args: [ODOO_DB, ODOO_USER, ODOO_PASSWORD, {}]
                    }
                }),
                credentials: "omit",
                signal: AbortSignal.timeout(10000)
            });

            if (!response.ok) {
                console.error(`❌ Odoo Auth HTTP Error: ${response.status}`);
                throw new Error(`Odoo Auth HTTP ${response.status}`);
            }
            
            const data = await response.json();
            if (data.error) {
                console.error("❌ Odoo Auth Logic Error:", data.error.message || data.error);
                throw new Error(data.error.data?.message || data.error.message);
            }
            
            const uid = data.result;
            if (!uid) {
                console.error("❌ Odoo Auth Success but UID is null. Check credentials and user permissions.");
                throw new Error("Odoo Auth failed (null UID)");
            }
            
            this.uid = uid;
            this.lastAuth = now;
            console.log(`✅ Odoo Auth Success: UID=${uid}`);
            return uid;
        } catch (err: any) {
            console.error(`❌ Odoo Auth Exception: ${err.message}`);
            throw err;
        }
    }

    async authenticateUser(login: string, password: string): Promise<number | null> {
        console.log(`🔑 Authenticating user ${login}...`);
        try {
            const cleaned = login.trim();
            const candidates = new Set<string>([cleaned]);

            // If input looks like a phone number (e.g. 0766 946 712, +255766946712, +254...), normalize & resolve Odoo user login
            const digits = cleaned.replace(/\D/g, "");
            if (!cleaned.includes("@") && digits.length >= 7) {
                const parsed = normalizeInternationalPhone(cleaned, "tz");
                const e164 = parsed.e164;
                const normalizedDigits = e164.replace(/\D/g, "");
                candidates.add(e164);
                candidates.add(normalizedDigits);
                candidates.add(`0${normalizedDigits.slice(-9)}`);

                // Also check if a partner/user exists via Odoo's phone matcher
                try {
                    const partnerIds = await this.executeKw(
                        "res.users",
                        "find_matching_partner_ids_by_phone",
                        [e164]
                    );
                    if (Array.isArray(partnerIds) && partnerIds.length > 0) {
                        const matchedUsers = await this.searchRead(
                            "res.users",
                            [["partner_id", "in", partnerIds]],
                            ["login"],
                            3
                        );
                        matchedUsers.forEach((u: any) => {
                            if (u?.login) candidates.add(String(u.login));
                        });
                    }
                } catch {
                    // Fallback to direct candidates if matcher fails
                }
            }

            for (const candidateLogin of candidates) {
                const response = await fetch(`${ODOO_URL}/jsonrpc`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "User-Agent": "StephansPetStore/1.0" },
                    cache: "no-store",
                    body: JSON.stringify({
                        jsonrpc: "2.0",
                        method: "call",
                        params: {
                            service: "common",
                            method: "authenticate",
                            args: [ODOO_DB, candidateLogin, password, {}]
                        }
                    })
                });
                const data = await response.json();
                if (typeof data.result === "number" && data.result > 0) {
                    return data.result;
                }
            }
            return null;
        } catch (err) {
            console.error("❌ Odoo User Auth Failed:", err);
            return null;
        }
    }

    /**
     * Check customer identifier (Phone or Email) in Odoo to determine whether to show
     * "Enter your password" or "Create a password" screen.
     */
    async checkCustomerIdentifier(identifier: string, countryIso = "tz"): Promise<{
        normalizedIdentifier: string;
        displayIdentifier: string;
        countryIso: string;
        isPhone: boolean;
        userExists: boolean;
        partnerExists: boolean;
        userId?: number;
        partnerId?: number;
        customerName?: string;
    }> {
        const cleaned = identifier.trim();
        const digits = cleaned.replace(/\D/g, "");
        const isPhone = !cleaned.includes("@") && digits.length >= 7;

        if (isPhone) {
            const parsed = normalizeInternationalPhone(cleaned, countryIso);
            const e164 = parsed.e164;
            const normalizedDigits = e164.replace(/\D/g, "");
            const displayIdentifier = parsed.formattedInternational;

            const partnerIds: number[] = await this.executeKw(
                "res.users",
                "find_matching_partner_ids_by_phone",
                [e164]
            ).catch(() => []);

            const users = await this.searchRead(
                "res.users",
                [
                    "|",
                    ["partner_id", "in", partnerIds.length ? partnerIds : [0]],
                    ["login", "in", [e164, normalizedDigits, `0${normalizedDigits.slice(-9)}`]],
                ],
                ["id", "login", "name", "partner_id"],
                1
            );

            if (users.length > 0) {
                const u = users[0];
                return {
                    normalizedIdentifier: e164,
                    displayIdentifier,
                    countryIso: parsed.country.iso2,
                    isPhone: true,
                    userExists: true,
                    partnerExists: true,
                    userId: u.id,
                    partnerId: Array.isArray(u.partner_id) ? u.partner_id[0] : undefined,
                    customerName: u.name,
                };
            }

            return {
                normalizedIdentifier: e164,
                displayIdentifier,
                countryIso: parsed.country.iso2,
                isPhone: true,
                userExists: false,
                partnerExists: partnerIds.length > 0,
                partnerId: partnerIds[0],
            };
        }

        // Email identifier
        const normalizedEmail = cleaned.toLowerCase();
        const users = await this.searchRead(
            "res.users",
            [["login", "=", normalizedEmail]],
            ["id", "login", "name", "partner_id"],
            1
        );

        if (users.length > 0) {
            const u = users[0];
            return {
                normalizedIdentifier: normalizedEmail,
                displayIdentifier: normalizedEmail,
                countryIso,
                isPhone: false,
                userExists: true,
                partnerExists: true,
                userId: u.id,
                partnerId: Array.isArray(u.partner_id) ? u.partner_id[0] : undefined,
                customerName: u.name,
            };
        }

        const partners = await this.searchRead(
            "res.partner",
            [["email", "=", normalizedEmail]],
            ["id", "name"],
            1
        );

        return {
            normalizedIdentifier: normalizedEmail,
            displayIdentifier: normalizedEmail,
            countryIso,
            isPhone: false,
            userExists: false,
            partnerExists: partners.length > 0,
            partnerId: partners[0]?.id,
            customerName: partners[0]?.name,
        };
    }

    /**
     * Set or create a password for a customer Portal User in Odoo (supports Phone or Email)
     */
    async setCustomerPortalPassword(params: {
        identifier: string;
        password: string;
        name?: string;
        otp?: string;
    }): Promise<{
        uid: number;
        partnerId: number;
        login: string;
        name: string;
        email: string;
        phone: string;
    }> {
        const { identifier, password, name, otp } = params;
        if (!password || !/^\d{4,}$/.test(password.trim()) && password.trim().length < 4) {
            throw new Error("Your password must contain at least 4 digits (e.g. your year of birth).");
        }

        const check = await this.checkCustomerIdentifier(identifier);

        // If user already exists and an OTP was provided (e.g. after WhatsApp OTP verification or setting password)
        if (check.isPhone) {
            // If OTP is provided, verify it first using Odoo's native _check_credentials
            if (otp) {
                const verified = await this.authenticateWhatsAppOtp(check.normalizedIdentifier, otp);
                if (!verified) {
                    throw new Error("Invalid or expired WhatsApp verification code.");
                }
                await this.executeKw("res.users", "write", [
                    [verified.uid],
                    { password },
                ]);
                return verified;
            }

            // Provision or locate the WhatsApp portal user via Odoo's native helper
            const res = await this.executeKw(
                "res.users",
                "find_or_create_whatsapp_portal_user",
                [check.normalizedIdentifier, name || ""]
            );
            const rawUserRef = Array.isArray(res) ? String(res[0]) : "";
            const e164Phone = Array.isArray(res) && res[1] ? String(res[1]) : check.normalizedIdentifier;
            const match = rawUserRef.match(/\((\d+),?\)/);
            const userId = match ? parseInt(match[1], 10) : Number(res[0]);

            if (!userId || Number.isNaN(userId)) {
                throw new Error("Could not provision Odoo Portal User for this phone number.");
            }

            // Set the password on the newly provisioned portal user
            await this.executeKw("res.users", "write", [
                [userId],
                { password },
            ]);

            const profile = await this.getUserProfile(userId);
            return {
                uid: userId,
                partnerId: profile?.partnerId || userId,
                login: e164Phone,
                name: profile?.name || name || `Customer (${e164Phone})`,
                email: profile?.email || "",
                phone: e164Phone,
            };
        }

        // Email-based portal user provisioning
        if (check.userExists && check.userId) {
            throw new Error("An account with this email already exists. Please sign in with your password.");
        }

        let partnerId = check.partnerId;
        const displayName = name?.trim() || check.customerName || check.normalizedIdentifier.split("@")[0];

        if (!partnerId) {
            partnerId = await this.executeKw("res.partner", "create", [
                {
                    name: displayName,
                    email: check.normalizedIdentifier,
                    customer_rank: 1,
                },
            ]);
        }

        const portalGroupData = await this.searchRead(
            "ir.model.data",
            [
                ["module", "=", "base"],
                ["name", "=", "group_portal"],
            ],
            ["res_id"],
            1
        );
        const portalGroupId =
            portalGroupData.length > 0 && portalGroupData[0].res_id
                ? portalGroupData[0].res_id
                : 10;

        const newUserId = await this.executeKw(
            "res.users",
            "create",
            [
                {
                    name: displayName,
                    login: check.normalizedIdentifier,
                    email: check.normalizedIdentifier,
                    partner_id: partnerId,
                    password,
                    groups_id: [[6, 0, [portalGroupId]]],
                    active: true,
                },
            ],
            {
                context: {
                    no_reset_password: true,
                    mail_create_nosubscribe: true,
                },
            }
        );

        return {
            uid: newUserId,
            partnerId: partnerId!,
            login: check.normalizedIdentifier,
            name: displayName,
            email: check.normalizedIdentifier,
            phone: "",
        };
    }

    /**
     * Request a native WhatsApp OTP via Odoo's res.users model (whatsapp_connector)
     */
    async requestWhatsAppOtp(phone: string, customerName?: string): Promise<{
        userId: number;
        login: string;
        phone: string;
        sent: boolean;
        gatewayMessage?: string;
    }> {
        const res = await this.executeKw(
            "res.users",
            "find_or_create_whatsapp_portal_user",
            [phone, customerName || ""]
        );

        if (!Array.isArray(res) || res.length < 2) {
            throw new Error("Unexpected response from Odoo WhatsApp user provisioning.");
        }

        const rawUserRef = String(res[0]);
        const e164Phone = String(res[1]);
        const match = rawUserRef.match(/\((\d+),?\)/);
        const userId = match ? parseInt(match[1], 10) : Number(res[0]);

        if (!userId || Number.isNaN(userId)) {
            throw new Error("Could not resolve Odoo user ID for WhatsApp login.");
        }

        // Trigger Odoo's native generate_and_send_whatsapp_otp on that user record
        const otpRes = await this.executeKw(
            "res.users",
            "generate_and_send_whatsapp_otp",
            [[userId], e164Phone]
        );

        const sentOk = Array.isArray(otpRes) ? Boolean(otpRes[0]) : Boolean(otpRes);
        const gatewayDetails = Array.isArray(otpRes) && otpRes[2] ? String(otpRes[2]) : undefined;

        // Read user login for verification step
        const users = await this.searchRead(
            "res.users",
            [["id", "=", userId]],
            ["id", "login", "name", "partner_id"],
            1
        );
        const userRecord = users[0];

        return {
            userId,
            login: userRecord?.login || e164Phone,
            phone: e164Phone,
            sent: sentOk,
            gatewayMessage: gatewayDetails,
        };
    }

    /**
     * Authenticate a user using Odoo's native _check_credentials WhatsApp OTP flow
     */
    async authenticateWhatsAppOtp(phoneOrLogin: string, otp: string): Promise<{
        uid: number;
        name: string;
        login: string;
        email: string;
        phone: string;
        partnerId: number;
    } | null> {
        try {
            // Resolve login from phone if needed
            let login = phoneOrLogin.trim();
            const res = await this.executeKw(
                "res.users",
                "find_or_create_whatsapp_portal_user",
                [login]
            );
            const e164Phone = Array.isArray(res) && res[1] ? String(res[1]) : login;
            const rawUserRef = Array.isArray(res) ? String(res[0]) : "";
            const match = rawUserRef.match(/\((\d+),?\)/);
            const candidateUid = match ? parseInt(match[1], 10) : null;

            if (candidateUid) {
                const users = await this.searchRead(
                    "res.users",
                    [["id", "=", candidateUid]],
                    ["id", "login", "name", "email", "partner_id"],
                    1
                );
                if (users.length > 0 && users[0].login) {
                    login = users[0].login;
                }
            }

            // Native Odoo common.authenticate with whatsapp_otp credential dict
            const response = await fetch(`${ODOO_URL}/jsonrpc`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "User-Agent": "StephansPetStore/1.0" },
                cache: "no-store",
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    method: "call",
                    params: {
                        service: "common",
                        method: "authenticate",
                        args: [
                            ODOO_DB,
                            login,
                            {
                                type: "whatsapp_otp",
                                login,
                                otp: otp.trim(),
                            },
                            {}
                        ]
                    }
                })
            });

            const data = await response.json();
            const uid = typeof data.result === "number" ? data.result : null;
            if (!uid) {
                return null;
            }

            const users = await this.searchRead(
                "res.users",
                [["id", "=", uid]],
                ["id", "name", "login", "email", "partner_id"],
                1
            );
            const user = users[0];
            const partnerId = Array.isArray(user?.partner_id) ? user.partner_id[0] : uid;

            return {
                uid,
                name: user?.name || `Customer (${e164Phone})`,
                login: user?.login || e164Phone,
                email: typeof user?.email === "string" && user.email ? user.email : "",
                phone: e164Phone,
                partnerId,
            };
        } catch (err) {
            console.error("❌ Odoo WhatsApp OTP Auth Failed:", err);
            return null;
        }
    }

    /**
     * Get detailed user & partner profile by Odoo UID
     */
    async getUserProfile(uid: number): Promise<{
        uid: number;
        name: string;
        email: string;
        phone: string;
        partnerId: number;
    } | null> {
        try {
            const users = await this.searchRead(
                "res.users",
                [["id", "=", uid]],
                ["id", "name", "login", "email", "partner_id"],
                1
            );
            if (!users.length) return null;
            const u = users[0];
            const partnerId = Array.isArray(u.partner_id) ? u.partner_id[0] : uid;
            let phone = "";
            if (partnerId) {
                const partners = await this.searchRead(
                    "res.partner",
                    [["id", "=", partnerId]],
                    ["phone", "mobile", "email", "name"],
                    1
                );
                if (partners.length > 0) {
                    phone = partners[0].phone || partners[0].mobile || "";
                }
            }
            return {
                uid,
                name: u.name || u.login,
                email: (typeof u.email === "string" && u.email) ? u.email : u.login,
                phone: typeof phone === "string" ? phone : "",
                partnerId,
            };
        } catch (err) {
            console.error("❌ Failed to fetch Odoo user profile:", err);
            return null;
        }
    }

    async executeKw(model: string, method: string, args: any[], kwargs: any = {}): Promise<any> {
        const uid = await this.getUid();
        console.log(`🌐 Odoo stateless RPC [${model}.${method}] (UID: ${uid})`);

        try {
            const body = JSON.stringify({
                jsonrpc: "2.0",
                method: "call",
                params: {
                    service: "object",
                    method: "execute_kw",
                    args: [ODOO_DB, uid, ODOO_PASSWORD, model, method, args, kwargs]
                },
                id: Date.now()
            });

            const response = await fetch(`${ODOO_URL}/jsonrpc`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "User-Agent": "StephansPetStore/1.0" },
                next: { revalidate: 300 },
                body,
                credentials: "omit", // Ensure NO cookies are leaked from server context
                signal: AbortSignal.timeout(15000)
            });

            if (!response.ok) {
                console.error(`❌ Odoo RPC HTTP Error: ${response.status} ${response.statusText}`);
                throw new Error(`HTTP ${response.status} from Odoo`);
            }

            const data = await response.json();
            
            if (data.error) {
                const errMsg = data.error.data?.message || data.error.message || JSON.stringify(data.error);
                console.error(`❌ Odoo Business Error [${model}.${method}]:`, errMsg);
                // Log the full error for debugging in server logs
                console.log(`🔍 Raw Odoo Error Data: ${JSON.stringify(data.error).substring(0, 500)}`);
                throw new Error(errMsg);
            }

            return data.result;
        } catch (err: any) {
            console.error(`❌ Odoo RPC Failed [${model}.${method}]: ${err.message}`);
            // Provide more context if it's a session error
            if (err.message.includes("Session") || err.message.includes("Session not found")) {
                console.error("DEBUG: Stateless call triggered session error. This implies Odoo side session requirement.");
            }
            throw new Error(err.message);
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

    /**
     * Get all website public categories (product.public.category)
     */
    async getPublicCategories(): Promise<any[]> {
        const categories = await this.searchRead(
            "product.category",
            [],
            ["id", "name", "display_name", "parent_id"]
        );

        // The database also contains accounting categories, an obsolete
        // All/Cats/Dogs tree, and one-off placeholder categories. Only expose
        // descendants of the four canonical shop roots on the website.
        const categoryById = new Map(categories.map(category => [category.id, category]));
        const canonicalRoots = new Set(
            categories
                .filter(category =>
                    !category.parent_id &&
                    ["BIRDS", "CATS", "DOGS", "SMALL ANIMALS"].includes(category.name)
                )
                .map(category => category.id)
        );

        return categories.filter(category => {
            let current = category;
            const visited = new Set<number>();
            while (current && !visited.has(current.id)) {
                if (canonicalRoots.has(current.id)) return true;
                visited.add(current.id);
                current = current.parent_id ? categoryById.get(current.parent_id[0]) : undefined;
            }
            return false;
        });
    }

    /**
     * Get all shop products from Odoo, normalized to match Sanity Product format
     */
    async getOdooShopProducts(publicCategories: any[] = []): Promise<any[]> {
        const products = await this.searchRead(
            "product.template",
            [
                ["sale_ok", "=", true],
                ["active", "=", true],
                ["image_128", "!=", false]
            ],
            [
                "id",
                "name",
                "list_price",
                "categ_id",
                "qty_available",
                "sales_count"
            ]
        );
        
        // Create category lookup map for faster mapping
        const catMap = new Map(publicCategories.map(c => [c.id, c]));

        const normalizedProducts = products.map(p => {
            const productCategories: any[] = [];
            if (p.categ_id) {
                let currentCatId = p.categ_id[0];
                while (currentCatId) {
                    const cat = catMap.get(currentCatId);
                    if (cat) {
                        // Generate slug from display_name which contains the full path "DOGS / FOOD" -> "dogs-food"
                        const slug = (cat.display_name || cat.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                        productCategories.push({
                            _id: `odoo-cat-${currentCatId}`,
                            title: cat.name,
                            displayName: cat.display_name,
                            slug: slug
                        });
                        currentCatId = cat.parent_id ? cat.parent_id[0] : null;
                    } else {
                        currentCatId = null;
                    }
                }
            }

            return {
                _id: `odoo-${p.id}`,
                name: p.name,
                slug: `odoo-${p.id}`,
                price: p.list_price,
                stock: p.qty_available ?? 10,
                sales_count: p.sales_count ?? 0,
                images: [
                    {
                        _key: `odoo-img-${p.id}`,
                        _type: "image",
                        asset: {
                            _ref: `image-odoo-${p.id}`,
                            _type: "reference",
                            url: `https://erp.stephanspetstore.co.tz/web/image/product.template/${p.id}/image_1920`
                        }
                    }
                ],
                categories: productCategories,
                isOdoo: true,
            };
        });

        // Prevent duplicate Odoo templates from producing duplicate cards.
        // Prefer the record with sales, then stock, then the older record.
        const bestByName = new Map<string, any>();
        for (const product of normalizedProducts) {
            const key = product.name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
            const existing = bestByName.get(key);
            const productScore = (product.sales_count || 0) * 1_000_000 + (product.stock || 0);
            const existingScore = existing
                ? (existing.sales_count || 0) * 1_000_000 + (existing.stock || 0)
                : -1;
            if (!existing || productScore > existingScore) bestByName.set(key, product);
        }
        return Array.from(bestByName.values());
    }
    /**
     * Resolve all Odoo partner IDs belonging to a customer (by partnerId + normalized phone)
     */
    async resolveCustomerPartnerIds(partnerId?: number, phone?: string): Promise<number[]> {
        const partnerIds = new Set<number>();
        if (partnerId) {
            partnerIds.add(partnerId);
            return Array.from(partnerIds);
        }

        if (phone) {
            try {
                const matchedIds = await this.executeKw(
                    "res.users",
                    "find_matching_partner_ids_by_phone",
                    [phone]
                );
                if (Array.isArray(matchedIds)) {
                    matchedIds.forEach((id: number) => partnerIds.add(id));
                }
            } catch (e) {
                console.warn("Could not match additional partner IDs by phone:", e);
            }
        }
        return Array.from(partnerIds);
    }

    /**
     * Get in-store POS orders for a customer partner or phone number, including line items for 1-click Reorder
     */
    async getCustomerPosOrders(partnerId?: number, phone?: string, preResolvedPartnerIds?: number[]): Promise<Array<{
        id: number;
        name: string;
        posReference: string;
        dateOrder: string;
        amountTotal: number;
        state: string;
        branchName: string;
        items: Array<{
            id: number;
            productId: string;
            name: string;
            quantity: number;
            price: number;
            image?: string;
        }>;
    }>> {
        try {
            const partnerIds = preResolvedPartnerIds ?? await this.resolveCustomerPartnerIds(partnerId, phone);
            if (partnerIds.length === 0) return [];

            const orders = await this.searchRead(
                "pos.order",
                [
                    ["partner_id", "in", partnerIds],
                    ["state", "in", ["paid", "done", "invoiced"]],
                ],
                ["id", "name", "pos_reference", "date_order", "amount_total", "state", "config_id", "lines"],
                25
            );

            // Collect all line IDs across orders to fetch line details in a single batch
            const allLineIds: number[] = [];
            for (const o of orders) {
                if (Array.isArray(o.lines)) {
                    for (const lineId of o.lines) {
                        if (typeof lineId === "number") allLineIds.push(lineId);
                    }
                }
            }

            const linesByOrderId = new Map<number, Array<{
                id: number;
                productId: string;
                name: string;
                quantity: number;
                price: number;
                image?: string;
            }>>();

            if (allLineIds.length > 0) {
                try {
                    const rawLines = await this.searchRead(
                        "pos.order.line",
                        [["id", "in", allLineIds.slice(0, 200)]],
                        ["id", "order_id", "product_id", "full_product_name", "qty", "price_unit", "price_subtotal_incl"],
                        200
                    );

                    // Resolve product.product -> product_tmpl_id for images and shop product IDs
                    const productIds = Array.from(
                        new Set(
                            rawLines
                                .map((l: any) => (Array.isArray(l.product_id) ? l.product_id[0] : null))
                                .filter((id): id is number => typeof id === "number")
                        )
                    );

                    const tmplByProductId = new Map<number, number>();
                    if (productIds.length > 0) {
                        try {
                            const products = await this.searchRead(
                                "product.product",
                                [["id", "in", productIds]],
                                ["id", "product_tmpl_id"],
                                productIds.length
                            );
                            for (const p of products) {
                                if (Array.isArray(p.product_tmpl_id)) {
                                    tmplByProductId.set(p.id, p.product_tmpl_id[0]);
                                }
                            }
                        } catch (prodErr) {
                            console.warn("Could not map product_tmpl_id for POS lines:", prodErr);
                        }
                    }

                    for (const l of rawLines) {
                        const orderId = Array.isArray(l.order_id) ? l.order_id[0] : 0;
                        const rawProdId = Array.isArray(l.product_id) ? l.product_id[0] : l.id;
                        const tmplId = tmplByProductId.get(rawProdId) || rawProdId;
                        const qty = Math.max(1, Number(l.qty) || 1);
                        const unitPrice = Number(l.price_subtotal_incl) > 0
                            ? Math.round(Number(l.price_subtotal_incl) / qty)
                            : Number(l.price_unit) || 0;
                        const displayName = (l.full_product_name || (Array.isArray(l.product_id) ? l.product_id[1] : "Pet Store Item"))
                            .replace(/^\[.*?\]\s*/, "");

                        const list = linesByOrderId.get(orderId) || [];
                        list.push({
                            id: l.id,
                            productId: `odoo-${tmplId}`,
                            name: displayName,
                            quantity: qty,
                            price: unitPrice,
                            image: `https://erp.stephanspetstore.co.tz/web/image/product.template/${tmplId}/image_1920`,
                        });
                        linesByOrderId.set(orderId, list);
                    }
                } catch (lineErr) {
                    console.warn("Could not fetch POS order lines:", lineErr);
                }
            }

            return orders.map((o: any) => ({
                id: o.id,
                name: o.name,
                posReference: o.pos_reference || o.name,
                dateOrder: o.date_order,
                amountTotal: o.amount_total || 0,
                state: o.state || "paid",
                branchName: Array.isArray(o.config_id) ? o.config_id[1] : "Stephan's Pet Store",
                items: linesByOrderId.get(o.id) || [],
            }));
        } catch (err) {
            console.error("❌ Failed to fetch customer POS orders:", err);
            return [];
        }
    }

    /**
     * Get grooming appointments for a customer from Odoo ERP (`grooming.appointment`)
     */
    async getCustomerGroomingAppointments(partnerId?: number, phone?: string, preResolvedPartnerIds?: number[]): Promise<Array<{
        id: string;
        bookingNumber: string;
        petName: string;
        petType: string;
        breedSize: string;
        package: string;
        price: number;
        appointmentDate: string;
        preferredTime: string;
        detangling: boolean;
        status: string;
        notes: string;
        source: "odoo";
    }>> {
        try {
            const partnerIds = preResolvedPartnerIds ?? await this.resolveCustomerPartnerIds(partnerId, phone);
            if (partnerIds.length === 0) return [];

            const appointments = await this.searchRead(
                "grooming.appointment",
                [["partner_id", "in", partnerIds]],
                [
                    "id",
                    "name",
                    "pet_name",
                    "pet_type",
                    "pet_category",
                    "service_id",
                    "appointment_date",
                    "preferred_time",
                    "has_detangling",
                    "notes",
                    "state",
                ],
                30
            );

            return appointments.map((a: any) => {
                const rawNotes = typeof a.notes === "string" ? a.notes : "";
                const refMatch = rawNotes.match(/Web Booking Ref:\s*(GRM-[A-Z0-9-]+)/i);
                const serviceName = Array.isArray(a.service_id) ? a.service_id[1] : "Standard Package";
                const pkgKey = serviceName.toLowerCase().includes("super")
                    ? "super_premium"
                    : serviceName.toLowerCase().includes("premium")
                    ? "premium"
                    : "standard";

                return {
                    id: `odoo-grm-${a.id}`,
                    bookingNumber: refMatch ? refMatch[1] : (a.name || `GRM-ODOO-${a.id}`),
                    petName: a.pet_name || "Pet",
                    petType: a.pet_type || "dog",
                    breedSize: a.pet_category || "medium",
                    package: pkgKey,
                    price: 0,
                    appointmentDate: a.appointment_date || "",
                    preferredTime: a.preferred_time || "",
                    detangling: Boolean(a.has_detangling),
                    status: a.state || "pending",
                    notes: rawNotes.replace(/Web Booking Ref:\s*GRM-[A-Z0-9-]+\n?/i, "").trim(),
                    source: "odoo" as const,
                };
            });
        } catch (err) {
            console.warn("Could not fetch Odoo grooming appointments:", err);
            return [];
        }
    }
}

export const odoo = new OdooClient();
