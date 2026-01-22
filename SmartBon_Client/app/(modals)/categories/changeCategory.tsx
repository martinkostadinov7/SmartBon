import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import { CategoryBox } from '../../components/categoryBox';
import { useCategories } from "../../context/CategoriesContext";
import { router } from 'expo-router';
export default function ChangeCategory() {
    const { categories, setTempCategory } = useCategories();
 
    const [selectedCategoryId, setSelectedCategoryId] = useState(-1);
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(-1);

    function handleCloseScreen(){
        setSelectedCategoryId(-1);
        setSelectedSubcategoryId(-1);
        router.back();
    }
    function handleSave(){
        setTempCategory({ cid: selectedCategoryId, sid: selectedSubcategoryId });
        router.back();
    }

    function handleCategoryAdd(){
        router.push("(modals)/categories/addCategory");
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
        <Pressable style={styles.overlay} onPress={handleCloseScreen}>
        <KeyboardAvoidingView
            style={styles.wrapper}
        >
            <Pressable style={styles.container} onPress={() => {}}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleCloseScreen}>
                <Text style={styles.headerBtn}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleSave}>
                <Text style={styles.headerBtn}>Save</Text> 
                </TouchableOpacity>
            </View>

            <Text style={{fontSize: 18, marginBottom: 10}}>Category</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                >
                {categories.map(category => (
                    <CategoryBox
                        key={category.id}
                        name={category.name}
                        icon={category.icon}
                        fontSize={16}
                        color={category.colorHex}
                        selected={selectedCategoryId === category.id}
                        onPress={() => {
                            setSelectedCategoryId(category.id);
                            setSelectedSubcategoryId(-1);
                        }}
                    />
                ))}
                <CategoryBox
                    key={-2}
                    name="Add"
                    icon="+"
                    color={"#FFFFFF"}
                    fontSize={16}
                    selected={false}
                    onPress={handleCategoryAdd}
                    />
                </ScrollView>

                <Text style={{fontSize: 18, marginVertical: 10}}>Subcategory</Text>
            
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
