import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const MealPlanDetailScreen = ({ route, navigation }) => {
    const { plan } = route.params;
    const { user } = useContext(AuthContext);
    const [currentPlan, setCurrentPlan] = useState(plan);
    const [selectedDay, setSelectedDay] = useState('Monday');

    const fetchPlan = async () => {
        try {
            const res = await axios.get(`${API_URL}/meals/${currentPlan._id}`);
            if (res.data.success) {
                setCurrentPlan(res.data.plan);
            }
        } catch (err) {
            console.log("Error refreshing plan:", err.message);
        }
    };

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchPlan();
        });
        return unsubscribe;
    }, [navigation]);

    const isTemplate = currentPlan.isTemplate === true;
    const isManagement = user?.role === 'admin' || user?.role === 'trainer';

    const canDelete =
        isManagement ||
        (!isTemplate && currentPlan.client?.toString() === user?._id?.toString());

    const handleDelete = () => {
        Alert.alert('Delete Plan', 'Are you sure you want to delete this meal plan?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await axios.delete(`${API_URL}/meals/${plan._id}`);
                        navigation.goBack();
                    } catch (err) {
                        Alert.alert('Error', 'Failed to delete plan');
                    }
                }
            }
        ]);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{currentPlan.title}</Text>
                <Text style={styles.goal}>{currentPlan.goalType?.replace('_', ' ')} Plan</Text>
                {isTemplate && <Text style={styles.templateBadge}>TEMPLATE (Read Only)</Text>}
            </View>

            {/* Day Selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector}>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <TouchableOpacity
                        key={day}
                        style={[styles.dayButton, selectedDay === day && styles.dayButtonActive]}
                        onPress={() => setSelectedDay(day)}
                    >
                        <Text style={[styles.dayText, selectedDay === day && styles.dayTextActive]}>{day}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Meals for selected day */}
            <View style={styles.mealsContainer}>
                {currentPlan.dailyMeals?.find(d => d.day === selectedDay)?.meals.map((meal, index) => (
                    <View key={index} style={styles.mealCard}>
                        <Text style={styles.mealType}>{meal.mealType}</Text>
                        
                        {meal.foods && meal.foods.length > 0 ? (
                            meal.foods.map((food, fIdx) => (
                                <View key={fIdx} style={styles.foodRow}>
                                    <Text style={styles.foodName}>{food.name}</Text>
                                    <Text style={styles.foodCals}>{food.calories} kcal</Text>
                                </View>
                            ))
                        ) : meal.name ? (
                            <View>
                                <Text style={styles.mealName}>{meal.name}</Text>
                                <Text style={styles.mealDesc}>{meal.description}</Text>
                                <Text style={styles.macros}>
                                    {meal.calories} cal | P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fats}g
                                </Text>
                            </View>
                        ) : (
                            <Text style={styles.noFoods}>No items added for this meal</Text>
                        )}

                        {meal.foods && meal.foods.length > 0 && (
                            <View style={styles.totalCalsContainer}>
                                <Text style={styles.totalCalsLabel}>Total Calories:</Text>
                                <Text style={styles.totalCalsValue}>
                                    {meal.foods?.reduce((acc, f) => acc + (f.calories || 0), 0) || 0} kcal
                                </Text>
                            </View>
                        )}
                    </View>
                ))}
            </View>

            {isTemplate && !canDelete && (
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#10B981', marginTop: 20 }]}
                    onPress={async () => {
                        try {
                            await axios.post(`${API_URL}/meals/templates/${currentPlan._id}/save`);
                            Alert.alert('Success', 'Meal plan saved to your profile!');
                            navigation.goBack();
                        } catch (err) {
                            Alert.alert('Error', err.response?.data?.message || 'Failed to save plan');
                        }
                    }}
                >
                    <Text style={styles.actionButtonText}>Save to My Profile</Text>
                </TouchableOpacity>
            )}

            {(isManagement || (!isTemplate && currentPlan.client?.toString() === user?._id?.toString())) && (
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#3B82F6', marginTop: 10 }]}
                    onPress={() => navigation.navigate('EditMealPlan', { plan: currentPlan })}
                >
                    <Text style={styles.actionButtonText}>Edit This Plan</Text>
                </TouchableOpacity>
            )}

            {canDelete && (
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDelete}
                >
                    <Text style={styles.deleteButtonText}>Delete Plan</Text>
                </TouchableOpacity>
            )}
            
            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    header: { padding: 30, backgroundColor: '#1E2937', alignItems: 'center' },
    title: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', textAlign: 'center' },
    goal: { color: '#60A5FA', fontSize: 16, marginTop: 8, textTransform: 'capitalize' },
    templateBadge: { color: '#F59E0B', fontSize: 13, marginTop: 10, fontWeight: '700', textTransform: 'uppercase' },
    
    daySelector: { paddingVertical: 16, paddingHorizontal: 16, backgroundColor: '#1E2937' },
    dayButton: { paddingHorizontal: 22, paddingVertical: 12, marginRight: 10, borderRadius: 14, backgroundColor: '#334155' },
    dayButtonActive: { backgroundColor: '#3B82F6' },
    dayText: { color: '#CBD5E1', fontSize: 14, fontWeight: '600' },
    dayTextActive: { color: '#FFFFFF' },
    
    mealsContainer: { padding: 16 },
    mealCard: {
        backgroundColor: '#1E2937',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3
    },
    mealType: { color: '#60A5FA', fontWeight: '800', fontSize: 14, textTransform: 'uppercase', marginBottom: 12 },
    mealName: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginBottom: 4 },
    mealDesc: { color: '#CBD5E1', fontSize: 15, marginBottom: 8 },
    macros: { color: '#94A3B8', fontSize: 13, fontWeight: '500' },
    
    foodRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#334155' },
    foodName: { color: '#FFFFFF', fontSize: 16 },
    foodCals: { color: '#94A3B8', fontSize: 14 },
    noFoods: { color: '#64748B', fontStyle: 'italic', marginVertical: 8 },
    totalCalsContainer: { marginTop: 16, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between' },
    totalCalsLabel: { color: '#94A3B8', fontWeight: 'bold' },
    totalCalsValue: { color: '#60A5FA', fontWeight: '900', fontSize: 16 },
    
    actionButton: { padding: 18, borderRadius: 16, alignItems: 'center', marginHorizontal: 16 },
    actionButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
    
    deleteButton: {
        backgroundColor: '#EF444422',
        borderWidth: 1,
        borderColor: '#EF4444',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginHorizontal: 16,
        marginTop: 20,
        marginBottom: 20,
    },
    deleteButtonText: { color: '#EF4444', fontSize: 16, fontWeight: '700' },
});

export default MealPlanDetailScreen;