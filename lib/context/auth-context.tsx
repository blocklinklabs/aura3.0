"use client";

import { createContext, useContext, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  user: {
    id: string;
    name: string;
    email?: string;
    wallet?: string;
  } | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  user: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, user, login, logout } = usePrivy();

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authenticated,
        isLoading: !ready,
        login,
        logout,
        user: user
          ? {
              id: user.id,
              name: user.name,
              email: user.email?.address,
              wallet: user.wallet?.address,
            }
          : null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
