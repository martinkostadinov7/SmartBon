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
} from "react-native";
import { router } from "expo-router";
import EmojiPickerModal from "../../components/emojiPicker";
import { apiFetch } from "../../services/api";
import { useCategories } from "../../context/CategoriesContext";

export default function AddCategoryModal() {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📌");
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const { reloadCategories } = useCategories();

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
        Icon: icon
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


            <Text style={styles.label}>Icon</Text>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setIsEmojiOpen(true)}
            >
              <Text style={styles.iconText}>{icon}</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Food"
              autoFocus
            />
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
    height: 300,
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
    width: 52,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 22 },

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
