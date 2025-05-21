import { StyleSheet, Platform } from "react-native";
import { colors } from "./theme";

export const mealScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100, // Extra padding at bottom
  },
  dateNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  navButton: {
    padding: 10,
    width: 44,
    alignItems: "center",
  },
  navButtonText: {
    color: colors.text,
    fontSize: 18,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  disabledText: {
    color: colors.border,
  },
  dateText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  dailyTotals: {
    padding: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: "center",
  },
  totalValue: {
    color: colors.text,
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  row: {
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 0,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 4,
    color: colors.text,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  values: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  rightAction: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-end",
    borderRadius: 0,
    marginBottom: 12,
    backgroundColor: colors.red,
  },
  leftAction: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    borderRadius: 0,
    marginBottom: 12,
    backgroundColor: colors.green,
  },
  actionButton: {
    padding: 16,
    width: 100,
    alignItems: "center",
  },
  actionText: {
    color: colors.text,
    fontWeight: "bold",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: "center",
    padding: 20,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  historyButtonContainer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  historyButton: {
    backgroundColor: colors.card,
    padding: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyButtonText: {
    color: colors.text,
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
});
