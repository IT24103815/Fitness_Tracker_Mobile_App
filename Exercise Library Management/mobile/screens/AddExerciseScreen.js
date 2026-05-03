import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';

import { API_URL } from '../config';

const AddExerciseScreen = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [form, setForm] = useState({
        name: '',
        category: ['Strength'],
        muscleGroup: ['Chest'],
        description: '',
        difficulty: 'Beginner',
        caloriesPerMinute: '',
    });
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

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


    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaType.Image,
            allowsEditing: false,
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    const handleSubmit = async () => {
        if (!form.name || !form.description || !form.caloriesPerMinute) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        if (isNaN(Number(form.caloriesPerMinute))) {
            Alert.alert('Error', 'Please enter a numeric value for calories per minute');
            return;
        }

        setLoading(true);
        const formData = new FormData();

        Object.keys(form).forEach(key => {
            if (Array.isArray(form[key])) {
                form[key].forEach(val => formData.append(key, val));
            } else {
                formData.append(key, form[key]);
            }
        });

        if (image) {
            formData.append('image', {
                uri: image.uri,
                type: 'image/jpeg',
                name: 'exercise.jpg',
            });
        }

        try {
            await axios.post(`${API_URL}/exercises`, formData);
            Alert.alert('Success', 'Exercise added successfully');
            navigation.goBack();
        } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to add exercise');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {image ? (
                    <Image source={{ uri: image.uri }} style={styles.selectedImage} />
                ) : (
                    <Text style={styles.imagePlaceholderText}>Tap to upload exercise image</Text>
                )}
            </TouchableOpacity>

            <TextInput style={styles.input} placeholder="Exercise Name" value={form.name} onChangeText={v => setForm({ ...form, name: v })} />

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

            <TextInput
                style={styles.input}
                placeholder="Calories per minute"
                keyboardType="numeric"
                value={form.caloriesPerMinute}
                onChangeText={v => setForm({ ...form, caloriesPerMinute: v })}
            />

            <TextInput
                style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
                placeholder="Description"
                multiline
                value={form.description}
                onChangeText={v => setForm({ ...form, description: v })}
            />

            <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={loading}
            >
                <Text style={styles.submitText}>{loading ? 'Adding...' : 'Add Exercise'}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A', padding: 20 },
    imagePicker: {
        height: 200,
        backgroundColor: '#1E2937',
        borderRadius: 20,
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    selectedImage: { width: '100%', height: '100%' },
    imagePlaceholderText: { color: '#64748B', fontSize: 16 },
    input: {
        backgroundColor: '#1E2937',
        color: '#FFFFFF',
        fontSize: 17,
        padding: 18,
        borderRadius: 16,
        marginBottom: 16,
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
    submitButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 18,
        borderRadius: 16,
        marginTop: 30,
    },
    submitText: { color: '#FFFFFF', fontSize: 19, fontWeight: '600', textAlign: 'center' },
});

export default AddExerciseScreen;
