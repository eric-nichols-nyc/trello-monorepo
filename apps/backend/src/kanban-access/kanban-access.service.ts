import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  board,
  list as boardList,
  workspace,
} from '../board/schema';
import { appSchema } from '../database/app-schema';
import { DATABASE_CONNECTION } from '../database/database-connection';

@Injectable()
export class KanbanAccessService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof appSchema>,
  ) {}

  async requireWorkspaceForUser(workspaceId: string, userId: string) {
    const [ws] = await this.db
      .select()
      .from(workspace)
      .where(eq(workspace.id, workspaceId))
      .limit(1);
    if (!ws) throw new NotFoundException('Workspace not found');
    if (ws.ownerId !== userId) throw new ForbiddenException();
    return ws;
  }

  async requireBoardForUser(boardId: string, userId: string) {
    const [row] = await this.db
      .select({ board: board, workspace: workspace })
      .from(board)
      .innerJoin(workspace, eq(board.workspaceId, workspace.id))
      .where(eq(board.id, boardId))
      .limit(1);
    if (!row) throw new NotFoundException('Board not found');
    if (row.workspace.ownerId !== userId) throw new ForbiddenException();
    return row.board;
  }

  async requireListForUser(listId: string, userId: string) {
    const [row] = await this.db
      .select({ list: boardList, board: board, workspace: workspace })
      .from(boardList)
      .innerJoin(board, eq(boardList.boardId, board.id))
      .innerJoin(workspace, eq(board.workspaceId, workspace.id))
      .where(eq(boardList.id, listId))
      .limit(1);
    if (!row) throw new NotFoundException('List not found');
    if (row.workspace.ownerId !== userId) throw new ForbiddenException();
    return row.list;
  }
}
