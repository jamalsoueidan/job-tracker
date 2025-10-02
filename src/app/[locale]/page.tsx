// app/page.tsx (Server Component - remove "use client")

import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";
import ChangeTranslation from "./components/ChangeTranslation";
import PDFViewerClient from "./components/PDFViewer.client";
import Translation from "./components/Translation";

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
  const blob = await pdf(<MyDoc />).toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  return (
    <>
      <Translation />
      <ChangeTranslation />
      <PDFViewerClient base64={base64} />
    </>
  );
}
