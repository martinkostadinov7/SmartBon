import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

export function AddButton({
    onPress
  }: addButtonProps) {

  return (
    <TouchableOpacity style={styles.button} onPress= {onPress}>
      <FontAwesome6 name="plus" size={34} color="white" />
    </TouchableOpacity>
  )
}

type addButtonProps = {
onPress: () => void
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 16, 
    right: 16,
    backgroundColor: "#3077ceff",
    height: 60,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30
  }});