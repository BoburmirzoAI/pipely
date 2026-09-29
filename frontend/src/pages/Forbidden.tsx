import { Link } from "react-router-dom";

import { Icon } from "../components/Icon";

export function Forbidden() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <Icon name="alert" size={32} stroke="#DC2626" />
      <div className="text-lg font-semibold text-ink">Access denied</div>
      <div className="text-sm text-gray-500">
        You don't have permission to view this page.
      </div>
      <Link to="/leads" className="btn-primary mt-1">
        Back to leads
      </Link>
    </div>
  );
}
