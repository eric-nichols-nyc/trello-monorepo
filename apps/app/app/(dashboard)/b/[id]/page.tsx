import { BoardPageContent } from "../_components/board-page-content";

type BoardPageProperties = {
  params: Promise<{ id: string }>;
};

export default async function BoardPage({ params }: BoardPageProperties) {
  const { id } = await params;
  return <BoardPageContent boardId={id} />;
}
