import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import EmojiPickerModal from "../../../components/emojiPicker";
import { apiFetch } from "../../../services/api";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Goal } from "../../../types/goal";
import { GoalContribution } from "../../../types/goalContribution";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

export default function ViewGoalModal() {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [contributions, setContributions] = useState<GoalContribution[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [from, setFrom] = useState(new Date());
  const [targetDate, setTargetDate] = useState(new Date());
  const [selectedLimit, setSelectedLimit] = useState("");
  const [originalLimit, setOriginalLimit] = useState("");
  const [currentAmount, setCurrentAmount] = useState();
  const [contributionAmount, setContributionAmount] = useState("");
  const [selectedIcon, setIcon] = useState("📌");
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [isContributionEditing, setIsContributionEditing] = useState(false);
  const [contributionEditingId, setContributionEditing] = useState(0);
  const [screenHeight, setScreenHeight] = useState(490);
  const { id } = useLocalSearchParams<{ id: string}>();
  const [isEditing, setIsEditing] = useState(false);
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

function formatDateContribution(dateString: string) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();

    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    if (isSameDay(date, today)) return "Today";
    if (isSameDay(date, yesterday)) return "Yesterday";

    return date.toLocaleDateString();
  }

function getProgressBarColor(percentage: number): string {
   const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
    
    const opacity = 0.3 + (clampedPercentage / 100) * 0.9;

    return `rgba(42, 209, 0, ${opacity.toFixed(2)})`;
  }
  const [confirmedLimit, setConfirmedLimit] = useState("");
  const progressBarColor= getProgressBarColor((Number(currentAmount) / Number(confirmedLimit) * 100))
const percentage= Math.min((Number(currentAmount) / Number(confirmedLimit)) * 100, 100).toFixed(0)
const remaining = (Number(confirmedLimit) - Number(currentAmount)).toFixed(2)

// Вътре в компонента:
const fetchGoalData = useCallback(async () => {
  try {
    const response = await apiFetch(`/Goals/${id}`);
      if (!response.ok) {
        throw new Error("Failed targetDate load goal");
      }
      const goal = await response.json();
      setGoal(goal);
      setContributions(goal?.contributions ?? []);
      setIcon(goal?.icon ?? "undefined");
      setName(goal?.name ?? "undefined");
      setDescription(goal?.description ?? null);
      setTargetDate(new Date(goal?.targetDate) ?? new Date());
      setSelectedLimit(String(goal?.finalAmount) ?? "undefined");
      setOriginalLimit(String(goal?.finalAmount) ?? "undefined");
      setConfirmedLimit(String(goal?.finalAmount) ?? "undefined");
      setCurrentAmount(goal?.currentAmount ?? "undefined");
      setSelectedColor(goal?.colorHex ?? "undefined");
  } catch (error) {
    console.error("Error fetching goal:", error);
  }
}, [id]);

// Това се задейства всеки път, когато се върнеш на този екран
useFocusEffect(
  useCallback(() => {
    fetchGoalData();
  }, [fetchGoalData])
);

useEffect(() => {(async () => {
      const response = await apiFetch(`/Goals/${id}`);
      if (!response.ok) {
        throw new Error("Failed targetDate load goal");
      }
      const goal = await response.json();
      setGoal(goal);
      setContributions(goal?.contributions ?? []);
      setIcon(goal?.icon ?? "undefined");
      setName(goal?.name ?? "undefined");
      setDescription(goal?.description ?? null);
      setTargetDate(new Date(goal?.targetDate) ?? new Date());
      setSelectedLimit(String(goal?.finalAmount) ?? "undefined");
      setOriginalLimit(String(goal?.finalAmount) ?? "undefined");
      setConfirmedLimit(String(goal?.finalAmount) ?? "undefined");
      setCurrentAmount(goal?.currentAmount ?? "undefined");
      setSelectedColor(goal?.colorHex ?? "undefined");
    })();
   }, [id]);

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

async function handleSaveContribution(contributionId: number){
    if(!contributionAmount){
          Alert.alert(
              "Input error",
              "Fill out required fields!",
              [{ text: "OK" }]
            );
        }
        const normalizedAmount = contributionAmount.replace(",", ".").trim();
        const amount = parseFloat(normalizedAmount);
        const goal = {
            amount: amount,
            goalId: id

        }
        try {
            const response = await apiFetch(`/Goals/${id}/contributions/${contributionId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(goal),
            });
        if (!response.ok) 
        {
            const errorData = await response.json(); 
            throw new Error(errorData.message || "An unknown error occurred");
        }
        router.back();
        } catch (e: any) {

    Alert.alert(
        "Error",
        e?.message,
        [{ text: "OK" }]
        );
        console.log("Network/API error:", e?.message.message ?? e);
    }
}

  async function handleSaveGoal(){
      if(!name || !selectedLimit){
          Alert.alert(
              "Input error",
              "Fill out required fields!",
              [{ text: "OK" }]
            );
        }
        const normalizedLimit = selectedLimit.replace(",", ".").trim();
        const limit = parseFloat(normalizedLimit);
        const goal = {
            icon: selectedIcon,
            name: name,
            description: description,
            finalAmount: limit,
            startDate: from,
            targetDate: targetDate,
            colorHex: selectedColor
        }
        try {
            const response = await apiFetch(`/Goals/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(goal),
            });
        if (!response.ok) 
        {
            const errorData = await response.json(); 
            throw new Error(errorData.message || "An unknown error occurred");
        }
        router.back();
    } catch (e: any) {

    Alert.alert(
        "Error",
        e?.message,
        [{ text: "OK" }]
        );
        console.log("Network/API error:", e?.message.message ?? e);
    }
  }
  async function handleDeleteContribution(contributionId: number){
    Alert.alert(
      "Delete Goal",
      "Are you sure you want targetDate delete this record?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await apiFetch(`/Goals/${id}/contributions/${contributionId}`, {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                }
              });
  
              if (response.ok) {
                setIsEditing(false);
                try {
                    const response = await apiFetch(`/Goals/${id}`);
                    if (!response.ok) {
                        throw new Error("Failed targetDate load goal");
                    }
                    const goal = await response.json();
                    setGoal(goal);
                    setContributions(goal?.contributions ?? []);
                    setIcon(goal?.icon ?? "undefined");
                    setName(goal?.name ?? "undefined");
                    setDescription(goal?.description ?? null);
                    setTargetDate(new Date(goal?.targetDate) ?? new Date());
                    setSelectedLimit(String(goal?.finalAmount) ?? "undefined");
                    setOriginalLimit(String(goal?.finalAmount) ?? "undefined");
                    setConfirmedLimit(String(goal?.finalAmount) ?? "undefined");
                    setCurrentAmount(goal?.currentAmount ?? "undefined");
                    setSelectedColor(goal?.colorHex ?? "undefined");
                } catch (error) {
                    console.error("Error fetching goal:", error);
                }
              } else {
                Alert.alert("Error", "Could not delete the contribution.");
              }
            } catch (e) {
              Alert.alert("Error", "An error occurred while trying targetDate delete the expense!");
              console.log("Network/API error:", e);
            }
          }
        }
      ]
    );
  }

function handleAddContribution(goalId: number, goalName: string){
  router.push({
    pathname: `/(modals)/goals/${goalId}/addContribution`, 
    params: { 
      goalId: goalId,
      goalName: goalName
    }
  });
}

  async function handleDeleteGoal() {
    Alert.alert(
      "Delete Goal",
      "Are you sure you want targetDate delete this record?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await apiFetch(`/Goals/${id}`, {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                }
              });
  
              if (response.ok) {
                setIsEditing(false);
                router.back();
              } else {
                Alert.alert("Error", "Could not delete the goal.");
              }
            } catch (e) {
              Alert.alert("Error", "An error occurred while trying targetDate delete the expense!");
              console.log("Network/API error:", e);
            }
          }
        }
      ]
    );

}
  return (
    <>
    <View style={styles.overlay}>       
         <Pressable 
        style={StyleSheet.absoluteFill} 
        onPress={() => router.back()} 
        />   
        
          <View 
            style={[styles.container, {height: isEditing ?  screenHeight: screenHeight + 120}]} 
            // Това спира клика да стигне до overlay-а, без да пречи на ScrollView
            onStartShouldSetResponder={() => true} 
            onResponderTerminationRequest={() => false}
            >
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.headerBtn}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleDeleteGoal}>
                <Text style={[styles.headerBtn, {color: "red"}]}>Delete</Text>
              </TouchableOpacity>

            <TouchableOpacity onPress={isEditing ? handleSaveGoal : () => setIsEditing(true)}>
                <Text style={styles.headerBtn}>{isEditing ? "Save" : "Edit"}</Text> 
            </TouchableOpacity>
            </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>
        <TouchableOpacity activeOpacity={1.0}>
            
        {isEditing ? 
        (<><View style={styles.row}>
            <View style={{marginRight: 20}}>
                <Text style={[styles.label,{marginTop: 0}]}>Icon</Text>
                <TouchableOpacity
                style={styles.iconButtargetDaten}
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

            <Text style={styles.label}>Progress</Text>
            <View style={styles.progressBarContainer}>
                <View style={[styles.progressBarFill, { backgroundColor: progressBarColor, width: `${Number(percentage)}%`}]} />
                <View style={styles.textContainer}>
                    <Text style={styles.percentageText}>{percentage}%</Text>
                </View>
            </View>
             <View style={[styles.row, {justifyContent: "space-between"}]}>
                <View>
                    <Text style={styles.label}>Goal</Text>
                    <TextInput
                    style={[styles.input, {minWidth: 75}]}
                    value={selectedLimit}
                    onChangeText={handleSelectLimit}    
                    onBlur={validateLimit}   
                    onFocus={() => setScreenHeight(655)}
                    keyboardType="decimal-pad"
                    />
                </View>
                <Text style={{marginTop: 30}}>-</Text>
                <View>
                    <Text style={styles.label}>Saved</Text>
                    <View style={[styles.input, {maxWidth: 100, borderWidth: 0}]}>
                        <Text style={{fontSize: 16}}>{(Number(currentAmount)).toFixed(2)}</Text>
                    </View>
                </View>
                <Text style={{marginTop: 30}}>=</Text>
                <View>
                    <Text style={styles.label}>Remaining</Text>
                    <View style={[styles.input, {maxWidth: 100, borderWidth: 0}]}>
                        <Text style={{fontSize: 16}}>{(Number(remaining))}</Text>
                    </View>
                </View>
                
            </View>
            <View>
                <View style={[styles.row, {width: 250, justifyContent: "space-between"}]}>
                    <Text style={{marginVertical: 10, fontSize: 16}}>Target date: </Text>
                    <DateTimePicker
                    value={targetDate}
                    mode="datetime"
                    display="default"
                    onChange={(event, selectedDate) => {
                        if (selectedDate) setTargetDate(selectedDate);
                    }}
                    />
                </View>
            </View>

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
            </ScrollView></>) : 
        //not editing
        (<>
        <View style={styles.row} pointerEvents="box-none">
            <View style={{marginRight: 20}} pointerEvents="box-none">
                <Text style={[styles.label,{marginTop: 0}]}>Icon</Text>
                <View
                style={[styles.iconButtargetDaten, {borderColor: "#eaeaea"}]}
                >
                    <Text style={styles.iconText}>{selectedIcon}</Text>
                </View>
            </View>

            <View style={{width: 288}} pointerEvents="box-none">
                <Text style={[styles.label, {marginTop: 0}]}>Name</Text>
                <View
                style={[styles.input, {borderColor: "#eaeaea"}]}>
                <Text style={{fontSize: 16}}>{name}</Text>
                </View>
            </View>
        </View>

            <Text style={styles.label}>Description</Text>
            <View style={[styles.input, {borderColor: "#eaeaea"}]} pointerEvents="box-none">
                <Text style={{fontSize: 16}}>{description}</Text>
            </View>

            <Text style={styles.label} >Progress</Text>
            <View style={styles.progressBarContainer} pointerEvents="box-none">
                <View style={[styles.progressBarFill, { backgroundColor: progressBarColor, width: `${Number(percentage)}%`}]} />
                <View style={styles.textContainer}>
                    <Text style={styles.percentageText}>{percentage}%</Text>
                </View>
            </View>

            <View style={[styles.row, {justifyContent: "space-between"}]} pointerEvents="box-none">
                <View>
                    <Text style={[styles.label, {marginLeft: 12}]}>Goal</Text>
                    <View style={[styles.input, {maxWidth: 100, borderColor: "#eaeaea"}]}
                    >
                        <Text style={{fontSize: 16}}>{selectedLimit}</Text>
                    </View>
                </View>
                <Text style={{marginTop: 30}}>-</Text>
                <View>
                    <Text style={styles.label}>Saved</Text>
                    <View style={[styles.input, {maxWidth: 100, borderWidth: 0, paddingLeft: 0}]}>
                        <Text style={{fontSize: 16}}>{Number(currentAmount).toFixed(2)}</Text>
                    </View>
                </View>
                <Text style={{marginTop: 30}}>=</Text>
                <View>
                    <Text style={styles.label}>Remaining</Text>
                    <View style={[styles.input, {maxWidth: 100, borderWidth: 0, paddingLeft: 0}]}>
                        <Text style={{fontSize: 16}}>{(Number(selectedLimit) - Number(currentAmount)).toFixed(2)}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.row} pointerEvents="box-none">
                <Text style={{marginVertical: 10, fontSize: 16}}>Target date: </Text>
                <View style={{opacity: 0.7}}>
                    <View pointerEvents="none">
                        <DateTimePicker
                            value={targetDate}
                            mode="datetime"
                            display="default"
                            onChange={(event, selectedDate) => {
                            if (selectedDate) setFrom(selectedDate);
                        }}
                        />
                    </View>
                </View>
            </View>
                    
            <Text style={styles.label}>Color</Text>
            <ScrollView  horizontal style={{ flexDirection: 'row'}}
            showsHorizontalScrollIndicator={false} pointerEvents="box-none"
            >
            {colors.filter(color => color == selectedColor).map((color) => {
                return (
                    <View 
                    key={color}
                    style={[styles.colorBox, {backgroundColor: color}]}
                    />
                );
            })}
            </ScrollView>
            <View style={[styles.row, {alignItems: 'center'}]}>
                <Text style={[styles.label, {marginBottom: 10}]} >Contributions</Text>
                <TouchableOpacity style={{marginLeft: 10}} onPress={() => handleAddContribution(Number(id), name)}>
                    <Text style={{color: "#3077ce", fontWeight: "600", fontSize: 16}}>+ Add New</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.contributionList} >
                {contributions.length > 0 ? (
                  contributions.map((c) => (
                    <View key={c.id} style={[styles.row, styles.contributionItem, { justifyContent: "space-between" }]}>
                        {contributionEditingId == c.id ? 
                        (<TextInput
                        style={[styles.input, {paddingVertical: 5}]}
                        value={contributionAmount}
                        onChangeText={setContributionAmount}
                        onFocus={() => setScreenHeight(755 + (contributions.findIndex(co => co.id == c.id) + 1) * 40.3)}
                        onBlur={() => setScreenHeight(490)}
                        keyboardType="decimal-pad"
                        />) : 
                        (
                            <Text style={{ fontSize: 16 }}>{Number(c.amount).toFixed(2)}</Text>
                        )}
                      
                      <Text>{formatDateContribution(String(c.dateTime))}</Text>
                      <View style={[styles.row, { gap: 15 }]}>
                        <TouchableOpacity onPress={() => {contributionEditingId == c.id ? handleSaveContribution(c.id) : setIsContributionEditing(true); setContributionEditing(c.id); setContributionAmount(String(c.amount))}}>
                           <FontAwesome6 
                             name={contributionEditingId == c.id ? "save" : "pen"} 
                             size={18} 
                             color="black" 
                           />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {handleDeleteContribution(c.id)}}>
                          <FontAwesome6 name="trash-can" size={18} color="red" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={{ color: '#999', fontStyle: 'italic' }}>No contributions yet.</Text>
                )}
              </View>
            </>)}
            
        </TouchableOpacity>
        
        </ScrollView>
        
          </View>
    
      </View>

      <EmojiPickerModal
        visible={isEmojiOpen}
        onClose={() => setIsEmojiOpen(false)}
        onSelect={setIcon}
      />
    </>
  );
}


const styles = StyleSheet.create({
    buttargetDaten: {
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
contributionList: {
  marginTop: 5,
  gap: 10,
  paddingBottom: 20, // Място най-отдолу за по-добър UX
},
contributionItem: {
  paddingVertical: 10,
  borderBottomWidth: 1,
  borderBottomColor: '#c5c5c5',
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
  iconButtargetDaten: {
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
    borderRadius: 16,
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
