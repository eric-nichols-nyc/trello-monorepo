import { Inject, Injectable } from '@nestjs/common';
import { eq, max } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { randomUUID } from 'node:crypto';
import { card } from '../board/schema';
import { appSchema } from '../database/app-schema';
import { DATABASE_CONNECTION } from '../database/database-connection';
import { KanbanAccessService } from '../kanban-access/kanban-access.service';
import { allocateUniqueShortLink } from '../lib/random-short-link';

@Injectable()
export class CardsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof appSchema>,
    private readonly access: KanbanAccessService,
  ) {}

  private async nextPos(listId: string): Promise<number> {
    const [row] = await this.db
      .select({ m: max(card.pos) })
      .from(card)
      .where(eq(card.listId, listId));
    const current = row?.m;
    return typeof current === 'number' ? current + 1000 : 0;
  }

  async create(
    userId: string,
    listId: string,
    name: string,
    description?: string,
    pos?: number,
    shortLink?: string,
  ) {
    const listRow = await this.access.requireListForUser(listId, userId);
    const id = randomUUID();
    const now = new Date();
    const resolvedPos = pos ?? (await this.nextPos(listId));
    const explicit = shortLink?.trim();
    const resolvedShortLink =
      explicit ??
      (await allocateUniqueShortLink(async (slug) => {
        const [r] = await this.db
          .select({ id: card.id })
          .from(card)
          .where(eq(card.shortLink, slug))
          .limit(1);
        return !!r;
      }));
    const [row] = await this.db
      .insert(card)
      .values({
        id,
        name,
        description: description ?? null,
        listId,
        boardId: listRow.boardId,
        shortLink: resolvedShortLink,
        pos: resolvedPos,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return row;
  }

  async findAllInList(userId: string, listId: string) {
    await this.access.requireListForUser(listId, userId);
    return this.db
      .select()
      .from(card)
      .where(eq(card.listId, listId))
      .orderBy(card.pos);
  }
}
