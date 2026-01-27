# Building Toby Nitro

A lightweight, SEO-optimized blog engine for electrical engineering content. Features tabbed navigation, troubleshooting guides, and automatic SEO generation.

## Features

- **Zero build dependencies** - Just write markdown and push
- **Tab navigation** - Recent Posts, Troubleshooting Guides, About
- **SEO optimized** - Automatic sitemap, RSS feed, structured data
- **Guide system** - Rich card UI for troubleshooting content
- **Dark mode** - Automatic theme switching
- **Fast & lightweight** - No frameworks, no databases

## Quick Start

See [QUICK-START.md](QUICK-START.md) for the 3-minute publishing workflow.

## File Structure

```
tobynitro/
├── index.html              # Main HTML file
├── script.js               # Blog engine (routing, markdown parsing, rendering)
├── posts.json              # Post manifest
├── posts/                  # Your markdown files
│   ├── 2025-01-23-hello-world.md
│   └── ...
├── components/             # Component CSS files
│   ├── button.css          # Back button, theme toggle
│   ├── footer.css          # Footer styles
│   ├── guide-card.css      # Troubleshooting guide cards
│   ├── header.css          # Site header and blog header
│   ├── navigation.css      # Post prev/next navigation
│   ├── post-list.css       # Post list styles
│   ├── post.css            # Individual post styles
│   ├── tabs.css            # Tab navigation
│   └── utility.css         # Loading and error states
├── tokens-base.css         # Base design tokens
├── tokens-semantic.css     # Semantic color tokens
├── global.css              # Global styles and layout
├── generate-seo.js         # Generate sitemap.xml and feed.xml
├── validate-posts.js       # Validate posts.json integrity
├── sitemap.xml             # Auto-generated sitemap
├── feed.xml                # Auto-generated RSS feed
├── robots.txt              # Search engine crawler rules
└── images/                 # Your images

Documentation:
├── README.md               # This file
├── QUICK-START.md          # Publishing workflow
├── SEO-GUIDE.md            # SEO best practices
├── TROUBLESHOOTING-GUIDE.md # Writing troubleshooting guides
└── DOMAIN-SETUP.md         # Domain configuration
```

## Publishing a New Post

```bash
# 1. Create markdown file
echo "# My New Post" > posts/2025-01-27-my-post.md

# 2. Add to posts.json
# Add entry with: slug, title, description, date, thumbnail, type

# 3. Validate (optional)
node validate-posts.js

# 4. Generate SEO files
node generate-seo.js

# 5. Test locally
python -m http.server 8000

# 6. Deploy
git add .
git commit -m "Add post: My New Post"
git push
```

## Content Types

### Regular Posts (`type: "post"`)

Simple blog posts shown in a list format.

```json
{
    "slug": "2025-01-27-topic",
    "title": "Your Title Here",
    "description": "SEO description",
    "date": "2025-01-27",
    "thumbnail": "/images/image.jpg",
    "type": "post"
}
```

### Troubleshooting Guides (`type: "guide"`)

Rich cards with problem statements, difficulty badges, and tags.

```json
{
    "slug": "2025-01-27-fixing-issue",
    "title": "Fixing Common Issue",
    "description": "SEO description",
    "date": "2025-01-27",
    "thumbnail": "/images/image.jpg",
    "type": "guide",
    "problem": "Brief description of what this guide solves",
    "difficulty": "Beginner",
    "tags": ["LED", "Circuit", "Debugging"]
}
```

See [TROUBLESHOOTING-GUIDE.md](TROUBLESHOOTING-GUIDE.md) for detailed guide writing instructions.

## Customization

### Change Domain

1. Update `CONFIG.siteUrl` in `generate-seo.js`
2. Update all URLs in `index.html` meta tags
3. Run `node generate-seo.js` to regenerate files

See [DOMAIN-SETUP.md](DOMAIN-SETUP.md) for complete instructions.

### Change Colors

Edit CSS custom properties in `tokens-base.css` and `tokens-semantic.css`.

### Change Site Title

1. Update `<title>` in `index.html`
2. Update site title in `generate-seo.js`
3. Update header in `script.js` (search for "Building Toby Nitro")

## Development

### Debug Mode

Set `CONFIG.debug = true` in `script.js` for verbose logging and post validation.

### Local Server

```bash
# Python
python -m http.server 8000

# Node.js
npx serve

# Open http://localhost:8000
```

### Validation

```bash
node validate-posts.js
```

Checks for:
- Valid JSON syntax
- Required fields
- Missing markdown files
- Guide-specific field requirements
- SEO issues

## Deployment

### GitHub Pages

1. Push to GitHub
2. Settings → Pages → Deploy from branch `main`
3. Configure custom domain (optional)

### Netlify

1. Connect GitHub repo
2. Build command: (leave empty)
3. Publish directory: `.`
4. Auto-deploys on every push

### Other Hosts

Any static hosting works:
- Vercel
- Cloudflare Pages
- AWS S3 + CloudFront
- Your own server (just serve the files)

## Architecture

### CSS Token System

Three-tier architecture:
1. **Base tokens** (`tokens-base.css`) - Raw values (colors, spacing)
2. **Semantic tokens** (`tokens-semantic.css`) - Contextual names (--color-text, --color-link)
3. **Component tokens** - Component-specific styles

Automatic dark mode via `data-theme` attribute.

### JavaScript Engine

- **Zero dependencies** - Custom markdown parser (~100 lines)
- **Hash-based routing** - URLs like `#post-slug`
- **Client-side rendering** - Fetches markdown, parses, displays
- **Tab system** - localStorage persistence for active tab

### SEO Strategy

- Dynamic meta tags per page
- Open Graph and Twitter Cards
- JSON-LD structured data
- Automatic sitemap generation
- Enhanced RSS feed with full content
- AI crawler allowlisting (GPTBot, ClaudeBot)

See [SEO-GUIDE.md](SEO-GUIDE.md) for optimization details.

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Uses ES6+ features (const, arrow functions, async/await)

## License

Do whatever you want with this code.

## Documentation

- [QUICK-START.md](QUICK-START.md) - Fast publishing workflow
- [SEO-GUIDE.md](SEO-GUIDE.md) - SEO best practices and measurement
- [TROUBLESHOOTING-GUIDE.md](TROUBLESHOOTING-GUIDE.md) - Writing effective guides
- [DOMAIN-SETUP.md](DOMAIN-SETUP.md) - Changing your domain name
