import { Inject, Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { randomUUID } from 'node:crypto';
import { workspace } from '../board/schema';
import { appSchema } from '../database/app-schema';
import { DATABASE_CONNECTION } from '../database/database-connection';
import { allocateUniqueShortLink } from '../lib/random-short-link';

@Injectable()
export class WorkspacesService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof appSchema>,
  ) {}

  async create(
    userId: string,
    name: string,
    description?: string,
    shortLink?: string,
  ) {
    const id = randomUUID();
    const now = new Date();
    const explicit = shortLink?.trim();
    const resolvedShortLink =
      explicit ??
      (await allocateUniqueShortLink(async (slug) => {
        const [r] = await this.db
          .select({ id: workspace.id })
          .from(workspace)
          .where(eq(workspace.shortLink, slug))
          .limit(1);
        return !!r;
      }));
    const [row] = await this.db
      .insert(workspace)
      .values({
        id,
        name,
        description: description ?? null,
        shortLink: resolvedShortLink,
        ownerId: userId,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return row;
  }

  async findAllForUser(userId: string) {
    return this.db
      .select()
      .from(workspace)
      .where(eq(workspace.ownerId, userId))
      .orderBy(desc(workspace.updatedAt));
  }
}
