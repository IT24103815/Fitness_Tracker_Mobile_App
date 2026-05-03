import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import axios from 'axios';

import { API_URL } from '../config';

const EditExerciseScreen = ({ route, navigation }) => {
    const { exercise } = route.params;
    const validCategories = ['Strength', 'Cardio', 'HIIT', 'Yoga', 'Mobility', 'Full Body'];
    const validMuscles = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body', 'Calves', 'Glutes'];

    let initialCategories = Array.isArray(exercise.category) ? exercise.category : [exercise.category];
    initialCategories = initialCategories.filter(c => validCategories.includes(c));
    if (initialCategories.length === 0) initialCategories = ['Strength'];

    let initialMuscles = Array.isArray(exercise.muscleGroup) ? exercise.muscleGroup : [exercise.muscleGroup];
    initialMuscles = initialMuscles.filter(m => validMuscles.includes(m));
    if (initialMuscles.length === 0) initialMuscles = ['Chest'];

    const [form, setForm] = useState({
        name: exercise.name,
        category: initialCategories,
        muscleGroup: initialMuscles,
        description: exercise.description,
        difficulty: exercise.difficulty,
        caloriesPerMinute: exercise.caloriesPerMinute.toString(),
    });

    const toggleSelection = (key, value) => {
        setForm(prev => {
            const arr = prev[key] || [];
            if (arr.includes(value)) {
                if (arr.length === 1) return prev;
                return { ...prev, [key]: arr.filter(item => item !== value) };
            } else {
                return { ...prev, [key]: [...arr, value] };
            }
        });
    };

    const handleUpdate = async () => {
        if (isNaN(Number(form.caloriesPerMinute))) {
            Alert.alert('Error', 'Please enter a numeric value for calories per minute');
            return;
        }

        try {
            await axios.put(`${API_URL}/exercises/${exercise._id}`, form);
            Alert.alert('Success', 'Exercise updated successfully');
            navigation.goBack();
        } catch (err) {
            Alert.alert('Error', 'Failed to update exercise');
        }
    };

    return (
        <ScrollView style={styles.container}>
            <TextInput style={styles.input} value={form.name} onChangeText={v => setForm({ ...form, name: v })} placeholder="Exercise Name" />
            
            <Text style={styles.label}>Category</Text>
            <View style={styles.pickerRow}>
                {['Strength', 'Cardio', 'HIIT', 'Yoga', 'Mobility', 'Full Body'].map(cat => (
                    <TouchableOpacity
                        key={cat}
                        style={[styles.option, form.category.includes(cat) && styles.optionActive]}
                        onPress={() => toggleSelection('category', cat)}
                    >
                        <Text style={styles.optionText}>{cat}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>Muscle Group</Text>
            <View style={styles.pickerRow}>
                {['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'].map(mg => (
                    <TouchableOpacity
                        key={mg}
                        style={[styles.option, form.muscleGroup.includes(mg) && styles.optionActive]}
                        onPress={() => toggleSelection('muscleGroup', mg)}
                    >
                        <Text style={styles.optionText}>{mg}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>Difficulty</Text>
            <View style={styles.pickerRow}>
                {['Beginner', 'Intermediate', 'Advanced'].map(d => (
                    <TouchableOpacity
                        key={d}
                        style={[styles.option, form.difficulty === d && styles.optionActive]}
                        onPress={() => setForm({ ...form, difficulty: d })}
                    >
                        <Text style={styles.optionText}>{d}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TextInput style={[styles.input, { height: 120, textAlignVertical: 'top' }]} value={form.description} onChangeText={v => setForm({ ...form, description: v })} placeholder="Description" multiline />
            <TextInput style={styles.input} value={form.caloriesPerMinute} onChangeText={v => setForm({ ...form, caloriesPerMinute: v })} placeholder="Calories per minute" keyboardType="numeric" />

            <TouchableOpacity style={styles.button} onPress={handleUpdate}>
                <Text style={styles.buttonText}>Update Exercise</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A', padding: 20 },
    input: {
        backgroundColor: '#1E2937',
        color: '#FFFFFF',
        padding: 18,
        borderRadius: 16,
        marginBottom: 16,
        fontSize: 17,
    },
    label: { color: '#94A3B8', fontSize: 15, marginBottom: 8, marginTop: 12 },
    pickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
    option: {
        backgroundColor: '#334155',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    optionActive: { backgroundColor: '#3B82F6' },
    optionText: { color: '#FFFFFF' },
    button: {
        backgroundColor: '#3B82F6',
        paddingVertical: 18,
        borderRadius: 16,
        marginTop: 20,
    },
    buttonText: { color: '#FFFFFF', fontSize: 19, fontWeight: '600', textAlign: 'center' },
});

export default EditExerciseScreen;
