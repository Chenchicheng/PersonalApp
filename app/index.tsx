import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ActionModal from '../src/components/ActionModal';
import RecipeItem from '../src/components/RecipeItem';
import SearchBar from '../src/components/SearchBar';

import { Recipe } from './types';

// 主页面组件
export default function RecipesPage() {
  // 状态声明
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  
  // 示例食谱数据
  const recipes: Recipe[] = [
    { id: 1, name: '清炒菜心', category: '素菜' },
    { id: 2, name: '清炒荷兰豆', category: '素菜' },
    { id: 3, name: '油焖茄子', category: '素菜' },
    { id: 4, name: '白灼西兰花', category: '素菜' },
  ];

  // 事件处理函数
  const handleAddRecipe = () => {
    setModalVisible(true);
  };
  
  const handleAddRecipeOption = () => {
    setModalVisible(false);
    router.push("/plan");
  };
  
  const handleAddPlanOption = () => {
    setModalVisible(false);
    // Navigate to plan page would go here
    console.log('Navigate to plan page');
  };

  const handleRecipePress = (recipe: Recipe) => {
    console.log(`Selected recipe: ${recipe.name}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 搜索栏 */}
      <SearchBar value={searchText} onChangeText={setSearchText} />

      {/* 食谱列表 */}
      <ScrollView style={styles.recipeList}>
        {recipes.map((recipe) => (
          <RecipeItem 
            key={recipe.id}
            recipe={recipe} 
            onPress={() => handleRecipePress(recipe)} 
          />
        ))}
      </ScrollView>

      {/* 添加按钮 */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddRecipe}>
        <MaterialIcons name="add" size={30} color="white" />
      </TouchableOpacity>
      
      {/* 操作选项模态框 */}
      <ActionModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAddRecipe={handleAddRecipeOption}
        onAddPlan={handleAddPlanOption}
      />
    </SafeAreaView>
  );
}

// 样式定义
const styles = StyleSheet.create({
  // 容器样式
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  
  // 食谱列表相关样式
  recipeList: {
    flex: 1,
    padding: 16,
  },
  
  // 添加按钮样式
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ff6b6b',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

