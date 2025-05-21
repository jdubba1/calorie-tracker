import { StyleSheet, Platform, Dimensions } from 'react-native';
import { colors } from './theme';

// Get screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Function to calculate responsive sizes based on screen height
const getResponsiveSizes = () => {
  // Define thresholds for different size categories
  // iPhone SE (smallest): ~667pt height
  // Mid-size: ~736-812pt height  
  // Large (iPhone Pro Max): 926pt+ height
  
  if (SCREEN_HEIGHT < 700) {
    // Small screen (iPhone SE, etc)
    return {
      metricNumberSize: 64,
      metricInfoTextSize: 16,
      metricContainerHeight: 60,
      verticalMargin: 2,
    };
  } else if (SCREEN_HEIGHT < 850) {
    // Medium screen (iPhone X/11/12, etc)
    return {
      metricNumberSize: 70,
      metricInfoTextSize: 18,
      metricContainerHeight: 65,
      verticalMargin: 3,
    };
  } else {
    // Large screen (iPhone Pro Max, etc)
    return {
      metricNumberSize: 84,
      metricInfoTextSize: 20,
      metricContainerHeight: 75,
      verticalMargin: 4,
    };
  }
};

// Get responsive sizes based on device
const responsiveSizes = getResponsiveSizes();

export const homeScreenStyles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  inner: {
    padding: 16,
    paddingBottom: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  settingsButton: {
    padding: 4,
  },
  totalsContainer: {
    marginBottom: 28,
    alignItems: 'flex-start',
  },
  todayLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  metricContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricInfoContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: 12,
    height: responsiveSizes.metricContainerHeight,
  },
  metricNumber: {
    fontSize: responsiveSizes.metricNumberSize,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: colors.text,
  },
  metricInfoText: {
    fontSize: responsiveSizes.metricInfoTextSize,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginVertical: responsiveSizes.verticalMargin,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  largeInputContainer: {
    marginBottom: 0,
  },
  largeInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 0,
    padding: 12,
    backgroundColor: colors.card,
    minHeight: 100,
    maxHeight: 150,
  },
  textArea: {
    fontSize: 14,
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textAlignVertical: 'top',
    padding: 0,
    height: '100%',
  },
  disabledInput: {
    opacity: 0.8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 8,
  },
  iconButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 16,
  },
  rightButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginLeft: 8,
    width: 48,
    height: 48,
  },
  clearButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    width: 90,
    height: 48,
  },
  clearButtonText: {
    color: colors.text,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  recordingButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: colors.red,
  },
  errorMessage: {
    color: colors.red,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 0,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: colors.card,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 12,
  },
  inputWrapper: {
    width: '48%',
    position: 'relative',
  },
  inputHalf: {
    width: '100%',
  },
  unitLabel: {
    position: 'absolute',
    right: 12,
    top: 12,
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  aiGeneratedInput: {
    color: colors.purple,
    borderColor: colors.purple,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 96,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  buttonPrimary: {
    backgroundColor: colors.green,
    borderRadius: 0,
    padding: 14,
    width: '48%',
    alignItems: 'center',
  },
  buttonPrimaryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  buttonOutline: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 0,
    padding: 14,
    width: '48%',
    alignItems: 'center',
  },
  buttonOutlineText: {
    color: colors.text,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  accessoryContainer: {
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  dismissButton: {
    padding: 8,
  },
  dismissButtonText: {
    color: colors.green,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
}); 