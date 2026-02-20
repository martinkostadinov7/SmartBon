  import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from "react-native";
import { apiFetch } from "../services/api";
  export function GoalCard({
    id,
    icon,
    name,
    colorHex,
    progressBarColor,
    percentage,
    to,  
    limit,
    currentAmount,
    remainingAmount,
    remaining,
    realised,
    onPress,
    onRealiseGoalButtonPress,
    reloadComponent
  }: GoalCardProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [amount, setAmount] = useState("");

    async function handleAddContribution(){
        try {
            if(!amount){
                Alert.alert(
                "Input error",
                "Amount field cannot be empty!",
                [{ text: "OK" }]
                );
                return;
            }
            const normalizedCost = amount.replace(",", ".").trim();
            const normalizedAmount = parseFloat(normalizedCost);
            const contribution = {
                "goalId": id,
                "amount": normalizedAmount
            }
            const response = await apiFetch(`/Goals/${id}/contributions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(contribution),
            });
            setIsAdding(false);
            setAmount("");
            reloadComponent();
            if (!response.ok) 
            {
                const errorData = await response.json(); 
                throw new Error(errorData.message || "An unknown error occurred");
            }
        } catch (e: any) {

        Alert.alert(
            "Error",
            e?.message,
            [{ text: "OK" }]
            );
            console.log("Network/API error:", e?.message.message ?? e);
        }
    }   
    return (
      <TouchableOpacity onPress={onPress} style={[styles.card, {backgroundColor: colorHex}]}>
        <View style={[styles.row,{marginBottom: 5, justifyContent: 'space-between'}]}>
            <Text style={{fontSize: 40}}>{icon}</Text>
            <Text
             numberOfLines={1}
            ellipsizeMode="tail" style={{fontSize: 20, marginRight: 10, maxWidth: 290}}>{name}</Text>
        </View>
        <View style={[styles.row, {marginTop: 10, justifyContent: 'space-between'}]}>
            <View>
                <Text style={{fontSize: 13, color: "#616161"}}>Target date</Text>
                <Text>{to}</Text>
            </View>
            <View style={{alignContent: "flex-end"}}>
                <View style={styles.row}>
                    <Text style={{fontWeight:"700"}}>{currentAmount}</Text>
                    <Text> / </Text>
                    <Text>{limit}</Text>
                </View>
                {remaining ? 
                (<Text>Remaining: {remainingAmount}</Text>) : 
                (<Text>Extra: {remainingAmount.slice(1, remainingAmount.length)}</Text>)}
            </View>
        </View>
        {percentage >= 100 && !realised ? 
        (<TouchableOpacity onPress={onRealiseGoalButtonPress} style={styles.realiseGoalButton}>
            <Text style={styles.realiseGoalText}>Realise goal</Text>
        </TouchableOpacity>) : 
        (<>
        <View style={[styles.row, {marginTop: 5}]}>
            {isAdding && !realised ? 
            (<TextInput
                    style={[styles.input, {width: 190}]}
                    value={amount}
                    onChangeText={setAmount}    
                    keyboardType="decimal-pad"
                    />): 
            (<View style={[styles.progressBarContainer, {marginRight: 5, width: realised ? 320 : 230}]}>
                <View style={[styles.progressBarFill, {backgroundColor: progressBarColor, width: `${Math.min(percentage, 100)}%`}]}>
                </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.percentageText}>{percentage}%</Text>
                    </View>
            </View>)}
            {!realised && (
                <>
                    {isAdding && (<TouchableOpacity onPress={() => {setIsAdding(false); setAmount("");} } style={[styles.addButton,{alignItems: "center", backgroundColor:"#ff0000"}]}> 
                        <FontAwesome6 name={"xmark"} size={18} color="white" />
                    </TouchableOpacity>)}
                    
                    <TouchableOpacity onPress={() => {isAdding ? handleAddContribution() : setIsAdding(true)} } style={[styles.addButton,{alignItems: "center"}]}> 
                        <FontAwesome6 name={isAdding ? "check" : "plus"} size={18} color="white" />
                    </TouchableOpacity>
                </>
            )}
        </View>
        </>)}
        
      </TouchableOpacity>
    );
  }

  type GoalCardProps = {
    id: number;
    icon: string;
    colorHex: string;
    progressBarColor: string;
    name: string;
    percentage: number; 
    to: string;   
    limit: string;
    currentAmount: string; 
    remainingAmount: string;
    remaining: boolean;
    realised: boolean;
    onPress: () => void;
    onRealiseGoalButtonPress: () => void;
    reloadComponent: () => void;
  };

  const styles = StyleSheet.create({
    card: {
    marginBottom: 10,
    borderColor: "black",
    borderRadius: 16,
    padding: 10,
    marginRight: 10,
    minWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
},
    row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarContainer: {
    borderRadius: 10,
    backgroundColor: "white",
    padding: 0,
    height: 25,
    marginTop: 10,
    width: 230
  },
  progressBarFill:{
    borderWidth: 0,
    borderRadius: 10,
    margin: 0,
    height: 25
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
    },
    realiseGoalButton:{
        backgroundColor: "rgba(42, 209, 0)",
        borderRadius: 10,
        padding: 10,
        marginTop: 10   
    },
    realiseGoalText:{
        textAlign: "center",
        fontSize: 18,
        color: "white",
        fontWeight: "700"
    },
    addButton:{
        width:35,
        height: 35,
        backgroundColor: "rgba(42, 209, 0)",
        borderRadius: 35,
        justifyContent:"center",
        marginLeft: 10
    },
    addButtonText:{
        textAlign: "center",
        fontSize: 26,
        fontWeight: "600",
        color: "white",
        marginBottom: 1 
    },input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    fontSize: 16,
    backgroundColor: "white"
  },
  });