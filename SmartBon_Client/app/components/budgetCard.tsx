  import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Category } from "../types/category";
import { Subcategory } from "../types/subcategory";

  export function BudgetCard({
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
    onPress
  }: BudgetCardProps) {
    async function handleArchiveBudget(){

    }
    return (
      <TouchableOpacity onPress={onPress} style={[styles.card, {backgroundColor: colorHex}]}>
        <View style={[styles.row,{marginBottom: 5}]}>
            <Text style={{fontSize: 40}}>{icon}</Text>
            <Text
             numberOfLines={1}
            ellipsizeMode="tail" style={{fontSize: 20, marginRight: 10, maxWidth: 290}}>{name}</Text>
        </View>
        <ScrollView horizontal>
            {subCategories.length > 0 ? 
            (subCategories.map(subCategory => (
            <View key={subCategory.id}  style={[styles.row, {padding: 5,borderRadius: 10, backgroundColor: subCategory.colorHex, marginRight: 10}]}>
                <Text style={{fontSize: 16}}>{subCategory.icon}</Text>
                <Text style={{fontSize: 14, marginLeft: 5, marginVertical: 0}}>{subCategory.name}</Text>
            </View>))) : 
            (
            categories.length > 0 ? (categories.map(category => (
            <View key={category.id} style={[styles.row, {padding: 5,borderRadius: 10, backgroundColor: category.colorHex, marginRight: 10}]}>
                <Text style={{fontSize: 16}}>{category.icon}</Text>
                <Text style={{fontSize: 14, marginLeft: 5, marginVertical: 0}}>{category.name}</Text>
            </View>
            ))) : (<></>)
            )}
        </ScrollView>
        <View style={[styles.row, {marginTop: 10}]}>
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
        {false ? (<TouchableOpacity onPress={handleArchiveBudget} style={styles.archiveBudgetButton}>
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
    categories: Category[]; 
    subCategories: Subcategory[]; 
    onPress: () => void
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
        backgroundColor: "#b6b000",
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