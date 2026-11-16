"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";
import type { ReactNode } from "react";
import { authClient } from "@/lib/auth-client";

type AppSession = typeof authClient.$Infer.Session;
type SessionState = ReturnType<typeof authClient.useSession>;

export type SessionUser = AppSession["user"];
export type SessionDetails = AppSession["session"];

type SessionContextValue = {
  /** The logged-in user, or `undefined` when signed out. */
  user: SessionUser | undefined;
  /** The active session record (token, expiry, ip, ...) when available. */
  session: SessionDetails | undefined;
  isAuthenticated: boolean;
  /** `true` while the first session request is still in flight. */
  isPending: boolean;
  /** `true` while the session is being refreshed in the background. */
  isRefetching: boolean;
  error: SessionState["error"];
  /** Re-fetch the session from the server. */
  refetch: SessionState["refetch"];
  /** Sign the current user out and refresh the session state. */
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { data, isPending, isRefetching, error, refetch } =
    authClient.useSession();

  const signOut = useCallback(async () => {
    const { error: signOutError } = await authClient.signOut();

    if (signOutError) {
      throw signOutError;
    }

    await refetch();
  }, [refetch]);

  const value = useMemo<SessionContextValue>(
    () => ({
      user: data?.user,
      session: data?.session,
      isAuthenticated: Boolean(data?.user),
      isPending,
      isRefetching,
      error,
      refetch,
      signOut,
    }),
    [data, isPending, isRefetching, error, refetch, signOut],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

/**
 * Access the logged-in user and session anywhere below `<SessionProvider />`.
 *
 * ```tsx
 * const { user, isAuthenticated, isPending, signOut } = useSessionContext();
 * ```
 */
export function useSessionContext() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error(
      "useSessionContext must be used inside a <SessionProvider />.",
    );
  }

  return context;
}
