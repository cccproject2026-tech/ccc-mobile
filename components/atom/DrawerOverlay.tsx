import React from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  View
} from 'react-native';
import { CustomDrawerContent } from './CustomDrawer';
import { useDrawerStore } from './DrawerStore';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.8;

export const DrawerOverlay: React.FC = () => {
  const { isDrawerOpen, closeDrawer } = useDrawerStore();
  const slideAnim = React.useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isDrawerOpen ? 0 : -DRAWER_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isDrawerOpen, slideAnim]);

  if (!isDrawerOpen) return null;

  const mockNavigation = {
    navigate: (routeName: string) => {
      console.log('Navigate to:', routeName);
      // Navigation logic moved to CustomDrawer.tsx
    },
    closeDrawer,
  };

  return (
    <Modal
      transparent
      visible={isDrawerOpen}
      animationType="none"
      onRequestClose={closeDrawer}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <CustomDrawerContent navigation={mockNavigation} />
        </Animated.View>
        {/* <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={closeDrawer}
        /> */}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  drawer: {
    width: DRAWER_WIDTH,
    backgroundColor: '#fff',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
});
