import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { auth, db } from './firebaseConfig';

const { width } = Dimensions.get('window');

interface FatigueRecord {
  id: string;
  lastUpdate: string;
  lastExercise: string;
  scores: Record<string, number>;
  timestamp?: any;
}

const FatigueHistoryScreen = ({ navigation }: any) => {
  const [history, setHistory] = useState<FatigueRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // 假設你的歷史數據存放在 users/{uid}/history 集合中
      const historyRef = collection(db, 'users', user.uid, 'history');
      const q = query(historyRef, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const records: FatigueRecord[] = [];
      querySnapshot.forEach((doc) => {
        records.push({ id: doc.id, ...doc.data() } as FatigueRecord);
      });
      setHistory(records);
    } catch (error) {
      console.error("讀取歷史紀錄失敗:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: FatigueRecord }) => {
    const maxArea = Object.keys(item.scores).reduce((a, b) => item.scores[a] > item.scores[b] ? a : b);

    return (
      <View style={styles.recordCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.dateText}>📅 {item.lastUpdate}</Text>
          <Text style={styles.exerciseTag}>{item.lastExercise}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.cardBody}>
          <Text style={styles.focusText}>最疲勞部位：<Text style={styles.highlight}>{maxArea}</Text></Text>
          <View style={styles.miniChart}>
            {Object.entries(item.scores).map(([label, score]) => (
              <View key={label} style={styles.miniBarWrapper}>
                <View style={[styles.miniBar, { height: Math.max(5, score * 0.4), backgroundColor: score > 60 ? '#EF4444' : '#3498DB' }]} />
                <Text style={styles.miniLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>載入紀錄中...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>〈</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>疲勞度歷史紀錄</Text>
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyView}>
          <Text style={styles.emptyText}>目前尚無歷史紀錄</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#FFF' },
  backButton: { paddingRight: 15 },
  backIcon: { fontSize: 20, color: '#4A90E2', fontWeight: 'bold' },
  headerTitle: { fontSize: 20, fontFamily: 'Zen', color: '#1E293B' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#4A90E2', fontFamily: 'Zen' },
  recordCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 15, marginBottom: 15, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { fontSize: 14, color: '#64748B', fontFamily: 'Zen' },
  exerciseTag: { backgroundColor: '#EEF2FF', color: '#4F46E5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, fontSize: 12, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  cardBody: { paddingBottom: 5 },
  focusText: { fontSize: 15, color: '#334155', fontFamily: 'Zen', marginBottom: 15 },
  highlight: { fontWeight: 'bold', color: '#4A90E2' },
  miniChart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 50 },
  miniBarWrapper: { alignItems: 'center', width: (width - 100) / 6 },
  miniBar: { width: 6, borderRadius: 3 },
  miniLabel: { fontSize: 10, color: '#94A3B8', marginTop: 4, fontFamily: 'Zen' },
  emptyView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontFamily: 'Zen', fontSize: 16 }
});

export default FatigueHistoryScreen;