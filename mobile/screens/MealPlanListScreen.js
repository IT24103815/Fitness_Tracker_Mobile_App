import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';

import { API_URL } from '../config';

const MealPlanListScreen = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [plans, setPlans] = useState([]);

    const fetchMyPlans = async () => {
        try {
            const res = await axios.get(`${API_URL}/meals/my`);
            setPlans(res.data.plans || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchMyPlans();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>My Meal Plans</Text>

            <FlatList
                data={plans}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate('MealPlanDetail', { plan: item })}
                    >
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.goal}>{item.goalType.replace('_', ' ')}</Text>
                    </TouchableOpacity>
                )}
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('MealTemplateList')}
            >
                <Text style={styles.fabText}>Browse Templates</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A', padding: 16 },
    header: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: 20 },
    card: {
        backgroundColor: '#1E2937',
        borderRadius: 20,
        padding: 20,
        marginBottom: 12,
    },
    title: { fontSize: 20, fontWeight: '600', color: '#FFFFFF' },
    goal: { color: '#60A5FA', marginTop: 8 },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: '#3B82F6',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 30,
    },
    fabText: { color: '#FFFFFF', fontWeight: '600' }
});

export default MealPlanListScreen;
