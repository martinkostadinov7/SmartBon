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
  subcategoryColor
}: ExpenseCardProps) {
  return (
    <TouchableOpacity style={styles.card}>
      <View style={[styles.iconContainer, {backgroundColor: categoryColor}]}>
        <Text style={styles.categoryEmoji}>{categoryEmoji}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>

        <View style={styles.categoryRow}>
          <Text style={styles.categoryText}>{categoryName}</Text>

          {subcategoryEmoji && (
            <View style={[styles.subcategoryBadge, {backgroundColor: subcategoryColor}]}>
              <Text style={styles.subcategoryEmoji}>
                {subcategoryEmoji}
              </Text>
              <Text
                numberOfLines={1}
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
        <Text style={styles.amount}>${amount.toFixed(2)}</Text>
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
    padding: 14,
    marginBottom: 12,
    backgroundColor: "white",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
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
    flex: 1,
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
  },

  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  categoryText: {
    color: "#666",
    marginRight: 8,
  },

  subcategoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecececff",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    maxWidth: 160,
  },

  subcategoryEmoji: {
    margin: 3,
    fontSize: 14,
    marginRight: 4,
  },

  subcategoryText: {
    fontSize: 12,
    flexShrink: 1,
  },

  right: {
    alignItems: "flex-end",
    marginLeft: 10,
  },

  amount: {
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
  },

  date: {
    marginTop: 4,
    fontSize: 12,
    color: "#000",
  },
});
