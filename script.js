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
        postsDir: 'posts/',           // Where .md files live
        debug: false                  // Set to true for verbose logging
    };

    // Store for loaded posts data
    let postsData = null;

    // Simple logger that respects debug flag
    const log = {
        info: (msg) => CONFIG.debug && console.log(`[Blog] ${msg}`),
        warn: (msg) => console.warn(`[Blog] ${msg}`),
        error: (msg) => console.error(`[Blog] ${msg}`),
        success: (msg) => console.log(`✓ ${msg}`)
    };

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
        text = text.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
            codeBlocks.push(`<pre><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`);
            return `%%CODEBLOCK${codeBlocks.length - 1}%%`;
        });

        // Inline code (protect from other parsing)
        const inlineCodes = [];
        text = text.replace(/`([^`]+)`/g, (_match, code) => {
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

    // Parse inline elements (bold, italic, links)
    function parseInline(text) {
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
    // SEO META TAG MANAGEMENT
    // Update meta tags dynamically for each page
    // ============================================================
    function updateMetaTags(post = null) {
        const baseUrl = window.location.origin + window.location.pathname;
        const currentUrl = post ? `${baseUrl}#${post.slug}` : baseUrl;

        if (!post) {
            // Homepage meta tags
            updateMetaTag('name', 'title', 'Building Toby Nitro - EE Blog & Educational Resources');
            updateMetaTag('name', 'description', 'Documenting the journey from software to hardware. Weekly EE tutorials, circuit design insights, and embedded systems development.');
            updateMetaTag('property', 'og:type', 'website');
            updateMetaTag('property', 'og:title', 'Building Toby Nitro - EE Blog & Educational Resources');
            updateMetaTag('property', 'og:description', 'Documenting the journey from software to hardware. Weekly EE tutorials, circuit design insights, and embedded systems development.');
            updateMetaTag('property', 'og:url', currentUrl);
            updateMetaTag('property', 'og:image', `${baseUrl}og-image.jpg`);
            updateMetaTag('name', 'twitter:title', 'Building Toby Nitro - EE Blog & Educational Resources');
            updateMetaTag('name', 'twitter:description', 'Documenting the journey from software to hardware. Weekly EE tutorials, circuit design insights, and embedded systems development.');
            updateMetaTag('name', 'twitter:url', currentUrl);
            updateMetaTag('name', 'twitter:image', `${baseUrl}og-image.jpg`);
            updateCanonicalUrl(baseUrl);
        } else {
            // Individual post meta tags
            const title = `${post.title} — Building Toby Nitro`;
            const description = post.description || post.title;
            const imageUrl = post.thumbnail ? `${baseUrl}${post.thumbnail}` : `${baseUrl}og-image.jpg`;

            updateMetaTag('name', 'title', title);
            updateMetaTag('name', 'description', description);
            updateMetaTag('property', 'og:type', 'article');
            updateMetaTag('property', 'og:title', title);
            updateMetaTag('property', 'og:description', description);
            updateMetaTag('property', 'og:url', currentUrl);
            updateMetaTag('property', 'og:image', imageUrl);
            updateMetaTag('property', 'article:published_time', post.date);
            updateMetaTag('property', 'article:author', 'Toby Nitro');
            updateMetaTag('name', 'twitter:title', title);
            updateMetaTag('name', 'twitter:description', description);
            updateMetaTag('name', 'twitter:url', currentUrl);
            updateMetaTag('name', 'twitter:image', imageUrl);
            updateCanonicalUrl(currentUrl);
        }
    }

    function updateMetaTag(attrName, attrValue, content) {
        let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
        if (element) {
            element.setAttribute('content', content);
        } else {
            element = document.createElement('meta');
            element.setAttribute(attrName, attrValue);
            element.setAttribute('content', content);
            document.head.appendChild(element);
        }
    }

    function updateCanonicalUrl(url) {
        let canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) {
            canonical.setAttribute('href', url);
        } else {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            canonical.setAttribute('href', url);
            document.head.appendChild(canonical);
        }
    }

    function addStructuredData(post, content) {
        // Remove existing structured data
        const existing = document.getElementById('structured-data');
        if (existing) existing.remove();

        if (!post) return;

        const baseUrl = window.location.origin + window.location.pathname;
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": post.title,
            "description": post.description || post.title,
            "image": post.thumbnail ? `${baseUrl}${post.thumbnail}` : `${baseUrl}og-image.jpg`,
            "datePublished": post.date,
            "dateModified": post.date,
            "author": {
                "@type": "Person",
                "name": "Toby Nitro"
            },
            "publisher": {
                "@type": "Organization",
                "name": "Building Toby Nitro",
                "logo": {
                    "@type": "ImageObject",
                    "url": `${baseUrl}logo.png`
                }
            },
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": `${baseUrl}#${post.slug}`
            },
            "articleBody": content
        };

        const script = document.createElement('script');
        script.id = 'structured-data';
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(structuredData);
        document.head.appendChild(script);
    }

    // ============================================================
    // TAB MANAGEMENT
    // Handle tab switching on homepage
    // ============================================================
    function getActiveTab() {
        return localStorage.getItem('activeTab') || 'recent';
    }

    function setActiveTab(tab) {
        localStorage.setItem('activeTab', tab);
    }

    function renderTabs(activeTab) {
        const tabs = [
            { id: 'recent', label: 'Recent Posts' },
            { id: 'troubleshooting', label: 'Troubleshooting' },
            { id: 'about', label: 'About' }
        ];

        const tabsHtml = tabs.map(tab => {
            const activeClass = tab.id === activeTab ? 'active' : '';
            return `<li class="tab-item"><a href="#" class="tab-link ${activeClass}" data-tab="${tab.id}">${tab.label}</a></li>`;
        }).join('');

        return `
            <div class="tabs-container">
                <ul class="tabs">
                    ${tabsHtml}
                </ul>
            </div>
        `;
    }

    function initTabSwitching() {
        document.addEventListener('click', function(e) {
            const tabLink = e.target.closest('.tab-link');
            if (!tabLink) return;

            e.preventDefault();
            const tabId = tabLink.getAttribute('data-tab');
            setActiveTab(tabId);
            render();
        });
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
                <div class="post-list">
                    ${items}
                </div>
            </div>
        `;
    }

    // ============================================================
    // RENDER TROUBLESHOOTING LIST
    // ============================================================
    function renderTroubleshooting(posts) {
        // Filter posts that are guides or have troubleshooting keywords
        const troubleshootingPosts = posts.filter(post => {
            // Check if it's explicitly marked as a guide
            if (post.type === 'guide') return true;

            // Check for troubleshooting keywords
            const titleMatch = post.title.toLowerCase().includes('troubleshoot') ||
                              post.title.toLowerCase().includes('debug') ||
                              post.title.toLowerCase().includes('fix') ||
                              post.title.toLowerCase().includes('error') ||
                              post.title.toLowerCase().includes('issue');
            const descMatch = post.description && (
                post.description.toLowerCase().includes('troubleshoot') ||
                post.description.toLowerCase().includes('debug') ||
                post.description.toLowerCase().includes('fix')
            );
            const categoryMatch = post.category && post.category.toLowerCase() === 'troubleshooting';
            return titleMatch || descMatch || categoryMatch;
        });

        if (troubleshootingPosts.length === 0) {
            return `
                <div class="post-list-container">
                    <p class="loading">No troubleshooting guides yet. Check back soon!</p>
                </div>
            `;
        }

        // Separate guides from regular posts
        const guides = troubleshootingPosts.filter(post => post.type === 'guide');
        const regularPosts = troubleshootingPosts.filter(post => post.type !== 'guide');

        let html = '<div class="post-list-container">';

        // Render guides with card layout
        if (guides.length > 0) {
            const guideCards = guides.map(post => {
                const difficulty = post.difficulty ? post.difficulty.toLowerCase() : 'beginner';
                const tags = post.tags || [];

                return `
                    <a href="#${post.slug}" class="guide-card">
                        <div class="guide-card-header">
                            <h3 class="guide-card-title">${escapeHtml(post.title)}</h3>
                            <span class="guide-difficulty ${difficulty}">${escapeHtml(post.difficulty || 'Beginner')}</span>
                        </div>
                        ${post.problem ? `<p class="guide-problem">${escapeHtml(post.problem)}</p>` : ''}
                        ${tags.length > 0 ? `
                            <div class="guide-tags">
                                ${tags.map(tag => `<span class="guide-tag">${escapeHtml(tag)}</span>`).join('')}
                            </div>
                        ` : ''}
                    </a>
                `;
            }).join('');

            html += `<div class="guide-list">${guideCards}</div>`;
        }

        // Render regular posts with simple list layout
        if (regularPosts.length > 0) {
            const items = regularPosts.map(post => `
                <div class="post-list-item">
                    <a href="#${post.slug}" class="post-list-link">${escapeHtml(post.title)}</a>
                </div>
            `).join('');

            html += `
                ${guides.length > 0 ? '<div style="margin-top: 1.5rem;"></div>' : ''}
                <div class="post-list">
                    ${items}
                </div>
            `;
        }

        html += '</div>';
        return html;
    }

    // ============================================================
    // RENDER ABOUT SECTION
    // ============================================================
    function renderAbout() {
        return `
            <div class="post-list-container">
                <div class="post-content">
                    <h2>About Building Toby Nitro</h2>

                    <p>This blog documents my journey from software development to hardware engineering. Every week, I share what I'm learning about electrical engineering, circuit design, and embedded systems.</p>

                    <h3>What You'll Find Here</h3>
                    <ul>
                        <li><strong>Weekly tutorials</strong> on EE fundamentals</li>
                        <li><strong>Circuit design insights</strong> from real projects</li>
                        <li><strong>Troubleshooting guides</strong> for common hardware issues</li>
                        <li><strong>Project breakdowns</strong> showing both successes and failures</li>
                    </ul>

                    <h3>Why I Built This</h3>
                    <p>After years of software development, I wanted to understand how things work at the hardware level. This blog is my public learning log—a way to document my progress, share what I discover, and hopefully help others on the same journey.</p>

                    <h3>Topics I Cover</h3>
                    <ul>
                        <li>Analog and digital circuit design</li>
                        <li>PCB design and layout</li>
                        <li>Microcontrollers and embedded systems</li>
                        <li>Signal processing and power electronics</li>
                        <li>Testing, debugging, and measurement techniques</li>
                    </ul>

                    <h3>Follow Along</h3>
                    <p>New posts every week. Subscribe to the <a href="/feed.xml">RSS feed</a> to stay updated.</p>

                    <p><em>— Building something great, one circuit at a time</em> ⚡</p>
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

        return `
            <article>
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
            if (!response.ok) throw new Error('Unable to load posts.json. Please ensure the file exists.');
            postsData = await response.json();

            // Sort by date, newest first
            postsData.sort((a, b) => new Date(b.date) - new Date(a.date));

            log.success(`Loaded ${postsData.length} posts`);
            return postsData;
        } catch (error) {
            log.error('Error loading posts: ' + error.message);

            // Check if it's a CORS/local file issue
            if (window.location.protocol === 'file:') {
                throw new Error('Cannot load posts when opening file:// directly. Please use a local web server (e.g., python -m http.server 8000 or npx serve)');
            }

            throw error;
        }
    }

    async function loadPostContent(slug) {
        try {
            const response = await fetch(`${CONFIG.postsDir}${slug}.md`);
            if (!response.ok) throw new Error(`Post file not found: ${slug}.md`);
            const content = await response.text();
            log.info(`Loaded post: ${slug}`);
            return content;
        } catch (error) {
            log.error('Error loading post: ' + error.message);
            throw error;
        }
    }

    // Validate posts data (runs in debug mode)
    async function validatePosts(posts) {
        if (!CONFIG.debug) return;

        log.info('Running post validation...');
        const issues = [];

        for (const post of posts) {
            // Check required fields
            if (!post.slug) issues.push(`Post missing slug: ${JSON.stringify(post)}`);
            if (!post.title) issues.push(`Post missing title: ${post.slug}`);
            if (!post.date) issues.push(`Post missing date: ${post.slug}`);
            if (!post.type) issues.push(`Post missing type field: ${post.slug}`);

            // Check for guide-specific fields
            if (post.type === 'guide') {
                if (!post.difficulty) issues.push(`Guide missing difficulty: ${post.slug}`);
                if (!post.tags || post.tags.length === 0) issues.push(`Guide missing tags: ${post.slug}`);
            }
        }

        if (issues.length > 0) {
            log.warn(`Found ${issues.length} validation issues:`);
            issues.forEach(issue => log.warn(`  - ${issue}`));
        } else {
            log.success('All posts passed validation');
        }
    }

    async function render() {
        const content = document.getElementById('content');
        let header = document.querySelector('.home-header, .blog-header');
        const slug = getRoute();

        try {
            const posts = await loadPosts();

            // Validate posts in debug mode
            await validatePosts(posts);

            if (!slug) {
                // Show post list - ensure home header
                if (!header || !header.classList.contains('home-header')) {
                    header = document.querySelector('header');
                    header.className = 'home-header';
                }

                // Get active tab
                const activeTab = getActiveTab();

                // Render header with tabs
                header.innerHTML = `
                    <a href="#" class="site-title">Building Toby Nitro</a>
                    <p class="site-tagline">Documenting the journey from software, to hardware.</p>
                    ${renderTabs(activeTab)}
                `;

                // Render content based on active tab
                let tabContent = '';
                switch(activeTab) {
                    case 'troubleshooting':
                        tabContent = renderTroubleshooting(posts);
                        break;
                    case 'about':
                        tabContent = renderAbout();
                        break;
                    case 'recent':
                    default:
                        tabContent = renderPostList(posts);
                }

                content.innerHTML = tabContent;
                document.title = 'Building Toby Nitro - EE Blog & Educational Resources';

                // Update SEO meta tags for homepage
                updateMetaTags();
            } else {
                // Find and show single post
                const postIndex = posts.findIndex(p => p.slug === slug);

                if (postIndex === -1) {
                    content.innerHTML = `
                        <div class="post-list-container">
                            <p class="error">Post not found: "${slug}"</p>
                            <p style="margin-top: 1rem;"><a href="#" class="post-list-link">← Back to posts</a></p>
                        </div>
                    `;
                    log.warn(`Post not found in posts.json: ${slug}`);
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
                    <a href="#" class="back-button" aria-label="Back to home">
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
                document.title = `${post.title} — Building Toby Nitro`;

                // Update SEO meta tags and structured data
                updateMetaTags(post);
                addStructuredData(post, postContent);

                // Scroll to top when viewing a post
                window.scrollTo(0, 0);
            }
        } catch (error) {
            // Show user-friendly error message
            let errorHtml = `
                <div class="post-list-container">
                    <p class="error">Error: ${escapeHtml(error.message)}</p>
            `;

            // Add helpful troubleshooting info for common errors
            if (window.location.protocol === 'file:') {
                errorHtml += `
                    <div style="margin-top: 1rem; padding: 1rem; background: var(--color-code-bg); border-radius: 6px;">
                        <p><strong>Local Development Issue</strong></p>
                        <p>You're opening this file directly (file://). To fix this, run a local web server:</p>
                        <pre style="margin-top: 0.5rem;"><code>python -m http.server 8000</code></pre>
                        <p style="margin-top: 0.5rem;">Then open: <code>http://localhost:8000</code></p>
                    </div>
                `;
            }

            errorHtml += `
                    <p style="margin-top: 1rem;"><a href="#" class="post-list-link">← Try again</a></p>
                </div>
            `;
            content.innerHTML = errorHtml;
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

    // Show startup info
    console.log('%c Building Toby Nitro ', 'background: #333; color: #fff; padding: 4px 8px; border-radius: 3px;');
    console.log(`Environment: ${window.location.protocol}//${window.location.host}`);
    if (CONFIG.debug) console.log('Debug mode: enabled');

    // Initialize theme
    initTheme();

    // Initialize tab switching
    initTabSwitching();

    // Re-render when URL hash changes
    window.addEventListener('hashchange', render);

    // Initial render
    render();

})();
