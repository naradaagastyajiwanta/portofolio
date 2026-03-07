# Experience Management & Automation

## 🎯 Overview
Your portfolio now has a dynamic experience management system with:
- ✅ Admin panel for manual CRUD operations
- ✅ Public API for displaying experiences
- ✅ Webhook endpoint for automation (Zapier/Make.com)

---

## 📍 Admin Panel

**URL:** http://localhost:3000/admin/experience

### Features:
- ➕ Add new work experiences
- ✏️ Edit existing experiences
- 🗑️ Delete experiences
- 👁️ Toggle visibility on About page
- 🔢 Reorder experiences
- 📝 Add responsibilities & skills
- 📅 Set employment dates & type

### Fields:
- **Job Title** (required)
- **Company** (required)
- **Location** (optional)
- **Employment Type** (Full-time, Part-time, Contract, Freelance, Internship)
- **Start Date** (required)
- **End Date** (optional, disabled if "Current" is checked)
- **Current** (checkbox for ongoing positions)
- **Description** (optional text)
- **Responsibilities** (array of strings)
- **Skills** (array of strings/tags)
- **Display Order** (number for sorting)
- **Show on About** (visibility toggle)

---

## 🔌 API Endpoints

### Public Endpoints

#### 1. Get All Experiences
```bash
GET http://localhost:3001/api/experiences
```
Returns all experiences where `showOnAbout = true`, sorted by order and start date.

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Full Stack Developer",
    "company": "Tech Company Inc",
    "location": "San Francisco, CA",
    "employmentType": "Full-time",
    "startDate": "2023-01-15T00:00:00.000Z",
    "endDate": null,
    "current": true,
    "description": "Building scalable web applications...",
    "responsibilities": [
      "Led development of microservices architecture",
      "Improved performance by 40%"
    ],
    "skills": ["React", "Node.js", "PostgreSQL", "Docker"],
    "order": 0
  }
]
```

#### 2. Get Single Experience
```bash
GET http://localhost:3001/api/experiences/:id
```

### Admin Endpoints

#### 3. Get All Experiences (Admin)
```bash
GET http://localhost:3001/api/admin/experiences
```
Returns ALL experiences including hidden ones.

#### 4. Create Experience
```bash
POST http://localhost:3001/api/admin/experiences
Content-Type: application/json

{
  "title": "Senior Full Stack Developer",
  "company": "Tech Company Inc",
  "location": "San Francisco, CA",
  "employmentType": "Full-time",
  "startDate": "2023-01-15",
  "endDate": null,
  "current": true,
  "description": "Leading development of cloud-based solutions",
  "responsibilities": [
    "Architected microservices",
    "Mentored junior developers"
  ],
  "skills": ["React", "Node.js", "AWS", "Docker"],
  "order": 0,
  "showOnAbout": true
}
```

#### 5. Update Experience
```bash
PUT http://localhost:3001/api/admin/experiences/:id
Content-Type: application/json

{
  "title": "Lead Full Stack Developer",
  "current": true,
  "endDate": null
}
```

#### 6. Delete Experience
```bash
DELETE http://localhost:3001/api/admin/experiences/:id
```

---

## 🤖 Zapier/Make.com Automation

### Webhook Endpoint
```bash
POST http://localhost:3001/api/webhook/experiences
Content-Type: application/json
```

**⚠️ Important:** This endpoint **replaces ALL experiences** with the data you send.

### Webhook Payload Format:
```json
{
  "experiences": [
    {
      "title": "Full Stack Developer",
      "company": "Tech Company Inc",
      "location": "San Francisco, CA",
      "employmentType": "Full-time",
      "startDate": "2023-01-15",
      "endDate": null,
      "current": true,
      "description": "Building scalable applications",
      "responsibilities": [
        "Led microservices development",
        "Improved performance"
      ],
      "skills": ["React", "Node.js", "PostgreSQL"]
    },
    {
      "title": "Frontend Developer",
      "company": "Startup Inc",
      "location": "New York, NY",
      "employmentType": "Full-time",
      "startDate": "2021-06-01",
      "endDate": "2022-12-31",
      "current": false,
      "description": "Built responsive UIs",
      "responsibilities": [
        "Developed component library"
      ],
      "skills": ["React", "TypeScript", "Tailwind"]
    }
  ]
}
```

---

## 🔗 Zapier Setup Guide

### Option 1: Manual Trigger (Recommended for Testing)

1. **Create a Zap** in Zapier
2. **Trigger:** Schedule (e.g., every week/month)
3. **Action:** Webhooks by Zapier
   - Event: POST
   - URL: `https://your-domain.com/api/webhook/experiences`
   - Data: Manually format your LinkedIn data as JSON

### Option 2: LinkedIn → Zapier (Limited)

⚠️ **Note:** LinkedIn doesn't have official Zapier integration for profile data.

**Workarounds:**
1. **LinkedIn → Google Sheets → Zapier**
   - Manually update Google Sheet with your experience
   - Trigger: New/Updated Row in Google Sheets
   - Action: Format data → Send to webhook

2. **RSS/Email → Zapier**
   - Set up email notifications for LinkedIn profile changes
   - Parse email → Format data → Send to webhook

### Option 3: Make.com (More Flexible)

Make.com has more advanced data transformation tools:

1. **Create a Scenario**
2. **Module 1:** HTTP - Watch Events (manual trigger)
3. **Module 2:** Array Aggregator (format experiences)
4. **Module 3:** HTTP - Make a Request
   - Method: POST
   - URL: Your webhook endpoint
   - Body: Formatted JSON

---

## 📝 Example: Google Sheets → Zapier Automation

### Step 1: Create Google Sheet
Create a sheet with columns:
| Title | Company | Location | Employment Type | Start Date | End Date | Current | Description | Responsibilities | Skills |
|-------|---------|----------|-----------------|------------|----------|---------|-------------|------------------|--------|

### Step 2: Zapier Setup
1. **Trigger:** Google Sheets - New or Updated Spreadsheet Row
2. **Action:** Code by Zapier (Python)
   ```python
   import json
   from datetime import datetime
   
   # Format the data
   experience = {
       "title": input_data['title'],
       "company": input_data['company'],
       "location": input_data['location'],
       "employmentType": input_data['employment_type'],
       "startDate": input_data['start_date'],
       "endDate": input_data['end_date'] if input_data['current'] != 'TRUE' else None,
       "current": input_data['current'] == 'TRUE',
       "description": input_data['description'],
       "responsibilities": input_data['responsibilities'].split('|'),
       "skills": input_data['skills'].split(',')
   }
   
   output = {'experience_json': json.dumps(experience)}
   ```
3. **Action:** Webhooks by Zapier - POST
   - URL: Your webhook endpoint
   - Data: Use output from previous step

---

## 🔒 Security Recommendations

**⚠️ IMPORTANT:** The webhook endpoint is currently **PUBLIC**.

### Before Production:

1. **Add Authentication**
   - API Key in headers
   - JWT tokens
   - Basic Auth

2. **Example with API Key:**
   ```typescript
   // In backend/src/routes/experiences.ts
   fastify.addHook('onRequest', async (request, reply) => {
     const apiKey = request.headers['x-api-key'];
     if (apiKey !== process.env.ADMIN_API_KEY) {
       reply.code(401).send({ error: 'Unauthorized' });
     }
   });
   ```

3. **Update Zapier:**
   - Add Header: `X-API-Key: your-secret-key`

---

## 🚀 Testing

### Test Admin Panel:
```bash
# Open admin panel
http://localhost:3000/admin/experience

# Add a test experience
# Check about page
http://localhost:3000/about
```

### Test Webhook:
```bash
# Using PowerShell
$body = @{
  experiences = @(
    @{
      title = "Test Developer"
      company = "Test Inc"
      startDate = "2023-01-01"
      current = $true
      description = "Testing webhook"
      responsibilities = @("Test 1", "Test 2")
      skills = @("React", "Node.js")
    }
  )
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:3001/api/webhook/experiences" -Method POST -Body $body -ContentType "application/json"
```

---

## 📊 Database Schema

```prisma
model Experience {
  id                String   @id @default(uuid())
  title             String
  company           String
  location          String?
  employmentType    String?
  startDate         DateTime
  endDate           DateTime?
  current           Boolean  @default(false)
  description       String?
  responsibilities  String[]
  skills            String[]
  order             Int      @default(0)
  showOnAbout       Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

---

## 🎨 Frontend Integration

The About page automatically fetches and displays experiences from the API:
- Real-time updates (60s cache)
- Formatted dates
- Responsive timeline layout
- Empty state with link to admin panel

---

## ⚡ Quick Start

1. **Manual Entry:**
   - Go to http://localhost:3000/admin/experience
   - Click "Add Experience"
   - Fill form and save

2. **Automation Setup:**
   - Create Google Sheet with your experiences
   - Set up Zapier trigger
   - Configure webhook action
   - Test!

3. **LinkedIn Sync (Manual):**
   - Export LinkedIn profile data
   - Format as JSON
   - POST to webhook endpoint
   - Set up monthly reminder to update

---

## 🔮 Future Enhancements

- [ ] OAuth authentication for admin routes
- [ ] LinkedIn API integration (if available)
- [ ] Import/Export JSON functionality
- [ ] Bulk operations in admin panel
- [ ] Version history for experiences
- [ ] Rich text editor for descriptions
- [ ] File uploads for company logos

---

## 📞 Need Help?

If you encounter issues:
1. Check backend logs: `docker logs portfolio-backend`
2. Check frontend logs: `docker logs portfolio-frontend`
3. Verify database: `docker exec -it portfolio-db psql -U portfolio -d portfolio_db -c "SELECT * FROM experiences;"`
