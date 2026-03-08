# Blog Webhook API - Quick Start Guide

> **📚 Full Documentation:** See [`docs/API_WEBHOOK_DOCUMENTATION.md`](./docs/API_WEBHOOK_DOCUMENTATION.md) for complete API reference
>
> **⚡ Quick Reference:** See [`docs/API_QUICK_REFERENCE.md`](./docs/API_QUICK_REFERENCE.md) for fast lookup

---

## 🚀 Quick Start (3 Steps)

### 1. Generate API Token
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
    "content": "# Hello World\n\nThis is automated!",
    "status": "published"
  }'
```

### 3. Check Your Blog
```
Visit: http://localhost:3000/blog/my-first-post
```

---

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhook/blog` | Create blog post |
| PATCH | `/api/webhook/blog/:slug` | Update blog post |
| GET | `/api/webhook/health` | Check API status |

---

## 📝 Request Format

### Headers
```http
Authorization: Bearer pk_your_token_here
Content-Type: application/json
```

### Body (Create)
```json
{
  "title": "Post Title",           // Required
  "content": "Markdown content",    // Required
  "excerpt": "Summary",            // Optional
  "status": "published",           // "draft" or "published"
  "tags": ["Tutorial", "API"],     // Optional
  "coverImage": "https://..."      // Optional
}
```

### Response
```json
{
  "success": true,
  "post": {
    "id": "uuid",
    "slug": "post-title",
    "title": "Post Title",
    "url": "http://localhost:3000/blog/post-title",
    "status": "published"
  }
}
```

---

## 💻 Quick Examples

### Python
```python
import requests

response = requests.post(
    "http://localhost:3001/api/webhook/blog",
    headers={"Authorization": f"Bearer {API_TOKEN}"},
    json={
        "title": "Python Post",
        "content": "# Hello from Python",
        "status": "published",
        "tags": ["Python"]
    }
)

print(response.json())
```

### Node.js
```javascript
const axios = require('axios');

const response = await axios.post(
    'http://localhost:3001/api/webhook/blog',
    {
        title: 'Node.js Post',
        content: '# Hello from Node.js',
        status: 'published'
    },
    {
        headers: {
            'Authorization': `Bearer ${API_TOKEN}`
        }
    }
);

console.log(response.data);
```

### cURL
```bash
curl -X POST http://localhost:3001/api/webhook/blog \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Post from cURL",
    "content": "# Hello",
    "status": "published"
  }'
```

---

## 🎯 Common Use Cases

### Create Draft → Publish Later
```python
# Create draft
requests.post(url, json={
    "title": "Work in Progress",
    "content": "...",
    "status": "draft"
})

# Publish later
requests.patch(f"{url}/work-in-progress", json={
    "status": "published"
})
```

### Bulk Import
```python
posts = [
    {"title": "Post 1", "content": "..."},
    {"title": "Post 2", "content": "..."},
]

for post in posts:
    requests.post(url, json=post)
```

### GitHub Actions
```yaml
- name: Publish to Blog
  run: |
    curl -X POST ${{ secrets.API_URL }}/api/webhook/blog \
      -H "Authorization: Bearer ${{ secrets.API_TOKEN }}" \
      -H "Content-Type: application/json" \
      -d '{"title": "GitHub Action Post", "content": "...", "status": "published"}'
```

---

## ❌ Error Codes

| Code | Error | Solution |
|------|-------|----------|
| 400 | Missing required fields | Add `title` and `content` |
| 401 | Invalid API token | Check your token |
| 401 | Token inactive | Reactivate in admin |
| 401 | Token expired | Generate new token |
| 404 | Post not found | Verify slug is correct |

---

## 🔒 Security Best Practices

1. ✅ **Never commit tokens** to version control
2. ✅ **Use environment variables** (`.env` files)
3. ✅ **Rotate tokens** regularly
4. ✅ **Check "Last used"** in admin panel
5. ✅ **Set expiration dates** on sensitive tokens

### Environment Setup
```bash
# .env file
API_URL=http://localhost:3001
API_TOKEN=pk_your_token_here

# .gitignore
.env
.env.local
```

---

## 📚 Additional Resources

- **Complete Documentation:** `docs/API_WEBHOOK_DOCUMENTATION.md`
- **Quick Reference:** `docs/API_QUICK_REFERENCE.md`
- **Admin Panel:** http://localhost:3000/admin/api-tokens
- **Health Check:** http://localhost:3001/api/webhook/health

---

## 🆘 Troubleshooting

### Token Issues
```bash
# Check if API is running
curl http://localhost:3001/api/webhook/health

# Should return: {"status":"ok",...}
```

### Post Not Appearing
- Check status is `"published"` not `"draft"`
- Verify slug in response URL
- Check frontend is running

### Authentication Failed
- Verify token format: `pk_...`
- Check token hasn't been deleted
- Ensure header is exact: `Authorization: Bearer pk_...`

---

**Need Help?** Check the full documentation at `docs/API_WEBHOOK_DOCUMENTATION.md`

**Version:** 1.0.0 | **Last Updated:** 2026-03-08

