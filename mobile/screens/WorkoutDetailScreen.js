import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';

import { API_URL } from '../config';

const WorkoutDetailScreen = ({ route, navigation }) => {
    const { plan } = route.params;
    const { user } = useContext(AuthContext);

    const [currentPlan, setCurrentPlan] = useState(plan);

    const isClient = user?.role === 'client';
    const isManagement = user?.role === 'admin' || user?.role === 'trainer';

    // Use the ORIGINAL route param `plan` (not reactive `currentPlan`) so this
    // never flips when state refreshes after API calls (client field format varies).
    const originalClientId = plan.client?._id ?? plan.client;
    const isOwnPlan = !plan.isTemplate && originalClientId?.toString() === user?._id?.toString();
    const canEdit = isManagement || isOwnPlan;

    const isTemplate = currentPlan.isTemplate;

    const fetchPlan = async () => {
        try {
            const res = await axios.get(`${API_URL}/workouts/${currentPlan._id}`);
            setCurrentPlan(res.data.plan);
        } catch (err) {
            if (err.response?.status === 404) {
                navigation.goBack();
            } else {
                console.log('Error fetching plan:', err.message);
            }
        }
    };

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchPlan();
        });
        return unsubscribe;
    }, [navigation]);

    const handleClone = async () => {
        try {
            await axios.post(`${API_URL}/workouts/${currentPlan._id}/clone`);
            Alert.alert('Success', 'Plan saved to your workouts!', [
                { text: 'OK', onPress: () => navigation.navigate('WorkoutList') }
            ]);
        } catch (err) {
            Alert.alert('Error', 'Failed to save plan');
        }
    };

    const handleDelete = () => {
        Alert.alert('Delete Plan', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await axios.delete(`${API_URL}/workouts/${currentPlan._id}`);
                        navigation.goBack();
                    } catch (err) {
                        Alert.alert('Error', 'Failed to delete plan');
                    }
                }
            }
        ]);
    };

    const handleRemoveExercise = async (weekIndex, dayIndex, exIndex) => {
        Alert.alert('Remove Exercise', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const updatedWeeks = JSON.parse(JSON.stringify(currentPlan.weeks));
                        updatedWeeks[weekIndex].days[dayIndex].exercises.splice(exIndex, 1);
                        await axios.put(`${API_URL}/workouts/${currentPlan._id}`, { weeks: updatedWeeks });
                        fetchPlan();
                    } catch (err) {
                        Alert.alert('Error', 'Failed to remove exercise');
                    }
                }
            }
        ]);
    };

    const canDelete =
        user?.role === 'admin' ||
        user?.role === 'trainer' ||
        (!currentPlan.isTemplate && currentPlan.client?.toString() === user._id.toString());

    const handleMarkCompleted = async (weekIndex, dayIndex) => {
        const isAlreadyDone = currentPlan.weeks[weekIndex].days[dayIndex].completed;

        const doToggle = async () => {
            try {
                const res = await axios.post(`${API_URL}/workouts/${currentPlan._id}/toggle-day`, {
                    weekIndex,
                    dayIndex
                });
                if (res.data.success) {
                    const freshPlan = JSON.parse(JSON.stringify(res.data.plan));
                    setCurrentPlan(freshPlan);
                    if (freshPlan.weeks[weekIndex].days[dayIndex].completed) {
                        Alert.alert('🏆 Session Complete!', '+50 XP earned! Keep it up!');
                    }
                }
            } catch (err) {
                Alert.alert('Error', err.response?.data?.message || 'Failed to update progress');
            }
        };

        if (isAlreadyDone) {
            if (user.role === 'client') {
                Alert.alert('Session Complete', 'This session is already marked as complete. Great job!');
                return;
            }

            Alert.alert(
                'Undo Completion? (Admin/Trainer Only)',
                'This will remove the XP earned. Are you sure?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Undo', style: 'destructive', onPress: doToggle }
                ]
            );
        } else {
            doToggle();
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.headerCard}>
                <Text style={styles.title}>{currentPlan.title}</Text>
                <View style={styles.tagsContainer}>
                    {(Array.isArray(currentPlan.goalType) ? currentPlan.goalType : [currentPlan.goalType]).map((g, i) => (
                        <View key={i} style={styles.tagBadge}>
                            <Text style={styles.tagBadgeText}>{g.replace('_', ' ')}</Text>
                        </View>
                    ))}
                </View>
                <Text style={styles.progress}>Progress: {currentPlan.completionPercentage}%</Text>
            </View>

            {currentPlan.weeks.map((week, weekIndex) => (
                <View key={weekIndex} style={styles.weekCard}>
                    <Text style={styles.weekTitle}>Week {week.weekNumber}</Text>

                    {week.days.map((day, dayIndex) => (
                        <View key={dayIndex} style={styles.dayCard}>
                            <View style={styles.dayHeader}>
                                <Text style={styles.dayName}>{day.day}</Text>
                                {/* Hide + Add only for days already marked complete */}
                                {canEdit && !day.completed && (
                                    <TouchableOpacity 
                                        style={styles.addExerciseDayBtn} 
                                        onPress={() => navigation.navigate('AddExerciseToWorkout', { plan: currentPlan, weekIndex, dayName: day.day })}
                                    >
                                        <Text style={styles.addExerciseDayText}>+ Add</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {day.exercises && day.exercises.length > 0 ? (
                                day.exercises.map((ex, exIndex) => (
                                    <View key={exIndex} style={styles.exerciseRow}>
                                        <View style={styles.exerciseInfoWrapper}>
                                            <Text style={styles.exerciseName}>{ex.exercise?.name || 'Unknown'}</Text>
                                            <Text style={styles.setsReps}>{ex.sets} sets × {ex.reps}</Text>
                                        </View>
                                        {canEdit && (
                                            <TouchableOpacity onPress={() => handleRemoveExercise(weekIndex, dayIndex, exIndex)}>
                                                <Text style={styles.removeExerciseText}>✕</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.noExercises}>No exercises added yet</Text>
                            )}

                            {!isTemplate && (
                                <>
                                    <TouchableOpacity
                                        style={[
                                            styles.completeButton,
                                            day.completed
                                                ? { backgroundColor: '#F59E0B' }
                                                : { backgroundColor: '#22C55E' }
                                        ]}
                                        onPress={() => handleMarkCompleted(weekIndex, dayIndex)}
                                    >
                                        <Text style={styles.completeText}>
                                            {day.completed ? '✓ Completed' : 'Mark Day Complete'}
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    ))}
                </View>
            ))}

            {isTemplate && !canEdit && (
                <TouchableOpacity
                    style={[styles.editButton, { backgroundColor: '#10B981' }]}
                    onPress={handleClone}
                >
                    <Text style={styles.editButtonText}>Save to My Workouts</Text>
                </TouchableOpacity>
            )}

            {/* Always show Edit for clients on their own saved plan, and always for management */}
            {(!isTemplate && (isManagement || currentPlan.client?.toString() === user?._id?.toString())) && (
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => navigation.navigate('EditWorkout', { plan: currentPlan })}
                >
                    <Text style={styles.editButtonText}>Edit This Plan</Text>
                </TouchableOpacity>
            )}
            
            {canDelete && (
                <TouchableOpacity
                    style={[styles.editButton, { backgroundColor: '#EF4444', marginTop: 10 }]}
                    onPress={handleDelete}
                >
                    <Text style={styles.editButtonText}>Delete Plan</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A', padding: 16 },
    headerCard: {
        backgroundColor: '#1E2937',
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        alignItems: 'center',
    },
    title: { fontSize: 26, fontWeight: '700', color: '#FFFFFF', textAlign: 'center' },
    tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8, justifyContent: 'center' },
    tagBadge: { backgroundColor: '#334155', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    tagBadgeText: { color: '#60A5FA', fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
    progress: { color: '#94A3B8', marginTop: 12 },
    weekCard: { marginBottom: 20 },
    weekTitle: { fontSize: 20, fontWeight: '600', color: '#FFFFFF', marginBottom: 12 },
    dayCard: {
        backgroundColor: '#1E2937',
        borderRadius: 16,
        padding: 18,
        marginBottom: 12,
    },
    dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    dayName: { fontSize: 18, fontWeight: '600', color: '#60A5FA' },
    addExerciseDayBtn: { backgroundColor: '#334155', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    addExerciseDayText: { color: '#60A5FA', fontSize: 14, fontWeight: 'bold' },
    exerciseRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
    },
    exerciseInfoWrapper: { flex: 1 },
    exerciseName: { color: '#FFFFFF', fontSize: 16, fontWeight: '500' },
    setsReps: { color: '#94A3B8', fontSize: 14, marginTop: 4 },
    removeExerciseText: { color: '#EF4444', fontSize: 18, paddingLeft: 10, fontWeight: 'bold' },
    noExercises: { color: '#64748B', fontStyle: 'italic', textAlign: 'center', padding: 10 },
    completeButton: {
        backgroundColor: '#22C55E',
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 12,
        alignItems: 'center',
    },
    completeText: { color: '#FFFFFF', fontWeight: '600' },
    editButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 18,
        borderRadius: 16,
        marginTop: 20,
        marginBottom: 40,
    },
    editButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600', textAlign: 'center' },
    alreadyMarkedText: { color: '#F59E0B', fontSize: 12, textAlign: 'center', marginTop: 8, fontWeight: '600' }
});

export default WorkoutDetailScreen;
