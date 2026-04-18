/**
 * Seed demo board data (lists, cards, comment, checklist, label).
 *
 * Usage (from apps/api):
 *   pnpm db:seed
 *   pnpm db:seed -- --fresh
 *
 * Modes:
 *   • Default clerk id `user_seed_local_demo` — creates synthetic user + workspace + board.
 *     `--fresh` deletes that synthetic user (cascade) then recreates.
 *
 *   • `SEED_CLERK_USER_ID=user_xxx` — uses your **existing** DB user (e.g. after Clerk sign-in).
 *     Attaches a **"Seed board"** to `SEED_WORKSPACE_ID` or your **first** workspace.
 *     `--fresh` deletes only boards named **"Seed board"** owned by that user, then recreates.
 *
 * Env:
 *   SEED_CLERK_USER_ID   — Clerk `sub` / clerkUserId (default: user_seed_local_demo)
 *   SEED_WORKSPACE_ID    — when attaching to existing user, target workspace UUID (optional)
 *   SEED_EMAIL           — only used when creating the synthetic user
 *
 * Requires: DATABASE_URL, prisma generate
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import type { Prisma } from "../generated/prisma/client";
import { PrismaClient } from "../generated/prisma/client";
import { randomShortLink } from "../src/common/short-link";

const SYNTHETIC_CLERK_ID = "user_seed_local_demo";
const SEED_BOARD_NAME = "Seed board";
const CLERK_ID = process.env.SEED_CLERK_USER_ID ?? SYNTHETIC_CLERK_ID;
const WORKSPACE_ID_ENV = process.env.SEED_WORKSPACE_ID;
const EMAIL = process.env.SEED_EMAIL ?? "seed-local-demo@example.com";
const FRESH = process.argv.includes("--fresh");
const attachToExistingUser = CLERK_ID !== SYNTHETIC_CLERK_ID;

async function seedBoardGraph(
  tx: Prisma.TransactionClient,
  user: { id: string; clerkUserId: string; email: string },
  workspaceId: string
) {
  const board = await tx.board.create({
    data: {
      name: SEED_BOARD_NAME,
      background: "#0f766e",
      shortLink: randomShortLink(),
      userId: user.id,
      workspaceId,
    },
  });

  const listTodo = await tx.list.create({
    data: { name: "To do", pos: 1000, boardId: board.id },
  });
  const listDoing = await tx.list.create({
    data: { name: "Doing", pos: 2000, boardId: board.id },
  });

  const label = await tx.label.create({
    data: {
      name: "Priority",
      color: "#ef4444",
      boardId: board.id,
    },
  });

  const card1 = await tx.card.create({
    data: {
      name: "First card",
      description: "Try the API",
      pos: 1000,
      shortLink: randomShortLink(),
      listId: listTodo.id,
      boardId: board.id,
      assigneeId: user.id,
    },
  });

  await tx.card.update({
    where: { id: card1.id },
    data: { labels: { connect: { id: label.id } } },
  });

  await tx.card.create({
    data: {
      name: "Second card",
      pos: 2000,
      shortLink: randomShortLink(),
      listId: listTodo.id,
      boardId: board.id,
    },
  });

  await tx.comment.create({
    data: {
      text: "Seeded comment — hello!",
      cardId: card1.id,
      authorId: user.id,
    },
  });

  const checklist = await tx.checklist.create({
    data: { name: "Launch checklist", pos: 1000, cardId: card1.id },
  });

  await tx.checkItem.createMany({
    data: [
      {
        name: "Wire API",
        pos: 1000,
        completed: true,
        checklistId: checklist.id,
      },
      { name: "Ship", pos: 2000, completed: false, checklistId: checklist.id },
    ],
  });

  await tx.attachment.create({
    data: {
      name: "Example link",
      url: "https://example.com",
      pos: 65536,
      isUpload: false,
      cardId: card1.id,
      uploadedById: user.id,
    },
  });

  return {
    userId: user.id,
    clerkUserId: user.clerkUserId,
    email: user.email,
    workspaceId,
    boardId: board.id,
    listIds: { todo: listTodo.id, doing: listDoing.id },
    cardId: card1.id,
    labelId: label.id,
    checklistId: checklist.id,
  };
}

async function resolveWorkspaceId(
  prisma: PrismaClient,
  userId: string
): Promise<string> {
  if (WORKSPACE_ID_ENV) {
    const ws = await prisma.workspace.findFirst({
      where: { id: WORKSPACE_ID_ENV, ownerId: userId },
    });
    if (!ws) {
      console.error(
        `SEED_WORKSPACE_ID=${WORKSPACE_ID_ENV} is not a workspace owned by this user.`
      );
      process.exit(1);
    }
    return ws.id;
  }

  const first = await prisma.workspace.findFirst({
    where: { ownerId: userId },
    orderBy: { createdAt: "asc" },
  });
  if (first) {
    return first.id;
  }

  const created = await prisma.workspace.create({
    data: {
      name: "Seed workspace",
      description: "Created by db:seed (no workspace existed)",
      shortLink: randomShortLink(),
      ownerId: userId,
    },
  });
  console.log(`Created workspace ${created.id} (user had none).`);
  return created.id;
}

async function runAttachToExistingUser(prisma: PrismaClient) {
  const user = await prisma.user.findUnique({
    where: { clerkUserId: CLERK_ID },
  });
  if (!user) {
    console.error(
      `No user with clerkUserId=${CLERK_ID}. Sign in once (API + Clerk) or run a webhook so the user row exists.`
    );
    process.exit(1);
  }

  const workspaceId = await resolveWorkspaceId(prisma, user.id);

  if (FRESH) {
    const removed = await prisma.board.deleteMany({
      where: { userId: user.id, name: SEED_BOARD_NAME },
    });
    console.log(
      `--fresh: removed ${removed.count} "${SEED_BOARD_NAME}" board(s) for this user.`
    );
  } else {
    const dup = await prisma.board.findFirst({
      where: { userId: user.id, name: SEED_BOARD_NAME },
    });
    if (dup) {
      console.log(
        `"${SEED_BOARD_NAME}" already exists. Re-run with --fresh to replace, or delete that board in Studio.\n`
      );
      console.log(
        JSON.stringify(
          {
            userId: user.id,
            clerkUserId: user.clerkUserId,
            email: user.email,
            workspaceId,
            boardId: dup.id,
          },
          null,
          2
        )
      );
      return;
    }
  }

  const result = await prisma.$transaction((tx) =>
    seedBoardGraph(tx, user, workspaceId)
  );

  console.log(
    "Seed complete (attached to your user). IDs for Postman / HTTPie:\n"
  );
  console.log(JSON.stringify(result, null, 2));
}

async function runSyntheticSeed(prisma: PrismaClient) {
  if (FRESH) {
    const deleted = await prisma.user.deleteMany({
      where: { clerkUserId: CLERK_ID },
    });
    console.log(
      `--fresh: removed ${deleted.count} user(s) with clerkUserId=${CLERK_ID}`
    );
  }

  const existing = await prisma.user.findUnique({
    where: { clerkUserId: CLERK_ID },
  });
  if (existing && !FRESH) {
    console.log(
      "Synthetic seed user already exists. Re-run with --fresh to replace, or set SEED_CLERK_USER_ID to your real Clerk id.\n"
    );
    console.log(
      JSON.stringify(
        { userId: existing.id, clerkUserId: CLERK_ID, email: existing.email },
        null,
        2
      )
    );
    return;
  }

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        clerkUserId: CLERK_ID,
        email: EMAIL,
        firstName: "Seed",
        lastName: "User",
      },
    });

    const workspace = await tx.workspace.create({
      data: {
        name: "Seed workspace",
        description: "Created by db:seed",
        shortLink: randomShortLink(),
        ownerId: user.id,
      },
    });

    return seedBoardGraph(tx, user, workspace.id);
  });

  console.log("Seed complete (synthetic user). IDs for Postman / HTTPie:\n");
  console.log(JSON.stringify(result, null, 2));
  console.log(
    "\nTip: use SEED_CLERK_USER_ID=<your JWT sub> to attach demo data to your real account instead."
  );
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is required in .env");
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    if (attachToExistingUser) {
      await runAttachToExistingUser(prisma);
    } else {
      await runSyntheticSeed(prisma);
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
