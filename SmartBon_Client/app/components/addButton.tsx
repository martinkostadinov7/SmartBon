import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'

export function AddButton({
    onPress
  }: addButtonProps) {

  return (
    <TouchableOpacity style={styles.button} onPress= {onPress}>
      <Text style={{ color: 'white', fontSize: 50, transform: [{ translateY: -2}]}}>+</Text>
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