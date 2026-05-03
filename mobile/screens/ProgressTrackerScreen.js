import React, { useState, useCallback, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';

import { API_URL } from '../config';

const ProgressTrackerScreen = () => {
    const { user } = useContext(AuthContext);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('month'); // 'year', 'month'

    // Real-time fetch
    const fetchRecords = async () => {
        try {
            const res = await axios.get(`${API_URL}/progress/dashboard`);
            setRecords(res.data.recentProgress || []);
        } catch (err) {
            console.error('Error fetching progress:', err.message);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => { fetchRecords(); }, []));

    const selectedRecord = records.find(r => 
        new Date(r.date).toDateString() === selectedDate.toDateString()
    );

    // Calendar logic
    const renderMonthCalendar = () => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const monthDaysCount = new Date(year, month + 1, 0).getDate();
        
        const calendarDays = [];
        for (let i = 0; i < firstDay; i++) calendarDays.push(null);
        for (let i = 1; i <= monthDaysCount; i++) calendarDays.push(new Date(year, month, i));

        return (
            <View style={styles.calendarGrid}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((dayInitial, idx) => (
                    <Text key={`header-${dayInitial}-${idx}`} style={styles.dayHeader}>{dayInitial}</Text>
                ))}
                {calendarDays.map((date, idx) => {
                    if (!date) return <View key={`spacer-${idx}`} style={styles.dayCell} />;
                    
                    const record = records.find(r => new Date(r.date).toDateString() === date.toDateString());
                    const isSelected = date.toDateString() === selectedDate.toDateString();
                    const isToday = date.toDateString() === new Date().toDateString();

                    return (
                        <TouchableOpacity 
                            key={`date-${date.toISOString()}`} 
                            style={[
                                styles.dayCell,
                                record && styles.dayCellActive,
                                isSelected && styles.dayCellSelected
                            ]}
                            onPress={() => setSelectedDate(date)}
                        >
                            <Text style={[
                                styles.dayText, 
                                isToday && styles.todayText,
                                isSelected && { color: '#0F172A' }
                            ]}>
                                {date.getDate()}
                            </Text>
                            {record && !isSelected && <View style={styles.activeDot} />}
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#60A5FA" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Fitness Progress Tracker</Text>
                <Text style={styles.subtitle}>Consistency is the strategy of champions.</Text>
            </View>

            {/* Month Selector */}
            <View style={styles.monthSelector}>
                <TouchableOpacity onPress={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}>
                    <Text style={styles.navArrow}>◀</Text>
                </TouchableOpacity>
                <Text style={styles.monthName}>
                    {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </Text>
                <TouchableOpacity onPress={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}>
                    <Text style={styles.navArrow}>▶</Text>
                </TouchableOpacity>
            </View>

            {/* Calendar */}
            <View style={styles.card}>
                {renderMonthCalendar()}
            </View>

            {/* Activity Summary for Selected Day */}
            <View style={styles.detailsSection}>
                <Text style={styles.detailsTitle}>
                    {selectedDate.toLocaleDateString('default', { day: 'numeric', month: 'long' })} Summary
                </Text>

                {selectedRecord ? (
                    <View style={styles.summaryCard}>
                        <View style={styles.xpBadge}>
                            <Text style={styles.xpText}>+{selectedRecord.xpGained || 0} XP earned</Text>
                        </View>

                        {selectedRecord.activities && selectedRecord.activities.length > 0 ? (
                            selectedRecord.activities.map((act, idx) => (
                                <View key={idx} style={styles.activityItem}>
                                    <View style={[styles.activityTypeIcon, { backgroundColor: act.type === 'workout' ? '#3B82F633' : '#10B98133' }]}>
                                        <Text style={{ fontSize: 16 }}>{act.type === 'workout' ? '🏋️' : '🏆'}</Text>
                                    </View>
                                    <View style={styles.activityInfo}>
                                        <Text style={styles.activityTitle}>{act.title}</Text>
                                        <Text style={styles.activityMeta}>{act.type.toUpperCase()} • {act.xpAwarded} XP</Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View style={styles.activityItem}>
                                <Text style={styles.noActivityText}>Custom activity log for this day.</Text>
                            </View>
                        )}

                        {selectedRecord.notes && (
                            <View style={styles.notesBox}>
                                <Text style={styles.notesLabel}>Notes:</Text>
                                <Text style={styles.notesText}>{selectedRecord.notes}</Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <View style={styles.emptySummary}>
                        <Text style={styles.emptySummaryIcon}>🍃</Text>
                        <Text style={styles.emptySummaryText}>No activity recorded for this day.</Text>
                        <Text style={styles.emptySummarySub}>Time to start a new workout!</Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    centered: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
    header: { padding: 20, paddingTop: 10 },
    title: { fontSize: 28, fontWeight: '900', color: '#FFFFFF' },
    subtitle: { fontSize: 15, color: '#94A3B8', marginTop: 4 },
    
    monthSelector: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        paddingVertical: 10,
        marginBottom: 10
    },
    monthName: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
    navArrow: { color: '#60A5FA', fontSize: 24, padding: 10 },

    card: { 
        backgroundColor: '#1E2937', 
        marginHorizontal: 16, 
        borderRadius: 24, 
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5
    },
    calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    dayHeader: { width: '14.28%', textAlign: 'center', color: '#64748B', fontSize: 12, fontWeight: '700', marginBottom: 12 },
    dayCell: { width: '14.28%', height: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 12, marginBottom: 4 },
    dayCellActive: { backgroundColor: '#22C55E22' },
    dayCellSelected: { backgroundColor: '#60A5FA' },
    dayText: { color: '#CBD5E1', fontSize: 15, fontWeight: '600' },
    todayText: { color: '#60A5FA', fontWeight: '900', textDecorationLine: 'underline' },
    activeDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#22C55E', marginTop: 4 },

    detailsSection: { padding: 20, marginTop: 10 },
    detailsTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginBottom: 16 },
    summaryCard: { backgroundColor: '#1E2937', borderRadius: 24, padding: 20 },
    xpBadge: { backgroundColor: '#F59E0B22', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginBottom: 20 },
    xpText: { color: '#F59E0B', fontWeight: '700', fontSize: 13 },
    
    activityItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    activityTypeIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    activityInfo: { flex: 1 },
    activityTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    activityMeta: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
    
    notesBox: { marginTop: 10, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#334155' },
    notesLabel: { color: '#94A3B8', fontSize: 13, fontWeight: '600', marginBottom: 4 },
    notesText: { color: '#CBD5E1', fontSize: 14, fontStyle: 'italic' },
    
    emptySummary: { alignItems: 'center', paddingVertical: 40 },
    emptySummaryIcon: { fontSize: 50, marginBottom: 16 },
    emptySummaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    emptySummarySub: { color: '#94A3B8', fontSize: 14, marginTop: 4 },
    noActivityText: { color: '#64748B', fontStyle: 'italic' }
});

export default ProgressTrackerScreen;
