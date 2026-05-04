import React, { useState, useContext, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';

import { API_URL } from '../config';

const ChallengeDetailScreen = ({ route, navigation }) => {
    const { challenge: initialChallenge } = route.params;
    const { user } = useContext(AuthContext);
    const [challenge, setChallenge] = useState(initialChallenge);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    const isAuthorized = user?.role === 'admin' || user?.role === 'trainer';
    const isClient = user?.role === 'client';

    const fetchChallengeData = async () => {
        setFetching(true);
        try {
            const res = await axios.get(`${API_URL}/challenges/${initialChallenge._id}`);
            if (res.data.success) {
                setChallenge(res.data.challenge);
            }
        } catch (err) {
            console.log('Error refetching challenge:', err.message);
        } finally {
            setFetching(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchChallengeData();
        }, [])
    );

    const handleAccept = async () => {
        setLoading(true);
        try {
            await axios.post(`${API_URL}/challenges/accept-template/${challenge._id}`);
            Alert.alert('Success', 'Challenge added to your weekly profile!', [
                { text: 'View My Challenges', onPress: () => navigation.navigate('MyWeeklyChallenges') },
                { text: 'Stay Here' }
            ]);
        } catch (err) {
            Alert.alert('Info', err.response?.data?.message || 'Failed to add challenge');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert('Delete Challenge', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await axios.delete(`${API_URL}/challenges/${challenge._id}`);
                        navigation.goBack();
                    } catch (err) {
                        Alert.alert('Error', 'Failed to delete');
                    }
                }
            }
        ]);
    };

    if (!challenge && fetching) {
        return <View style={styles.center}><ActivityIndicator color="#3B82F6" size="large"/></View>;
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.headerCard}>
                <Text style={styles.title}>{challenge.title}</Text>
                <View style={styles.categoryRow}>
                    {challenge.category?.map(cat => (
                        <View key={cat} style={styles.catBadge}>
                            <Text style={styles.catText}>{cat}</Text>
                        </View>
                    ))}
                </View>
                <Text style={styles.difficulty}>Difficulty: {challenge.difficulty}</Text>
                <Text style={styles.description}>{challenge.description}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Exercises</Text>
                {challenge.tasks?.map((task, index) => (
                    <View key={index} style={styles.exerciseCard}>
                        <Text style={styles.exerciseName}>{task.exercise?.name || 'Unknown Exercise'}</Text>
                        <Text style={styles.exerciseDetail}>{task.sets} Sets × {task.reps} Reps</Text>
                        <Text style={styles.exerciseSub}>{task.exercise?.category} • {task.exercise?.difficulty}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Rewards</Text>
                <View style={styles.rewardCard}>
                    <Text style={styles.rewardHeader}>Completion Gains:</Text>
                    <Text style={styles.rewardItem}>🏆 +{challenge.rewardXP} XP</Text>
                    {Object.entries(challenge.rewardStats || {}).map(([stat, val]) => val > 0 && (
                        <Text key={stat} style={styles.rewardItem}>
                           ⚡ +{val} {stat.replace(/([A-Z])/g, ' $1')}
                        </Text>
                    ))}
                </View>
            </View>

            <View style={styles.footer}>
                {isAuthorized && (
                    <View style={styles.adminButtons}>
                        <TouchableOpacity 
                            style={styles.editBtn} 
                            onPress={() => navigation.navigate('EditChallenge', { challenge })}
                        >
                            <Text style={styles.btnText}>Edit Challenge</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                            <Text style={styles.btnText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {isClient && (
                    <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.btnText}>Add to My Profile</Text>}
                    </TouchableOpacity>
                )}
            </View>
            <View style={{height: 40}} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    center: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
    headerCard: { padding: 20, backgroundColor: '#1E2937', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    title: { fontSize: 26, fontWeight: '700', color: '#FFFFFF', marginBottom: 12 },
    categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    catBadge: { backgroundColor: '#334155', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#475569' },
    catText: { color: '#60A5FA', fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
    difficulty: { color: '#94A3B8', fontSize: 14, fontWeight: '600', marginBottom: 10 },
    description: { color: '#CBD5E1', fontSize: 16, lineHeight: 24 },
    section: { padding: 20 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#60A5FA', marginBottom: 15 },
    exerciseCard: { backgroundColor: '#1E2937', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
    exerciseName: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
    exerciseDetail: { color: '#3B82F6', fontSize: 16, fontWeight: 'bold', marginTop: 4 },
    exerciseSub: { color: '#94A3B8', fontSize: 12, marginTop: 4, textTransform: 'capitalize' },
    rewardCard: { backgroundColor: '#0F172A', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#10B981' },
    rewardHeader: { color: '#10B981', fontWeight: 'bold', fontSize: 14, marginBottom: 12 },
    rewardItem: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginVertical: 4 },
    footer: { padding: 20 },
    adminButtons: { flexDirection: 'row', gap: 12 },
    editBtn: { flex: 2, backgroundColor: '#3B82F6', padding: 18, borderRadius: 15, alignItems: 'center' },
    deleteBtn: { flex: 1, backgroundColor: '#EF4444', padding: 18, borderRadius: 15, alignItems: 'center' },
    acceptBtn: { backgroundColor: '#10B981', padding: 18, borderRadius: 15, alignItems: 'center' },
    btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});

export default ChallengeDetailScreen;
