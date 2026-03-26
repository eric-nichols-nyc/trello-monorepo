/** Served from `public/test-data/board-detail.sample.json`. */
export const BOARD_DETAIL_SAMPLE_URL = "/test-data/board-detail.sample.json";

export const boardDetailSampleQueryKey = ["board", "detail", "sample"] as const;

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

export type BoardCard = {
  id: string;
  name: string;
  description: string | null;
  pos: number;
  closed: boolean;
  dueDate: string | null;
  listId: string;
  boardId: string;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
  comments: BoardComment[];
  checklists: BoardChecklist[];
};

export type BoardList = {
  id: string;
  name: string;
  pos: number;
  closed: boolean;
  boardId: string;
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

export async function fetchBoardDetailSample(): Promise<BoardDetail> {
  const response = await fetch(BOARD_DETAIL_SAMPLE_URL);
  if (!response.ok) {
    throw new Error(
      `Failed to load board sample (${response.status} ${response.statusText})`,
    );
  }
  return response.json() as Promise<BoardDetail>;
}
