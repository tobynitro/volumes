#!/usr/bin/env node

/**
 * Markdown Linter for Blog Posts
 * Checks markdown files for common issues and accessibility concerns
 */

const fs = require('fs');
const path = require('path');

console.log('📝 Linting markdown files...\n');

const postsDir = 'posts';
let totalIssues = 0;
let totalWarnings = 0;

// Get all markdown files
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

if (files.length === 0) {
    console.log('⚠️  No markdown files found in posts/ directory');
    process.exit(0);
}

console.log(`Found ${files.length} markdown file(s)\n`);

files.forEach(file => {
    const filePath = path.join(postsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    const warnings = [];

    // Check 1: Images without alt text
    const emptyAlts = content.match(/!\[\]\([^)]+\)/g);
    if (emptyAlts) {
        issues.push(`${emptyAlts.length} image(s) missing alt text (accessibility issue)`);
    }

    // Check 2: Very long alt text (>125 chars recommended)
    const imageMatches = content.matchAll(/!\[([^\]]+)\]\([^)]+\)/g);
    let longAltCount = 0;
    for (const match of imageMatches) {
        if (match[1].length > 125) {
            longAltCount++;
        }
    }
    if (longAltCount > 0) {
        warnings.push(`${longAltCount} image(s) with alt text >125 chars (should be concise)`);
    }

    // Check 3: Unsafe URLs (javascript:, data:, vbscript:)
    const unsafeUrlPatterns = [
        /\[([^\]]+)\]\((javascript:|data:|vbscript:)[^)]+\)/gi,
        /!\[([^\]]*)\]\((javascript:|data:|vbscript:)[^)]+\)/gi
    ];

    let unsafeUrls = [];
    unsafeUrlPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
            unsafeUrls = unsafeUrls.concat(matches);
        }
    });

    if (unsafeUrls.length > 0) {
        issues.push(`SECURITY: Found ${unsafeUrls.length} unsafe URL(s): ${unsafeUrls.join(', ')}`);
    }

    // Check 4: Heading hierarchy (first heading should be H1)
    const firstHeading = content.match(/^#+\s/m);
    if (firstHeading && !firstHeading[0].startsWith('# ')) {
        warnings.push(`First heading should be H1 (single #), found: ${firstHeading[0].trim()}`);
    }

    // Check 5: Multiple H1 headings (only one H1 recommended)
    const h1Count = (content.match(/^# \S/gm) || []).length;
    if (h1Count > 1) {
        warnings.push(`Found ${h1Count} H1 headings (recommend only one per post)`);
    }

    // Check 6: Missing headings entirely
    if (!firstHeading) {
        warnings.push('No headings found (posts should have structure)');
    }

    // Check 7: Broken image syntax
    const brokenImages = content.match(/!\[[^\]]*\]\([^)]*\s[^)]+\)/g);
    if (brokenImages) {
        issues.push(`${brokenImages.length} image(s) with spaces in URL (should be URL-encoded)`);
    }

    // Check 8: Broken link syntax
    const brokenLinks = content.match(/\[[^\]]+\]\([^)]*\s[^)]+\)/g);
    if (brokenLinks) {
        issues.push(`${brokenLinks.length} link(s) with spaces in URL (should be URL-encoded)`);
    }

    // Check 9: Bare URLs (should be wrapped in markdown links)
    const bareUrls = content.match(/(?<![\[\(])https?:\/\/[^\s\)]+/g);
    if (bareUrls && bareUrls.length > 0) {
        warnings.push(`${bareUrls.length} bare URL(s) found (consider wrapping in markdown links)`);
    }

    // Report results for this file
    if (issues.length > 0 || warnings.length > 0) {
        console.log(`📄 ${file}`);

        if (issues.length > 0) {
            console.log('  ❌ Issues:');
            issues.forEach(issue => console.log(`     - ${issue}`));
            totalIssues += issues.length;
        }

        if (warnings.length > 0) {
            console.log('  ⚠️  Warnings:');
            warnings.forEach(warning => console.log(`     - ${warning}`));
            totalWarnings += warnings.length;
        }

        console.log('');
    }
});

// Final summary
console.log('═'.repeat(60));
if (totalIssues === 0 && totalWarnings === 0) {
    console.log('✅ All markdown files passed linting!');
    process.exit(0);
} else {
    console.log(`Summary: ${totalIssues} issue(s), ${totalWarnings} warning(s)`);

    if (totalIssues > 0) {
        console.log('\n❌ Linting failed. Please fix the issues above.');
        process.exit(1);
    } else {
        console.log('\n⚠️  Linting passed with warnings.');
        process.exit(0);
    }
}
