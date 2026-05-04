import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet, ActivityIndicator, Modal, FlatList } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';

import { API_URL } from '../config';

const ChallengeBuilder = ({ navigation, isEditing = false, challengeData = null }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTaskIdx, setActiveTaskIdx] = useState(null);

  const [form, setForm] = useState({
    title: challengeData?.title || '',
    description: challengeData?.description || '',
    category: challengeData?.category || ['strength'],
    difficulty: challengeData?.difficulty || 'medium',
    minLevel: challengeData?.minLevel?.toString() || '1',
    rewardXP: challengeData?.rewardXP?.toString() || '200'
  });

  const [tasks, setTasks] = useState(challengeData?.tasks || [{ exercise: null, sets: '3', reps: '10' }]);
  const [rewardStats, setRewardStats] = useState({
    strength: challengeData?.rewardStats?.strength?.toString() || '0',
    endurance: challengeData?.rewardStats?.endurance?.toString() || '0',
    stamina: challengeData?.rewardStats?.stamina?.toString() || '0',
    flexibility: challengeData?.rewardStats?.flexibility?.toString() || '0',
    explosivePower: challengeData?.rewardStats?.explosivePower?.toString() || '0',
    coreStability: challengeData?.rewardStats?.coreStability?.toString() || '0',
  });

  const categoryOptions = ['strength', 'endurance', 'consistency', 'nutrition', 'mixed'];
  const difficultyOptions = ['easy', 'medium', 'hard'];

  useEffect(() => {
    fetchExerciseLibrary();
  }, []);

  const fetchExerciseLibrary = async () => {
    setLibraryLoading(true);
    try {
      const res = await axios.get(`${API_URL}/exercises`);
      setExercises(res.data.exercises || []);
    } catch (err) {
      console.log('Error fetching library:', err.message);
    } finally {
      setLibraryLoading(false);
    }
  };

  const addTask = () => setTasks([...tasks, { exercise: null, sets: '3', reps: '10' }]);
  const removeTask = (idx) => setTasks(tasks.filter((_, i) => i !== idx));

  const selectExercise = (item) => {
    const next = [...tasks];
    next[activeTaskIdx].exercise = item;
    setTasks(next);
    setModalVisible(false);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      Alert.alert('Error', 'Please fill in title and description');
      return;
    }

    if (tasks.some(t => !t.exercise)) {
      Alert.alert('Error', 'Please select an exercise for each slot');
      return;
    }

    // New Reward Validations
    const xpReward = parseInt(form.rewardXP);
    if (xpReward > 800) {
      Alert.alert('Invalid Reward', 'XP reward cannot exceed 800 XP per challenge.');
      return;
    }

    const invalidStats = Object.entries(rewardStats).filter(([stat, value]) => parseInt(value) > 20);
    if (invalidStats.length > 0) {
      Alert.alert('Invalid Reward', 'Individual stat rewards cannot exceed 20 points.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        minLevel: parseInt(form.minLevel),
        rewardXP: parseInt(form.rewardXP),
        tasks: tasks.map(t => ({ 
          exercise: t.exercise._id || t.exercise, 
          sets: parseInt(t.sets), 
          reps: t.reps 
        })),
        rewardStats: Object.fromEntries(Object.entries(rewardStats).map(([k, v]) => [k, parseInt(v) || 0]))
      };

      if (isEditing) {
        await axios.put(`${API_URL}/challenges/${challengeData._id}`, payload);
        Alert.alert('Success', 'Challenge updated!');
      } else {
        await axios.post(`${API_URL}/challenges`, payload);
        Alert.alert('Success', 'Challenge template created!');
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save challenge');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{isEditing ? 'Edit Challenge' : 'Create New Challenge'}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Challenge Title</Text>
        <TextInput style={styles.input} value={form.title} onChangeText={v => setForm({...form, title: v})} placeholder="e.g. Spartan Strength Week"/>

        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, {height: 80}]} multiline value={form.description} onChangeText={v => setForm({...form, description: v})} placeholder="Describe the goal..."/>

        <View style={styles.row}>
          <View style={{flex: 1}}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.optionRow}>
              {categoryOptions.map(c => (
                <TouchableOpacity 
                   key={c} 
                   style={[styles.miniBtn, form.category.includes(c) && styles.miniBtnActive]} 
                   onPress={() => {
                     const next = form.category.includes(c) 
                       ? form.category.filter(item => item !== c)
                       : [...form.category, c];
                     if (next.length === 0) return;
                     setForm({...form, category: next});
                   }}
                >
                  <Text style={styles.miniBtnText}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.row}>
          <View style={{flex: 1}}>
            <Text style={styles.label}>Difficulty</Text>
            <View style={styles.optionRow}>
              {difficultyOptions.map(d => (
                <TouchableOpacity key={d} style={[styles.miniBtn, form.difficulty === d && styles.miniBtnActive]} onPress={() => setForm({...form, difficulty: d})}>
                  <Text style={styles.miniBtnText}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.row}>
          <View style={{flex: 1}}>
            <Text style={styles.label}>Min Level</Text>
            <TextInput style={styles.input} value={form.minLevel} keyboardType="numeric" onChangeText={v => setForm({...form, minLevel: v})}/>
          </View>
          <View style={{flex: 1, marginLeft: 10}}>
            <Text style={styles.label}>XP Reward</Text>
            <TextInput style={styles.input} value={form.rewardXP} keyboardType="numeric" onChangeText={v => setForm({...form, rewardXP: v})}/>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Exercises</Text>
      {tasks.map((task, idx) => (
        <View key={idx} style={styles.taskCard}>
          <View style={styles.taskHeader}>
            <Text style={{color: '#60A5FA', fontWeight: 'bold'}}>Exercise #{idx+1}</Text>
            <TouchableOpacity onPress={() => removeTask(idx)}><Text style={{color: '#EF4444'}}>Remove</Text></TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.exercisePicker} 
            onPress={() => {
              setActiveTaskIdx(idx);
              setModalVisible(true);
            }}
          >
            <Text style={{color: task.exercise ? '#fff' : '#94A3B8'}}>
              {task.exercise?.name || 'Choose Exercise...'}
            </Text>
          </TouchableOpacity>

          <View style={styles.row}>
            <TextInput style={[styles.input, {flex: 1}]} placeholder="Sets" keyboardType="numeric" value={task.sets?.toString()} onChangeText={v => {
              const next = [...tasks];
              next[idx].sets = v;
              setTasks(next);
            }}/>
            <TextInput style={[styles.input, {flex: 2, marginLeft: 10}]} placeholder="Reps" value={task.reps} onChangeText={v => {
              const next = [...tasks];
              next[idx].reps = v;
              setTasks(next);
            }}/>
          </View>
        </View>
      ))}
      <TouchableOpacity style={styles.addBtn} onPress={addTask}><Text style={{color: '#3B82F6'}}>+ Add Exercise</Text></TouchableOpacity>

      <Text style={styles.sectionTitle}>Stat Rewards</Text>
      <View style={styles.card}>
        <View style={styles.statGrid}>
          {Object.keys(rewardStats).map(stat => (
            <View key={stat} style={styles.statInputGroup}>
              <Text style={styles.statLabel}>{stat.replace(/([A-Z])/g, ' $1')}</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="numeric" 
                value={rewardStats[stat]} 
                onChangeText={v => setRewardStats({...rewardStats, [stat]: v})}
              />
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.submitBtnText}>{isEditing ? 'Save Changes' : 'Create Challenge Template'}</Text>}
      </TouchableOpacity>

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Select Exercise</Text>
            <FlatList
                data={exercises}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.libItem} onPress={() => selectExercise(item)}>
                    <Text style={styles.libName}>{item.name}</Text>
                    <Text style={styles.libSub}>{item.category} • {item.difficulty}</Text>
                  </TouchableOpacity>
                )}
              />
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                <Text style={{color: '#fff', fontWeight: 'bold'}}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const CreateChallengeScreen = ({ navigation }) => <ChallengeBuilder navigation={navigation} />;
const EditChallengeScreen = ({ route, navigation }) => <ChallengeBuilder navigation={navigation} isEditing challengeData={route.params.challenge} />;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 16 },
  header: { fontSize: 24, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', marginBottom: 20 },
  sectionTitle: { color: '#60A5FA', fontSize: 18, fontWeight: 'bold', marginVertical: 15 },
  card: { backgroundColor: '#1E2937', borderRadius: 20, padding: 16, marginBottom: 20 },
  label: { color: '#94A3B8', fontSize: 13, marginBottom: 8, marginTop: 10 },
  input: { backgroundColor: '#334155', color: '#FFFFFF', padding: 12, borderRadius: 10, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginVertical: 12 },
  miniBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#334155', borderWidth: 1, borderColor: '#475569' },
  miniBtnActive: { backgroundColor: '#3B82F6', borderColor: '#60A5FA' },
  miniBtnText: { color: '#fff', fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
  taskCard: { backgroundColor: '#1E2937', padding: 16, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: '#334155' },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  exercisePicker: { backgroundColor: '#0F172A', padding: 16, borderRadius: 12, marginBottom: 10, borderStyle: 'dotted', borderWidth: 1, borderColor: '#334155' },
  addBtn: { padding: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: '#3B82F6', borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statInputGroup: { width: '47%' },
  statLabel: { color: '#94A3B8', fontSize: 11, marginBottom: 4, textTransform: 'capitalize' },
  submitBtn: { backgroundColor: '#3B82F6', padding: 18, borderRadius: 16, marginVertical: 30, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1E2937', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, height: '70%' },
  modalHeader: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 20, textAlign: 'center' },
  libItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#334155' },
  libName: { color: '#fff', fontSize: 16, fontWeight: '600' },
  libSub: { color: '#94A3B8', fontSize: 12, marginTop: 4 },
  closeBtn: { backgroundColor: '#EF4444', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 }
});

export { CreateChallengeScreen, EditChallengeScreen };
