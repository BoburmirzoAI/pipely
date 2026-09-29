import { PageHeader } from "../components/PageHeader";

export function Dashboard() {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <PageHeader icon="dash" title="Dashboard" />
      <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
        Dashboard — coming soon.
      </div>
    </div>
  );
}
