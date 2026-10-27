import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

// Transisi masuk antar layar: fade + slide kecil, seperti aplikasi native.
export default function ScreenTransition({ children }: { children: React.ReactNode }): React.JSX.Element {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 260, useNativeDriver: true }).start();
  }, [anim]);

  return (
    <Animated.View
      style={[
        { flex: 1 },
        {
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
