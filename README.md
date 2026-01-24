# Toby Nitro's Blog

A zero-dependency, self-hosted blog engine in a single HTML file.

## Quick Start

```
your-blog/
├── index.html      ← The entire engine (edit CSS here)
├── posts.json      ← List of your posts
├── posts/          ← Your markdown files
│   ├── 2025-01-23-hello-world.md
│   └── 2025-01-22-why-i-built-this.md
└── README.md       ← You're reading it
```

---

## How to Write a Post

### 1. Create a markdown file

Create a new `.md` file in the `/posts` folder.

**Naming convention:** `YYYY-MM-DD-slug-name.md`

Example: `posts/2025-01-24-my-new-post.md`

```markdown
# My New Post

Write your content here using markdown.

## Subheadings work

So do **bold**, *italic*, and [links](https://example.com).

- Lists
- Work
- Too

And code blocks:

```javascript
const x = 1;
```

> Blockquotes as well.
```

### 2. Add to posts.json

Open `posts.json` and add your post to the **top** of the array:

```json
[
    {
        "slug": "2025-01-24-my-new-post",
        "title": "My New Post",
        "date": "2025-01-24"
    },
    {
        "slug": "2025-01-23-hello-world",
        "title": "Hello World",
        "date": "2025-01-23"
    }
]
```

**Important:**
- `slug` must match the filename (without `.md`)
- `date` is in `YYYY-MM-DD` format
- Newest posts go at the top (or anywhere — it auto-sorts by date)

### 3. Push to deploy

```bash
git add .
git commit -m "New post: My New Post"
git push
```

That's it. Netlify will automatically deploy.

---

## How to Deploy to Netlify

### First-time setup

1. **Create a GitHub repo**
   ```bash
   cd your-blog
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Push to GitHub**
   - Create a new repo on github.com
   - Follow their instructions to push your local repo

3. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com) and sign up/log in
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub account
   - Select your blog repo
   - Deploy settings:
     - Build command: (leave empty)
     - Publish directory: (leave empty or `.`)
   - Click "Deploy"

4. **Set up your custom domain**
   - In Netlify: Site settings → Domain management → Add custom domain
   - Add `tobynitro.com`
   - Follow Netlify's instructions to update your DNS

### After setup

Every time you `git push`, Netlify automatically deploys your changes. Usually takes 5-10 seconds.

---

## How to Customise

### Change colors and fonts

Open `index.html` and find the `:root` CSS variables near the top:

```css
:root {
    --color-bg: #ffffff;           /* Page background */
    --color-text: #1a1a1a;         /* Main text */
    --color-link: #0066cc;         /* Links */
    --content-width: 600px;        /* Content width */
    /* ... more variables ... */
}
```

Change these values to restyle the entire site.

### Change the header/logo

Find this section in the HTML:

```html
<header class="site-header">
    <div class="site-logo">⚡</div>
    <a href="/" class="site-title">Toby Nitro</a>
    <p class="site-tagline">Daily thoughts and experiments</p>
</header>
```

Options:
- Change the emoji: Replace `⚡` with any emoji
- Use an image: Replace with `<img src="/logo.png" alt="Logo" class="site-logo">`
- Text only: Delete the `site-logo` div entirely

### Enable dark mode

Find this commented block in the CSS and uncomment it:

```css
@media (prefers-color-scheme: dark) {
    :root {
        --color-bg: #1a1a1a;
        --color-text: #e0e0e0;
        /* ... */
    }
}
```

This automatically switches to dark mode based on the user's system preference.

### Change the favicon

Find this line in the `<head>`:

```html
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>">
```

Options:
- Change the emoji in the SVG
- Use a file: `<link rel="icon" href="/favicon.ico">`

---

## Markdown Cheatsheet

| What you write | What you get |
|----------------|--------------|
| `# Heading 1` | Big heading |
| `## Heading 2` | Medium heading |
| `**bold**` | **bold** |
| `*italic*` | *italic* |
| `[link](url)` | Clickable link |
| `![alt](image.jpg)` | Image |
| `` `code` `` | Inline code |
| ` ``` code block ``` ` | Code block |
| `> quote` | Blockquote |
| `- item` | Bullet list |
| `1. item` | Numbered list |
| `---` | Horizontal line |

---

## File Structure Explained

```
index.html
├── <head>
│   └── All CSS (easily editable variables at top)
│
├── <body>
│   ├── Header (logo, title, tagline)
│   ├── Main content area (populated by JS)
│   └── Footer
│
└── <script>
    ├── Markdown parser (tiny, handles common syntax)
    ├── Router (reads URL hash to show right content)
    └── Renderer (turns posts into HTML)

posts.json
└── Array of {slug, title, date} objects

posts/
└── Your .md files (one per post)
```

---

## Troubleshooting

**Post not showing up?**
- Check the slug in `posts.json` matches the filename exactly
- Make sure the date format is `YYYY-MM-DD`
- Check for JSON syntax errors (trailing commas, missing quotes)

**Styles not updating?**
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Check browser dev tools for CSS errors

**Site not deploying?**
- Check Netlify deploy logs for errors
- Make sure your GitHub repo is connected

---

## Why No Build Step?

Modern browsers can do a lot. This blog:
- Parses markdown in the browser (< 100 lines of JS)
- Uses CSS variables for theming (no Sass needed)
- Routes via URL hash (no server needed)

The result: a blog you fully understand and control, with zero dependencies that could break, update, or disappear.

---

## License

Do whatever you want with this. It's just HTML.
