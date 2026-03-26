import { TrelloBoard } from "../_components/Board/trello-board";

type BoardPageProperties = {
  params: Promise<{ id: string }>;
};

export default async function BoardPage({ params }: BoardPageProperties) {
  await params;
  return <TrelloBoard />;
}
