import {
  type BoardTemplateDefinition,
  boardTemplateDefinitionSchema,
} from "./board-template.schema";
import remoteTeamMeeting from "./data/remote-team-meeting.template.json";
import simpleKanban from "./data/simple-kanban.template.json";
import teachinWeeklyPlanning101 from "./data/teachin-weekly-planning-101.template.json";

const rawTemplates = [
  simpleKanban,
  remoteTeamMeeting,
  teachinWeeklyPlanning101,
];

const definitions = new Map<string, BoardTemplateDefinition>();

function parseOne(raw: unknown): BoardTemplateDefinition {
  return boardTemplateDefinitionSchema.parse(raw);
}

for (const raw of rawTemplates) {
  const def = parseOne(raw);
  if (definitions.has(def.id)) {
    throw new Error(`Duplicate board template id: ${def.id}`);
  }
  definitions.set(def.id, def);
}

export function listBoardTemplateCatalog(): {
  id: string;
  title: string;
  description?: string;
  backgroundImage?: string;
}[] {
  return [...definitions.values()].map(({ id, title, description, board }) => ({
    id,
    title,
    ...(description !== undefined ? { description } : {}),
    ...(board?.backgroundImage !== undefined && board.backgroundImage !== ""
      ? { backgroundImage: board.backgroundImage }
      : {}),
  }));
}

export function getBoardTemplateById(
  id: string
): BoardTemplateDefinition | undefined {
  return definitions.get(id);
}
