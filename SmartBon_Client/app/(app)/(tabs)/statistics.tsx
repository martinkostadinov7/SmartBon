import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useCallback, useState } from "react";
import { useCategories } from "../../context/CategoriesContext";
export default function SettingsScreen() {
  return (<>
    <View style={[{padding: 15, backgroundColor: "#3077ceff"}]}>
        <Text style={{fontSize: 32, color: "white"}}>Statistics</Text>
    </View>
  </>
  );
}


const styles = StyleSheet.create({
});
