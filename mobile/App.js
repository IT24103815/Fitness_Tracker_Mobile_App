import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';

import LoginScreen from './screens/LoginScreen.js';
import RegisterScreen from './screens/RegisterScreen.js';
import ProfileScreen from './screens/ProfileScreen.js';
import ProgressTrackerScreen from './screens/ProgressTrackerScreen.js';
import ProgressAnalyticsScreen from './screens/ProgressAnalyticsScreen.js';
import ClientProfileScreen from './screens/ClientProfileScreen.js';

// Exercise Library
import ExerciseListScreen from './screens/ExerciseListScreen.js';
import ExerciseDetailScreen from './screens/ExerciseDetailScreen.js';
import AddExerciseScreen from './screens/AddExerciseScreen.js';
import EditExerciseScreen from './screens/EditExerciseScreen.js';

// Workout Plans
import WorkoutListScreen from './screens/WorkoutListScreen.js';
import CreateWorkoutScreen from './screens/CreateWorkoutScreen.js';
import EditWorkoutScreen from './screens/EditWorkoutScreen.js';
import WorkoutDetailScreen from './screens/WorkoutDetailScreen.js';
import AddExerciseToWorkoutScreen from './screens/AddExerciseToWorkoutScreen.js';

// Meal Plans
import MealTemplateListScreen from './screens/MealTemplateListScreen.js';
import MealPlanListScreen from './screens/MealPlanListScreen.js';
import CreateMealPlanScreen from './screens/CreateMealPlanScreen.js';
import MealPlanDetailScreen from './screens/MealPlanDetailScreen.js';
import EditMealPlanScreen from './screens/EditMealPlanScreen.js';

// Goals & Progress
import GoalListScreen from './screens/GoalListScreen.js';
import CreateGoalScreen from './screens/CreateGoalScreen.js';
import GoalDetailScreen from './screens/GoalDetailScreen.js';
import EditGoalScreen from './screens/EditGoalScreen.js';

// Challenges
import ChallengeListScreen from './screens/ChallengeListScreen.js';
import ChallengeDetailScreen from './screens/ChallengeDetailScreen.js';
import { CreateChallengeScreen, EditChallengeScreen } from './screens/ChallengeBuilder.js';
import MyWeeklyChallengesScreen from './screens/MyWeeklyChallengesScreen.js';

// Admin & Trainer System
import MyClientsScreen from './screens/MyClientsScreen.js';
import UserManagementScreen from './screens/UserManagementScreen.js';

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
            <Stack.Screen name="ProgressTracker" component={ProgressTrackerScreen} options={{ title: 'Success Calendar' }} />
            <Stack.Screen name="ProgressAnalytics" component={ProgressAnalyticsScreen} options={{ title: 'Weight Analytics' }} />
            
            {/* Exercise Library */}
            <Stack.Screen name="ExerciseList" component={ExerciseListScreen} options={{ title: 'Exercise Library' }} />
            <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} options={{ title: 'Exercise Details' }} />
            <Stack.Screen name="AddExercise" component={AddExerciseScreen} options={{ title: 'Add Exercise' }} />
            <Stack.Screen name="EditExercise" component={EditExerciseScreen} options={{ title: 'Edit Exercise' }} />

            {/* Workout Plans */}
            <Stack.Screen name="WorkoutList" component={WorkoutListScreen} options={{ title: 'Workout Plans' }} />
            <Stack.Screen name="CreateWorkout" component={CreateWorkoutScreen} options={{ title: 'Create Workout Plan' }} />
            <Stack.Screen name="EditWorkout" component={EditWorkoutScreen} options={{ title: 'Edit Workout Plan' }} />
            <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} options={{ title: 'Plan Details' }} />
            <Stack.Screen name="AddExerciseToWorkout" component={AddExerciseToWorkoutScreen} options={{ title: 'Add Exercise' }} />

            {/* Meal Plans */}
            <Stack.Screen name="MealTemplateList" component={MealTemplateListScreen} options={{ title: 'Meal Plan Templates' }} />
            <Stack.Screen name="MealPlanList" component={MealPlanListScreen} options={{ title: 'My Meal Plans' }} />
            <Stack.Screen name="CreateMealPlan" component={CreateMealPlanScreen} options={{ title: 'Create Meal Template' }} />
            <Stack.Screen name="MealPlanDetail" component={MealPlanDetailScreen} options={{ title: 'Meal Plan Details' }} />
            <Stack.Screen name="EditMealPlan" component={EditMealPlanScreen} options={{ title: 'Edit Meal Plan' }} />

            {/* Goals & Progress */}
            <Stack.Screen name="GoalList" component={GoalListScreen} options={{ title: 'My Goals' }} />
            <Stack.Screen name="CreateGoal" component={CreateGoalScreen} options={{ title: 'Create Goal' }} />
            <Stack.Screen name="GoalDetail" component={GoalDetailScreen} options={{ title: 'Goal Details' }} />
            <Stack.Screen name="EditGoal" component={EditGoalScreen} options={{ title: 'Edit Goal' }} />

            {/* Fitness Challenges */}
            <Stack.Screen name="ChallengeList" component={ChallengeListScreen} options={{ title: 'Explore Challenges' }} />
            <Stack.Screen name="ChallengeDetail" component={ChallengeDetailScreen} options={{ title: 'Challenge Details' }} />
            <Stack.Screen name="CreateChallenge" component={CreateChallengeScreen} options={{ title: 'Create Challenge' }} />
            <Stack.Screen name="EditChallenge" component={EditChallengeScreen} options={{ title: 'Edit Challenge' }} />
            <Stack.Screen name="MyWeeklyChallenges" component={MyWeeklyChallengesScreen} options={{ title: 'This Week\'s Challenges' }} />

            {/* Admin & Trainer System */}
            <Stack.Screen name="MyClients" component={MyClientsScreen} options={{ title: 'My Clients' }} />
            <Stack.Screen name="ClientSupervision" component={ClientProfileScreen} options={{ title: 'Client Profile' }} />
            <Stack.Screen name="UserManagement" component={UserManagementScreen} options={{ title: 'Manage Users' }} />
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