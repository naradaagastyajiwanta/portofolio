# Blog Webhook API Documentation

Complete API reference for automating blog post creation and management.

---

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
  - [Create Blog Post](#create-blog-post)
  - [Update Blog Post](#update-blog-post)
  - [Health Check](#health-check)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Code Examples](#code-examples)
- [Webhooks Guide](#webhooks-guide)
- [Security](#security)
- [Changelog](#changelog)

---

## Overview

The Blog Webhook API provides a simple RESTful interface for creating and managing blog posts programmatically. This is ideal for:

- **Automated publishing** from external systems
- **Bulk imports** from other platforms
- **Scheduled posts** via cron jobs
- **AI-generated content** integration
- **Newsletter to blog** conversion
- **Documentation sync** from code repositories

**Base URL:** `http://localhost:3001` (or your configured `API_URL`)

**API Version:** v1.0.0

---

## Authentication

All webhook endpoints require Bearer token authentication using an API token.

### Getting an API Token

1. Navigate to Admin Panel → API Tokens
2. Click "New Token"
3. Provide a descriptive name
4. Copy the generated token immediately (format: `pk_***...`)

**⚠️ Important:** Store your API token securely. You won't be able to see it again after creation.

### Using the Token

Include the token in the `Authorization` header:

```http
Authorization: Bearer pk_your_token_here
```

### Token Scopes

API tokens support scope-based permissions:

| Scope | Description |
|-------|-------------|
| `blog:write` | Create and update blog posts |

### Token Management

- **View tokens:** Admin Panel → API Tokens
- **Deactivate token:** Toggle button in admin panel
- **Delete token:** Delete button in admin panel
- **Check last used:** View timestamp in admin panel

---

## API Endpoints

### Create Blog Post

Creates a new blog post.

**Endpoint:** `POST /api/webhook/blog`

**Authentication:** Required (`blog:write` scope)

**Request Headers:**
```http
Authorization: Bearer pk_your_token_here
Content-Type: application/json
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | ✅ Yes | Blog post title |
| `content` | string | ✅ Yes | Markdown content |
| `excerpt` | string | ❌ No | Short summary (auto-generated if omitted) |
| `coverImage` | string | ❌ No | Cover image URL |
| `status` | string | ❌ No | `draft` or `published` (default: `draft`) |
| `tags` | string[] | ❌ No | Array of tag names |
| `publishedAt` | string | ❌ No | ISO 8601 datetime for custom publish date |

**Example Request:**

```bash
curl -X POST http://localhost:3001/api/webhook/blog \
  -H "Authorization: Bearer pk_your_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Getting Started with TypeScript",
    "content": "# Introduction\n\nTypeScript is a typed superset of JavaScript...",
    "excerpt": "Learn the basics of TypeScript and how to get started",
    "status": "published",
    "tags": ["Tutorial", "TypeScript", "Web Development"],
    "coverImage": "https://example.com/typescript-cover.jpg"
  }'
```

**Response (200 OK):**

```json
{
  "success": true,
  "post": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "slug": "getting-started-with-typescript",
    "title": "Getting Started with TypeScript",
    "status": "published",
    "url": "http://localhost:3000/blog/getting-started-with-typescript",
    "publishedAt": "2026-03-08T10:30:00.000Z",
    "tags": ["Tutorial", "TypeScript", "Web Development"]
  }
}
```

**Error Responses:**

| Code | Description |
|------|-------------|
| 400 | Missing required fields (title, content) |
| 401 | Invalid or expired API token |
| 403 | Insufficient permissions (wrong scope) |

---

### Update Blog Post

Updates an existing blog post by slug.

**Endpoint:** `PATCH /api/webhook/blog/:slug`

**Authentication:** Required (`blog:write` scope)

**Request Headers:**
```http
Authorization: Bearer pk_your_token_here
Content-Type: application/json
```

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | ✅ Yes | Blog post slug |

**Request Body:** (all fields optional)

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Updated title |
| `content` | string | Updated markdown content |
| `excerpt` | string | Updated excerpt |
| `coverImage` | string | Updated cover image URL |
| `status` | string | `draft`, `published`, or `archived` |
| `tags` | string[] | Updated tag names (replaces existing) |

**Example Request:**

```bash
curl -X PATCH http://localhost:3001/api/webhook/blog/getting-started-with-typescript \
  -H "Authorization: Bearer pk_your_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Getting Started with TypeScript - Updated",
    "status": "published",
    "tags": ["Tutorial", "TypeScript", "Updated"]
  }'
```

**Response (200 OK):**

```json
{
  "success": true,
  "post": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "slug": "getting-started-with-typescript",
    "title": "Getting Started with TypeScript - Updated",
    "status": "published",
    "url": "http://localhost:3000/blog/getting-started-with-typescript",
    "tags": ["Tutorial", "TypeScript", "Updated"]
  }
}
```

**Error Responses:**

| Code | Description |
|------|-------------|
| 400 | Invalid request data |
| 401 | Invalid or expired API token |
| 403 | Insufficient permissions |
| 404 | Post not found |

---

### Health Check

Check if the webhook API is operational.

**Endpoint:** `GET /api/webhook/health`

**Authentication:** Not required

**Example Request:**

```bash
curl http://localhost:3001/api/webhook/health
```

**Response (200 OK):**

```json
{
  "status": "ok",
  "timestamp": "2026-03-08T10:30:00.000Z",
  "version": "1.0.0"
}
```

---

## Error Handling

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

### Common Errors

| Status Code | Error | Description | Solution |
|-------------|-------|-------------|-----------|
| 400 | `Title and content are required` | Missing required fields | Include `title` and `content` in request body |
| 401 | `Missing or invalid authorization header` | No token provided | Include `Authorization: Bearer pk_...` header |
| 401 | `Invalid API token` | Token doesn't exist | Check your API token |
| 401 | `API token is inactive` | Token has been deactivated | Reactivate token in admin panel |
| 401 | `API token has expired` | Token past expiration date | Generate new token |
| 403 | `Insufficient permissions` | Missing required scope | Ensure token has `blog:write` scope |
| 404 | `Post not found` | Slug doesn't exist | Verify slug is correct |

### Error Response Examples

```json
{
  "error": "Title and content are required"
}
```

```json
{
  "error": "Invalid API token"
}
```

---

## Rate Limiting

Currently, there are no rate limits enforced on webhook endpoints. However, best practices include:

- Implement exponential backoff for retries
- Cache successful responses
- Monitor API usage in admin panel

**Future implementations may include:**
- 100 requests per minute per token
- 1000 requests per hour per token

---

## Code Examples

### Python

#### Create Blog Post

```python
import requests
import os
from datetime import datetime

API_URL = os.getenv("API_URL", "http://localhost:3001")
API_TOKEN = os.getenv("API_TOKEN")

class BlogWebhookClient:
    """Client for Blog Webhook API"""

    def __init__(self, api_url, api_token):
        self.api_url = api_url
        self.headers = {
            "Authorization": f"Bearer {api_token}",
            "Content-Type": "application/json"
        }

    def create_post(self, title, content, **options):
        """Create a new blog post"""
        url = f"{self.api_url}/api/webhook/blog"

        payload = {
            "title": title,
            "content": content,
            **options
        }

        response = requests.post(url, headers=self.headers, json=payload)
        response.raise_for_status()
        return response.json()

    def update_post(self, slug, **options):
        """Update an existing blog post"""
        url = f"{self.api_url}/api/webhook/blog/{slug}"

        response = requests.patch(url, headers=self.headers, json=options)
        response.raise_for_status()
        return response.json()

# Usage
client = BlogWebhookClient(API_URL, API_TOKEN)

# Create post
post = client.create_post(
    title="My Automated Post",
    content="# Hello World\n\nThis is **automated** content!",
    status="published",
    tags=["Automation", "Python"]
)

print(f"✅ Post created: {post['post']['url']}")

# Update post
client.update_post(
    slug="my-automated-post",
    title="Updated Title"
)
```

#### Batch Import

```python
import requests
import json

API_URL = "http://localhost:3001"
API_TOKEN = "pk_your_token_here"

def import_posts_from_file(filepath):
    """Import multiple posts from JSON file"""
    with open(filepath) as f:
        posts = json.load(f)

    headers = {
        "Authorization": f"Bearer {API_TOKEN}",
        "Content-Type": "application/json"
    }

    for post_data in posts:
        response = requests.post(
            f"{API_URL}/api/webhook/blog",
            headers=headers,
            json=post_data
        )

        if response.status_code == 200:
            result = response.json()
            print(f"✅ Created: {result['post']['title']}")
        else:
            print(f"❌ Failed: {post_data.get('title', 'Unknown')}")

# Example JSON file format:
# [
#   {
#     "title": "First Post",
#     "content": "...",
#     "status": "published",
#     "tags": ["Tag1", "Tag2"]
#   },
#   {
#     "title": "Second Post",
#     "content": "...",
#     "status": "draft"
#   }
# ]
```

### Node.js

#### Create Blog Post

```javascript
const axios = require('axios');

class BlogWebhookClient {
    constructor(apiUrl, apiToken) {
        this.apiUrl = apiUrl;
        this.headers = {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
        };
    }

    async createPost(title, content, options = {}) {
        const response = await axios.post(
            `${this.apiUrl}/api/webhook/blog`,
            {
                title,
                content,
                ...options
            },
            { headers: this.headers }
        );
        return response.data;
    }

    async updatePost(slug, options = {}) {
        const response = await axios.patch(
            `${this.apiUrl}/api/webhook/blog/${slug}`,
            options,
            { headers: this.headers }
        );
        return response.data;
    }
}

// Usage
const client = new BlogWebhookClient(
    process.env.API_URL || 'http://localhost:3001',
    process.env.API_TOKEN
);

(async () => {
    try {
        // Create post
        const post = await client.createPost(
            'My Automated Post',
            '# Hello World\n\nThis is **automated** content!',
            {
                status: 'published',
                tags: ['Automation', 'Node.js'],
                excerpt: 'A post created via webhook API'
            }
        );

        console.log(`✅ Post created: ${post.post.url}`);

        // Update post
        await client.updatePost('my-automated-post', {
            title: 'Updated Title'
        });

        console.log('✅ Post updated');
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
})();
```

#### Express.js Integration

```javascript
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const BLOG_API_URL = process.env.BLOG_API_URL;
const BLOG_API_TOKEN = process.env.BLOG_API_TOKEN;

// Webhook endpoint that receives data from external service
app.post('/webhook/external', async (req, res) => {
    try {
        const { title, content, tags } = req.body;

        // Forward to blog API
        const response = await axios.post(
            `${BLOG_API_URL}/api/webhook/blog`,
            {
                title,
                content,
                status: 'published',
                tags: tags || []
            },
            {
                headers: {
                    'Authorization': `Bearer ${BLOG_API_TOKEN}`
                }
            }
        );

        res.status(200).json({
            success: true,
            blogUrl: response.data.post.url
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

app.listen(3000, () => {
    console.log('Proxy server running on port 3000');
});
```

### cURL

#### Create Blog Post

```bash
#!/bin/bash

API_URL="http://localhost:3001"
API_TOKEN="pk_your_token_here"

# Create published post
curl -X POST "${API_URL}/api/webhook/blog" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Post from cURL",
    "content": "# Hello from cURL\n\nThis post was created using cURL!",
    "status": "published",
    "tags": ["cURL", "Automation"]
  }'
```

#### Create Draft Post

```bash
curl -X POST "${API_URL}/api/webhook/blog" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Draft Post",
    "content": "This is a draft post",
    "status": "draft"
  }'
```

#### Update Post

```bash
curl -X PATCH "${API_URL}/api/webhook/blog/post-from-curl" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "status": "published"
  }'
```

### Go

```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "os"
)

type BlogClient struct {
    APIURL  string
    APIToken string
    Client  *http.Client
}

type CreatePostRequest struct {
    Title      string   `json:"title"`
    Content    string   `json:"content"`
    Excerpt    string   `json:"excerpt,omitempty"`
    CoverImage string   `json:"coverImage,omitempty"`
    Status     string   `json:"status,omitempty"`
    Tags       []string `json:"tags,omitempty"`
}

type CreatePostResponse struct {
    Success bool `json:"success"`
    Post    struct {
        ID         string   `json:"id"`
        Slug       string   `json:"slug"`
        Title      string   `json:"title"`
        Status     string   `json:"status"`
        URL        string   `json:"url"`
        PublishedAt string   `json:"publishedAt,omitempty"`
        Tags       []string `json:"tags"`
    } `json:"post"`
}

func NewBlogClient(apiURL, apiToken string) *BlogClient {
    return &BlogClient{
        APIURL:  apiURL,
        APIToken: apiToken,
        Client:  &http.Client{},
    }
}

func (c *BlogClient) CreatePost(req CreatePostRequest) (*CreatePostResponse, error) {
    body, err := json.Marshal(req)
    if err != nil {
        return nil, err
    }

    httpReq, err := http.NewRequest("POST", c.APIURL+"/api/webhook/blog", bytes.NewBuffer(body))
    if err != nil {
        return nil, err
    }

    httpReq.Header.Set("Authorization", "Bearer "+c.APIToken)
    httpReq.Header.Set("Content-Type", "application/json")

    resp, err := c.Client.Do(httpReq)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        body, _ := io.ReadAll(resp.Body)
        return nil, fmt.Errorf("API error: %s", string(body))
    }

    var result CreatePostResponse
    if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
        return nil, err
    }

    return &result, nil
}

func main() {
    client := NewBlogClient(
        os.Getenv("API_URL"),
        os.Getenv("API_TOKEN"),
    )

    post, err := client.CreatePost(CreatePostRequest{
        Title:   "Post from Go",
        Content: "# Hello from Go\n\nThis post was created using Go!",
        Status:  "published",
        Tags:    []string{"Go", "Automation"},
    })

    if err != nil {
        fmt.Printf("Error: %v\n", err)
        return
    }

    fmt.Printf("✅ Post created: %s\n", post.Post.URL)
}
```

---

## Webhooks Guide

### GitHub Actions

Auto-publish blog posts when markdown files are pushed to repository.

**`.github/workflows/auto-publish.yml`**

```yaml
name: Auto Publish Blog Posts

on:
  push:
    branches: [main]
    paths:
      - 'blog-posts/**/*.md'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          pip install requests python-frontmatter

      - name: Publish to blog
        env:
          API_URL: ${{ secrets.API_URL }}
          API_TOKEN: ${{ secrets.API_TOKEN }}
        run: |
          python scripts/publish_blog.py

      - name: Commit updated slugs
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add blog-posts/
          git diff --quiet && git diff --staged --quiet || git commit -m "Add post slugs"
          git push
```

**`scripts/publish_blog.py`**

```python
import os
import requests
import frontmatter
from pathlib import Path

API_URL = os.getenv("API_URL")
API_TOKEN = os.getenv("API_TOKEN")

def publish_post(filepath):
    """Read markdown file and publish to blog"""

    # Parse frontmatter and content
    with open(filepath) as f:
        post = frontmatter.load(f)

    # Extract metadata
    metadata = post.metadata
    title = metadata.get('title', filepath.stem)
    content = post.content
    tags = metadata.get('tags', [])
    status = metadata.get('status', 'draft')
    excerpt = metadata.get('excerpt')

    # Create post via API
    response = requests.post(
        f"{API_URL}/api/webhook/blog",
        headers={"Authorization": f"Bearer {API_TOKEN}"},
        json={
            "title": title,
            "content": content,
            "excerpt": excerpt,
            "status": status,
            "tags": tags
        }
    )

    if response.status_code == 200:
        result = response.json()
        # Add slug to frontmatter
        metadata['slug'] = result['post']['slug']
        metadata['url'] = result['post']['url']

        with open(filepath, 'w') as f:
            f.write(frontmatter.dumps(frontmatter.Post(content, **metadata)))

        print(f"✅ Published: {title}")
    else:
        print(f"❌ Failed: {title}")

# Process all markdown files
posts_dir = Path("blog-posts")
for md_file in posts_dir.glob("**/*.md"):
    # Skip if already published (has slug)
    with open(md_file) as f:
        if frontmatter.load(f).metadata.get('slug'):
            continue

    publish_post(md_file)
```

### Cron Jobs

Schedule posts to be published automatically.

**`scripts/scheduled_posts.sh`**

```bash
#!/bin/bash

API_URL="http://localhost:3001"
API_TOKEN="pk_your_token_here"

# Read scheduled posts from database/file
# For this example, we'll use a JSON file

SCHEDULED_FILE="scheduled_posts.json"

# Get current date
CURRENT_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Read and process scheduled posts
jq -c '.[]' "$SCHEDULED_FILE" | while read -r post; do
    SCHEDULE_DATE=$(echo "$post" | jq -r '.scheduledFor')

    if [[ "$SCHEDULE_DATE" < "$CURRENT_DATE" ]]; then
        # Post should be published now
        TITLE=$(echo "$post" | jq -r '.title')
        CONTENT=$(echo "$post" | jq -r '.content')
        TAGS=$(echo "$post" | jq -r '.tags | join(",")')

        curl -X POST "${API_URL}/api/webhook/blog" \
            -H "Authorization: Bearer ${API_TOKEN}" \
            -H "Content-Type: application/json" \
            -d "{
                \"title\": \"$TITLE\",
                \"content\": \"$CONTENT\",
                \"status\": \"published\",
                \"tags\": [\"$TAGS\"]
            }"

        echo "✅ Published scheduled post: $TITLE"

        # Remove from scheduled file
        jq "del(.[] | select(.title==\"$TITLE\"))" "$SCHEDULED_FILE" > temp.json
        mv temp.json "$SCHEDULED_FILE"
    fi
done
```

**Add to crontab:**
```bash
# Run every hour
0 * * * * /path/to/scripts/scheduled_posts.sh
```

### IFTTT/Zapier Integration

Use webhook as action in automation platforms.

**Zapier Webhook Configuration:**

1. **Trigger:** New RSS item, New email, etc.
2. **Action:** Webhooks - POST
3. **URL:** `http://your-domain.com/api/webhook/blog`
4. **Headers:**
   ```
   Authorization: Bearer pk_your_token_here
   Content-Type: application/json
   ```
5. **Payload:**
   ```json
   {
     "title": "{{Trigger_Title}}",
     "content": "{{Trigger_Body}}",
     "status": "published",
     "tags": ["Automation", "Zapier"]
   }
   ```

### Custom CMS Integration

**WordPress to Blog Migration**

```python
import requests
from wordpress_xmlrpc import Client, posts
from wordpress_xmlrpc.methods.posts import GetPosts

WP_URL = "https://your-wordpress-site.com/xmlrpc.php"
WP_USER = "username"
WP_PASS = "password"

BLOG_API_URL = "http://localhost:3001"
BLOG_API_TOKEN = "pk_your_token_here"

def migrate_from_wordpress():
    """Migrate posts from WordPress to blog"""

    # Connect to WordPress
    wp = Client(WP_URL, WP_USER, WP_PASS)

    # Fetch all published posts
    wp_posts = wp.call(GetPosts({'post_status': 'publish'}))

    for wp_post in wp_posts:
        # Convert WordPress post to blog format
        blog_post = {
            'title': wp_post.title,
            'content': wp_post.content,
            'excerpt': wp_post.excerpt,
            'status': 'published',
            'tags': [tag.name for tag in wp_post.terms],
            'publishedAt': wp_post.date.isoformat()
        }

        # Create via API
        response = requests.post(
            f"{BLOG_API_URL}/api/webhook/blog",
            headers={"Authorization": f"Bearer {BLOG_API_TOKEN}"},
            json=blog_post
        )

        if response.status_code == 200:
            print(f"✅ Migrated: {wp_post.title}")
        else:
            print(f"❌ Failed: {wp_post.title}")

if __name__ == "__main__":
    migrate_from_wordpress()
```

---

## Security

### Best Practices

1. **Never expose API tokens**
   - Don't commit tokens to version control
   - Use environment variables
   - Add `.env` to `.gitignore`

2. **Use HTTPS in production**
   - Always use HTTPS for API calls
   - Certificates prevent token interception

3. **Implement token rotation**
   - Regularly generate new tokens
   - Delete old/unused tokens
   - Set expiration dates on sensitive tokens

4. **Monitor usage**
   - Check "Last used" timestamps
   - Investigate suspicious activity
   - Set up alerts for unusual patterns

5. **Scope limitations**
   - Only grant necessary scopes
   - Create separate tokens for different uses
   - Use `blog:read` for read-only operations (when available)

### Environment Configuration

**`.env` file**
```bash
API_URL=https://your-domain.com
API_TOKEN=pk_your_token_here
```

**`.gitignore`**
```
.env
.env.local
.env.production
```

### Example `.env` Template

**`.env.example`**
```bash
# API Configuration
API_URL=http://localhost:3001
API_TOKEN=

# Optional: Custom headers
API_USER_AGENT=MyBlogBot/1.0
```

---

## Changelog

### Version 1.0.0 (2026-03-08)

**Added:**
- Create blog post endpoint (`POST /api/webhook/blog`)
- Update blog post endpoint (`PATCH /api/webhook/blog/:slug`)
- Health check endpoint (`GET /api/webhook/health`)
- API token management system
- Scope-based permissions (`blog:write`)
- Token expiration and deactivation
- Admin panel for token management

**Planned:**
- Delete blog post endpoint
- Bulk operations (create multiple posts)
- Blog post retrieval endpoint
- Media upload endpoint
- Rate limiting
- Webhook notifications
- `blog:read` scope for read-only access

---

## Support

For issues or questions:

1. **Check this documentation** - Most answers are here
2. **Verify API token status** - Admin Panel → API Tokens
3. **Review error messages** - They provide specific guidance
4. **Check server logs** - Detailed error information available

### Common Issues

**"Invalid API token"**
- Verify token is copied correctly
- Check token hasn't been deleted or deactivated
- Ensure token hasn't expired

**"Missing or invalid authorization header"**
- Include `Authorization: Bearer pk_...` header
- Check for typos in token
- Verify header format exactly

**"Title and content are required"**
- Ensure both `title` and `content` fields are present
- Check JSON formatting
- Verify fields are not empty strings

**"Post not found" (when updating)**
- Verify slug is correct
- Check post exists and wasn't deleted
- Slug is case-sensitive

---

## License

This API is part of your portfolio website. Use according to your project's license terms.

---

**Last Updated:** 2026-03-08
**API Version:** 1.0.0
**Documentation Version:** 1.0.0
