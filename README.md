# Personal Developer Platform - Phase 1

A self-hosted developer portfolio platform with GitHub integration.

## Architecture

**Tech Stack:**
- Frontend: Next.js 15 (App Router), TypeScript, Tailwind CSS
- Backend: Node.js, Fastify, Prisma ORM
- Database: PostgreSQL
- Infrastructure: Docker + docker-compose

**Data Flow:**
```
GitHub API → Backend Sync Service → PostgreSQL → Backend API → Frontend
```

## Project Structure

```
root/
├── frontend/          # Next.js application
│   ├── app/          # App Router pages
│   ├── components/   # React components
│   └── lib/          # Utilities & API client
├── backend/          # Node.js API
│   ├── src/
│   │   ├── routes/   # API endpoints
│   │   ├── services/ # Business logic
│   │   └── lib/      # Database connection
│   └── prisma/       # Database schema
└── docker-compose.yml
```

## Setup

### 1. Environment Configuration

**Backend** (`backend/.env`):
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/portfolio_db
GITHUB_TOKEN=ghp_your_github_personal_access_token
PORT=3001
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`frontend/.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 2. Local Development (without Docker)

**Database:**
```bash
# Start PostgreSQL (Docker)
docker run --name portfolio-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16-alpine
```

**Backend:**
```bash
cd backend
npm install
cp .env.example .env  # Edit with your values
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

### 3. Docker Deployment

```bash
# Start all services
docker-compose up -d

# Run database migrations
docker-compose exec backend npx prisma migrate deploy

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Usage

### Sync GitHub Repositories

```bash
curl -X POST http://localhost:3001/api/sync/github \
  -H "Content-Type: application/json" \
  -d '{"username": "your-github-username"}'
```

This will:
- Fetch all non-fork repositories from GitHub
- Save them to the database
- Set `show_on_portfolio = false` by default

### Control Visibility

Use Prisma Studio or direct database access:

```bash
cd backend
npx prisma studio
```

Update projects:
- Set `show_on_portfolio = true` to display on portfolio
- Set `featured = true` to highlight important projects

### API Endpoints

- `GET /api/projects` - Returns visible portfolio projects
- `POST /api/sync/github` - Syncs repositories from GitHub
- `GET /health` - Health check

### Frontend Pages

- `/` - Landing page
- `/projects` - Projects showcase

## Database Schema

Key fields:
- `show_on_portfolio` - Controls visibility on public portfolio
- `featured` - Highlights important projects
- `techStack` - Array of technologies/topics
- `stars` - GitHub star count
- `syncedAt` - Last sync timestamp

## Extension Points (Future Phases)

**Authentication:**
- Add middleware in `backend/src/index.ts`
- Protect routes in `backend/src/routes/*`
- Add auth context in `frontend/app/layout.tsx`

**Dashboard:**
- New routes in `frontend/app/dashboard/*`
- New API endpoints in `backend/src/routes/admin.ts`
- Admin UI components

**Multi-user:**
- Add `users` table in Prisma schema
- Add `user_id` foreign key to projects
- Row-level security policies

**GitLab/Other Providers:**
- Create `services/gitlabSync.ts`
- Add sync routes
- Update project provider field

## Production Considerations

1. **Security:**
   - Store GitHub token in secrets manager
   - Add rate limiting
   - Implement CORS properly
   - Add API authentication for sync endpoint

2. **Performance:**
   - Enable Next.js caching
   - Add Redis for session/cache
   - Use CDN for static assets

3. **Monitoring:**
   - Add logging (Winston/Pino)
   - Health checks
   - Error tracking (Sentry)

4. **Backup:**
   - Regular database backups
   - Volume snapshots

## License

Private use only.
