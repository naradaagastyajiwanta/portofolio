# Blog Webhook API Documentation

Complete documentation for the Blog Webhook API system.

---

## 📁 Documentation Files

### 1. **API_WEBHOOK_DOCUMENTATION.md** (Complete Reference)
**Purpose:** Comprehensive API documentation with all details

**Contains:**
- Complete endpoint reference
- All parameters and options
- Security best practices
- Error handling guide
- Code examples in Python, Node.js, Go, cURL
- Integration guides (GitHub Actions, Cron, IFTTT, CMS)
- Troubleshooting section
- Changelog

**Use when:** You need detailed information about any aspect of the API

---

### 2. **API_QUICK_REFERENCE.md** (Fast Lookup)
**Purpose:** Quick reference for common operations

**Contains:**
- Quick start guide
- Endpoint summary table
- Common request/response formats
- Status values reference
- Error codes table
- Code snippets (Python, Node.js)
- Common workflows
- Security tips

**Use when:** You need fast answers without reading extensive docs

---

### 3. **WEBHOOK_EXAMPLE.md** (Getting Started)
**Purpose:** Quick start guide with practical examples

**Contains:**
- 3-step quick start
- Basic request format
- Simple code examples
- Common use cases
- Troubleshooting basics

**Use when:** You're new to the API and want to get started quickly

---

## 🚀 Recommended Reading Order

### For First-Time Users:
1. Start with **WEBHOOK_EXAMPLE.md** - Get your first API call working
2. Read **API_QUICK_REFERENCE.md** - Learn common patterns
3. Reference **API_WEBHOOK_DOCUMENTATION.md** - For advanced features

### For Experienced Developers:
1. Skim **API_QUICK_REFERENCE.md** - Get the basics
2. Jump to **API_WEBHOOK_DOCUMENTATION.md** - For detailed implementation

---

## 📋 Quick Links

| Topic | Document | Section |
|-------|----------|---------|
| Get API Token | WEBHOOK_EXAMPLE.md | Quick Start |
| Create Post | API_QUICK_REFERENCE.md | Create Post |
| Update Post | API_QUICK_REFERENCE.md | Update Post |
| Error Codes | API_QUICK_REFERENCE.md | Error Responses |
| Python Examples | API_WEBHOOK_DOCUMENTATION.md | Code Examples |
| GitHub Actions | API_WEBHOOK_DOCUMENTATION.md | Webhooks Guide |
| Security | API_WEBHOOK_DOCUMENTATION.md | Security |
| Troubleshooting | All files | Troubleshooting |

---

## 🎯 Common Tasks

### Generate API Token
📖 **WEBHOOK_EXAMPLE.md** → Quick Start → Step 1

### Create Blog Post via API
📖 **API_QUICK_REFERENCE.md** → Create Post section

### Bulk Import Posts
📖 **API_WEBHOOK_DOCUMENTATION.md** → Code Examples → Python

### Set Up GitHub Actions
📖 **API_WEBHOOK_DOCUMENTATION.md** → Webhooks Guide → GitHub Actions

### Troubleshoot Errors
📖 **API_QUICK_REFERENCE.md** → Error Responses

---

## 📊 Document Comparison

| Feature | WEBHOOK_EXAMPLE | API_QUICK_REFERENCE | API_WEBHOOK_DOCUMENTATION |
|---------|----------------|---------------------|--------------------------|
| Quick Start | ✅ | ✅ | ✅ |
| Endpoints | ✅ | ✅ | ✅ |
| Code Examples | ✅ | ✅ | ✅✅✅ (All Languages) |
| Error Handling | ✅ | ✅ | ✅✅ (Detailed) |
| Security | ✅ | ✅ | ✅✅ (Complete) |
| Integrations | ❌ | ❌ | ✅ |
| Troubleshooting | ✅ | ✅ | ✅✅ (Comprehensive) |
| Changelog | ❌ | ❌ | ✅ |

---

## 🔍 Search Tips

### Looking for something specific?

- **"How to create post?"** → See API_QUICK_REFERENCE.md
- **"Python example?"** → See API_WEBHOOK_DOCUMENTATION.md
- **"Error code 401?"** → See API_QUICK_REFERENCE.md
- **"GitHub Actions setup?"** → See API_WEBHOOK_DOCUMENTATION.md
- **"Quick start?"** → See WEBHOOK_EXAMPLE.md

---

## 📞 Getting Help

### 1. Check Documentation First
- Search the relevant .md file
- Check troubleshooting sections
- Review error code tables

### 2. Verify Your Setup
- API health check: `GET /api/webhook/health`
- Token status: Admin Panel → API Tokens
- Server logs: Check backend logs for details

### 3. Common Issues Quick Fix

| Problem | Solution |
|---------|----------|
| 401 Unauthorized | Check API token in Admin Panel |
| 400 Bad Request | Verify title and content present |
| Post not showing | Ensure status is "published" |
| Slug not found | Use exact slug from response |

---

## 🔄 Keeping Updated

This documentation is maintained alongside the API. Check the changelog in `API_WEBHOOK_DOCUMENTATION.md` for:

- New features
- Breaking changes
- Deprecation notices
- Bug fixes

**Current API Version:** 1.0.0
**Documentation Version:** 1.0.0
**Last Updated:** 2026-03-08

---

## 📝 Contributing to Docs

When updating the API:

1. **Update all 3 documents** if the change affects users
2. **Update changelog** in API_WEBHOOK_DOCUMENTATION.md
3. **Update version numbers** if breaking changes
4. **Add examples** for new features

---

## 🎓 Learning Path

### Beginner (New to API)
1. 📖 WEBHOOK_EXAMPLE.md (15 min)
2. 🛠️ Make your first API call
3. 📖 API_QUICK_REFERENCE.md (30 min)
4. 🛠️ Try different operations

### Intermediate (Familiar with APIs)
1. 📖 API_QUICK_REFERENCE.md (15 min)
2. 📖 API_WEBHOOK_DOCUMENTATION.md - Sections you need (30 min)
3. 🛠️ Implement your integration

### Advanced (Building Complex Systems)
1. 📖 API_WEBHOOK_DOCUMENTATION.md (Complete, 1 hour)
2. 🛠️ Study all code examples
3. 🛠️ Review security best practices
4. 🛠️ Plan your architecture

---

**Choose the document that fits your needs, or read all three for complete mastery!** 🚀
