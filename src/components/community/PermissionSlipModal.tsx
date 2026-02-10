import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { X } from 'lucide-react-native';
import { DreamCategory, PermissionType } from '../../types/community';
import { getPermissionOptions } from '../../utils/permissionUtils';
import { useThemeStore } from '../../store/themeStore';
import { getThemeColors } from '../../constants/GlobalStyles';

interface PermissionSlipModalProps {
  visible: boolean;
  victoryId: string;
  dreamCategory: DreamCategory;
  onClose: () => void;
  onGrant: (permissionType: PermissionType) => Promise<void>;
}

export const PermissionSlipModal: React.FC<PermissionSlipModalProps> = ({
  visible,
  victoryId,
  dreamCategory,
  onClose,
  onGrant,
}) => {
  const [selectedType, setSelectedType] = useState<PermissionType | null>(null);
  const [isGranting, setIsGranting] = useState(false);

  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const themeColors = getThemeColors(theme);

  const permissionOptions = getPermissionOptions(dreamCategory);

  const handleGrant = async () => {
    if (!selectedType || isGranting) return;

    try {
      setIsGranting(true);
      await onGrant(selectedType);
      setIsGranting(false);
      setSelectedType(null);
      onClose();
    } catch (error) {
      setIsGranting(false);
      // Error is handled by parent
    }
  };

  const handleClose = () => {
    if (!isGranting) {
      setSelectedType(null);
      onClose();
    }
  };

  const styles = createStyles(isDark, themeColors);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleClose}
              disabled={isGranting}
              style={styles.closeButtonWrap}
            >
              <X size={20} color={isDark ? 'rgba(255,255,255,0.6)' : '#6B7280'} strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Give Permission</Text>
            <View style={styles.spacer} />
          </View>

          {/* Instructions */}
          <ScrollView style={styles.scrollView}>
            <Text style={styles.instructions}>
              Choose a permission to grant:
            </Text>

            {/* Permission Options */}
            <View style={styles.optionsContainer}>
              {permissionOptions.map((option) => {
                const isSelected = selectedType === option.type;
                return (
                  <TouchableOpacity
                    key={option.type}
                    style={[
                      styles.optionButton,
                      isSelected && styles.optionButtonSelected,
                    ]}
                    onPress={() => setSelectedType(option.type)}
                    disabled={isGranting}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                      {isSelected && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {option.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.buttonSecondary}
              onPress={handleClose}
              disabled={isGranting}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonSecondaryText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.buttonPrimary,
                (!selectedType || isGranting) && styles.buttonDisabled,
              ]}
              onPress={handleGrant}
              disabled={!selectedType || isGranting}
              activeOpacity={0.7}
            >
              {isGranting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.buttonPrimaryText}>Grant Permission</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const createStyles = (isDark: boolean, themeColors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? themeColors.bg_primary : '#FAFBFC',
    },
    content: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB',
      backgroundColor: isDark ? themeColors.bg_secondary : '#FFFFFF',
    },
    closeButtonWrap: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'transparent',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#111827',
    },
    spacer: {
      width: 32,
    },
    scrollView: {
      flex: 1,
    },
    instructions: {
      fontSize: 15,
      color: isDark ? '#b0b0b0' : '#374151',
      marginHorizontal: 16,
      marginTop: 20,
      marginBottom: 16,
      fontWeight: '500',
    },
    optionsContainer: {
      paddingHorizontal: 16,
      gap: 12,
    },
    optionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
      borderWidth: 1.5,
      borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#D1D5DB',
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 12,
    },
    optionButtonSelected: {
      borderColor: isDark ? 'rgba(45,91,255,0.6)' : '#FF7A00',
      backgroundColor: isDark ? 'rgba(45,91,255,0.12)' : 'rgba(255,122,0,0.08)',
    },
    radioOuter: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: isDark ? 'rgba(255,255,255,0.25)' : '#D1D5DB',
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioOuterSelected: {
      borderColor: isDark ? '#2D5BFF' : '#FF7A00',
    },
    radioInner: {
      width: 11,
      height: 11,
      borderRadius: 5.5,
      backgroundColor: isDark ? '#2D5BFF' : '#FF7A00',
    },
    optionText: {
      flex: 1,
      fontSize: 15,
      color: isDark ? 'rgba(255,255,255,0.75)' : '#111827',
      lineHeight: 22,
    },
    optionTextSelected: {
      color: isDark ? '#ffffff' : '#111827',
    },
    buttonContainer: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      flexDirection: 'row',
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB',
      backgroundColor: isDark ? themeColors.bg_secondary : '#FFFFFF',
    },
    buttonSecondary: {
      flex: 1,
      paddingVertical: 13,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#D1D5DB',
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
    },
    buttonSecondaryText: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? 'rgba(255,255,255,0.7)' : '#374151',
    },
    buttonPrimary: {
      flex: 1,
      paddingVertical: 13,
      paddingHorizontal: 16,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#2D5BFF' : '#FF7A00',
    },
    buttonPrimaryText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    buttonDisabled: {
      opacity: 0.5,
    },
  });
