import { Inject, Injectable } from '@nestjs/common';
import { eq, max } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { randomUUID } from 'node:crypto';
import { list as boardList } from '../board/schema';
import { appSchema } from '../database/app-schema';
import { DATABASE_CONNECTION } from '../database/database-connection';
import { KanbanAccessService } from '../kanban-access/kanban-access.service';

@Injectable()
export class ListsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof appSchema>,
    private readonly access: KanbanAccessService,
  ) {}

  private async nextPos(boardId: string): Promise<number> {
    const [row] = await this.db
      .select({ m: max(boardList.pos) })
      .from(boardList)
      .where(eq(boardList.boardId, boardId));
    const current = row?.m;
    return typeof current === 'number' ? current + 1000 : 0;
  }

  async create(userId: string, boardId: string, name: string, pos?: number) {
    await this.access.requireBoardForUser(boardId, userId);
    const id = randomUUID();
    const now = new Date();
    const resolvedPos = pos ?? (await this.nextPos(boardId));
    const [row] = await this.db
      .insert(boardList)
      .values({
        id,
        name,
        boardId,
        pos: resolvedPos,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return row;
  }

  async findAllOnBoard(userId: string, boardId: string) {
    await this.access.requireBoardForUser(boardId, userId);
    return this.db
      .select()
      .from(boardList)
      .where(eq(boardList.boardId, boardId))
      .orderBy(boardList.pos);
  }
}
