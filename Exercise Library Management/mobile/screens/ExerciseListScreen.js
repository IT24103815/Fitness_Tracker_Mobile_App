import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';

import { API_URL } from '../config';

const ExerciseListScreen = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [exercises, setExercises] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const canManage = user?.role === 'admin' || user?.role === 'trainer';

    const fetchExercises = async () => {
        try {
            const res = await axios.get(`${API_URL}/exercises`);
            setExercises(res.data.exercises || []);
        } catch (err) {
            Alert.alert('Error', 'Failed to load exercises');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchExercises();
        });
        return unsubscribe;
    }, [navigation]);

    const filteredExercises = exercises.filter(ex =>
        ex.name.toLowerCase().includes(search.toLowerCase())
    );

    const renderExercise = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ExerciseDetail', { exercise: item })}
        >
            {item.image ? (
                <Image source={{ uri: item.image }} style={styles.image} />
            ) : (
                <View style={styles.imagePlaceholder}>
                    <Text style={styles.placeholderText}>🏋️</Text>
                </View>
            )}
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <View style={styles.tagsContainer}>
                    {[...(item.category || []), ...(item.muscleGroup || []), item.difficulty].map((tag, i) => (
                        <View key={i} style={styles.tagBadge}>
                            <Text style={styles.tagBadgeText}>{tag}</Text>
                        </View>
                    ))}
                </View>
                <Text style={styles.calories}>{item.caloriesPerMinute} cal/min</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchBar}
                placeholder="Search exercises..."
                placeholderTextColor="#64748B"
                value={search}
                onChangeText={setSearch}
            />

            <FlatList
                data={filteredExercises}
                keyExtractor={item => item._id}
                renderItem={renderExercise}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>
                        {loading ? 'Loading exercises...' : 'No exercises found'}
                    </Text>
                }
            />

            {canManage && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => navigation.navigate('AddExercise')}
                >
                    <Text style={styles.fabText}>+</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A', padding: 16 },
    searchBar: {
        backgroundColor: '#1E2937',
        color: '#FFFFFF',
        fontSize: 17,
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
    },
    card: {
        backgroundColor: '#1E2937',
        borderRadius: 20,
        marginBottom: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 12,
        marginRight: 16,
    },
    imagePlaceholder: {
        width: 80,
        height: 80,
        backgroundColor: '#334155',
        borderRadius: 12,
        marginRight: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderText: { fontSize: 32 },
    info: { flex: 1 },
    name: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
    detail: { color: '#60A5FA', fontSize: 15, marginTop: 4 },
    tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
    tagBadge: { backgroundColor: '#334155', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    tagBadgeText: { color: '#60A5FA', fontSize: 12, fontWeight: '500' },
    calories: { color: '#94A3B8', fontSize: 14, marginTop: 6 },
    emptyText: { color: '#94A3B8', textAlign: 'center', marginTop: 50, fontSize: 16 },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 64,
        height: 64,
        backgroundColor: '#3B82F6',
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 10,
    },
    fabText: { fontSize: 36, color: '#FFFFFF', lineHeight: 36 },
});

export default ExerciseListScreen;
