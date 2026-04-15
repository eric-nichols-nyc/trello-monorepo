import {
  type BoardTemplateDefinition,
  boardTemplateDefinitionSchema,
} from "./board-template.schema";
import remoteTeamMeeting from "./data/remote-team-meeting.template.json";
import simpleKanban from "./data/simple-kanban.template.json";
import teachinWeeklyPlanning101 from "./data/teachin-weekly-planning-101.template.json";

// Source JSON payloads for built-in templates.
const rawTemplates = [
  simpleKanban,
  remoteTeamMeeting,
  teachinWeeklyPlanning101,
];

// Runtime registry keyed by template id.
const definitions = new Map<string, BoardTemplateDefinition>();

function parseOne(raw: unknown): BoardTemplateDefinition {
  return boardTemplateDefinitionSchema.parse(raw);
}

// Validate every template at startup and fail fast on duplicate ids.
for (const raw of rawTemplates) {
  const def = parseOne(raw);
  if (definitions.has(def.id)) {
    throw new Error(`Duplicate board template id: ${def.id}`);
  }
  definitions.set(def.id, def);
}

// Catalog view returned to clients (intentionally omits full board payload).
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

// Fetch the full template definition by id for board creation.
export function getBoardTemplateById(
  id: string
): BoardTemplateDefinition | undefined {
  return definitions.get(id);
}
