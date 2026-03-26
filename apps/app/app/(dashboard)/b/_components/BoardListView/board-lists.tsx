import { ListWrapper } from "../ListWrapper/list-wrapper";

export const BoardLists = () => (
  <ul className="flex list-none gap-4 p-0">
    <li className="w-[270px] shrink-0">
      <ListWrapper />
    </li>
    <li className="w-[270px] shrink-0">
      <ListWrapper />
    </li>
    <li className="w-[270px] shrink-0">
      <ListWrapper />
    </li>
    <li className="w-[270px] shrink-0">
      <ListWrapper />
    </li>
  </ul>
);
