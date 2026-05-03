import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';

import { API_URL } from '../config';

const ChallengeListScreen = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [challenges, setChallenges] = useState([]);

    const canManage = user?.role === 'admin' || user?.role === 'trainer';

    const fetchChallenges = async () => {
        try {
            const res = await axios.get(`${API_URL}/challenges`);
            setChallenges(res.data.challenges || []);
        } catch (err) {
            Alert.alert('Error', 'Failed to load challenges');
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchChallenges();
        });
        return unsubscribe;
    }, [navigation]);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Fitness Challenges</Text>
            <Text style={styles.subheader}>Tap to view details and rewards</Text>

            <FlatList
                data={challenges}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                    <TouchableOpacity 
                        style={styles.card} 
                        onPress={() => navigation.navigate('ChallengeDetail', { challenge: item })}
                    >
                        <Text style={styles.title}>{item.title}</Text>
                        <View style={styles.categoryRow}>
                          {(item.category || []).map(cat => (
                            <View key={cat} style={styles.catBadge}>
                              <Text style={styles.catText}>{cat}</Text>
                            </View>
                          ))}
                        </View>
                        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                        <Text style={styles.detail}>
                            Difficulty: {item.difficulty}
                        </Text>
                        <View style={styles.arrowContainer}>
                            <Text style={styles.arrowText}>View Details →</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />

            {canManage && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => navigation.navigate('CreateChallenge')}
                >
                    <Text style={styles.fabText}>+</Text>
                </TouchableOpacity>
            )}
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
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#334155',
    },
    title: { fontSize: 20, fontWeight: '600', color: '#FFFFFF' },
    description: { color: '#CBD5E1', marginTop: 10, fontSize: 14, lineHeight: 20 },
    categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
    catBadge: { backgroundColor: '#334155', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#475569' },
    catText: { color: '#60A5FA', fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
    detail: { color: '#94A3B8', marginTop: 12, fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
    arrowContainer: { marginTop: 12, alignItems: 'flex-end' },
    arrowText: { color: '#3B82F6', fontWeight: 'bold' },
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
        elevation: 8,
    },
    fabText: { fontSize: 36, color: '#fff' }
});

export default ChallengeListScreen;
