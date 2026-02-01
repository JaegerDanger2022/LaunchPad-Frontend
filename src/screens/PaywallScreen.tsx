import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { PurchasesPackage } from 'react-native-purchases';
import { getOfferings, purchasePackage, restorePurchases } from '../config/revenuecat';
import { Color } from '../constants/GlobalStyles';

export const PaywallScreen = ({ onClose }: { onClose: () => void }) => {
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      setLoading(true);
      const availablePackages = await getOfferings();
      setPackages(availablePackages);
    } catch (error) {
      console.error('Error loading offerings:', error);
      Alert.alert('Error', 'Failed to load subscription options');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pkg: PurchasesPackage) => {
    try {
      setPurchasing(true);
      const customerInfo = await purchasePackage(pkg);

      // Check if user has active entitlement
      if (customerInfo.entitlements.active['premium']) {
        Alert.alert('Success!', 'You now have premium access!');
        onClose();
      }
    } catch (error: any) {
      if (!error.userCancelled) {
        Alert.alert('Purchase Failed', error.message || 'Something went wrong');
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setPurchasing(true);
      const customerInfo = await restorePurchases();

      if (customerInfo.entitlements.active['premium']) {
        Alert.alert('Restored!', 'Your premium subscription has been restored!');
        onClose();
      } else {
        Alert.alert('No Purchases Found', 'We couldn\'t find any previous purchases to restore.');
      }
    } catch (error: any) {
      Alert.alert('Restore Failed', error.message || 'Failed to restore purchases');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={Color.colorOrangered} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Upgrade to Premium</Text>
          <Text style={styles.subtitle}>
            Unlock all features and achieve your dreams faster
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <FeatureItem text="Unlimited Dreams" />
          <FeatureItem text="Advanced Analytics" />
          <FeatureItem text="Priority Support" />
          <FeatureItem text="Custom Themes" />
        </View>

        {/* Subscription Options */}
        {packages.length === 0 ? (
          <Text style={styles.noOfferings}>No subscription options available</Text>
        ) : (
          <View style={styles.packages}>
            {packages.map((pkg) => (
              <TouchableOpacity
                key={pkg.identifier}
                onPress={() => handlePurchase(pkg)}
                disabled={purchasing}
                style={styles.packageButton}>
                <LinearGradient
                  colors={['#fb6322', '#f79971']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.packageGradient}>
                  <Text style={styles.packageTitle}>
                    {pkg.product.title}
                  </Text>
                  <Text style={styles.packagePrice}>
                    {pkg.product.priceString}
                  </Text>
                  <Text style={styles.packageDescription}>
                    {pkg.product.description}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Restore Button */}
        <TouchableOpacity
          onPress={handleRestore}
          disabled={purchasing}
          style={styles.restoreButton}>
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </TouchableOpacity>

        {/* Close Button */}
        <TouchableOpacity
          onPress={onClose}
          disabled={purchasing}
          style={styles.closeButton}>
          <Text style={styles.closeText}>Maybe Later</Text>
        </TouchableOpacity>

        {purchasing && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const FeatureItem = ({ text }: { text: string }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>✓</Text>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Color.colorBlack,
    fontFamily: 'InstrumentSans-Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B6B6B',
    fontFamily: 'InstrumentSans-Regular',
    textAlign: 'center',
  },
  features: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 20,
    color: '#4CAF50',
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: Color.colorBlack,
    fontFamily: 'InstrumentSans-Regular',
  },
  packages: {
    marginBottom: 24,
  },
  packageButton: {
    marginBottom: 16,
  },
  packageGradient: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  packageTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'InstrumentSans-Bold',
    marginBottom: 8,
  },
  packagePrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'InstrumentSans-Bold',
    marginBottom: 4,
  },
  packageDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'InstrumentSans-Regular',
    opacity: 0.9,
  },
  restoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  restoreText: {
    fontSize: 16,
    color: Color.colorOrangered,
    fontFamily: 'InstrumentSans-Medium',
  },
  closeButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    color: '#A0A0A0',
    fontFamily: 'InstrumentSans-Regular',
  },
  noOfferings: {
    fontSize: 16,
    color: '#A0A0A0',
    fontFamily: 'InstrumentSans-Regular',
    textAlign: 'center',
    marginVertical: 32,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'InstrumentSans-Regular',
    marginTop: 12,
  },
});
