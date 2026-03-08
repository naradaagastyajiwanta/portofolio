# Blog Webhook API - Quick Start Guide

## Overview
The Blog Webhook API allows you to automatically create and update blog posts from external systems, scripts, or automation tools.

## 🚀 Quick Start

### 1. Generate API Token
1. Go to Admin Panel → API Tokens
2. Click "New Token"
3. Give it a name (e.g., "Blog Automation Script")
4. **Copy the token immediately** - you won't see it again!

### 2. Use the Webhook API

## 📝 API Endpoints

### Create Blog Post
**POST** `/api/webhook/blog`

**Request Headers:**
```http
Authorization: Bearer YOUR_API_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "My Awesome Blog Post",
  "content": "# Introduction\n\nThis is my blog post content in Markdown.\n\n## Features\n- Feature 1\n- Feature 2\n\n## Conclusion\n\nThanks for reading!",
  "excerpt": "A brief summary of the post",
  "status": "published",
  "tags": ["Tutorial", "Web Development"],
  "coverImage": "https://example.com/image.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "post": {
    "id": "uuid",
    "slug": "my-awesome-blog-post",
    "title": "My Awesome Blog Post",
    "status": "published",
    "url": "http://localhost:3000/blog/my-awesome-blog-post",
    "publishedAt": "2026-03-08T10:00:00.000Z",
    "tags": ["Tutorial", "Web Development"]
  }
}
```

### Update Blog Post
**PATCH** `/api/webhook/blog/:slug`

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "status": "published",
  "tags": ["Tutorial", "Updated"]
}
```

## 💻 Code Examples

### Python Example
```python
import requests
import json

API_URL = "http://localhost:3001"
API_TOKEN = "pk_your_token_here"

def create_blog_post(title, content, tags=None, status="draft"):
    """Create a new blog post"""
    url = f"{API_URL}/api/webhook/blog"

    headers = {
        "Authorization": f"Bearer {API_TOKEN}",
        "Content-Type": "application/json"
    }

    data = {
        "title": title,
        "content": content,
        "status": status
    }

    if tags:
        data["tags"] = tags

    response = requests.post(url, headers=headers, json=data)
    return response.json()

# Example usage
post = create_blog_post(
    title="My Automated Post",
    content="# Hello World\n\nThis post was created automatically!",
    tags=["Automation", "Python"],
    status="published"
)

print(f"Post created: {post['post']['url']}")
```

### Node.js Example
```javascript
const axios = require('axios');

const API_URL = 'http://localhost:3001';
const API_TOKEN = 'pk_your_token_here';

async function createBlogPost(title, content, options = {}) {
  const response = await axios.post(`${API_URL}/api/webhook/blog`, {
    title,
    content,
    ...options
  }, {
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  return response.data;
}

// Example usage
(async () => {
  const post = await createBlogPost(
    'My Automated Post',
    '# Hello World\n\nThis post was created automatically!',
    {
      tags: ['Automation', 'Node.js'],
      status: 'published',
      excerpt: 'An automatically created blog post'
    }
  );

  console.log(`Post created: ${post.post.url}`);
})();
```

### cURL Example
```bash
curl -X POST http://localhost:3001/api/webhook/blog \
  -H "Authorization: Bearer pk_your_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Automated Post",
    "content": "# Hello World\n\nThis post was created automatically!",
    "tags": ["Automation", "API"],
    "status": "published"
  }'
```

### GitHub Actions Example
```yaml
name: Auto Publish Blog Post

on:
  push:
    paths:
      - 'posts/new-post.md'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - name: Read post content
        id: read_post
        run: |
          TITLE=$(head -n 1 posts/new-post.md | sed 's/^# //')
          CONTENT=$(cat posts/new-post.md)
          echo "title=$TITLE" >> $GITHUB_OUTPUT
          echo "content<<EOF" >> $GITHUB_OUTPUT
          echo "$CONTENT" >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT

      - name: Publish to blog
        run: |
          curl -X POST ${{ secrets.API_URL }}/api/webhook/blog \
            -H "Authorization: Bearer ${{ secrets.API_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d "{
              \"title\": \"${{ steps.read_post.outputs.title }}\",
              \"content\": \"${{ steps.read_post.outputs.content }}\",
              \"status\": \"published\",
              \"tags\": [\"GitHub Actions\", \"Automation\"]
            }"
```

## 🔒 Security Best Practices

1. **Keep your API token secret** - Never commit it to version control
2. **Use environment variables** - Store tokens in `.env` files or secret managers
3. **Set token expiration** - Create tokens with appropriate expiration dates
4. **Rotate tokens regularly** - Periodically create new tokens and delete old ones
5. **Monitor usage** - Check the "Last used" timestamp to detect unauthorized access

## 📊 Available Scopes

- `blog:write` - Create and update blog posts
- `blog:read` - Read blog posts (future)

## 🔧 Troubleshooting

### 401 Unauthorized
- Check that your API token is correct
- Verify the token hasn't expired
- Ensure the token is still active

### 400 Bad Request
- Verify required fields (title, content) are present
- Check that status is either "draft" or "published"
- Ensure markdown content is properly formatted

### 404 Not Found
- When updating a post, verify the slug is correct
- Check that the post exists and hasn't been deleted

## 📚 Advanced Usage

### Custom Publish Date
```json
{
  "title": "Scheduled Post",
  "content": "This post will appear with a custom date",
  "publishedAt": "2026-12-25T10:00:00Z",
  "status": "published"
}
```

### Multiple Tags
```json
{
  "title": "Comprehensive Guide",
  "content": "...",
  "tags": ["Tutorial", "Beginner", "Web Dev", "JavaScript"]
}
```

### Draft Mode (Save without publishing)
```json
{
  "title": "Work in Progress",
  "content": "...",
  "status": "draft"
}
```

## 🆘 Support

For issues or questions:
- Check the API token status in Admin Panel
- Review server logs for detailed error messages
- Ensure the backend service is running

## 🎉 Use Cases

- **Automated publishing** from CMS platforms
- **Scheduled posts** via cron jobs
- **Bulk imports** from other platforms
- **AI-generated content** integration
- **Newsletter to blog** conversion
- **Documentation sync** from code repositories
