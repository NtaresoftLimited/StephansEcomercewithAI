
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
            })
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
            })
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
}

export const odoo = new OdooClient();
