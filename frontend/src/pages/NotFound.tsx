import { Link } from "react-router-dom";

import { Icon } from "../components/Icon";

export function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <Icon name="inbox" size={32} stroke="#9CA3AF" />
      <div className="text-lg font-semibold text-ink">Page not found</div>
      <div className="text-sm text-gray-500">
        The page you're looking for doesn't exist.
      </div>
      <Link to="/leads" className="btn-primary mt-1">
        Back to leads
      </Link>
    </div>
  );
}
