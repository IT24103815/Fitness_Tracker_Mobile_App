import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '../config';

const WorkoutListScreen = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [plans, setPlans] = useState([]);
    const [templates, setTemplates] = useState([]);
    const isManagement = user?.role === 'admin' || user?.role === 'trainer';
    const [activeTab, setActiveTab] = useState(isManagement ? 'templates' : 'my'); 

    const canManageOthers = isManagement;

    const fetchPlans = async () => {
        try {
            const [myRes, tplRes] = await Promise.all([
                axios.get(`${API_URL}/workouts/my`),
                axios.get(`${API_URL}/workouts/templates`)
            ]);
            setPlans(myRes.data.plans || []);
            setTemplates(tplRes.data.plans || []);
        } catch (err) {
            Alert.alert('Error', 'Failed to load plans');
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchPlans();
        });
        return unsubscribe;
    }, [navigation]);

    const renderExerciseSummary = (plan) => {
        let allExercises = [];
        if (plan.weeks) {
            plan.weeks.forEach(w => {
                if (w.days) {
                    w.days.forEach(d => {
                        if (d.exercises) {
                            d.exercises.forEach(ex => {
                                const name = ex.exercise?.name || 'Unknown';
                                allExercises.push(`${name} (${ex.sets}x${ex.reps})`);
                            });
                        }
                    });
                }
            });
        }

        const uniqueEx = [...new Set(allExercises)];

        if (uniqueEx.length === 0) return <Text style={styles.noExText}>No exercises added</Text>;

        const preview = uniqueEx.slice(0, 3);
        const hasMore = uniqueEx.length > 3;

        return (
            <View style={styles.exPreviewContainer}>
                {preview.map((txt, i) => (
                    <Text key={i} style={styles.exPreviewText}>• {txt}</Text>
                ))}
                {hasMore && <Text style={styles.exPreviewMore}>+ {uniqueEx.length - 3} more</Text>}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Workout Plans</Text>

            <View style={styles.tabContainer}>
                {!isManagement && (
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'my' && styles.tabActive]} 
                        onPress={() => setActiveTab('my')}
                    >
                        <Text style={[styles.tabText, activeTab === 'my' && styles.tabTextActive]}>My Plans</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'templates' && styles.tabActive]} 
                    onPress={() => setActiveTab('templates')}
                >
                    <Text style={[styles.tabText, activeTab === 'templates' && styles.tabTextActive]}>Trainer Templates</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={activeTab === 'my' ? plans : templates}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate('WorkoutDetail', { plan: item })}
                    >
                        <Text style={styles.title}>{item.title}</Text>
                        <View style={styles.tagsContainer}>
                            {(Array.isArray(item.goalType) ? item.goalType : [item.goalType]).map((g, i) => (
                                <View key={i} style={styles.tagBadge}>
                                    <Text style={styles.tagBadgeText}>{g.replace('_', ' ')}</Text>
                                </View>
                            ))}
                        </View>
                        <Text style={styles.progress}>Progress: {item.completionPercentage}%</Text>
                        <Text style={styles.createdBy}>
                            Created by: {item.createdBy?.name || 'You'}
                        </Text>
                        {renderExerciseSummary(item)}
                    </TouchableOpacity>
                )}
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('CreateWorkout')}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A', padding: 16 },
    header: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: 12 },
    tabContainer: { flexDirection: 'row', backgroundColor: '#1E2937', borderRadius: 12, padding: 4, marginBottom: 20 },
    tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
    tabActive: { backgroundColor: '#3B82F6' },
    tabText: { color: '#94A3B8', fontSize: 16, fontWeight: '600' },
    tabTextActive: { color: '#FFFFFF' },
    card: {
        backgroundColor: '#1E2937',
        borderRadius: 20,
        padding: 20,
        marginBottom: 12,
    },
    title: { fontSize: 20, fontWeight: '600', color: '#FFFFFF' },
    tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
    tagBadge: { backgroundColor: '#334155', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    tagBadgeText: { color: '#60A5FA', fontSize: 12, fontWeight: '500', textTransform: 'capitalize' },
    progress: { color: '#94A3B8', marginTop: 8 },
    createdBy: { color: '#64748B', fontSize: 14, marginTop: 4 },
    exPreviewContainer: { marginTop: 12, backgroundColor: '#0F172A', padding: 12, borderRadius: 10 },
    exPreviewText: { color: '#94A3B8', fontSize: 13, marginBottom: 4 },
    exPreviewMore: { color: '#60A5FA', fontSize: 13, marginTop: 4, fontWeight: '600' },
    noExText: { color: '#64748B', fontSize: 13, fontStyle: 'italic', marginTop: 12 },
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
    },
    fabText: { fontSize: 36, color: '#fff' }
});

export default WorkoutListScreen;
