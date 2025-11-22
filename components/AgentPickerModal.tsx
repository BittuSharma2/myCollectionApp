import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/theme';

type Agent = {
  id: string;
  username: string;
};

type SpecialOption = {
  id: string | null;
  name: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (selection: SpecialOption) => void;
  title: string;
  agents: Agent[];
  currentSelectionId: string | null;
  showAllOption?: boolean;
  showNoneOption?: boolean;
};

export default function AgentPickerModal({
  visible,
  onClose,
  onSelect,
  title,
  agents,
  currentSelectionId,
  showAllOption = false,
  showNoneOption = false,
}: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const options: SpecialOption[] = [
    // --- (THE FIX) ---
    // Change the text from "All Agents" to "All Customers"
    ...(showAllOption ? [{ id: 'all', name: 'All Customers' }] : []),
    // --- (END FIX) ---
    // ...(showNoneOption ? [{ id: null, name: 'None (Unassigned)' }] : []),
    ...agents.map((agent) => ({ id: agent.id, name: agent.username })),
  ];

  const renderItem = ({ item }: { item: SpecialOption }) => {
    const isSelected = item.id === currentSelectionId;
    return (
      <Pressable
        style={[
          styles.optionButton,
          { borderBottomColor: themeColors.borderColor },
        ]}
        onPress={() => {
          onSelect(item);
          onClose();
        }}>
        <Text style={[styles.optionText, { color: themeColors.text }]}>
          {item.name}
        </Text>
        {isSelected && (
          <Ionicons name="checkmark" size={24} color={themeColors.tint} />
        )}
      </Pressable>
    );
  };

  const styles = StyleSheet.create({
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: themeColors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 16,
      maxHeight: '60%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.borderColor,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: themeColors.text,
    },
    optionButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 18,
      borderBottomWidth: 1,
    },
    optionText: {
      fontSize: 16,
    },
  });

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <View style={styles.modalContainer}>
          <SafeAreaView edges={['bottom']}>
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <Pressable onPress={onClose}>
                <Ionicons
                  name="close-circle"
                  size={26}
                  color={themeColors.textSecondary}
                />
              </Pressable>
            </View>
            <FlatList
              data={options}
              renderItem={renderItem}
              keyExtractor={(item) => String(item.id)}
            />
          </SafeAreaView>
        </View>
      </Pressable>
    </Modal>
  );
}