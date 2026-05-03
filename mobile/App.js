import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';

// Auth Screens
import LoginScreen from './screens/LoginScreen.js';
import RegisterScreen from './screens/RegisterScreen.js';

// Meal Plan & Nutrition Screens (IT24101315 - Egalla J.I)
import MealTemplateListScreen from './screens/MealTemplateListScreen.js';
import MealPlanListScreen from './screens/MealPlanListScreen.js';
import CreateMealPlanScreen from './screens/CreateMealPlanScreen.js';
import MealPlanDetailScreen from './screens/MealPlanDetailScreen.js';
import EditMealPlanScreen from './screens/EditMealPlanScreen.js';

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
            {/* Meal Plan & Nutrition Management - IT24101315 */}
            <Stack.Screen name="MealPlanList" component={MealPlanListScreen} options={{ title: 'My Meal Plans', headerBackVisible: false }} />
            <Stack.Screen name="MealTemplateList" component={MealTemplateListScreen} options={{ title: 'Meal Plan Templates' }} />
            <Stack.Screen name="CreateMealPlan" component={CreateMealPlanScreen} options={{ title: 'Create Meal Template' }} />
            <Stack.Screen name="MealPlanDetail" component={MealPlanDetailScreen} options={{ title: 'Meal Plan Details' }} />
            <Stack.Screen name="EditMealPlan" component={EditMealPlanScreen} options={{ title: 'Edit Meal Plan' }} />
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
