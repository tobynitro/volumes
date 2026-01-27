# Domain Configuration

If your domain is **not** `tobynitro.com`, follow these steps to update all references.

## Files to Update

### 1. index.html
Update these meta tags (around lines 13-32):
```html
<link rel="canonical" href="https://YOUR-DOMAIN.com/">
<meta property="og:url" content="https://YOUR-DOMAIN.com/">
<meta property="og:image" content="https://YOUR-DOMAIN.com/og-image.jpg">
<meta name="twitter:url" content="https://YOUR-DOMAIN.com/">
<meta name="twitter:image" content="https://YOUR-DOMAIN.com/og-image.jpg">
```

### 2. generate-seo.js
Update the CONFIG object (around line 17):
```javascript
const CONFIG = {
    siteUrl: 'https://YOUR-DOMAIN.com',  // ← Change this
    siteName: 'Building Toby Nitro',
    // ... rest of config
};
```

### 3. Regenerate SEO Files
After updating the above files, regenerate your SEO files:
```bash
node generate-seo.js
```

This will update:
- `sitemap.xml`
- `feed.xml`

### 4. robots.txt (optional)
If you changed domains, update line 11:
```
Sitemap: https://YOUR-DOMAIN.com/sitemap.xml
```

## DNS Setup

### If Using GitHub Pages
1. Add a `CNAME` file in the root directory:
```
your-domain.com
```

2. In your DNS provider, add a CNAME record:
```
Type: CNAME
Name: www (or @)
Value: yourusername.github.io
```

### If Using Custom Hosting
Point your domain's A record to your hosting provider's IP address.

## SSL Certificate
Make sure HTTPS is enabled. Most hosts provide free SSL via Let's Encrypt.

## Verification After Domain Change

1. **Test the site**: Visit your new domain
2. **Check sitemap**: Go to `https://your-domain.com/sitemap.xml`
3. **Check robots.txt**: Go to `https://your-domain.com/robots.txt`
4. **Test RSS feed**: Go to `https://your-domain.com/feed.xml`
5. **Verify Open Graph**: Use [opengraph.xyz](https://www.opengraph.xyz)
6. **Check social sharing**: Share a link on Twitter/Facebook

## Submit to Search Engines

### Google Search Console
1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add your new domain as a property
3. Verify ownership (use HTML tag method)
4. Submit sitemap: `https://your-domain.com/sitemap.xml`

### Bing Webmaster Tools
1. Go to [bing.com/webmasters](https://www.bing.com/webmasters)
2. Add your site
3. Verify ownership
4. Submit sitemap

## Migration from Old Domain?

If you're moving from an old domain:

1. Set up 301 redirects on the old domain
2. Update all internal links
3. Notify search engines of the change in Google Search Console
4. Keep old domain redirecting for at least 6 months

## Current Domain: tobynitro.com

If you're using `tobynitro.com`, everything is already configured! No changes needed.
