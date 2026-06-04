# quora-copy

This project is a local Q&A app built with Bun, Vue, Express, Prisma, and MariaDB.

## What you need first

Before you start, make sure these are installed and running on your computer:

1. Bun
2. MariaDB running locally on port `3306`

The app expects MariaDB to be available before you run anything else.

## 1. Install dependencies

From the project root, install everything with:

```bash
bun install
```

## 2. Set up your environment files

please view the `.env.example` file

## 3. Push the Prisma schema to MariaDB

This project uses Prisma, so the database schema needs to be pushed to your local MariaDB database before the app can run.

Run:

```bash
bunx prisma db push
```

If Prisma asks to generate the client, run:

```bash
bunx prisma generate
```

## 4. Seed the database

```bash
bun run seed
```

## 5. Run the app

Run the backend server in one terminal:

```bash
bun run server
```

Run the frontend client in another terminal:

```bash
bun run dev
```

The frontend normally runs on Vite's local dev server, and the backend runs on port `3000` unless you set `PORT` yourself.

## 6. Open the app

Open the frontend URL shown by Vite in your browser, then use the demo seed account if needed.

## Demo seed login

The seed script prints a demo login after it runs. Use that account to sign in and test the app locally.
