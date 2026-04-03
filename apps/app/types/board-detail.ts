import type { CardOrderingRow, ListOrderingRow } from "@repo/schemas";

export type BoardCommentAuthor = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  imageUrl: string | null;
};

export type BoardComment = {
  id: string;
  text: string;
  cardId: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: BoardCommentAuthor;
};

export type BoardChecklistItem = {
  id: string;
  name: string;
  pos: number;
  completed: boolean;
  checklistId: string;
};

export type BoardChecklist = {
  id: string;
  name: string;
  pos: number;
  cardId: string;
  items: BoardChecklistItem[];
};

/** Card row from the API; ordering fields match Prisma `Card` and {@link CardOrderingRow}. */
export type BoardCard = CardOrderingRow & {
  name: string;
  description: string | null;
  closed: boolean;
  dueDate: string | null;
  shortLink: string;
  coverColor: string | null;
  coverImage: string | null;
  boardId: string;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
  comments: BoardComment[];
  checklists: BoardChecklist[];
};

/** List column from the API; ordering fields match Prisma `List` and {@link ListOrderingRow}. */
export type BoardList = ListOrderingRow & {
  name: string;
  closed: boolean;
  createdAt: string;
  updatedAt: string;
  cards: BoardCard[];
};

export type BoardDetail = {
  id: string;
  name: string;
  shortLink: string;
  background: string | null;
  backgroundImage: string | null;
  backgroundBrightness: string;
  backgroundBottomColor: string | null;
  backgroundTopColor: string | null;
  backgroundColor: string | null;
  starred: boolean;
  closed: boolean;
  userId: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  lists: BoardList[];
};

function normalizeBoardCommentAuthor(raw: unknown): BoardCommentAuthor {
  const a = raw as Record<string, unknown>;
  return {
    id: String(a.id),
    email: String(a.email ?? ""),
    firstName: String(a.firstName ?? ""),
    lastName: String(a.lastName ?? ""),
    imageUrl:
      a.imageUrl === null || a.imageUrl === undefined
        ? null
        : String(a.imageUrl),
  };
}

function normalizeBoardComment(raw: unknown): BoardComment {
  const c = raw as Record<string, unknown>;
  return {
    id: String(c.id),
    text: String(c.text),
    cardId: String(c.cardId),
    authorId: String(c.authorId),
    createdAt: String(c.createdAt),
    updatedAt: String(c.updatedAt),
    author: normalizeBoardCommentAuthor(c.author),
  };
}

function normalizeBoardChecklist(raw: unknown): BoardChecklist {
  const cl = raw as Record<string, unknown>;
  const items = Array.isArray(cl.items) ? cl.items : [];
  return {
    id: String(cl.id),
    name: String(cl.name),
    pos: Number(cl.pos),
    cardId: String(cl.cardId),
    items: items.map((item) => {
      const i = item as Record<string, unknown>;
      return {
        id: String(i.id),
        name: String(i.name),
        pos: Number(i.pos),
        completed: Boolean(i.completed),
        checklistId: String(i.checklistId),
      };
    }),
  };
}

export function normalizeBoardCard(raw: unknown): BoardCard {
  const c = raw as Record<string, unknown>;
  return {
    id: String(c.id),
    name: String(c.name),
    description:
      c.description === null || c.description === undefined
        ? null
        : String(c.description),
    pos: Number(c.pos),
    closed: Boolean(c.closed),
    dueDate:
      c.dueDate === null || c.dueDate === undefined ? null : String(c.dueDate),
    shortLink: typeof c.shortLink === "string" ? c.shortLink : "",
    coverColor:
      c.coverColor === null || c.coverColor === undefined
        ? null
        : String(c.coverColor),
    coverImage:
      c.coverImage === null || c.coverImage === undefined
        ? null
        : String(c.coverImage),
    listId: String(c.listId),
    boardId: String(c.boardId),
    assigneeId:
      c.assigneeId === null || c.assigneeId === undefined
        ? null
        : String(c.assigneeId),
    createdAt: String(c.createdAt),
    updatedAt: String(c.updatedAt),
    comments: Array.isArray(c.comments)
      ? c.comments.map(normalizeBoardComment)
      : [],
    checklists: Array.isArray(c.checklists)
      ? c.checklists.map(normalizeBoardChecklist)
      : [],
  };
}

function normalizeBoardList(raw: unknown): BoardList {
  const l = raw as Record<string, unknown>;
  const cards = Array.isArray(l.cards) ? l.cards : [];
  return {
    id: String(l.id),
    name: String(l.name),
    pos: Number(l.pos),
    closed: Boolean(l.closed),
    boardId: String(l.boardId),
    createdAt: String(l.createdAt),
    updatedAt: String(l.updatedAt),
    cards: cards.map(normalizeBoardCard),
  };
}

/** Maps a Nest/Prisma board JSON payload into the shape the board UI expects. */
export function normalizeBoardDetailPayload(raw: unknown): BoardDetail {
  if (raw === null || typeof raw !== "object") {
    throw new Error("Invalid board payload");
  }
  const b = raw as Record<string, unknown>;
  const lists = Array.isArray(b.lists) ? b.lists : [];
  return {
    id: String(b.id),
    name: String(b.name),
    shortLink: typeof b.shortLink === "string" ? b.shortLink : "",
    background: (b.background as string | null | undefined) ?? null,
    backgroundImage: (b.backgroundImage as string | null | undefined) ?? null,
    backgroundBrightness: String(b.backgroundBrightness ?? "light"),
    backgroundBottomColor:
      (b.backgroundBottomColor as string | null | undefined) ?? null,
    backgroundTopColor:
      (b.backgroundTopColor as string | null | undefined) ?? null,
    backgroundColor: (b.backgroundColor as string | null | undefined) ?? null,
    starred: Boolean(b.starred),
    closed: Boolean(b.closed),
    userId: String(b.userId),
    workspaceId: String(b.workspaceId),
    createdAt: String(b.createdAt),
    updatedAt: String(b.updatedAt),
    lists: lists.map(normalizeBoardList),
  };
}

/**
 * Nest `PATCH /boards/:id` returns the updated `Board` row **without** `lists`.
 * Merge only scalar fields into the cached {@link BoardDetail} so rename (and
 * similar patches) match the server without wiping columns/cards.
 */
export function mergeBoardPatchResponseIntoDetail(
  previous: BoardDetail,
  patch: unknown,
): BoardDetail {
  if (patch === null || typeof patch !== "object") {
    return previous;
  }
  const p = patch as Record<string, unknown>;
  const next: BoardDetail = { ...previous };

  if (typeof p.name === "string") {
    next.name = p.name;
  }
  if (typeof p.shortLink === "string") {
    next.shortLink = p.shortLink;
  }
  if (p.background !== undefined) {
    next.background =
      p.background === null ? null : String(p.background);
  }
  if (p.backgroundImage !== undefined) {
    next.backgroundImage =
      p.backgroundImage === null ? null : String(p.backgroundImage);
  }
  if (typeof p.backgroundBrightness === "string") {
    next.backgroundBrightness = p.backgroundBrightness;
  }
  if (p.backgroundBottomColor !== undefined) {
    next.backgroundBottomColor =
      p.backgroundBottomColor === null
        ? null
        : String(p.backgroundBottomColor);
  }
  if (p.backgroundTopColor !== undefined) {
    next.backgroundTopColor =
      p.backgroundTopColor === null ? null : String(p.backgroundTopColor);
  }
  if (p.backgroundColor !== undefined) {
    next.backgroundColor =
      p.backgroundColor === null ? null : String(p.backgroundColor);
  }
  if (typeof p.starred === "boolean") {
    next.starred = p.starred;
  }
  if (typeof p.closed === "boolean") {
    next.closed = p.closed;
  }
  if (typeof p.updatedAt === "string") {
    next.updatedAt = p.updatedAt;
  }

  return next;
}
