import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Recipe } from '../../app/types';

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

const styles = StyleSheet.create({
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
});

export default RecipeItem; 