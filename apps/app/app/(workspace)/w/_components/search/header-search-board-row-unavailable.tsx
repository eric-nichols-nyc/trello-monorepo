type HeaderSearchBoardRowUnavailableProperties = {
  readonly title: string;
};

export const HeaderSearchBoardRowUnavailable = ({
  title,
}: HeaderSearchBoardRowUnavailableProperties) => (
  <li className="header-search-board-row w-full px-3 py-2">
    <span className="block w-full text-muted-foreground text-sm">{title}</span>
  </li>
);
