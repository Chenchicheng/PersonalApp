import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import ActionOption from './ActionOption';

type ActionModalProps = {
  visible: boolean;         // 父组件传入的可见状态
  onClose: () => void;      // 关闭回调
  onAddRecipe: () => void;  // 添加食谱回调
  onAddPlan: () => void;    // 添加计划回调
};

const ActionModal = ({ visible, onClose, onAddRecipe, onAddPlan }: ActionModalProps) => {
  // 控制 Modal 的内部可见性（确保动画期间不会提前卸载）
  const [modalVisible, setModalVisible] = useState(false);

  // 动画值
  const slideAnim = useRef(new Animated.Value(0)).current; // 控制底部弹出滑动动画
  const fadeAnim = useRef(new Animated.Value(0)).current;  // 控制背景渐隐渐显动画
  const panY = useRef(new Animated.Value(0)).current;      // 控制下拉手势动画

  // 手势识别器
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        // 只处理向下的拖动
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // 拖动距离超过 50，触发关闭
        if (gestureState.dy > 50) {
          closeWithAnimation();
        } else {
          // 否则回弹
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 5,
          }).start();
        }
      },
    })
  ).current;

  // 关闭动画函数（滑出 + 渐隐）
  const closeWithAnimation = () => {
    Animated.parallel([
      Animated.timing(panY, {
        toValue: 300, // 向下滑动
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0, // 背景渐隐
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      panY.setValue(0); // 重置手势动画
      setModalVisible(false); // 真正隐藏 Modal
      onClose(); // 通知父组件
    });
  };

  // 监听 visible 属性的变化
  useEffect(() => {
    if (visible) {
      // 打开时显示 Modal 并启动动画
      setModalVisible(true);
      slideAnim.setValue(0);
      fadeAnim.setValue(0);
      panY.setValue(0);

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // 如果关闭请求且当前是打开状态，执行关闭动画
      if (modalVisible) {
        closeWithAnimation();
      }
    }
  }, [visible]);

  // 组合动画位移：下拉 + 初始滑入
  const translateY = Animated.add(
    panY,
    slideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [300, 0],
    })
  );

  return (
    <Modal
      transparent={true}
      visible={visible || modalVisible} // 始终保持 Modal 挂载直到关闭动画完成
      animationType="none"
      onRequestClose={closeWithAnimation}
    >
      <View style={styles.modalWrapper}>
        {/* 背景遮罩层 */}
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]} />

        {/* 点击空白区域关闭模态框 */}
        <TouchableOpacity
          style={styles.dismissArea}
          activeOpacity={1}
          onPress={closeWithAnimation}
        />

        {/* 模态框主内容，带拖动手势 */}
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY }],
              opacity: fadeAnim,
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* 下拉手柄 */}
          <View style={styles.modalHandle} />

          {/* 操作项 */}
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

const styles = StyleSheet.create({
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
});

export default ActionModal;
