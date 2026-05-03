import React, { useState, useCallback, useContext } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';

import { API_URL } from '../config';

const ProgressDashboardScreen = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [dashboard, setDashboard] = useState(null);

    const fetchDashboard = async () => {
        try {
            const res = await axios.get(`${API_URL}/progress/dashboard`);
            setDashboard(res.data);
        } catch (err) {
            Alert.alert('Error', 'Failed to load dashboard');
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchDashboard();
        }, [])
    );

    if (!dashboard) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loading}>Loading your fitness journey...</Text>
            </View>
        );
    }

    const { user: profile, goals } = dashboard;

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            {/* Character Header */}
            <View style={styles.characterCard}>
                <Text style={styles.level}>Level {profile.level}</Text>
                <Text style={styles.title}>{profile.title}</Text>
                <Text style={styles.xp}>
                    XP: {profile.xp} / {profile.level * 500}
                </Text>
            </View>

            {/* Stat Board */}
            <View style={styles.statsContainer}>
                {Object.entries(profile.stats).map(([key, value]) => (
                    <View key={key} style={styles.statCard}>
                        <Text style={styles.statName}>
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Text>
                        <Text style={styles.statValue}>{value}</Text>
                    </View>
                ))}
            </View>

            {/* Streak */}
            <View style={styles.streakCard}>
                <Text style={styles.streak}>
                    🔥 Current Streak: {profile.currentStreak} days
                </Text>
                <Text style={styles.streak}>
                    🏆 Longest Streak: {profile.longestStreak} days
                </Text>
            </View>

            <Text style={styles.sectionTitle}>Active Goals</Text>

            {goals && goals.length > 0 ? (
                goals.map((goal) => (
                    <View key={goal._id} style={styles.goalCard}>
                        <Text style={styles.goalTitle}>{goal.title}</Text>
                        <Text style={styles.goalDetail}>
                            {goal.type.replace('_', ' ')} • Due:{' '}
                            {goal.deadline
                                ? new Date(goal.deadline).toLocaleDateString()
                                : 'No deadline'}
                        </Text>
                    </View>
                ))
            ) : (
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyText}>No active goals yet</Text>
                </View>
            )}

            <TouchableOpacity
                style={styles.button}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('GoalList')}
            >
                <Text style={styles.buttonText}>Manage Goals</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
        padding: 16,
    },

    // This fixes the issue where Android bottom navigation blocks the button
    scrollContent: {
        paddingBottom: 140,
    },

    loadingContainer: {
        flex: 1,
        backgroundColor: '#0F172A',
        justifyContent: 'center',
        alignItems: 'center',
    },

    loading: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontSize: 18,
    },

    characterCard: {
        backgroundColor: '#1E2937',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 20,
    },

    level: {
        fontSize: 48,
        fontWeight: '900',
        color: '#60A5FA',
    },

    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        marginVertical: 8,
    },

    xp: {
        color: '#94A3B8',
    },

    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
    },

    statCard: {
        backgroundColor: '#1E2937',
        borderRadius: 16,
        padding: 16,
        width: '48%',
        alignItems: 'center',
    },

    statName: {
        color: '#94A3B8',
        fontSize: 14,
        textTransform: 'capitalize',
        textAlign: 'center',
    },

    statValue: {
        fontSize: 32,
        fontWeight: '700',
        color: '#60A5FA',
    },

    streakCard: {
        backgroundColor: '#1E2937',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },

    streak: {
        color: '#FFFFFF',
        fontSize: 18,
        marginBottom: 8,
    },

    sectionTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: '#FFFFFF',
        marginVertical: 16,
    },

    goalCard: {
        backgroundColor: '#1E2937',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },

    goalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    goalDetail: {
        color: '#60A5FA',
        marginTop: 6,
    },

    emptyCard: {
        backgroundColor: '#1E2937',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
    },

    emptyText: {
        color: '#94A3B8',
        fontSize: 16,
    },

    button: {
        backgroundColor: '#3B82F6',
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },

    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default ProgressDashboardScreen;