# Blog API - Quick Reference

Fast reference for common Blog Webhook API operations.

---

## 🚀 Quick Start

### 1. Get Your API Token
```
Admin Panel → API Tokens → New Token → Copy Token
```

### 2. Make Your First API Call

```bash
curl -X POST http://localhost:3001/api/webhook/blog \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Post",
    "content": "# Hello\n\nContent here...",
    "status": "published"
  }'
```

---

## 📋 Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhook/blog` | Create blog post |
| PATCH | `/api/webhook/blog/:slug` | Update blog post |
| GET | `/api/webhook/health` | Check API status |

---

## 🔑 Authentication

All requests require:
```http
Authorization: Bearer pk_your_token_here
Content-Type: application/json
```

---

## 📝 Create Post

**Required:** `title`, `content`

**Optional:** `excerpt`, `coverImage`, `status`, `tags`, `publishedAt`

### Minimal Example
```json
{
  "title": "Post Title",
  "content": "# Markdown Content"
}
```

### Complete Example
```json
{
  "title": "Getting Started with API",
  "content": "# Introduction\n\nComplete content here...",
  "excerpt": "Short summary",
  "status": "published",
  "tags": ["Tutorial", "API"],
  "coverImage": "https://example.com/image.jpg"
}
```

### With Custom Publish Date
```json
{
  "title": "Scheduled Post",
  "content": "...",
  "publishedAt": "2026-12-25T10:00:00Z",
  "status": "published"
}
```

---

## ✏️ Update Post

**URL:** `PATCH /api/webhook/blog/:slug`

All fields optional:
```json
{
  "title": "New Title",
  "content": "Updated content",
  "status": "published",
  "tags": ["Updated", "Tags"]
}
```

---

## 📊 Status Values

| Value | Description |
|-------|-------------|
| `draft` | Save as draft (default) |
| `published` | Publish immediately |
| `archived` | Archive post |

---

## 🏷️ Tags

Array of tag names:
```json
{
  "tags": ["Tutorial", "JavaScript", "Web Dev"]
}
```

Tags are auto-created if they don't exist.

---

## 📸 Cover Image

Full URL to image:
```json
{
  "coverImage": "https://example.com/image.jpg"
}
```

---

## ✅ Success Response

```json
{
  "success": true,
  "post": {
    "id": "uuid",
    "slug": "generated-slug",
    "title": "Post Title",
    "status": "published",
    "url": "http://localhost:3000/blog/generated-slug",
    "publishedAt": "2026-03-08T10:00:00.000Z",
    "tags": ["Tutorial", "API"]
  }
}
```

---

## ❌ Error Responses

| Code | Error | Fix |
|------|-------|-----|
| 400 | `Title and content are required` | Add required fields |
| 401 | `Invalid API token` | Check your token |
| 401 | `API token is inactive` | Reactivate in admin |
| 401 | `API token has expired` | Generate new token |
| 403 | `Insufficient permissions` | Check token scopes |
| 404 | `Post not found` | Verify slug is correct |

---

## 🐍 Python Example

```python
import requests

response = requests.post(
    "http://localhost:3001/api/webhook/blog",
    headers={"Authorization": f"Bearer {API_TOKEN}"},
    json={
        "title": "Python Post",
        "content": "# Hello from Python",
        "status": "published",
        "tags": ["Python", "API"]
    }
)

print(response.json())
```

---

## 🟢 Node.js Example

```javascript
const axios = require('axios');

const response = await axios.post(
    'http://localhost:3001/api/webhook/blog',
    {
        title: 'Node.js Post',
        content: '# Hello from Node.js',
        status: 'published',
        tags: ['Node.js', 'API']
    },
    {
        headers: {
            'Authorization': `Bearer ${API_TOKEN}`
        }
    }
);

console.log(response.data);
```

---

## 🔄 Common Workflows

### Create Draft First
```json
{
  "title": "Work in Progress",
  "content": "...",
  "status": "draft"
}
```

Then publish later:
```bash
curl -X PATCH "http://localhost:3001/api/webhook/blog/work-in-progress" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "published"}'
```

### Bulk Import
```python
posts = [
    {"title": "Post 1", "content": "...", "tags": ["Tag1"]},
    {"title": "Post 2", "content": "...", "tags": ["Tag2"]},
]

for post in posts:
    requests.post(url, headers=headers, json=post)
```

### Update Tags Only
```bash
curl -X PATCH "URL/blog/slug" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tags": ["New", "Tags"]}'
```

---

## 🛡️ Security Tips

1. **Never commit tokens** to git
2. **Use environment variables** for storage
3. **Rotate tokens regularly**
4. **Check last used** timestamp in admin
5. **Set expiration dates** on sensitive tokens

---

## 📞 Support

- **Admin Panel:** http://localhost:3000/admin/api-tokens
- **Health Check:** http://localhost:3001/api/webhook/health
- **Full Docs:** `docs/API_WEBHOOK_DOCUMENTATION.md`

---

**Version:** 1.0.0 | **Last Updated:** 2026-03-08
