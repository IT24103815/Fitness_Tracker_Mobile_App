import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';

import { API_URL } from '../config';

// XP needed to reach next level
const xpForNextLevel = (level) => level * 500;

// Numeric stat chip
const StatChip = ({ label, value, color }) => (
  <View style={[styles.statChip, { borderColor: color }]}>
    <Text style={[styles.statChipValue, { color }]}>{value || 0}</Text>
    <Text style={styles.statChipLabel}>{label}</Text>
  </View>
);

const ProfileScreen = ({ navigation }) => {
  const { user, logout, changePassword } = useContext(AuthContext);

  const [liveUser, setLiveUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '' });
  const [changingPass, setChangingPass] = useState(false);

  const handleChangePassword = async () => {
    if(!passForm.currentPassword || !passForm.newPassword) return Alert.alert('Error', 'Please fill all fields');
    setChangingPass(true);
    try {
        await changePassword(passForm.currentPassword, passForm.newPassword);
        Alert.alert('Success', 'Password changed successfully!');
        setModalVisible(false);
        setPassForm({ currentPassword: '', newPassword: '' });
    } catch (e) {
        Alert.alert('Error', e.response?.data?.message || 'Failed to change password');
    } finally {
        setChangingPass(false);
    }
  };
  const isTrainer = user?.role === 'trainer';
  const isAdmin = user?.role === 'admin';
  const isClient = user?.role === 'client';
  const isManagement = isAdmin || isTrainer;

  // Fetch live gamification data for clients
  useFocusEffect(
    useCallback(() => {
      if (!isClient) return;
      axios.get(`${API_URL}/progress/dashboard`)
        .then(res => { if (res.data.success) setLiveUser(res.data.user); })
        .catch(() => {});
    }, [isClient])
  );

  const stats = liveUser?.stats || user?.stats || {};
  const level = liveUser?.level || user?.level || 1;
  const xp = liveUser?.xp || user?.xp || 0;
  const title = liveUser?.title || user?.title || 'Rookie';
  const currentStreak = liveUser?.currentStreak || user?.currentStreak || 0;
  const longestStreak = liveUser?.longestStreak || user?.longestStreak || 0;
  const nextLevelXp = xpForNextLevel(level);
  const xpProgress = Math.min((xp % 500) / 500, 1); // progress within current level

  const statConfig = [
    { key: 'strength', label: '💪 Strength', color: '#EF4444' },
    { key: 'endurance', label: '🫀 Endurance', color: '#F59E0B' },
    { key: 'stamina', label: '⚡ Stamina', color: '#10B981' },
    { key: 'flexibility', label: '🤸 Flexibility', color: '#3B82F6' },
    { key: 'explosivePower', label: '🔥 Power', color: '#8B5CF6' },
    { key: 'coreStability', label: '🎯 Core', color: '#EC4899' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ── Avatar + Identity ── */}
      <View style={styles.header}>
        {user?.profilePicture ? (
          <Image source={{ uri: user.profilePicture }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
        )}
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={[styles.roleBadge, isManagement && { backgroundColor: '#7C3AED' }]}>
          <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
        </View>
      </View>

      {/* ── GAMIFIED STATS PANEL (Client only) ── */}
      {isClient && (
        <View style={styles.gameCard}>
          {/* Level Banner */}
          <View style={styles.levelBanner}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelNum}>{level}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.titleText}>{title}</Text>
              <Text style={styles.xpLabel}>XP: {xp} / {nextLevelXp}</Text>
            </View>
            <View style={styles.streakBox}>
              <Text style={styles.streakFire}>🔥</Text>
              <Text style={styles.streakCount}>{currentStreak}</Text>
              <Text style={styles.streakSub}>streak</Text>
            </View>
          </View>

          {/* XP Progress Bar */}
          <View style={styles.xpBarBg}>
            <View style={[styles.xpBarFill, { width: `${xpProgress * 100}%` }]} />
          </View>
          <Text style={styles.xpHint}>
            {500 - (xp % 500)} XP to Level {level + 1} · Best Streak: {longestStreak} days
          </Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Stat Grid (numeric chips) */}
          <Text style={styles.statsTitle}>Fitness Attributes</Text>
          <View style={styles.statGrid}>
            {statConfig.map(s => (
              <StatChip key={s.key} label={s.label} value={stats[s.key]} color={s.color} />
            ))}
          </View>

          {/* Overall Score Chip */}
          <View style={styles.overallRow}>
            <Text style={styles.overallLabel}>Overall Score</Text>
            <View style={styles.overallBadge}>
              <Text style={styles.overallScore}>{stats.overallScore || 0}</Text>
            </View>
          </View>

          {/* BMI if available */}
          {(liveUser?.bmi || user?.bmi) && (
            <View style={styles.bmiRow}>
              <Text style={styles.bmiLabel}>BMI</Text>
              <Text style={styles.bmiValue}>{liveUser?.bmi || user?.bmi}</Text>
            </View>
          )}

          <TouchableOpacity 
            style={styles.analyticsBtn} 
            onPress={() => navigation.navigate('ProgressAnalytics')}
          >
            <Text style={styles.analyticsBtnText}>View Weight Analysis & Trends</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Management identity info ── */}
      {isTrainer && <Text style={styles.mgmtTag}>⚡ Professional Trainer</Text>}
      {isAdmin && <Text style={[styles.mgmtTag, { color: '#A78BFA' }]}>🛡️ System Administrator</Text>}

      {/* ── Navigation Buttons ── */}
      <View style={styles.buttonSection}>
        {isManagement ? (
          <>
            <Text style={styles.sectionHeader}>Management Dashboard</Text>
            {isTrainer && (
              <NavButton icon="👥" label="My Personal Clients" onPress={() => navigation.navigate('MyClients')} accent="#10B981" />
            )}
            <NavButton icon="🏋️" label="Exercise Library" onPress={() => navigation.navigate('ExerciseList')} />
            <NavButton icon="💻" label="Workout Templates" onPress={() => navigation.navigate('WorkoutList')} />
            <NavButton icon="🍽️" label="Meal Templates" onPress={() => navigation.navigate('MealTemplateList')} />
            <NavButton icon="🏆" label="Challenge Management" onPress={() => navigation.navigate('ChallengeList')} />
            {isAdmin && (
              <NavButton icon="⚙️" label="System User Management" onPress={() => navigation.navigate('UserManagement')} />
            )}
          </>
        ) : (
          <>
            <Text style={styles.sectionHeader}>My Fitness Journey</Text>
            <NavButton icon="🏋️" label="Explore Exercises" onPress={() => navigation.navigate('ExerciseList')} />
            <NavButton icon="📅" label="My Workout Plans" onPress={() => navigation.navigate('WorkoutList')} />
            <NavButton icon="🍽️" label="My Meal Plans" onPress={() => navigation.navigate('MealPlanList')} />
            <NavButton icon="🎯" label="My Goals" onPress={() => navigation.navigate('GoalList')} />
            <NavButton icon="📈" label="Progress Tracker" onPress={() => navigation.navigate('ProgressTracker')} accent="#10B981" />
            <NavButton icon="📊" label="Weight Analytics" onPress={() => navigation.navigate('ProgressAnalytics')} />
            <NavButton icon="🏆" label="Weekly Challenges" onPress={() => navigation.navigate('MyWeeklyChallenges')} />
          </>
        )}
      </View>

      <View style={styles.buttonSection}>
        <Text style={styles.sectionHeader}>Account</Text>
        <NavButton icon="🔑" label="Change Password" onPress={() => setModalVisible(true)} />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Change Password</Text>
                  <TextInput
                      style={styles.modalInput}
                      placeholder="Current Password"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry
                      value={passForm.currentPassword}
                      onChangeText={(v) => setPassForm({...passForm, currentPassword: v})}
                  />
                  <TextInput
                      style={styles.modalInput}
                      placeholder="New Password"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry
                      value={passForm.newPassword}
                      onChangeText={(v) => setPassForm({...passForm, newPassword: v})}
                  />
                  <TouchableOpacity style={styles.saveBtn} onPress={handleChangePassword} disabled={changingPass}>
                      {changingPass ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Update Password</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
              </View>
          </View>
      </Modal>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
};

const NavButton = ({ icon, label, onPress, accent }) => (
  <TouchableOpacity
    style={[styles.navButton, accent && { borderLeftColor: accent, borderLeftWidth: 4 }]}
    onPress={onPress}
  >
    <Text style={styles.navIcon}>{icon}</Text>
    <Text style={styles.navLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  content: { padding: 20, paddingBottom: 40 },

  // Header
  header: { alignItems: 'center', marginTop: 20, marginBottom: 24 },
  avatar: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: '#3B82F6' },
  avatarPlaceholder: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: '#1E2937', alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#3B82F6',
  },
  avatarEmoji: { fontSize: 52 },
  editIconBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#3B82F6', borderRadius: 12, padding: 6, borderWidth: 2, borderColor: '#0F172A' },
  name: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', marginTop: 14 },
  email: { fontSize: 15, color: '#94A3B8', marginTop: 4 },
  roleBadge: { backgroundColor: '#1D4ED8', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, marginTop: 10 },
  roleText: { color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: 1.5 },

  // Gamified card
  gameCard: {
    backgroundColor: '#1E2937',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  levelBanner: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  levelBadge: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center',
    marginRight: 14, borderWidth: 2, borderColor: '#60A5FA',
  },
  levelNum: { fontSize: 22, fontWeight: '900', color: '#FFFFFF' },
  titleText: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  xpLabel: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  streakBox: { alignItems: 'center', marginLeft: 'auto' },
  streakFire: { fontSize: 24 },
  streakCount: { fontSize: 22, fontWeight: '800', color: '#F59E0B', lineHeight: 24 },
  streakSub: { fontSize: 11, color: '#94A3B8' },

  xpBarBg: { height: 10, backgroundColor: '#334155', borderRadius: 5, marginBottom: 6, overflow: 'hidden' },
  xpBarFill: { height: '100%', backgroundColor: '#3B82F6', borderRadius: 5 },
  xpHint: { fontSize: 12, color: '#64748B', textAlign: 'center', marginBottom: 16 },

  divider: { borderTopWidth: 1, borderTopColor: '#334155', marginBottom: 16 },
  statsTitle: { fontSize: 14, fontWeight: '700', color: '#60A5FA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },

  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 4 },
  statChip: {
    width: '30%', flexGrow: 1,
    backgroundColor: '#0F172A',
    borderRadius: 14, borderWidth: 1.5,
    paddingVertical: 12, paddingHorizontal: 10,
    alignItems: 'center',
  },
  statChipValue: { fontSize: 26, fontWeight: '900' },
  statChipLabel: { fontSize: 11, color: '#94A3B8', marginTop: 4, textAlign: 'center', fontWeight: '500' },

  overallRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  overallLabel: { fontSize: 15, color: '#94A3B8', fontWeight: '600' },
  overallBadge: {
    backgroundColor: '#334155', paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: '#60A5FA',
  },
  overallScore: { fontSize: 18, fontWeight: '900', color: '#60A5FA' },

  bmiRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#334155' },
  bmiLabel: { color: '#94A3B8', fontSize: 14, letterSpacing: 1 },
  bmiValue: { fontSize: 22, fontWeight: '900', color: '#60A5FA' },
  analyticsBtn: { backgroundColor: '#334155', padding: 16, borderRadius: 16, marginTop: 20, alignItems: 'center', borderWidth: 1, borderColor: '#3B82F6' },
  analyticsBtnText: { color: '#60A5FA', fontWeight: 'bold', fontSize: 14 },

  mgmtTag: { color: '#10B981', fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 20 },

  // Navigation
  buttonSection: { gap: 10, marginBottom: 30 },
  sectionHeader: { color: '#60A5FA', fontSize: 16, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  navButton: {
    backgroundColor: '#1E2937', paddingVertical: 16, paddingHorizontal: 18,
    borderRadius: 16, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#334155',
  },
  navIcon: { fontSize: 22, marginRight: 14 },
  navLabel: { color: '#FFFFFF', fontSize: 17, fontWeight: '600' },

  logoutButton: { backgroundColor: '#EF4444', paddingVertical: 18, borderRadius: 16 },
  logoutText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', textAlign: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1E2937', borderRadius: 28, padding: 24, borderWidth: 1, borderColor: '#334155' },
  modalTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  modalInput: { backgroundColor: '#0F172A', color: '#fff', padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#334155', fontSize: 16 },
  saveBtn: { backgroundColor: '#3B82F6', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cancelBtn: { padding: 16, alignItems: 'center', marginTop: 5 },
  cancelBtnText: { color: '#94A3B8', fontSize: 16 },
});

export default ProfileScreen;
