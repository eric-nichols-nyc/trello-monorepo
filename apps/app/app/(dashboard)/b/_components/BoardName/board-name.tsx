type BoardNameProps = {
  name: string;
};

export const BoardName = ({ name }: BoardNameProps) => (
  <h1 className="font-bold text-foreground">{name}</h1>
);
