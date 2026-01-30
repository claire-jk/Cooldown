import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Firebase 相關功能
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

const { width } = Dimensions.get('window');

interface MemberScreenProps {
  navigation?: any;
}

const MemberScreen: React.FC<MemberScreenProps> = ({ navigation }) => {
  const [nickname, setNickname] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMsg, setModalMsg] = useState('');

  const user = auth.currentUser;

  // 1. 初始化：進入頁面時抓取 Firestore 暱稱資料
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setNickname(data.nickname || '收操小達人');
        } else {
          const defaultName = '收操小達人';
          await setDoc(docRef, {
            nickname: defaultName,
            email: user.email,
          });
          setNickname(defaultName);
        }
      } catch (error) {
        console.error('讀取使用者資料失敗:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, [user]);

  // 2. 儲存暱稱至 Firestore
  const handleSaveNickname = async () => {
    if (!user) return;
    if (nickname.trim() === '') {
      showCustomAlert('暱稱不能為空喔！');
      return;
    }

    try {
      setLoading(true);
      await updateDoc(doc(db, 'users', user.uid), { nickname: nickname });
      setIsEditing(false);
      showCustomAlert('暱稱已成功更新！');
    } catch (e) {
      showCustomAlert('更新失敗，請檢查網路連線。');
    } finally {
      setLoading(false);
    }
  };

  const showCustomAlert = (msg: string) => {
    setModalMsg(msg);
    setModalVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>資料同步中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* 頂部藍色背景區域 */}
      <View style={styles.headerBackground}>
        <Text style={styles.headerTitle}>會員中心</Text>
      </View>

      {/* 使用者資訊卡片 (已移除頭像區塊) */}
      <View style={styles.profileCard}>
        <View style={styles.nicknameSection}>
          {isEditing ? (
            <View style={styles.editWrapper}>
              <TextInput
                style={styles.input}
                value={nickname}
                onChangeText={setNickname}
                autoFocus
                placeholder="輸入新暱稱"
                maxLength={10}
              />
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveNickname}>
                <Text style={styles.saveBtnText}>儲存</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.displayWrapper}>
              <Text style={styles.nicknameLabel}>目前的匿名</Text>
              <Text style={styles.nicknameText}>{nickname}</Text>
              <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
                <Text style={styles.editButtonText}>修改暱稱</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* 功能選單區域 */}
      <Text style={styles.sectionTitle}>紀錄查詢</Text>
      <View style={styles.menuCard}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation?.navigate('FatigueHistory')}>
          <View style={styles.menuLeft}>
            <View style={[styles.iconCircle, { backgroundColor: '#E3F2FD' }]}><Text>📊</Text></View>
            <Text style={styles.menuText}>疲勞度歷史紀錄</Text>
          </View>
          <Text style={styles.arrow}>〉</Text>
        </TouchableOpacity>

        <View style={styles.menuDivider} />

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation?.navigate('InjuryHistory')}>
          <View style={styles.menuLeft}>
            <View style={[styles.iconCircle, { backgroundColor: '#FFF3E0' }]}><Text>🤕</Text></View>
            <Text style={styles.menuText}>傷病歷史紀錄</Text>
          </View>
          <Text style={styles.arrow}>〉</Text>
        </TouchableOpacity>
      </View>

      {/* 登出按鈕 */}
      <TouchableOpacity style={styles.logoutBtn} onPress={() => showCustomAlert("功能測試：確定要登出嗎？")}>
        <Text style={styles.logoutText}>登出帳號</Text>
      </TouchableOpacity>

      {/* 自定義 Modal */}
      <Modal transparent={true} visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconCircle}><Text style={{ fontSize: 24 }}>✨</Text></View>
            <Text style={styles.modalTitle}>提醒</Text>
            <Text style={styles.modalBody}>{modalMsg}</Text>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseBtnText}>我知道了</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  loadingText: { marginTop: 10, color: '#4A90E2',fontFamily: 'Zen', fontSize: 16 },
  headerBackground: { 
    height: 140, // 稍微調低一點，因為沒頭像了
    width: '100%', 
    backgroundColor: '#4A90E2', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: { color: '#fff', fontSize: 20,fontFamily: 'Zen' },
  profileCard: { 
    backgroundColor: '#fff', 
    marginTop: -30, 
    marginHorizontal: 20, 
    borderRadius: 24, 
    padding: 25, 
    alignItems: 'center', 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 10 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 15, 
    elevation: 8 
  },
  nicknameSection: { width: '100%', alignItems: 'center' },
  nicknameLabel: { fontSize: 13, color: '#94A3B8', marginBottom: 4,fontFamily: 'Zen' },
  nicknameText: { fontSize: 24,fontFamily: 'Zen', color: '#1E293B', marginBottom: 12 },
  editButton: { 
    paddingHorizontal: 20, 
    paddingVertical: 8, 
    borderRadius: 20, 
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#E0E7FF'
  },
  editButtonText: { color: '#4F46E5', fontSize: 14,fontFamily: 'Zen' },
  displayWrapper: { alignItems: 'center' },
  editWrapper: { flexDirection: 'row', width: '100%', justifyContent: 'center' },
  input: { 
    backgroundColor: '#F1F5F9', 
    borderRadius: 12, 
    paddingHorizontal: 15, 
    paddingVertical: 10, 
    fontSize: 16, 
    flex: 1,
    maxWidth: 200,
    color: '#1E293B',fontFamily: 'Zen'
  },
  saveBtn: { 
    marginLeft: 10, 
    backgroundColor: '#4A90E2', 
    justifyContent: 'center',
    paddingHorizontal: 20, 
    borderRadius: 12 
  },
  saveBtnText: { color: '#fff',fontFamily: 'Zen' },
  sectionTitle: { marginHorizontal: 25, marginTop: 25, marginBottom: 10, fontSize: 15,fontFamily: 'Zen', color: '#64748B' },
  menuCard: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 20, overflow: 'hidden', elevation: 2 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18 },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuText: { fontSize: 16,fontFamily: 'Zen', color: '#334155' },
  menuDivider: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 18 },
  arrow: { color: '#CBD5E1', fontSize: 14,fontFamily: 'Zen' },
  logoutBtn: { marginTop: 30, marginHorizontal: 20, padding: 16, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', borderWidth: 1, borderColor: '#FEE2E2' },
  logoutText: { color: '#EF4444',fontFamily: 'Zen', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.8, backgroundColor: '#fff', borderRadius: 24, padding: 25, alignItems: 'center' },
  modalIconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F0F9FF', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 18,fontFamily: 'Zen', marginBottom: 8, color: '#0F172A' },
  modalBody: { fontSize: 15, color: '#475569', textAlign: 'center', marginBottom: 20,fontFamily: 'Zen'},
  modalCloseBtn: { backgroundColor: '#4A90E2', width: '100%', padding: 14, borderRadius: 16, alignItems: 'center' },
  modalCloseBtnText: { color: '#fff',fontFamily: 'Zen', fontSize: 16 }
});

export default MemberScreen;