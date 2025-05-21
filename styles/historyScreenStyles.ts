import { StyleSheet, Platform } from "react-native";
import { colors } from "./theme";

export const historyScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 12,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
    paddingTop: 30,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  averagesHeader: {
    marginTop: 30,
    marginBottom: 16,
  },
  footer: {
    marginTop: 0,
    padding: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  footerTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  statCard: {
    padding: 12,
    backgroundColor: colors.card,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
    alignItems: "flex-start",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: "center",
    padding: 20,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  tooltipText: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 8,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
});
