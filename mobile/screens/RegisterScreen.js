import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';

const RegisterScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client',
    gender: 'prefer_not_to_say',
    dateOfBirth: '',
    height: '',
    currentWeight: '',
    targetWeight: '',
    preferredUnits: 'metric',
    fitnessGoals: [],
    activityLevel: 'moderate',
    experienceLevel: 'beginner',
    bio: '',
    specializations: '',
    experienceYears: '',
    certifications: ''
  });

  const { register } = useContext(AuthContext);

  const toggleGoal = (goal) => {
    setForm(prev => {
      const currentGoals = prev.fitnessGoals || [];
      if (currentGoals.includes(goal)) {
        return { ...prev, fitnessGoals: currentGoals.filter(g => g !== goal) };
      } else {
        return { ...prev, fitnessGoals: [...currentGoals, goal] };
      }
    });
  };

  const handleRegister = async () => {
    // Basic Trimming
    const name = form.name.trim();
    const email = form.email.trim();
    const password = form.password;

    // Field Checks
    if (!name || name.length < 2) {
      Alert.alert('Invalid Name', 'Please enter your full name (minimum 2 characters).');
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please provide a valid email address.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Security requirement: Password must be at least 6 characters long.');
      return;
    }

    if (form.role === 'client') {
      if (form.fitnessGoals.length === 0) {
        Alert.alert('Setup Required', 'Please select at least one fitness goal to personalize your journey.');
        return;
      }
      
      const weight = Number(form.currentWeight);
      const height = Number(form.height);

      if (form.dateOfBirth) {
        const birthDate = new Date(form.dateOfBirth);
        if (isNaN(birthDate.getTime())) {
          Alert.alert('Invalid Date', 'Use YYYY-MM-DD format for date of birth.');
          return;
        }
        const age = new Date().getFullYear() - birthDate.getFullYear();
        if (age < 12 || age > 100) {
          Alert.alert('Invalid Age', 'Please provide a realistic date of birth.');
          return;
        }
      }

      if (isNaN(weight) || weight <= 20) {
        Alert.alert('Invalid Weight', 'Please provide a valid weight in kg.');
        return;
      }
      if (isNaN(height) || height <= 50) {
        Alert.alert('Invalid Height', 'Please provide a valid height in cm.');
        return;
      }
    }

    try {
      const submitData = { ...form };
      if (form.role === 'trainer') {
        submitData.specializations = form.specializations ? form.specializations.split(',').map(s => s.trim()).filter(Boolean) : [];
        submitData.certifications = form.certifications ? form.certifications.split(',').map(s => s.trim()).filter(Boolean) : [];
        if (form.experienceYears) {
          submitData.experienceYears = parseInt(form.experienceYears, 10);
        }
      }

      await register(submitData);
    } catch (err) {
      Alert.alert('Failed', err.response?.data?.message || err.message || 'Registration failed');
    }
  };

  const goalsList = [
    'weight_loss',
    'muscle_gain',
    'maintenance',
    'endurance',
    'strength',
    'general_fitness'
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>FitTrack</Text>
      <Text style={styles.subtitle}>Create your fitness profile</Text>

      <View style={styles.card}>
        <TextInput 
          style={styles.input} 
          placeholder="Full Name" 
          placeholderTextColor="#94A3B8"
          value={form.name} 
          onChangeText={v => setForm({...form, name: v})} 
        />

        <TextInput 
          style={styles.input} 
          placeholder="Email" 
          placeholderTextColor="#94A3B8"
          value={form.email} 
          onChangeText={v => setForm({...form, email: v})} 
          keyboardType="email-address" 
        />

        <TextInput 
          style={styles.input} 
          placeholder="Password" 
          placeholderTextColor="#94A3B8"
          value={form.password} 
          onChangeText={v => setForm({...form, password: v})} 
          secureTextEntry 
        />

        <Text style={styles.label}>I am registering as a</Text>
        <View style={styles.optionRow}>
          {['client', 'trainer'].map(r => (
            <TouchableOpacity
              key={r}
              style={[styles.optionButton, form.role === r && styles.optionButtonActive]}
              onPress={() => setForm({...form, role: r})}
            >
              <Text style={styles.optionText}>{r.charAt(0).toUpperCase() + r.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {form.role === 'client' && (
          <>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.optionRow}>
              {['male', 'female', 'non-binary', 'prefer_not_to_say'].map(g => (
                <TouchableOpacity
                  key={g}
                  style={[styles.optionButton, form.gender === g && styles.optionButtonActive]}
                  onPress={() => setForm({...form, gender: g})}
                >
                  <Text style={styles.optionText}>{g.replace('_', ' ')}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput 
              style={styles.input} 
              placeholder="Date of Birth (YYYY-MM-DD)" 
              placeholderTextColor="#94A3B8"
              value={form.dateOfBirth} 
              onChangeText={v => setForm({...form, dateOfBirth: v})} 
            />

            <View style={styles.row}>
              <TextInput 
                style={[styles.input, {flex: 1}]} 
                placeholder="Height (cm)" 
                placeholderTextColor="#94A3B8"
                keyboardType="numeric" 
                value={form.height} 
                onChangeText={v => setForm({...form, height: v})} 
              />
              <TextInput 
                style={[styles.input, {flex: 1, marginLeft: 12}]} 
                placeholder="Current Weight" 
                placeholderTextColor="#94A3B8"
                keyboardType="numeric" 
                value={form.currentWeight} 
                onChangeText={v => setForm({...form, currentWeight: v})} 
              />
            </View>

            <TextInput 
              style={styles.input} 
              placeholder="Target Weight" 
              placeholderTextColor="#94A3B8"
              keyboardType="numeric" 
              value={form.targetWeight} 
              onChangeText={v => setForm({...form, targetWeight: v})} 
            />

            {/* Multi-select Fitness Goals */}
            <Text style={styles.label}>Main Fitness Goals</Text>
            <View style={styles.optionRow}>
              {goalsList.map(goal => (
                <TouchableOpacity
                  key={goal}
                  style={[
                    styles.optionButton,
                    form.fitnessGoals.includes(goal) && styles.optionButtonActive
                  ]}
                  onPress={() => toggleGoal(goal)}
                >
                  <Text style={styles.optionText}>
                    {goal.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {form.role === 'trainer' && (
          <>
            <TextInput
              style={[styles.input, { height: 100 }]}
              placeholder="Bio / Description"
              placeholderTextColor="#94A3B8"
              value={form.bio}
              onChangeText={v => setForm({...form, bio: v})}
              multiline
              textAlignVertical="top"
            />
            <TextInput
              style={styles.input}
              placeholder="Specializations (comma separated)"
              placeholderTextColor="#94A3B8"
              value={form.specializations}
              onChangeText={v => setForm({...form, specializations: v})}
            />
            <TextInput
              style={styles.input}
              placeholder="Years of Experience"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={form.experienceYears}
              onChangeText={v => setForm({...form, experienceYears: v})}
            />
            <TextInput
              style={styles.input}
              placeholder="Certifications (comma separated)"
              placeholderTextColor="#94A3B8"
              value={form.certifications}
              onChangeText={v => setForm({...form, certifications: v})}
            />
          </>
        )}

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>Create My Account</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.linkContainer}>
          <Text style={styles.linkText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 24 },
  title: { fontSize: 48, fontWeight: '900', color: '#60A5FA', textAlign: 'center', marginBottom: 8, marginTop: 40 },
  subtitle: { fontSize: 18, color: '#94A3B8', textAlign: 'center', marginBottom: 30 },
  card: { backgroundColor: '#1E2937', borderRadius: 24, padding: 28, marginBottom: 40 },
  input: {
    backgroundColor: '#334155',
    color: '#FFFFFF',
    fontSize: 17,
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
  },
  label: { 
    color: '#94A3B8', 
    fontSize: 15, 
    marginBottom: 10, 
    marginTop: 8 
  },
  optionRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 10, 
    marginBottom: 20 
  },
  optionButton: {
    backgroundColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  optionButtonActive: { 
    backgroundColor: '#3B82F6' 
  },
  optionText: { 
    color: '#FFFFFF', 
    fontSize: 15 
  },
  row: { 
    flexDirection: 'row', 
    marginBottom: 12 
  },
  registerButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 20,
    borderRadius: 16,
    marginTop: 20,
  },
  registerButtonText: { 
    color: '#FFFFFF', 
    fontSize: 20, 
    fontWeight: '600', 
    textAlign: 'center' 
  },
  linkContainer: { 
    marginTop: 24, 
    alignItems: 'center' 
  },
  linkText: { 
    color: '#60A5FA', 
    fontSize: 17 
  },
});

export default RegisterScreen;