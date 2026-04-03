import { loadCardRoute } from "@/lib/api/cards/load-card-route";

import { TrellnodeCardBackDialog } from "../../../c/_components/CardBack/trellnode-card-back-dialog";

type CardModalInterceptPageProps = {
  params: Promise<{ shortlink: string }>;
};

export default async function CardModalInterceptPage({
  params,
}: CardModalInterceptPageProps) {
  const { shortlink } = await params;
  const { card, boardLists, boardName, listName, boardRouteKey } =
    await loadCardRoute(shortlink);

  return (
    <TrellnodeCardBackDialog
      boardLists={boardLists}
      boardName={boardName}
      boardRouteKey={boardRouteKey}
      card={card}
      listName={listName}
      mode="modal"
    />
  );
}
