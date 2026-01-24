# Why I Built This Blog

I've tried every blogging platform. WordPress felt like overkill. Medium took ownership of my words. Ghost was nice but still more than I needed.

All I wanted was to write a daily post.

## The Requirements

1. Write in markdown (not some proprietary editor)
2. Full control over the design
3. No database
4. No build step
5. Host it myself

## The Solution

A single `index.html` file that:

- Reads a list of posts from `posts.json`
- Fetches markdown files from a `/posts` folder  
- Parses and renders them in the browser

That's the entire "engine". About 300 lines of commented code.

## The Workflow

```
1. Write a .md file
2. Add one line to posts.json
3. git push
```

Netlify picks up the changes automatically. The site rebuilds in seconds.

No webpack. No npm install. No waiting.

Just words on a page, the way it should be.
