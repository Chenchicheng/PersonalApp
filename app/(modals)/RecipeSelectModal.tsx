import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Recipe {
  id: number;
  name: string;
  category: string;
  ingredients: string[];
}

interface Props {
  visible?: boolean;
  recipes: Recipe[];
  selected: number[];
  onSelect: (ids: number[]) => void;
  onDone: () => void;
  onClose: () => void;
}

export default function RecipeSelectModal({
  visible,
  recipes = [],
  selected = [],
  onSelect,
  onDone,
  onClose,
}: Props) {
  const [search, setSearch] = useState('');
  const filtered = recipes.filter((r: Recipe) => r.name.includes(search));

  const toggleSelect = (id: number) => {
    if (selected.includes(id)) {
      onSelect(selected.filter((i: number) => i !== id));
    } else {
      onSelect([...selected, id]);
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modalBox}>
        {/* 顶部栏 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="arrow-back" size={24} color="#ff7603" />
          </TouchableOpacity>
          <Text style={styles.title}>选择菜谱</Text>
          <TouchableOpacity onPress={onDone}>
            <Text style={styles.done}>完成</Text>
          </TouchableOpacity>
        </View>
        {/* 搜索框 */}
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={20} color="#bbb" />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索已有菜单"
            placeholderTextColor="#bbb"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        {/* 菜谱列表 */}
        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={true}
        >
          {filtered.map((recipe: Recipe) => (
            <TouchableOpacity key={recipe.id} style={styles.item} activeOpacity={0.7} onPress={() => toggleSelect(recipe.id)}>
              <MaterialIcons
                name={selected.includes(recipe.id) ? 'check-box' : 'check-box-outline-blank'}
                size={22}
                color={selected.includes(recipe.id) ? '#ff7603' : '#bbb'}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{recipe.name}</Text>
                <Text style={styles.itemSub}>{recipe.category}</Text>
              </View>
              <TouchableOpacity onPress={() => {}} activeOpacity={0.7}>
                <MaterialIcons name="edit" size={20} color="#ff7603" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    minHeight: '50%',
    maxHeight: '80%',
    flex: 1,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: { fontSize: 18, fontWeight: '600', color: '#333' },
  done: { fontSize: 16, color: '#ff7603', fontWeight: '600' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5',
    borderRadius: 16, paddingHorizontal: 12, marginBottom: 8,
  },
  searchInput: { flex: 1, height: 36, fontSize: 15, marginLeft: 6, color: '#333' },
  list: { marginTop: 8 },
  item: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  itemInfo: { flex: 1, marginLeft: 10 },
  itemName: { fontSize: 16, color: '#333', fontWeight: '500' },
  itemSub: { fontSize: 13, color: '#bbb', marginTop: 2 },
}); 