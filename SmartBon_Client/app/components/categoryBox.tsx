import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export function CategoryBox({
  name,
  icon,
  selected,
  onPress
}: categoryBoxProps) {

  return (
    <TouchableOpacity onPress={onPress} style={selected ? styles.selected : styles.box}>
        <Text style={styles.icon}>{icon}</Text>
        <Text numberOfLines={2} ellipsizeMode="tail" style={styles.name}>{name}</Text>
    </TouchableOpacity>
  );
}

type categoryBoxProps = {
  name: string;
  icon: string;
  selected: boolean;
  onPress: () => void
};


const styles = StyleSheet.create({
selected:{
    backgroundColor: "lightblue",
    width: 100,
    height: 100,
    borderColor: "darkGray",
    borderWidth: 1.5,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    margin: 2
},
box:{
    width: 100,
    height: 100,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    margin: 2
},
icon:{
    fontSize: 35,
},
name:{
    fontSize: 15,
    marginLeft: 5,
    marginRight: 5,
    textAlign: "center"
}
});
