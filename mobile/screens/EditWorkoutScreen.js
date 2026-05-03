import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet, Modal, FlatList, ActivityIndicator } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';

import { API_URL } from '../config';

const EditWorkoutScreen = ({ route, navigation }) => {
    const { user } = useContext(AuthContext);
    const { plan } = route.params;

    const [form, setForm] = useState({
        title: plan.title,
        goalType: Array.isArray(plan.goalType) ? plan.goalType : [plan.goalType],
        isTemplate: plan.isTemplate,
        duration: plan.duration?.toString() || '1'
    });

    const [weeks, setWeeks] = useState(plan.weeks || []);
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showBuilder, setShowBuilder] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSelection, setActiveSelection] = useState({ weekIdx: 0, dayName: '' });
    const [tempEx, setTempEx] = useState({ exercise: null, sets: '3', reps: '10' });

    const goalOptions = [
        'weight_loss', 'muscle_gain', 'maintenance',
        'strength', 'endurance', 'general_fitness'
    ];

    useEffect(() => {
        const fetchEx = async () => {
            try {
                const res = await axios.get(`${API_URL}/exercises`);
                setExercises(res.data.exercises || []);
            } catch (e) {
                console.log("Error fetching exercises");
            }
        };
        fetchEx();
    }, []);

    // Sync weeks count with duration
    useEffect(() => {
        const d = parseInt(form.duration, 10) || 1;
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
                if (arr.length === 1) return prev;
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
        const newWeeks = JSON.parse(JSON.stringify(weeks));
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

    const handleUpdate = async () => {
        if (!form.title.trim()) {
            Alert.alert('Error', 'Please enter a plan title');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                ...form,
                duration: parseInt(form.duration, 10),
                weeks: weeks
            };

            await axios.put(`${API_URL}/workouts/${plan._id}`, payload);
            Alert.alert('Success', 'Workout plan updated!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (err) {
            Alert.alert('Failed', err.response?.data?.message || 'Failed to update plan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Edit Workout Plan</Text>

            <View style={styles.card}>
                <Text style={styles.label}>Plan Title</Text>
                <TextInput
                    style={styles.input}
                    value={form.title}
                    onChangeText={(v) => setForm({ ...form, title: v })}
                />

                <Text style={styles.label}>Goals</Text>
                <View style={styles.optionContainer}>
                    {goalOptions.map((goal) => (
                        <TouchableOpacity
                            key={goal}
                            style={[styles.goalOption, form.goalType.includes(goal) && styles.goalOptionActive]}
                            onPress={() => toggleGoal(goal)}
                        >
                            <Text style={styles.goalText}>{goal.replace('_', ' ')}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>Duration (Weeks)</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={form.duration}
                    onChangeText={(v) => setForm({ ...form, duration: v })}
                />

                {(user?.role === 'admin' || user?.role === 'trainer') && (
                    <View style={styles.clientSection}>
                        <Text style={styles.label}>Is Template?</Text>
                        <TouchableOpacity
                            style={[styles.goalOption, form.isTemplate && styles.goalOptionActive]}
                            onPress={() => setForm({ ...form, isTemplate: !form.isTemplate })}
                        >
                            <Text style={styles.goalText}>{form.isTemplate ? "Yes" : "No"}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <View style={styles.builderHeader}>
                <Text style={styles.builderTitle}>Modify Exercises</Text>
                <TouchableOpacity 
                    style={styles.builderToggleSmall}
                    onPress={() => setShowBuilder(!showBuilder)}
                >
                    <Text style={styles.builderToggleTextSmall}>{showBuilder ? "Collapse" : "Expand"}</Text>
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
                                                const exInfo = exercises.find(e => e._id === (ex.exercise?._id || ex.exercise));
                                                return (
                                                    <View key={exIdx} style={styles.exCard}>
                                                        <View style={{flex: 1}}>
                                                            <Text style={styles.exName}>{exInfo?.name || 'Exercise Found'}</Text>
                                                            <Text style={styles.exStats}>{ex.sets}x{ex.reps}</Text>
                                                        </View>
                                                        <TouchableOpacity 
                                                            onPress={() => {
                                                                const newWeeks = JSON.parse(JSON.stringify(weeks));
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
                        <Text style={styles.modalTitle}>Add to {activeSelection.dayName}</Text>
                        <TextInput
                            style={styles.modalSearch}
                            placeholder="Search..."
                            placeholderTextColor="#94A3B8"
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                        />
                        <FlatList
                            data={exercises.filter(ex => ex.name.toLowerCase().includes(searchTerm.toLowerCase()))}
                            keyExtractor={item => item._id}
                            horizontal
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={[styles.modalExCard, tempEx.exercise?._id === item._id && styles.modalExCardActive]}
                                    onPress={() => setTempEx({ ...tempEx, exercise: item })}
                                >
                                    <View style={styles.exIconPlaceholder}><Text style={{color:'#fff'}}>{item.name[0]}</Text></View>
                                    <Text numberOfLines={1} style={styles.modalExText}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <View style={styles.modalInputRow}>
                            <View style={{flex:1}}><Text style={styles.label}>Sets</Text><TextInput style={styles.input} value={tempEx.sets} keyboardType="numeric" onChangeText={v=>setTempEx({...tempEx, sets:v})}/></View>
                            <View style={{flex:1, marginLeft:10}}><Text style={styles.label}>Reps</Text><TextInput style={styles.input} value={tempEx.reps} onChangeText={v=>setTempEx({...tempEx, reps:v})}/></View>
                        </View>
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={()=>setModalVisible(false)}><Text style={{color:'#fff'}}>Cancel</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={addExerciseToLocal}><Text style={{color:'#fff'}}>Add</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <TouchableOpacity style={styles.submitBtn} onPress={handleUpdate} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Update Workout Plan</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A', padding: 20 },
    header: { fontSize: 24, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', marginBottom: 20 },
    card: { backgroundColor: '#1E2937', borderRadius: 20, padding: 20, marginBottom: 20 },
    label: { color: '#94A3B8', fontSize: 13, marginBottom: 8, marginTop: 10 },
    input: { backgroundColor: '#334155', color: '#FFFFFF', padding: 12, borderRadius: 10, marginBottom: 10 },
    optionContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 10 },
    goalOption: { backgroundColor: '#334155', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
    goalOptionActive: { backgroundColor: '#3B82F6' },
    goalText: { color: '#FFFFFF', fontSize: 13 },
    clientSection: { marginTop: 15, borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 15 },
    builderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    builderTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    builderToggleSmall: { backgroundColor: '#334155', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    builderToggleTextSmall: { color: '#60A5FA', fontSize: 12 },
    builderContainer: { marginTop: 15, backgroundColor: '#1E2937', padding: 16, borderRadius: 16 },
    weekSection: { marginBottom: 20 },
    weekTitle: { fontSize: 16, color: '#fff', fontWeight: 'bold', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#334155', paddingBottom: 6 },
    dayRow: { marginBottom: 12 },
    dayLabel: { color: '#60A5FA', fontWeight: '600', marginBottom: 6 },
    exList: { gap: 6 },
    exCard: { backgroundColor: '#334155', padding: 10, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between' },
    exName: { color: '#fff', fontSize: 13 },
    exStats: { color: '#94A3B8', fontSize: 11 },
    addExBtn: { padding: 8, borderStyle: 'dashed', borderWidth: 1, borderColor: '#3B82F6', borderRadius: 10, alignItems: 'center' },
    addExText: { color: '#3B82F6', fontSize: 12 },
    submitBtn: { backgroundColor: '#10B981', padding: 18, borderRadius: 16, marginVertical: 30, alignItems: 'center' },
    submitBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
    modalContent: { backgroundColor: '#1E2937', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
    modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
    modalSearch: { backgroundColor: '#334155', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 16 },
    modalExCard: { backgroundColor: '#334155', padding: 12, borderRadius: 12, marginRight: 10, width: 100, alignItems: 'center' },
    modalExCardActive: { backgroundColor: '#3B82F6' },
    exIconPlaceholder: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#60A5FA', justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
    modalExText: { color: '#fff', fontSize: 11 },
    modalInputRow: { flexDirection: 'row', marginTop: 15 },
    modalActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
    cancelBtn: { flex: 1, padding: 12, backgroundColor: '#334155', borderRadius: 10, alignItems: 'center' },
    saveBtn: { flex: 1, padding: 12, backgroundColor: '#10B981', borderRadius: 10, alignItems: 'center' }
});

export default EditWorkoutScreen;
