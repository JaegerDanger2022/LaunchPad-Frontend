import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../../store/themeStore';
import { getThemeColors } from '../../constants/GlobalStyles';

interface ProfileHeaderProps {
  firstname: string;
  lastname: string;
  email: string;
  createdAt?: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  firstname,
  lastname,
  email,
  createdAt,
}) => {
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);

  // Get initials from name
  const initials = `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase();

  // Format member since date
  const memberSince = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <LinearGradient
      colors={
        theme === 'light'
          ? ['#ffffff', '#f8f8f8']
          : ['#1a1a2e', '#16213e']
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { borderColor: themeColors.border }]}
    >
      {/* Avatar Circle */}
      <View style={styles.avatarContainer}>
        <LinearGradient
          colors={['#fb6322', '#ff8c52']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatar}
        >
          <Text style={styles.initials}>{initials}</Text>
        </LinearGradient>
      </View>

      {/* User Info */}
      <View style={styles.infoContainer}>
        <Text style={[styles.name, { color: themeColors.text_primary }]}>
          {firstname} {lastname}
        </Text>
        <Text style={[styles.email, { color: themeColors.text_secondary }]}>
          {email}
        </Text>
        <Text style={[styles.memberSince, { color: themeColors.text_secondary }]}>
          Member since {memberSince}
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 16,
    borderWidth: 1,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'InstrumentSans-Bold',
  },
  infoContainer: {
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'InstrumentSans-Bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    fontFamily: 'InstrumentSans-Regular',
    marginBottom: 8,
  },
  memberSince: {
    fontSize: 12,
    fontFamily: 'InstrumentSans-Regular',
  },
});
