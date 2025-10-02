// app/page.tsx (Server Component - remove "use client")

import { getToken } from "@/lib/auth-server";
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";
import { fetchQuery } from "convex/nextjs";
import Link from "next/link";
import { api } from "../../convex/_generated/api";
import AuthenticatedHome from "./components/AuthenticatedHome";
import PDFViewerClient from "./components/PDFViewer";

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "#fff",
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
});

function MyDoc() {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text>Section #1</Text>
        </View>
        <View style={styles.section}>
          <Text>Section #2</Text>
        </View>
      </Page>
    </Document>
  );
}

export default async function Home() {
  const token = await getToken();
  const currentUser = await fetchQuery(api.auth.getCurrentUser, {}, { token });

  if (currentUser === undefined) {
    return <div>Loading...</div>;
  }

  if (currentUser === null) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1>Please log in</h1>
        <Link href="/login">Go to Login</Link>
      </main>
    );
  }

  const blob = await pdf(<MyDoc />).toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  return (
    <>
      <PDFViewerClient base64={base64} />
      <AuthenticatedHome />
    </>
  );
}
