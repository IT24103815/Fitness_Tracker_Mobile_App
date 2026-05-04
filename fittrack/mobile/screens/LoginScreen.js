import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, StyleSheet } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    try {
      await login(email.toLowerCase().trim(), password);
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>FitTrack</Text>
          <Text style={styles.subtitle}>Train Smarter • Live Stronger</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome Back</Text>

          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#64748B"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#64748B"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkContainer}>
            <Text style={styles.linkText}>New here? Create an account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingTop: 80 },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 52, fontWeight: '900', color: '#60A5FA', letterSpacing: -2 },
  subtitle: { fontSize: 18, color: '#94A3B8', marginTop: 4 },
  card: { backgroundColor: '#1E2937', borderRadius: 24, padding: 32 },
  cardTitle: { fontSize: 28, fontWeight: '600', color: '#FFFFFF', textAlign: 'center', marginBottom: 24 },
  input: {
    backgroundColor: '#334155',
    color: '#FFFFFF',
    fontSize: 17,
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 18,
    borderRadius: 16,
    marginTop: 8,
  },
  buttonText: { color: '#FFFFFF', fontSize: 19, fontWeight: '600', textAlign: 'center' },
  linkContainer: { marginTop: 24, alignItems: 'center' },
  linkText: { color: '#60A5FA', fontSize: 17, fontWeight: '500' },
});

export default LoginScreen;
