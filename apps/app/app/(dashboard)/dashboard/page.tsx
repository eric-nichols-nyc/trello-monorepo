import { getMyBoards } from "@/lib/api/boards/get-boards";

export default async function DashboardPage() {
  const boards = await getMyBoards();

  return (
    <div>
      <pre style={{ whiteSpace: "pre-wrap" }}>
        {JSON.stringify(boards, null, 2)}
      </pre>
    </div>
  );
}
