"use client";

import { useCallback, useState } from "react";
import type { User } from "@/lib/types";
import { api } from "@/lib/api";
import SmoothScroll from "./SmoothScroll";
import LoginScreen from "./LoginScreen";
import ListScreen from "./ListScreen";
import AppUpdater from "./AppUpdater";

/** Uitnodigingslink (?join=code): family = null betekent een ongeldige of vervangen link. */
export type Invite = { code: string; family: string | null; open: boolean };

type Props = { user: User | null; registrationOpen: boolean; invite: Invite | null; hasUsers: boolean; needsSetupCode: boolean };

export default function Root(props: Props) {
  const [user, setUser] = useState<User | null>(props.user);
  const [invite, setInvite] = useState(props.invite); // na inloggen of uitloggen hoort de link niet meer mee te komen

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
          invite={invite}
          hasUsers={props.hasUsers}
          needsSetupCode={props.needsSetupCode}
          onAuthed={(u) => {
            setInvite(null);
            setUser(u);
          }}
        />
      )}
    </SmoothScroll>
  );
}
