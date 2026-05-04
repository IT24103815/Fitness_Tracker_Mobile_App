import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';

import { API_URL } from '../config';

const UserManagementScreen = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/users`);
            setUsers(res.data.users || []);
        } catch (error) {
            Alert.alert('Error', 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const changeRole = async (userId, newRole) => {
        try {
            await axios.put(`${API_URL}/users/${userId}`, { role: newRole });
            fetchUsers();
            Alert.alert('Success', `User role updated to ${newRole}`);
        } catch (error) {
            Alert.alert('Error', 'Failed to update user role');
        }
    };

    const confirmChangeRole = (user) => {
        Alert.alert(
            `Change Role for ${user.name}`,
            'Select new role:',
            [
                { text: 'Admin', onPress: () => changeRole(user._id, 'admin') },
                { text: 'Trainer', onPress: () => changeRole(user._id, 'trainer') },
                { text: 'Client', onPress: () => changeRole(user._id, 'client') },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    };

    const deleteUser = async (userId) => {
        try {
            await axios.delete(`${API_URL}/users/${userId}`);
            fetchUsers();
            Alert.alert('Deleted', 'User has been removed');
        } catch (error) {
            Alert.alert('Error', 'Failed to delete user');
        }
    };

    const confirmDelete = (user) => {
        Alert.alert(
            'Confirm Delete',
            `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', onPress: () => deleteUser(user._id), style: 'destructive' }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.tableRow}>
            <View style={styles.colInfo}>
                <Text style={styles.nameText}>{item.name}</Text>
                <Text style={styles.emailText}>{item.email}</Text>
                <Text style={styles.roleText}>Role: {item.role.toUpperCase()}</Text>
            </View>
            <View style={styles.colActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => confirmChangeRole(item)}>
                    <Text style={styles.actionBtnText}>Change Role</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => confirmDelete(item)}>
                    <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>User Management</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#60A5FA" />
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A', padding: 16 },
    header: { fontSize: 24, fontWeight: '700', color: '#FFFFFF', marginBottom: 20 },
    listContainer: { paddingBottom: 20 },
    tableRow: {
        backgroundColor: '#1E2937',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    colInfo: { flex: 1 },
    nameText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
    emailText: { color: '#94A3B8', fontSize: 14, marginTop: 4 },
    roleText: { color: '#60A5FA', fontSize: 12, fontWeight: '600', marginTop: 8 },
    colActions: { marginLeft: 16, gap: 10 },
    actionBtn: { backgroundColor: '#3B82F6', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center' },
    actionBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
    deleteBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#EF4444' },
    deleteBtnText: { color: '#EF4444', fontSize: 12, fontWeight: '600' },
});

export default UserManagementScreen;
