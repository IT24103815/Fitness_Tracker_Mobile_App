import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';

import LoginScreen from './screens/LoginScreen.js';
import RegisterScreen from './screens/RegisterScreen.js';
import ProfileScreen from './screens/ProfileScreen.js';

// Challenges
import ChallengeListScreen from './screens/ChallengeListScreen.js';
import ChallengeDetailScreen from './screens/ChallengeDetailScreen.js';
import { CreateChallengeScreen, EditChallengeScreen } from './screens/ChallengeBuilder.js';
import MyWeeklyChallengesScreen from './screens/MyWeeklyChallengesScreen.js';

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
          headerTitleStyle: { fontWeight: '700' }
        }}
      >
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
            
            {/* Fitness Challenges */}
            <Stack.Screen name="ChallengeList" component={ChallengeListScreen} options={{ title: 'Explore Challenges' }} />
            <Stack.Screen name="ChallengeDetail" component={ChallengeDetailScreen} options={{ title: 'Challenge Details' }} />
            <Stack.Screen name="CreateChallenge" component={CreateChallengeScreen} options={{ title: 'Create Challenge' }} />
            <Stack.Screen name="EditChallenge" component={EditChallengeScreen} options={{ title: 'Edit Challenge' }} />
            <Stack.Screen name="MyWeeklyChallenges" component={MyWeeklyChallengesScreen} options={{ title: 'This Week\'s Challenges' }} />
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