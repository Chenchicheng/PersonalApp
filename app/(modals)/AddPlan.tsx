import { MaterialIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RecipeItem from '../../src/components/RecipeItem';

interface Recipe {
  id: number;
  name: string;
  category: string;
  ingredients: string[];
}

interface MealPlan {
  id: string;
  recipes: Recipe[];
}

export default function AddPlanPage() {
  const router = useRouter();
  
  // 获取当前周数
  const getCurrentWeekNumber = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + start.getDay() + 1) / 7);
  };

  // 获取指定日期的周数
  const getWeekNumber = (date: Date) => {
    const start = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + start.getDay() + 1) / 7);
  };

  // 获取当前是周几（0-6，0是周日）
  const getCurrentWeekday = () => {
    const now = new Date();
    return now.getDay() || 7; // 将周日的0转换为7
  };

  const [selectedWeek, setSelectedWeek] = useState<number>(0); // 0 表示本周
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // 设置默认日期为今天
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [showWeekModal, setShowWeekModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | null>(null);
  const [selectedRecipes, setSelectedRecipes] = useState<Recipe[]>([]);
  const [showTagModal, setShowTagModal] = useState(false);
  
  // 三餐计划
  const [mealPlans, setMealPlans] = useState<{
    breakfast: MealPlan;
    lunch: MealPlan;
    dinner: MealPlan;
  }>({
    breakfast: { id: 'breakfast', recipes: [] },
    lunch: { id: 'lunch', recipes: [] },
    dinner: { id: 'dinner', recipes: [] }
  });

  // 示例食谱数据
  const [availableRecipes] = useState<Recipe[]>([
    { id: 1, name: '红烧肉', category: '家常菜', ingredients: ['五花肉', '生抽', '老抽', '冰糖', '葱', '姜'] },
    { id: 2, name: '清炒时蔬', category: '素菜', ingredients: ['青菜', '蒜', '盐', '油'] },
    { id: 3, name: '番茄炒蛋', category: '快手菜', ingredients: ['番茄', '鸡蛋', '盐', '油'] }
  ]);

  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const weekTitleOpacity = useRef(new Animated.Value(1)).current;
  const weekTitleScale = useRef(new Animated.Value(1)).current;

  // 计算当前周的范围
  const getWeekRange = (offset: number) => {
    const now = new Date();
    const start = new Date(now);
    const day = now.getDay() || 7;
    start.setDate(now.getDate() - day + 1 + (offset * 7));
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start, end };
  };

  // 检查是否在边界
  const isAtBoundary = (offset: number) => {
    return offset <= -3 || offset >= 3;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        translateX.setOffset(0);
        translateX.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        translateX.flattenOffset();
        const { dx, vx } = gestureState;
        const screenWidth = Dimensions.get('window').width;
        
        // 计算目标位置
        let targetOffset = currentWeekOffset;
        let targetPosition = 0;
        
        // 根据滑动距离和速度决定是否切换周
        if (Math.abs(dx) > screenWidth * 0.3 || Math.abs(vx) > 0.5) {
          const direction = dx > 0 ? -1 : 1;
          targetOffset = currentWeekOffset + direction;
          
          // 检查边界
          if (!isAtBoundary(targetOffset)) {
            targetPosition = direction * screenWidth;
          }
        }
        
        // 使用 decay 实现惯性滑动
        Animated.decay(translateX, {
          velocity: vx,
          deceleration: 0.98,
          useNativeDriver: true
        }).start(() => {
          // 如果不在边界，执行切换动画
          if (targetPosition !== 0) {
            Animated.parallel([
              Animated.spring(translateX, {
                toValue: targetPosition,
                useNativeDriver: true,
                tension: 50,
                friction: 7
              }),
              Animated.sequence([
                Animated.timing(weekTitleOpacity, {
                  toValue: 0.5,
                  duration: 150,
                  useNativeDriver: true
                }),
                Animated.timing(weekTitleOpacity, {
                  toValue: 1,
                  duration: 150,
                  useNativeDriver: true
                })
              ]),
              Animated.sequence([
                Animated.timing(weekTitleScale, {
                  toValue: 0.95,
                  duration: 150,
                  useNativeDriver: true
                }),
                Animated.timing(weekTitleScale, {
                  toValue: 1,
                  duration: 150,
                  useNativeDriver: true
                })
              ])
            ]).start(() => {
              translateX.setValue(0);
              setCurrentWeekOffset(targetOffset);
            });
          } else {
            // 回弹动画
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
              tension: 50,
              friction: 7
            }).start();
          }
        });
      }
    })
  ).current;

  // 获取周日期范围
  const getWeekDateRange = (weekOffset: number) => {
    const now = new Date();
    const start = new Date(now);
    // 调整到本周一
    const day = now.getDay() || 7;
    start.setDate(now.getDate() - day + 1);
    // 根据偏移量调整周
    start.setDate(start.getDate() + (weekOffset * 7));
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  };

  // 生成未来4周的选项
  const weekOptions = Array.from({ length: 7 }, (_, i) => {
    const weekOffset = i - 3; // -3 到 3，共7周
    const { start, end } = getWeekDateRange(weekOffset);
    const startDate = new Date(start);
    const endDate = new Date(end);
    const year = startDate.getFullYear();
    const weekNumber = getWeekNumber(startDate);
    return {
      label: `${year}年第${weekNumber}周`,
      value: weekOffset,
      dateRange: `${startDate.getMonth() + 1}/${startDate.getDate()}~${endDate.getMonth() + 1}/${endDate.getDate()}`
    };
  });

  // 获取当前显示的周选项
  const currentWeekOption = weekOptions.find(week => week.value === currentWeekOffset) || weekOptions[3];

  // 生成选中周的日期选项
  const getDateOptions = () => {
    const { start } = getWeekDateRange(currentWeekOffset);
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      return {
        date: date.toISOString().split('T')[0],
        weekday: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i],
        day: date.getDate(),
        month: date.getMonth() + 1
      };
    });
  };

  const handleSave = () => {
    console.log('Save plan:', { selectedWeek, selectedDate, mealPlans });
    router.back();
  };

  const weekFadeAnim = useRef(new Animated.Value(0)).current;
  const weekSlideAnim = useRef(new Animated.Value(100)).current;
  const dateFadeAnim = useRef(new Animated.Value(0)).current;
  const dateSlideAnim = useRef(new Animated.Value(100)).current;
  const weekAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const dateAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  const animateWeekModal = useCallback((show: boolean) => {
    if (weekAnimationRef.current) {
      weekAnimationRef.current.stop();
    }

    const fadeConfig = {
      toValue: show ? 1 : 0,
      duration: 200,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      useNativeDriver: true,
    };

    const slideConfig = {
      toValue: show ? 0 : 100,
      duration: 200,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      useNativeDriver: true,
    };

    weekAnimationRef.current = Animated.parallel([
      Animated.timing(weekFadeAnim, fadeConfig),
      Animated.timing(weekSlideAnim, slideConfig)
    ]);

    weekAnimationRef.current.start();
  }, [weekFadeAnim, weekSlideAnim]);

  const animateDateModal = useCallback((show: boolean) => {
    if (dateAnimationRef.current) {
      dateAnimationRef.current.stop();
    }

    const fadeConfig = {
      toValue: show ? 1 : 0,
      duration: 200,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      useNativeDriver: true,
    };

    const slideConfig = {
      toValue: show ? 0 : 100,
      duration: 200,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      useNativeDriver: true,
    };

    dateAnimationRef.current = Animated.parallel([
      Animated.timing(dateFadeAnim, fadeConfig),
      Animated.timing(dateSlideAnim, slideConfig)
    ]);

    dateAnimationRef.current.start();
  }, [dateFadeAnim, dateSlideAnim]);

  useEffect(() => {
    animateWeekModal(showWeekModal);
    return () => {
      if (weekAnimationRef.current) {
        weekAnimationRef.current.stop();
      }
    };
  }, [showWeekModal, animateWeekModal]);

  useEffect(() => {
    animateDateModal(showDateModal);
    return () => {
      if (dateAnimationRef.current) {
        dateAnimationRef.current.stop();
      }
    };
  }, [showDateModal, animateDateModal]);

  const handleCloseWeekModal = useCallback(() => {
    animateWeekModal(false);
    setTimeout(() => {
      setShowWeekModal(false);
    }, 200);
  }, [animateWeekModal]);

  const handleCloseDateModal = useCallback(() => {
    animateDateModal(false);
    setTimeout(() => {
      setShowDateModal(false);
    }, 200);
  }, [animateDateModal]);

  const handleSelectWeek = (week: number) => {
    setSelectedWeek(week);
    handleCloseWeekModal();
    handleSave();  // 实时保存
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    handleCloseDateModal();
    handleSave();  // 实时保存
  };

  const handleAddRecipe = (mealType: 'breakfast' | 'lunch' | 'dinner') => {
    setSelectedMealType(mealType);
    setSelectedRecipes(mealPlans[mealType].recipes);
    setShowRecipeModal(true);
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipes(prev => {
      const exists = prev.find(r => r.id === recipe.id);
      if (exists) {
        return prev.filter(r => r.id !== recipe.id);
      } else {
        return [...prev, recipe];
      }
    });
  };

  const handleConfirmRecipes = () => {
    if (selectedMealType) {
      setMealPlans(prev => ({
        ...prev,
        [selectedMealType]: {
          ...prev[selectedMealType],
          recipes: selectedRecipes
        }
      }));
      setShowRecipeModal(false);
      handleSave();  // 实时保存
    }
  };

  const handleRemoveRecipe = (mealType: 'breakfast' | 'lunch' | 'dinner', recipeId: number) => {
    setMealPlans(prev => ({
      ...prev,
      [mealType]: {
        ...prev[mealType],
        recipes: prev[mealType].recipes.filter(r => r.id !== recipeId)
      }
    }));
  };

  const { start, end } = getWeekDateRange(selectedWeek);
  const dateOptions = getDateOptions();

  // 汇总所有食材
  const allIngredients = Array.from(new Set([
    ...mealPlans.breakfast.recipes.flatMap(r => r.ingredients || []),
    ...mealPlans.lunch.recipes.flatMap(r => r.ingredients || []),
    ...mealPlans.dinner.recipes.flatMap(r => r.ingredients || [])
  ]));

  // 编辑/查看模式
  const [showIngredientPanel, setShowIngredientPanel] = useState(false);
  const [isEditIngredient, setIsEditIngredient] = useState(false);

  // 食材对象数组 [{ name, amount }]
  const [ingredientList, setIngredientList] = useState([
    { name: '土豆', amount: '300g' },
    { name: '胡萝卜', amount: '2根' },
    { name: '鸡胸肉', amount: '200g' },
    { name: '生抽', amount: '1勺' },
    { name: '盐', amount: '适量' },
    { name: '土豆', amount: '300g' },
    { name: '胡萝卜', amount: '2根' },
    { name: '鸡胸肉', amount: '200g' },
    { name: '生抽', amount: '1勺' },
    { name: '盐', amount: '适量' },
    { name: '土豆', amount: '300g' },
    { name: '胡萝卜', amount: '2根' },
    { name: '鸡胸肉', amount: '200g' },
    { name: '生抽', amount: '1勺' },
    { name: '盐', amount: '适量' },
    { name: '土豆', amount: '300g' },
    { name: '胡萝卜', amount: '2根' },
    { name: '鸡胸肉', amount: '200g' },
    { name: '生抽', amount: '1勺' },
    { name: '盐', amount: '适量' }
  ]);

  // 切换编辑/保存
  const handleEditSave = () => {
    if (isEditIngredient) {
      // 保存逻辑（可扩展：如同步到后端）
      setIsEditIngredient(false);
    } else {
      setIsEditIngredient(true);
    }
  };

  // 编辑输入
  const handleIngredientChange = (idx: number, key: 'name' | 'amount', value: string) => {
    setIngredientList(list => {
      const newList = [...list];
      newList[idx] = { ...newList[idx], [key]: value };
      return newList;
    });
  };

  // 删除一项
  const handleRemoveIngredient = (idx: number) => {
    setIngredientList(list => list.filter((_, i) => i !== idx));
  };

  // 新增一项
  const handleAddIngredient = () => {
    setIngredientList(list => [...list, { name: '', amount: '' }]);
  };

  const ingredientPanelAnim = useRef(new Animated.Value(0)).current;
  const ingredientPanelTranslateY = useRef(new Animated.Value(100)).current;
  const ingredientPanelDragY = useRef(new Animated.Value(0)).current;

  const handleIngredientPanelClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(ingredientPanelAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(ingredientPanelTranslateY, {
        toValue: 100,
        duration: 400,
        useNativeDriver: true,
      })
    ]).start(() => {
      setShowIngredientPanel(false);
      ingredientPanelDragY.setValue(0);
    });
  }, [ingredientPanelAnim, ingredientPanelTranslateY, ingredientPanelDragY]);

  // 下拉手势
  const ingredientPanelPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          ingredientPanelDragY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 80) {
          // 下拉超过80，先播放关闭动画再隐藏
          handleIngredientPanelClose();
        } else {
          // 回弹
          Animated.spring(ingredientPanelDragY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(ingredientPanelDragY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    })
  ).current;

  // 控制弹窗显隐动画
  useEffect(() => {
    if (showIngredientPanel) {
      Animated.parallel([
        Animated.timing(ingredientPanelAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(ingredientPanelTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(ingredientPanelAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(ingredientPanelTranslateY, {
          toValue: 100,
          duration: 600,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [showIngredientPanel]);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Animated.View 
          style={[
            styles.titleButton,
            {
              opacity: weekTitleOpacity,
              transform: [{ scale: weekTitleScale }]
            }
          ]}
        >
          <TouchableOpacity onPress={() => setShowWeekModal(true)}>
            <Text style={styles.title}>{currentWeekOption.label}</Text>
          </TouchableOpacity>
        </Animated.View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }} // 给底部清单留空间
      >
        {/* 日期选择器 */}
        <Animated.View 
          style={[
            styles.dateSelector,
            {
              transform: [{ translateX }]
            }
          ]} 
          {...panResponder.panHandlers}
        >
          {getDateOptions().map((option) => (
            <TouchableOpacity
              key={option.date}
              style={[
                styles.dateItem,
                selectedDate === option.date && styles.selectedDateItem
              ]}
              onPress={() => handleSelectDate(option.date)}
            >
              <Text style={[
                styles.weekdayText,
                selectedDate === option.date && styles.selectedDateText
              ]}>
                {option.weekday}
              </Text>
              <Text style={[
                styles.dayText,
                selectedDate === option.date && styles.selectedDateText
              ]}>
                {option.month}/{option.day}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* 三餐计划 */}
        {(['breakfast', 'lunch', 'dinner'] as const).map((mealType) => (
          <View key={mealType} style={styles.section}>
            <View style={styles.mealHeader}>
              <Text style={styles.mealTitle}>
                {mealType === 'breakfast' ? '早餐' : 
                 mealType === 'lunch' ? '午餐' : '晚餐'}
              </Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => handleAddRecipe(mealType)}
              >
                <MaterialIcons name="add" size={24} color="#ff7603" />
              </TouchableOpacity>
            </View>
            
            <ScrollView horizontal style={styles.recipesList}>
              {mealPlans[mealType].recipes.map((recipe) => (
                <View key={recipe.id} style={styles.recipeItem}>
                  <RecipeItem
                    recipe={recipe}
                    onPress={() => {}}
                    onEdit={() => {}}
                    onDelete={() => handleRemoveRecipe(mealType, recipe.id)}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        ))}
      </ScrollView>

      {/* 右下角浮动食材清单按钮/面板 */}
      {showIngredientPanel ? (
        <Modal
          visible={showIngredientPanel}
          transparent
          animationType="none"
          onRequestClose={handleIngredientPanelClose}
        >
          <TouchableWithoutFeedback onPress={handleIngredientPanelClose}>
            <View style={styles.ingredientModalOverlay}>
              <TouchableWithoutFeedback>
                <Animated.View style={[styles.ingredientFullPanel, {
                  opacity: ingredientPanelAnim,  
                  transform: [
                    { translateY: ingredientPanelTranslateY.interpolate({ 
                      inputRange: [0, 100], 
                      outputRange: [0, Dimensions.get('window').height * 0.3]
                    }) },
                    { translateY: ingredientPanelDragY }
                  ]
                }]}> 
                  <View style={styles.ingredientPanelHandleArea}>
                    <View
                      style={styles.ingredientPanelHandleBar}
                      {...ingredientPanelPanResponder.panHandlers}
                      hitSlop={{ top: 20, bottom: 20, left: 30, right: 30 }}
                    />
                    <TouchableOpacity style={styles.ingredientPanelEditBtnRight} onPress={handleEditSave}>
                      <Text style={styles.ingredientPanelEditBtnText}>{isEditIngredient ? '完成' : '编辑'}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ flex: 1, minHeight: 200 }}>
                    <ScrollView
                      style={{ flex: 1 }}
                      contentContainerStyle={{
                        flexGrow: 1,
                        paddingBottom: 24,
                        paddingHorizontal: 20,
                        minHeight: Dimensions.get('window').height * 0.3
                      }}
                      keyboardShouldPersistTaps="handled"
                      scrollEnabled={true}
                      nestedScrollEnabled={true}
                    >
                      {ingredientList.map((item, idx) => (
                        <View key={idx} style={[styles.ingredientItemRow, {
                          minHeight: 40,
                          paddingRight: 30
                        }]}>
                          <Text style={styles.ingredientIndex}>{idx + 1}.</Text>
                          {isEditIngredient ? (
                            <>
                              <TextInput
                                style={styles.ingredientInput}
                                value={item.name}
                                placeholder="食材名称"
                                onChangeText={v => handleIngredientChange(idx, 'name', v)}
                              />
                              <TextInput
                                style={styles.ingredientInput}
                                value={item.amount}
                                placeholder="用量"
                                onChangeText={v => handleIngredientChange(idx, 'amount', v)}
                              />
                              <TouchableOpacity onPress={() => handleRemoveIngredient(idx)}>
                                <MaterialIcons name="remove-circle-outline" size={22} color="#ff7603" />
                              </TouchableOpacity>
                            </>
                          ) : (
                            <>
                              <Text style={styles.ingredientName}>{item.name}</Text>
                              <Text style={styles.ingredientAmount}>{item.amount}</Text>
                            </>
                          )}
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                </Animated.View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      ) : (
        <TouchableOpacity style={styles.ingredientFloatButton} onPress={() => setShowIngredientPanel(true)}>
          <Text style={styles.ingredientFloatButtonText}>食材清单</Text>
        </TouchableOpacity>
      )}

      {/* 周选择弹窗 */}
      <Modal
        visible={showWeekModal}
        transparent
        animationType="none"
        onRequestClose={handleCloseWeekModal}
      >
        <TouchableWithoutFeedback onPress={handleCloseWeekModal}>
          <Animated.View style={[styles.modalOverlay, { opacity: weekFadeAnim }]}>
            <TouchableWithoutFeedback>
              <Animated.View style={[styles.modalContent, { transform: [{ translateY: weekSlideAnim }] }]}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>选择周</Text>
                  <TouchableOpacity onPress={handleCloseWeekModal}>
                    <MaterialIcons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                <View style={styles.weekOptions}>
                  {weekOptions.map((week) => (
                    <TouchableOpacity
                      key={week.value}
                      style={[
                        styles.weekOption,
                        selectedWeek === week.value && styles.selectedWeekOption
                      ]}
                      onPress={() => handleSelectWeek(week.value)}
                    >
                      <Text style={[
                        styles.weekOptionText,
                        selectedWeek === week.value && styles.selectedWeekOptionText
                      ]}>
                        {week.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 日期选择弹窗 */}
      <Modal
        visible={showDateModal}
        transparent
        animationType="none"
        onRequestClose={handleCloseDateModal}
      >
        <TouchableWithoutFeedback onPress={handleCloseDateModal}>
          <Animated.View style={[styles.modalOverlay, { opacity: dateFadeAnim }]}>
            <TouchableWithoutFeedback>
              <Animated.View style={[styles.modalContent, { transform: [{ translateY: dateSlideAnim }] }]}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>选择日期</Text>
                  <TouchableOpacity onPress={handleCloseDateModal}>
                    <MaterialIcons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                <View style={styles.dateOptions}>
                  {dateOptions.map((option) => (
                    <TouchableOpacity
                      key={option.date}
                      style={[
                        styles.dateOption,
                        selectedDate === option.date && styles.selectedDateOption
                      ]}
                      onPress={() => handleSelectDate(option.date)}
                    >
                      <Text style={[
                        styles.dateOptionText,
                        selectedDate === option.date && styles.selectedDateOptionText
                      ]}>
                        {option.weekday}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 菜谱选择弹窗 */}
      <Modal
        visible={showRecipeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRecipeModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowRecipeModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>选择菜谱</Text>
                  <TouchableOpacity onPress={() => setShowRecipeModal(false)}>
                    <MaterialIcons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.recipeOptions}>
                  {availableRecipes.map((recipe) => (
                    <TouchableOpacity
                      key={recipe.id}
                      style={[
                        styles.recipeOption,
                        selectedRecipes.find(r => r.id === recipe.id) && styles.selectedRecipeOption
                      ]}
                      onPress={() => handleSelectRecipe(recipe)}
                    >
                      <View style={styles.recipeOptionContent}>
                        <Text style={styles.recipeOptionText}>{recipe.name}</Text>
                        <Text style={styles.recipeOptionCategory}>{recipe.category}</Text>
                      </View>
                      {selectedRecipes.find(r => r.id === recipe.id) && (
                        <MaterialIcons name="check" size={24} color="#ff7603" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 标签选择底部弹窗 */}
      <Modal
        visible={showTagModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTagModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowTagModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { transform: [{ translateY: showTagModal ? 0 : 100 }] }]}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}></Text>
                  <TouchableOpacity onPress={() => setShowTagModal(false)}>
                    <Text style={styles.modalCloseButton}>完成</Text>
                  </TouchableOpacity>
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
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  titleButton: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectorLabel: {
    fontSize: 18,
    color: '#333',
    marginRight: 12,
  },
  selectorButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  selectorButtonText: {
    fontSize: 18,
    color: '#333',
  },
  dateSelectorButtonText: {
    fontSize: 16,
    color: '#333',
    borderBottomWidth: 0.4,
    borderBottomColor: '#ff7603',
    paddingBottom: 4,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff7603',
  },
  recipesList: {
    flexDirection: 'row',
    marginHorizontal: -16, // 抵消父容器的padding
    paddingHorizontal: 16, // 恢复内部内容的padding
  },
  recipeItem: {
    marginRight: 12,
    width: 200,
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalCloseButton: {
    fontSize: 16,
    color: '#ff7603',
    fontWeight: '600',
  },
  weekOptions: {
    paddingVertical: 8,
  },
  weekOption: {
    padding: 16,
    borderRadius: 8,
  },
  selectedWeekOption: {
    backgroundColor: '#fff5eb',
  },
  weekOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedWeekOptionText: {
    color: '#ff7603',
    fontWeight: '600',
  },
  dateOptions: {
    paddingVertical: 8,
  },
  dateOption: {
    padding: 16,
    borderRadius: 8,
  },
  selectedDateOption: {
    backgroundColor: '#fff5eb',
  },
  dateOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedDateOptionText: {
    color: '#ff7603',
    fontWeight: '600',
  },
  recipeOptions: {
    maxHeight: 400,
  },
  recipeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedRecipeOption: {
    backgroundColor: '#fff5eb',
  },
  recipeOptionContent: {
    flex: 1,
  },
  recipeOptionText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  recipeOptionCategory: {
    fontSize: 14,
    color: '#666',
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
    width: Dimensions.get('window').width,
  },
  dateItem: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    minWidth: 40,
  },
  selectedDateItem: {
    backgroundColor: '#fff5eb',
  },
  weekdayText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dayText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectedDateText: {
    color: '#ff7603',
  },
  ingredientFloatButton: {
    position: 'absolute',
    right: 20,
    bottom: 36,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#ff7603',
    zIndex: 100,
  },
  ingredientFloatButtonText: {
    color: '#ff7603',
    fontWeight: '600',
    fontSize: 16,
  },
  ingredientFullPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: undefined,
    maxHeight: Dimensions.get('window').height * 0.6,
    minHeight: Dimensions.get('window').height * 0.3,
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 16,
    zIndex: 101,
    flexDirection: 'column',
  },
  ingredientPanelCloseBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
    padding: 4,
  },
  ingredientPanelBoxFull: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 0,
  },
  ingredientPanelListText: {
    fontSize: 15,
    color: '#666',
    flexWrap: 'wrap',
  },
  ingredientPanelRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  ingredientPanelEditBtn: {
    color: '#ff7603',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
  },
  ingredientItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  ingredientInput: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 15,
    color: '#333',
    marginRight: 8,
    minWidth: 70,
    backgroundColor: '#fff',
  },
  ingredientName: {
    fontSize: 15,
    color: '#333',
    marginRight: 16,
    minWidth: 70,
  },
  ingredientAmount: {
    fontSize: 15,
    color: '#666',
    minWidth: 50,
  },
  ingredientAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ingredientAddBtnText: {
    color: '#ff7603',
    fontSize: 15,
    marginLeft: 4,
  },
  ingredientIndex: {
    fontSize: 15,
    color: '#999',
    marginRight: 8,
    minWidth: 18,
    textAlign: 'right',
  },
  ingredientModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'flex-end',
  },
  ingredientPanelHandleArea: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
    width: '100%',
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  ingredientPanelHandleBar: {
    width: 70,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ddd',
    marginBottom: 4,
    alignSelf: 'center',
  },
  ingredientPanelEditBtnRight: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
    padding: 4,
  },
  ingredientPanelEditBtnText: {
    color: '#ff7603',
    fontSize: 16,
    fontWeight: '600',
  },
}); 