# yourShift

A Next.js application for managing guard shifts powered by Prisma and NextAuth.

## Prerequisites

- Node.js 18+
- npm (bundled with Node.js)
- PostgreSQL 15+ (local or managed, e.g. Render)

## Environment variables

Copy the template and adjust values for your environment:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
| --- | --- | --- |
| `NEXTAUTH_URL` | ✔ | Base URL of the application (set to the deployed domain in production). |
| `NEXTAUTH_SECRET` | ✔ | Secret used by NextAuth to encrypt tokens. Generate with `openssl rand -hex 32`. |
| `GOOGLE_CLIENT_ID` | ✔ | Google OAuth client ID. |
| `GOOGLE_CLIENT_SECRET` | ✔ | Google OAuth client secret. |
| `GITHUB_CLIENT_ID` | ✔ | GitHub OAuth client ID. |
| `GITHUB_CLIENT_SECRET` | ✔ | GitHub OAuth client secret. |
| `DATABASE_URL` | ✔ | Pooled PostgreSQL connection string used by the app (e.g. Render connection string via connection pooling). |
| `DIRECT_DATABASE_URL` | ✔ | Direct PostgreSQL connection string used for Prisma migrations. |

## Local development

1. Start PostgreSQL locally or with Docker:
   ```bash
   docker compose up -d postgres
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Push the database schema:
   ```bash
   npx prisma db push
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### 1. Provision PostgreSQL on Render

1. Create a **Render PostgreSQL** instance.
2. Enable the [built-in connection pooler](https://docs.render.com/databases#connection-pooling).
3. Copy two connection strings:
   - **Pooled connection string** → `DATABASE_URL`
   - **Direct connection string** → `DIRECT_DATABASE_URL`
4. Ensure both strings include `?sslmode=require` for secure connections.

### 2. Configure Vercel project

1. Create a new Vercel project and import this repository.
2. In **Settings → Environment Variables**, add the variables from `.env.example` using the Render values for `DATABASE_URL`/`DIRECT_DATABASE_URL` and production OAuth credentials.
3. Set `NEXTAUTH_URL` to the production domain (e.g. `https://yourshift.vercel.app`).
4. Trigger the first deployment; Vercel will build the Next.js app.

### 3. Run Prisma migrations in production

On Vercel, migrations should be run via a one-off command:

```bash
vercel env pull .env.production
npx prisma migrate deploy --schema=prisma/schema.prisma
```

Alternatively, run `npx prisma migrate deploy` inside a Vercel deployment hook or CI pipeline with the production environment variables loaded.

Once migrations are applied, the application will connect to Render's PostgreSQL using the pooled URL while Prisma uses the direct URL for schema changes.

## Useful commands

```bash
npm run dev       # Start development server
npm run build     # Create production build
npm run start     # Run production build locally
npx prisma studio # Open Prisma Studio to inspect data
```
