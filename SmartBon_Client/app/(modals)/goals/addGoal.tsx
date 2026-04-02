import React, { useState } from "react";
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
import EmojiPickerModal from "../../components/emojiPicker";
import { apiFetch } from "../../services/api";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from "react-i18next";

export default function ViewGoalModal() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [from, setFrom] = useState(new Date());
  const [targetDate, setTargetDate] = useState(new Date());
  const [selectedLimit, setSelectedLimit] = useState("");
  const [selectedIcon, setIcon] = useState("📌");
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [screenHeight, setScreenHeight] = useState(310);
  const [isEditing, setIsEditing] = useState(false);
  const { t, i18n } = useTranslation();
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


  async function handleSaveGoal(){
      if(!name || !selectedLimit){
          Alert.alert(
          `${t('error')}`,
          `${t('fill_out_fields')}`,
          [{ text: "OK" }]
          );
            return;
        }
        if(targetDate < new Date()){
          Alert.alert(
          `${t('error')}`,
          `${t('target_date_must_not_be_in_past')}`,
          [{ text: "OK" }]
          );
            return;
        }
        
        const normalizedLimit = selectedLimit.replace(",", ".").trim();
        const limit = parseFloat(normalizedLimit);
        const goal = {
            icon: selectedIcon,
            name: name,
            description: description,
            finalAmount: limit,
            targetDate: targetDate,
            colorHex: selectedColor
        }
        try {
            const response = await apiFetch(`/Goals`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(goal),
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
                <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.headerBtn}>{t('cancel')}</Text>
              </TouchableOpacity>

            <TouchableOpacity onPress={handleSaveGoal}>
                <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.headerBtn}>{t('save')}</Text> 
            </TouchableOpacity>
            </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>
            <View style={styles.row}>
            <View style={{marginRight: 20}}>
                <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={[styles.label,{marginTop: 0}]}>{t('icon')}</Text>
                <TouchableOpacity
                style={styles.iconButtargetDaten}
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
              onFocus={() => setScreenHeight(410)}
              onBlur={() => setScreenHeight(310)} 
              multiline
            />

            <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.label}>{t('goal')}</Text>
            <TextInput
            style={[styles.input, {minWidth: 75}]}
            value={selectedLimit}
            onChangeText={setSelectedLimit}  
            onFocus={() => setScreenHeight(500)}
            onBlur={() => setScreenHeight(310)}
            keyboardType="decimal-pad"
            />
                
            <View style={{marginTop: 10}}>
                <View style={[styles.row, {width: 250, justifyContent: "space-between"}]}>
                    <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{marginVertical: 10, fontSize: 16}}>{t('target_date')}: </Text>
                    <DateTimePicker
                      locale={i18n.language}
                    value={targetDate}
                    mode="datetime"
                    display="default"
                    onChange={(event, selectedDate) => {
                        if (selectedDate) setTargetDate(selectedDate);
                    }}
                    />
                </View>
            </View>

            <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.label}>{t('error')}</Text>
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
