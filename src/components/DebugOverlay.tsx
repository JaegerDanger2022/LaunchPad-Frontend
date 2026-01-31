import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { API_BASE_URL } from '../config/api';

export const DebugOverlay: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { user, userData, loading, error, isAuthenticated } = useAuthStore();

  if (!isExpanded) {
    return (
      <TouchableOpacity
        style={styles.collapsedButton}
        onPress={() => setIsExpanded(true)}
      >
        <Text style={styles.collapsedButtonText}>Debug</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Debug Info</Text>
        <TouchableOpacity onPress={() => setIsExpanded(false)}>
          <Text style={styles.closeButton}>X</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* API Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Configuration</Text>
          <Text style={styles.label}>Base URL:</Text>
          <Text style={styles.value}>{API_BASE_URL}</Text>
        </View>

        {/* Auth Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Authentication</Text>
          <Text style={styles.label}>Authenticated:</Text>
          <Text style={[styles.value, isAuthenticated ? styles.success : styles.error]}>
            {isAuthenticated ? 'Yes' : 'No'}
          </Text>
          <Text style={styles.label}>Loading:</Text>
          <Text style={styles.value}>{loading ? 'Yes' : 'No'}</Text>
          <Text style={styles.label}>User ID:</Text>
          <Text style={styles.value}>{user?.uid || 'None'}</Text>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user?.email || 'None'}</Text>
        </View>

        {/* User Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Data</Text>
          <Text style={styles.label}>Data Loaded:</Text>
          <Text style={[styles.value, userData ? styles.success : styles.error]}>
            {userData ? 'Yes' : 'No'}
          </Text>
          {userData && (
            <>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>
                {userData.firstname} {userData.lastname}
              </Text>
              <Text style={styles.label}>Dreams Count:</Text>
              <Text style={styles.value}>
                {userData.dreams ? userData.dreams.length : 0}
              </Text>
              <Text style={styles.label}>Recents:</Text>
              <Text style={styles.value}>
                {userData.recents ? userData.recents.length : 0}
              </Text>
              <Text style={styles.label}>Up Next:</Text>
              <Text style={styles.value}>
                {userData.up_next ? userData.up_next.milestone_title : 'None'}
              </Text>
              <Text style={styles.label}>Streak:</Text>
              <Text style={styles.value}>
                {userData.streak ? userData.streak.current_streak : 0} days
              </Text>
            </>
          )}
        </View>

        {/* Errors */}
        {error && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Error</Text>
            <Text style={[styles.value, styles.error]}>{error}</Text>
          </View>
        )}

        {/* Raw User Data JSON */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Raw User Data (JSON)</Text>
          <Text style={styles.jsonText}>
            {userData ? JSON.stringify(userData, null, 2) : 'No data'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  collapsedButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 9999,
  },
  collapsedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  overlay: {
    position: 'absolute',
    top: 60,
    left: 10,
    right: 10,
    bottom: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    zIndex: 9999,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    color: '#FF6B35',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  label: {
    color: '#AAAAAA',
    fontSize: 12,
    marginTop: 8,
    marginBottom: 2,
  },
  value: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  success: {
    color: '#4CAF50',
  },
  error: {
    color: '#FF4444',
  },
  jsonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'monospace',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
  },
});
