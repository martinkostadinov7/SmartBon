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
import { router, useLocalSearchParams } from "expo-router";
import EmojiPickerModal from "../../../components/emojiPicker";
import { apiFetch } from "../../../services/api";
import DateTimePicker from '@react-native-community/datetimepicker';
import { CategoryBox } from "../../../components/categoryBox";
import { Subcategory } from "../../../types/subcategory";
import { Budget } from "../../../types/budget";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Category } from "../../../types/category";
import { useTranslation } from "react-i18next";

const dateRangeFromNumber: Record<number, string> = {
  0: "Daily",
  1: "Weekly",
  2: "Monthly",
  3: "Yearly",
  4: "Custom",
};

const dateRangeFromString: Record<string, number> = {
  "Daily": 0,
  "Weekly": 1,
  "Monthly": 2,
  "Yearly": 3,
  "Custom": 4
};
export default function ViewBudgetModal() {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [from, setFrom] = useState(new Date());
  const [to, setTo] = useState(new Date());
  const [selectedLimit, setSelectedLimit] = useState("");
  const [originalLimit, setOriginalLimit] = useState("");
  const [currentAmount, setCurrentAmount] = useState();
  const [selectedIcon, setIcon] = useState("📌");
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Number[]>([]);
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<Number[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState("");
   const [categories, setCategories] = useState<Category[]>([]);

  const { id } = useLocalSearchParams<{ id: string}>();
  const [isEditing, setIsEditing] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
  
        const ranges = ["Daily", "Weekly", "Monthly", "Yearly", "Custom"];
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
const { t, i18n } = useTranslation();

const formatDate = (dateString: string | Date): string => {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return "";

  const currentYear = new Date().getFullYear();
  const dateYear = date.getFullYear();

  return date.toLocaleDateString(i18n.language, {
    month: 'short',
    day: 'numeric',
    // Only show year if it's not the current year
    year: dateYear !== currentYear ? 'numeric' : undefined 
  });
};

function getProgressBarColor(percentage: number): string {
    const clamped = Math.min(Math.max(percentage, 0), 100);

    // Изчисляваме Hue (Хю):
    // При 0% искаме 120 (зелено), при 100% искаме 0 (червено).
    // Формула: 120 - (процент * 1.2)
    const hue = 120 - (clamped * 1.2);

    // Връщаме HSL стринг с фиксирана наситеност и светлина за пастелен ефект
    return `hsl(${hue}, 100%, 60%)`;
  }
  const [confirmedLimit, setConfirmedLimit] = useState("");
  const progressBarColor= getProgressBarColor((Number(currentAmount) / Number(confirmedLimit) * 100))
const percentage= Math.min((Number(currentAmount) / Number(confirmedLimit)) * 100, 100).toFixed(0)
const remaining = (Number(confirmedLimit) - Number(currentAmount)).toFixed(2)

async function loadCategories(){
   const response = await apiFetch(`/Categories`);
    if (!response.ok) throw new Error("Failed");
    const data = await response.json();
    setCategories(data);
}

useEffect(() => {(async () => {
loadCategories();

    const userResponse = await apiFetch(`/Users/me`);
    if (!userResponse.ok) throw new Error("Failed");
    const profileData = await userResponse.json();
    setIsPremium(profileData.isPremium);

      const response = await apiFetch(`/Budgets/${id}`);
      if (!response.ok) {
        throw new Error(`${t('error_occured')}`);
      }
      const budget = await response.json();
      setBudget(budget);
      setIcon(budget?.icon ?? "undefined");
      setName(budget?.name ?? "undefined");
      setDescription(budget?.description ?? null);
      setTo(new Date(budget?.to) ?? new Date());
      setFrom(new Date(budget?.from) ?? new Date());
      setSelectedDateRange(dateRangeFromNumber[budget?.dateRange ?? "undefined"]);
      setSelectedLimit(String(budget?.limit) ?? "undefined");
      setOriginalLimit(String(budget?.limit) ?? "undefined");
      setConfirmedLimit(String(budget?.limit) ?? "undefined");
      setCurrentAmount(budget?.currentAmount ?? "undefined");
      setSelectedColor(budget?.colorHex ?? "undefined");
      setSelectedCategoryIds(budget?.categoryIds ?? []);
      setSelectedSubcategoryIds(budget?.subcategoryIds ?? []);
    })();
   }, [id]);

    useEffect(() => {
        if(isEditing)
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
            case "Weekly": setSelectedDateRange("Weekly"); setTo(new Date(new Date(from).setDate(from.getDate() + 7))); break;
            case "Monthly": setSelectedDateRange("Monthly"); setTo(new Date(new Date(from).setMonth(from.getMonth() + 1))); break;
            case "Yearly": setSelectedDateRange("Yearly"); setTo(new Date(new Date(from).setFullYear(from.getFullYear() + 1))); break;
            case "Daily": setSelectedDateRange("Daily"); setTo(new Date(new Date(from).setDate(from.getDate() + 1))); break;
            case "Custom": setSelectedDateRange("Custom"); break;
        }
    }

    function handleSelectLimit(limit: string) {
        const normalizedLimit = limit.replace(",", ".").trim();
        setSelectedLimit(normalizedLimit);
    }

    function validateLimit() {
    const numLimit = Number(selectedLimit);
    const numCurrent = Number(currentAmount);

    if (!isNaN(numLimit) && numLimit >= numCurrent) {
        setConfirmedLimit(selectedLimit);
    } else {
        Alert.alert("Error", "Invalid limit");
        setSelectedLimit(confirmedLimit);
    }
}

  async function handleSaveBudget(){
      if(!name || !selectedLimit || !selectedDateRange){
          Alert.alert(
              `${t('error')}`,
              `${t('fill_out_fields')}`,
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
            dateRange: dateRangeFromString[selectedDateRange],
            colorHex: selectedColor,
            categoryIds: categoryIds,
            subcategoryIds: subcategoryIds
        }
        try {
            const response = await apiFetch(`/Budgets/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(budget),
            });
        if (!response.ok) 
        {
            const errorData = await response.json(); 
            throw new Error(errorData.message || `${t('error_occured')}`);
        }
        router.back();
    } catch (e: any) {

    Alert.alert(
        `${t('error')}`,
        e?.message,
        [{ text: "OK" }]
        );
        console.log("Network/API error:", e?.message.message ?? e);
    }
  }

  async function handleDeleteBudget() {
    Alert.alert(
      `${t('delete_budget')}`,
      `${t('delete_record_message')}`,
      [
        { text: `${t('cancel')}`, style: "cancel" },
        {
          text: `${t('delete')}`,
          style: "destructive",
          onPress: async () => {
            try {
              const response = await apiFetch(`/Budgets/${id}`, {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                }
              });
  
              if (response.ok) {
                setIsEditing(false);
                router.back(); 
              } else {
                Alert.alert(`${t('error')}`, `${t('could_not_delete')}`);
              }
            } catch (e) {
              Alert.alert(`${t('error')}`, `${t('error_occured')}`);
              console.log("Network/API error:", e);
            }
          }
        }
      ]
    );
}
  return (
    <>
      <Pressable style={styles.overlay} onPress={() => router.back()}>        
          <Pressable style={styles.container} onPress={() => {}}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.headerBtn}>{t('cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleDeleteBudget}>
                <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={[styles.headerBtn, {color: "red"}]}>{t('delete')}</Text>
              </TouchableOpacity>

            <TouchableOpacity onPress={isEditing ? handleSaveBudget : () => setIsEditing(true)}>
                <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.headerBtn}>{isEditing ? `${t('save')}` : `${t('edit')}`}</Text> 
            </TouchableOpacity>
            </View>
        <ScrollView>
        {isEditing ? 
        (<><View style={styles.row}>
            <View style={{marginRight: 20}}>
                <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={[styles.label,{marginTop: 0}]}>{t('icon')}</Text>
                <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setIsEmojiOpen(true)}
                >
                    <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.iconText}>{selectedIcon}</Text>
                </TouchableOpacity>
            </View>

            <View style={{width: 288}}>
                <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={[styles.label, {marginTop: 0}]}>{t('name')}</Text>
                <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                />
            </View>
        </View>

            <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.label}>{t('description')}</Text>
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}    
              multiline
            />

            <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.label}>{t('progress')}</Text>
            <View style={styles.progressBarContainer}>
                <View style={[styles.progressBarFill, { backgroundColor: progressBarColor, width: `${Number(percentage)}%`}]} />
                <View style={styles.textContainer}>
                    <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.percentageText}>{percentage}%</Text>
                </View>
            </View>
             <View style={[styles.row, {justifyContent: "space-between"}]}>
                <View>
                    <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.label}>{t('limit')}</Text>
                    <TextInput
                    style={[styles.input, {minWidth: 75}]}
                    value={selectedLimit}
                    onChangeText={handleSelectLimit}    
                    onBlur={validateLimit}   
                    keyboardType="decimal-pad"
                    />
                </View>
                <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{marginTop: 30}}>-</Text>
                <View>
                    <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.label}>{t('spent')}</Text>
                    <View style={[styles.input, {maxWidth: 100, borderWidth: 0}]}>
                        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 16}}>{(Number(currentAmount)).toFixed(2)}</Text>
                    </View>
                </View>
                <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{marginTop: 30}}>=</Text>
                <View>
                    <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.label}>{t('remaining')}</Text>
                    <View style={[styles.input, {maxWidth: 100, borderWidth: 0}]}>
                        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 16}}>{(Number(remaining))}</Text>
                    </View>
                </View>
                
            </View>
            <View>
                <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{marginVertical: 10, fontSize: 16}}>{t('date_range')}: {formatDate(from)} - {formatDate(to)}</Text>
                
                <View style={styles.row}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>

                        {ranges.map((range) => {
                            // Дефинираме кои са премиум опциите
                            const isPremiumRange = range === 'Daily' || range === 'Custom';
                            const isLocked = !isPremium && isPremiumRange;

                            return (
                            <TouchableOpacity
                                key={range}
                                style={{
                                flexDirection: 'row', // За да подредим текста и иконата в линия
                                alignItems: 'center',
                                borderWidth: selectedDateRange === range ? 2 : 1,
                                borderRadius: 10,
                                marginRight: 7,
                                paddingVertical: 9,
                                paddingHorizontal: 12, // Малко повече място отстрани
                                backgroundColor: isLocked ? '#f0f0f0' : 'transparent',
                                borderColor: (selectedDateRange === range ? "black" : "#d1d1d1"),
                                opacity: isLocked ? 0.7 : 1, // Визуално подсказва, че е неактивно
                                }}
                                onPress={() => {
                                if (isLocked) {
                                    Alert.alert(
                                    `${t('premium_feature')}`,
                                    `${t('error_occured')}`,
                                    [
                                        { text: `${t('cancel')}`, style: "cancel" },
                                        {
                                        text: `${t('upgrade')}`,
                                        style: "default",
                                        onPress: async () => {
                                            router.push("(modals)/users/managePlan");
                                        }
                                        }
                                    ]
                                    );
                                } else {
                                    updateDateRange(range);
                                }
                                }}
                            >
                                <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{ 
                                    textAlign: "center", 
                                    fontSize: 14, 
                                    textTransform: 'capitalize',
                                    color: isLocked ? '#888' : 'black',
                                    fontWeight: selectedDateRange === range ? 'bold' : 'normal',
                                    marginRight: isLocked ? 5 : 0
                                }}>
                                {range}
                                </Text>
                                
                                {isLocked && (
                                <FontAwesome6 name={"lock"} size={16} color={"#3077ceff"}/>
                                )}
                            </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
                {selectedDateRange == "Custom" ? 
                (<>
                    <View style={[styles.row, {width: 250, justifyContent: "space-between", marginVertical: 5}]}>
                        <Text>{t('from')}</Text>
                        <DateTimePicker
                          locale={i18n.language}
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
                        <Text>{t('to')}</Text>
                        <DateTimePicker
                          locale={i18n.language}
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


            <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 16, marginTop: 10, marginBottom: 5}}>{t('included_categories')}</Text>
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
                            <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{textAlign: "center", fontSize: 16}}>{t('select')}</Text>
                            <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{textAlign: "center", fontSize: 16}}>{t('all')}</Text>
                          </TouchableOpacity>
                        {categories.map(category => (
                          <CategoryBox
                            key={category.id}
                            name={t(category.name)}
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
                      <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 16, marginBottom: 5}}>{t('included_subcategories')}</Text>
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
                            <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{textAlign: "center", fontSize: 16}}>Select</Text>
                            <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{textAlign: "center", fontSize: 16}}>All</Text>
                          </TouchableOpacity>
                            {subcategories.map(subcategory => (
                            <CategoryBox
                            key={subcategory.id}
                            name={t(subcategory.name)}
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
            <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.label}>{t('color')}</Text>
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
            </ScrollView></>) : 
        //not editing
        (<>
        <View style={styles.row}>
            <View style={{marginRight: 20}}>
                <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={[styles.label,{marginTop: 0}]}>{t('icon')}</Text>
                <View
                style={[styles.iconButton, {borderColor: "#eaeaea"}]}
                >
                    <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.iconText}>{selectedIcon}</Text>
                </View>
            </View>

            <View style={{width: 288}}>
                <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={[styles.label, {marginTop: 0}]}>{t('name')}</Text>
                <View
                style={[styles.input, {borderColor: "#eaeaea"}]}>
                <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 16}}>{name}</Text>
                </View>
            </View>
        </View>

            <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.label}>{t('description')}</Text>
            <View style={[styles.input, {borderColor: "#eaeaea"}]}>
                <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 16}}>{description}</Text>
            </View>

            <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.label}>{t('progress')}</Text>
            <View style={styles.progressBarContainer}>
                <View style={[styles.progressBarFill, { backgroundColor: progressBarColor, width: `${Number(percentage)}%`}]} />
                <View style={styles.textContainer}>
                    <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.percentageText}>{percentage}%</Text>
                </View>
            </View>

            <View style={[styles.row, {justifyContent: "space-between"}]}>
                <View>
                    <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={[styles.label, {marginLeft: 12}]}>{t('limit')}</Text>
                    <View style={[styles.input, {maxWidth: 100, borderColor: "#eaeaea"}]}
                    >
                        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 16}}>{selectedLimit}</Text>
                    </View>
                </View>
                <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{marginTop: 30}}>-</Text>
                <View>
                    <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.label}>{t('spent')}</Text>
                    <View style={[styles.input, {maxWidth: 100, borderWidth: 0, paddingLeft: 0}]}>
                        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 16}}>{Number(currentAmount).toFixed(2)}</Text>
                    </View>
                </View>
                <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{marginTop: 30}}>=</Text>
                <View>
                    <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.label}>{t('remaining')}</Text>
                    <View style={[styles.input, {maxWidth: 100, borderWidth: 0, paddingLeft: 0}]}>
                        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 16}}>{(Number(selectedLimit) - Number(currentAmount)).toFixed(2)}</Text>
                    </View>
                </View>
            </View>
            <View>
                <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{marginVertical: 10, fontSize: 16}}>{t('date_range')}: {formatDate(from)} - {formatDate(to)}</Text>
                
               <View style={styles.row}>
                    {ranges.map((range) => (
                    <View
                        key={range}
                        style={{
                        borderWidth: selectedDateRange === range ? 2 : 1,
                        borderRadius: 10,
                        marginRight: 6,
                        padding: 9,
                        borderColor: selectedDateRange === range ? "black" : "#eaeaea"
                        }}
                    >
                        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{ textAlign: "center", fontSize: 14, textTransform: 'capitalize', color: selectedDateRange === range ? "black" : "#8c8c8c", fontWeight: selectedDateRange === range ? 700 : 400}}>
                        {range}
                        </Text>
                    </View>
                    ))}
                </View>
                {selectedDateRange == "Custom" ? 
                (<>
                    <View style={[styles.row, {width: 250, justifyContent: "space-between", marginVertical: 5}]}>
                        <Text>{t('from')}</Text>
                        <View style={{
                            opacity: 0.7
                        }}>
                            <View pointerEvents="none">
                                <DateTimePicker
                                  locale={i18n.language}
                                    value={from}
                                    mode="datetime"
                                    display="default"
                                    onChange={(event, selectedDate) => {
                                    if (selectedDate) setFrom(selectedDate);
                                }}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={[styles.row, {width: 250, justifyContent: "space-between"}]}>
                        <Text>{t('to')}</Text>
                        <View style={{
                            opacity: 0.7
                        }}>
                            <View pointerEvents="none">
                                <DateTimePicker
                                  locale={i18n.language}
                                    value={to}
                                    mode="datetime"
                                    display="default"
                                    onChange={(event, selectedDate) => {
                                    if (selectedDate) setFrom(selectedDate);
                                }}
                                />
                            </View>
                        </View>
                    </View>
                </>): 
                (<></>)}
            </View>

            <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 16, marginTop: 10, marginBottom: 5}}>{t('included_categories')}</Text>
                    <View style={{ overflow: "hidden" }}>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                      >
                        {categories.filter(category => selectedCategoryIds.includes(category.id)).map(category => (
                        <CategoryBox
                            key={category.id}
                            name={t(category.name)}
                            icon={category.icon}
                            fontSize={12}
                            iconSize={30}
                            readOnly={true}
                            boxSize={73}
                            color={category.colorHex}
                            selected={false}
                            onPress={() => {}}
                        />
                        ))}
                      </ScrollView>
                    </View>
                    {(selectedCategoryIds.length == 1) && ( <>
                      <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 16, marginBottom: 5}}>{t('included_subcategories')}</Text>
                      <View style={{ overflow: "hidden" }}>
                        <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        >
                            {subcategories.filter(subcategory => selectedSubcategoryIds.includes(subcategory.id)).map(subcategory => (
                            <CategoryBox
                            key={subcategory.id}
                            name={t(subcategory.name)}
                            icon={subcategory.icon}
                            fontSize={12}
                            readOnly={true}
                            iconSize={30}
                            boxSize={73}
                            color={subcategory.colorHex}
                            selected={false}
                            onPress={() => {}}
                            />
                            ))}
                      </ScrollView>
                    </View>
                  </> )}
            <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.label}>{t('color')}</Text>
            <ScrollView  horizontal style={{ flexDirection: 'row'}}
            showsHorizontalScrollIndicator={false}
            >
            {colors.filter(color => color == selectedColor).map((color) => {
                    return (
                      <View 
                        key={color}
                        style={[styles.colorBox, {backgroundColor: color}]}
                      />
                    );
                  })}
            </ScrollView></>)}
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
    button: {
    backgroundColor: "rgba(228, 67, 67, 0.85)",
    height: 40,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    alignSelf: "center",
    margin: 7
  },
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
  progressBarContainer: {
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "white",
    padding: 0,
    height: 30
  },
  progressBarFill:{
    borderWidth: 0,
    borderRadius: 8,
    margin: 0,
    height: 26
  },
  textContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    },
  percentageText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
    }
});
