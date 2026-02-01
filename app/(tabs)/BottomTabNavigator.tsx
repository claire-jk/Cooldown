import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Activity, Camera, ShieldAlert, User } from 'lucide-react-native';
import React from 'react';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';

import AISessionScreen from './AISessionScreen';
import Disease from './Disease';
import HealthDataAnalysis from './HealthDataAnalysis';
import MemberScreen from './MemberScreen';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
        // --- 核心修改：美化 Header 容器 ---
        headerStyle: styles.headerContainer,
        headerTitleContainerStyle: {
          paddingBottom: 10, // 微調標題位置
        },
        headerTitle: ({ children }) => (
          <View style={styles.titleWrapper}>
            <Text style={styles.headerTitleText}>{children}</Text>
          </View>
        ),
        // --- Tab Bar 整體樣式 ---
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#3498DB',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Zen',
          marginBottom: Platform.OS === 'ios' ? 0 : 10,
        },
      }}
    >
      <Tab.Screen 
        name="AISession" 
        component={AISessionScreen} 
        options={{
          title: '智慧導引',
          tabBarLabel: 'AI 導引',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconBg]}>
              <Camera size={22} color={focused ? '#FFF' : color} strokeWidth={2.5} />
            </View>
          ),
        }}
      />
      
      <Tab.Screen 
        name="HealthDataAnalysis" 
        component={HealthDataAnalysis} 
        options={{
          title: '疲勞評估',
          tabBarLabel: '數據分析',
          tabBarIcon: ({ color, focused }) => (
            <Activity size={focused ? 26 : 22} color={color} strokeWidth={2.5} />
          ),
        }}
      />

      <Tab.Screen 
        name="Disease" 
        component={Disease} 
        options={{
          title: '醫療避讓',
          tabBarLabel: '安全網',
          tabBarIcon: ({ color, focused }) => (
            <ShieldAlert size={focused ? 26 : 22} color={color} strokeWidth={2.5} />
          ),
        }}
      />

      <Tab.Screen 
        name="Profile" 
        component={MemberScreen} 
        options={{
          title: '個人中心',
          tabBarLabel: '我的',
          tabBarIcon: ({ color, focused }) => (
            <User size={focused ? 26 : 22} color={color} strokeWidth={2.5} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  // --- 標題美化樣式 ---
  headerContainer: {
    backgroundColor: '#F8FAFC', 
    height: Platform.OS === 'ios' ? 110 : 90,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0,
  },
  titleWrapper: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 50, // 膠囊型標題背景
    marginTop: Platform.OS === 'ios' ? 0 : 10,
    // 增加細微陰影讓標題浮現
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  headerTitleText: {
    fontSize: 16,
    fontFamily: 'Zen',
    color: '#1E293B',
    letterSpacing: 1,
  },
  // --- Tab Bar 樣式 (保持並優化) ---
  tabBar: {
// 移除 absolute 定位，讓它自然回歸底部
    position: 'relative', 
    height: Platform.OS === 'ios' ? 88 : 70, // iOS 通常需要更高一點來容納底部安全區域
    backgroundColor: '#FFFFFF',
    // 移除左右間距與大圓角
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 0, 
    // 保留陰影或改為頂部邊框
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 }, // 陰影向上
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 20,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    // 處理底部填充
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
  },
  iconContainer: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 21, // 圓形背景
  },
  activeIconBg: {
    backgroundColor: '#3498DB',
    shadowColor: '#3498DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5
  },
});

export default BottomTabNavigator;