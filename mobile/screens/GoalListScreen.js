import React, { useState, useCallback, useContext } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '../config/api';

const STATUS_COLORS = { active: '#3B82F6', completed: '#22C55E', paused: '#F59E0B', failed: '#EF4444' };
const PRIORITY_COLORS = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' };
const TYPE_ICONS = { weight_loss: '⚖️', muscle_gain: '💪', strength: '🏋️', endurance: '🫀', consistency: '📆', flexibility: '🤸' };

const GoalListScreen = ({ navigation }) => {
    const { user, token } = useContext(AuthContext);
    const [goals, setGoals] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchGoals = async () => {
        try {
            if (!token) {
                navigation.navigate('Login');
                return;
            }

            const res = await axios.get(`${API_URL}/progress/goals`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGoals(res.data.goals || []);
        } catch (err) {
            Alert.alert('Error', 'Failed to load goals');
        }
    };

    useFocusEffect(useCallback(() => { fetchGoals(); }, []));

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchGoals();
        setRefreshing(false);
    };

    const handleDelete = (id) => {
        Alert.alert('Delete Goal', 'Are you sure you want to delete this goal?', [
            { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: async () => {
                try {
                    if (!token) {
                        navigation.navigate('Login');
                        return;
                    }

                    await axios.delete(`${API_URL}/progress/goals/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    fetchGoals();
                } catch {
                    Alert.alert('Error', 'Failed to delete goal');
                }
            }}
        ]);
    };

    const renderGoal = ({ item }) => {
        const range = (item.targetValue || 0) - (item.startValue || 0);
        const achieved = (item.currentValue || 0) - (item.startValue || 0);
        let progress = 0;
        if (range !== 0) {
            progress = Math.min(100, Math.max(0, Math.round((achieved / range) * 100)));
        }

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('GoalDetail', { goal: item })}
                activeOpacity={0.8}
            >
                {/* Header Row */}
                <View style={styles.cardHeader}>
                    <Text style={styles.cardIcon}>{TYPE_ICONS[item.type] || '🎯'}</Text>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.cardType}>{item.type?.replace('_', ' ')}</Text>
                    </View>
                    <View style={[styles.priorityBadge, { backgroundColor: PRIORITY_COLORS[item.priority] + '33', borderColor: PRIORITY_COLORS[item.priority] }]}>
                        <Text style={[styles.priorityText, { color: PRIORITY_COLORS[item.priority] }]}>{item.priority}</Text>
                    </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressSection}>
                    <View style={styles.progressLabelRow}>
                        <Text style={styles.progressValues}>
                            {item.currentValue || item.startValue || 0} → {item.targetValue} {item.targetUnit}
                        </Text>
                        <Text style={styles.progressPct}>{progress}%</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: STATUS_COLORS[item.status] }]} />
                    </View>
                </View>

                {/* Footer Row */}
                <View style={styles.cardFooter}>
                    <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '22' }]}>
                        <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>{item.status}</Text>
                    </View>
                    {item.deadline && (
                        <Text style={styles.deadline}>📅 {new Date(item.deadline).toLocaleDateString()}</Text>
                    )}
                    <TouchableOpacity onPress={() => handleDelete(item._id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Text style={styles.deleteIcon}>🗑️</Text>
                    </TouchableOpacity>
                </View>

                {item.description ? (
                    <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                ) : null}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <Text style={styles.header}>My Goals</Text>
                <Text style={styles.count}>{goals.length} active</Text>
            </View>

            <FlatList
                data={goals}
                keyExtractor={item => item._id}
                renderItem={renderGoal}
                contentContainerStyle={{ paddingBottom: 120 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>🎯</Text>
                        <Text style={styles.emptyTitle}>No goals yet</Text>
                        <Text style={styles.emptySubtitle}>Set your first goal and start your transformation.</Text>
                    </View>
                }
            />

            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateGoal')}>
                <Text style={styles.fabText}>＋</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    topBar: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', padding: 20, paddingBottom: 12 },
    header: { fontSize: 30, fontWeight: '800', color: '#FFFFFF' },
    count: { fontSize: 14, color: '#64748B' },

    card: {
        backgroundColor: '#1E2937',
        borderRadius: 20,
        padding: 18,
        marginHorizontal: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#334155',
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    cardIcon: { fontSize: 26, marginRight: 12 },
    cardTitle: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
    cardType: { fontSize: 13, color: '#60A5FA', marginTop: 2, textTransform: 'capitalize' },
    priorityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
    priorityText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },

    progressSection: { marginBottom: 12 },
    progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    progressValues: { fontSize: 13, color: '#94A3B8' },
    progressPct: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
    progressBarBg: { height: 8, backgroundColor: '#334155', borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 4 },

    cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    statusText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
    deadline: { fontSize: 12, color: '#64748B', flex: 1 },
    deleteIcon: { fontSize: 18 },

    description: { color: '#64748B', fontSize: 13, marginTop: 10, fontStyle: 'italic' },

    emptyContainer: { alignItems: 'center', marginTop: 120 },
    emptyIcon: { fontSize: 60, marginBottom: 16 },
    emptyTitle: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
    emptySubtitle: { fontSize: 15, color: '#64748B', textAlign: 'center', paddingHorizontal: 40 },

    fab: {
        position: 'absolute', bottom: 28, right: 24,
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center',
        shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4, shadowRadius: 10, elevation: 8,
    },
    fabText: { fontSize: 30, color: '#FFFFFF', lineHeight: 34 },
});

export default GoalListScreen;