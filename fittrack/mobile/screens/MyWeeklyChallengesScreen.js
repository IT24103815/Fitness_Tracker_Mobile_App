import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';

import { API_URL } from '../config';

const MyWeeklyChallengesScreen = () => {
    const { user } = useContext(AuthContext);
    const [weeklyChallenges, setWeeklyChallenges] = useState([]);

    const fetchWeeklyChallenges = async () => {
        try {
            const res = await axios.get(`${API_URL}/challenges/my-weekly`);
            setWeeklyChallenges(res.data.weeklyChallenges || []);
        } catch (err) {
            Alert.alert('Error', 'Failed to load weekly challenges');
        }
    };

    useEffect(() => {
        fetchWeeklyChallenges();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            await axios.patch(`${API_URL}/challenges/${id}/status`, { status });
            Alert.alert('Success', `Challenge ${status}`);
            fetchWeeklyChallenges();
        } catch (err) {
            Alert.alert('Error', 'Failed to update challenge');
        }
    };

    const completeChallenge = async (id) => {
        try {
            const res = await axios.post(`${API_URL}/challenges/${id}/complete`);
            Alert.alert('Congratulations!', 'Challenge completed! Rewards applied.');
            fetchWeeklyChallenges();
        } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to complete challenge');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>This Week's Challenges</Text>
            <Text style={styles.subheader}>Prove your progress • Earn big rewards</Text>

            <FlatList
                data={weeklyChallenges}
                keyExtractor={item => item._id}
                renderItem={({ item }) => {
                    const ch = item.challenge;
                    return (
                        <View style={styles.card}>
                            <Text style={styles.title}>{ch.title}</Text>
                            <View style={styles.categoryRow}>
                                {(ch.category || []).map(cat => (
                                    <View key={cat} style={styles.catBadge}>
                                        <Text style={styles.catText}>{cat}</Text>
                                    </View>
                                ))}
                            </View>
                            <Text style={styles.description}>{ch.description}</Text>
                            
                            <View style={styles.taskContainer}>
                                {ch.tasks?.map((t, i) => (
                                    <Text key={i} style={styles.taskText}>• {t.exercise?.name || 'Unknown'}: {t.sets}x{t.reps}</Text>
                                ))}
                            </View>

                            <View style={styles.rewardSection}>
                                <Text style={styles.rewardHeader}>Expected Gains:</Text>
                                <Text style={styles.rewardMain}>🏆 +{ch.rewardXP} Experience (XP)</Text>
                                {Object.entries(ch.rewardStats || {}).map(([stat, val]) => val > 0 && (
                                    <Text key={stat} style={styles.rewardSub}>⚡ +{val} {stat.replace(/([A-Z])/g, ' $1')} Attribute</Text>
                                ))}
                            </View>

                            {item.status === 'pending' && (
                                <View style={styles.buttonRow}>
                                    <TouchableOpacity
                                        style={styles.rejectButton}
                                        onPress={() => updateStatus(item._id, 'rejected')}
                                    >
                                        <Text style={styles.rejectText}>Reject</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.acceptButton}
                                        onPress={() => updateStatus(item._id, 'accepted')}
                                    >
                                        <Text style={styles.acceptText}>Accept Challenge</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {item.status === 'accepted' && (
                                <TouchableOpacity
                                    style={styles.completeButton}
                                    onPress={() => completeChallenge(item._id)}
                                >
                                    <Text style={styles.completeText}>Mark as Completed</Text>
                                </TouchableOpacity>
                            )}

                            {item.status === 'completed' && (
                                <Text style={styles.completedText}>✅ Completed - Rewards Given</Text>
                            )}
                        </View>
                    );
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A', padding: 16 },
    header: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
    subheader: { color: '#60A5FA', marginBottom: 20 },
    card: {
        backgroundColor: '#1E2937',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
    },
    title: { fontSize: 20, fontWeight: '600', color: '#FFFFFF' },
    description: { color: '#CBD5E1', marginTop: 8, lineHeight: 22 },
    categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
    catBadge: { backgroundColor: '#334155', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#475569' },
    catText: { color: '#60A5FA', fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
    rewardSection: { marginTop: 15, padding: 16, backgroundColor: '#0F172A', borderRadius: 16, borderWidth: 1, borderColor: '#10B981' },
    rewardHeader: { color: '#10B981', fontWeight: 'bold', fontSize: 14, marginBottom: 8 },
    rewardMain: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginBottom: 4 },
    rewardSub: { color: '#60A5FA', fontSize: 13, fontWeight: '600' },
    taskContainer: { marginTop: 12, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: '#3B82F6', marginBottom: 5 },
    taskText: { color: '#E2E8F0', fontSize: 13, marginVertical: 2 },
    buttonRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
    acceptButton: {
        flex: 1,
        backgroundColor: '#3B82F6',
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    rejectButton: {
        flex: 1,
        backgroundColor: '#EF4444',
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    acceptText: { color: '#FFFFFF', fontWeight: '600' },
    rejectText: { color: '#FFFFFF', fontWeight: '600' },
    completeButton: {
        backgroundColor: '#22C55E',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
    },
    completeText: { color: '#FFFFFF', fontWeight: '600' },
    completedText: { color: '#22C55E', fontWeight: '600', textAlign: 'center', marginTop: 12 },
});

export default MyWeeklyChallengesScreen;
