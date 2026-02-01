import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// 匯入 Firebase 配置
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig';

const AuthScreen = () => {
  // 1. 改用 useState 手動管理主題，預設為 'light'
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const isDark = themeMode === 'dark';

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  // 新增：控制密碼是否可見
  const [showPassword, setShowPassword] = useState(false);

  // 自定義 Modal 狀態
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '' });

  // 切換主題的函式
  const toggleTheme = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  const showCustomAlert = (title: string, message: string) => {
    setModalConfig({ title, message });
    setModalVisible(true);
  };

  const handleAuth = async () => {
    if (!email || !password) {
      showCustomAlert("提示", "請輸入電子郵件和密碼");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        showCustomAlert("登入成功", "歡迎回到 Cooldown！");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        showCustomAlert("註冊成功", "帳號已建立，請登入開始收操");
        setIsLogin(true);
      }
    } catch (error: any) {
      let message = "認證失敗，請檢查網路連線";
      if (error.code === 'auth/invalid-credential') message = "帳號或密碼錯誤";
      if (error.code === 'auth/email-already-in-use') message = "此信箱已被註冊";
      if (error.code === 'auth/weak-password') message = "密碼至少需要 6 位數";
      if (error.code === 'auth/invalid-email') message = "信箱格式不正確";
      showCustomAlert("操作失敗", message);
    } finally {
      setLoading(false);
    }
  };

  // 動態樣式物件
  const themeStyles = {
    container: isDark ? styles.darkBG : styles.lightBG,
    text: isDark ? styles.darkText : styles.lightText,
    inputBG: isDark ? styles.darkInput : styles.lightInput,
    cardBG: isDark ? styles.darkCard : styles.lightCard,
  };

  return (
    <SafeAreaView style={[styles.container, themeStyles.container]}>
      {/* 讓狀態列圖示跟著主題變換 */}
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* 2. 新增手動切換按鈕 (右上角) */}
      <TouchableOpacity 
        style={[styles.themeToggleBtn, { backgroundColor: isDark ? '#333' : '#F0F0F0' }]} 
        onPress={toggleTheme}
      >
        <Text style={{ fontSize: 20 }}>{isDark ? '☀️' : '🌙'}</Text>
      </TouchableOpacity>
      
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, themeStyles.cardBG]}>
            <Text style={[styles.modalTitle, themeStyles.text]}>{modalConfig.title}</Text>
            <Text style={[styles.modalMessage, themeStyles.text]}>{modalConfig.message}</Text>
            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>我知道了</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <View style={styles.innerContainer}>
          <View style={styles.header}>
            <Text style={styles.brandTitle}>COOLDOWN</Text>
            <Text style={[styles.title, themeStyles.text]}>{isLogin ? '歡迎回來' : '建立新帳號'}</Text>
            <Text style={[styles.subtitle, themeStyles.text]}>
              {isLogin ? '讓身體在訓練後得到最好的修復' : '開始你的科學化收操之旅'}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, themeStyles.text]}>電子郵件</Text>
              <TextInput
                style={[styles.input, themeStyles.inputBG, themeStyles.text]}
                placeholder="example@email.com"
                placeholderTextColor={isDark ? "#888" : "#999"}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, themeStyles.text]}>密碼</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={[styles.input, themeStyles.inputBG, themeStyles.text, { flex: 1 }]}
                  placeholder="至少 6 位密碼"
                  placeholderTextColor={isDark ? "#888" : "#999"}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeButton} 
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={{ fontSize: 18 }}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.mainButton, loading && styles.disabledButton]} 
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : 
                <Text style={styles.mainButtonText}>{isLogin ? '登入' : '註冊'}</Text>
              }
            </TouchableOpacity>
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.line} />
            <Text style={[styles.dividerText, { color: isDark ? '#666' : '#999' }]}>或</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity 
            style={[styles.googleButton, { borderColor: isDark ? '#4A90E2' : '#DDD' }]} 
            onPress={() => Alert.alert("開發中")}
          >
            <Text style={styles.googleButtonText}>G</Text>
            <Text style={[styles.googleButtonLabel, { color: isDark ? '#FFF' : '#444' }]}>Google 繼續</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchButton}>
            <Text style={[styles.switchText, themeStyles.text]}>
              {isLogin ? '還沒有帳號？ ' : '已經有帳號了？ '}
              <Text style={styles.switchAction}>{isLogin ? '立即註冊' : '立即登入'}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  innerContainer: { flex: 1, paddingHorizontal: 30, justifyContent: 'center' },
  header: { marginBottom: 30 },
  
  // 主題切換按鈕樣式
  themeToggleBtn: {
    position: 'absolute',
    top: 60,
    right: 30,
    zIndex: 10,
    padding: 10,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },

  form: { 
    width: '100%',
    marginTop: 10 
  },
  inputContainer: { 
    marginBottom: 20,
    width: '100%'
  },

  // 密碼框特殊包裹器
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative'
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    height: '100%',
    justifyContent: 'center',
  },

  // 顏色模式樣式定義
  lightBG: { backgroundColor: '#FFFFFF' },
  darkBG: { backgroundColor: '#121212' },
  lightText: { color: '#1A1A1A' },
  darkText: { color: '#F5F5F5' },
  lightInput: { backgroundColor: '#F5F7FA', borderColor: '#E1E8ED' },
  darkInput: { backgroundColor: '#1E1E1E', borderColor: '#333' },
  lightCard: { backgroundColor: '#FFF' },
  darkCard: { backgroundColor: '#252525' },

  brandTitle: { fontSize: 24, color: '#4A90E2', letterSpacing: 2, marginBottom: 8, fontFamily: 'Caveat' },
  title: { fontSize: 32, fontFamily: 'Zen'},
  subtitle: { fontSize: 15, marginTop: 8, fontFamily: 'Zen', opacity: 0.7 },
  inputLabel: { fontSize: 14, fontFamily: 'Zen', marginBottom: 8, marginLeft: 4 },
  
  input: { paddingHorizontal: 16, paddingVertical: 14, borderRadius: 16, fontSize: 16, borderWidth: 1, fontFamily: 'Zen' },
  mainButton: { backgroundColor: '#4A90E2', paddingVertical: 16, borderRadius: 25, alignItems: 'center', marginTop: 10, shadowColor: "#4A90E2", shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  disabledButton: { backgroundColor: '#95a5a6' },
  mainButtonText: { color: 'white', fontSize: 18, fontFamily: 'Zen' },
  
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 25 },
  line: { flex: 1, height: 1, backgroundColor: '#33333333' },
  dividerText: { marginHorizontal: 15, fontSize: 12, fontFamily: 'Zen' },

  googleButton: { flexDirection: 'row', backgroundColor: 'transparent', borderWidth: 1, paddingVertical: 14, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  googleButtonText: { fontSize: 20, fontFamily: 'Zen', color: '#4A90E2', marginRight: 10 },
  googleButtonLabel: { fontSize: 16, fontFamily: 'Zen' },

  switchButton: { marginTop: 25, alignItems: 'center' },
  switchText: { fontSize: 14, fontFamily: 'Zen' },
  switchAction: { color: '#4A90E2',  fontFamily: 'Zen' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', padding: 25, borderRadius: 30, alignItems: 'center', shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  modalTitle: { fontSize: 22, fontFamily: 'Zen', marginBottom: 15 },
  modalMessage: { fontSize: 16, fontFamily: 'Zen', textAlign: 'center', marginBottom: 25, lineHeight: 22 },
  modalButton: { backgroundColor: '#4A90E2', paddingHorizontal: 40, paddingVertical: 12, borderRadius: 20 },
  modalButtonText: { color: '#FFF', fontSize: 16, fontFamily: 'Zen' }
});

export default AuthScreen;