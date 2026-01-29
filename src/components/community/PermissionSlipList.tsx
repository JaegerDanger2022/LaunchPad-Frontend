import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { PermissionSlip } from '../../types/community';
import { formatDate } from '../../utils/communityUtils';

interface PermissionSlipListProps {
  visible: boolean;
  permissions: PermissionSlip[];
  onClose: () => void;
}

export const PermissionSlipList: React.FC<PermissionSlipListProps> = ({
  visible,
  permissions,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Permissions Granted</Text>
            <View style={styles.spacer} />
          </View>

          {/* Permission List */}
          <ScrollView style={styles.scrollView}>
            {permissions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  No permissions granted yet
                </Text>
              </View>
            ) : (
              <View style={styles.listContainer}>
                {permissions.map((permission) => (
                  <View key={permission.id} style={styles.permissionCard}>
                    <Text style={styles.emoji}>💬</Text>
                    <View style={styles.permissionContent}>
                      <Text style={styles.permissionText}>
                        "{permission.permissionText}"
                      </Text>
                      <Text style={styles.permissionMeta}>
                        — {permission.giverDisplayName},{' '}
                        {formatDate(permission.createdAt)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  permissionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emoji: {
    fontSize: 24,
    lineHeight: 28,
  },
  permissionContent: {
    flex: 1,
    gap: 8,
  },
  permissionText: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 22,
    fontWeight: '500',
  },
  permissionMeta: {
    fontSize: 13,
    color: '#6B7280',
  },
});
