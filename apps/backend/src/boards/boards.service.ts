import { Inject, Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { randomUUID } from 'node:crypto';
import { board } from '../board/schema';
import { appSchema } from '../database/app-schema';
import { DATABASE_CONNECTION } from '../database/database-connection';
import { KanbanAccessService } from '../kanban-access/kanban-access.service';
import { allocateUniqueShortLink } from '../lib/random-short-link';

@Injectable()
export class BoardsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof appSchema>,
    private readonly access: KanbanAccessService,
  ) {}

  async create(
    userId: string,
    workspaceId: string,
    name: string,
    opts?: {
      shortLink?: string;
      background?: string;
      backgroundImage?: string;
    },
  ) {
    await this.access.requireWorkspaceForUser(workspaceId, userId);
    const id = randomUUID();
    const now = new Date();
    const explicit = opts?.shortLink?.trim();
    const resolvedShortLink =
      explicit ??
      (await allocateUniqueShortLink(async (slug) => {
        const [r] = await this.db
          .select({ id: board.id })
          .from(board)
          .where(eq(board.shortLink, slug))
          .limit(1);
        return !!r;
      }));
    const [row] = await this.db
      .insert(board)
      .values({
        id,
        name,
        workspaceId,
        userId,
        shortLink: resolvedShortLink,
        background: opts?.background ?? null,
        backgroundImage: opts?.backgroundImage ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return row;
  }

  async findAllInWorkspace(userId: string, workspaceId: string) {
    await this.access.requireWorkspaceForUser(workspaceId, userId);
    return this.db
      .select()
      .from(board)
      .where(eq(board.workspaceId, workspaceId))
      .orderBy(desc(board.updatedAt));
  }
}
