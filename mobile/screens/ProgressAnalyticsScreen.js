import React, { useState, useEffect, useContext } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, TouchableOpacity, 
    TextInput, Alert, Dimensions, ActivityIndicator, Modal 
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '../config';
import DateTimePicker from '@react-native-community/datetimepicker';

const ProgressAnalyticsScreen = ({ route }) => {
    const { user: currentUser } = useContext(AuthContext);
    const targetUserId = route.params?.clientId || currentUser._id;
    const clientName = route.params?.clientName || (targetUserId === currentUser._id ? 'Your' : 'Client');
    const isClientViewingSelf = targetUserId === currentUser._id;

    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState([]);
    const [weight, setWeight] = useState('');
    const [notes, setNotes] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [logModalVisible, setLogModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, [targetUserId]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/analytics/weight/${targetUserId}`);
            setHistory(res.data.history || []);
        } catch (err) {
            console.log('Error fetching weight history:', err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogWeight = async () => {
        if (!weight || isNaN(weight)) {
            setError('Please enter a valid numeric weight.');
            return;
        }
        setError(null);

        setSubmitting(true);
        try {
            await axios.post(`${API_URL}/analytics/weight`, {
                date: date.toISOString(),
                weight: parseFloat(weight),
                notes
            });
            Alert.alert('Success', 'Weight logged successfully!');
            setLogModalVisible(false);
            setWeight('');
            setNotes('');
            setDate(new Date());
            fetchHistory();
        } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to log weight');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (id) => {
        Alert.alert(
            'Delete Entry',
            'Are you sure you want to remove this weight record?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await axios.delete(`${API_URL}/analytics/weight/${id}`);
                            fetchHistory();
                        } catch (err) {
                            Alert.alert('Error', 'Failed to delete entry');
                        }
                    }
                }
            ]
        );
    };

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) setDate(selectedDate);
    };

    // Prepare chart data
    const chartData = {
        labels: history.length > 0 
            ? history.map(h => new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })).slice(-6) 
            : ["No Data"],
        datasets: [{
            data: history.length > 0 
                ? history.map(h => h.weight).slice(-6) 
                : [0]
        }]
    };

    if (loading) return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color="#60A5FA" />
            <Text style={{color: '#94A3B8', marginTop: 10}}>Loading Analytics...</Text>
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <View style={styles.headerRow}>
                <View>
                    <Text style={styles.title}>{clientName} Analytics</Text>
                    <Text style={styles.subtitle}>Weekly weight progress analysis</Text>
                </View>
                {isClientViewingSelf && (
                    <TouchableOpacity 
                        style={styles.logBtn} 
                        onPress={() => setLogModalVisible(true)}
                    >
                        <Text style={styles.logBtnText}>+ Log Weight</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Chart Section */}
            <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Weight Trend (Last 6 entries)</Text>
                {history.length > 1 ? (
                    <LineChart
                        data={chartData}
                        width={Dimensions.get('window').width - 64}
                        height={220}
                        chartConfig={{
                            backgroundColor: '#1E2937',
                            backgroundGradientFrom: '#1E2937',
                            backgroundGradientTo: '#1E2937',
                            decimalPlaces: 1,
                            color: (opacity = 1) => `rgba(96, 165, 250, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
                            style: { borderRadius: 16 },
                            propsForDots: { r: "6", strokeWidth: "2", stroke: "#3B82F6" }
                        }}
                        bezier
                        style={styles.chart}
                    />
                ) : (
                    <View style={styles.emptyChart}>
                        <Text style={{color: '#64748B'}}>Need at least 2 entries for trend analysis</Text>
                    </View>
                )}
            </View>

            {/* History List */}
            <Text style={styles.sectionTitle}>Recent Logs</Text>
            {history.length > 0 ? (
                [...history].reverse().map((item, idx) => (
                    <View key={item._id || idx} style={styles.historyItem}>
                        <View>
                            <Text style={styles.historyDate}>
                                {new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                            </Text>
                            {item.notes ? <Text style={styles.historyNotes}>{item.notes}</Text> : null}
                        </View>
                        <View style={styles.historyRight}>
                            <Text style={styles.historyWeight}>{item.weight} <Text style={{fontSize: 12, color: '#64748B'}}>kg</Text></Text>
                            {isClientViewingSelf && (
                                <TouchableOpacity onPress={() => handleDelete(item._id)}>
                                    <Text style={styles.deleteIcon}>✕</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                ))
            ) : (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No weight entries found.</Text>
                </View>
            )}

            {/* Log Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={logModalVisible}
                onRequestClose={() => setLogModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Log Weekly Weight</Text>
                        
                        <Text style={styles.label}>Weight (kg)</Text>
                        <TextInput 
                            style={[styles.input, error && styles.inputError]}
                            keyboardType="numeric"
                            placeholder="e.g. 75.5"
                            placeholderTextColor="#64748B"
                            value={weight}
                            onChangeText={(v) => {
                                setWeight(v);
                                if (error) setError(null);
                            }}
                        />
                        {error && <Text style={styles.errorText}>{error}</Text>}

                        <Text style={styles.label}>Date</Text>
                        <TouchableOpacity 
                            style={styles.datePickerBtn} 
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={{color: '#fff'}}>{date.toDateString()}</Text>
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display="default"
                                onChange={onDateChange}
                                maximumDate={new Date()}
                            />
                        )}

                        <Text style={styles.label}>Notes (Optional)</Text>
                        <TextInput 
                            style={[styles.input, {height: 80}]}
                            multiline
                            placeholder="How are you feeling?"
                            placeholderTextColor="#64748B"
                            value={notes}
                            onChangeText={setNotes}
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity 
                                style={styles.cancelBtn} 
                                onPress={() => setLogModalVisible(false)}
                            >
                                <Text style={{color: '#fff', fontWeight: 'bold'}}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.submitBtnModal} 
                                onPress={handleLogWeight}
                                disabled={submitting}
                            >
                                {submitting 
                                    ? <ActivityIndicator color="#fff" /> 
                                    : <Text style={{color: '#fff', fontWeight: 'bold'}}>Save Entry</Text>
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A', padding: 20 },
    center: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, marginTop: 10 },
    title: { fontSize: 26, fontWeight: '900', color: '#fff' },
    subtitle: { fontSize: 14, color: '#60A5FA', marginTop: 2 },
    logBtn: { backgroundColor: '#3B82F6', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
    logBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
    chartCard: { backgroundColor: '#1E2937', borderRadius: 24, padding: 16, marginBottom: 25, borderWidth: 1, borderColor: '#334155' },
    chartTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 15, textAlign: 'center' },
    chart: { marginVertical: 8, borderRadius: 16 },
    emptyChart: { height: 200, justifyContent: 'center', alignItems: 'center' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 15 },
    historyItem: { 
        backgroundColor: '#1E2937', 
        padding: 16, 
        borderRadius: 20, 
        marginBottom: 12, 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderLeftWidth: 4,
        borderLeftColor: '#3B82F6'
    },
    historyDate: { color: '#fff', fontSize: 15, fontWeight: '600' },
    historyNotes: { color: '#94A3B8', fontSize: 12, marginTop: 4, fontStyle: 'italic' },
    historyRight: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    historyWeight: { color: '#fff', fontSize: 18, fontWeight: '800' },
    deleteIcon: { color: '#EF4444', fontSize: 18, fontWeight: 'bold' },
    emptyState: { padding: 40, alignItems: 'center' },
    emptyText: { color: '#64748B', fontStyle: 'italic' },
    
    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#1E2937', borderRadius: 28, padding: 24, borderWidth: 1, borderColor: '#334155' },
    modalTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    label: { color: '#60A5FA', fontSize: 12, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
    input: { 
        backgroundColor: '#0F172A', 
        color: '#fff', 
        padding: 16, 
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
        fontSize: 12,
        marginTop: -12,
        marginBottom: 16,
        marginLeft: 4,
        fontWeight: '500'
    },
    datePickerBtn: { backgroundColor: '#0F172A', padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 10 },
    cancelBtn: { flex: 1, padding: 16, backgroundColor: '#334155', borderRadius: 16, alignItems: 'center' },
    submitBtnModal: { flex: 2, padding: 16, backgroundColor: '#3B82F6', borderRadius: 16, alignItems: 'center' }
});

export default ProgressAnalyticsScreen;
