import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator, Modal } from 'react-native';
import axios from 'axios';

import { API_URL } from '../config';

const MyClientsScreen = ({ navigation }) => {
    const [clients, setClients] = useState([]);
    const [availableClients, setAvailableClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [claiming, setClaiming] = useState(false);
    const [sortBy, setSortBy] = useState('name'); // 'name' or 'id'
    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [myClientsRes, availableRes] = await Promise.all([
                axios.get(`${API_URL}/trainers/my-clients`),
                axios.get(`${API_URL}/trainers/available-clients`)
            ]);
            setClients(myClientsRes.data.clients || []);
            setAvailableClients(availableRes.data.clients || []);
        } catch (err) {
            console.log('Failed to fetch clients:', err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleConnect = async () => {
        if (!selectedClient) {
            Alert.alert('Error', 'Please select a client from the list');
            return;
        }

        setClaiming(true);
        try {
            await axios.post(`${API_URL}/trainers/connect-client`, {
                _id: selectedClient._id
            });
            Alert.alert('Success', `${selectedClient.name} is now under your supervision!`);
            setModalVisible(false);
            setSelectedClient(null);
            fetchData();
        } catch (err) {
            Alert.alert('Failed', err.response?.data?.message || 'Could not connect client');
        } finally {
            setClaiming(false);
        }
    };

    const filteredAvailable = availableClients
        .filter(c => 
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (c.email && c.email.split('@')[0].toLowerCase().includes(searchQuery.toLowerCase())) ||
            c.clientId.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            return a.clientId.localeCompare(b.clientId);
        });

    const renderClientCard = ({ item }) => (
        <TouchableOpacity 
            style={styles.card} 
            onPress={() => navigation.navigate('ClientSupervision', { clientId: item._id })}
        >
            <View style={styles.cardHeader}>
                <View style={styles.avatarPlaceholder}>
                    <Text style={{fontSize: 24}}>👤</Text>
                </View>
                <View style={{marginLeft: 15, flex: 1}}>
                    <Text style={styles.clientName}>{item.name}</Text>
                    <Text style={styles.clientEmail}>{item.email}</Text>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4}}>
                        <Text style={styles.clientIdTag}>{item.clientId}</Text>
                        <TouchableOpacity 
                            style={styles.smallAnalyticsBtn} 
                            onPress={() => navigation.navigate('ProgressAnalytics', { clientId: item._id, clientName: item.name })}
                        >
                            <Text style={styles.smallAnalyticsText}>📊 Analytics</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.levelBadge}>
                    <Text style={styles.levelText}>Lvl {item.level}</Text>
                </View>
            </View>

            <View style={styles.statsStrip}>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>XP</Text>
                    <Text style={styles.statVal}>{item.xp}</Text>
                </View>
                <View style={[styles.statItem, {borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#334155'}]}>
                    <Text style={styles.statLabel}>BMI</Text>
                    <Text style={styles.statVal}>{item.bmi || '—'}</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>GOAL</Text>
                    <Text style={styles.statVal} numberOfLines={1}>{item.fitnessGoals?.[0]?.replace('_', ' ') || 'General'}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) return <View style={styles.center}><ActivityIndicator color="#60A5FA" size="large"/></View>;

    return (
        <View style={styles.container}>
            <View style={styles.topHeader}>
                <View>
                    <Text style={styles.header}>My Clients</Text>
                    <Text style={styles.subheader}>{clients.length} active supervised clients</Text>
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
                    <Text style={styles.addBtnText}>+ Connect</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={clients}
                keyExtractor={item => item._id}
                renderItem={renderClientCard}
                contentContainerStyle={{paddingBottom: 40}}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>🤝</Text>
                        <Text style={styles.emptyTitle}>No Clients Yet</Text>
                        <Text style={styles.emptySub}>Select from the list of available clients to start supervising their journey.</Text>
                    </View>
                }
            />

            <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Client to Connect</Text>
                        
                        <TextInput 
                            style={styles.modalInput} 
                            placeholder="Search by Name or ID..." 
                            placeholderTextColor="#94A3B8"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />

                        {/* Sort Controls */}
                        <View style={styles.sortContainer}>
                            <Text style={styles.sortLabel}>Sort by:</Text>
                            <TouchableOpacity 
                                style={[styles.sortBtn, sortBy === 'name' && styles.sortBtnActive]} 
                                onPress={() => setSortBy('name')}
                            >
                                <Text style={[styles.sortBtnText, sortBy === 'name' && styles.sortBtnTextActive]}>Name</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.sortBtn, sortBy === 'id' && styles.sortBtnActive]} 
                                onPress={() => setSortBy('id')}
                            >
                                <Text style={[styles.sortBtnText, sortBy === 'id' && styles.sortBtnTextActive]}>FitTrack ID</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.listWrapper}>
                            <FlatList
                                data={filteredAvailable}
                                keyExtractor={item => item.clientId}
                                style={{ maxHeight: 350 }}
                                renderItem={({ item }) => (
                                    <TouchableOpacity 
                                        style={[styles.selectOption, selectedClient?.clientId === item.clientId && styles.selectOptionActive]}
                                        onPress={() => setSelectedClient(item)}
                                    >
                                        <View>
                                            <Text style={styles.optionName}>{item.email.split('@')[0]}</Text>
                                            <Text style={styles.optionId}>{item.clientId}</Text>
                                        </View>
                                        {selectedClient?.clientId === item.clientId && <Text style={{color: '#60A5FA'}}>✓</Text>}
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={
                                    <Text style={styles.emptyListText}>No available clients found matching your search.</Text>
                                }
                            />
                        </View>

                        <TouchableOpacity style={[styles.claimBtn, !selectedClient && {opacity: 0.5}]} onPress={handleConnect} disabled={claiming || !selectedClient}>
                            {claiming ? <ActivityIndicator color="#fff"/> : <Text style={styles.claimBtnText}>Connect to {selectedClient ? selectedClient.name.split(' ')[0] : 'Client'}</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A', padding: 20 },
    center: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
    topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 10 },
    header: { fontSize: 28, fontWeight: '800', color: '#fff' },
    subheader: { color: '#60A5FA', fontSize: 14 },
    addBtn: { backgroundColor: '#3B82F6', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
    addBtnText: { color: '#fff', fontWeight: 'bold' },
    card: { backgroundColor: '#1E2937', borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    avatarPlaceholder: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#3B82F6' },
    clientName: { color: '#fff', fontSize: 18, fontWeight: '700' },
    clientEmail: { color: '#94A3B8', fontSize: 12 },
    clientIdTag: { color: '#60A5FA', fontSize: 11, fontWeight: 'bold', marginTop: 4 },
    levelBadge: { backgroundColor: '#334155', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    levelText: { color: '#60A5FA', fontSize: 11, fontWeight: '700' },
    statsStrip: { flexDirection: 'row', backgroundColor: '#0F172A', borderRadius: 16, padding: 12 },
    statItem: { flex: 1, alignItems: 'center' },
    statLabel: { color: '#64748B', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
    statVal: { color: '#fff', fontSize: 14, fontWeight: '700', marginTop: 2 },
    emptyContainer: { alignItems: 'center', marginTop: 80, padding: 40 },
    emptyIcon: { fontSize: 80, marginBottom: 20 },
    emptyTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
    emptySub: { color: '#94A3B8', textAlign: 'center', marginTop: 10, lineHeight: 20 },
    
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#1E2937', borderRadius: 28, padding: 24, borderWidth: 1, borderColor: '#334155' },
    modalTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    modalInput: { backgroundColor: '#0F172A', color: '#fff', padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
    
    sortContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 10 },
    sortLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
    sortBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155' },
    sortBtnActive: { backgroundColor: '#3B82F633', borderColor: '#3B82F6' },
    sortBtnText: { color: '#64748B', fontSize: 11, fontWeight: '700' },
    sortBtnTextActive: { color: '#3B82F6' },

    listWrapper: { backgroundColor: '#0F172A', borderRadius: 16, marginBottom: 20, overflow: 'hidden' },
    selectOption: { 
        padding: 16, borderBottomWidth: 1, borderColor: '#334155',
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' 
    },
    selectOptionActive: { backgroundColor: '#3B82F611' },
    optionName: { color: '#fff', fontSize: 15, fontWeight: '600' },
    optionId: { color: '#60A5FA', fontSize: 12, fontWeight: 'bold', marginTop: 2 },
    emptyListText: { color: '#64748B', padding: 20, textAlign: 'center', fontStyle: 'italic' },

    claimBtn: { backgroundColor: '#3B82F6', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 5 },
    claimBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    cancelBtn: { padding: 16, alignItems: 'center', marginTop: 5 },
    cancelBtnText: { color: '#94A3B8' },
    smallAnalyticsBtn: { backgroundColor: '#334155', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#3B82F6' },
    smallAnalyticsText: { color: '#60A5FA', fontSize: 10, fontWeight: 'bold' }
});

export default MyClientsScreen;
