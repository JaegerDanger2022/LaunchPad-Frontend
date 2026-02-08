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
import { X } from 'lucide-react-native';
import { PermissionSlip } from '../../types/community';
import { formatDate } from '../../utils/communityUtils';
import { useThemeStore } from '../../store/themeStore';
import { getThemeColors } from '../../constants/GlobalStyles';

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
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const themeColors = getThemeColors(theme);

  const styles = createStyles(isDark, themeColors);

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
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButtonWrap}
            >
              <X size={20} color={isDark ? 'rgba(255,255,255,0.6)' : '#6B7280'} strokeWidth={2.5} />
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
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyText: {
      fontSize: 15,
      color: isDark ? '#808080' : '#9CA3AF',
      textAlign: 'center',
    },
    listContainer: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 16,
    },
    permissionCard: {
      flexDirection: 'row',
      backgroundColor: isDark ? themeColors.bg_secondary : '#FFFFFF',
      borderRadius: 14,
      padding: 16,
      gap: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0 : 0.05,
      shadowRadius: 2,
      elevation: isDark ? 0 : 1,
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
      color: isDark ? '#ffffff' : '#111827',
      lineHeight: 22,
      fontWeight: '500',
    },
    permissionMeta: {
      fontSize: 13,
      color: isDark ? '#808080' : '#6B7280',
    },
  });
