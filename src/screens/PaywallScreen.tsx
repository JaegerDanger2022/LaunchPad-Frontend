import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RevenueCatUI from 'react-native-purchases-ui';
import { Color } from '../constants/GlobalStyles';
import { useAuthStore } from '../store/authStore';

interface PaywallScreenProps {
  onClose: () => void;
}

export const PaywallScreen: React.FC<PaywallScreenProps> = ({ onClose }) => {
  const refreshPremiumStatus = useAuthStore((state) => state.refreshPremiumStatus);

  const handlePurchaseStarted = () => {
    console.log('[Paywall] Purchase started');
  };

  const handlePurchaseCompleted = async () => {
    console.log('[Paywall] Purchase completed successfully');
    await refreshPremiumStatus();
    onClose();
  };

  const handlePurchaseError = (error: any) => {
    console.error('[Paywall] Purchase error:', error);
  };

  const handlePurchaseCancelled = () => {
    console.log('[Paywall] Purchase cancelled');
  };

  const handleRestoreStarted = () => {
    console.log('[Paywall] Restore started');
  };

  const handleRestoreCompleted = async () => {
    console.log('[Paywall] Restore completed');
    await refreshPremiumStatus();
    onClose();
  };

  const handleRestoreError = (error: any) => {
    console.error('[Paywall] Restore error:', error);
  };

  const handleDismiss = async () => {
    console.log('[Paywall] Dismissed');
    await refreshPremiumStatus();
    onClose();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* RevenueCat Paywall Component */}
      <RevenueCatUI.Paywall
        onPurchaseStarted={handlePurchaseStarted}
        onPurchaseCompleted={handlePurchaseCompleted}
        onPurchaseError={handlePurchaseError}
        onPurchaseCancelled={handlePurchaseCancelled}
        onRestoreStarted={handleRestoreStarted}
        onRestoreCompleted={handleRestoreCompleted}
        onRestoreError={handleRestoreError}
        onDismiss={handleDismiss}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.colorWhite,
  },
});
