"use client";

import { authClient } from "@/lib/auth-client";
import { useQuery } from "convex/react";
import dynamic from "next/dynamic";
import { api } from "../../../convex/_generated/api";

const ClientPDFViewer = dynamic(() => import("./ClientPDFViewer"), {
  ssr: false,
});

export default function AuthenticatedHome() {
  const tasks = useQuery(api.tasks.get);
  //const currentUser = useQuery(api.auth.getForCurrentUser);

  const handleLogout = async () => {
    await authClient.signOut();
    // Optionally redirect or refresh
    window.location.href = "/";
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>Welcome back!</h1>
      {tasks?.map(({ _id, text }) => (
        <div key={_id}>{text}</div>
      ))}

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
