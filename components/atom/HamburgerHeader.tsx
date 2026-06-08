import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useDrawerStore } from './DrawerStore';

interface HamburgerHeaderProps {
  color?: string;
  size?: number;
}

export const HamburgerHeader: React.FC<HamburgerHeaderProps> = ({ 
  color = '#ffffff', 
  size = 30 
}) => {
  const { toggleDrawer } = useDrawerStore();

  return (
    <View>
      <TouchableOpacity onPress={toggleDrawer} className=''>
        <Ionicons name="menu" size={size} color={color} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  
  
  
  
  
  
  
  
  
  
  
});
