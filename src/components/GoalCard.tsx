import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ProgressRingIcon } from './icons/SVGIcons';
import { Color } from '../constants/GlobalStyles';

export interface GoalCardData {
  title: string;
  bgImage: any;
  bgColor: string;
  progressColor: string;
}

interface GoalCardProps {
  data: GoalCardData;
  onPress?: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ data, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{ flex: 1 }}>
      <View
      style={{
        flex: 1,
        height: 228,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: data.bgColor,
      }}>
      <Image
        source={data.bgImage}
        style={{
          width: '100%',
          height: 120,
        }}
      />
      <LinearGradient
        style={{
          flex: 1,
          paddingHorizontal: 15,
          paddingVertical: 15,
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
          justifyContent: 'space-between',
        }}
        colors={[data.bgColor, data.bgColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}>
        <Text
          style={{
            fontFamily: 'InriaSans-Bold',
            fontSize: 15,
            color: Color.colorWhite,
            fontWeight: '700',
          }}>
          {data.title}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}>
          <Text
            style={{
              fontFamily: 'InriaSans-Regular',
              fontSize: 16,
              color: Color.colorWhite,
            }}>
            Progress
          </Text>
          <ProgressRingIcon size={30} color={data.progressColor} />
        </View>
      </LinearGradient>
      </View>
    </TouchableOpacity>
  );
};
