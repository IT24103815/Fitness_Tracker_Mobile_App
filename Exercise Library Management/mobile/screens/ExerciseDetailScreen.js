import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';

import { API_URL } from '../config';
const ExerciseDetailScreen = ({ route, navigation }) => {
    const [exercise, setExercise] = useState(route.params.exercise);
    const { user } = useContext(AuthContext);

    const fetchExercise = async () => {
        try {
            const res = await axios.get(`${API_URL}/exercises/${exercise._id}`);
            setExercise(res.data.exercise);
        } catch (err) {
            if (err.response?.status === 404) {
                // Exercise was deleted gracefully handle
                navigation.goBack();
            } else {
                console.log('Error fetching exercise details:', err.message);
            }
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchExercise();
        });
        return unsubscribe;
    }, [navigation]);

    const canManage = user?.role === 'admin' || user?.role === 'trainer';

    const handleDelete = () => {
        Alert.alert('Delete Exercise', 'Are you sure you want to delete this exercise?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await axios.delete(`${API_URL}/exercises/${exercise._id}`);
                        navigation.goBack();
                    } catch (err) {
                        Alert.alert('Error', 'Failed to delete exercise');
                    }
                }
            }
        ]);
    };
    return (
        <ScrollView style={styles.container}>
            {exercise.image ? (
                <Image source={{ uri: exercise.image }} style={styles.image} />
            ) : (
                <View style={styles.imagePlaceholder}>
                    <Text style={styles.placeholderText}>🏋️</Text>
                </View>
            )}

            <View style={styles.content}>
                <Text style={styles.name}>{exercise.name}</Text>

                <View style={styles.tags}>
                    {[...(exercise.category || []), ...(exercise.muscleGroup || []), exercise.difficulty].map((tag, index) => (
                        <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>Calories Burned</Text>
                    <Text style={styles.calories}>{exercise.caloriesPerMinute} <Text style={styles.unit}>cal/min</Text></Text>
                </View>

                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>{exercise.description}</Text>

                {canManage && (
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => navigation.navigate('EditExercise', { exercise })}
                        >
                            <Text style={styles.buttonText}>Edit Exercise</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={handleDelete}
                        >
                            <Text style={styles.deleteText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    image: { width: '100%', height: 280 },
    imagePlaceholder: {
        width: '100%',
        height: 280,
        backgroundColor: '#1E2937',
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderText: { fontSize: 80 },
    content: { padding: 20 },
    name: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: 12 },
    tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
    tag: {
        backgroundColor: '#334155',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
    },
    tagText: { color: '#60A5FA', fontSize: 14, fontWeight: '500' },
    infoCard: {
        backgroundColor: '#1E2937',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        alignItems: 'center',
    },
    infoTitle: { color: '#94A3B8', fontSize: 15 },
    calories: { fontSize: 42, fontWeight: '900', color: '#60A5FA', marginTop: 4 },
    unit: { fontSize: 18, fontWeight: '500' },
    sectionTitle: { fontSize: 20, fontWeight: '600', color: '#FFFFFF', marginBottom: 12 },
    description: { fontSize: 17, color: '#CBD5E1', lineHeight: 26 },
    buttonRow: { flexDirection: 'row', gap: 12, marginTop: 30 },
    editButton: {
        flex: 1,
        backgroundColor: '#3B82F6',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    deleteButton: {
        flex: 1,
        backgroundColor: '#EF4444',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '600' },
    deleteText: { color: '#FFFFFF', fontSize: 17, fontWeight: '600' },
});

export default ExerciseDetailScreen;
