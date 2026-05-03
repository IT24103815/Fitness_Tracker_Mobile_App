import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
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
  const [errors, setErrors] = useState({});

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date(2000, 0, 1));

  const { register } = useContext(AuthContext);

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      setForm({ ...form, dateOfBirth: selectedDate.toISOString().split('T')[0] });
    }
  };

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
    const newErrors = {};
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!name || name.length < 2) {
      newErrors.name = 'Please enter your full name (min 2 characters)';
    }

    if (!email.includes('@')) {
      newErrors.email = 'Please provide a valid email address';
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{8,}$/;
    if (!passwordRegex.test(password)) {
      newErrors.password = 'Password must be 8+ chars with a capital letter, a number, and a special character';
    }

    if (form.role === 'client') {
      if (form.fitnessGoals.length === 0) {
        newErrors.fitnessGoals = 'Please select at least one fitness goal';
      }
      
      let age = NaN;
      if (form.dateOfBirth) {
        const birthDate = new Date(form.dateOfBirth);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }

      const weight = Number(form.currentWeight);
      const height = Number(form.height);

      if (isNaN(age) || age < 12 || age > 100) {
        newErrors.age = 'Age must be between 12 and 100 years old';
      }
      if (isNaN(weight) || weight <= 20) {
        newErrors.currentWeight = 'Please provide a valid weight (> 20kg)';
      }
      if (isNaN(height) || height <= 50) {
        newErrors.height = 'Please provide a valid height (> 50cm)';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Alert.alert('Form Error', 'Please check the highlighted fields.');
      return;
    }
    setErrors({});

    try {
      const submitData = { ...form, email }; // Send lowercase email
      if (form.role === 'trainer') {
        submitData.specializations = form.specializations ? form.specializations.split(',').map(s => s.trim()).filter(Boolean) : [];
        submitData.certifications = form.certifications ? form.certifications.split(',').map(s => s.trim()).filter(Boolean) : [];
        if (form.experienceYears) {
          submitData.experienceYears = parseInt(form.experienceYears, 10);
        }
      }

      await register(submitData);
    } catch (err) {
      console.error('REGISTER ERROR:', JSON.stringify({
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        code: err.code,
      }));
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
          style={[styles.input, errors.name && styles.inputError]} 
          placeholder="Full Name" 
          placeholderTextColor="#94A3B8"
          value={form.name} 
          onChangeText={v => {
            setForm({...form, name: v});
            if (errors.name) setErrors({...errors, name: null});
          }} 
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

        <TextInput 
          style={[styles.input, errors.email && styles.inputError]} 
          placeholder="Email" 
          placeholderTextColor="#94A3B8"
          value={form.email} 
          onChangeText={v => {
            setForm({...form, email: v});
            if (errors.email) setErrors({...errors, email: null});
          }} 
          keyboardType="email-address" 
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <TextInput 
          style={[styles.input, errors.password && styles.inputError]} 
          placeholder="Password" 
          placeholderTextColor="#94A3B8"
          value={form.password} 
          onChangeText={v => {
            setForm({...form, password: v});
            if (errors.password) setErrors({...errors, password: null});
          }} 
          secureTextEntry 
        />
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

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

            <Text style={styles.label}>Date of Birth</Text>
            <TouchableOpacity 
              style={[styles.input, errors.age && styles.inputError]} 
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ color: form.dateOfBirth ? '#FFFFFF' : '#94A3B8', fontSize: 17 }}>
                {form.dateOfBirth || "Select Date of Birth"}
              </Text>
            </TouchableOpacity>
            {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}

            <View style={styles.row}>
              <View style={{flex: 1}}>
                <TextInput 
                  style={[styles.input, { paddingHorizontal: 12 }, errors.height && styles.inputError]} 
                  placeholder="Height (cm)" 
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric" 
                  value={form.height} 
                  onChangeText={v => {
                    setForm({...form, height: v});
                    if (errors.height) setErrors({...errors, height: null});
                  }} 
                />
                {errors.height && <Text style={styles.errorText}>{errors.height}</Text>}
              </View>
              <View style={{flex: 1, marginLeft: 12}}>
                <TextInput 
                  style={[styles.input, { paddingHorizontal: 12 }, errors.currentWeight && styles.inputError]} 
                  placeholder="Weight (kg)" 
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric" 
                  value={form.currentWeight} 
                  onChangeText={v => {
                    setForm({...form, currentWeight: v});
                    if (errors.currentWeight) setErrors({...errors, currentWeight: null});
                  }} 
                />
                {errors.currentWeight && <Text style={styles.errorText}>{errors.currentWeight}</Text>}
              </View>
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
            <View style={[styles.optionRow, errors.fitnessGoals && styles.inputError, { borderStyle: 'dashed' }]}>
              {goalsList.map(goal => (
                <TouchableOpacity
                  key={goal}
                  style={[
                    styles.optionButton,
                    form.fitnessGoals.includes(goal) && styles.optionButtonActive
                  ]}
                  onPress={() => {
                    toggleGoal(goal);
                    if (errors.fitnessGoals) setErrors({...errors, fitnessGoals: null});
                  }}
                >
                  <Text style={styles.optionText}>
                    {goal.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.fitnessGoals && <Text style={styles.errorText}>{errors.fitnessGoals}</Text>}
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
  avatarSection: { alignItems: 'center', marginBottom: 20 },
  avatarPicker: { marginBottom: 8 },
  avatarPreview: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#3B82F6' },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#1E2937', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#334155', borderStyle: 'dashed' },
  avatarEmoji: { fontSize: 40 },
  avatarHint: { color: '#94A3B8', fontSize: 13 }
});

export default RegisterScreen;
