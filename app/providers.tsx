"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { useTheme } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        appearance: {
          theme: theme as "light" | "dark",
          accentColor: "hsl(var(--primary))",
          showWalletLoginFirst: false,
        },
        loginMethods: ["email", "wallet"],
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
