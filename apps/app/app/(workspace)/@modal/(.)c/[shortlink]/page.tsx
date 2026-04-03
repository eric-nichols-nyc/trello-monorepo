import { loadCardRoute } from "@/lib/api/cards/load-card-route";

import { TrellnodeCardBack } from "../../../c/_components/CardBack/trellnode-card-back";

type CardModalInterceptPageProps = {
  params: Promise<{ shortlink: string }>;
};

export default async function CardModalInterceptPage({
  params,
}: CardModalInterceptPageProps) {
  const { shortlink } = await params;
  const { card, listName, boardName, boardRouteKey } =
    await loadCardRoute(shortlink);

  return (
    <TrellnodeCardBack
      boardName={boardName}
      boardRouteKey={boardRouteKey}
      card={card}
      listName={listName}
      mode="modal"
    />
  );
}
