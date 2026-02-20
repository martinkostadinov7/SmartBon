  import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Category } from "../types/category";
import { Subcategory } from "../types/subcategory";
import { apiFetch } from "../services/api";

  export function BudgetCard({
    id,
    icon,
    name,
    colorHex,
    progressBarColor,
    percentage,
    from,
    to,  
    limit,
    currentAmount,
    remainingAmount,
    categories,
    subCategories,
    limitReached,
    archived,
    onPress,
    reloadComponent
  }: BudgetCardProps) {
    async function handleArchiveBudget(){
        try {
            const response = await apiFetch(`/Budgets/${id}/archive`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                }
            });
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
        <View style={[styles.row,{marginBottom: 5}]}>
            <Text style={{fontSize: 40}}>{icon}</Text>
            <Text
             numberOfLines={1}
            ellipsizeMode="tail" style={{fontSize: 20, marginRight: 10, maxWidth: 290}}>{name}</Text>
        </View>
        <ScrollView horizontal style={{marginBottom: 10}}>
            {subCategories.length > 0 ? 
            (subCategories.map(subCategory => (
            <View key={subCategory.id}  style={[styles.row, {padding: 5,borderRadius: 10, backgroundColor: subCategory.colorHex, marginRight: 10, height: 30}]}>
                <Text style={{fontSize: 16}}>{subCategory.icon}</Text>
                <Text style={{fontSize: 14, marginLeft: 5, marginVertical: 0}}>{subCategory.name}</Text>
            </View>))) : 
            (
            categories.length > 0 ? (categories.map(category => (
            <View key={category.id} style={[styles.row, {padding: 5,borderRadius: 10, backgroundColor: category.colorHex, marginRight: 10, height: 30}]}>
                <Text style={{fontSize: 16}}>{category.icon}</Text>
                <Text style={{fontSize: 14, marginLeft: 5, marginVertical: 0}}>{category.name}</Text>
            </View>
            ))) : (<></>)
            )}
        </ScrollView>
        <View style={[styles.row]}>
            <View>
                <Text>From: {from}</Text>
                <Text>To: {to}</Text>
            </View>
            <View style={{alignContent: "flex-end"}}>
                <View style={styles.row}>
                    <Text style={{fontWeight:"700"}}>{currentAmount}</Text>
                    <Text> / </Text>
                    <Text>{limit}</Text>
                </View>
                <Text>Remaining: {remainingAmount}</Text>
            </View>
        </View>
        {limitReached && !archived ? (<TouchableOpacity onPress={handleArchiveBudget} style={styles.archiveBudgetButton}>
                    <Text style={styles.archiveBudgetText}>Archive budget</Text>
                </TouchableOpacity>) :
        (<View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, {backgroundColor: progressBarColor, width: `${percentage}%`}]}>
            </View>
                <View style={styles.textContainer}>
                    <Text style={styles.percentageText}>{percentage}%</Text>
                </View>
        </View>)}
      </TouchableOpacity>
    );
  }

  type BudgetCardProps = {
    id:number
    icon: string;
    colorHex: string;
    progressBarColor: string;
    name: string;
    percentage: number; 
    from: string;
    to: string;   
    limit: string;
    currentAmount: string; 
    remainingAmount: string;
    limitReached: boolean;
    archived: boolean;
    categories: Category[]; 
    subCategories: Subcategory[]; 
    onPress: () => void
    reloadComponent: ()=> void
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressBarContainer: {
    borderRadius: 10,
    backgroundColor: "white",
    padding: 0,
    height: 25,
    marginTop: 10
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
    },archiveBudgetButton:{
        backgroundColor: "#eae200",
        borderRadius: 10,
        padding: 10,
        marginTop: 10   
    },
    archiveBudgetText:{
        textAlign: "center",
        fontSize: 18,
        color: "white",
        fontWeight: "700"
    },
  });