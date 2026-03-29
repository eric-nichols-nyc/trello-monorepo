/**
 * Load board-detail.sample.json (or SEED_JSON), create board + lists + cards +
 * comments + checklists + items for an existing User.id.
 *
 * From apps/api:
 *   SEED_USER_ID=c6f711a2-148a-4564-9331-80a624e9e8b7 pnpm db:seed:sample-board
 *
 * Optional:
 *   SEED_JSON — path to JSON (default: ../../app/public/test-data/board-detail.sample.json)
 *   SEED_SAMPLE_BOARD_WORKSPACE_ID — workspace UUID (must belong to user). Uses SEED_WORKSPACE_ID
 *     from .env only for seed-demo; this script ignores that to avoid accidental mismatches.
 */
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import type {
  BoardBackgroundBrightness,
  Prisma,
} from "../generated/prisma/client";
import { PrismaClient } from "../generated/prisma/client";

const __dirname = dirname(fileURLToPath(import.meta.url));

type JComment = { text: string };
type JChecklist = {
  name: string;
  pos: number;
  items: { name: string; pos: number; completed: boolean }[];
};
type JCard = {
  name: string;
  description: string | null;
  pos: number;
  closed: boolean;
  dueDate: string | null;
  assigneeId: string | null;
  comments: JComment[];
  checklists: JChecklist[];
};
type JList = { name: string; pos: number; closed: boolean; cards: JCard[] };
type JBoard = {
  name: string;
  shortLink?: string | null;
  background?: string | null;
  backgroundImage?: string | null;
  backgroundBrightness?: string;
  backgroundBottomColor?: string | null;
  backgroundTopColor?: string | null;
  backgroundColor?: string | null;
  starred?: boolean;
  closed?: boolean;
  lists: JList[];
};

const SEED_USER_ID = process.env.SEED_USER_ID?.trim();
const SEED_SAMPLE_BOARD_WORKSPACE_ID =
  process.env.SEED_SAMPLE_BOARD_WORKSPACE_ID?.trim();
const SEED_JSON =
  process.env.SEED_JSON?.trim() ??
  join(__dirname, "../../app/public/test-data/board-detail.sample.json");

async function resolveWorkspaceId(
  prisma: PrismaClient,
  userId: string
): Promise<string> {
  if (SEED_SAMPLE_BOARD_WORKSPACE_ID) {
    const ws = await prisma.workspace.findFirst({
      where: { id: SEED_SAMPLE_BOARD_WORKSPACE_ID, ownerId: userId },
    });
    if (!ws) {
      console.error(
        `SEED_SAMPLE_BOARD_WORKSPACE_ID=${SEED_SAMPLE_BOARD_WORKSPACE_ID} is not owned by SEED_USER_ID.`
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
      name: "My workspace",
      description: "Created by db:seed:sample-board",
      ownerId: userId,
    },
  });
  console.log(`Created workspace ${created.id} (user had none).`);
  return created.id;
}

function parseBoardJson(raw: string): JBoard {
  const data = JSON.parse(raw) as unknown;
  if (!data || typeof data !== "object" || !("lists" in data)) {
    throw new Error("JSON must be a board object with a lists array");
  }
  return data as JBoard;
}

function resolveAssigneeId(card: JCard, userId: string): string | null {
  if (card.assigneeId === null || card.assigneeId === undefined) {
    return null;
  }
  if (typeof card.assigneeId === "string" && card.assigneeId.length > 0) {
    return userId;
  }
  return null;
}

async function seedCardGraph(
  tx: Prisma.TransactionClient,
  card: JCard,
  ctx: { listId: string; boardId: string; userId: string }
): Promise<void> {
  const assigneeId = resolveAssigneeId(card, ctx.userId);

  const createdCard = await tx.card.create({
    data: {
      name: card.name,
      description: card.description ?? undefined,
      pos: card.pos,
      closed: card.closed ?? false,
      dueDate: card.dueDate ? new Date(card.dueDate) : undefined,
      listId: ctx.listId,
      boardId: ctx.boardId,
      assigneeId,
    },
  });

  for (const c of card.comments) {
    await tx.comment.create({
      data: {
        text: c.text,
        cardId: createdCard.id,
        authorId: ctx.userId,
      },
    });
  }

  for (const cl of card.checklists) {
    const createdCl = await tx.checklist.create({
      data: {
        name: cl.name,
        pos: cl.pos,
        cardId: createdCard.id,
      },
    });
    for (const item of cl.items) {
      await tx.checkItem.create({
        data: {
          name: item.name,
          pos: item.pos,
          completed: item.completed ?? false,
          checklistId: createdCl.id,
        },
      });
    }
  }
}

async function main() {
  if (!SEED_USER_ID) {
    console.error("Set SEED_USER_ID to your User.id UUID (database id).");
    process.exit(1);
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is required in apps/api/.env");
    process.exit(1);
  }

  const jsonPath = resolve(process.cwd(), SEED_JSON);
  let raw: string;
  try {
    raw = readFileSync(jsonPath, "utf8");
  } catch {
    console.error(`Could not read SEED_JSON at ${jsonPath}`);
    process.exit(1);
  }

  const sample = parseBoardJson(raw);

  const pool = new Pool({ connectionString });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    const user = await prisma.user.findUnique({
      where: { id: SEED_USER_ID },
    });
    if (!user) {
      console.error(`No User with id=${SEED_USER_ID}`);
      process.exit(1);
    }

    const workspaceId = await resolveWorkspaceId(prisma, user.id);

    const brightness =
      sample.backgroundBrightness === "dark" ? "dark" : "light";

    const result = await prisma.$transaction(async (tx) => {
      const board = await tx.board.create({
        data: {
          name: sample.name,
          // Omit JSON shortLink — it is @unique; re-seeding the same fixture would P2002.
          background: sample.background ?? undefined,
          backgroundImage: sample.backgroundImage ?? undefined,
          backgroundBrightness: brightness as BoardBackgroundBrightness,
          backgroundBottomColor: sample.backgroundBottomColor ?? undefined,
          backgroundTopColor: sample.backgroundTopColor ?? undefined,
          backgroundColor: sample.backgroundColor ?? undefined,
          starred: sample.starred ?? false,
          closed: sample.closed ?? false,
          userId: user.id,
          workspaceId,
        },
      });

      for (const list of sample.lists) {
        const createdList = await tx.list.create({
          data: {
            name: list.name,
            pos: list.pos,
            closed: list.closed ?? false,
            boardId: board.id,
          },
        });

        const cardCtx = {
          listId: createdList.id,
          boardId: board.id,
          userId: user.id,
        };
        for (const card of list.cards) {
          await seedCardGraph(tx, card, cardCtx);
        }
      }

      return { boardId: board.id, workspaceId, userId: user.id };
    });

    console.log("Sample board seeded. New board id:\n");
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
