import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

// 匯入 Firebase 配置
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

const Disease = () => {
  const router = useRouter();
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [injuryType, setInjuryType] = useState<string | null>(null);
  const [customInjury, setCustomInjury] = useState('');
  const [loading, setLoading] = useState(false);

  const injuryCategories = ['骨傷', '肌腱發炎', '神經壓迫', '肌肉拉傷', '韌帶撕裂', '慢性勞損'];

  const handleBodyPartPress = (partName: string) => {
    setSelectedPart(partName);
  };

  const handleSave = async () => {
    const finalType = customInjury.trim() !== '' ? customInjury : injuryType;
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("提醒", "請先登入後再記錄傷病資料");
      return;
    }

    if (!selectedPart || !finalType) {
      Alert.alert("提醒", "請先點選部位並確定傷病類型");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'injuries'), {
        userId: user.uid,
        part: selectedPart,
        type: finalType,
        status: '復健中',
        color: '#3B82F6',
        createdAt: serverTimestamp(),
        date: new Date().toISOString().split('T')[0]
      });

      Alert.alert("存檔成功", "您的傷病紀錄已同步至雲端。", [
        { text: "前往紀錄檔", onPress: () => router.push('/InjuryHistory') }
      ]);
    } catch (error) {
      console.error("Firebase Error: ", error);
      Alert.alert("同步失敗", "請檢查網路連線或稍後再試");
    } finally {
      setLoading(false);
    }
  };

  const getPartColor = (partGroup: string[]) => 
    partGroup.includes(selectedPart || '') ? "url(#selectedGrad)" : "#E2E8F0";

  const getJointColor = (part: string) =>
    selectedPart === part ? "#E11D48" : "#94A3B8";

  const HitArea = ({ cx, cy, rx = 22, ry = 22, part }: { cx: number, cy: number, rx?: number, ry?: number, part: string }) => (
    <Ellipse
      cx={cx}
      cy={cy}
      rx={rx}
      ry={ry}
      fill="transparent"
      onPress={() => handleBodyPartPress(part)}
    />
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#F8FAFC' }}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>醫療安全網</Text>
          <View style={styles.badge}>
            <View style={styles.pulseDot} />
            <Text style={styles.badgeText}>SMART DIAGNOSIS ENABLED</Text>
          </View>
        </View>

        <View style={[styles.card, styles.shadowProp]}>
          <View style={styles.cardHeader}>
            <View style={styles.stepCircle}><Text style={styles.stepText}>1</Text></View>
            <Text style={styles.cardTitle}>受傷位置定位</Text>
          </View>
          
          <View style={styles.statusBanner}>
            <View>
              <Text style={styles.statusLabel}>目前選取部位</Text>
              <Text style={styles.selectedText}>{selectedPart || '等待選取'}</Text>
            </View>
            {selectedPart && (
              <TouchableOpacity onPress={() => setSelectedPart(null)}>
                <Text style={styles.clearText}>重置</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.illustrationContainer}>
            <Svg height="520" width="280" viewBox="0 0 240 520">
              <Defs>
                <LinearGradient id="selectedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#FB7185" />
                  <Stop offset="100%" stopColor="#E11D48" />
                </LinearGradient>
              </Defs>
              <G>
                {/* 軀幹與頭部 */}
                <Circle cx="120" cy="40" r="22" fill={getPartColor(['頭部'])} />
                <Rect x="112" y="62" width="16" height="10" rx="2" fill={getPartColor(['頸部'])} />
                <Path d="M85,80 Q120,75 155,80 L160,150 Q120,165 80,150 Z" fill={getPartColor(['胸部', '背部'])} />
                <Path d="M85,155 Q120,165 155,155 L150,210 Q120,225 90,210 Z" fill={getPartColor(['腹部', '腰部'])} />
                <Path d="M85,215 Q120,230 155,215 L165,245 Q120,260 75,245 Z" fill={getPartColor(['臀部'])} />

                {/* 手臂區塊 */}
                <Path d="M80,85 L55,145" stroke={getPartColor(['左肩', '左上臂'])} strokeWidth="16" strokeLinecap="round" />
                <Path d="M160,85 L185,145" stroke={getPartColor(['右肩', '右上臂'])} strokeWidth="16" strokeLinecap="round" />
                <Path d="M55,145 L40,200" stroke={getPartColor(['左肘', '左前臂'])} strokeWidth="14" strokeLinecap="round" />
                <Path d="M185,145 L200,200" stroke={getPartColor(['右肘', '右前臂'])} strokeWidth="14" strokeLinecap="round" />
                <Circle cx="35" cy="215" r="8" fill={getPartColor(['左手掌'])} />
                <Circle cx="205" cy="215" r="8" fill={getPartColor(['右手掌'])} />

                {/* 腿部區塊 */}
                <Path d="M95,245 L85,340" stroke={getPartColor(['左大腿'])} strokeWidth="20" strokeLinecap="round" />
                <Path d="M145,245 L155,340" stroke={getPartColor(['右大腿'])} strokeWidth="20" strokeLinecap="round" />
                <Path d="M85,340 L85,435" stroke={getPartColor(['左小腿'])} strokeWidth="16" strokeLinecap="round" />
                <Path d="M155,340 L155,435" stroke={getPartColor(['右小腿'])} strokeWidth="16" strokeLinecap="round" />

                {/* 關節點視覺與腳掌 */}
                <Circle cx="85" cy="345" r="7" fill={getJointColor('左膝')} />
                <Circle cx="155" cy="345" r="7" fill={getJointColor('右膝')} />
                <Circle cx="85" cy="445" r="6" fill={getJointColor('左踝')} />
                <Circle cx="155" cy="445" r="6" fill={getJointColor('右踝')} />
                <Rect x="70" y="455" width="25" height="10" rx="4" fill={getPartColor(['左腳掌'])} />
                <Rect x="145" y="455" width="25" height="10" rx="4" fill={getPartColor(['右腳掌'])} />

                {/* 隱形成像觸控點 (HitAreas) */}
                <HitArea cx={120} cy={40} rx={25} ry={25} part="頭部" />
                <HitArea cx={120} cy={68} rx={20} ry={10} part="頸部" />
                <HitArea cx={120} cy={115} rx={35} ry={35} part="胸背部" />
                <HitArea cx={120} cy={180} rx={30} ry={25} part="腰腹部" />
                <HitArea cx={120} cy={235} rx={35} ry={20} part="臀部" />
                
                <HitArea cx={75} cy={95} part="左肩" />
                <HitArea cx={165} cy={95} part="右肩" />
                <HitArea cx={55} cy={145} part="左肘" />
                <HitArea cx={185} cy={145} part="右肘" />
                <HitArea cx={35} cy={215} part="左手掌" />
                <HitArea cx={205} cy={215} part="右手掌" />

                <HitArea cx={90} cy={290} rx={15} ry={40} part="左大腿" />
                <HitArea cx={150} cy={290} rx={15} ry={40} part="右大腿" />
                <HitArea cx={85} cy={345} part="左膝" />
                <HitArea cx={155} cy={345} part="右膝" />
                <HitArea cx={85} cy={395} rx={12} ry={35} part="左小腿" />
                <HitArea cx={155} cy={395} rx={12} ry={35} part="右小腿" />
                <HitArea cx={85} cy={445} part="左踝" />
                <HitArea cx={155} cy={445} part="右踝" />
                <HitArea cx={80} cy={465} rx={15} ry={10} part="左腳掌" />
                <HitArea cx={160} cy={465} rx={15} ry={10} part="右腳掌" />
              </G>
            </Svg>
          </View>
        </View>

        <View style={[styles.card, styles.shadowProp]}>
          <View style={styles.cardHeader}>
            <View style={styles.stepCircle}><Text style={styles.stepText}>2</Text></View>
            <Text style={styles.cardTitle}>傷病性質診斷</Text>
          </View>
          <View style={styles.chipContainer}>
            {injuryCategories.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.chip, injuryType === type && styles.chipSelected]}
                onPress={() => { setInjuryType(type); setCustomInjury(''); }}
              >
                <Text style={[styles.chipText, injuryType === type && styles.chipTextSelected]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.divider} />
          <Text style={styles.inputLabel}>補充詳細狀況</Text>
          <TextInput
            style={styles.input}
            placeholder="例如：稍微紅腫、伸展時疼痛..."
            placeholderTextColor="#94A3B8"
            value={customInjury}
            onChangeText={(text) => { setCustomInjury(text); setInjuryType(null); }}
          />
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, (loading || !selectedPart || (!injuryType && !customInjury)) && styles.disabledButton]} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>確認並同步雲端數據</Text>}
        </TouchableOpacity>
        
        <Text style={styles.footerNote}>資料已通過 Firebase SSL 加密傳輸</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 20, paddingTop: 40 },
  header: { marginBottom: 25,marginTop:-40 },
  title: { fontSize: 34, fontFamily:'Zen', color: '#0F172A', letterSpacing: -1 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginTop: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 8 },
  badgeText: { fontSize: 11, color: '#64748B', fontFamily:'Zen', letterSpacing: 0.5 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 30, padding: 24, marginBottom: 20 },
  shadowProp: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  stepCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  stepText: { color: '#FFF', fontSize: 16, fontFamily:'Zen' },
  cardTitle: { fontSize: 22, fontFamily:'Zen', color: '#1E293B' },
  statusBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 16, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9' },
  statusLabel: { fontSize: 12, color: '#94A3B8', fontFamily:'Zen', textTransform: 'uppercase' },
  selectedText: { color: '#E11D48', fontFamily:'Zen', fontSize: 18, marginTop: 2 },
  clearText: { color: '#64748B', fontSize: 14, fontFamily:'Zen' },
  illustrationContainer: { height: 520, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 24 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 16, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  chipSelected: { backgroundColor: '#1E293B', borderColor: '#1E293B' },
  chipText: { color: '#475569', fontSize: 14, fontFamily:'Zen' },
  chipTextSelected: { color: '#FFFFFF', fontFamily:'Zen' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 25 },
  inputLabel: { fontSize: 15, color: '#1E293B', fontFamily:'Zen', marginBottom: 12 },
  input: { backgroundColor: '#F8FAFC', borderRadius: 18, padding: 18, fontSize: 16, color: '#0F172A', borderWidth: 1, borderColor: '#E2E8F0', fontFamily:'Zen' },
  saveButton: { backgroundColor: '#E11D48', padding: 22, borderRadius: 24, alignItems: 'center', shadowColor: '#E11D48', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10, marginTop: 10, marginBottom: 10 },
  disabledButton: { backgroundColor: '#CBD5E1', shadowOpacity: 0 },
  saveButtonText: { color: '#FFFFFF', fontSize: 18, fontFamily:'Zen' },
  footerNote: { textAlign: 'center', color: '#94A3B8', fontSize: 13, marginBottom: 50, marginTop: 10 , fontFamily:'Zen'},
});

export default Disease;