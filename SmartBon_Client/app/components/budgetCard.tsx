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
    return (
      <TouchableOpacity onPress={onPress} style={[styles.card, {backgroundColor: colorHex}]}>
        <View style={[styles.row,{marginBottom: 10}]}>
            <Text style={{fontSize: 40}}>{icon}</Text>
            <Text
             numberOfLines={1}
            ellipsizeMode="tail" style={{fontSize: 22, marginRight: 10, maxWidth: 290}}>{name}</Text>
        </View>
        <ScrollView horizontal>
            {subCategories.length > 0 ? 
            (subCategories.map(subCategory => (
            <View key={subCategory.id}  style={[styles.row, {padding: 5,borderRadius: 10, backgroundColor: subCategory.colorHex, marginRight: 10, borderWidth:1}]}>
                <Text style={{fontSize: 20}}>{subCategory.icon}</Text>
                <Text style={{fontSize: 16, marginLeft: 5, marginVertical: 0}}>{subCategory.name}</Text>
            </View>))) : 
            (
            categories.length > 0 ? (categories.map(category => (
            <View key={category.id} style={[styles.row, {padding: 5,borderRadius: 10, backgroundColor: category.colorHex, marginRight: 10, borderWidth:1}]}>
                <Text style={{fontSize: 20}}>{category.icon}</Text>
                <Text style={{fontSize: 16, marginLeft: 5, marginVertical: 0}}>{category.name}</Text>
            </View>
            ))) : (<></>)
            )}
        </ScrollView>
        <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { backgroundColor: progressBarColor, width: `${percentage}%`}]} />
            <View style={styles.textContainer}>
                <Text style={styles.percentageText}>{percentage}%</Text>
            </View>
        </View>
        <View style={styles.row}>
            <Text>{from} - {to}</Text>
            <View>
                <Text>{currentAmount} spent out of {limit}</Text>
                <Text>Remaining: {remainingAmount}</Text>
            </View>
        </View>
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
    borderWidth: 2,
    borderColor: "black",
    borderRadius: 16,
    padding: 10,
},
    row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressBarContainer: {
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: "white",
    padding: 0,
    height: 30,
    marginVertical: 10
  },
  progressBarFill:{
    borderWidth: 0,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
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