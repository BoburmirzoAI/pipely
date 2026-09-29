import { useState } from "react";

import { PageHeader } from "../components/PageHeader";
import { PasswordForm } from "../components/settings/PasswordForm";
import { ProfileForm } from "../components/settings/ProfileForm";
import { RolesMatrix } from "../components/settings/RolesMatrix";
import { UsersTable } from "../components/settings/UsersTable";
import { usePermissions } from "../hooks/usePermissions";

export function Settings() {
  const { has } = usePermissions();
  const tabs = [
    "Profile",
    "Password",
    ...(has("users.view") ? ["Users"] : []),
    ...(has("rbac.manage") ? ["Roles"] : []),
  ];
  const [active, setActive] = useState("Profile");

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <PageHeader icon="user" title="Settings" />
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6 flex gap-1 border-b border-line">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
                active === tab
                  ? "border-brand text-ink"
                  : "border-transparent text-gray-500 hover:text-ink"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {active === "Profile" && <ProfileForm />}
        {active === "Password" && <PasswordForm />}
        {active === "Users" && has("users.view") && <UsersTable />}
        {active === "Roles" && has("rbac.manage") && <RolesMatrix />}
      </div>
    </div>
  );
}
