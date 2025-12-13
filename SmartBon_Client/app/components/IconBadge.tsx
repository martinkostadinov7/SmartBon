import { Image, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { IconType } from '../types';

type Props = {
  iconType: IconType;
  iconValue: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function IconBadge({ iconType, iconValue, size = 48, style }: Props) {
  const circleStyle = [
    styles.circle,
    {
      width: size,
      height: size,
      borderRadius: size / 2,
      marginBottom: size * 0.15
    },
    style
  ];

  const iconSize = Math.max(14, size * 0.6);
  const emojiSize = Math.max(14, size * 0.55);
  const imageSize = Math.max(14, size * 0.6);

  if (iconType === 'Emoji') {
    return (
      <View style={circleStyle}>
        <Text style={[styles.emoji, { fontSize: emojiSize }]}>{iconValue || '🙂'}</Text>
      </View>
    );
  }

  if (iconType === 'FontAwesome') {
    return (
      <View style={circleStyle}>
        <FontAwesome name={(iconValue as any) || 'circle'} size={iconSize} color="#0F172A" />
      </View>
    );
  }

  if (iconType === 'Url' && iconValue) {
    return (
      <View style={circleStyle}>
        <Image source={{ uri: iconValue }} style={{ width: imageSize, height: imageSize }} resizeMode="contain" />
      </View>
    );
  }

  return (
    <View style={circleStyle}>
      <FontAwesome name="link" size={iconSize * 0.8} color="#0F172A" />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9'
  },
  emoji: {
    fontSize: 24
  }
});
