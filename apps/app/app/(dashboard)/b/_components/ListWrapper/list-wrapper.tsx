import { ListCards } from "../ListCards/list-cards";
import { ListFooter } from "./list-footer";
import { ListHeader } from "./list-header";

export const ListWrapper = () => (
  <div className="flex flex-col gap-2 rounded-lg bg-[rgb(16,18,4)]">
    <ListHeader />
    <ListCards />
    <ListFooter />
  </div>
);
