import {
  boardTemplateDefinitionSchema,
  type BoardTemplateDefinition,
} from "./board-template.schema";
import simpleKanban from "./data/simple-kanban.template.json";

const rawTemplates = [simpleKanban];

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
}[] {
  return [...definitions.values()].map(({ id, title, description }) => ({
    id,
    title,
    ...(description !== undefined ? { description } : {}),
  }));
}

export function getBoardTemplateById(
  id: string
): BoardTemplateDefinition | undefined {
  return definitions.get(id);
}
