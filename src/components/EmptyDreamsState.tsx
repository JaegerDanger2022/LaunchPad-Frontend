import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Color } from '../constants/GlobalStyles';
import { CreateDreamModal } from './CreateDreamModal';

interface EmptyDreamsStateProps {
  onDreamCreating?: () => void;
  onDreamCreated?: () => void;
}

export const EmptyDreamsState: React.FC<EmptyDreamsStateProps> = ({
  onDreamCreating,
  onDreamCreated,
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleAddDream = async () => {
    // Add haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Open the modal
    setShowModal(true);
  };

  return (
    <>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 60,
          paddingHorizontal: 40,
          position: 'relative',
        }}>
        {/* Decorative Circle Background */}
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: '#F0F0F0',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
          }}>
          {/* Star Emoji */}
          <Text style={{ fontSize: 60, opacity: 0.6 }}>🌟</Text>
        </View>

        {/* Main Title */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: '700',
            color: Color.colorBlack,
            fontFamily: 'InstrumentSans-Bold',
            marginBottom: 12,
            textAlign: 'center',
          }}>
          No Dreams Yet
        </Text>

        {/* Subtitle */}
        <Text
          style={{
            fontSize: 14,
            color: '#A0A0A0',
            fontFamily: 'InstrumentSans-Regular',
            textAlign: 'center',
            lineHeight: 20,
            marginBottom: 32,
          }}>
          Start your journey by creating your first dream and turning your goals into reality
        </Text>

        {/* Decorative Dots */}
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 12 }}>
          {[1, 2, 3].map((dot) => (
            <View
              key={dot}
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: dot === 2 ? '#00D4AA' : '#E0E0E0',
              }}
            />
          ))}
        </View>

        {/* Floating Plus Button */}
        <TouchableOpacity
          onPress={handleAddDream}
          activeOpacity={0.9}
          style={{
            position: 'absolute',
            bottom: 32,
            right: 32,
            width: 64,
            height: 64,
            borderRadius: 32,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
            zIndex: 100,
          }}>
          <LinearGradient
            colors={['#fb6322', '#f79971']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Plus size={32} color="#fff" strokeWidth={2.5} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Create Dream Modal */}
      <CreateDreamModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onDreamCreating={onDreamCreating}
        onDreamCreated={onDreamCreated}
      />
    </>
  );
};
