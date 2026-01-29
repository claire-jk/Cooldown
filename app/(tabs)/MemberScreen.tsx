import React, { useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// 定義 Props 型別 (如果是使用 Expo Router，navigation 是選填的)
interface MemberScreenProps {
  navigation?: any; 
}

const MemberScreen: React.FC<MemberScreenProps> = ({ navigation }) => {
  // 狀態管理：使用者資訊
  const [nickname, setNickname] = useState('收操小達人');
  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState('https://via.placeholder.com/100');

  // 模擬存檔功能
  const handleSaveNickname = () => {
    if (nickname.trim() === '') {
      Alert.alert("提示", "暱稱不能為空");
      return;
    }
    setIsEditing(false);
    Alert.alert("提示", "暱稱已更新！");
  };

  return (
    <ScrollView style={styles.container}>
      {/* 個人資料區塊 */}
      <View style={styles.profileSection}>
        <TouchableOpacity onPress={() => Alert.alert("提示", "開啟相簿選取頭像")}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
          <View style={styles.editBadge}>
            <Text style={styles.editBadgeText}>更換</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.nicknameContainer}>
          {isEditing ? (
            <View style={styles.editRow}>
              <TextInput
                style={styles.input}
                value={nickname}
                onChangeText={setNickname}
                autoFocus
              />
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveNickname}>
                <Text style={styles.saveBtnText}>儲存</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.editRow}>
              <Text style={styles.nicknameText}>{nickname}</Text>
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Text style={styles.editLink}>修改</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      {/* 功能按鈕區塊 */}
      <View style={styles.menuSection}>
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => navigation?.navigate('FatigueHistory')}
        >
          <Text style={styles.menuText}>📊 疲勞度歷史紀錄</Text>
          <Text style={styles.arrow}>〉</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => navigation?.navigate('InjuryHistory')}
        >
          <Text style={styles.menuText}>🤕 傷病歷史紀錄</Text>
          <Text style={styles.arrow}>〉</Text>
        </TouchableOpacity>
      </View>

      {/* 登出按鈕 */}
      <TouchableOpacity 
        style={styles.logoutBtn} 
        onPress={() => Alert.alert("登出", "確定要登出嗎？")}
      >
        <Text style={styles.logoutText}>登出帳號</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  profileSection: { alignItems: 'center', padding: 30, backgroundColor: '#fff' },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 15 },
  editBadge: {
    position: 'absolute', bottom: 15, right: 0,
    backgroundColor: '#007AFF', paddingHorizontal: 8,
    paddingVertical: 4, borderRadius: 10
  },
  editBadgeText: { color: '#fff', fontSize: 12 },
  nicknameContainer: { marginTop: 10, width: '100%', alignItems: 'center' },
  nicknameText: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  editRow: { flexDirection: 'row', alignItems: 'center' },
  editLink: { marginLeft: 10, color: '#007AFF', fontSize: 14 },
  input: {
    borderBottomWidth: 1, borderBottomColor: '#007AFF',
    fontSize: 18, width: 150, textAlign: 'center', padding: 5
  },
  saveBtn: { marginLeft: 10, backgroundColor: '#34C759', padding: 6, borderRadius: 5 },
  saveBtnText: { color: '#fff' },
  divider: { height: 10, backgroundColor: '#f0f0f0' },
  menuSection: { paddingHorizontal: 20, backgroundColor: '#fff' },
  menuItem: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#eee'
  },
  menuText: { fontSize: 16, color: '#444' },
  arrow: { color: '#ccc', fontSize: 18 },
  logoutBtn: { margin: 30, alignItems: 'center', padding: 15, borderRadius: 10, backgroundColor: '#ffefef' },
  logoutText: { color: '#FF3B30', fontWeight: 'bold' }
});

export default MemberScreen;