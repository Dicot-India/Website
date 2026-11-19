# Adding a blog post

The blog at `/blog/` is plain HTML, CSS and JavaScript. It reads one JSON file at
`public/blog/posts.json` in the browser. **Add a post, upload the JSON file, and the blog
updates without a rebuild.**

## Add a post

Each post is one object in the `posts.json` array. Copy this template and paste it as a new
object at the top of the array:

```json
{
  "slug": "my-new-post",
  "title": "A title that says what the article is about",
  "date": "2026-11-19",
  "author": "Dicot Innovations",
  "excerpt": "One or two sentences shown on the blog card and in search results.",
  "tags": ["Vision C", "Tips"],
  "cover": "/images/vision-c.png",
  "coverAlt": "Description of the cover image",
  "content": "<p>Use simple HTML: paragraphs, h2, h3, ul/li, strong and links.</p>"
}
```

- `slug` is the post ID: `/blog/?post=my-new-post` (lowercase, hyphens only). Links use this
  query form so they work on any static host without a server rewrite.
- `date` must be `YYYY-MM-DD`. Newest dates are shown first.
- `cover` is optional. Leave it out for a navy placeholder tile.
- `content` is HTML. Use double quotes around the JSON value and single quotes inside HTML
  attributes, or escape the double quotes with `\"`.
- Keep at least one comma between objects and no trailing comma after the last one.
- Validate the file with any JSON linter before uploading if unsure.

## Deploy on Hostinger

Upload `public/blog/posts.json` to `public_html/blog/posts.json` after every change. Cards link
to `/blog/?post=<slug>`, which works on any static host. The `.htaccess` file also rewrites
clean `/blog/<slug>/` URLs to the blog page if you prefer to share those.

The blog cards and article text are rendered in the browser, but the page shell, title and
metadata are normal static HTML. Google's crawler renders the JavaScript. If you need article
pages in `sitemap.xml`, add them by hand to a static sitemap entry; the blog itself is already
in the generated sitemap at `/blog/`.

## Starter posts

The two posts in `posts.json` are factual product notes written from the existing site copy.
Edit or delete them freely.
