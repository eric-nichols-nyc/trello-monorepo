import { InternalServerErrorException } from "@nestjs/common";
import type { PrismaClient } from "../../generated/prisma/client";
import { randomShortLink } from "../common/short-link";

/** Picks a fresh `shortLink` not yet used by any workspace (retries on rare collisions). */
export async function allocateUniqueWorkspaceShortLink(
  db: Pick<PrismaClient, "workspace">
): Promise<string> {
  for (let attempt = 0; attempt < 12; attempt++) {
    const candidate = randomShortLink();
    const taken = await db.workspace.findUnique({
      where: { shortLink: candidate },
      select: { id: true },
    });
    if (!taken) {
      return candidate;
    }
  }
  throw new InternalServerErrorException(
    "Could not allocate a unique workspace shortLink; try again."
  );
}
