import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
  FlatList,
} from "react-native";

type EmojiPickerModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
};

const EMOJIS = [
  // Food & Drinks
  "🍔","🍕","🍟","🌭","🥪","🌮","🌯","🥙","🧆","🍝","🍜","🍲",
  "🍛","🍣","🍱","🥗","🍿","🍩","🍪","🎂","🍰","🧁","🍫",
  "🍎","🍌","🍓","🍇","🍉","🍍","🥑","🥦","🥕","🌽","🍄",
  "☕️","🫖","🥤","🧃","🍺","🍻","🍷","🥂","🍸","🍹",

  // Shopping & Money
  "🛒","🛍️","🧾","💳","💰","💵","💶","💷","💴","💸","🏦",
  "📈","📉","📊","🧮","💼","🪙","💹","🧾","🛍️",

  // Transport
  "🚗","🚕","🚙","🚌","🚎","🏎️","🚓","🚑","🚒","🚐",
  "🛵","🏍️","🚲","🛴","✈️","🛫","🛬","🚆","🚄","🚅",
  "🚇","🚉","🚊","🚤","⛴️","🛳️","🚢","⛽️",

  // Home & Utilities
  "🏠","🏡","🏘️","🏢","🏬","🏪","🏫","🏥",
  "🛋️","🪑","🛏️","🚿","🛁","🚽",
  "💡","🔌","🔋","🧯","🧹","🧼","🪣","🧺",
  "🛠️","🔧","🔨","🪛","🪜",

  // Health & Care
  "🏥","🩺","💊","🩹","🩼","🦷","👓","🧠",
  "🏃‍♂️","🏃‍♀️","🚶‍♂️","🚶‍♀️","🏋️","🤸","🧘",
  "❤️","💔","🫀","🫁","🧴","🧻",

  // Entertainment & Fun
  "🎬","🎥","📺","🎮","🕹️","🎲","🧩",
  "🎵","🎶","🎧","🎤","🎸","🎹","🥁",
  "🎨","🖌️","🖍️","📷","📸","🎭",
  "🎉","🎊","🎁","🎈",

  // Education & Work
  "🎓","📚","📖","📘","📕","📗","📙",
  "✏️","🖊️","🖋️","📝","📒","📓",
  "💼","🗂️","📁","📂","🗃️","🗄️",
  "🧑‍💻","👨‍💻","👩‍💻","🖥️","⌨️","🖱️",

  // Technology & Services
  "📱","📲","💻","🖥️","🖨️","📡","🌐",
  "🔒","🔑","🛜","📧","📨","📩","📞","☎️",

  // Travel & Places
  "🧳","🗺️","📍","🏖️","🏝️","🏜️","🏔️","⛰️",
  "🏕️","🏨","🏩","🏰","🗼","🗽","🎡","🎢",

  // Pets & Nature
  "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼",
  "🐨","🐯","🦁","🐮","🐷","🐸","🐵",
  "🌿","🌱","🌳","🌲","🌴","🌸","🌼","🌻",

  // Personal & Misc
  "📌","⭐️","🌟","✨","🔥","💬","🗒️","📅","⏰","⌛️",
  "👕","👖","👟","👞","🧥","👜","🎒",
  "🙏","👍","👎","👌","🤝","👤","👥",
];


export default function EmojiPickerModal({
  visible,
  onClose,
  onSelect,
}: EmojiPickerModalProps) {
  const data = useMemo(
    () => EMOJIS.map((e) => ({ key: e, emoji: e })),
    []
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose an icon</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>Close</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={data}
            numColumns={8}
            keyExtractor={(item) => item.key}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.cell}
                onPress={() => {
                  onSelect(item.emoji);
                  onClose();
                }}
              >
                <Text style={styles.emoji}>{item.emoji}</Text>
              </TouchableOpacity>
            )}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 12,
    maxHeight: "60%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: { fontSize: 16, fontWeight: "600" },
  close: { fontSize: 16, color: "#3077ceff" },

  grid: { paddingVertical: 8 },
  cell: {
    width: 43,
    height: 43,
    alignItems: "center",
    justifyContent: "center",
    margin: 2,
  },
  emoji: { fontSize: 28 },
});
