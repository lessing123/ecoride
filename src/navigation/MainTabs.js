import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import PublishScreen from '../screens/PublishScreen';
import ReservationsScreen from '../screens/ReservationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { COLORS } from '../theme';

const Tab = createBottomTabNavigator();

function tabIcon(name, focused) {
  const icons = {
    Home: focused ? 'home' : 'home-outline',
    Search: focused ? 'search' : 'search-outline',
    Publish: focused ? 'add-circle' : 'add-circle-outline',
    Reservations: focused ? 'calendar' : 'calendar-outline',
    Profile: focused ? 'person' : 'person-outline',
  };
  return icons[name] || 'ellipse';
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={tabIcon(route.name, focused)} size={size} color={color} />
        ),
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 65,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: '600', fontSize: 17 },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Accueil', tabBarLabel: 'Accueil' }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ title: 'Rechercher', tabBarLabel: 'Recherche' }} />
      <Tab.Screen
        name="Publish"
        component={PublishScreen}
        options={{
          title: 'Publier un trajet',
          tabBarLabel: 'Publier',
          tabBarIconStyle: { marginTop: -2 },
        }}
      />
      <Tab.Screen name="Reservations" component={ReservationsScreen} options={{ title: 'Réservations', tabBarLabel: 'Réservations' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Mon profil', tabBarLabel: 'Profil' }} />
    </Tab.Navigator>
  );
}
