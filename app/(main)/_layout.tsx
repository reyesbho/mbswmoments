import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';


export default function MainLayout() {

  return (
    <>
              <Tabs
                screenOptions={{
                  tabBarActiveTintColor: '#4ECDC4',
                  tabBarInactiveTintColor: '#7F8C8D',
                  tabBarStyle: {
                    backgroundColor: 'white',
                    borderTopWidth: 1,
                    borderTopColor: '#E9ECEF',
                    paddingBottom: 5,
                    paddingTop: 5,
                    height: 60,
                  },
                  headerShown: false,
                }}
              >
              <Tabs.Screen
                name="index"
                options={{
                  title: 'Home',
                  tabBarIcon: ({ color, focused }) => (
                    <Ionicons
                      name={focused ? 'home' : 'home-outline'}
                      size={24}
                      color={color}
                    />
                  ),
                  headerShown: false,
                }}
              />
                <Tabs.Screen
                  name="pedidos"
                  options={{
                    title: 'Pedidos',
                    tabBarIcon: ({ color, focused }) => (
                      <Ionicons
                        name={focused ? 'list' : 'list-outline'}
                        size={24}
                        color={color}
                      />
                    ),
                    headerShown: false,
                  }}
                />
            </Tabs>
          </>
  );
}
