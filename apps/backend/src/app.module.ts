import { Module } from '@nestjs/common';
import { AuthModule } from '@mguay/nestjs-better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { betterAuth } from 'better-auth';
import { ConfigModule } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { workspace } from './board/schema';
import { allocateUniqueShortLink } from './lib/random-short-link';
import { DATABASE_CONNECTION } from './database/database-connection';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DatabaseModule } from './database/database.module';
import { BoardsModule } from './boards/boards.module';
import { CardsModule } from './cards/cards.module';
import { ListsModule } from './lists/lists.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    AuthModule.forRootAsync({
      useFactory: (database: NodePgDatabase) => {
        const baseURL =
          process.env.BETTER_AUTH_URL ?? 'http://localhost:3000';
        return {
          auth: betterAuth({
            baseURL,
            database: drizzleAdapter(database, {
              provider: 'pg',
            }),
            emailAndPassword: {
              enabled: true,
            },
            trustedOrigins: [
              'http://localhost:3000',
              'http://localhost:3001',
            ],
            databaseHooks: {
              user: {
                create: {
                  after: async (user) => {
                    const id = randomUUID();
                    const now = new Date();
                    const label = user.name?.trim();
                    const shortLink = await allocateUniqueShortLink(
                      async (slug) => {
                        const [r] = await database
                          .select({ id: workspace.id })
                          .from(workspace)
                          .where(eq(workspace.shortLink, slug))
                          .limit(1);
                        return !!r;
                      },
                    );
                    await database.insert(workspace).values({
                      id,
                      name: label ? `${label}'s workspace` : 'My workspace',
                      description: null,
                      shortLink,
                      ownerId: user.id,
                      createdAt: now,
                      updatedAt: now,
                    });
                  },
                },
              },
            },
          }),
        };
      },
      inject: [DATABASE_CONNECTION],
    }),
    UsersModule,
    WorkspacesModule,
    BoardsModule,
    ListsModule,
    CardsModule,
  ],
})
export class AppModule {}
