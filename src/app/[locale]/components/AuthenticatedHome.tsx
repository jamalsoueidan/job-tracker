"use client";

import { authClient } from "@/lib/auth-client";
import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import dynamic from "next/dynamic";

const ClientPDFViewer = dynamic(() => import("./ClientPDFViewer"), {
  ssr: false,
});

export default function AuthenticatedHome() {
  const currentUser = useQuery(api.auth.getCurrentUser);

  const handleLogout = async () => {
    await authClient.signOut();
    // Optionally redirect or refresh
    window.location.href = "/";
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>Welcome back! {currentUser?.name}</h1>

      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Logout
      </button>

      <ClientPDFViewer />
    </main>
  );
}
