import { useRouter } from 'expo-router';
import { doc, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { auth, db } from './firebaseConfig';

const { width } = Dimensions.get('window');

interface FatigueRecord {
    date: string;
    level: string;
    score: number;
    color: string;
    scores: Record<string, number>;
}

export default function FatigueHistoryScreen() {
    const router = useRouter();
    const [historyData, setHistoryData] = useState<FatigueRecord[]>([]);
    const [loading, setLoading] = useState(true);

    const getStatusInfo = (avgScore: number) => {
        if (avgScore >= 70) return { level: '高度疲勞', color: '#EF4444', desc: '建議立即休息', bg: '#FEF2F2' };
        if (avgScore >= 40) return { level: '中度疲勞', color: '#F59E0B', desc: '適度伸展放鬆', bg: '#FFFBEB' };
        return { level: '狀態良好', color: '#10B981', desc: '體能恢復絕佳', bg: '#F0FDF4' };
    };

    useEffect(() => {
        if (!auth.currentUser) {
            setLoading(false);
            return;
        }

        const userRef = doc(db, "users", auth.currentUser.uid);
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const cloudData = data.fatigueData;

                if (cloudData && cloudData.scores) {
                    const scores: Record<string, number> = cloudData.scores;
                    const values = Object.values(scores);
                    const avg = values.length > 0 
                        ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) 
                        : 0;
                    
                    const status = getStatusInfo(avg);
                    setHistoryData([{
                        date: cloudData.lastUpdate || '剛剛',
                        level: status.level,
                        score: avg,
                        color: status.color,
                        scores: scores
                    }]);
                }
            }
            setLoading(false);
        }, () => setLoading(false));

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>同步雲端健康檔案...</Text>
            </View>
        );
    }

    const currentStatus = historyData[0] ? getStatusInfo(historyData[0].score) : null;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backBtnIcon}>❮</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>健康趨勢分析</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* --- 今日狀態（超圓角膠囊卡片） --- */}
                {historyData.length > 0 && (
                    <View style={[styles.heroCard, { backgroundColor: currentStatus?.bg }]}>
                        <View style={styles.heroInfo}>
                            <Text style={styles.heroLabel}>今日疲勞總指數</Text>
                            <Text style={[styles.heroScore, { color: currentStatus?.color }]}>{historyData[0].score}%</Text>
                            <View style={[styles.pillBadge, { backgroundColor: currentStatus?.color }]}>
                                <Text style={styles.pillBadgeText}>{currentStatus?.level}</Text>
                            </View>
                        </View>
                        <View style={[styles.heroCircle, { borderColor: currentStatus?.color }]}>
                             <View style={[styles.innerCircle, { backgroundColor: currentStatus?.color }]} />
                             <Text style={[styles.circleText, { color: currentStatus?.color }]}>OK</Text>
                        </View>
                    </View>
                )}

                {/* --- 圖表（圓角軌道設計） --- */}
                <View style={styles.chartCard}>
                    <Text style={styles.cardTitle}>部位負擔佔比</Text>
                    <View style={styles.barChart}>
                        {historyData.length > 0 ? Object.entries(historyData[0].scores).map(([key, val]) => (
                            <View key={key} style={styles.barWrapper}>
                                <Text style={styles.barValText}>{val}%</Text>
                                <View style={styles.barTrack}>
                                    <View 
                                        style={[
                                            styles.barFill, 
                                            { height: `${Math.max(val, 12)}%`, backgroundColor: currentStatus?.color }
                                        ]} 
                                    />
                                </View>
                                <Text style={styles.barLabel}>{key}</Text>
                            </View>
                        )) : <Text style={styles.noDataText}>無近期數據</Text>}
                    </View>
                </View>

                {/* --- 紀錄列表（膠囊式列表） --- */}
                <Text style={styles.sectionTitle}>檢測歷史紀錄</Text>
                {historyData.length > 0 ? (
                    historyData.map((item, index) => (
                        <View key={index} style={styles.historyCard}>
                            <View style={[styles.iconBox, { backgroundColor: item.color }]}>
                                <Text style={styles.iconBoxText}>📊</Text>
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.recordDate}>{item.date}</Text>
                                <Text style={styles.recordLevel}>{item.level}</Text>
                            </View>
                            <View style={[styles.scorePill, { backgroundColor: item.color + '15' }]}>
                                <Text style={[styles.scoreText, { color: item.color }]}>{item.score}%</Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>快去進行第一次疲勞檢測吧！</Text>
                    </View>
                )}
                
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FBFF' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 15, color: '#64748B', fontSize: 14, fontFamily: 'Zen' },
    
    header: {
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingTop: 60, 
        paddingBottom: 20, 
        paddingHorizontal: 25, 
        backgroundColor: '#FFF',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    backBtn: {
        width: 45, height: 45, justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#F1F5F9', borderRadius: 22, // 完全圓角
    },
    backBtnIcon: { fontSize: 16, color: '#1E293B' , fontFamily: 'Zen'},
    headerTitle: { fontSize: 18, fontFamily: 'Zen', color: '#0F172A' },

    scrollContent: { padding: 20 },

    // 今日狀態卡片
    heroCard: {
        borderRadius: 35, // 加強圓角
        padding: 25, marginBottom: 25,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 15, elevation: 3
    },
    heroInfo: { flex: 1 },
    heroLabel: { fontSize: 13, color: '#64748B', fontFamily: 'Zen', marginBottom: 2 },
    heroScore: { fontSize: 42, fontFamily: 'Zen', fontWeight: '900', marginBottom: 8 },
    pillBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
    pillBadgeText: { color: '#FFF', fontSize: 12, fontFamily: 'Zen', fontWeight: 'bold' },
    
    heroCircle: {
        width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderStyle: 'dashed',
        justifyContent: 'center', alignItems: 'center', padding: 5
    },
    innerCircle: { position: 'absolute', width: '100%', height: '100%', borderRadius: 40, opacity: 0.1 },
    circleText: { fontSize: 18, fontWeight: '900', fontFamily: 'Zen' },

    // 圖表卡片
    chartCard: {
        backgroundColor: '#FFF', borderRadius: 35, padding: 25, marginBottom: 30,
        shadowColor: "#000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2
    },
    cardTitle: { fontSize: 17, fontFamily: 'Zen', color: '#1E293B', marginBottom: 25, fontWeight: 'bold' },
    barChart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 150 },
    barWrapper: { alignItems: 'center' },
    barValText: { fontSize: 10, color: '#94A3B8', marginBottom: 8, fontFamily: 'Zen', fontWeight: '600' },
    barTrack: { width: 16, height: 100, backgroundColor: '#F1F5F9', borderRadius: 10, justifyContent: 'flex-end', overflow: 'hidden' },
    barFill: { width: '100%', borderRadius: 10 }, // 頂部底部皆圓角
    barLabel: { marginTop: 12, fontSize: 13, color: '#475569', fontFamily: 'Zen', fontWeight: '600' },

    // 列表樣式
    sectionTitle: { fontSize: 19, fontFamily: 'Zen', color: '#1E293B', marginBottom: 20, fontWeight: 'bold' },
    historyCard: {
        backgroundColor: '#FFF', borderRadius: 25, padding: 15, flexDirection: 'row', alignItems: 'center',
        marginBottom: 15, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 10, elevation: 1
    },
    iconBox: { width: 50, height: 50, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    iconBoxText: { fontSize: 20 },
    cardContent: { flex: 1, marginLeft: 15 },
    recordDate: { fontSize: 12, color: '#94A3B8', fontFamily: 'Zen' },
    recordLevel: { fontSize: 16, fontFamily: 'Zen', color: '#334155', fontWeight: 'bold', marginTop: 2 },
    scorePill: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
    scoreText: { fontSize: 18, fontFamily: 'Zen', fontWeight: '900' },

    emptyContainer: { alignItems: 'center', paddingVertical: 40 },
    emptyText: { color: '#94A3B8', fontSize: 15, fontFamily: 'Zen' },
    noDataText: { color: '#94A3B8', fontSize: 14, fontFamily: 'Zen' },
});