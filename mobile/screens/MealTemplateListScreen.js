import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';

const API_URL = 'http://192.168.1.73:5000/api';   // ← YOUR IP

const MealTemplateListScreen = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [templates, setTemplates] = useState([]);

    const canManage = user?.role === 'admin' || user?.role === 'trainer';

    const fetchTemplates = async () => {
        try {
            const res = await axios.get(`${API_URL}/meals/templates`);
            setTemplates(res.data.templates || []);
        } catch (err) {
            Alert.alert('Error', 'Failed to load templates');
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const saveTemplate = async (templateId) => {
        try {
            await axios.post(`${API_URL}/meals/templates/${templateId}/save`);
            Alert.alert('Success', 'Template saved to your profile!');
            navigation.navigate('MealPlanList');
        } catch (err) {
            Alert.alert('Failed', err.response?.data?.message || 'Could not save template');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Meal Plan Templates</Text>
            <Text style={styles.subheader}>Created by Trainers & Admins</Text>

            <FlatList
                data={templates}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate('MealPlanDetail', { plan: item })}
                    >
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.goal}>{item.goalType.replace('_', ' ')}</Text>

                        {user && user.role === 'client' && (
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={() => saveTemplate(item._id)}
                            >
                                <Text style={styles.saveText}>Save to My Profile</Text>
                            </TouchableOpacity>
                        )}
                    </TouchableOpacity>
                )}
            />

            {canManage && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => navigation.navigate('CreateMealPlan')}
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
    },
    title: { fontSize: 20, fontWeight: '600', color: '#FFFFFF' },
    goal: { color: '#94A3B8', marginTop: 8 },
    saveButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 16,
        alignItems: 'center',
    },
    saveText: { color: '#FFFFFF', fontWeight: '600' },
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
    },
    fabText: { fontSize: 36, color: '#fff' }
});

export default MealTemplateListScreen;