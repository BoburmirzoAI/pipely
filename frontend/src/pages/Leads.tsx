import { PageHeader } from "../components/PageHeader";

export function Leads() {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <PageHeader icon="users" title="Leads" />
      <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
        Leads list — coming up next.
      </div>
    </div>
  );
}
