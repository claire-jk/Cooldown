import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

const { width } = Dimensions.get('window');
const STORAGE_KEY = '@health_fatigue_data';
const INITIAL_SCORES = { "頸部": 0, "肩部": 0, "腰部": 0, "大腿": 0, "小腿": 0, "手臂": 0 };

const HealthDataAnalysis = ({ navigation, route }: any) => {
  const [fatigueScores, setFatigueScores] = useState<Record<string, number>>(INITIAL_SCORES);
  const [lastExercise, setLastExercise] = useState("尚無紀錄");
  const [lastUpdate, setLastUpdate] = useState("-");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      if (route.params?.initialData) {
        const d = route.params.initialData;
        setFatigueScores(d.scores);
        setLastExercise(d.lastExercise);
        setLastUpdate(d.lastUpdate);
        setLoading(false);
        return; 
      }

      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      let data = saved ? JSON.parse(saved) : null;

      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const snap = await getDoc(userRef);
        
        if (snap.exists()) {
          const cloudData = snap.data().fatigueData;
          if (cloudData && (!data || cloudData.timestamp > (data.timestamp || 0))) {
            data = cloudData;
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          }
        }
      }

      if (data) {
        setFatigueScores(data.scores || INITIAL_SCORES);
        setLastExercise(data.lastExercise || "未知");
        setLastUpdate(data.lastUpdate || "-");
      }
    } catch (e) {
      console.error("數據加載失敗:", e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [route.params?.refresh])
  );

  const clearData = () => {
    Alert.alert("重置紀錄", "這將清除本地與雲端的疲勞數據，確定嗎？", [
      { text: "取消" },
      { text: "確定清除", style: 'destructive', onPress: async () => {
          await AsyncStorage.removeItem(STORAGE_KEY);
          setFatigueScores(INITIAL_SCORES);
          setLastExercise("已重置");
          setLastUpdate("-");
      }}
    ]);
  };

  const getBarColor = (value: number) => {
    if (value >= 70) return '#EF4444'; // 高危險 (紅)
    if (value >= 40) return '#F59E0B'; // 中度 (橘黃)
    return '#10B981'; // 輕微 (綠)
  };

  const labels = Object.keys(fatigueScores);
  const mostUsedArea = labels.reduce((a, b) => fatigueScores[a] > fatigueScores[b] ? a : b);
  const maxScore = fatigueScores[mostUsedArea];
  const highRiskAreas = labels.filter(l => fatigueScores[l] >= 50);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3498DB" />
        <Text style={{ marginTop: 10, color: '#94A3B8' }}>分析健康數據中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.headerTitle}>健康大數據</Text>
          <Text style={styles.headerSub}>最後更新: {lastUpdate}</Text>
        </View>
        <TouchableOpacity onPress={clearData} style={styles.iconClearBtn}>
          <Text style={styles.clearBtnText}>重置</Text>
        </TouchableOpacity>
      </View>
      
      {/* Summary Card */}
      <View style={[styles.mainCard, styles.shadow]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTag}>運動概覽</Text>
          <Text style={styles.exerciseName}>🔥 {lastExercise}</Text>
        </View>

        <View style={styles.barChartArea}>
          {labels.map((label) => (
            <View key={label} style={styles.barItem}>
              <Text style={styles.barValueText}>{fatigueScores[label]}</Text>
              <View style={styles.barTrack}>
                <View style={[
                  styles.barActive, 
                  { height: `${Math.max(5, fatigueScores[label])}%`, backgroundColor: getBarColor(fatigueScores[label]) }
                ]} />
              </View>
              <Text style={styles.barLabelText}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Analysis Section */}
      <Text style={styles.sectionLabel}>🔍 深度分析報告</Text>
      
      <View style={[styles.infoCard, styles.shadow]}>
        {maxScore > 0 ? (
          <View>
            <View style={styles.focusRow}>
              <Text style={styles.focusLabel}>重點關注部位</Text>
              <View style={styles.focusBadge}>
                <Text style={styles.focusBadgeText}>{mostUsedArea}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />

            <View style={styles.adviceContainer}>
              <Text style={styles.adviceHeader}>💡 復健師建議</Text>
              <Text style={styles.adviceDetail}>
                • 目前 <Text style={{fontWeight:'bold'}}>{mostUsedArea}</Text> 累積壓力最高，請確保至少休息 24 小時。{"\n"}
                • 建議進行 <Text style={{color:'#3498DB'}}>泡棉滾筒放鬆</Text> 每次 15 分鐘。{"\n"}
                • 睡前建議針對該部位進行熱敷。
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.emptyText}>尚未有運動數據傳入，快去開始收操吧！</Text>
        )}
      </View>

      {/* Danger Zone */}
      {highRiskAreas.length > 0 && (
        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>⚠️ 嚴正警告</Text>
          {highRiskAreas.map(area => (
            <View key={area} style={styles.dangerCard}>
              <Text style={styles.dangerText}>{area}部位負荷已達臨界點，強制建議停止高強度訓練。</Text>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9', paddingHorizontal: 20 },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 25 },
  headerTitle: { fontSize: 28, fontFamily:'Zen', color: '#1E293B' },
  headerSub: { fontSize: 13, color: '#64748B', marginTop: 4 , fontFamily:'Zen'},
  iconClearBtn: { backgroundColor: '#E2E8F0', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12 },
  clearBtnText: { fontSize: 12, color: '#475569', fontFamily:'Zen' },
  shadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  mainCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 25 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  cardTag: { fontSize: 12, color: '#94A3B8', fontFamily:'Zen', textTransform: 'uppercase', letterSpacing: 1 },
  exerciseName: { fontSize: 16, fontFamily:'Zen', color: '#334155' },
  barChartArea: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 160, paddingBottom: 10 },
  barItem: { alignItems: 'center', width: (width - 120) / 6 },
  barTrack: { width: 10, height: 110, backgroundColor: '#F8FAFC', borderRadius: 10, justifyContent: 'flex-end', overflow: 'hidden' },
  barActive: { width: '100%', borderRadius: 10 },
  barValueText: { fontSize: 11, fontFamily:'Zen', marginBottom: 6, color: '#64748B' },
  barLabelText: { fontSize: 13, marginTop: 10, fontFamily:'Zen', color: '#334155' },
  sectionLabel: { fontSize: 18, fontFamily:'Zen', color: '#1E293B', marginBottom: 15 },
  infoCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 25 },
  focusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  focusLabel: { fontSize: 15, color: '#64748B', fontFamily:'Zen' },
  focusBadge: { backgroundColor: '#DBEAFE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  focusBadgeText: { color: '#1D4ED8', fontFamily:'Zen', fontSize: 16 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 15 },
  adviceContainer: { marginTop: 5 },
  adviceHeader: { fontSize: 14, fontFamily:'Zen', color: '#0F172A', marginBottom: 10 },
  adviceDetail: { fontSize: 14, color: '#475569', lineHeight: 24, fontFamily:'Zen' },
  emptyText: { textAlign: 'center', color: '#94A3B8', paddingVertical: 20, fontFamily:'Zen' },
  dangerZone: { marginBottom: 20 },
  dangerTitle: { fontSize: 18, fontFamily:'Zen', color: '#EF4444', marginBottom: 12 },
  dangerCard: { backgroundColor: '#FEF2F2', padding: 16, borderRadius: 16, borderLeftWidth: 5, borderLeftColor: '#EF4444', marginBottom: 10 },
  dangerText: { fontSize: 13, color: '#991B1B', lineHeight: 20, fontFamily:'Zen' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9' }
});

export default HealthDataAnalysis;