import { useQuery } from "@tanstack/react-query";

import { usersApi } from "../../api/users";
import { Icon } from "../Icon";
import { Popover } from "../Popover";

export function AssignSelect({
  currentOwnerId,
  onAssign,
}: {
  currentOwnerId: number;
  onAssign: (userId: number) => void;
}) {
  const { data } = useQuery({
    queryKey: ["assignable-users"],
    queryFn: () => usersApi.list({ page_size: 100 }),
    staleTime: 60_000,
  });
  const users = (data?.data ?? []).filter((u) => u.is_active);

  return (
    <Popover
      width={200}
      trigger={() => (
        <button className="btn-secondary">
          <Icon name="user" size={14} />
          Assign
          <Icon name="chevdown" size={13} />
        </button>
      )}
    >
      {(close) => (
        <div className="flex max-h-64 flex-col overflow-auto">
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => {
                if (u.id !== currentOwnerId) onAssign(u.id);
                close();
              }}
              className="flex items-center justify-between rounded px-2 py-1.5 text-left text-[13px] hover:bg-[#F6F6F7]"
            >
              {u.username}
              {u.id === currentOwnerId && (
                <Icon name="check" size={14} stroke="#4F46E5" strokeWidth={2.4} />
              )}
            </button>
          ))}
          {users.length === 0 && (
            <div className="px-2 py-1.5 text-[13px] text-gray-400">No users</div>
          )}
        </div>
      )}
    </Popover>
  );
}
