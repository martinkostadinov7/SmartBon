  import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

  export function ExpenseCard({
    title,
    amount,
    date,
    categoryName,
    categoryEmoji,
    categoryColor,
    subcategoryEmoji,
    subcategoryText,
    subcategoryColor,
    onPress
  }: ExpenseCardProps) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.card}>
        <View style={[styles.iconContainer, {backgroundColor: categoryColor}]}>
          <Text style={styles.categoryEmoji}>{categoryEmoji}</Text>
        </View>

        <View style={styles.content}>
          <Text 
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.title}>{title}</Text>

          <View style={styles.categoryRow}>
            <Text 
            numberOfLines={2}
            ellipsizeMode="tail"
            style={styles.categoryText}>{categoryName}</Text>

            {subcategoryEmoji && (
              <View style={[styles.subcategoryBadge, {backgroundColor: subcategoryColor}]}>
                <Text style={styles.subcategoryEmoji}>
                  {subcategoryEmoji}
                </Text>
                <Text
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  style={styles.subcategoryText}
                >
                  {subcategoryText}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.right}>
          <Text style={styles.amount}>{amount.toFixed(2)}</Text>
          <Text style={styles.date}>{formatDate(date)}</Text>
        </View>
      </TouchableOpacity>
    );
  }


  type ExpenseCardProps = {
    title: string;
    amount: number;
    date: string; 
    categoryName: string;
    categoryEmoji: string;   
    categoryColor: string;
    subcategoryEmoji?: string; 
    subcategoryText?: string;
    subcategoryColor?: string; 
    onPress: () => void
  };


  function formatDate(dateString: string) {
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

  const styles = StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 2,
      borderColor: "black",
      borderRadius: 16,
      padding: 8,
      marginBottom: 10,
      backgroundColor: "white",
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 1,
    },

    iconContainer: {
      width: 56,
      height: 56,
      borderWidth: 2,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
      borderColor: "#d7d7d7ff"
    },

    categoryEmoji: {
      fontSize: 32, 
    },

    content: {
      flex: 2,
    },

    title: {
      fontSize: 15,
      fontWeight: "bold",
      maxWidth: 370,
    },

    categoryRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
    },

    categoryText: {
      color: "#666",
      marginRight: 8,
      maxWidth: 90,
      fontSize: 13
    },

    subcategoryBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#ecececff",
      borderRadius: 8,
      paddingRight: 5,
      paddingLeft: 1,
      paddingVertical: 3,
      maxWidth: 100,
    },

    subcategoryEmoji: {
      margin: 3,
      fontSize: 14,
      marginRight: 4,
    },

    subcategoryText: {
      fontSize: 11,
      flexShrink: 1,
    },

    right: {
      justifyContent: "space-between",
      marginLeft: 10,
      height: 50,
      flex: 1, alignItems: 'flex-end'
    },

    amount: {
      color: "red",
      fontSize: 14,
      fontWeight: "bold",
    },

    date: {
      marginTop: 4,
      fontSize: 12,
      color: "#000"
    },
  });
