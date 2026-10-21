"use client";

import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    twoFactorClient({
      // при входе с включённой 2FA — на страницу ввода кода
      onTwoFactorRedirect() {
        const next = new URLSearchParams(window.location.search).toString();
        window.location.href = `/login/2fa${next ? `?${next}` : ""}`;
      },
    }),
  ],
});
