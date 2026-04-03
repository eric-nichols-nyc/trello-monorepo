import { loadCardRoute } from "@/lib/api/cards/load-card-route";

import { TrellnodeCardBack } from "../_components/CardBack/trellnode-card-back";

type CardShortlinkPageProps = {
  params: Promise<{ shortlink: string }>;
};

export default async function CardShortlinkPage({
  params,
}: CardShortlinkPageProps) {
  const { shortlink } = await params;
  const { card, listName, boardName, boardRouteKey } =
    await loadCardRoute(shortlink);

  return (
    <TrellnodeCardBack
      boardName={boardName}
      boardRouteKey={boardRouteKey}
      card={card}
      listName={listName}
      mode="page"
    />
  );
}
