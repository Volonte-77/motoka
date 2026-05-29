import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { Package, Trip, Agency } from "@/types";

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: "Helvetica" },
  header: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: "#eee", paddingBottom: 10 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  subtitle: { fontSize: 10, color: "#666", textTransform: "uppercase" },
  section: { marginBottom: 15 },
  label: { fontSize: 8, color: "#999", textTransform: "uppercase", marginBottom: 2 },
  value: { fontSize: 11, fontWeight: "bold" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  col: { flex: 1 },
  footer: { marginTop: 30, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#eee", textAlign: "center", fontSize: 8, color: "#999" },
  otpBox: { marginTop: 20, padding: 10, backgroundColor: "#f0fdf4", borderBottomWidth: 2, borderBottomColor: "#10b981", textAlign: "center" },
  otpLabel: { fontSize: 8, color: "#166534", fontWeight: "bold" },
  otpValue: { fontSize: 24, fontWeight: "bold", color: "#166534" },
  qrPlaceholder: { width: 60, height: 60, backgroundColor: "#eee", alignSelf: "flex-end" }
});

export const PackageReceipt = ({ pkg, agency }: { pkg: Package, agency: Agency }) => (
  <Document>
    <Page size={[300, 450]} style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>{agency.name}</Text>
        <Text style={styles.subtitle}>Bordereau d'Expédition Colis</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>N° Suivi</Text>
          <Text style={styles.value}>{pkg.id}</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{new Date().toLocaleDateString()}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Expéditeur</Text>
        <Text style={styles.value}>{pkg.sender}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Destinataire</Text>
        <Text style={styles.value}>{pkg.receiver}</Text>
        <Text style={{ fontSize: 9 }}>Tél: {pkg.phoneReceiver}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Contenu</Text>
        <Text style={styles.value}>{pkg.description}</Text>
        <Text style={{ fontSize: 9 }}>Itinéraire: {pkg.route}</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Poids</Text>
          <Text style={styles.value}>{pkg.weight}</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Valeur</Text>
          <Text style={styles.value}>{pkg.value}</Text>
        </View>
      </View>

      <View style={styles.otpBox}>
        <Text style={styles.otpLabel}>CODE DE RÉCUPÉRATION (OTP)</Text>
        <Text style={styles.otpValue}>{pkg.otp}</Text>
      </View>

      <View style={styles.footer}>
        <Text>Merci de votre confiance. Gardez ce reçu précieusement.</Text>
        <Text>Généré par Motoka Transport Management System</Text>
      </View>
    </Page>
  </Document>
);

export const TripTicket = ({ trip, agency }: { trip: Trip, agency: Agency }) => (
  <Document>
    <Page size={[300, 400]} style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>{agency.name}</Text>
        <Text style={styles.subtitle}>Ticket de Voyage / Facture</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>N° Ticket</Text>
          <Text style={styles.value}>{trip.id.toUpperCase()}</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{new Date().toLocaleDateString()}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Itinéraire</Text>
        <Text style={{ fontSize: 14, fontWeight: "bold" }}>{trip.route}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Date & Heure de Départ</Text>
        <Text style={styles.value}>{trip.departureTime.replace("T", " à ")}</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Chauffeur</Text>
          <Text style={styles.value}>{trip.driver}</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Véhicule</Text>
          <Text style={styles.value}>{trip.vehicle}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Passagers</Text>
        <Text style={styles.value}>{trip.passengers} PAX</Text>
      </View>

      <View style={styles.footer}>
        <Text>Bon voyage avec {agency.name} !</Text>
        <Text>Ce ticket fait office de facture.</Text>
      </View>
    </Page>
  </Document>
);
