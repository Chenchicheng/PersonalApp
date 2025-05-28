import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ActionOptionProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  color: string;
  onPress: () => void;
};

const ActionOption = ({ icon, title, color, onPress }: ActionOptionProps) => (
  <TouchableOpacity style={styles.modalOption} onPress={onPress}>
    <View style={[styles.iconContainer, { backgroundColor: color }]}>
      <MaterialIcons name={icon} size={24} color="white" />
    </View>
    <Text style={styles.modalOptionText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    marginVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ff7603',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalOptionText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
});

export default ActionOption; 