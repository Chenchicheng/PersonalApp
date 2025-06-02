import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageUploader from '../../src/components/ImageUploader';

interface Ingredient {
  id: string;
  name: string;
  amount: string;
}

interface Step {
  id: string;
  description: string;
  image?: string;
}

export default function AddRecipePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [mainImage, setMainImage] = useState<string | null>(null);

  // 所有标签
  const [tags, setTags] = useState<string[]>([
    '家常菜', '快手菜', '下饭菜', '养生菜', '川菜', '粤菜', '湘菜', '东北菜', '西餐', '日料', '韩餐'
  ]);

  const handleSave = () => {
    
    console.log('Save recipe:', { name, tags: selectedTags, ingredients, steps });
    router.back();
  };

  const handleSelectTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddTag = () => {
    if (!newTagName.trim()) {
      Alert.alert('提示', '标签名称不能为空');
      return;
    }
    if (tags.includes(newTagName)) {
      Alert.alert('提示', '该标签已存在');
      return;
    }
    setTags([...tags, newTagName.trim()]);
    setNewTagName('');
    setIsAddingTag(false);
  };

  const handleDeleteTag = (tag: string) => {
    Alert.alert(
      '删除标签',
      `确定要删除标签"${tag}"吗？`,
      [
        {
          text: '取消',
          style: 'cancel'
        },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            setTags(tags.filter(t => t !== tag));
            setSelectedTags(selectedTags.filter(t => t !== tag));
          }
        }
      ]
    );
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { id: Date.now().toString(), name: '', amount: '' }]);
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients(ingredients.filter(item => item.id !== id));
  };

  const handleUpdateIngredient = (id: string, field: 'name' | 'amount', value: string) => {
    setIngredients(ingredients.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleAddStep = () => {
    setSteps([...steps, { id: Date.now().toString(), description: '' }]);
  };

  const handleRemoveStep = (id: string) => {
    setSteps(steps.filter(step => step.id !== id));
  };

  const handleUpdateStep = (id: string, field: 'description' | 'image', value: string) => {
    setSteps(steps.map(step => 
      step.id === id ? { ...step, [field]: value } : step
    ));
  };

  const pickImage = async (type: 'main' | 'step', stepId?: string) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'main' ? [1, 1] : [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        if (type === 'main') {
          setMainImage(result.assets[0].uri);
        } else if (stepId) {
          setSteps(steps.map(step => 
            step.id === stepId ? { ...step, image: result.assets[0].uri } : step
          ));
        }
      }
    } catch (error) {
      Alert.alert('错误', '选择图片时出错');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelButton}>取消</Text>
        </TouchableOpacity>
        <Text style={styles.title}>添加食谱</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>保存</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAwareScrollView
        style={styles.form}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={Platform.OS === 'ios' ? 100 : 0}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 添加图片和标题区域 */}
        <View style={styles.imageTitleContainer}>
          <ImageUploader
            imageUri={mainImage}
            onImageSelected={setMainImage}
            onImageDeleted={() => setMainImage(null)}
            style={styles.addImageButton}
          />
          <View style={styles.titleInputContainer}>
            <TextInput
              style={styles.titleInput}
              value={name}
              onChangeText={setName}
              placeholder="添加食谱标题"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* 表单字段 */}
        <View style={styles.inputGroup}>
          <View style={styles.selectedTagsContainer}>
            <TouchableOpacity
              style={styles.addTagButton}
              onPress={() => setShowTagModal(true)}
            >
              <MaterialIcons name="add" size={20} color="#ff7603" />
              <Text style={styles.addTagText}>标签</Text>
            </TouchableOpacity>
            {selectedTags.slice(0, 10).map((tag) => (
              <View key={tag} style={styles.selectedTag}>
                <Text style={styles.selectedTagText}>{tag}</Text>
                <TouchableOpacity
                  onPress={() => handleSelectTag(tag)}
                  style={styles.removeTagButton}
                >
                  <MaterialIcons name="close" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            ))}
            {selectedTags.length > 10 && (
              <Text style={styles.moreTagsText}>+{selectedTags.length - 10}</Text>
            )}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputTitle}>食材</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddIngredient}
            >
              <MaterialIcons name="add" size={20} color="#ff7603" />
              <Text style={styles.addButtonText}>添加</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.ingredientsList}>
            {ingredients.map((item) => (
              <View key={item.id} style={styles.ingredientItem}>
                <View style={styles.ingredientInputs}>
                  <TextInput
                    style={[
                      styles.ingredientInput,
                      styles.ingredientNameInput,
                      item.name && styles.ingredientInputBold
                    ]}
                    value={item.name}
                    onChangeText={(value) => handleUpdateIngredient(item.id, 'name', value)}
                    placeholder="名称"
                  />
                  <TextInput
                    style={[
                      styles.ingredientInput,
                      styles.ingredientAmountInput,
                      item.amount && styles.ingredientInputBold
                    ]}
                    value={item.amount}
                    onChangeText={(value) => handleUpdateIngredient(item.id, 'amount', value)}
                    placeholder="用量（可选）"
                  />
                </View>
                <TouchableOpacity
                  style={styles.removeIngredientButton}
                  onPress={() => handleRemoveIngredient(item.id)}
                >
                  <MaterialIcons name="remove-circle" size={24} color="#ff7603" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputTitle}>做法</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddStep}
            >
              <MaterialIcons name="add" size={20} color="#ff7603" />
              <Text style={styles.addButtonText}>添加</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.stepsList}>
            {steps.map((step, index) => (
              <View key={step.id} style={styles.stepItem}>
                <View style={styles.stepHeader}>
                  <Text style={styles.stepNumber}>步骤 {index + 1}</Text>
                  <TouchableOpacity
                    style={styles.removeStepButton}
                    onPress={() => handleRemoveStep(step.id)}
                  >
                    <MaterialIcons name="remove-circle" size={24} color="#ff7603" />
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={[
                    styles.stepInput,
                    step.description && styles.ingredientInputBold
                  ]}
                  value={step.description}
                  onChangeText={(value) => handleUpdateStep(step.id, 'description', value)}
                  placeholder="描述步骤"
                  multiline
                />
                <View style={styles.stepImageContainer}>
                  <ImageUploader
                    imageUri={step.image}
                    onImageSelected={(uri) => handleUpdateStep(step.id, 'image', uri)}
                    onImageDeleted={() => handleUpdateStep(step.id, 'image', '')}
                    aspectRatio={[4, 3]}
                    style={styles.stepImageButton}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      </KeyboardAwareScrollView>

      {/* 标签选择底部弹窗 */}
      <Modal
        visible={showTagModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTagModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowTagModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}></Text>
                  <TouchableOpacity onPress={() => setShowTagModal(false)}>
                    <Text style={styles.modalCloseButton}>完成</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.tagSection}>
                  <View style={styles.tagsGrid}>
                    {tags.map((tag) => (
                      <View key={tag} style={styles.tagContainer}>
                        <TouchableOpacity
                          style={[
                            styles.tagOption,
                            selectedTags.includes(tag) && styles.selectedTagOption,
                          ]}
                          onPress={() => handleSelectTag(tag)}
                        >
                          <Text
                            style={[
                              styles.tagOptionText,
                              selectedTags.includes(tag) && styles.selectedTagOptionText,
                            ]}
                          >
                            {tag}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteTagButton}
                          onPress={() => handleDeleteTag(tag)}
                        >
                          <MaterialIcons name="close" size={16} color="#666" />
                        </TouchableOpacity>
                      </View>
                    ))}
                    {isAddingTag ? (
                      <View style={styles.addTagInputContainer}>
                        <TextInput
                          style={styles.addTagInput}
                          value={newTagName}
                          onChangeText={setNewTagName}
                          placeholder="输入标签名称"
                          maxLength={10}
                          autoFocus
                          onSubmitEditing={handleAddTag}
                          onBlur={() => {
                            if (!newTagName.trim()) {
                              setIsAddingTag(false);
                            }
                          }}
                        />
                        <TouchableOpacity
                          style={styles.confirmAddTagButton}
                          onPress={handleAddTag}
                        >
                          <MaterialIcons name="check" size={20} color="#ff7603" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.addNewTagButton}
                        onPress={() => setIsAddingTag(true)}
                      >
                        <MaterialIcons name="add" size={20} color="#ff7603" />
                        <Text style={styles.addTagText}>添加</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'transparent',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666',
    padding: 8,
  },
  saveButton: {
    fontSize: 16,
    color: '#ff7603',
    padding: 8,
  },
  title: {
    fontSize: 17,
    color: '#333',
    fontWeight: '500',
  },
  form: {
    flex: 1,
    padding: 16,
  },
  imageTitleContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  addImageButton: {
    aspectRatio: 1,
    width: '50%',
    backgroundColor: 'white',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleInputContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleInput: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  multilineInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addTagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ff7603',
    marginRight: 8,
  },
  addTagText: {
    fontSize: 14,
    color: '#ff7603',
    marginLeft: 4,
  },
  selectedTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    //backgroundColor: 'white',
    padding: 0,
    borderRadius: 8,
    minHeight: 40,
    alignItems: 'center',
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  selectedTagText: {
    fontSize: 14,
    color: '#333',
    marginRight: 4,
  },
  removeTagButton: {
    padding: 2,
  },
  moreTagsText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '90%',
    minHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  modalCloseButton: {
    fontSize: 16,
    color: '#ff7603',
  },
  tagSection: {
    marginBottom: 20,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedTagOption: {
    backgroundColor: '#ff7603',
    borderColor: '#ff7603',
  },
  tagOptionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedTagOptionText: {
    color: 'white',
  },
  deleteTagButton: {
    padding: 4,
    marginLeft: 4,
  },
  addNewTagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ff7603',
  },
  addTagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ff7603',
    paddingHorizontal: 12,
  },
  confirmAddTagButton: {
    padding: 4,
  },
  addTagInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  addTagModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTagModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
  },
  addTagModalTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  addTagModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addTagModalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  modalCancelButton: {
    backgroundColor: '#f5f5f5',
  },
  confirmButton: {
    backgroundColor: '#ff7603',
  },
  cancelButtonText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
  },
  confirmButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputTitle: {
    fontSize: 16,
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ff7603',
  },
  addButtonText: {
    fontSize: 14,
    color: '#ff7603',
    marginLeft: 4,
  },
  ingredientsList: {
    backgroundColor: 'white',
    borderRadius: 8,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    //marginBottom: 12,
    padding: 5,
  },
  ingredientInputs: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  ingredientInput: {
    flex: 1,
    height: 40,
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  ingredientInputBold: {
    fontWeight: '600',
  },
  ingredientNameInput: {
    flex: 1,
  },
  ingredientAmountInput: {
    flex: 1,
  },
  removeIngredientButton: {
    padding: 4
  },
  stepsList: {
    backgroundColor: 'white',
    borderRadius: 8,
  },
  stepItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  removeStepButton: {
    padding: 4,
  },
  stepInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  stepImageContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  stepImageButton: {
    height: 120,
    width: '60%',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'dashed',
  },
  stepImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  stepImageText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  scrollContent: {
    paddingBottom: 100, // 添加底部padding，确保内容不会被键盘遮挡
  },
}); 