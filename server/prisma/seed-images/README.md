# Seed Images

Put optional seed JPG files in this folder.

The file name must match the question key from `server/prisma/seed-data/seedData.ts`.

Examples:

```text
frontend-structure.jpg
api-errors.jpg
database-seeding.jpg
```

When you run `bun run seed`, matching images are stored in the `Questions.imageData` database column.
