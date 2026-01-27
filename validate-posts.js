#!/usr/bin/env node

/**
 * Validate posts.json integrity
 * Checks for:
 * - Valid JSON format
 * - All required fields present
 * - Corresponding markdown files exist
 * - Guide-specific fields for type: "guide"
 */

const fs = require('fs');
const path = require('path');

console.log('Validating posts.json...\n');

// Load posts.json
let posts;
try {
    posts = JSON.parse(fs.readFileSync('posts.json', 'utf8'));
    console.log('✓ posts.json is valid JSON');
} catch (error) {
    console.error('✗ posts.json has syntax errors:', error.message);
    process.exit(1);
}

console.log(`✓ Found ${posts.length} posts\n`);

// Validation
let errors = [];
let warnings = [];

posts.forEach((post, index) => {
    const num = index + 1;

    // Check required fields
    if (!post.slug) errors.push(`Post #${num}: Missing 'slug' field`);
    if (!post.title) errors.push(`Post #${num}: Missing 'title' field`);
    if (!post.date) errors.push(`Post #${num}: Missing 'date' field`);
    if (!post.type) errors.push(`Post #${num}: Missing 'type' field (should be "post" or "guide")`);

    // Check markdown file exists
    if (post.slug) {
        const mdPath = path.join('posts', `${post.slug}.md`);
        if (!fs.existsSync(mdPath)) {
            errors.push(`Post #${num} (${post.slug}): Markdown file not found at ${mdPath}`);
        }
    }

    // Check guide-specific fields
    if (post.type === 'guide') {
        if (!post.problem) warnings.push(`Guide #${num} (${post.slug}): Missing 'problem' field (recommended for guides)`);
        if (!post.difficulty) warnings.push(`Guide #${num} (${post.slug}): Missing 'difficulty' field (should be Beginner/Intermediate/Advanced)`);
        if (!post.tags || post.tags.length === 0) warnings.push(`Guide #${num} (${post.slug}): Missing 'tags' field (recommended for guides)`);
    }

    // Check for common issues
    if (!post.description || post.description === 'Add your description here') {
        warnings.push(`Post #${num} (${post.slug}): Description is placeholder or missing (bad for SEO)`);
    }
});

// Check for orphaned markdown files
const mdFiles = fs.readdirSync('posts').filter(f => f.endsWith('.md'));
const postSlugs = posts.map(p => `${p.slug}.md`);
const orphanedFiles = mdFiles.filter(f => !postSlugs.includes(f));

if (orphanedFiles.length > 0) {
    warnings.push(`Found ${orphanedFiles.length} orphaned markdown files (not in posts.json): ${orphanedFiles.join(', ')}`);
}

// Report results
console.log('='.repeat(60));
if (errors.length === 0 && warnings.length === 0) {
    console.log('✓ All validations passed!');
    console.log('='.repeat(60));
    process.exit(0);
}

if (errors.length > 0) {
    console.log(`✗ ERRORS (${errors.length}):`);
    errors.forEach(err => console.log(`  - ${err}`));
    console.log();
}

if (warnings.length > 0) {
    console.log(`⚠ WARNINGS (${warnings.length}):`);
    warnings.forEach(warn => console.log(`  - ${warn}`));
    console.log();
}

console.log('='.repeat(60));
process.exit(errors.length > 0 ? 1 : 0);
