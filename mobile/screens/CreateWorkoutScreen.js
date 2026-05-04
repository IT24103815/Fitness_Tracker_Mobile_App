import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet, Modal, FlatList, Image } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';

import { API_URL } from '../config';

const CreateWorkoutScreen = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [form, setForm] = useState({
        title: '',
        goalType: ['general_fitness'],
        client: '',
        isTemplate: false,
        duration: '1'
    });
    const [weeks, setWeeks] = useState([{ weekNumber: 1, days: [] }]);
    const [exercises, setExercises] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showBuilder, setShowBuilder] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [clientModalVisible, setClientModalVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSelection, setActiveSelection] = useState({ weekIdx: 0, dayName: '' });
    const [tempEx, setTempEx] = useState({ exercise: null, sets: '3', reps: '10' });
    const [errors, setErrors] = useState({});

    const goalOptions = [
        'weight_loss', 'muscle_gain', 'maintenance',
        'strength', 'endurance', 'general_fitness'
    ];

    React.useEffect(() => {
        const fetchEx = async () => {
            try {
                const res = await axios.get(`${API_URL}/exercises`);
                setExercises(res.data.exercises || []);
            } catch (e) {
                console.log("Error fetching exercises");
            }
        };
        const fetchClients = async () => {
            if (user?.role === 'admin' || user?.role === 'trainer') {
                try {
                    const res = await axios.get(`${API_URL}/trainers/available-clients`);
                    setClients(res.data.clients || []);
                } catch (e) {
                    console.log("Error fetching clients");
                }
            }
        };
        fetchEx();
        fetchClients();
    }, [user]);

    React.useEffect(() => {
        const d = parseInt(form.duration, 10) || 1;
        if (isNaN(d)) return;
        
        setWeeks(prev => {
            if (prev.length === d) return prev;
            if (prev.length < d) {
                const added = [];
                for (let i = prev.length; i < d; i++) {
                    added.push({ weekNumber: i + 1, days: [] });
                }
                return [...prev, ...added];
            } else {
                return prev.slice(0, d);
            }
        });
    }, [form.duration]);

    const toggleGoal = (goal) => {
        setForm(prev => {
            const arr = prev.goalType || [];
            if (arr.includes(goal)) {
                if (arr.length === 1) return prev; // Cannot be empty
                return { ...prev, goalType: arr.filter(g => g !== goal) };
            } else {
                return { ...prev, goalType: [...arr, goal] };
            }
        });
    };

    const addExerciseToLocal = () => {
        if (!tempEx.exercise) {
            Alert.alert("Error", "Please select an exercise");
            return;
        }
        const { weekIdx, dayName } = activeSelection;
        const newWeeks = [...weeks];
        let dayObj = newWeeks[weekIdx].days.find(d => d.day === dayName);
        if (!dayObj) {
            dayObj = { day: dayName, exercises: [] };
            newWeeks[weekIdx].days.push(dayObj);
        }
        dayObj.exercises.push({
            exercise: tempEx.exercise._id,
            sets: parseInt(tempEx.sets) || 3,
            reps: tempEx.reps || '10'
        });
        setWeeks(newWeeks);
        setModalVisible(false);
        setTempEx({ exercise: null, sets: '3', reps: '10' });
    };

    const handleCreate = async () => {
        const newErrors = {};
        const titleTrimmed = form.title.trim();
        if (!titleTrimmed) {
            newErrors.title = 'Please provide a Title for this workout plan.';
        }

        if (form.goalType.length === 0) {
            newErrors.goalType = 'Please select at least one Goal Type for this plan.';
        }

        const durationNum = parseInt(form.duration, 10);
        if (isNaN(durationNum) || durationNum < 1 || durationNum > 4) {
            newErrors.duration = 'Plan duration must be between 1 and 4 weeks.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            Alert.alert('Form Error', 'Please check the highlighted fields.');
            return;
        }
        setErrors({});

        // Check if there is at least one exercise in any day of any week
        const totalExercises = weeks.reduce((total, week) => {
            return total + week.days.reduce((dTotal, day) => dTotal + day.exercises.length, 0);
        }, 0);

        if (totalExercises === 0) {
            Alert.alert('Empty Plan', 'A workout plan must contain at least one exercise.');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                title: form.title.trim(),
                goalType: form.goalType,
                client: form.isTemplate ? undefined : (form.client || undefined),
                isTemplate: form.isTemplate,
                weeks: weeks
            };

            await axios.post(`${API_URL}/workouts`, payload);

            Alert.alert('Success', 'Workout plan created successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (err) {
            Alert.alert('Failed', err.response?.data?.message || 'Failed to create plan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Create New Workout Plan</Text>

            <Text style={styles.label}>Plan Title</Text>
            <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                placeholder="e.g. Beginner Push Pull Legs"
                value={form.title}
                onChangeText={(v) => {
                    setForm({ ...form, title: v });
                    if (errors.title) setErrors({ ...errors, title: null });
                }}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

            <Text style={styles.label}>Main Goal</Text>
            <View style={[styles.optionContainer, errors.goalType && styles.inputError, { borderStyle: 'dashed' }]}>
                {goalOptions.map((goal) => (
                    <TouchableOpacity
                        key={goal}
                        style={[styles.goalOption, form.goalType.includes(goal) && styles.goalOptionActive]}
                        onPress={() => {
                            toggleGoal(goal);
                            if (errors.goalType) setErrors({ ...errors, goalType: null });
                        }}
                    >
                        <Text style={styles.goalText}>{goal.replace('_', ' ')}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            {errors.goalType && <Text style={styles.errorText}>{errors.goalType}</Text>}

            <Text style={styles.label}>Duration (Weeks)</Text>
            <TextInput
                style={[styles.input, errors.duration && styles.inputError]}
                placeholder="e.g. 4"
                keyboardType="numeric"
                value={form.duration}
                onChangeText={(v) => {
                    setForm({ ...form, duration: v });
                    if (errors.duration) setErrors({ ...errors, duration: null });
                }}
            />
            {errors.duration && <Text style={styles.errorText}>{errors.duration}</Text>}

            {(user?.role === 'admin' || user?.role === 'trainer') && (
                <View style={styles.clientSection}>
                    <Text style={styles.label}>Template Plan?</Text>
                    <TouchableOpacity
                        style={[styles.goalOption, form.isTemplate && styles.goalOptionActive, { marginBottom: 16 }]}
                        onPress={() => setForm({ ...form, isTemplate: !form.isTemplate })}
                    >
                        <Text style={styles.goalText}>{form.isTemplate ? "Yes, Make this a Public Template" : "No, this is a Private Plan"}</Text>
                    </TouchableOpacity>

                    {!form.isTemplate && (
                        <>
                            <Text style={styles.label}>Assign to Client</Text>
                            <TouchableOpacity
                                style={styles.input}
                                onPress={() => setClientModalVisible(true)}
                            >
                                <Text style={{ color: form.client ? '#FFFFFF' : '#64748B', fontSize: 17 }}>
                                    {form.client 
                                        ? (() => {
                                            const c = clients.find(cl => cl._id === form.client);
                                            return c ? `${c.email.split('@')[0]} - ${c.clientId}` : form.client;
                                          })()
                                        : "Select a Client (leave blank for yourself)"}
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            )}

            <View style={styles.builderHeader}>
                <Text style={styles.builderTitle}>Workout Structure</Text>
                <TouchableOpacity 
                    style={styles.builderToggleSmall}
                    onPress={() => setShowBuilder(!showBuilder)}
                >
                    <Text style={styles.builderToggleTextSmall}>
                        {showBuilder ? "Collapse" : "Expand"}
                    </Text>
                </TouchableOpacity>
            </View>

            {showBuilder && (
                <View style={styles.builderContainer}>
                    {weeks.map((week, wIdx) => (
                        <View key={wIdx} style={styles.weekSection}>
                            <Text style={styles.weekTitle}>Week {week.weekNumber}</Text>
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(dayName => {
                                const dayObj = week.days.find(d => d.day === dayName);
                                return (
                                    <View key={dayName} style={styles.dayRow}>
                                        <Text style={styles.dayLabel}>{dayName}</Text>
                                        <View style={styles.exList}>
                                            {dayObj?.exercises.map((ex, exIdx) => {
                                                const exInfo = exercises.find(e => e._id === ex.exercise);
                                                return (
                                                    <View key={exIdx} style={styles.exCard}>
                                                        <View style={{flex: 1}}>
                                                            <Text style={styles.exName}>{exInfo?._id ? exInfo.name : 'Exercise Removed'}</Text>
                                                            <Text style={styles.exStats}>{ex.sets}x{ex.reps}</Text>
                                                        </View>
                                                        <TouchableOpacity 
                                                            onPress={() => {
                                                                const newWeeks = [...weeks];
                                                                newWeeks[wIdx].days.find(d => d.day === dayName).exercises.splice(exIdx, 1);
                                                                setWeeks(newWeeks);
                                                            }}
                                                        >
                                                            <Text style={{color: '#EF4444', fontSize: 18, fontWeight:'bold'}}>✕</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                );
                                            })}
                                            <TouchableOpacity 
                                                style={styles.addExBtn}
                                                onPress={() => {
                                                    setActiveSelection({ weekIdx: wIdx, dayName });
                                                    setModalVisible(true);
                                                }}
                                            >
                                                <Text style={styles.addExText}>+ Add Exercise</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    ))}
                </View>
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add Exercise to {activeSelection.dayName}</Text>
                        
                        <TextInput
                            style={styles.modalSearch}
                            placeholder="Search exercises..."
                            placeholderTextColor="#94A3B8"
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                        />

                        <Text style={styles.label}>Select Exercise</Text>
                        <FlatList
                            data={exercises.filter(ex => ex.name.toLowerCase().includes(searchTerm.toLowerCase()))}
                            keyExtractor={item => item._id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={{ height: 120 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={[styles.modalExCard, tempEx.exercise?._id === item._id && styles.modalExCardActive]}
                                    onPress={() => setTempEx({ ...tempEx, exercise: item })}
                                >
                                    <View style={styles.exIconPlaceholder}>
                                        <Text style={{color:'#fff', fontWeight:'bold'}}>{item.name[0]}</Text>
                                    </View>
                                    <Text numberOfLines={1} style={[styles.modalExText, tempEx.exercise?._id === item._id && styles.modalExTextActive]}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                        />

                        <View style={styles.modalInputRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>Sets</Text>
                                <TextInput 
                                    style={styles.input} 
                                    keyboardType="numeric" 
                                    value={tempEx.sets}
                                    onChangeText={v => setTempEx({ ...tempEx, sets: v })}
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text style={styles.label}>Reps</Text>
                                <TextInput 
                                    style={styles.input} 
                                    value={tempEx.reps}
                                    onChangeText={v => setTempEx({ ...tempEx, reps: v })}
                                    placeholder="e.g. 10-12"
                                />
                            </View>
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={addExerciseToLocal}>
                                <Text style={styles.saveBtnText}>Add</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={clientModalVisible}
                onRequestClose={() => setClientModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Client</Text>
                        <FlatList
                            data={clients}
                            keyExtractor={item => item._id}
                            style={{ maxHeight: 300 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.modalExCard, { marginBottom: 10, height: 'auto', paddingVertical: 15 }]}
                                    onPress={() => {
                                        setForm({ ...form, client: item._id });
                                        setClientModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.modalExTextActive}>{item.email.split('@')[0]} - {item.clientId}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity 
                                style={styles.cancelBtn} 
                                onPress={() => setClientModalVisible(false)}
                            >
                                <Text style={styles.cancelBtnText}>Close</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.saveBtn, { backgroundColor: '#EF4444' }]} 
                                onPress={() => { setForm({ ...form, client: '' }); setClientModalVisible(false); }}
                            >
                                <Text style={styles.saveBtnText}>Assign to Self</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreate}
                disabled={loading}
            >
                <Text style={styles.createButtonText}>
                    {loading ? 'Creating...' : 'Create Workout Plan'}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A', padding: 20 },
    title: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', marginBottom: 30 },
    label: { color: '#94A3B8', fontSize: 15, marginBottom: 8, marginTop: 20 },
    input: {
        backgroundColor: '#1E2937',
        color: '#FFFFFF',
        fontSize: 17,
        padding: 18,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'transparent'
    },
    inputError: {
        borderColor: '#EF4444',
        borderWidth: 1.5
    },
    errorText: {
        color: '#EF4444',
        fontSize: 13,
        marginTop: -12,
        marginBottom: 16,
        marginLeft: 4,
        fontWeight: '500'
    },
    optionContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
    goalOption: {
        backgroundColor: '#334155',
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 12,
    },
    goalOptionActive: { backgroundColor: '#3B82F6' },
    goalText: { color: '#FFFFFF', fontSize: 15 },
    clientSection: { marginTop: 10 },
    createButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 18,
        borderRadius: 16,
        marginTop: 40,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 19,
        fontWeight: '600',
        textAlign: 'center'
    },
    builderToggle: { marginTop: 20, padding: 16, backgroundColor: '#334155', borderRadius: 12, alignItems: 'center' },
    builderToggleText: { color: '#60A5FA', fontWeight: 'bold' },
    builderContainer: { marginTop: 20, backgroundColor: '#1E2937', padding: 16, borderRadius: 16 },
    weekSection: { marginBottom: 20 },
    weekTitle: { fontSize: 18, color: '#fff', fontWeight: 'bold', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#334155', paddingBottom: 6 },
    dayRow: { marginBottom: 16 },
    dayLabel: { color: '#60A5FA', fontWeight: '600', marginBottom: 8 },
    exList: { gap: 8 },
    exCard: { backgroundColor: '#334155', padding: 12, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between' },
    exName: { color: '#fff', fontSize: 14 },
    exStats: { color: '#94A3B8', fontSize: 12 },
    addExBtn: { padding: 10, borderStyle: 'dashed', borderWidth: 1, borderColor: '#3B82F6', borderRadius: 10, alignItems: 'center' },
    addExText: { color: '#3B82F6', fontSize: 13, fontWeight: '500' },
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
    modalContent: { backgroundColor: '#1E2937', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
    modalExCard: { backgroundColor: '#334155', padding: 16, borderRadius: 12, marginRight: 12, height: 80, justifyContent: 'center' },
    modalExCardActive: { backgroundColor: '#3B82F6' },
    modalExText: { color: '#94A3B8', fontWeight: '600' },
    modalExTextActive: { color: '#fff' },
    modalInputRow: { flexDirection: 'row', marginTop: 20 },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 30 },
    cancelBtn: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#334155', alignItems: 'center' },
    cancelBtnText: { color: '#fff', fontWeight: '600' },
    saveBtn: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#10B981', alignItems: 'center' },
    saveBtnText: { color: '#fff', fontWeight: '600' },
    builderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 30, marginBottom: 10 },
    builderTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    builderToggleSmall: { backgroundColor: '#334155', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    builderToggleTextSmall: { color: '#60A5FA', fontSize: 12, fontWeight: 'bold' },
    modalSearch: { backgroundColor: '#334155', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 16 },
    exIconPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center', marginBottom: 8, alignSelf: 'center' }
});

export default CreateWorkoutScreen;
