import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import fs from "fs";
import path from "path";

export interface OrderItem {
    name: string;
    quantity: number;
    price: number;
}

export interface OrderData {
    customer: {
        firstName: string;
        lastName: string;
        phone: string;
        email?: string;
        address?: string;
        city?: string;
        region?: string;
    };
    items: OrderItem[];
    total: number;
    orderNumber?: string;
}

function formatPrice(amount: number): string {
    return `TZS ${amount.toLocaleString("en-US")}`;
}

export async function generateOrderPDF(order: OrderData, orderNumber: string): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // ─── Colors ───
    const brandBrown = rgb(0.78, 0.49, 0.21); // #c77e35
    const accentOrange = rgb(0.83, 0.32, 0.13); // #D35122
    const textDark = rgb(0.1, 0.1, 0.1);
    const textMuted = rgb(0.42, 0.45, 0.5);
    const lightBg = rgb(0.98, 0.97, 0.96);
    const borderColor = rgb(0.9, 0.9, 0.9);

    let y = height - 50;
    const margin = 50;

    // ─── Logo ───
    const logoPath = path.join(process.cwd(), "public", "logo.png");
    if (fs.existsSync(logoPath)) {
        try {
            const logoBytes = fs.readFileSync(logoPath);
            const logoImage = await pdfDoc.embedPng(logoBytes);
            const logoDims = logoImage.scale(0.3);
            page.drawImage(logoImage, {
                x: margin,
                y: height - 100,
                width: logoDims.width,
                height: logoDims.height,
            });
        } catch (e) {
            console.warn("Failed to embed logo", e);
        }
    }

    // ─── Header ───
    page.drawText("ORDER RECEIPT", {
        x: width - margin - 200,
        y: height - 70,
        size: 24,
        font: fontBold,
        color: brandBrown,
        maxWidth: 200,
    });

    page.drawText(`Order #${orderNumber}`, {
        x: width - margin - 200,
        y: height - 90,
        size: 11,
        font: fontRegular,
        color: textMuted,
    });

    const orderDate = new Date().toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric"
    });
    page.drawText(orderDate, {
        x: width - margin - 200,
        y: height - 105,
        size: 11,
        font: fontRegular,
        color: textMuted,
    });

    // ─── Divider ───
    y = height - 130;
    page.drawLine({
        start: { x: margin, y },
        end: { x: width - margin, y },
        thickness: 2,
        color: brandBrown,
    });

    // ─── Customer Details ───
    y -= 30;
    page.drawText("CUSTOMER DETAILS", { x: margin, y, size: 13, font: fontBold, color: brandBrown });
    y -= 25;

    const drawDetail = (label: string, value: string) => {
        page.drawText(label, { x: margin, y, size: 10, font: fontBold, color: textDark });
        page.drawText(value, { x: margin + 60, y, size: 10, font: fontRegular, color: textDark });
        y -= 18;
    };

    drawDetail("Name:", `${order.customer.firstName} ${order.customer.lastName}`);
    drawDetail("Phone:", order.customer.phone);
    if (order.customer.email) drawDetail("Email:", order.customer.email);
    if (order.customer.address) drawDetail("Address:", order.customer.address);
    if (order.customer.city) drawDetail("City:", `${order.customer.city}${order.customer.region ? `, ${order.customer.region}` : ""}`);

    // ─── Order Items ───
    y -= 20;
    page.drawText("ORDER ITEMS", { x: margin, y, size: 13, font: fontBold, color: brandBrown });
    y -= 25;

    // Header bar
    page.drawRectangle({
        x: margin,
        y: y - 5,
        width: width - margin * 2,
        height: 22,
        color: brandBrown,
    });

    const col1 = margin + 10;
    const col2 = margin + 270;
    const col3 = margin + 330;
    const col4 = margin + 420;

    page.drawText("ITEM", { x: col1, y, size: 9, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText("QTY", { x: col2, y, size: 9, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText("PRICE", { x: col3, y, size: 9, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText("SUBTOTAL", { x: col4, y, size: 9, font: fontBold, color: rgb(1, 1, 1) });

    y -= 25;

    order.items.forEach((item, index) => {
        if (index % 2 === 0) {
            page.drawRectangle({
                x: margin,
                y: y - 5,
                width: width - margin * 2,
                height: 22,
                color: lightBg,
            });
        }

        const itemName = item.name.length > 45 ? item.name.substring(0, 42) + "..." : item.name;
        page.drawText(itemName, { x: col1, y, size: 9, font: fontRegular, color: textDark });
        page.drawText(String(item.quantity), { x: col2 + 5, y, size: 9, font: fontRegular, color: textDark });
        page.drawText(formatPrice(item.price), { x: col3, y, size: 9, font: fontRegular, color: textDark });
        page.drawText(formatPrice(item.price * item.quantity), { x: col4, y, size: 9, font: fontRegular, color: textDark });
        y -= 22;
    });

    // Totals
    y -= 20;
    const totalX = col3 - 20;
    page.drawText("Subtotal:", { x: totalX, y, size: 10, font: fontRegular, color: textMuted });
    page.drawText(formatPrice(order.total), { x: col4, y, size: 10, font: fontRegular, color: textDark });
    y -= 18;

    page.drawText("Shipping:", { x: totalX, y, size: 10, font: fontRegular, color: textMuted });
    page.drawText("To be confirmed", { x: col4, y, size: 10, font: fontRegular, color: textDark });
    y -= 25;

    // Total box
    const totalBoxHeight = 40;
    page.drawRectangle({
        x: totalX - 10,
        y: y - (totalBoxHeight / 2) + 5,
        width: width - margin - (totalX - 10),
        height: totalBoxHeight,
        color: accentOrange,
    });

    page.drawText(`TOTAL: ${formatPrice(order.total)}`, {
        x: totalX,
        y: y,
        size: 13,
        font: fontBold,
        color: rgb(1, 1, 1),
    });

    // ─── Watermark ───
    const watermarkText = "NON PAID";
    const watermarkSize = 60;
    const watermarkWidth = fontBold.widthOfTextAtSize(watermarkText, watermarkSize);
    page.drawText(watermarkText, {
        x: (width / 2) - (watermarkWidth / 2),
        y: (height / 2),
        size: watermarkSize,
        font: fontBold,
        color: rgb(0.95, 0.9, 0.9), // Very light gray
        rotate: degrees(45),
        opacity: 0.5,
    });

    // ─── Footer ───
    const footerY = 80;
    page.drawLine({
        start: { x: margin, y: footerY },
        end: { x: width - margin, y: footerY },
        thickness: 0.5,
        color: borderColor,
    });

    const drawFooterText = (text: string, yOffset: number) => {
        page.drawText(text, {
            x: margin,
            y: footerY - yOffset,
            size: 9,
            font: fontRegular,
            color: textMuted,
            maxWidth: width - margin * 2,
        });
    };

    drawFooterText("Thank you for shopping with Stephan's Pet Store!", 20);
    drawFooterText("For questions, WhatsApp us at +255 769 324 445", 35);
    drawFooterText("www.stephanspetstore.co.tz", 50);

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
}
