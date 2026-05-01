import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>🎯</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.role}>{user?.role?.toUpperCase()}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Goal Management</Text>
        <Text style={styles.cardText}>
          Create fitness goals, update current progress, track completion, and manage your goal journey.
        </Text>

        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('GoalList')}>
          <Text style={styles.buttonText}>Open My Goals</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('GoalDashboard')}>
          <Text style={styles.buttonText}>Open Goal Dashboard</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  content: { padding: 20, paddingBottom: 50 },
  header: { alignItems: 'center', marginTop: 35, marginBottom: 25 },
  avatar: { width: 92, height: 92, borderRadius: 46, backgroundColor: '#1E2937', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#60A5FA' },
  avatarText: { fontSize: 42 },
  name: { color: '#FFFFFF', fontSize: 28, fontWeight: '900', marginTop: 14 },
  email: { color: '#94A3B8', fontSize: 15, marginTop: 4 },
  role: { color: '#60A5FA', fontWeight: '800', marginTop: 8 },
  card: { backgroundColor: '#1E2937', borderRadius: 24, padding: 22, borderWidth: 1, borderColor: '#334155' },
  cardTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '900', marginBottom: 10 },
  cardText: { color: '#94A3B8', fontSize: 15, lineHeight: 22, marginBottom: 18 },
  primaryButton: { backgroundColor: '#3B82F6', padding: 18, borderRadius: 16, alignItems: 'center', marginBottom: 12 },
  secondaryButton: { backgroundColor: '#10B981', padding: 18, borderRadius: 16, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  logoutButton: { backgroundColor: '#EF4444', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 24 },
  logoutText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});

export default ProfileScreen;
