import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import EmojiPickerModal from "../../components/emojiPicker";
import { apiFetch } from "../../services/api";
import { useCategories } from "../../context/CategoriesContext";
import { CategoryBox } from "../../components/categoryBox";

export default function AddCategoryModal() {
  const [name, setName] = useState("Category");
  const [icon, setIcon] = useState("📌");
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const { reloadCategories } = useCategories();
  const colors = [
    "#EF9A9A", // Soft Red
    "#FFAB91", // Soft Deep Orange
    "#FFCC80", // Soft Orange
    "#FFE082", // Soft Amber
    "#FFF59D", // Soft Yellow
    "#E6EE9C", // Soft Lime
    "#C5E1A5", // Soft Light Green
    "#A5D6A7", // Soft Green
    "#80CBC4", // Soft Teal
    "#80DEEA", // Soft Cyan
    "#81D4FA", // Soft Light Blue
    "#90CAF9", // Soft Blue
    "#9FA8DA", // Soft Indigo
    "#B39DDB", // Soft Deep Purple
    "#CE93D8", // Soft Purple
    "#F48FB1", // Soft Pink
    "#BCAAA4", // Soft Brown
    "#B0BEC5", // Soft Blue Grey
    "#E0E0E0", // Soft Grey
  ]
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  async function handleAddCategory(){

    if(!name || !icon){
        Alert.alert(
        "Input error",
        "Fill out name and icon fields!",
        [{ text: "OK" }]
        );
    }

    const category = {
        Name: name,
        Icon: icon,
        ColorHex: selectedColor
    }

    try {
        const response = await apiFetch("/Categories", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(category),
        });

        console.log("REQUEST BODY:", category);
        console.log("STATUS:", response.status);
        console.log("BODY:", await response.text());

        if (!response.ok) return;

        console.log("Category added successfully ✅");
        reloadCategories()
        router.back();
        } catch (e: any) {
            console.log("Network/API error:", e?.message ?? e);
        }
  }

  return (
    <>
      <Pressable style={styles.overlay} onPress={() => router.back()}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.wrapper}
        >
          <Pressable style={styles.container} onPress={() => {}}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.headerBtn}>Cancel</Text>
              </TouchableOpacity>

              <Text style={styles.title}>Add Category</Text>

              <TouchableOpacity onPress={handleAddCategory}>
                <Text style={styles.headerBtn}>Save</Text>
              </TouchableOpacity>
            </View>


            <View style={styles.row}>
                <View style={{marginBottom: 0}}>
                    <Text style={styles.label}>Icon</Text>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => setIsEmojiOpen(true)}
                            >
                        <Text style={styles.iconText}>{icon}</Text>
                    </TouchableOpacity>
                </View>
                <View>
                    <CategoryBox 
                        name={name} 
                        icon={icon} 
                        color={selectedColor} 
                        selected={false} 
                        onPress={function (): void {}}/>
                </View>
            </View>

            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Food"
            />

            <Text style={styles.label}>Color</Text>
            <ScrollView  horizontal style={{ flexDirection: 'row', height: 30 }}
            showsHorizontalScrollIndicator={false}
            >
            {colors.map((color) => {
                    return (
                      <TouchableOpacity 
                        key={color}
                        style={[styles.colorBox, {backgroundColor: color}, selectedColor == color ? {borderWidth: 2.2} : {borderWidth: 0}]}
                        onPress={() => setSelectedColor(color)}
                      />
                    );
                  })}
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>

      <EmojiPickerModal
        visible={isEmojiOpen}
        onClose={() => setIsEmojiOpen(false)}
        onSelect={setIcon}
      />
    </>
  );
}


const styles = StyleSheet.create({
    row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  colorBox:{
    height: 50,
    width: 50,
    margin: 5,
    borderRadius: 25
  },  
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  wrapper: { width: "100%" },
  container: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: 380,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 20, fontWeight: "600" },
  headerBtn: { fontSize: 16, color: "#3077ceff" },
  label: { marginTop: 12, marginBottom: 6, fontSize: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  iconButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 33 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 12,
    maxHeight: "75%",
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sheetTitle: { fontSize: 16, fontWeight: "600" },
});
