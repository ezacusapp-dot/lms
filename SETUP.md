# Course Category API - Setup Guide

## Tech Stack
- **Next.js** (App Router API Routes)
- **Prisma ORM** (Database management)
- **PostgreSQL** (Database)
- **TypeScript** (Type safety)

## Installation

### 1. Install Dependencies
```bash
npm install prisma @prisma/client
npm install -D ts-node
```

### 2. Configure Database
Copy `.env.example` to `.env` and update the `DATABASE_URL`:
```bash
cp .env.example .env
```

Update the connection string in `.env`:
```
DATABASE_URL="postgresql://username:password@localhost:5432/course_categories?schema=public"
```

### 3. Run Prisma Migrations
```bash
npx prisma generate
npx prisma db push
# OR for proper migrations:
npx prisma migrate dev --name init
```

### 4. Seed Master Data
Add this to your `package.json`:
```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

Then run:
```bash
npx prisma db seed
```

### 5. Start Dev Server
```bash
npm run dev
```

## File Structure
```
├── prisma/
│   ├── schema.prisma          # Database schema (5 tables)
│   └── seed.ts                # Seed master data
├── lib/
│   ├── prisma.ts              # Prisma client singleton
│   ├── validations.ts         # Server-side validation
│   └── api-service.ts         # Frontend API service (use in components)
├── types/
│   └── course-category.ts     # TypeScript interfaces
├── app/api/
│   ├── course-categories/
│   │   ├── route.ts           # GET (list) + POST (create)
│   │   └── [id]/
│   │       ├── route.ts       # GET + PUT + DELETE
│   │       └── sync/
│   │           └── route.ts   # POST (sync to platforms)
│   ├── master-data/
│   │   ├── levels/route.ts    # GET + POST
│   │   ├── duration-types/route.ts  # GET + POST
│   │   └── award-categories/route.ts # GET + POST
│   └── uploads/
│       └── route.ts           # POST (file upload)
└── .env.example
```

## API Endpoints

### Course Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/course-categories` | List all (supports ?page, ?limit, ?search, ?isActive, ?isDraft, ?levelId) |
| POST | `/api/course-categories` | Create category + linked certificate template |
| GET | `/api/course-categories/:id` | Get single category |
| PUT | `/api/course-categories/:id` | Update category + certificate template |
| DELETE | `/api/course-categories/:id` | Delete category (cascades to certificate) |
| POST | `/api/course-categories/:id/sync` | Sync category to all platforms |

### Master Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/master-data/levels` | List course levels |
| POST | `/api/master-data/levels` | Create course level |
| GET | `/api/master-data/duration-types` | List duration types |
| POST | `/api/master-data/duration-types` | Create duration type |
| GET | `/api/master-data/award-categories` | List award categories |
| POST | `/api/master-data/award-categories` | Create award category |

### File Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/uploads` | Upload file (multipart/form-data) |

## Example: Create Category Request
```json
POST /api/course-categories

{
  "name": "Advanced Python Programming",
  "code": "ADVANCEDPY",
  "levelId": "clxyz...",
  "durationTypeId": "clxyz...",
  "description": "Master Python with advanced concepts",
  "color": "#49205E",
  "categoryLogo": "/uploads/logos/python-logo-123.png",
  "isDraft": false,
  "createdBy": "Priya Mehta",
  "certificateTemplate": {
    "certificateName": "Advanced Python Programming Certificate",
    "passThreshold": 75,
    "awardCategoryId": "clxyz...",
    "includeRanking": true,
    "includeScore": true,
    "validityPeriod": "Lifetime",
    "gradeA": 90,
    "gradeB": 75,
    "gradeC": 60,
    "borderStyle": "classic",
    "backgroundColor": "#FFFFFF",
    "primaryColor": "#49205E",
    "accentColor": "#BC579E",
    "sealEnabled": true,
    "qrPosition": "bottom-right"
  }
}
```
