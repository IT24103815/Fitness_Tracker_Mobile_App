import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';

import { AuthProvider, AuthContext } from './contexts/AuthContext';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProfileScreen from './screens/ProfileScreen';
import GoalListScreen from './screens/GoalListScreen';
import CreateGoalScreen from './screens/CreateGoalScreen';
import GoalDetailScreen from './screens/GoalDetailScreen';
import EditGoalScreen from './screens/EditGoalScreen';
import ProgressDashboardScreen from './screens/ProgressDashboardScreen';

const Stack = createNativeStackNavigator();

const NavigationWrapper = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#60A5FA" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#0F172A' },
          headerTintColor: '#60A5FA',
          contentStyle: { backgroundColor: '#0F172A' },
          headerTitleStyle: { fontWeight: '800' },
        }}
      >
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Goal Management' }} />
            <Stack.Screen name="GoalList" component={GoalListScreen} options={{ title: 'My Goals' }} />
            <Stack.Screen name="CreateGoal" component={CreateGoalScreen} options={{ title: 'Create Goal' }} />
            <Stack.Screen name="GoalDetail" component={GoalDetailScreen} options={{ title: 'Goal Details' }} />
            <Stack.Screen name="EditGoal" component={EditGoalScreen} options={{ title: 'Edit Goal' }} />
            <Stack.Screen name="GoalDashboard" component={ProgressDashboardScreen} options={{ title: 'Goal Dashboard' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationWrapper />
    </AuthProvider>
  );
}
