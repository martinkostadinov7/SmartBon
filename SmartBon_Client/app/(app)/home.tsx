import { View, Text, StyleSheet } from 'react-native';
import { useCategories } from "../context/CategoriesContext";
import React from 'react';

export default function HomeScreen() {
  const { categories } = useCategories();

  return (
    <View style={styles.container}>
      {categories.map(c => (
        <Text key={c.id} style={styles.text}>{c.name}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  text: { fontSize: 24, fontWeight: '600' }
});
