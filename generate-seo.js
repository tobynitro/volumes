#!/usr/bin/env node

/**
 * SEO File Generator
 * Automatically generates sitemap.xml and feed.xml from posts.json
 * Run this script whenever you add new blog posts
 *
 * Usage: node generate-seo.js
 */

const fs = require('fs');
const path = require('path');

// ============================================================
// CONFIGURATION
// Update these to match your site
// ============================================================
const CONFIG = {
    siteUrl: 'https://tobynitro.com',
    siteName: 'Building Toby Nitro',
    siteDescription: 'Documenting the journey from software to hardware. Weekly EE tutorials, circuit design insights, and embedded systems development.',
    author: 'Toby Nitro',
    email: 'noreply@tobynitro.com',
    postsFile: './posts.json',
    postsDir: './posts/',
    sitemapFile: './sitemap.xml',
    feedFile: './feed.xml'
};

// ============================================================
// LOAD POSTS
// ============================================================
function loadPosts() {
    try {
        const data = fs.readFileSync(CONFIG.postsFile, 'utf8');
        const posts = JSON.parse(data);
        // Sort by date, newest first
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        return posts;
    } catch (error) {
        console.error('Error loading posts:', error);
        process.exit(1);
    }
}

// ============================================================
// GENERATE SITEMAP.XML
// ============================================================
function generateSitemap(posts) {
    const lastMod = posts[0]?.date || new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">

    <!-- Homepage -->
    <url>
        <loc>${CONFIG.siteUrl}/</loc>
        <lastmod>${lastMod}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>

    <!-- Blog Posts -->
`;

    posts.forEach(post => {
        xml += `    <url>
        <loc>${CONFIG.siteUrl}/#${post.slug}</loc>
        <lastmod>${post.date}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>

`;
    });

    xml += `    <!-- RSS Feed -->
    <url>
        <loc>${CONFIG.siteUrl}/feed.xml</loc>
        <lastmod>${lastMod}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.5</priority>
    </url>

</urlset>
`;

    fs.writeFileSync(CONFIG.sitemapFile, xml);
    console.log(`✓ Generated ${CONFIG.sitemapFile}`);
}

// ============================================================
// GENERATE RSS FEED
// ============================================================
function generateRSSFeed(posts) {
    const buildDate = new Date().toUTCString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${CONFIG.siteName}</title>
    <link>${CONFIG.siteUrl}</link>
    <description>${CONFIG.siteDescription}</description>
    <language>en-us</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${CONFIG.siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <managingEditor>${CONFIG.email} (${CONFIG.author})</managingEditor>
    <webMaster>${CONFIG.email} (${CONFIG.author})</webMaster>
    <category>Electrical Engineering</category>
    <category>Hardware Design</category>
    <category>Embedded Systems</category>
    <category>Electronics</category>
    <image>
      <url>${CONFIG.siteUrl}/og-image.jpg</url>
      <title>${CONFIG.siteName}</title>
      <link>${CONFIG.siteUrl}</link>
    </image>

`;

    posts.forEach(post => {
        const pubDate = new Date(post.date).toUTCString();
        const postUrl = `${CONFIG.siteUrl}/#${post.slug}`;

        // Try to read the actual post content
        let content = '';
        try {
            const postPath = path.join(CONFIG.postsDir, `${post.slug}.md`);
            if (fs.existsSync(postPath)) {
                content = fs.readFileSync(postPath, 'utf8');
            }
        } catch (error) {
            console.warn(`Warning: Could not read content for ${post.slug}`);
        }

        // Escape HTML/XML special characters in content
        const escapeXml = (str) => {
            return str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;');
        };

        // Convert markdown to basic HTML for RSS (simple conversion)
        const contentHtml = content
            .split('\n')
            .map(line => {
                if (line.startsWith('# ')) return `<h1>${escapeXml(line.slice(2))}</h1>`;
                if (line.startsWith('## ')) return `<h2>${escapeXml(line.slice(3))}</h2>`;
                if (line.startsWith('### ')) return `<h3>${escapeXml(line.slice(4))}</h3>`;
                if (line.trim() === '') return '<br/>';
                return `<p>${escapeXml(line)}</p>`;
            })
            .join('\n');

        xml += `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <dc:creator>${CONFIG.author}</dc:creator>
      <description><![CDATA[${post.description || post.title}]]></description>
      <content:encoded><![CDATA[
${contentHtml}
      ]]></content:encoded>
      <category>${post.chapter || 'General'}</category>
    </item>

`;
    });

    xml += `  </channel>
</rss>
`;

    fs.writeFileSync(CONFIG.feedFile, xml);
    console.log(`✓ Generated ${CONFIG.feedFile}`);
}

// ============================================================
// MAIN
// ============================================================
function main() {
    console.log('Generating SEO files...\n');

    const posts = loadPosts();
    console.log(`Loaded ${posts.length} posts\n`);

    generateSitemap(posts);
    generateRSSFeed(posts);

    console.log('\n✓ Done! SEO files generated successfully.');
    console.log('\nReminder: Update the following URLs in your files:');
    console.log(`  - index.html: Update domain name if needed`);
    console.log(`  - generate-seo.js: Update CONFIG.siteUrl if domain changes`);
}

main();
