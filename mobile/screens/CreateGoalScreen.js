import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';

import { API_URL } from '../config';
import DateTimePicker from '@react-native-community/datetimepicker';

const CreateGoalScreen = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [form, setForm] = useState({
        title: '',
        type: 'weight_loss',
        startValue: '',
        targetValue: '',
        targetUnit: '',
        priority: 'medium',
        description: '',
        deadline: ''
    });
    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [date, setDate] = useState(new Date());
    const [errors, setErrors] = useState({});

    const goalTypes = ['weight_loss', 'muscle_gain', 'strength', 'endurance', 'consistency', 'flexibility'];
    const priorities = ['low', 'medium', 'high'];

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDate(selectedDate);
            setForm({ ...form, deadline: selectedDate.toISOString().split('T')[0] });
        }
    };

    const handleCreate = async () => {
        const newErrors = {};
        const titleTrimmed = form.title.trim();
        if (!titleTrimmed) {
            newErrors.title = 'Title is mandatory';
        }
        if (!form.targetValue) {
            newErrors.targetValue = 'Target value is mandatory';
        }
        if (!form.targetUnit.trim()) {
            newErrors.targetUnit = 'Unit is mandatory';
        }

        const start = Number(form.startValue) || 0;
        const target = Number(form.targetValue);

        if (!newErrors.targetValue && isNaN(target)) {
            newErrors.targetValue = 'Must be a number';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            Alert.alert('Form Error', 'Please check the mandatory fields.');
            return;
        }
        setErrors({});

        if (target <= 0 && form.type !== 'weight_loss') {
            Alert.alert('Invalid Goal', 'Target value should typically be greater than zero.');
            return;
        }

        if (target === start && (form.type === 'weight_loss' || form.type === 'muscle_gain')) {
            Alert.alert('Logical Error', 'Target value should be different from your current starting value.');
            return;
        }

        // Date Validation
        if (form.deadline) {
            const deadlineDate = new Date(form.deadline);
            if (deadlineDate <= new Date()) {
                Alert.alert('Past Deadline', 'The goal deadline must be a future date.');
                return;
            }
        }

        setLoading(true);

        try {
            // Include user ID as client if not admin/trainer creating for someone else
            const goalData = {
                ...form,
                targetValue: Number(form.targetValue),
                startValue: Number(form.startValue) || 0,
                currentValue: Number(form.startValue) || 0,
                client: user._id // Self-created
            };

            await axios.post(`${API_URL}/progress/goals`, goalData);
            Alert.alert('Success', 'Goal created! Time to get to work.');
            navigation.goBack();
        } catch (err) {
            console.error(err);
            Alert.alert('Failed', err.response?.data?.message || 'Failed to create goal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Define Your Goal</Text>
            <Text style={styles.subtitle}>Be specific and measurable to succeed.</Text>

            <View style={styles.section}>
                <Text style={styles.label}>Goal Title</Text>
                <TextInput
                    style={[styles.input, errors.title && styles.inputError]}
                    placeholder="e.g. Run 10km under 50 mins"
                    placeholderTextColor="#64748B"
                    value={form.title}
                    onChangeText={v => {
                        setForm({ ...form, title: v });
                        if (errors.title) setErrors({ ...errors, title: null });
                    }}
                />
                {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
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

            <View style={styles.twinRow}>
                <View style={[styles.section, { flex: 1 }]}>
                    <Text style={styles.label}>Starting Value</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Current"
                        placeholderTextColor="#64748B"
                        keyboardType="numeric"
                        value={form.startValue}
                        onChangeText={v => setForm({ ...form, startValue: v })}
                    />
                </View>
                <View style={[styles.section, { flex: 1, marginLeft: 12 }]}>
                    <Text style={styles.label}>Target Value</Text>
                    <TextInput
                        style={[styles.input, errors.targetValue && styles.inputError]}
                        placeholder="Goal"
                        placeholderTextColor="#64748B"
                        keyboardType="numeric"
                        value={form.targetValue}
                        onChangeText={v => {
                            setForm({ ...form, targetValue: v });
                            if (errors.targetValue) setErrors({ ...errors, targetValue: null });
                        }}
                    />
                    {errors.targetValue && <Text style={styles.errorText}>{errors.targetValue}</Text>}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Unit of Measurement</Text>
                <TextInput
                    style={[styles.input, errors.targetUnit && styles.inputError]}
                    placeholder="e.g. kg, lbs, km, % body fat"
                    placeholderTextColor="#64748B"
                    value={form.targetUnit}
                    onChangeText={v => {
                        setForm({ ...form, targetUnit: v });
                        if (errors.targetUnit) setErrors({ ...errors, targetUnit: null });
                    }}
                />
                {errors.targetUnit && <Text style={styles.errorText}>{errors.targetUnit}</Text>}
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Priority Level</Text>
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
                <Text style={styles.label}>Motivation / Notes</Text>
                <TextInput
                    style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                    placeholder="Why is this important to you?"
                    placeholderTextColor="#64748B"
                    multiline
                    value={form.description}
                    onChangeText={v => setForm({ ...form, description: v })}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Target Deadline (Optional)</Text>
                <TouchableOpacity 
                    style={styles.input} 
                    onPress={() => setShowDatePicker(true)}
                >
                    <Text style={{ color: form.deadline ? '#FFFFFF' : '#64748B', fontSize: 17 }}>
                        {form.deadline || "Select Deadline Date"}
                    </Text>
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        onChange={onDateChange}
                        minimumDate={new Date()}
                    />
                )}
            </View>

            <TouchableOpacity 
                style={[styles.button, loading && { opacity: 0.7 }]} 
                onPress={handleCreate} 
                disabled={loading}
            >
                <Text style={styles.buttonText}>{loading ? 'Establishing Goal...' : 'Commit to Goal'}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    content: { padding: 20, paddingBottom: 60 },
    title: { fontSize: 32, fontWeight: '900', color: '#FFFFFF', textAlign: 'left' },
    subtitle: { fontSize: 16, color: '#94A3B8', marginBottom: 30, textAlign: 'left' },
    section: { marginBottom: 20 },
    label: { color: '#60A5FA', fontSize: 14, fontWeight: '600', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
    twinRow: { flexDirection: 'row', justifyContent: 'space-between' },
    input: {
        backgroundColor: '#1E2937',
        color: '#FFFFFF',
        padding: 18,
        borderRadius: 16,
        fontSize: 17,
        borderWidth: 1,
        borderColor: '#334155',
    },
    inputError: {
        borderColor: '#EF4444',
        borderWidth: 1.5
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
        fontWeight: '500'
    },
    optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    option: {
        backgroundColor: '#1E2937',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#334155',
    },
    smallOption: {
        backgroundColor: '#1E2937',
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#334155',
        flex: 1,
        alignItems: 'center'
    },
    optionActive: { backgroundColor: '#3B82F6', borderColor: '#60A5FA' },
    priorityActive: (p) => ({
        backgroundColor: p === 'high' ? '#EF4444' : p === 'medium' ? '#F59E0B' : '#10B981',
        borderColor: '#FFFFFF'
    }),
    optionText: { color: '#94A3B8', fontWeight: '600', textTransform: 'capitalize' },
    optionTextActive: { color: '#FFFFFF' },
    button: {
        backgroundColor: '#3B82F6',
        paddingVertical: 20,
        borderRadius: 20,
        marginTop: 10,
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonText: { color: '#FFFFFF', fontSize: 19, fontWeight: '800', textAlign: 'center' },
});

export default CreateGoalScreen;
