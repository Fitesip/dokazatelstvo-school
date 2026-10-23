"use client";

import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={async () => {
        await authClient.signOut();
        window.location.href = "/";
      }}
      className="cursor-pointer text-[14px] text-blue underline-offset-4 transition hover:underline"
    >
      Выйти
    </button>
  );
}
