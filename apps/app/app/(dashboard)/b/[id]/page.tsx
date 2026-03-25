type BoardPageProperties = {
  params: Promise<{ id: string }>;
};

export default async function BoardPage({ params }: BoardPageProperties) {
  const { id } = await params;
  return <div>I am the board page. Board ID: {id}</div>;
}
