import {
  boolean,
  doublePrecision,
  index,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "../auth/schema";

export const boardBackgroundBrightness = pgEnum("board_background_brightness", [
  "light",
  "dark",
]);

export const workspace = pgTable(
  "workspace",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    shortLink: text("short_link").unique(),
    description: text("description"),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (t) => [index("workspace_owner_id_idx").on(t.ownerId)],
);

export const board = pgTable(
  "board",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    shortLink: text("short_link").unique(),
    background: text("background"),
    backgroundImage: text("background_image"),
    backgroundBrightness: boardBackgroundBrightness("background_brightness")
      .notNull()
      .default("light"),
    backgroundBottomColor: text("background_bottom_color"),
    backgroundTopColor: text("background_top_color"),
    backgroundColor: text("background_color"),
    starred: boolean("starred").notNull().default(false),
    closed: boolean("closed").notNull().default(false),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (t) => [
    index("board_workspace_id_idx").on(t.workspaceId),
    index("board_user_id_idx").on(t.userId),
  ],
);

export const list = pgTable(
  "list",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    pos: doublePrecision("pos").notNull(),
    closed: boolean("closed").notNull().default(false),
    boardId: text("board_id")
      .notNull()
      .references(() => board.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (t) => [index("list_board_id_idx").on(t.boardId)],
);

export const card = pgTable(
  "card",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    pos: doublePrecision("pos").notNull(),
    closed: boolean("closed").notNull().default(false),
    completed: boolean("completed").notNull().default(false),
    dueDate: timestamp("due_date"),
    shortLink: text("short_link").unique(),
    coverColor: text("cover_color"),
    coverImage: text("cover_image"),
    listId: text("list_id")
      .notNull()
      .references(() => list.id, { onDelete: "cascade" }),
    boardId: text("board_id")
      .notNull()
      .references(() => board.id, { onDelete: "cascade" }),
    assigneeId: text("assignee_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (t) => [
    index("card_board_id_idx").on(t.boardId),
    index("card_list_id_idx").on(t.listId),
    index("card_assignee_id_idx").on(t.assigneeId),
  ],
);

export const label = pgTable(
  "label",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    color: text("color"),
    boardId: text("board_id")
      .notNull()
      .references(() => board.id, { onDelete: "cascade" }),
  },
  (t) => [index("label_board_id_idx").on(t.boardId)],
);

export const cardLabel = pgTable(
  "card_label",
  {
    cardId: text("card_id")
      .notNull()
      .references(() => card.id, { onDelete: "cascade" }),
    labelId: text("label_id")
      .notNull()
      .references(() => label.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.cardId, t.labelId] })],
);

export const checklist = pgTable(
  "checklist",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    pos: doublePrecision("pos").notNull(),
    cardId: text("card_id")
      .notNull()
      .references(() => card.id, { onDelete: "cascade" }),
  },
  (t) => [index("checklist_card_id_idx").on(t.cardId)],
);

export const checkItem = pgTable(
  "check_item",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    pos: doublePrecision("pos").notNull(),
    completed: boolean("completed").notNull().default(false),
    checklistId: text("checklist_id")
      .notNull()
      .references(() => checklist.id, { onDelete: "cascade" }),
  },
  (t) => [index("check_item_checklist_id_idx").on(t.checklistId)],
);

export const comment = pgTable(
  "comment",
  {
    id: text("id").primaryKey(),
    text: text("text").notNull(),
    cardId: text("card_id")
      .notNull()
      .references(() => card.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (t) => [
    index("comment_card_id_idx").on(t.cardId),
    index("comment_author_id_idx").on(t.authorId),
  ],
);

export const attachment = pgTable(
  "attachment",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    url: text("url").notNull(),
    edgeColor: text("edge_color"),
    cardId: text("card_id")
      .notNull()
      .references(() => card.id, { onDelete: "cascade" }),
    uploadedById: text("uploaded_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (t) => [
    index("attachment_card_id_idx").on(t.cardId),
    index("attachment_uploaded_by_id_idx").on(t.uploadedById),
  ],
);
