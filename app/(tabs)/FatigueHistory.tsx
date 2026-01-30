import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function FatigueHistoryScreen() {
    const router = useRouter();

    // 模擬數據
    const historyData = [
        { date: '2026-01-30', level: '中度', score: 65, color: '#F59E0B' },
        { date: '2026-01-28', level: '輕微', score: 30, color: '#10B981' },
        { date: '2026-01-25', level: '高度', score: 85, color: '#EF4444' },
    ];

    return (
        <View style={styles.container}>
            {/* 頂部標題列 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>❮</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>疲勞度趨勢</Text>
                <View style={{ width: 40 }} /> 
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* 圖表佔位卡片 */}
                <View style={styles.chartCard}>
                    <Text style={styles.cardTitle}>週疲勞曲線</Text>
                    <View style={styles.chartPlaceholder}>
                        <Text style={styles.placeholderText}>[ 此處未來可串接圖表套件 ]</Text>
                        <Text style={styles.placeholderText}>例如：react-native-chart-kit</Text>
                    </View>
                </View>

                {/* 歷史列表區塊 */}
                <Text style={styles.sectionLabel}>近期紀錄</Text>
                {historyData.map((item, index) => (
                    <View key={index} style={styles.historyItem}>
                        <View style={[styles.statusIndicator, { backgroundColor: item.color }]} />
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemDate}>{item.date}</Text>
                            <Text style={styles.itemLevel}>疲勞狀態：{item.level}</Text>
                        </View>
                        <Text style={[styles.itemScore, { color: item.color }]}>{item.score}%</Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, backgroundColor: '#FFF'
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12 },
    backBtnText: { fontSize: 18, color: '#475569', fontWeight: 'bold' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
    scrollContent: { padding: 20 },
    chartCard: {
        backgroundColor: '#FFF', borderRadius: 24, padding: 20,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, marginBottom: 25
    },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#475569', marginBottom: 15 },
    chartPlaceholder: {
        height: 180, backgroundColor: '#F8FAFC', borderRadius: 15,
        justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#CBD5E1'
    },
    placeholderText: { color: '#94A3B8', fontSize: 12, marginTop: 5 },
    sectionLabel: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 15 },
    historyItem: {
        backgroundColor: '#FFF', borderRadius: 18, padding: 16, flexDirection: 'row',
        alignItems: 'center', marginBottom: 12, elevation: 1
    },
    statusIndicator: { width: 4, height: 40, borderRadius: 2 },
    itemInfo: { flex: 1, marginLeft: 15 },
    itemDate: { fontSize: 14, color: '#94A3B8' },
    itemLevel: { fontSize: 16, fontWeight: '600', color: '#1E293B', marginTop: 2 },
    itemScore: { fontSize: 20, fontWeight: 'bold' }
});