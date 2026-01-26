#!/usr/bin/env node

/**
 * RSS Feed Generator
 *
 * Generates an RSS 2.0 feed from posts.json
 * Run this script after adding new posts: node generate-rss.js
 */

const fs = require('fs');
const path = require('path');

// ============================================================
// CONFIGURATION - Update these to match your blog
// ============================================================
const CONFIG = {
    siteTitle: 'Building Toby Nitro',
    siteDescription: 'Documenting the journey from software, to hardware.',
    siteUrl: 'https://yoursite.com', // Update with your actual domain
    author: 'Toby Nitro',
    language: 'en',
    postsFile: './posts.json',
    postsDir: './posts/',
    outputFile: './feed.xml'
};

// ============================================================
// ESCAPE XML ENTITIES
// ============================================================
function escapeXml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// ============================================================
// CONVERT MARKDOWN TO PLAIN TEXT (simple version)
// ============================================================
function markdownToText(markdown) {
    return markdown
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .replace(/`[^`]+`/g, '')        // Remove inline code
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // Images -> alt text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // Links -> text only
        .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1') // Bold/italic
        .replace(/^#{1,6}\s+/gm, '')    // Headings
        .replace(/^[-*]\s+/gm, '')      // List items
        .replace(/^\d+\.\s+/gm, '')     // Numbered lists
        .replace(/^>\s+/gm, '')         // Blockquotes
        .trim();
}

// ============================================================
// GENERATE RSS FEED
// ============================================================
async function generateRSS() {
    try {
        // Load posts
        const postsData = JSON.parse(fs.readFileSync(CONFIG.postsFile, 'utf-8'));

        // Sort by date (newest first)
        postsData.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Build RSS items
        const items = [];

        for (const post of postsData) {
            // Try to load post content for description
            let description = post.description || '';
            try {
                const postPath = path.join(CONFIG.postsDir, `${post.slug}.md`);
                if (fs.existsSync(postPath)) {
                    const content = fs.readFileSync(postPath, 'utf-8');
                    // Use first 200 characters of content
                    const plainText = markdownToText(content);
                    description = plainText.substring(0, 200) + (plainText.length > 200 ? '...' : '');
                }
            } catch (err) {
                // Use post description if content can't be loaded
            }

            const pubDate = new Date(post.date).toUTCString();
            const link = `${CONFIG.siteUrl}/#${post.slug}`;

            items.push(`
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(description)}</description>
      ${post.chapter ? `<category>${escapeXml(post.chapter)}</category>` : ''}
    </item>`);
        }

        // Build complete RSS feed
        const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(CONFIG.siteTitle)}</title>
    <link>${CONFIG.siteUrl}</link>
    <description>${escapeXml(CONFIG.siteDescription)}</description>
    <language>${CONFIG.language}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${CONFIG.siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${items.join('\n')}
  </channel>
</rss>`;

        // Write to file
        fs.writeFileSync(CONFIG.outputFile, rss, 'utf-8');

        console.log(`✓ RSS feed generated successfully: ${CONFIG.outputFile}`);
        console.log(`  ${postsData.length} posts included`);
        console.log(`\nDon't forget to update the siteUrl in generate-rss.js!`);

    } catch (error) {
        console.error('Error generating RSS feed:', error.message);
        process.exit(1);
    }
}

// Run the generator
generateRSS();
