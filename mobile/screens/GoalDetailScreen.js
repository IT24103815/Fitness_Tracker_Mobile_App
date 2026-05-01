import React, { useState, useContext, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '../config/api';

const STATUS_COLORS = { active: '#3B82F6', completed: '#22C55E', paused: '#F59E0B', failed: '#EF4444' };

const GoalDetailScreen = ({ route, navigation }) => {
    const { goal: initialGoal } = route.params;
    const { user, token } = useContext(AuthContext);
    const [goal, setGoal] = useState(initialGoal);
    const [newCurrentValue, setNewCurrentValue] = useState('');
    const [updating, setUpdating] = useState(false);

    const isOwner = user?.role === 'client' && goal.client?.toString() === user._id.toString();
    const canModify = user?.role === 'admin' || user?.role === 'trainer' || isOwner;

    useFocusEffect(
        useCallback(() => {
            fetchGoal();
        }, [])
    );

    const fetchGoal = async () => {
        try {
            if (!token) {
                navigation.navigate('Login');
                return;
            }

            const res = await axios.get(`${API_URL}/progress/goals`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const updated = (res.data.goals || []).find(g => g._id === goal._id);
            if (updated) setGoal(updated);
        } catch (err) {
            console.error('Error fetching goal:', err.message);
        }
    };


    const handleUpdateProgress = async () => {
        if (!newCurrentValue || isNaN(newCurrentValue)) {
            Alert.alert('Error', 'Please enter a valid number');
            return;
        }
        setUpdating(true);
        try {
            if (!token) {
                navigation.navigate('Login');
                setUpdating(false);
                return;
            }

            const res = await axios.put(`${API_URL}/progress/goals/${goal._id}`, {
                currentValue: Number(newCurrentValue)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setGoal(res.data.goal);
                setNewCurrentValue('');
                Alert.alert('Updated!', `Progress updated to ${newCurrentValue} ${goal.targetUnit}`);
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to update progress');
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = () => {
        Alert.alert('Delete Goal', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: async () => {
                try {
                    if (!token) {
                        navigation.navigate('Login');
                        return;
                    }

                    await axios.delete(`${API_URL}/progress/goals/${goal._id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    navigation.goBack();
                } catch (err) {
                    Alert.alert('Error', 'Failed to delete goal');
                }
            }}
        ]);
    };


    // Progress calculation
    const range = (goal.targetValue || 0) - (goal.startValue || 0);
    const achieved = (goal.currentValue || 0) - (goal.startValue || 0);
    const progressPct = range !== 0 ? Math.min(100, Math.max(0, Math.round((achieved / range) * 100))) : 0;

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
            {/* Goal Header */}
            <View style={styles.header}>
                <Text style={styles.title}>{goal.title}</Text>
                <Text style={styles.type}>{goal.type?.replace('_', ' ')}</Text>
                <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[goal.status] || '#3B82F6') + '33' }]}>
                    <Text style={[styles.statusText, { color: STATUS_COLORS[goal.status] || '#3B82F6' }]}>
                        {goal.status || 'active'}
                    </Text>
                </View>
            </View>

            {/* Goal Info Card */}
            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Start</Text>
                        <Text style={styles.infoValue}>{goal.startValue || 0} {goal.targetUnit}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Current</Text>
                        <Text style={[styles.infoValue, { color: '#60A5FA' }]}>{goal.currentValue || 0} {goal.targetUnit}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Target</Text>
                        <Text style={[styles.infoValue, { color: '#22C55E' }]}>{goal.targetValue} {goal.targetUnit}</Text>
                    </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressSection}>
                    <View style={styles.progressLabelRow}>
                        <Text style={styles.progressLabel}>Goal Completion</Text>
                        <Text style={styles.progressPct}>{progressPct}%</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${progressPct}%`, backgroundColor: STATUS_COLORS[goal.status] || '#3B82F6' }]} />
                    </View>
                </View>

                {goal.deadline && (
                    <Text style={styles.deadline}>📅 Deadline: {new Date(goal.deadline).toLocaleDateString()}</Text>
                )}
            </View>

            {/* Manual Update Card (for Weight etc) */}
            {canModify && (
                <View style={styles.updateCard}>
                    <Text style={styles.updateTitle}>Update Metric</Text>
                    <View style={styles.updateRow}>
                        <TextInput
                            style={styles.updateInput}
                            placeholder={`New ${goal.targetUnit}`}
                            placeholderTextColor="#64748B"
                            keyboardType="numeric"
                            value={newCurrentValue}
                            onChangeText={setNewCurrentValue}
                        />
                        <TouchableOpacity
                            style={[styles.updateButton, updating && { opacity: 0.6 }]}
                            onPress={handleUpdateProgress}
                            disabled={updating}
                        >
                            <Text style={styles.updateButtonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Goal Journey section removed as requested. Tracker is now separate. */}

            {/* Actions */}
            {canModify && (
                <View style={styles.actionRow}>
                    <TouchableOpacity 
                        style={styles.editButton} 
                        onPress={() => navigation.navigate('EditGoal', { goal })}
                    >
                        <Text style={styles.actionButtonText}>Edit Goal</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.deleteButton} 
                        onPress={handleDelete}
                    >
                        <Text style={styles.actionButtonText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    header: { alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', textAlign: 'center' },
    type: { color: '#60A5FA', fontSize: 16, marginTop: 4, textTransform: 'capitalize' },
    statusBadge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, marginTop: 10 },
    statusText: { fontWeight: '700', textTransform: 'capitalize', fontSize: 13 },

    infoCard: { backgroundColor: '#1E2937', borderRadius: 20, padding: 20, marginBottom: 16 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    infoItem: { alignItems: 'center', flex: 1 },
    infoLabel: { color: '#94A3B8', fontSize: 12, marginBottom: 4 },
    infoValue: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
    progressSection: { marginBottom: 12 },
    progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    progressLabel: { color: '#94A3B8', fontSize: 13 },
    progressPct: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
    progressBarBg: { height: 10, backgroundColor: '#334155', borderRadius: 5, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 5 },
    deadline: { color: '#94A3B8', fontSize: 13, marginTop: 8 },

    updateCard: { backgroundColor: '#1E2937', borderRadius: 20, padding: 20, marginBottom: 20 },
    updateTitle: { fontSize: 17, fontWeight: '700', color: '#FFFFFF', marginBottom: 10 },
    updateRow: { flexDirection: 'row', gap: 12 },
    updateInput: {
        flex: 1, backgroundColor: '#0F172A', color: '#FFFFFF',
        borderRadius: 12, padding: 14, fontSize: 17,
        borderWidth: 1, borderColor: '#334155',
    },
    updateButton: {
        backgroundColor: '#3B82F6', paddingHorizontal: 20,
        borderRadius: 12, justifyContent: 'center',
    },
    updateButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },

    sectionTitle: { fontSize: 17, fontWeight: '700', color: '#FFFFFF', marginBottom: 6, marginTop: 4 },
    heatmapHint: { color: '#64748B', fontSize: 12, marginBottom: 12 },
    heatmap: {
        flexDirection: 'row', flexWrap: 'wrap', gap: 8,
        backgroundColor: '#1E2937', borderRadius: 16, padding: 16, marginBottom: 24,
    },
    heatmapDay: {
        width: 38, height: 38, backgroundColor: '#334155',
        borderRadius: 10, alignItems: 'center', justifyContent: 'center',
    },
    heatmapDayActive: { backgroundColor: '#22C55E' },
    dayNumber: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

    noPlanBox: { padding: 30, backgroundColor: '#1E2937', borderRadius: 20, alignItems: 'center', marginBottom: 20 },
    noPlanText: { color: '#94A3B8', textAlign: 'center' },

    actionRow: { flexDirection: 'row', gap: 12, marginTop: 10, marginBottom: 20 },
    editButton: { flex: 2, backgroundColor: '#3B82F6', padding: 18, borderRadius: 16, alignItems: 'center' },
    deleteButton: { flex: 1, backgroundColor: '#EF4444', padding: 18, borderRadius: 16, alignItems: 'center' },
    actionButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});

export default GoalDetailScreen;