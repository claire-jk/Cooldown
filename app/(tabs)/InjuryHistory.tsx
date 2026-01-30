import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 匯入 Firebase 配置
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

// 定義資料介面
interface InjuryRecord {
    id: string;
    part: string;
    type: string;
    date: string;
    status: string;
    color: string;
}

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

        // 建立 Firebase 查詢：按用戶 ID 篩選，並依建立時間排序
        const q = query(
            collection(db, 'injuries'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );

        // 使用 onSnapshot 進行即時同步，資料庫一動這裡就更新
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

        return () => unsubscribe(); // 卸載組件時取消監聽
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>❮</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>傷病紀錄檔</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>💡 詳實紀錄傷病位置，有助於系統為您調整收操強度。</Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 40 }} />
                ) : injuries.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>尚無紀錄，點擊下方按鈕新增</Text>
                    </View>
                ) : (
                    injuries.map((injury) => (
                        <View key={injury.id} style={styles.injuryCard}>
                            <View style={styles.cardTop}>
                                <View style={[styles.tag, { backgroundColor: (injury.color || '#3B82F6') + '20' }]}>
                                    <Text style={[styles.tagText, { color: injury.color || '#3B82F6' }]}>{injury.status}</Text>
                                </View>
                                <Text style={styles.dateText}>{injury.date}</Text>
                            </View>
                            
                            <Text style={styles.partTitle}>{injury.part}</Text>
                            <Text style={styles.typeText}>{injury.type}</Text>
                            
                            <TouchableOpacity style={styles.detailBtn}>
                                <Text style={styles.detailBtnText}>查看復健建議</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                )}

                <TouchableOpacity 
                    style={styles.addBtn} 
                    onPress={() => router.push('/Disease')}
                >
                    <Text style={styles.addBtnText}>+ 新增傷病紀錄</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, backgroundColor: '#FFF' },
    backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12 },
    backBtnText: { fontSize: 18, color: '#475569', fontWeight: 'bold' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
    scrollContent: { padding: 20 },
    infoBox: { backgroundColor: '#EFF6FF', padding: 15, borderRadius: 15, marginBottom: 25 },
    infoText: { color: '#3B82F6', fontSize: 13, lineHeight: 20 },
    injuryCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    tagText: { fontSize: 12, fontWeight: 'bold' },
    dateText: { fontSize: 12, color: '#94A3B8' },
    partTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
    typeText: { fontSize: 14, color: '#64748B', marginTop: 4 },
    detailBtn: { marginTop: 15, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 15 },
    detailBtnText: { color: '#3B82F6', fontWeight: '600', fontSize: 14 },
    addBtn: { marginTop: 10, padding: 18, borderRadius: 20, borderStyle: 'dashed', borderWidth: 2, borderColor: '#CBD5E1', alignItems: 'center' },
    addBtnText: { color: '#64748B', fontWeight: 'bold' },
    emptyContainer: { alignItems: 'center', marginVertical: 40 },
    emptyText: { color: '#94A3B8', fontSize: 14 }
});