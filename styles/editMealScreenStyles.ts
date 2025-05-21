import { StyleSheet, Platform } from "react-native";
import { colors } from "./theme";

export const editMealScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    padding: 24,
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: colors.text,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 0,
    padding: 12,
    marginBottom: 12,
    fontSize: 18,
    color: colors.text,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    backgroundColor: colors.card,
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputHalf: {
    width: "48%",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  buttonPrimary: {
    backgroundColor: colors.green,
    borderRadius: 0,
    padding: 14,
    width: "48%",
    alignItems: "center",
  },
  buttonPrimaryText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  buttonOutline: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 0,
    padding: 14,
    width: "48%",
    alignItems: "center",
  },
  buttonOutlineText: {
    color: colors.text,
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
});
