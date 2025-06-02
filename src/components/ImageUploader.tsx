import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

interface ImageUploaderProps {
  imageUri?: string | null;
  onImageSelected: (uri: string) => void;
  onImageDeleted?: () => void;
  aspectRatio?: [number, number];
  style?: any;
}

export default function ImageUploader({ 
  imageUri, 
  onImageSelected, 
  onImageDeleted,
  aspectRatio = [1, 1],
  style 
}: ImageUploaderProps) {
  const [showPreview, setShowPreview] = useState(false);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: aspectRatio,
        quality: 0.8,
      });

      if (!result.canceled) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error('选择图片时出错:', error);
    }
  };

  const handleDelete = () => {
    onImageDeleted?.();
  };

  return (
    <>
      <View style={[styles.container, style]}>
        {imageUri ? (
          <>
            <TouchableOpacity 
              style={styles.imageContainer}
              onPress={() => setShowPreview(true)}
            >
              <Image 
                source={{ uri: imageUri }} 
                style={styles.image} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <MaterialIcons name="delete" size={24} color="#ff3b30" />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity 
            style={styles.placeholder}
            onPress={pickImage}
          >
            <MaterialIcons name="add-a-photo" size={32} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={showPreview}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPreview(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowPreview(false)}>
          <View style={styles.previewContainer}>
            <Image 
              source={{ uri: imageUri }} 
              style={styles.previewImage}
              resizeMode="contain"
            />
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 2,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: screenWidth,
    height: screenHeight * 0.8,
  },
}); 