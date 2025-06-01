import { MaterialIcons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Animated, Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Recipe } from './types';


type RecipeItemProps = {
  recipe: Recipe;
  onPress: () => void;
  onEdit?: (recipe: Recipe) => void;
  onDelete?: (recipe: Recipe) => void;
};

const RecipeItem = ({ recipe, onPress, onEdit, onDelete }: RecipeItemProps) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;
  const moreButtonRef = useRef<View>(null);

  const showMenu = () => {
    setMenuVisible(true);
    
    if (moreButtonRef.current) {
      moreButtonRef.current.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        const screenWidth = Dimensions.get('window').width;
        const menuWidth = screenWidth * 0.5;
        
        let menuX = pageX - 120 + 30;
        let menuY = pageY + height;
        
        if (menuX < 10) menuX = 10;
        if (menuX + menuWidth > screenWidth - 10) menuX = screenWidth - menuWidth - 10;
        
        setMenuPosition({ x: menuX, y: menuY });
        
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  };

  const hideMenu = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 10,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setMenuVisible(false);
    });
  };

  const handleEdit = () => {
    hideMenu();
    if (onEdit) onEdit(recipe);
  };

  const handleDelete = () => {
    hideMenu();
    if (onDelete) onDelete(recipe);
  };

  return (
    <View style={styles.recipeItemContainer}>
      <TouchableOpacity key={recipe.id} style={styles.recipeItem} onPress={onPress}>
        <View style={styles.recipeImagePlaceholder}>
          <MaterialIcons name="restaurant" size={40} color="#666" />
        </View>
        <View style={styles.recipeInfo}>
          <Text style={styles.recipeName}>{recipe.name}</Text>
          <Text style={styles.recipeCategory}>{recipe.category}</Text>
          
          <TouchableOpacity 
            ref={moreButtonRef}
            style={[
              styles.moreButton,
              menuVisible && styles.moreButtonActive
            ]} 
            onPress={showMenu}
          >
            <MaterialIcons 
              name="more-horiz" 
              size={24} 
              color={menuVisible ? "#333" : "#666"} 
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {menuVisible && (
        <Modal
          transparent={true}
          visible={menuVisible}
          animationType="none"
          onRequestClose={hideMenu}
        >
          <TouchableOpacity 
            style={styles.menuOverlay} 
            activeOpacity={1}
            onPress={hideMenu}
          >
            <Animated.View 
              style={[
                styles.menuContainer, 
                { 
                  position: 'absolute',
                  left: menuPosition.x,
                  top: menuPosition.y,
                  opacity: fadeAnim,
                  width: Dimensions.get('window').width * 0.5, 
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
                <MaterialIcons name="edit" size={20} color="#333" />
                <Text style={styles.menuItemText}>编辑</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
                <MaterialIcons name="delete" size={20} color="#ff3b30" />
                <Text style={[styles.menuItemText, { color: '#ff3b30' }]}>删除</Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};



const styles = StyleSheet.create({
  recipeItemContainer: {
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
  recipeItem: {
    flex: 1,
    flexDirection: 'row',
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
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginLeft: 10,  
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
  moreButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    padding: 8,
    borderRadius: 8,
  },
  moreButtonActive: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  menuContainer: {
    borderWidth: 1,       // 👈 加这个
    borderColor: '#f0f0f0',   // 👈 临时调试用
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
});

export default RecipeItem;