import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import EmojiPickerModal from "../../components/emojiPicker";
import { apiFetch } from "../../services/api";
import { useCategories } from "../../context/CategoriesContext";
import DateTimePicker from '@react-native-community/datetimepicker';
import { CategoryBox } from "../../components/categoryBox";
import { Subcategory } from "../../types/subcategory";

export default function AddBudgetModal() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [from, setFrom] = useState(new Date());
  const [to, setTo] = useState(new Date());
  const [selectedLimit, setSelectedLimit] = useState("");
  const [selectedIcon, setIcon] = useState("📌");
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Number[]>([]);
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<Number[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState("");
  const { categories } = useCategories();
  const ranges = ["daily", "weekly", "monthly", "yearly", "custom"];
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

const formatDate = (dateString: string | Date): string => {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return "";

  const currentYear = new Date().getFullYear();
  const dateYear = date.getFullYear();

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    // Only show year if it's not the current year
    year: dateYear !== currentYear ? 'numeric' : undefined 
  });
};

    useEffect(() => {
        setSelectedSubcategoryIds([]);
        if (selectedCategoryIds.length === 1) {
            const selectedCategory = categories.find(c => c.id === selectedCategoryIds[0]);
            setSubcategories(selectedCategory?.subcategories ?? []);
        } else {
            setSubcategories([]);
        }
    }, [selectedCategoryIds]); 

    function updateDateRange(dateRange: string){
        switch(dateRange){
            case "weekly": setSelectedDateRange("weekly"); setTo(new Date(new Date().setDate(from.getDate() + 7))); break;
            case "monthly": setSelectedDateRange("monthly"); setTo(new Date(new Date().setMonth(from.getMonth() + 1))); break;
            case "yearly": setSelectedDateRange("yearly"); setTo(new Date(new Date().setFullYear(from.getFullYear() + 1))); break;
            case "daily": setSelectedDateRange("daily"); setTo(new Date(new Date().setDate(from.getDate() + 1))); break;
        }
    }
  async function handleAddBudget(){

    if(!name || !selectedLimit || !selectedDateRange){
        Alert.alert(
        "Input error",
        "Fill out required fields!",
        [{ text: "OK" }]
        );
    }
    let categoryIds = selectedCategoryIds.length > 0 ? selectedCategoryIds : categories.map(category => category.id);
    let subcategoryIds = selectedSubcategoryIds.length > 0 ? selectedSubcategoryIds : subcategories.map(subcategory => subcategory.id);
    const normalizedLimit = selectedLimit.replace(",", ".").trim();
    const limit = parseFloat(normalizedLimit);
    const budget = {
        icon: selectedIcon,
        name: name,
        description: description,
        limit: limit,
        from: from,
        to: to,
        colorHex: selectedColor,
        categoryIds: categoryIds,
        subcategoryIds: subcategoryIds
    }

    try {
        const response = await apiFetch("/Budgets", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(budget),
        });
        if (!response.ok) return;
        router.back();
        } catch (e: any) {
            console.log("Network/API error:", e?.message ?? e);
        }
  }

  return (
    <>
      <Pressable style={styles.overlay} onPress={() => router.back()}>        
          <Pressable style={styles.container} onPress={() => {}}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.headerBtn}>Cancel</Text>
              </TouchableOpacity>

              <Text style={styles.title}>Add Budget</Text>

              <TouchableOpacity onPress={handleAddBudget}>
                <Text style={styles.headerBtn}>Add</Text>
              </TouchableOpacity>
            </View>
        <ScrollView>

        <View style={styles.row}>
            <View style={{marginRight: 20}}>
                <Text style={[styles.label,{marginTop: 0}]}>Icon</Text>
                <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setIsEmojiOpen(true)}
                >
                    <Text style={styles.iconText}>{selectedIcon}</Text>
                </TouchableOpacity>
            </View>

            <View style={{width: 288}}>
                <Text style={[styles.label, {marginTop: 0}]}>Name</Text>
                <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                />
            </View>
        </View>

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}    
              multiline
            />
            
            <Text style={styles.label}>Limit</Text>
            <TextInput
              style={[styles.input, {maxWidth: 100}]}
              value={selectedLimit}
              onChangeText={setSelectedLimit}    
              keyboardType="decimal-pad"
            />
            <View>
                <Text style={{marginVertical: 10, fontSize: 16}}>Date range: {formatDate(from)} - {formatDate(to)}</Text>
                
                <View style={styles.row}>
                    {ranges.map((range) => (
                    <TouchableOpacity
                        key={range}
                        style={{
                        borderWidth: selectedDateRange === range ? 2 : 1,
                        borderRadius: 10,
                        marginRight: 7,
                        padding: 9,
                        borderColor: selectedDateRange === range ? "black" : "gray"
                        }}
                        onPress={() => range === "custom" ? setSelectedDateRange("custom") : updateDateRange(range)}
                    >
                        <Text style={{ textAlign: "center", fontSize: 14, textTransform: 'capitalize' }}>
                        {range}
                        </Text>
                    </TouchableOpacity>
                    ))}
                </View>
                {selectedDateRange == "custom" ? 
                (<>
                    <View style={[styles.row, {width: 250, justifyContent: "space-between", marginVertical: 5}]}>
                        <Text>From</Text>
                        <DateTimePicker
                        style={{}}
                        value={from} // Подсигури се, че е Date обект
                        mode="datetime"
                        display="default"
                        onChange={(event, selectedDate) => {
                            if (selectedDate) setFrom(selectedDate);
                        }}
                        />
                    </View>
                    <View style={[styles.row, {width: 250, justifyContent: "space-between"}]}>
                        <Text>To</Text>
                        <DateTimePicker
                        value={to} // Подсигури се, че е Date обект
                        mode="datetime"
                        display="default"
                        onChange={(event, selectedDate) => {
                            if (selectedDate) setTo(selectedDate);
                        }}
                        />
                    </View>
                </>): 
                (<></>)}
            </View>


            <Text style={{fontSize: 16, marginTop: 10, marginBottom: 5}}>Included Categories</Text>
                    <View style={{ overflow: "hidden" }}>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                      >
                        <TouchableOpacity
                            style={{borderColor: selectedCategoryIds.length == 0 ? "black" : "gray", borderRadius: 10,justifyContent: "center", alignItems: "center",
                            margin: 2, width: 73, height: 73, backgroundColor: "#d8d8d8", borderWidth: selectedCategoryIds.length == 0 ? 3 : 1}}
                            onPress={() => {
                              setSelectedCategoryIds([]);
                            }}
                          >
                            <Text style={{textAlign: "center", fontSize: 16}}>Select</Text>
                            <Text style={{textAlign: "center", fontSize: 16}}>All</Text>
                          </TouchableOpacity>
                        {categories.map(category => (
                          <CategoryBox
                            key={category.id}
                            name={category.name}
                            icon={category.icon}
                            fontSize={12}
                            iconSize={30}
                            boxSize={73}
                            color={category.colorHex}
                            selected={selectedCategoryIds.includes(category.id)}
                            onPress={() => {
                              selectedCategoryIds.includes(category.id) ? 
                              setSelectedCategoryIds(prev => prev.filter(num => num !== category.id)) :
                              setSelectedCategoryIds(prevCategories => [...prevCategories, category.id]);

                            }}
                          />
                        ))}
                      </ScrollView>
                    </View>
                    {(selectedCategoryIds.length == 1) && ( <>
                      <Text style={{fontSize: 16, marginBottom: 5}}>Included Subcategories</Text>
                      <View style={{ overflow: "hidden" }}>
                        <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        >
                            <TouchableOpacity
                            style={{borderColor: selectedSubcategoryIds.length == 0 ? "black" : "gray", borderRadius: 10,justifyContent: "center",
    alignItems: "center",
    margin: 2, width: 73, height: 73, backgroundColor: "#d8d8d8", borderWidth: selectedSubcategoryIds.length == 0 ? 3 : 1}}
                            onPress={() => {
                              setSelectedSubcategoryIds([]);
                            }}
                          >
                            <Text style={{textAlign: "center", fontSize: 16}}>Select</Text>
                            <Text style={{textAlign: "center", fontSize: 16}}>All</Text>
                          </TouchableOpacity>
                            {subcategories.map(subcategory => (
                            <CategoryBox
                            key={subcategory.id}
                            name={subcategory.name}
                            icon={subcategory.icon}
                            fontSize={12}
                            iconSize={30}
                            boxSize={73}
                            color={subcategory.colorHex}
                            selected={selectedSubcategoryIds.includes(subcategory.id)}
                            onPress={() => {selectedSubcategoryIds.includes(subcategory.id) ?
                                setSelectedSubcategoryIds(prev => prev.filter(num => num !== subcategory.id)) :
                                setSelectedSubcategoryIds(prevSubcategories => [...prevSubcategories, subcategory.id])
                            }}
                            />
                            ))}
                      </ScrollView>
                    </View>
                  </> )}
            <Text style={styles.label}>Color</Text>
            <ScrollView  horizontal style={{ flexDirection: 'row'}}
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
        </ScrollView>
          </Pressable>
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
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: { fontSize: 20, fontWeight: "600" },
  headerBtn: { fontSize: 16, color: "#3077ceff" },
  label: { marginTop: 10, marginBottom: 6, fontSize: 16 },
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
    width: 43,
    height: 43,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 30 },

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
