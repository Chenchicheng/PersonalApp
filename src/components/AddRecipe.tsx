import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddRecipePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [steps, setSteps] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const categories = ['荤菜', '素菜', '汤类', '主食'];

  const handleSave = () => {
    // 后续实现保存逻辑
    console.log('Save recipe:', { name, category, ingredients, steps });
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelButton}>取消</Text>
        </TouchableOpacity>
        <Text style={styles.title}>添加食谱</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>完成</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form}>
        {/* 添加图片按钮 */}
        <TouchableOpacity style={styles.addImageButton}>
          <MaterialIcons name="add-a-photo" size={32} color="#666" />
          <Text style={styles.addImageText}>添加图片</Text>
        </TouchableOpacity>

        {/* 表单字段 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>名称</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="请输入食谱名称"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>分类</Text>
          <TouchableOpacity
            style={styles.categorySelector}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={styles.categoryText}>
              {category || '请选择分类'}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>食材</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={ingredients}
            onChangeText={setIngredients}
            placeholder="请输入食材清单"
            multiline
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>做法</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={steps}
            onChangeText={setSteps}
            placeholder="请输入制作步骤"
            multiline
          />
        </View>
      </ScrollView>

      {/* 分类选择弹窗 */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>选择分类</Text>
            {categories.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.categoryOption}
                onPress={() => {
                  setCategory(item);
                  setShowCategoryModal(false);
                }}
              >
                <Text style={styles.categoryOptionText}>{item}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelOption}
              onPress={() => setShowCategoryModal(false)}
            >
              <Text style={styles.cancelOptionText}>取消</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    fontSize: 16,
    color: '#ff6b6b',
  },
  form: {
    flex: 1,
    padding: 16,
  },
  addImageButton: {
    height: 200,
    backgroundColor: 'white',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  addImageText: {
    marginTop: 8,
    color: '#666',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  multilineInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  categorySelector: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  categoryOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryOptionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  cancelOption: {
    padding: 16,
    marginTop: 8,
  },
  cancelOptionText: {
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
  },
}); 