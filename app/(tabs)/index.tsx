import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ActionModal from '../../src/components/ActionModal';

import RecipeItem from '../../src/components/RecipeItem';
import SearchBar from '../../src/components/SearchBar';

import { Recipe } from '../../src/components/types';

// 主页面组件
export default function RecipesPage() {
  // 状态声明
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  
  // 示例食谱数据
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  // 事件处理函数
  const handleAddRecipe = () => {
    setModalVisible(true);
  };
  
  const handleAddRecipeOption = () => {
    setModalVisible(false);
    // ✅ 延迟导航，等待动画关闭
    setTimeout(() => {
      router.push('/(modals)/AddRecipe');
    }, 250); // 动画持续 200ms，延迟 250ms 保险
  };
  
  const handleAddPlanOption = () => {
    setModalVisible(false);
    // Navigate to plan page would go here
    console.log('Navigate to plan page');
    router.push("/plan");
  };

  const handleRecipePress = (recipe: Recipe) => {
    console.log(`Selected recipe: ${recipe.name}`);
  };

  // 处理编辑菜谱
  const handleEditRecipe = (recipe: Recipe) => {
    console.log(`Edit recipe: ${recipe.name}`);
    // 这里可以导航到编辑页面，并传递菜谱数据
    // 示例：router.push({ pathname: '/(modals)/EditRecipe', params: { id: recipe.id } });
  };

  // 处理删除菜谱
  const handleDeleteRecipe = (recipe: Recipe) => {
    Alert.alert(
      "删除菜谱",
      `确定要删除"${recipe.name}"吗？`,
      [
        {
          text: "取消",
          style: "cancel"
        },
        { 
          text: "删除", 
          onPress: () => {
            // 从列表中移除菜谱
            setRecipes(recipes.filter(item => item.id !== recipe.id));
            console.log(`Deleted recipe: ${recipe.name}`);
          },
          style: "destructive"
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 搜索栏 - 只在有菜谱时显示 */}
      {recipes.length > 0 && (
        <SearchBar value={searchText} onChangeText={setSearchText} />
      )}

      {/* 食谱列表 */}
      <ScrollView 
        style={styles.recipeList}
        contentContainerStyle={recipes.length === 0 ? styles.emptyScrollContent : undefined}
      >
        {recipes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>开始记录属于你的私人菜谱吧~</Text>
          </View>
        ) : (
          recipes.map((recipe) => (
            <RecipeItem 
              key={recipe.id}
              recipe={recipe} 
              onPress={() => handleRecipePress(recipe)}
              onEdit={handleEditRecipe}
              onDelete={handleDeleteRecipe}
            />
          ))
        )}
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
  },
  
  // 空状态时的ScrollView内容样式
  emptyScrollContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  
  // 空状态容器样式
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // 空状态文字样式
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  
  // 添加按钮样式
  addButton: {
    position: 'absolute',
    right: 55,
    bottom: 25,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ff7603',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

