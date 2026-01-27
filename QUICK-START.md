# Quick Start: Publishing a New Post

## 3-Minute Workflow

### 1. Write Your Post
Create a new file in the `posts/` directory:
```
posts/2025-01-27-your-topic-slug.md
```

### 2. Add to posts.json

**For a regular blog post:**
```json
{
    "slug": "2025-01-27-your-topic-slug",
    "title": "Your Compelling Title Here",
    "description": "SEO-friendly description 150-160 characters that includes your main keyword and tells readers what they'll learn.",
    "date": "2025-01-27",
    "thumbnail": "/images/your-image.jpg",
    "type": "post"
}
```

**For a troubleshooting guide:**
```json
{
    "slug": "2025-01-27-fixing-something",
    "title": "Short Problem Title",
    "description": "Brief description for SEO.",
    "date": "2025-01-27",
    "thumbnail": "/images/your-image.jpg",
    "type": "guide",
    "problem": "Detailed description of the problem this guide solves",
    "difficulty": "Beginner",
    "tags": ["Tag1", "Tag2", "Tag3"]
}
```

**Guide fields:**
- `type: "guide"` - Required to show as card in Troubleshooting tab
- `problem` - Brief description of what problem this solves (shown on card)
- `difficulty` - "Beginner", "Intermediate", or "Advanced" (color-coded badge)
- `tags` - Array of relevant tags (shown as chips on card)

### 3. Validate (Optional but Recommended)
```bash
node validate-posts.js
```
This checks for missing files, required fields, and common issues.

### 4. Generate SEO Files
```bash
node generate-seo.js
```

### 5. Preview Locally
Start a local server:
```bash
python -m http.server 8000
# or: npx serve
```
Then open http://localhost:8000 and verify:
- Post appears in list
- Post loads correctly when clicked
- Images display properly
- Links work

### 6. Deploy
```bash
git add .
git commit -m "Add post: Your Title"
git push
```

## Writing Tips

### Title Formula
```
[Action Verb] + [Topic] + [Benefit/Context]

Examples:
✓ "Understanding MOSFETs: From Basics to Applications"
✓ "Building Your First PCB: A Step-by-Step Guide"
✓ "Debugging I2C Communication Issues"
✗ "Post #7"
✗ "Some thoughts on electronics"
```

### Description Formula
```
[What it covers] + [Who it's for] + [Outcome]

Example:
"Learn how to design LED driver circuits with current limiting.
Perfect for beginners. Includes schematics and component calculations."
```

### Content Structure
```markdown
# Main Title

Brief intro paragraph with the main topic and why it matters.

## Section 1: Background/Basics
Explain foundational concepts needed.

## Section 2: How It Works
Deep dive into the main topic.

## Section 3: Practical Example
Real-world application or tutorial.

## Section 4: Common Pitfalls
What to avoid and troubleshooting.

## Conclusion
Summary and next steps.
```

## Image Checklist

- [ ] Compress images (aim for < 500KB each)
- [ ] Use descriptive filenames: `mosfet-switching-circuit.jpg` not `IMG_1234.jpg`
- [ ] Add descriptive alt text: `![N-channel MOSFET switching circuit with load resistor](image.jpg)`
- [ ] Thumbnail size: 1200x630px for best social sharing

## SEO Checklist

- [ ] Title under 60 characters
- [ ] Description 150-160 characters
- [ ] H1 tag used once (the main title)
- [ ] H2/H3 tags for sections
- [ ] Keywords used naturally (don't stuff!)
- [ ] Internal links to 1-2 related posts
- [ ] Code blocks have language specified: ```python not ```
- [ ] First paragraph contains main keyword

## Common Mistakes to Avoid

1. **Vague titles**: "Understanding Electronics" → "Understanding Pull-Up Resistors in Digital Circuits"
2. **No description**: Always write a unique description for each post
3. **Forgetting to run generate-seo.js**: Your post won't appear in sitemap/RSS
4. **Huge images**: Compress before uploading
5. **No alt text**: Bad for SEO and accessibility
6. **Keyword stuffing**: Write naturally for humans first

## After Publishing

Wait 1-2 days, then:
1. Check Google Search Console for any indexing errors
2. Test social media share preview (use [opengraph.xyz](https://www.opengraph.xyz))
3. Share on relevant communities (Reddit, Hacker News, etc.)

## Need Help?

Read the full [SEO-GUIDE.md](SEO-GUIDE.md) for detailed instructions.
