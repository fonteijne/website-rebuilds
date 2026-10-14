"use client";

import { useCallback, useState } from "react";
import type { User } from "@/lib/types";
import { api } from "@/lib/api";
import SmoothScroll from "./SmoothScroll";
import LoginScreen from "./LoginScreen";
import ListScreen from "./ListScreen";
import AppUpdater from "./AppUpdater";

type Props = { user: User | null; registrationOpen: boolean; hasUsers: boolean; needsSetupCode: boolean };

export default function Root(props: Props) {
  const [user, setUser] = useState<User | null>(props.user);

  const logout = useCallback(async () => {
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
  }, []);

  return (
    <SmoothScroll>
      <AppUpdater />
      {user ? (
        <ListScreen key={user.id} me={user} onLogout={logout} />
      ) : (
        <LoginScreen
          registrationOpen={props.registrationOpen}
          hasUsers={props.hasUsers}
          needsSetupCode={props.needsSetupCode}
          onAuthed={setUser}
        />
      )}
    </SmoothScroll>
  );
}
