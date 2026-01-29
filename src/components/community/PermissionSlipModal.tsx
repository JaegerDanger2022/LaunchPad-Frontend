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
import { DreamCategory, PermissionType } from '../../types/community';
import { getPermissionOptions } from '../../utils/permissionUtils';

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
            <TouchableOpacity onPress={handleClose} disabled={isGranting}>
              <Text style={styles.closeButton}>✕</Text>
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
              {permissionOptions.map((option) => (
                <TouchableOpacity
                  key={option.type}
                  style={[
                    styles.optionButton,
                    selectedType === option.type && styles.optionButtonSelected,
                  ]}
                  onPress={() => setSelectedType(option.type)}
                  disabled={isGranting}
                >
                  <View style={styles.radioOuter}>
                    {selectedType === option.type && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text style={styles.optionText}>{option.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.buttonSecondary}
              onPress={handleClose}
              disabled={isGranting}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  closeButton: {
    fontSize: 24,
    color: '#6B7280',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  spacer: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  instructions: {
    fontSize: 15,
    color: '#374151',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  optionButtonSelected: {
    borderColor: '#2D5BFF',
    backgroundColor: '#F0F5FF',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2D5BFF',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    lineHeight: 22,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  buttonSecondary: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  buttonSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  buttonPrimary: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2D5BFF',
  },
  buttonPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
