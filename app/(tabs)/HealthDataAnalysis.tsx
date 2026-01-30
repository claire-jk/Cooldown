import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';

const screenWidth = Dimensions.get("window").width;

// 1. 先定義 Styles，確保全域都能讀取
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#2C3E50', marginTop: 40 },
  card: { 
    backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3
  },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 15, color: '#34495E' },
  chartPlaceholder: { 
    height: 200, backgroundColor: '#F9F9F9', justifyContent: 'center', 
    alignItems: 'center', borderRadius: 10, borderStyle: 'dashed', borderWidth: 1, borderColor: '#DDD' 
  },
  placeholderText: { color: '#95A5A6', fontSize: 14 },
  riskContainer: { marginBottom: 20 },
  riskTitle: { fontSize: 18, fontWeight: 'bold', color: '#E74C3C', marginBottom: 10 },
  riskAlert: { backgroundColor: '#FDEDEC', padding: 15, borderRadius: 10, marginBottom: 10, borderLeftWidth: 5, borderLeftColor: '#E74C3C' },
  alertText: { fontSize: 15, color: '#7B241C' },
  adviceText: { fontSize: 13, color: '#A93226', marginTop: 5 },
  safeText: { color: '#27AE60', fontStyle: 'italic' },
  bold: { fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  statBox: { alignItems: 'center', flex: 1 },
  statLabel: { fontSize: 12, color: '#7F8C8D', marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: 'bold' }
});

// 2. 再定義子組件
interface StatBoxProps {
  label: string;
  value: string;
  color: string;
}

const StatBox = ({ label, value, color }: StatBoxProps) => (
  <View style={styles.statBox}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
  </View>
);

// 3. 最後才是主頁面組件
const HealthDataAnalysis = () => {
  const [fatigueData] = useState({
    labels: ["頸部", "肩部", "腰部", "大腿", "小腿", "手臂"],
    datasets: [{ data: [85, 40, 95, 30, 50, 20] }]
  });

  const getRiskAnalysis = () => {
    const threshold = 80;
    return fatigueData.labels.filter((label, index) => fatigueData.datasets[0].data[index] >= threshold);
  };

  const highRiskAreas = getRiskAnalysis();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>健康大數據分析</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>當前部位疲勞分佈</Text>
        <View style={styles.chartPlaceholder}>
           <Text style={styles.placeholderText}>📊 雷達圖區域</Text>
        </View>
      </View>

      <View style={styles.riskContainer}>
        <Text style={styles.riskTitle}>⚠️ 預防醫學風險警示</Text>
        {highRiskAreas.length > 0 ? (
          highRiskAreas.map(area => (
            <View key={area} style={styles.riskAlert}>
              <Text style={styles.alertText}>
                檢測到 <Text style={styles.bold}>{area}</Text> 使用頻率過高。
              </Text>
              <Text style={styles.adviceText}>建議：加強筋膜放鬆。</Text>
            </View>
          ))
        ) : (
          <Text style={styles.safeText}>目前狀態良好</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>週運動強度累積</Text>
        <View style={styles.statsRow}>
            <StatBox label="本週最操" value="腰部" color="#FF5252" />
            <StatBox label="受傷風險" value="中高" color="#FF9800" />
            <StatBox label="建議收操" value="15 min" color="#4CAF50" />
        </View>
      </View>
    </ScrollView>
  );
};

export default HealthDataAnalysis;