/* ============================================================
   BLOG ENGINE

   This is the JavaScript that powers everything.
   You probably don't need to edit this unless you want to
   add features.

   How it works:
   1. Loads posts.json to get the list of posts
   2. Checks the URL hash to decide what to show
   3. Either shows the post list or fetches/renders a single post
============================================================ */

(function() {
    'use strict';

    // ============================================================
    // CONFIGURATION
    // ============================================================
    const CONFIG = {
        postsFile: 'posts.json',      // Where the post manifest lives
        postsDir: 'posts/'            // Where .md files live
    };

    // Store for loaded posts data
    let postsData = null;

    // ============================================================
    // MARKDOWN PARSER
    //
    // A tiny, zero-dependency markdown parser.
    // Handles: headings, bold, italic, links, images, code,
    //          lists, blockquotes, horizontal rules, paragraphs
    //
    // For a daily blog, this covers 99% of what you'll write.
    // If you need more features, you can swap this out for
    // marked.js by adding: <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js">
    // and replacing parseMarkdown(text) with marked.parse(text)
    // ============================================================
    function parseMarkdown(text) {
        // Normalize line endings
        text = text.replace(/\r\n/g, '\n');

        // Store code blocks to protect them from other parsing
        const codeBlocks = [];
        text = text.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
            codeBlocks.push(`<pre><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`);
            return `%%CODEBLOCK${codeBlocks.length - 1}%%`;
        });

        // Inline code (protect from other parsing)
        const inlineCodes = [];
        text = text.replace(/`([^`]+)`/g, (match, code) => {
            inlineCodes.push(`<code>${escapeHtml(code)}</code>`);
            return `%%INLINECODE${inlineCodes.length - 1}%%`;
        });

        // Split into lines for block-level parsing
        const lines = text.split('\n');
        let html = '';
        let inList = false;
        let listType = '';
        let inBlockquote = false;
        let blockquoteContent = [];

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];

            // Headings
            if (line.match(/^#{1,6}\s/)) {
                if (inList) { html += `</${listType}>`; inList = false; }
                if (inBlockquote) { html += `<blockquote><p>${parseInline(blockquoteContent.join(' '))}</p></blockquote>`; inBlockquote = false; blockquoteContent = []; }
                const level = line.match(/^(#+)/)[1].length;
                const content = line.replace(/^#+\s*/, '');
                const headingId = generateSlug(content);
                html += `<h${level} id="${headingId}"><a href="#${headingId}" class="heading-anchor">${parseInline(content)}</a></h${level}>\n`;
                continue;
            }

            // Horizontal rule
            if (line.match(/^(-{3,}|\*{3,}|_{3,})$/)) {
                if (inList) { html += `</${listType}>`; inList = false; }
                if (inBlockquote) { html += `<blockquote><p>${parseInline(blockquoteContent.join(' '))}</p></blockquote>`; inBlockquote = false; blockquoteContent = []; }
                html += '<hr>\n';
                continue;
            }

            // Blockquote
            if (line.match(/^>\s?/)) {
                if (inList) { html += `</${listType}>`; inList = false; }
                inBlockquote = true;
                blockquoteContent.push(line.replace(/^>\s?/, ''));
                continue;
            } else if (inBlockquote) {
                html += `<blockquote><p>${parseInline(blockquoteContent.join(' '))}</p></blockquote>\n`;
                inBlockquote = false;
                blockquoteContent = [];
            }

            // Unordered list
            if (line.match(/^[\*\-]\s/)) {
                if (!inList || listType !== 'ul') {
                    if (inList) html += `</${listType}>`;
                    html += '<ul>';
                    inList = true;
                    listType = 'ul';
                }
                html += `<li>${parseInline(line.replace(/^[\*\-]\s/, ''))}</li>`;
                continue;
            }

            // Ordered list
            if (line.match(/^\d+\.\s/)) {
                if (!inList || listType !== 'ol') {
                    if (inList) html += `</${listType}>`;
                    html += '<ol>';
                    inList = true;
                    listType = 'ol';
                }
                html += `<li>${parseInline(line.replace(/^\d+\.\s/, ''))}</li>`;
                continue;
            }

            // Close list if we hit a non-list line
            if (inList && line.trim() === '') {
                html += `</${listType}>\n`;
                inList = false;
                continue;
            }

            // Code block placeholder (restore later)
            if (line.match(/%%CODEBLOCK\d+%%/)) {
                if (inList) { html += `</${listType}>`; inList = false; }
                html += line + '\n';
                continue;
            }

            // Paragraph
            if (line.trim() !== '') {
                if (inList) { html += `</${listType}>`; inList = false; }
                html += `<p>${parseInline(line)}</p>\n`;
            }
        }

        // Close any open elements
        if (inList) html += `</${listType}>`;
        if (inBlockquote) html += `<blockquote><p>${parseInline(blockquoteContent.join(' '))}</p></blockquote>`;

        // Restore code blocks
        codeBlocks.forEach((block, i) => {
            html = html.replace(`%%CODEBLOCK${i}%%`, block);
        });

        // Restore inline code
        inlineCodes.forEach((code, i) => {
            html = html.replace(`%%INLINECODE${i}%%`, code);
        });

        return html;
    }

    // Generate URL-friendly slug from text
    function generateSlug(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove special chars
            .replace(/\s+/g, '-')      // Replace spaces with hyphens
            .replace(/--+/g, '-')      // Replace multiple hyphens with single
            .trim();
    }

    // Parse inline elements (bold, italic, links, images)
    function parseInline(text) {
        // Images: ![alt](src)
        text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

        // Links: [text](url)
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

        // Bold: **text** or __text__
        text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');

        // Italic: *text* or _text_
        text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        text = text.replace(/_([^_]+)_/g, '<em>$1</em>');

        return text;
    }

    // Escape HTML entities
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ============================================================
    // ROUTING
    // Determines what to show based on URL hash
    // ============================================================
    function getRoute() {
        const hash = window.location.hash.slice(1); // Remove the #
        return hash || null; // null means show homepage
    }

    // ============================================================
    // RENDER POST LIST (homepage)
    // ============================================================
    function renderPostList(posts) {
        if (posts.length === 0) {
            return '<p class="loading">No posts yet. Add your first post!</p>';
        }

        // Render simple list of posts
        const items = posts.map(post => `
            <div class="post-list-item">
                <a href="#${post.slug}" class="post-list-link">${escapeHtml(post.title)}</a>
            </div>
        `).join('');

        return `
            <div class="post-list-container">
                <h2 class="post-list-title">Recent posts</h2>
                <div class="post-list">
                    ${items}
                </div>
            </div>
        `;
    }

    // ============================================================
    // RENDER SINGLE POST
    // ============================================================
    function renderPost(post, content, prevPost, nextPost) {
        const nav = `
            <nav class="post-nav">
                ${prevPost
                    ? `<a href="#${prevPost.slug}" class="post-nav-prev">${escapeHtml(prevPost.title)}</a>`
                    : '<span class="post-nav-placeholder">Previous</span>'
                }
                ${nextPost
                    ? `<a href="#${nextPost.slug}" class="post-nav-next">${escapeHtml(nextPost.title)}</a>`
                    : '<span class="post-nav-placeholder">Next</span>'
                }
            </nav>
        `;

        const heroImage = post.thumbnail
            ? `<img src="${escapeHtml(post.thumbnail)}" alt="${escapeHtml(post.title)}" class="post-hero">`
            : '';

        return `
            <article>
                ${heroImage}
                <div class="post-content">
                    ${parseMarkdown(content)}
                </div>
                ${nav}
            </article>
        `;
    }

    // ============================================================
    // FETCH AND DISPLAY CONTENT
    // ============================================================
    async function loadPosts() {
        if (postsData) return postsData;

        try {
            const response = await fetch(CONFIG.postsFile);
            if (!response.ok) throw new Error('Hmmm, wierd! I was unable to load any posts.');
            postsData = await response.json();
            // Sort by date, newest first
            postsData.sort((a, b) => new Date(b.date) - new Date(a.date));
            return postsData;
        } catch (error) {
            console.error('Error loading posts:', error);
            throw error;
        }
    }

    async function loadPostContent(slug) {
        try {
            const response = await fetch(`${CONFIG.postsDir}${slug}.md`);
            if (!response.ok) throw new Error('Post not found');
            return await response.text();
        } catch (error) {
            console.error('Error loading post:', error);
            throw error;
        }
    }

    async function render() {
        const content = document.getElementById('content');
        let header = document.querySelector('.home-header, .blog-header');
        const slug = getRoute();

        try {
            const posts = await loadPosts();

            if (!slug) {
                // Show post list - ensure home header
                if (!header || !header.classList.contains('home-header')) {
                    header = document.querySelector('header');
                    header.className = 'home-header';
                }
                header.innerHTML = `
                    <a href="/" class="site-title">Building Toby Nitro</a>
                    <p class="site-tagline">Documenting the journey from software, to hardware.</p>
                `;
                content.innerHTML = renderPostList(posts);
                document.title = 'Toby Nitro'; // Change to your blog name
            } else {
                // Find and show single post
                const postIndex = posts.findIndex(p => p.slug === slug);

                if (postIndex === -1) {
                    content.innerHTML = '<p class="error">Post not found</p>';
                    return;
                }

                const post = posts[postIndex];
                const postContent = await loadPostContent(slug);

                // Switch to blog header
                if (!header || !header.classList.contains('blog-header')) {
                    header = document.querySelector('header');
                    header.className = 'blog-header';
                }

                // Update header with post title and description
                header.innerHTML = `
                    <a href="/" class="back-button" aria-label="Back to home">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </a>
                    <h1 class="post-title">${escapeHtml(post.title)}</h1>
                    <p class="post-description">${escapeHtml(post.description || '')}</p>
                `;

                // Get prev/next posts (remember: array is newest-first)
                const prevPost = posts[postIndex + 1] || null; // Older post
                const nextPost = posts[postIndex - 1] || null; // Newer post

                content.innerHTML = renderPost(post, postContent, prevPost, nextPost);
                document.title = `${post.title} — Toby Nitro`; // Change to your blog name

                // Scroll to top when viewing a post
                window.scrollTo(0, 0);
            }
        } catch (error) {
            content.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        }
    }

    // ============================================================
    // DARK MODE TOGGLE
    // ============================================================
    function initTheme() {
        // Always set an explicit theme (either from localStorage or system preference)
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

        document.documentElement.setAttribute('data-theme', theme);

        // Set up toggle button
        const toggleButton = document.getElementById('theme-toggle');
        if (toggleButton) {
            toggleButton.addEventListener('click', function() {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
            });
        }
    }

    // ============================================================
    // HEADING ANCHOR CLICKS
    // Handle anchor link clicks to scroll within post without changing hash
    // ============================================================
    document.addEventListener('click', function(e) {
        const anchor = e.target.closest('.heading-anchor');
        if (!anchor) return;

        // Only handle if we're on a post page
        const slug = getRoute();
        if (!slug) return;

        e.preventDefault();
        const href = anchor.getAttribute('href');
        if (href && href.startsWith('#')) {
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });

    // ============================================================
    // KEYBOARD NAVIGATION
    // ============================================================
    window.addEventListener('keydown', function(e) {
        const slug = getRoute();

        // Only handle keyboard navigation when viewing a post
        if (!slug) return;

        // Don't interfere with form inputs or textareas
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        // Get current post and navigation
        if (!postsData) return;
        const postIndex = postsData.findIndex(p => p.slug === slug);
        if (postIndex === -1) return;

        switch(e.key) {
            case 'ArrowLeft':
                // Navigate to previous (older) post
                const prevPost = postsData[postIndex + 1];
                if (prevPost) {
                    e.preventDefault();
                    window.location.hash = prevPost.slug;
                }
                break;

            case 'ArrowRight':
                // Navigate to next (newer) post
                const nextPost = postsData[postIndex - 1];
                if (nextPost) {
                    e.preventDefault();
                    window.location.hash = nextPost.slug;
                }
                break;

            case 'Escape':
                // Return to home
                e.preventDefault();
                window.location.hash = '';
                break;
        }
    });

    // ============================================================
    // INITIALISE
    // ============================================================

    // Initialize theme
    initTheme();

    // Re-render when URL hash changes
    window.addEventListener('hashchange', render);

    // Initial render
    render();

})();
