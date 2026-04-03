import { useTranslation } from "react-i18next";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

  export function CategoryBox({
    name,
    icon,
    color,
    selected,
    readOnly = false,
    boxSize = 100,
    iconSize = 35,
    fontSize = 15,
    pressable = true,
    onPress
  }: categoryBoxProps) {
const { t, i18n } = useTranslation();

    return (<>
      {pressable ? (
        <TouchableOpacity activeOpacity={readOnly ? 1 : 0.3} onPress={onPress} style={[selected ? styles.selected : styles.box, {backgroundColor: color, width: boxSize, height: boxSize}]}>
          <Text 
  numberOfLines={2} 
  adjustsFontSizeToFit style={[styles.icon, {fontSize: iconSize}]}>{icon}</Text>
          <Text 
  numberOfLines={2} ellipsizeMode="tail" style={[styles.name, {fontSize: fontSize}]}>{name}</Text>
        </TouchableOpacity>
        ) :  
      (
      <View style={[selected ? styles.selected : styles.box, {backgroundColor: color, width: boxSize, height: boxSize}]}>
          <Text 
  numberOfLines={2} 
  adjustsFontSizeToFit style={[styles.icon, {fontSize: iconSize}]}>{icon}</Text>
          <Text 
  numberOfLines={2} ellipsizeMode="tail" style={[styles.name, {fontSize: fontSize}]}>{t(name)}</Text>
      </View>)}
    </>
    );
  }

  type categoryBoxProps = {
    name: string;
    icon: string;
    color: string;
    selected: boolean;
    readOnly?: boolean;
    boxSize?: number;
    iconSize?: number;
    fontSize?: number;
    pressable?: boolean;
    onPress: () => void
  };


const styles = StyleSheet.create({
selected:{
    backgroundColor: "lightblue",
    width: 100,
    height: 100,
    borderColor: "darkGray",
    borderWidth: 3,
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
    margin: 2,
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
