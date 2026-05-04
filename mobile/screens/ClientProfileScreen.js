import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { API_URL } from '../config';

const ClientProfileScreen = ({ route, navigation }) => {
    const { clientId } = route.params;
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchClientData = async () => {
        setLoading(true);
        try {
            // We can reuse the analytics endpoint or a specific user endpoint
            // For now, let's get the client's basic info from the trainers' my-clients list
            const res = await axios.get(`${API_URL}/trainers/my-clients`);
            const found = res.data.clients.find(c => c._id === clientId);
            if (found) {
                setClient(found);
            }
        } catch (err) {
            console.log('Error fetching client profile:', err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClientData();
    }, [clientId]);

    if (loading) return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color="#60A5FA" />
        </View>
    );

    if (!client) return (
        <View style={styles.center}>
            <Text style={{color: '#fff'}}>Client not found.</Text>
        </View>
    );

    const stats = client.stats || {};
    const statConfig = [
        { key: 'strength', label: '💪 Strength', color: '#EF4444' },
        { key: 'endurance', label: '🫀 Endurance', color: '#F59E0B' },
        { key: 'stamina', label: '⚡ Stamina', color: '#10B981' },
        { key: 'flexibility', label: '🤸 Flexibility', color: '#3B82F6' },
        { key: 'explosivePower', label: '🔥 Power', color: '#8B5CF6' },
        { key: 'coreStability', label: '🎯 Core', color: '#EC4899' },
    ];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatarPlaceholder}>
                    <Text style={{fontSize: 50}}>👤</Text>
                </View>
                <Text style={styles.name}>{client.name}</Text>
                <Text style={styles.email}>{client.email}</Text>
                <View style={styles.idBadge}>
                    <Text style={styles.idText}>{client.clientId}</Text>
                </View>
            </View>

            <View style={styles.statsCard}>
                <Text style={styles.sectionTitle}>Fitness Attributes</Text>
                <View style={styles.statGrid}>
                    {statConfig.map(s => (
                        <View key={s.key} style={[styles.statChip, { borderColor: s.color }]}>
                            <Text style={[styles.statValue, { color: s.color }]}>{stats[s.key] || 0}</Text>
                            <Text style={styles.statLabel}>{s.label}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.divider} />

                <View style={styles.overallRow}>
                    <Text style={styles.overallLabel}>Overall Score</Text>
                    <Text style={styles.overallValue}>{stats.overallScore || 0}</Text>
                </View>

                <TouchableOpacity 
                    style={styles.analyticsBtn}
                    onPress={() => navigation.navigate('ProgressAnalytics', { clientId, clientName: client.name })}
                >
                    <Text style={styles.analyticsBtnText}>📊 View Weekly Weight Analytics</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.sectionTitle}>Client Info</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Level</Text>
                    <Text style={styles.infoValue}>{client.level}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Total XP</Text>
                    <Text style={styles.infoValue}>{client.xp}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Current Streak</Text>
                    <Text style={styles.infoValue}>{client.currentStreak} days</Text>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A', padding: 20 },
    center: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
    header: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
    avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#1E2937', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#3B82F6' },
    name: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 15 },
    email: { color: '#94A3B8', fontSize: 14, marginTop: 5 },
    idBadge: { backgroundColor: '#334155', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginTop: 10 },
    idText: { color: '#60A5FA', fontSize: 12, fontWeight: 'bold' },
    statsCard: { backgroundColor: '#1E2937', borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#334155' },
    sectionTitle: { color: '#60A5FA', fontSize: 16, fontWeight: 'bold', marginBottom: 20, textTransform: 'uppercase' },
    statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    statChip: { width: '30%', flexGrow: 1, backgroundColor: '#0F172A', borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1 },
    statValue: { fontSize: 22, fontWeight: '900' },
    statLabel: { color: '#94A3B8', fontSize: 10, marginTop: 4 },
    divider: { height: 1, backgroundColor: '#334155', marginVertical: 20 },
    overallRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    overallLabel: { color: '#fff', fontSize: 16, fontWeight: '600' },
    overallValue: { color: '#60A5FA', fontSize: 24, fontWeight: '900' },
    analyticsBtn: { backgroundColor: '#3B82F6', padding: 18, borderRadius: 16, alignItems: 'center' },
    analyticsBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
    infoCard: { backgroundColor: '#1E2937', borderRadius: 24, padding: 20, marginBottom: 40, borderWidth: 1, borderColor: '#334155' },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#334155' },
    infoLabel: { color: '#94A3B8', fontSize: 14 },
    infoValue: { color: '#fff', fontSize: 14, fontWeight: '600' }
});

export default ClientProfileScreen;
