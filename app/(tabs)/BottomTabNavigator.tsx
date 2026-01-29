import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Activity, Camera, ShieldAlert, User } from 'lucide-react-native';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

// --- 關鍵修改：匯入你的 AISessionScreen ---
import AISessionScreen from './AISessionScreen';
import Disease from './Disease';
import MemberScreen from './MemberScreen';

const Tab = createBottomTabNavigator();

// 剩下的 TempScreen 保持不變，直到你完成其他頁面
const TempScreen = ({ route }: any) => (
  <View style={styles.tempContainer}>
    <Text style={styles.tempTitle}>{route.name} 頁面建設中...</Text>
    <Text style={styles.tempSubtitle}>稍後建立檔案後再進行替換</Text>
  </View>
);

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
        headerTitleStyle: {
          fontFamily: 'Zen',
          fontSize: 20,
          color: '#2C3E50',
          ...Platform.select({
            ios: { fontWeight: '600' },
            android: { fontWeight: 'bold' },
          }),
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#F1F5F9',
        },
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#3498DB',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: {
          fontFamily: 'Zen',
          fontSize: 11,
          marginBottom: 5,
        },
      }}
    >
      {/* --- 關鍵修改：更換 component --- */}
      <Tab.Screen 
        name="AISession" 
        component={AISessionScreen} 
        options={{
          title: '智慧收操',
          tabBarLabel: 'AI 導引',
          tabBarIcon: ({ color, size }) => <Camera size={size} stroke={color} strokeWidth={2.5} />,
        }}
      />
      
      <Tab.Screen 
        name="Assessment" 
        component={TempScreen} 
        options={{
          title: '狀態評估',
          tabBarLabel: '疲勞分析',
          tabBarIcon: ({ color, size }) => <Activity size={size} stroke={color} strokeWidth={2.5} />,
        }}
      />

      <Tab.Screen 
        name="Disease" 
        component={Disease} 
        options={{
          title: '醫療安全網',
          tabBarLabel: '避讓設定',
          tabBarIcon: ({ color, size }) => <ShieldAlert size={size} stroke={color} strokeWidth={2.5} />,
        }}
      />

      <Tab.Screen 
        name="Profile" 
        component={MemberScreen} 
        options={{
          title: '個人檔案',
          tabBarLabel: '我的',
          headerTitleStyle: {
            fontFamily: 'Caveat-Bold',
            fontSize: 28,
            color: '#34495E',
          },
          tabBarIcon: ({ color, size }) => <User size={size} stroke={color} strokeWidth={2.5} />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 88 : 70,
    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  tempContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  tempTitle: {
    fontSize: 18,
    fontFamily: 'Zen',
    fontWeight: 'bold',
    color: '#334155',
  },
  tempSubtitle: {
    color: '#64748B',
    marginTop: 10,
    fontFamily: 'Zen',
  },
});

export default BottomTabNavigator;