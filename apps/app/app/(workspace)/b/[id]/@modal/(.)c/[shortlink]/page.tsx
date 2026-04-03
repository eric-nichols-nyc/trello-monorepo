import { loadCardForBoardRoute } from "@/lib/api/cards/load-card-for-board-route";

import { CardRouteDetail } from "../../../_components/card-route-detail";

type CardModalInterceptPageProps = {
  params: Promise<{ id: string; shortlink: string }>;
};

export default async function CardModalInterceptPage({
  params,
}: CardModalInterceptPageProps) {
  const { id: boardKey, shortlink } = await params;
  const { card, listName, boardName } = await loadCardForBoardRoute(
    boardKey,
    shortlink
  );

  return (
    <CardRouteDetail
      boardKey={boardKey}
      boardName={boardName}
      card={card}
      listName={listName}
      mode="modal"
    />
  );
}
