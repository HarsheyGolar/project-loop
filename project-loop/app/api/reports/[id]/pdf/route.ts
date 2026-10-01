import { NextResponse } from "next/server";
import {
    PDFDocument,
    StandardFonts,
    rgb,
} from "pdf-lib";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Font = Awaited<ReturnType<PDFDocument["embedFont"]>>;
type PDFColor = ReturnType<typeof rgb>;
type PDFPage = ReturnType<PDFDocument["addPage"]>;

const pageWidth = 595.28;
const pageHeight = 841.89;
const margin = 44;
const contentWidth = pageWidth - margin * 2;
const footerLineY = 52;

function color(hex: string): PDFColor {
    const value = hex.replace("#", "");

    return rgb(
        parseInt(value.slice(0, 2), 16) / 255,
        parseInt(value.slice(2, 4), 16) / 255,
        parseInt(value.slice(4, 6), 16) / 255,
    );
}

const colors = {
    background: color("#F6F7F4"),
    surface: color("#FFFFFF"),
    text: color("#252B2B"),
    muted: color("#78807D"),
    border: color("#E6E9E4"),
    coral: color("#EF765F"),
    coralSoft: color("#FCE6DF"),
    mint: color("#D7F0E3"),
    blue: color("#DCEBF3"),
    yellow: color("#F5E9BC"),
    positive: color("#338F63"),
};

function printableText(value: string): string {
    return value
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'")
        .replace(/[–—]/g, "-")
        .replace(/\u2026/g, "...")
        .replace(/[^\x20-\x7E]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function wrapText(
    text: string,
    font: Font,
    fontSize: number,
    maxWidth: number,
): string[] {
    const words = printableText(text).split(" ").filter(Boolean);
    const lines: string[] = [];
    let current = "";

    for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;

        if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
            current = candidate;
            continue;
        }

        if (current) {
            lines.push(current);
            current = "";
        }

        if (font.widthOfTextAtSize(word, fontSize) <= maxWidth) {
            current = word;
            continue;
        }

        let chunk = "";
        for (const character of word) {
            const candidateChunk = `${chunk}${character}`;
            if (
                font.widthOfTextAtSize(candidateChunk, fontSize) <=
                maxWidth
            ) {
                chunk = candidateChunk;
            } else {
                if (chunk) {
                    lines.push(chunk);
                }
                chunk = character;
            }
        }
        current = chunk;
    }

    if (current) {
        lines.push(current);
    }

    return lines;
}

function drawWrappedText(
    page: PDFPage,
    text: string,
    font: Font,
    options: {
        x: number;
        y: number;
        width: number;
        height: number;
        fontSize: number;
        minFontSize?: number;
        lineHeight: number;
        color: PDFColor;
        maxLines?: number;
    },
): number {
    let fontSize = options.fontSize;
    let lines = wrapText(text, font, fontSize, options.width);
    const availableLines = Math.max(
        1,
        Math.floor(options.height / options.lineHeight),
    );
    const maxLines = Math.min(
        availableLines,
        options.maxLines ?? availableLines,
    );

    while (
        lines.length > maxLines &&
        fontSize > (options.minFontSize ?? options.fontSize)
    ) {
        fontSize = Math.max(
            options.minFontSize ?? options.fontSize,
            fontSize - 0.5,
        );
        lines = wrapText(text, font, fontSize, options.width);
    }

    if (lines.length > maxLines) {
        lines = lines.slice(0, maxLines);
        let finalLine = lines[maxLines - 1];

        while (
            finalLine.length > 0 &&
            font.widthOfTextAtSize(`${finalLine}...`, fontSize) >
            options.width
        ) {
            finalLine = finalLine.slice(0, -1).trimEnd();
        }

        lines[maxLines - 1] = `${finalLine}...`;
    }

    lines.forEach((line, index) => {
        page.drawText(line, {
            x: options.x,
            y: options.y - index * options.lineHeight,
            size: fontSize,
            font,
            color: options.color,
        });
    });

    return lines.length * options.lineHeight;
}

/**
 * Intentionally uses pdf-lib's native rectangle primitive.
 * This avoids drawSvgPath coordinate surprises and keeps card geometry exact.
 */
function drawCard(
    page: PDFPage,
    options: {
        x: number;
        y: number;
        width: number;
        height: number;
        fill?: PDFColor;
        border?: PDFColor;
        borderWidth?: number;
    },
): void {
    page.drawRectangle({
        x: options.x,
        y: options.y,
        width: options.width,
        height: options.height,
        color: options.fill ?? colors.surface,
        borderColor: options.border ?? colors.border,
        borderWidth: options.borderWidth ?? 0.8,
    });
}

function drawPageBackground(page: PDFPage): void {
    page.drawRectangle({
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
        color: colors.background,
    });
}

function drawHeader(
    page: PDFPage,
    section: string,
    boldFont: Font,
): void {
    page.drawCircle({
        x: margin + 4,
        y: 798,
        size: 4,
        color: colors.coral,
    });

    page.drawText("PROJECT LOOP", {
        x: margin + 14,
        y: 794,
        size: 8,
        font: boldFont,
        color: colors.text,
    });

    page.drawText(section, {
        x:
            pageWidth -
            margin -
            boldFont.widthOfTextAtSize(section, 7),
        y: 794,
        size: 7,
        font: boldFont,
        color: colors.muted,
    });

    page.drawLine({
        start: { x: margin, y: 780 },
        end: { x: pageWidth - margin, y: 780 },
        thickness: 0.8,
        color: colors.border,
    });
}

function drawFooter(
    page: PDFPage,
    pageNumber: number,
    regularFont: Font,
): void {
    page.drawLine({
        start: { x: margin, y: footerLineY },
        end: { x: pageWidth - margin, y: footerLineY },
        thickness: 0.8,
        color: colors.border,
    });

    page.drawText("PROJECT LOOP  /  VOICE OF CUSTOMER", {
        x: margin,
        y: 32,
        size: 7,
        font: regularFont,
        color: colors.muted,
    });

    const label = `${pageNumber} / 2`;
    page.drawText(label, {
        x:
            pageWidth -
            margin -
            regularFont.widthOfTextAtSize(label, 7),
        y: 32,
        size: 7,
        font: regularFont,
        color: colors.muted,
    });
}

function drawCardHeading(
    page: PDFPage,
    title: string,
    x: number,
    y: number,
    font: Font,
    accent: PDFColor,
): void {
    page.drawCircle({
        x: x + 3,
        y: y + 3,
        size: 2.8,
        color: accent,
    });

    page.drawText(title.toUpperCase(), {
        x: x + 12,
        y,
        size: 8,
        font,
        color: colors.text,
    });
}

function isEpochDate(value: Date): boolean {
    return !Number.isFinite(value.getTime()) || value.getTime() <= 86_400_000;
}

function formatDate(value: Date): string {
    if (isEpochDate(value)) {
        return "";
    }

    return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(value);
}

function formatPeriod(start: Date, end: Date): string {
    const startLabel = formatDate(start);
    const endLabel = formatDate(end);

    if (!startLabel) {
        return "All feedback";
    }

    if (!endLabel) {
        return startLabel;
    }

    return `${startLabel} - ${endLabel}`;
}

function drawMetadataCard(
    page: PDFPage,
    x: number,
    y: number,
    width: number,
    label: string,
    value: string,
    regularFont: Font,
    boldFont: Font,
): void {
    drawCard(page, {
        x,
        y,
        width,
        height: 54,
        fill: colors.surface,
    });

    page.drawText(label, {
        x: x + 12,
        y: y + 34,
        size: 6.2,
        font: boldFont,
        color: colors.muted,
    });

    const cleanValue = printableText(value) || "-";
    const valueLines = wrapText(cleanValue, boldFont, 8.8, width - 24);

    page.drawText(valueLines[0] ?? "-", {
        x: x + 12,
        y: y + 16,
        size: 8.8,
        font: boldFont,
        color: colors.text,
    });

    void regularFont;
}

function drawQuoteCard(
    page: PDFPage,
    quote: string,
    topY: number,
    accent: PDFColor,
    regularFont: Font,
    boldFont: Font,
): number {
    const cleanQuote = printableText(quote);
    const textWidth = contentWidth - 64;
    const quoteLines = wrapText(cleanQuote, regularFont, 8.8, textWidth);
    const lineCount = Math.min(3, Math.max(1, quoteLines.length));
    const cardHeight = Math.max(56, 40 + lineCount * 10);
    const cardY = topY - cardHeight;

    drawCard(page, {
        x: margin,
        y: cardY,
        width: contentWidth,
        height: cardHeight,
        fill: colors.surface,
    });

    page.drawRectangle({
        x: margin,
        y: cardY,
        width: 4,
        height: cardHeight,
        color: accent,
    });

    page.drawText('"', {
        x: margin + 16,
        y: topY - 25,
        size: 16,
        font: boldFont,
        color: colors.coral,
    });

    drawWrappedText(page, cleanQuote, regularFont, {
        x: margin + 36,
        y: topY - 18,
        width: textWidth,
        height: cardHeight - 28,
        fontSize: 8.8,
        minFontSize: 7.8,
        lineHeight: 10.5,
        color: colors.text,
        maxLines: 3,
    });

    page.drawText("CUSTOMER QUOTE", {
        x: margin + 36,
        y: cardY + 10,
        size: 6,
        font: boldFont,
        color: colors.muted,
    });

    return cardY;
}

export async function GET(
    _request: Request,
    context: {
        params: {
            id: string;
        };
    },
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const membership = await db.workspaceMember.findFirst({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                createdAt: "asc",
            },
            select: {
                workspaceId: true,
            },
        });

        if (!membership) {
            return NextResponse.json(
                { error: "Workspace not found" },
                { status: 404 },
            );
        }

        const report = await db.vocReport.findFirst({
            where: {
                id: context.params.id,
                workspaceId: membership.workspaceId,
            },
        });

        if (!report) {
            return NextResponse.json(
                { error: "Report not found" },
                { status: 404 },
            );
        }

        const quotes = Array.isArray(report.keyQuotes)
            ? report.keyQuotes.filter(
                (quote): quote is string =>
                    typeof quote === "string" &&
                    quote.trim().length > 0,
            )
            : [];

        const pdf = await PDFDocument.create();
        const regularFont = await pdf.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

        const periodStart = new Date(report.periodStart);
        const periodEnd = new Date(report.periodEnd);
        const reportDate =
            formatDate(periodEnd) || formatDate(new Date(report.createdAt));
        const periodLabel = formatPeriod(periodStart, periodEnd);

        // ==================== PAGE 1 ====================
        const page1 = pdf.addPage([pageWidth, pageHeight]);
        drawPageBackground(page1);
        drawHeader(page1, "VOICE OF CUSTOMER", boldFont);

        page1.drawText("VOICE OF CUSTOMER", {
            x: margin,
            y: 742,
            size: 8,
            font: boldFont,
            color: colors.coral,
        });

        page1.drawText("Intelligence Report", {
            x: margin,
            y: 704,
            size: 29,
            font: boldFont,
            color: colors.text,
        });

        page1.drawText(
            "A clear read on customer feedback, themes and sentiment.",
            {
                x: margin,
                y: 678,
                size: 10,
                font: regularFont,
                color: colors.muted,
            },
        );

        // Metadata row.
        const metaGap = 12;
        const metaLeftWidth = 150;
        const metaRightWidth = contentWidth - metaLeftWidth - metaGap;
        const metaY = 602;

        drawMetadataCard(
            page1,
            margin,
            metaY,
            metaLeftWidth,
            "REPORT DATE",
            reportDate,
            regularFont,
            boldFont,
        );

        drawMetadataCard(
            page1,
            margin + metaLeftWidth + metaGap,
            metaY,
            metaRightWidth,
            "REPORTING PERIOD",
            periodLabel,
            regularFont,
            boldFont,
        );

        // Executive Summary card.
        const summaryY = 421;
        const summaryHeight = 158;

        drawCard(page1, {
            x: margin,
            y: summaryY,
            width: contentWidth,
            height: summaryHeight,
            fill: colors.surface,
        });

        page1.drawRectangle({
            x: margin,
            y: summaryY,
            width: 4,
            height: summaryHeight,
            color: colors.coral,
        });

        drawCardHeading(
            page1,
            "Executive Summary",
            margin + 20,
            summaryY + summaryHeight - 28,
            boldFont,
            colors.coral,
        );

        drawWrappedText(page1, report.executiveSummary, regularFont, {
            x: margin + 20,
            y: summaryY + summaryHeight - 55,
            width: contentWidth - 40,
            height: 102,
            fontSize: 9.2,
            minFontSize: 8,
            lineHeight: 13.2,
            color: colors.text,
            maxLines: 7,
        });

        // Lower insight cards.
        const cardGap = 14;
        const columnWidth = (contentWidth - cardGap) / 2;
        const lowerY = 188;
        const lowerHeight = 196;

        drawCard(page1, {
            x: margin,
            y: lowerY,
            width: columnWidth,
            height: lowerHeight,
            fill: colors.surface,
        });
        page1.drawRectangle({
            x: margin,
            y: lowerY,
            width: 4,
            height: lowerHeight,
            color: colors.blue,
        });
        page1.drawRectangle({
            x: margin + 18,
            y: lowerY + lowerHeight - 51,
            width: 22,
            height: 22,
            color: colors.blue,
        });
        page1.drawText("K", {
            x: margin + 24,
            y: lowerY + lowerHeight - 42,
            size: 7,
            font: boldFont,
            color: colors.text,
        });
        drawCardHeading(
            page1,
            "Key Themes",
            margin + 52,
            lowerY + lowerHeight - 31,
            boldFont,
            colors.blue,
        );
        drawWrappedText(page1, report.themeSummary, regularFont, {
            x: margin + 18,
            y: lowerY + lowerHeight - 69,
            width: columnWidth - 36,
            height: 112,
            fontSize: 8.8,
            minFontSize: 7.7,
            lineHeight: 12.2,
            color: colors.text,
            maxLines: 8,
        });

        const sentimentX = margin + columnWidth + cardGap;
        drawCard(page1, {
            x: sentimentX,
            y: lowerY,
            width: columnWidth,
            height: lowerHeight,
            fill: colors.surface,
        });
        page1.drawRectangle({
            x: sentimentX,
            y: lowerY,
            width: 4,
            height: lowerHeight,
            color: colors.yellow,
        });
        page1.drawRectangle({
            x: sentimentX + 18,
            y: lowerY + lowerHeight - 51,
            width: 22,
            height: 22,
            color: colors.yellow,
        });
        page1.drawText("S", {
            x: sentimentX + 25,
            y: lowerY + lowerHeight - 42,
            size: 7,
            font: boldFont,
            color: colors.text,
        });
        drawCardHeading(
            page1,
            "Sentiment",
            sentimentX + 52,
            lowerY + lowerHeight - 31,
            boldFont,
            colors.positive,
        );
        drawWrappedText(page1, report.sentimentSummary, regularFont, {
            x: sentimentX + 18,
            y: lowerY + lowerHeight - 69,
            width: columnWidth - 36,
            height: 112,
            fontSize: 8.8,
            minFontSize: 7.7,
            lineHeight: 12.2,
            color: colors.text,
            maxLines: 8,
        });

        page1.drawText(
            "Prepared from feedback in the selected reporting period.",
            {
                x: margin,
                y: 150,
                size: 7.2,
                font: regularFont,
                color: colors.muted,
            },
        );

        drawFooter(page1, 1, regularFont);

        // ==================== PAGE 2 ====================
        const page2 = pdf.addPage([pageWidth, pageHeight]);
        drawPageBackground(page2);
        drawHeader(page2, "CUSTOMER VOICE & ACTIONS", boldFont);

        page2.drawText("Customer Voice", {
            x: margin,
            y: 748,
            size: 22,
            font: boldFont,
            color: colors.text,
        });
        page2.drawText(
            "Representative feedback from the reporting period",
            {
                x: margin,
                y: 727,
                size: 9,
                font: regularFont,
                color: colors.muted,
            },
        );

        const displayedQuotes = quotes.slice(0, 5);
        const quoteGap = 8;
        let quoteTop = 697;

        if (displayedQuotes.length === 0) {
            quoteTop = drawQuoteCard(
                page2,
                "No customer quotes were saved for this report.",
                quoteTop,
                colors.mint,
                regularFont,
                boldFont,
            ) - quoteGap;
        } else {
            displayedQuotes.forEach((quote, index) => {
                const accent =
                    index % 3 === 0
                        ? colors.mint
                        : index % 3 === 1
                            ? colors.blue
                            : colors.coralSoft;

                quoteTop =
                    drawQuoteCard(
                        page2,
                        quote,
                        quoteTop,
                        accent,
                        regularFont,
                        boldFont,
                    ) - quoteGap;
            });
        }

        // Recommended Actions is always a separate compact card.
        const actionsGap = 16;
        const actionsTop = quoteTop - actionsGap;
        const actionTextWidth = contentWidth - 40;

        const rawActionLines = wrapText(
            printableText(report.recommendedActions),
            regularFont,
            8.7,
            actionTextWidth,
        );

        // Allow the full recommendation to render instead of forcing
        // the content into a 7-line limit.
        const actionLineCount = Math.max(1, rawActionLines.length);
        const actionHeight = Math.max(108, 80 + actionLineCount * 12);
        const actionY = actionsTop - actionHeight;

        drawCard(page2, {
            x: margin,
            y: actionY,
            width: contentWidth,
            height: actionHeight,
            fill: colors.coralSoft,
            border: color("#F1C8BD"),
        });

        page2.drawRectangle({
            x: margin,
            y: actionY,
            width: 4,
            height: actionHeight,
            color: colors.coral,
        });

        page2.drawRectangle({
            x: margin + 18,
            y: actionsTop - 44,
            width: 22,
            height: 22,
            color: colors.surface,
            borderColor: colors.coral,
            borderWidth: 0.8,
        });

        page2.drawText("!", {
            x: margin + 26,
            y: actionsTop - 36,
            size: 8,
            font: boldFont,
            color: colors.coral,
        });

        drawCardHeading(
            page2,
            "Recommended Actions",
            margin + 52,
            actionsTop - 35,
            boldFont,
            colors.coral,
        );

        drawWrappedText(page2, report.recommendedActions, regularFont, {
            x: margin + 18,
            y: actionsTop - 61,
            width: contentWidth - 36,
            height: actionHeight - 75,
            fontSize: 8.7,
            minFontSize: 7.7,
            lineHeight: 12,
            color: colors.text,
            maxLines: rawActionLines.length,
        });

        drawFooter(page2, 2, regularFont);

        const pdfBytes = await pdf.save();
        const safeTitle =
            printableText(report.title)
                .replace(/[^a-z0-9-_ ]/gi, "")
                .trim()
                .replace(/\s+/g, "-") || "Project-LOOP-VoC-Report";

        return new NextResponse(Buffer.from(pdfBytes), {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${safeTitle}.pdf"`,
            },
        });
    } catch (error) {
        console.error("GET /api/reports/[id]/pdf error:", error);

        return NextResponse.json(
            { error: "Failed to generate PDF" },
            { status: 500 },
        );
    }
}
