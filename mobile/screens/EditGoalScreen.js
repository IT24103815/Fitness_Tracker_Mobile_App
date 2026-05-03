import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';

import { API_URL } from '../config';
import DateTimePicker from '@react-native-community/datetimepicker';

const EditGoalScreen = ({ route, navigation }) => {
    const { goal } = route.params;
    const { user } = useContext(AuthContext);
    
    const [form, setForm] = useState({
        title: goal.title,
        type: goal.type,
        startValue: goal.startValue?.toString() || '0',
        currentValue: goal.currentValue?.toString() || '0',
        targetValue: goal.targetValue?.toString(),
        targetUnit: goal.targetUnit,
        priority: goal.priority || 'medium',
        status: goal.status || 'active',
        description: goal.description || '',
        deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : ''
    });
    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [date, setDate] = useState(goal.deadline ? new Date(goal.deadline) : new Date());

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDate(selectedDate);
            setForm({ ...form, deadline: selectedDate.toISOString().split('T')[0] });
        }
    };

    const goalTypes = ['weight_loss', 'muscle_gain', 'strength', 'endurance', 'consistency', 'flexibility'];
    const priorities = ['low', 'medium', 'high'];
    const statuses = ['active', 'completed', 'failed', 'paused'];

    const handleUpdate = async () => {
        const titleTrimmed = form.title.trim();
        if (!titleTrimmed || !form.targetValue || !form.targetUnit.trim()) {
            Alert.alert('Incomplete Form', 'Title, Target Value, and Unit are mandatory.');
            return;
        }

        const start = Number(form.startValue);
        const current = Number(form.currentValue);
        const target = Number(form.targetValue);

        if (isNaN(target) || isNaN(start) || isNaN(current)) {
            Alert.alert('Invalid Entry', 'Measurement values must be numeric.');
            return;
        }

        // Logic Check
        if (target <= 0 && form.type !== 'weight_loss') {
            Alert.alert('Invalid Goal', 'Target value should typically be greater than zero.');
            return;
        }

        // Date Validation
        if (form.deadline) {
            const deadlineDate = new Date(form.deadline);
            // Optional: add future date check if needed, but for edit it might be okay to keep past dates if they were set before
        }

        setLoading(true);

        try {
            const updatedData = {
                ...form,
                targetValue: Number(form.targetValue),
                startValue: Number(form.startValue),
                currentValue: Number(form.currentValue)
            };

            await axios.put(`${API_URL}/progress/goals/${goal._id}`, updatedData);
            Alert.alert('Success', 'Goal updated successfully!');
            navigation.goBack();
        } catch (err) {
            console.error(err);
            Alert.alert('Failed', err.response?.data?.message || 'Failed to update goal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Edit Goal</Text>
            <Text style={styles.subtitle}>Refine your path to excellence.</Text>

            <View style={styles.section}>
                <Text style={styles.label}>Goal Title</Text>
                <TextInput
                    style={styles.input}
                    value={form.title}
                    onChangeText={v => setForm({ ...form, title: v })}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Goal Category</Text>
                <View style={styles.optionRow}>
                    {goalTypes.map(type => (
                        <TouchableOpacity
                            key={type}
                            style={[styles.option, form.type === type && styles.optionActive]}
                            onPress={() => setForm({ ...form, type })}
                        >
                            <Text style={[styles.optionText, form.type === type && styles.optionTextActive]}>
                                {type.replace('_', ' ')}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.threeRow}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Start</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={form.startValue}
                        onChangeText={v => setForm({ ...form, startValue: v })}
                    />
                </View>
                <View style={{ flex: 1, marginHorizontal: 8 }}>
                    <Text style={styles.label}>Current</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={form.currentValue}
                        onChangeText={v => setForm({ ...form, currentValue: v })}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Target</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={form.targetValue}
                        onChangeText={v => setForm({ ...form, targetValue: v })}
                    />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Unit (kg, km, reps, etc)</Text>
                <TextInput
                    style={styles.input}
                    value={form.targetUnit}
                    onChangeText={v => setForm({ ...form, targetUnit: v })}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.optionRow}>
                    {statuses.map(s => (
                        <TouchableOpacity
                            key={s}
                            style={[styles.smallOption, form.status === s && styles.statusActive(s)]}
                            onPress={() => setForm({ ...form, status: s })}
                        >
                            <Text style={[styles.optionText, form.status === s && styles.optionTextActive]}>
                                {s}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Priority</Text>
                <View style={styles.optionRow}>
                    {priorities.map(p => (
                        <TouchableOpacity
                            key={p}
                            style={[styles.smallOption, form.priority === p && styles.priorityActive(p)]}
                            onPress={() => setForm({ ...form, priority: p })}
                        >
                            <Text style={[styles.optionText, form.priority === p && styles.optionTextActive]}>
                                {p}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Notes</Text>
                <TextInput
                    style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                    multiline
                    value={form.description}
                    onChangeText={v => setForm({ ...form, description: v })}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Deadline</Text>
                <TouchableOpacity 
                    style={styles.input} 
                    onPress={() => setShowDatePicker(true)}
                >
                    <Text style={{ color: form.deadline ? '#FFFFFF' : '#64748B', fontSize: 16 }}>
                        {form.deadline || "Select Deadline Date"}
                    </Text>
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        onChange={onDateChange}
                    />
                )}
            </View>

            <TouchableOpacity 
                style={[styles.button, loading && { opacity: 0.7 }]} 
                onPress={handleUpdate} 
                disabled={loading}
            >
                <Text style={styles.buttonText}>{loading ? 'Updating...' : 'Update Goal'}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    content: { padding: 20, paddingBottom: 60 },
    title: { fontSize: 32, fontWeight: '900', color: '#FFFFFF' },
    subtitle: { fontSize: 16, color: '#94A3B8', marginBottom: 30 },
    section: { marginBottom: 20 },
    label: { color: '#60A5FA', fontSize: 13, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase' },
    threeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    input: {
        backgroundColor: '#1E2937', color: '#FFFFFF', padding: 16, borderRadius: 16, fontSize: 16,
        borderWidth: 1, borderColor: '#334155',
    },
    optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    option: { backgroundColor: '#1E2937', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#334155' },
    smallOption: { backgroundColor: '#1E2937', paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#334155', flex: 1, alignItems: 'center' },
    optionActive: { backgroundColor: '#3B82F6', borderColor: '#60A5FA' },
    priorityActive: (p) => ({ backgroundColor: p === 'high' ? '#EF4444' : p === 'medium' ? '#F59E0B' : '#10B981', borderColor: '#FFFFFF' }),
    statusActive: (s) => ({ backgroundColor: s === 'completed' ? '#22C55E' : s === 'failed' ? '#EF4444' : s === 'paused' ? '#F59E0B' : '#3B82F6', borderColor: '#FFFFFF' }),
    optionText: { color: '#94A3B8', fontWeight: '600', fontSize: 13, textTransform: 'capitalize' },
    optionTextActive: { color: '#FFFFFF' },
    button: { backgroundColor: '#10B981', paddingVertical: 18, borderRadius: 16, marginTop: 10 },
    buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', textAlign: 'center' },
});

export default EditGoalScreen;
