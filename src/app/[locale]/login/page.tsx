"use client";

import { authClient } from "@/lib/auth-client";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <button
        onClick={() =>
          authClient.signIn.social({
            provider: "linkedin",
            callbackURL: "/",
          })
        }
      >
        Login via Linkedin
      </button>
    </main>
  );
}
