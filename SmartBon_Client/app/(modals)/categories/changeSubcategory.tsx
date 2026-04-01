import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { CategoryBox } from '../../components/categoryBox';
import { router, useLocalSearchParams } from 'expo-router';
import { Category } from '../../types/category';
import { useExpenseStore } from '../../services/store';
import { apiFetch } from '../../services/api';
export default function ChangeCategory() {
    const { categoryId } = useLocalSearchParams<{ categoryId: string}>();
      const [categories, setCategories] = useState<Category[]>([]);
  const { clearTempData } = useExpenseStore();
 const setTempSubcategoryId = useExpenseStore((state) => state.setTempSubcategoryId);
 
async function loadCategories(){
   const response = await apiFetch(`/Categories`);
    if (!response.ok) throw new Error("Failed");
    const data = await response.json();
    setCategories(data);
}

    const [selectedCategoryId, setSelectedCategoryId] = useState(-1);
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(-1);

    useEffect(() => {(async () => {
      loadCategories();
      setSelectedCategoryId(Number(categoryId));
    })();
   }, []);

   console.log(categories);

    function handleCloseScreen(){
        clearTempData();
        router.back();
    }
    function handleSave(){
        setTempSubcategoryId(selectedSubcategoryId);
        router.back();
    }

    function handleSubcategoryAdd(){
        if(selectedCategoryId == -1){
            Alert.alert(
            "Error",
            "Choose category first!",
            [{ text: "OK" }]
            );
        }
        else{
            router.push({
                pathname: "(modals)/categories/addSubcategory",
                params: { categoryId: String(selectedCategoryId) },
                }); 
        }
    }

    const selectedCategory = categories.find(c => c.id === selectedCategoryId);
    const subcategories = selectedCategory?.subcategories ?? [];
  return (
  <>
        <Pressable style={styles.overlay} onPress={() => handleCloseScreen}>
        <KeyboardAvoidingView
            style={styles.wrapper}
        >
            <Pressable style={styles.container} onPress={() => {}}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => handleCloseScreen}>
                <Text style={styles.headerBtn}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleSave}>
                <Text style={styles.headerBtn}>Save</Text> 
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                >
                {subcategories.map(subcategory => (
                    <CategoryBox
                        key={subcategory.id}
                        name={subcategory.name}
                        icon={subcategory.icon}
                        fontSize={16}
                        color={subcategory.colorHex}
                        selected={selectedSubcategoryId === subcategory.id}
                        onPress={() => setSelectedSubcategoryId(subcategory.id)}
                    />
                ))}
                <CategoryBox
                    key={-2}
                    name="Add"
                    icon="+"
                    color={"#FFFFFF"}
                    fontSize={16}
                    selected={false}
                    onPress={handleSubcategoryAdd}
                />
                </ScrollView>
            </Pressable>
        </KeyboardAvoidingView>
        </Pressable>
    </>
  )
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
    height: 200,
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
