import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Alert } from 'react-native';


export default function MainLayout() {

  
  const { user, logout, redirectToAuth } = useAuth();
  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  return (
          <>
           <Tabs screenOptions={{
              tabBarPosition: 'top',
              headerShown: false,
              tabBarActiveTintColor: '#4ECDC4',
              tabBarInactiveTintColor: '#7F8C8D',
              tabBarStyle: {
                backgroundColor: 'white',
                borderTopWidth: 1,
                borderTopColor: '#E9ECEF',
                paddingBottom: 5,
                paddingTop: 5,
                height: 55,
                marginTop: 35,
              },
            }}>
              <Tabs.Screen 
              
              options={{
                title: 'Home',
                tabBarIcon: ({ color, focused }) => (
                  <Ionicons
                    name={focused ? 'home' : 'home-outline'}
                    size={20}
                    color={color}
                  />
                )
              }}
               name="index"  />
              <Tabs.Screen
                options={{
                  title: 'Catalogos',
                  tabBarIcon: ({ color, focused }) => (
                    <Ionicons
                      name={focused ? 'list' : 'list-outline'}
                      size={20}
                      color={color}
                    />
                  )
                }}
               name="catalogs" />
              <Tabs.Screen
                options={{
                  title: 'Calendario',
                  tabBarIcon: ({ color, focused }) => (
                    <Ionicons
                      name={focused ? 'calendar' : 'calendar-outline'}
                      size={20}
                      color={color}
                    />
                  )
                }}
               name="calendar" />
              <Tabs.Screen
                options={{
                  title: 'Perfil',
                  tabBarIcon: ({ color, focused }) => (
                    <Ionicons
                      name={focused ? 'person' : 'person-outline'}
                      size={20}
                      color={color}
                    />
                  )
                }}
               name="profile" />
            </Tabs>
          </>
  );
}
