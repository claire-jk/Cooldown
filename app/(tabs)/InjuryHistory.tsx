import { LinearGradient } from 'expo-linear-gradient'; // 請確保已安裝 expo-linear-gradient
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 匯入 Firebase 配置
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

interface InjuryRecord {
    id: string;
    part: string;
    type: string;
    date: string;
    status: string;
    color: string;
}

const { width } = Dimensions.get('window');

export default function InjuryHistoryScreen() {
    const router = useRouter();
    const [injuries, setInjuries] = useState<InjuryRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'injuries'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const dataList: InjuryRecord[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as InjuryRecord));
            
            setInjuries(dataList);
            setLoading(false);
        }, (error) => {
            console.error("Fetch records error: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <View style={styles.container}>
            {/* 頂部導航列優化 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backBtnIcon}>back</Text>
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>健康檔案</Text>
                    <Text style={styles.headerSubtitle}>Injury History</Text>
                </View>
                <View style={styles.avatarPlaceholder} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* 美化後的智慧提示氣泡 */}
                <LinearGradient
                    colors={['#E0F2FE', '#F0F9FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.infoBubble}
                >
                    <View style={styles.infoIconBg}>
                        <Text style={{ fontSize: 16 }}>✨</Text>
                    </View>
                    <Text style={styles.infoText}>
                        系統已根據您的紀錄，優化了今日的<Text style={styles.boldText}>復健動作建議</Text>。
                    </Text>
                </LinearGradient>

                {loading ? (
                    <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 40 }} />
                ) : injuries.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyEmoji}>📋</Text>
                        <Text style={styles.emptyText}>目前的紀錄檔案是空的</Text>
                    </View>
                ) : (
                    injuries.map((injury) => (
                        <View key={injury.id} style={styles.injuryCard}>
                            <View style={styles.cardAccent} />
                            <View style={styles.cardBody}>
                                <View style={styles.cardTop}>
                                    <View style={[styles.statusBadge, { backgroundColor: (injury.color || '#3B82F6') + '15' }]}>
                                        <View style={[styles.dot, { backgroundColor: injury.color || '#3B82F6' }]} />
                                        <Text style={[styles.statusText, { color: injury.color || '#3B82F6' }]}>{injury.status}</Text>
                                    </View>
                                    <Text style={styles.dateText}>{injury.date}</Text>
                                </View>
                                
                                <Text style={styles.partTitle}>{injury.part}</Text>
                                <Text style={styles.typeText}>{injury.type}</Text>
                                
                                <TouchableOpacity style={styles.detailBtn}>
                                    <Text style={styles.detailBtnText}>進入復健指南</Text>
                                    <Text style={styles.arrowIcon}>→</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}

                {/* 新增按鈕優化 */}
                <TouchableOpacity 
                    style={styles.addBtn} 
                    onPress={() => router.push('/Disease')}
                >
                    <LinearGradient
                        colors={['#1E293B', '#334155']}
                        style={styles.addBtnGradient}
                    >
                        <Text style={styles.addBtnText}>+ 登記新傷病</Text>
                    </LinearGradient>
                </TouchableOpacity>
                <View style={{ height: 50 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    
    // Header
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
    backBtn: { width: 45, height: 45, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 22.5 },
    backBtnIcon: { color: '#64748B', fontSize: 12, fontWeight: 'bold' },
    headerTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
    headerSubtitle: { fontSize: 12, color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
    avatarPlaceholder: { width: 45, height: 45, backgroundColor: '#E2E8F0', borderRadius: 22.5 },

    scrollContent: { padding: 25 },

    // 提示訊息氣泡 (不規則圓角)
    infoBubble: { 
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20, 
        borderRadius: 30, 
        borderTopLeftRadius: 5, // 創造不對稱感
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#BAE6FD'
    },
    infoIconBg: { width: 35, height: 35, backgroundColor: '#FFF', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    infoText: { flex: 1, color: '#0369A1', fontSize: 14, lineHeight: 22, fontWeight: '500' },
    boldText: { fontWeight: 'bold', color: '#0284C7' },

    // 傷病卡片 (左側點綴色)
    injuryCard: { 
        backgroundColor: '#FFF', 
        borderRadius: 28, 
        marginBottom: 18, 
        flexDirection: 'row',
        overflow: 'hidden',
        elevation: 4,
        shadowColor: "#0F172A", 
        shadowOffset: { width: 0, height: 8 }, 
        shadowOpacity: 0.06, 
        shadowRadius: 15,
    },
    cardAccent: { width: 8, backgroundColor: '#3B82F6' },
    cardBody: { flex: 1, padding: 20 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    
    // 狀態標籤
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
    dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    statusText: { fontSize: 12, fontWeight: '800' },
    dateText: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },

    partTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
    typeText: { fontSize: 15, color: '#64748B', lineHeight: 20 },

    // 卡片按鈕
    detailBtn: { 
        marginTop: 18, 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 16
    },
    detailBtnText: { color: '#3B82F6', fontWeight: '700', fontSize: 14 },
    arrowIcon: { color: '#3B82F6', fontSize: 18, fontWeight: 'bold' },

    // 新增按鈕
    addBtn: { marginTop: 10, borderRadius: 25, overflow: 'hidden', elevation: 5 },
    addBtnGradient: { padding: 20, alignItems: 'center' },
    addBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16, letterSpacing: 0.5 },

    emptyContainer: { alignItems: 'center', marginTop: 60 },
    emptyEmoji: { fontSize: 50, marginBottom: 15 },
    emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '600' }
});