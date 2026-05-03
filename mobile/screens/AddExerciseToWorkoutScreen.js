import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';

import { API_URL } from '../config';

const AddExerciseToWorkoutScreen = ({ route, navigation }) => {
    const { plan, weekIndex, dayName } = route.params;

    const [exercises, setExercises] = useState([]);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [form, setForm] = useState({
        sets: '3',
        reps: '10-12',
        restTime: '60'
    });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        const fetchExercises = async () => {
            try {
                const res = await axios.get(`${API_URL}/exercises`);
                setExercises(res.data.exercises || []);
            } catch (err) {
                Alert.alert('Error', 'Failed to fetch exercises');
            } finally {
                setFetching(false);
            }
        };
        fetchExercises();
    }, []);

    const handleSave = async () => {
        if (!selectedExercise) {
            Alert.alert('Error', 'Please select an exercise');
            return;
        }

        const setsNum = parseInt(form.sets, 10);
        if (isNaN(setsNum) || setsNum < 1) {
            Alert.alert('Error', 'Sets must be a valid number');
            return;
        }

        if (!form.reps.trim()) {
            Alert.alert('Error', 'Please enter reps');
            return;
        }

        setLoading(true);

        try {
            // Create a deep copy of the weeks array
            const updatedWeeks = JSON.parse(JSON.stringify(plan.weeks));
            
            // Find the specific day within the specific week
            const targetWeek = updatedWeeks[weekIndex];
            if (!targetWeek) throw new Error('Week not found');
            
            let targetDay = targetWeek.days.find(d => d.day === dayName);
            
            // If the day doesn't exist yet, push it!
            if (!targetDay) {
                targetDay = { day: dayName, exercises: [] };
                targetWeek.days.push(targetDay);
            }

            // Push the new exercise into that day
            targetDay.exercises.push({
                exercise: selectedExercise._id,
                sets: setsNum,
                reps: form.reps.trim(),
                restTime: parseInt(form.restTime, 10) || 60,
                notes: ''
            });

            // Update the plan on the backend
            await axios.put(`${API_URL}/workouts/${plan._id}`, { weeks: updatedWeeks });
            
            Alert.alert('Success', 'Exercise added to workout!');
            navigation.goBack();
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to add exercise. ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Add to Week {plan.weeks[weekIndex]?.weekNumber} - {dayName}</Text>
            
            <Text style={styles.label}>1. Select Exercise</Text>
            <View style={styles.listContainer}>
                <FlatList
                    data={exercises}
                    keyExtractor={item => item._id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.exerciseCard, selectedExercise?._id === item._id && styles.exerciseCardActive]}
                            onPress={() => setSelectedExercise(item)}
                        >
                            <Text style={[styles.exerciseText, selectedExercise?._id === item._id && styles.exerciseTextActive]}>
                                {item.name}
                            </Text>
                            <Text style={styles.exerciseSubText}>{item.muscleGroup?.[0]}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            <Text style={styles.label}>2. Configuration</Text>
            <View style={styles.inputGroup}>
                <View style={styles.inputItem}>
                    <Text style={styles.inputLabel}>Sets</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={form.sets}
                        onChangeText={v => setForm({...form, sets: v})}
                    />
                </View>
                <View style={styles.inputItem}>
                    <Text style={styles.inputLabel}>Reps (e.g. 8-12)</Text>
                    <TextInput
                        style={styles.input}
                        value={form.reps}
                        onChangeText={v => setForm({...form, reps: v})}
                    />
                </View>
            </View>

            <View style={styles.inputGroup}>
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSave} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Add Exercise</Text>}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A', padding: 20 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 20, textAlign: 'center' },
    label: { color: '#94A3B8', fontSize: 16, fontWeight: '600', marginBottom: 12, marginTop: 10 },
    listContainer: { height: 100, marginBottom: 20 },
    exerciseCard: { backgroundColor: '#1E2937', padding: 16, borderRadius: 12, marginRight: 12, width: 140, justifyContent: 'center' },
    exerciseCardActive: { backgroundColor: '#3B82F6' },
    exerciseText: { color: '#94A3B8', fontSize: 16, fontWeight: 'bold' },
    exerciseTextActive: { color: '#FFFFFF' },
    exerciseSubText: { color: '#64748B', fontSize: 12, marginTop: 4 },
    inputGroup: { flexDirection: 'row', gap: 16, marginBottom: 16 },
    inputItem: { flex: 1 },
    inputLabel: { color: '#94A3B8', fontSize: 14, marginBottom: 8 },
    input: { backgroundColor: '#1E2937', color: '#fff', padding: 16, borderRadius: 12, fontSize: 16 },
    submitBtn: { backgroundColor: '#10B981', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 40 },
    submitBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' }
});

export default AddExerciseToWorkoutScreen;
