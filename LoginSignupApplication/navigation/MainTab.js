// navigation/MainTabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import ExploreScreen from '../screens/ExploreScreen';
import PostScreen from '../screens/PostScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
    return (
        <Tab.Navigator
            initialRouteName="Explore"
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: '#8A2BE2',
                tabBarInactiveTintColor: '#555',
                tabBarStyle: {
                    backgroundColor: '#FFF',
                    borderTopWidth: 0,
                    elevation: 5,
                    height: 60,
                    paddingBottom: 5,
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName = '';
                    if (route.name === 'Explore') {
                        iconName = focused ? 'search' : 'search-outline';
                    } else if (route.name === 'Post') {
                        iconName = focused ? 'add-circle' : 'add-circle-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }
                    return <Ionicons name={iconName} size={24} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Explore" component={ExploreScreen} />
            <Tab.Screen name="Post" component={PostScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}
