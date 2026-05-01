import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { API_URL } from '../config/api';

const ProgressDashboardScreen = ({ navigation }) => {
  const [dashboard, setDashboard] = useState(null);
  const { token } = useContext(AuthContext);

  const fetchDashboard = async () => {
    try {
      if (!token) {
        navigation.navigate('Login');
        return;
      }

      const res = await axios.get(`${API_URL}/progress/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboard(res.data);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to load dashboard');
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (!dashboard) {
    return <Text style={styles.loading}>Loading goal dashboard...</Text>;
  }

  const profile = dashboard.user || {};
  const goals = dashboard.goals || [];
  const completed = goals.filter(g => g.status === 'completed').length;
  const active = goals.filter(g => g.status === 'active').length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.characterCard}>
        <Text style={styles.level}>Level {profile.level || 1}</Text>
        <Text style={styles.title}>{profile.title || 'Rookie'}</Text>
        <Text style={styles.xp}>XP: {profile.xp || 0}</Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{goals.length}</Text>
          <Text style={styles.summaryLabel}>Total Goals</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{active}</Text>
          <Text style={styles.summaryLabel}>Active</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{completed}</Text>
          <Text style={styles.summaryLabel}>Completed</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Goal List</Text>
      {goals.length === 0 ? (
        <Text style={styles.empty}>No goals yet. Create your first goal.</Text>
      ) : goals.map(goal => (
        <TouchableOpacity
          key={goal._id}
          style={styles.goalCard}
          onPress={() => navigation.navigate('GoalDetail', { goal })}
        >
          <Text style={styles.goalTitle}>{goal.title}</Text>
          <Text style={styles.goalDetail}>
            {goal.type?.replace('_', ' ')} • {goal.currentValue ?? 0}/{goal.targetValue} {goal.targetUnit}
          </Text>
          <Text style={styles.motivation}>{goal.motivationMessage || 'Keep going!'}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('GoalList')}>
        <Text style={styles.buttonText}>Manage Goals</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  content: { padding: 16, paddingBottom: 50 },
  characterCard: { backgroundColor: '#1E2937', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 20 },
  level: { fontSize: 44, fontWeight: '900', color: '#60A5FA' },
  title: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', marginVertical: 8 },
  xp: { color: '#94A3B8' },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 22 },
  summaryCard: { flex: 1, backgroundColor: '#1E2937', borderRadius: 16, padding: 16, alignItems: 'center' },
  summaryNumber: { fontSize: 28, fontWeight: '900', color: '#22C55E' },
  summaryLabel: { color: '#94A3B8', fontSize: 12, marginTop: 4 },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 12 },
  empty: { color: '#94A3B8', backgroundColor: '#1E2937', padding: 18, borderRadius: 16, textAlign: 'center' },
  goalCard: { backgroundColor: '#1E2937', borderRadius: 16, padding: 16, marginBottom: 12 },
  goalTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  goalDetail: { color: '#60A5FA', marginTop: 6, textTransform: 'capitalize' },
  motivation: { color: '#94A3B8', marginTop: 8 },
  button: { backgroundColor: '#3B82F6', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 18 },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  loading: { flex: 1, backgroundColor: '#0F172A', color: '#FFFFFF', textAlign: 'center', textAlignVertical: 'center', fontSize: 18 }
});

export default ProgressDashboardScreen;
