import { loadCardRoute } from "@/lib/api/cards/load-card-route";

import { TrellnodeCardBackDialog } from "../_components/CardBack/trellnode-card-back-dialog";

type CardShortlinkPageProps = {
  params: Promise<{ shortlink: string }>;
};

export default async function CardShortlinkPage({
  params,
}: CardShortlinkPageProps) {
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
      mode="page"
    />
  );
}
