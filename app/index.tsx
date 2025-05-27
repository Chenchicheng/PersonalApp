import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 食谱项类型定义
type Recipe = {
  id: number;
  name: string;
  category: string;
};

// 操作选项组件
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

// 搜索栏组件
type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
};

const SearchBar = ({ value, onChangeText }: SearchBarProps) => (
  <View style={styles.searchContainer}>
    <MaterialIcons name="search" size={24} color="#666" />
    <TextInput
      style={styles.searchInput}
      placeholder="输入食谱，食材搜索"
      value={value}
      onChangeText={onChangeText}
    />
  </View>
);

// 食谱项组件
type RecipeItemProps = {
  recipe: Recipe;
  onPress: () => void;
};

const RecipeItem = ({ recipe, onPress }: RecipeItemProps) => (
  <TouchableOpacity key={recipe.id} style={styles.recipeItem} onPress={onPress}>
    <View style={styles.recipeImagePlaceholder}>
      <MaterialIcons name="restaurant" size={40} color="#666" />
    </View>
    <View style={styles.recipeInfo}>
      <Text style={styles.recipeName}>{recipe.name}</Text>
      <Text style={styles.recipeCategory}>{recipe.category}</Text>
    </View>
  </TouchableOpacity>
);

// 操作模态框组件
type ActionModalProps = {
  visible: boolean;
  onClose: () => void;
  onAddRecipe: () => void;
  onAddPlan: () => void;
};

const ActionModal = ({ visible, onClose, onAddRecipe, onAddPlan }: ActionModalProps) => {
  // 动画值
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // 屏幕高度
  const screenHeight = Dimensions.get('window').height;

  // 处理动画效果
  useEffect(() => {
    if (visible) {
      // 重置动画值以确保一致性
      slideAnim.setValue(0);
      fadeAnim.setValue(0);
      
      // 同时执行淡入和滑入动画
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 20,
          stiffness: 90,
          mass: 1,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // 同时执行淡出和滑出动画
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalWrapper}>
        {/* 背景遮罩 - 点击时关闭模态框 */}
        <Animated.View 
          style={[styles.modalOverlay, { opacity: fadeAnim }]}
        />
        
        <TouchableOpacity
          style={styles.dismissArea}
          activeOpacity={1}
          onPress={onClose}
        />
        
        {/* 模态框内容 - 从底部滑入 */}
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>选择操作</Text>
          
          <ActionOption 
            icon="restaurant" 
            title="添加食谱" 
            color="#ff6b6b" 
            onPress={onAddRecipe} 
          />
          
          <ActionOption 
            icon="event-note" 
            title="添加计划" 
            color="#4ecdc4" 
            onPress={onAddPlan} 
          />
        </Animated.View>
      </View>
    </Modal>
  );
};

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
    router.push('/add-recipe');
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
      <SearchBar 
        value={searchText} 
        onChangeText={setSearchText} 
      />

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
  
  // 搜索相关样式
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 26,
    marginBottom: 16,
    padding: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 2,
    marginLeft: 18,
    fontSize: 16,
  },
  
  // 食谱列表相关样式
  recipeList: {
    flex: 1,
    padding: 16,
  },
  recipeItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recipeImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeInfo: {
    flex: 1,
    padding: 12,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recipeCategory: {
    fontSize: 14,
    color: '#666',
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
  
  // 模态框相关样式
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingTop: 16,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
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
    backgroundColor: '#ff6b6b',
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

