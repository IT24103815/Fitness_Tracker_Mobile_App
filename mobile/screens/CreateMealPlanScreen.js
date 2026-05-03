import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet, Modal, FlatList } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';

const API_URL = 'http://192.168.1.73:5000/api';

const CreateMealPlanScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({
    title: '',
    goalType: 'weight_loss',
    duration: '4', // Default to 4 weeks
  });
  
  // Initialize dailyMeals with 7 days and 3 standard meals each
  const [dailyMeals, setDailyMeals] = useState(
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => ({
      day,
      meals: [
        { mealType: 'Breakfast', foods: [] },
        { mealType: 'Lunch', foods: [] },
        { mealType: 'Dinner', foods: [] }
      ]
    }))
  );

  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeRef, setActiveRef] = useState({ dayIdx: 0, mealIdx: 0 });
  const [tempFood, setTempFood] = useState({ name: '', calories: '' });

  const goalOptions = ['weight_loss', 'muscle_gain', 'maintenance'];

  const addFoodToMeal = () => {
    if (!tempFood.name.trim() || !tempFood.calories) {
      Alert.alert('Error', 'Please enter food name and calories');
      return;
    }
    
    const { dayIdx, mealIdx } = activeRef;
    const newDailyMeals = [...dailyMeals];
    newDailyMeals[dayIdx].meals[mealIdx].foods.push({
      name: tempFood.name.trim(),
      calories: parseInt(tempFood.calories, 10)
    });
    
    setDailyMeals(newDailyMeals);
    setModalVisible(false);
    setTempFood({ name: '', calories: '' });
  };

  const removeFood = (dayIdx, mealIdx, foodIdx) => {
    const newDailyMeals = [...dailyMeals];
    newDailyMeals[dayIdx].meals[mealIdx].foods.splice(foodIdx, 1);
    setDailyMeals(newDailyMeals);
  };

  const handleCreatePlan = async () => {
    const titleTrimmed = form.title.trim();
    if (!titleTrimmed) {
      Alert.alert('Incomplete Form', 'Please provide a Title for this meal plan.');
      return;
    }

    // Validation: Check if there is at least one food across all days
    const totalFoods = dailyMeals.reduce((total, day) => {
        return total + day.meals.reduce((mTotal, meal) => mTotal + meal.foods.length, 0);
    }, 0);

    if (totalFoods === 0) {
        Alert.alert('Empty Plan', 'Please add at least one food item to the plan.');
        return;
    }

    setLoading(true);

    try {
      const payload = {
        ...form,
        duration: parseInt(form.duration, 10),
        dailyMeals,
        isTemplate: user?.role === 'admin' || user?.role === 'trainer'
      };

      await axios.post(`${API_URL}/meals/templates`, payload);
      Alert.alert('Success', 'Meal Plan created successfully!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Failed', err.response?.data?.message || 'Failed to create meal plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>New Meal Plan Builder</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>Plan Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 1 Month Cutting Phase"
          value={form.title}
          onChangeText={(v) => setForm({ ...form, title: v })}
        />

        <Text style={styles.label}>Goal Type</Text>
        <View style={styles.optionRow}>
          {goalOptions.map(goal => (
            <TouchableOpacity
              key={goal}
              style={[styles.optionButton, form.goalType === goal && styles.optionActive]}
              onPress={() => setForm({ ...form, goalType: goal })}
            >
              <Text style={styles.optionText}>{goal.replace('_', ' ')}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Duration (Weeks)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="4"
          value={form.duration}
          onChangeText={(v) => setForm({ ...form, duration: v })}
        />
      </View>

      <Text style={styles.sectionHeader}>Weekly Menu (Loops for each week)</Text>
      
      {dailyMeals.map((dayObj, dayIdx) => (
        <View key={dayIdx} style={styles.dayCard}>
          <Text style={styles.dayTitle}>{dayObj.day}</Text>
          
          {dayObj.meals.map((meal, mealIdx) => (
            <View key={mealIdx} style={styles.mealSection}>
              <View style={styles.mealHeader}>
                <Text style={styles.mealType}>{meal.mealType}</Text>
                <TouchableOpacity 
                  onPress={() => {
                    setActiveRef({ dayIdx, mealIdx });
                    setModalVisible(true);
                  }}
                >
                  <Text style={styles.addText}>+ Add Food</Text>
                </TouchableOpacity>
              </View>
              
              {meal.foods.map((food, foodIdx) => (
                <View key={foodIdx} style={styles.foodRow}>
                  <Text style={styles.foodName}>{food.name}</Text>
                  <View style={styles.foodRight}>
                    <Text style={styles.foodCals}>{food.calories} kcal</Text>
                    <TouchableOpacity onPress={() => removeFood(dayIdx, mealIdx, foodIdx)}>
                      <Text style={styles.removeFood}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>
      ))}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Food Item</Text>
            
            <Text style={styles.label}>Food Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Scrambled Eggs"
              value={tempFood.name}
              onChangeText={(v) => setTempFood({ ...tempFood, name: v })}
            />

            <Text style={styles.label}>Calories</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              keyboardType="numeric"
              value={tempFood.calories}
              onChangeText={(v) => setTempFood({ ...tempFood, calories: v })}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#334155' }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.optionText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#10B981' }]}
                onPress={addFoodToMeal}
              >
                <Text style={styles.optionText}>Add Food</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreatePlan}
        disabled={loading}
      >
        <Text style={styles.createButtonText}>
          {loading ? 'Creating Meal Plan...' : 'Finalize & Create Plan'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 16 },
  title: { fontSize: 26, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#1E2937', borderRadius: 20, padding: 20, marginBottom: 20 },
  sectionHeader: { color: '#60A5FA', fontSize: 18, fontWeight: 'bold', marginVertical: 15 },
  label: { color: '#94A3B8', fontSize: 14, marginBottom: 8, marginTop: 10 },
  input: {
    backgroundColor: '#334155',
    color: '#FFFFFF',
    fontSize: 16,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginVertical: 10 },
  optionButton: { backgroundColor: '#334155', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  optionActive: { backgroundColor: '#3B82F6' },
  optionText: { color: '#FFFFFF', fontWeight: '600' },
  dayCard: { backgroundColor: '#1E2937', borderRadius: 20, padding: 16, marginBottom: 16 },
  dayTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#334155', paddingBottom: 8 },
  mealSection: { marginBottom: 15, backgroundColor: '#0F172A', borderRadius: 12, padding: 12 },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  mealType: { color: '#60A5FA', fontWeight: 'bold', fontSize: 16 },
  addText: { color: '#10B981', fontWeight: 'bold' },
  foodRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#334155' },
  foodName: { color: '#E2E8F0', flex: 1 },
  foodRight: { flexDirection: 'row', alignItems: 'center' },
  foodCals: { color: '#94A3B8', marginRight: 10 },
  removeFood: { color: '#EF4444', fontWeight: 'bold', fontSize: 18, paddingHorizontal: 5 },
  createButton: { backgroundColor: '#3B82F6', paddingVertical: 18, borderRadius: 16, marginVertical: 30 },
  createButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)', padding: 20 },
  modalContent: { backgroundColor: '#1E2937', borderRadius: 24, padding: 24 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  modalBtn: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' }
});

export default CreateMealPlanScreen;