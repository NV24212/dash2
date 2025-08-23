import { RequestHandler } from "express";
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

interface FixResult {
  file: string;
  fixes: number;
  originalText?: string;
  fixedText?: string;
}

// Comprehensive list of corrupted character patterns and their fixes
const CHARACTER_FIXES = [
  // Arabic text corruptions
  { pattern: /Ø´ÙƒØ±Ø§Ù‹ Ù„Ùƒ Ø¹Ù„Ù‰ Ø·Ù„Ø¨Ùƒ!/g, replacement: "شكراً لك على طلبك!" },
  { pattern: /ØªÙ… ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ø·Ù„Ø¨!/g, replacement: "تم تأكيد الطلب!" },
  { pattern: /Ø³Ù†Ù‚ÙˆÙ… Ø¨ØªØ¬Ù‡ÙŠØ²Ù‡ Ø®Ù„Ø§Ù„ 2-4 Ø³Ø§Ø¹Ø§Øª/g, replacement: "سنقوم بتجهيزه خلال 2-4 ساعات" },
  { pattern: /Ø§Ù„ØªÙˆØµÙŠÙ„ Ø®Ù„Ø§Ù„ 1-3 Ø£ÙŠØ§Ù… Ø¹Ù…Ù„/g, replacement: "التوصيل خلال 1-3 أيام عمل" },
  { pattern: /Ø³ÙŠØªÙ… Ø§Ù„ØªÙˆØ§ØµÙ„ Ù…Ø¹Ùƒ Ø¹Ø¨Ø± Ø§Ù„Ù‡Ø§ØªÙ/g, replacement: "سيتم التواصل معك عبر الهاتف" },
  { pattern: /Ù„Ø£ÙŠ ØªØºÙŠÙŠØ±Ø§Øª Ø£Ùˆ Ø£Ø³Ø¦Ù„Ø© Ø­ÙˆÙ„ Ø·Ù„Ø¨Ùƒ/g, replacement: "لأي تغييرات أو أسئلة حول طلبك" },
  { pattern: /ÙŠØ±Ø¬Ù‰ Ø§Ù„ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§/g, replacement: "يرجى التواصل معنا" },
  
  // Common Arabic words
  { pattern: /Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª/g, replacement: "المنتجات" },
  { pattern: /Ø§Ù„Ø·Ù„Ø¨Ø§Øª/g, replacement: "الطلبات" },
  { pattern: /Ø§Ù„Ø¹Ù…Ù„Ø§Ø¡/g, replacement: "العملاء" },
  { pattern: /Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª/g, replacement: "الإعدادات" },
  { pattern: /Ø§Ù„ØªØµÙ†ÙŠÙØ§Øª/g, replacement: "التصنيفات" },
  { pattern: /Ø§Ù„Ø¥ÙŠØ±Ø§Ø¯Ø§Øª/g, replacement: "الإيرادات" },
  { pattern: /Ø§Ù„ØªØ­Ù„ÙŠÙ„Ø§Øª/g, replacement: "التحليلات" },
  { pattern: /Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…/g, replacement: "لوحة التحكم" },
  { pattern: /Ù„ÙˆØ­Ø© Ø§Ù„Ø¥Ø¯Ø§Ø±Ø©/g, replacement: "لوحة الإدارة" },
  { pattern: /ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬/g, replacement: "تسجيل الخروج" },
  { pattern: /ØªØºÙŠÙŠØ± Ø§Ù„Ù„ØºØ©/g, replacement: "تغيير اللغة" },
  { pattern: /Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©/g, replacement: "العربية" },
  { pattern: /Ø§Ù„Ø³Ù„Ø©/g, replacement: "السلة" },
  { pattern: /Ø§Ù„Ù…ØªØ¬Ø±/g, replacement: "المتجر" },
  { pattern: /Ø§Ù„ØªÙˆØµÙŠÙ„/g, replacement: "التوصيل" },
  { pattern: /Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù…/g, replacement: "الاستلام" },
  { pattern: /Ù…Ø¬Ø§Ù†ÙŠ/g, replacement: "مجاني" },
  { pattern: /Ø§Ù„ÙƒÙ…ÙŠØ©/g, replacement: "الكمية" },
  { pattern: /Ø§Ù„Ø³Ø¹Ø±/g, replacement: "السعر" },
  { pattern: /Ø§Ù„Ù…Ø®Ø²ÙˆÙ†/g, replacement: "المخزون" },
  { pattern: /Ø§Ù„Ø§Ø³Ù…/g, replacement: "الاسم" },
  { pattern: /Ø§Ù„ÙˆØµÙ/g, replacement: "الوصف" },
  { pattern: /Ø§Ù„ØµÙˆØ±/g, replacement: "الصور" },
  { pattern: /Ø§Ù„Ø£Ù†ÙˆØ§Ø¹/g, replacement: "الأنواع" },
  { pattern: /Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª/g, replacement: "الإجراءات" },
  { pattern: /ØªØ¹Ø¯ÙŠÙ„/g, replacement: "تعديل" },
  { pattern: /Ø­Ø°Ù/g, replacement: "حذف" },
  { pattern: /Ø¥Ø¶Ø§ÙØ©/g, replacement: "إضافة" },
  { pattern: /Ø¨Ø­Ø«/g, replacement: "بحث" },
  { pattern: /Ø­ÙØ¸/g, replacement: "حفظ" },
  { pattern: /Ø¥Ù„ØºØ§Ø¡/g, replacement: "إلغاء" },
  { pattern: /ØªØ£ÙƒÙŠØ¯/g, replacement: "تأكيد" },
  { pattern: /Ø¥ØºÙ„Ø§Ù‚/g, replacement: "إغلاق" },
  { pattern: /Ù†Ø¹Ù…/g, replacement: "نعم" },
  { pattern: /Ù„Ø§/g, replacement: "لا" },
  { pattern: /Ø§Ù„Ø³Ø§Ø¨Ù‚/g, replacement: "السابق" },
  { pattern: /Ø§Ù„ØªØ§Ù„ÙŠ/g, replacement: "التالي" },
  { pattern: /Ù†Ø¬Ø­/g, replacement: "نجح" },
  { pattern: /ØªÙ…Øª Ø§Ù„Ø¥Ø¶Ø§ÙØ©/g, replacement: "تمت الإضافة" },
  
  // Generic corrupted character patterns
  { pattern: /Ã¢â‚¬â„¢/g, replacement: "'" },
  { pattern: /Ã¢â‚¬Å"/g, replacement: '"' },
  { pattern: /Ã¢â‚¬Â/g, replacement: '"' },
  { pattern: /Ã¢â‚¬â€œ/g, replacement: "–" },
  { pattern: /Ã¢â‚¬â€/g, replacement: "—" },
  { pattern: /Ã‚Â/g, replacement: " " },
  { pattern: /â€™/g, replacement: "'" },
  { pattern: /â€œ/g, replacement: '"' },
  { pattern: /â€/g, replacement: '"' },
  { pattern: /â€"/g, replacement: "–" },
  { pattern: /â€"/g, replacement: "—" },
  { pattern: /â€¦/g, replacement: "…" },
  
  // Remove replacement characters (�)
  { pattern: /�+/g, replacement: "" },
  
  // Fix double spaces
  { pattern: /\s{2,}/g, replacement: " " },
];

function scanAndFixFile(filePath: string): FixResult | null {
  try {
    const content = readFileSync(filePath, "utf-8");
    let fixedContent = content;
    let totalFixes = 0;
    const appliedFixes: string[] = [];

    // Apply all character fixes
    CHARACTER_FIXES.forEach((fix) => {
      const matches = fixedContent.match(fix.pattern);
      if (matches) {
        const fixCount = matches.length;
        fixedContent = fixedContent.replace(fix.pattern, fix.replacement);
        totalFixes += fixCount;
        appliedFixes.push(`${fix.pattern} -> ${fix.replacement} (${fixCount} times)`);
      }
    });

    if (totalFixes > 0) {
      writeFileSync(filePath, fixedContent, "utf-8");
      console.log(`Fixed ${totalFixes} characters in ${filePath}`);
      console.log("Applied fixes:", appliedFixes);
      
      return {
        file: filePath,
        fixes: totalFixes,
        originalText: content.substring(0, 200) + "...",
        fixedText: fixedContent.substring(0, 200) + "...",
      };
    }

    return null;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return null;
  }
}

function scanDirectory(dirPath: string, results: FixResult[] = []): FixResult[] {
  try {
    const items = readdirSync(dirPath);

    for (const item of items) {
      const fullPath = join(dirPath, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip node_modules, .git, dist, and other build directories
        if (!["node_modules", ".git", "dist", ".next", "build", "coverage"].includes(item)) {
          scanDirectory(fullPath, results);
        }
      } else if (stat.isFile()) {
        // Process text files that might contain corrupted characters
        const ext = extname(item).toLowerCase();
        if ([".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".txt", ".sql", ".html"].includes(ext)) {
          const fixResult = scanAndFixFile(fullPath);
          if (fixResult) {
            results.push(fixResult);
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error);
  }

  return results;
}

export const handleFixCharacters: RequestHandler = async (req, res) => {
  try {
    console.log("Starting character corruption fix...");
    
    const projectRoot = process.cwd();
    const results: FixResult[] = [];

    // Scan all relevant directories
    const dirsToScan = [
      join(projectRoot, "client"),
      join(projectRoot, "server"), 
      join(projectRoot, "shared"),
      projectRoot, // Root level files
    ];

    for (const dir of dirsToScan) {
      try {
        console.log(`Scanning directory: ${dir}`);
        scanDirectory(dir, results);
      } catch (error) {
        console.error(`Error scanning ${dir}:`, error);
      }
    }

    const totalFixes = results.reduce((sum, result) => sum + result.fixes, 0);

    console.log(`Character fix completed. Total fixes: ${totalFixes}`);
    console.log(`Files affected: ${results.length}`);

    res.json({
      success: true,
      totalFixes,
      fixReport: results,
      message: `Successfully fixed ${totalFixes} corrupted characters across ${results.length} files.`,
    });
  } catch (error) {
    console.error("Error in character fix:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};