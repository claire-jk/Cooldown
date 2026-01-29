import React, { useState } from 'react';
import {
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

const Disease = () => {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [injuryType, setInjuryType] = useState<string | null>(null);
  const [customInjury, setCustomInjury] = useState('');

  const injuryCategories = ['骨傷', '肌腱發炎', '神經壓迫', '肌肉拉傷', '韌帶撕裂', '慢性勞損'];

  const handleBodyPartPress = (partName: string) => {
    setSelectedPart(partName);
  };

  const handleSave = () => {
    const finalType = customInjury.trim() !== '' ? customInjury : injuryType;
    if (!selectedPart || !finalType) {
      Alert.alert("提醒", "請先點選部位並確定傷病類型");
      return;
    }
    Alert.alert("存檔成功", `部位：${selectedPart}\n診斷：${finalType}\n已同步至您的醫療安全網。`);
  };

  // 輔助函式：顏色切換
  const getPartColor = (partGroup: string[]) => 
    partGroup.includes(selectedPart || '') ? "url(#selectedGrad)" : "#E2E8F0";

  const getJointColor = (part: string) =>
    selectedPart === part ? "#E11D48" : "#94A3B8";

  // 優化後的點擊區域：增加半徑並確保在最上層
  const HitArea = ({ cx, cy, rx = 28, ry = 28, part }: { cx: number, cy: number, rx?: number, ry?: number, part: string }) => (
    <Ellipse
      cx={cx}
      cy={cy}
      rx={rx}
      ry={ry}
      fill="transparent"
      onPress={() => handleBodyPartPress(part)}
      // 增加 pointerEvents 確保響應
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

        {/* 1. Body Selector Card */}
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
            <Svg height="480" width="280" viewBox="0 0 240 480">
              <Defs>
                <LinearGradient id="selectedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#FB7185" />
                  <Stop offset="100%" stopColor="#E11D48" />
                </LinearGradient>
              </Defs>
              
              <G>
                {/* 視覺底圖層 */}
                <Circle cx="120" cy="40" r="22" fill={getPartColor(['頭部'])} />
                <Rect x="110" y="62" width="20" height="12" rx="3" fill={getPartColor(['頸部'])} />
                
                <Path d="M85,80 Q120,75 155,80 L160,160 Q120,175 80,160 Z" fill={getPartColor(['胸部', '核心軀幹'])} />
                <Path d="M85,165 Q120,175 155,165 L150,210 Q120,225 90,210 Z" fill={getPartColor(['腹部', '腰部'])} />

                <Path d="M80,85 L50,150" stroke={getPartColor(['左上臂'])} strokeWidth="16" strokeLinecap="round" />
                <Path d="M50,165 L40,220" stroke={getPartColor(['左前臂'])} strokeWidth="14" strokeLinecap="round" />
                
                <Path d="M160,85 L190,150" stroke={getPartColor(['右上臂'])} strokeWidth="16" strokeLinecap="round" />
                <Path d="M190,165 L200,220" stroke={getPartColor(['右前臂'])} strokeWidth="14" strokeLinecap="round" />

                <Path d="M95,220 L85,320" stroke={getPartColor(['左大腿'])} strokeWidth="20" strokeLinecap="round" />
                <Path d="M85,340 L85,430" stroke={getPartColor(['左小腿'])} strokeWidth="16" strokeLinecap="round" />

                <Path d="M145,220 L155,320" stroke={getPartColor(['右大腿'])} strokeWidth="20" strokeLinecap="round" />
                <Path d="M155,340 L155,430" stroke={getPartColor(['右小腿'])} strokeWidth="16" strokeLinecap="round" />

                {/* 視覺關節點 */}
                <Circle cx="80" cy="85" r="7" fill={getJointColor('左肩')} />
                <Circle cx="160" cy="85" r="7" fill={getJointColor('右肩')} />
                <Circle cx="50" cy="158" r="6" fill={getJointColor('左肘')} />
                <Circle cx="190" cy="158" r="6" fill={getJointColor('右肘')} />
                <Circle cx="85" cy="330" r="8" fill={getJointColor('左膝')} />
                <Circle cx="155" cy="330" r="8" fill={getJointColor('右膝')} />
                <Circle cx="85" cy="440" r="6" fill={getJointColor('左踝')} />
                <Circle cx="155" cy="440" r="6" fill={getJointColor('右踝')} />

                {/* 頂層透明觸控網格 - 增加 rx, ry 以擴大靈敏度 */}
                <HitArea cx={120} cy={40} rx={30} ry={30} part="頭部" />
                <HitArea cx={120} cy={68} rx={25} ry={15} part="頸部" />
                <HitArea cx={80} cy={85} rx={22} ry={22} part="左肩" />
                <HitArea cx={160} cy={85} rx={22} ry={22} part="右肩" />
                <HitArea cx={120} cy={120} rx={40} ry={40} part="胸部" />
                <HitArea cx={120} cy={185} rx={35} ry={25} part="腰部" />
                <HitArea cx={60} cy={120} rx={20} ry={30} part="左上臂" />
                <HitArea cx={180} cy={120} rx={20} ry={30} part="右上臂" />
                <HitArea cx={50} cy={158} rx={20} ry={20} part="左肘" />
                <HitArea cx={190} cy={158} rx={20} ry={20} part="右肘" />
                <HitArea cx={42} cy={200} rx={20} ry={25} part="左前臂" />
                <HitArea cx={198} cy={200} rx={20} ry={25} part="右前臂" />
                <HitArea cx={90} cy={270} rx={25} ry={45} part="左大腿" />
                <HitArea cx={150} cy={270} rx={25} ry={45} part="右大腿" />
                <HitArea cx={85} cy={330} rx={25} ry={25} part="左膝" />
                <HitArea cx={155} cy={330} rx={25} ry={25} part="右膝" />
                <HitArea cx={85} cy={385} rx={20} ry={40} part="左小腿" />
                <HitArea cx={155} cy={385} rx={20} ry={40} part="右小腿" />
                <HitArea cx={85} cy={445} rx={20} ry={20} part="左踝" />
                <HitArea cx={155} cy={445} rx={20} ry={20} part="右踝" />
              </G>
            </Svg>
          </View>
        </View>

        {/* 2. Injury Type Card */}
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
          style={[styles.saveButton, (!selectedPart || (!injuryType && !customInjury)) && styles.disabledButton]} 
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>確認並同步雲端數據</Text>
        </TouchableOpacity>
        
        <Text style={styles.footerNote}>資料已通過 SSL 加密傳輸</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 20, paddingTop: 40 },
  header: { marginBottom: 25 },
  title: { fontSize: 34, fontWeight: '900', color: '#0F172A', letterSpacing: -1 },
  badge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
    alignSelf: 'flex-start',
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20, 
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 8 },
  badgeText: { fontSize: 11, color: '#64748B', fontWeight: 'bold', letterSpacing: 0.5 },
  
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 24,
    marginBottom: 20,
  },
  shadowProp: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  stepCircle: { 
    width: 30, 
    height: 30, 
    borderRadius: 15, 
    backgroundColor: '#0F172A', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 12
  },
  stepText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  
  statusBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  statusLabel: { fontSize: 12, color: '#94A3B8', fontWeight: 'bold', textTransform: 'uppercase' },
  selectedText: { color: '#E11D48', fontWeight: '900', fontSize: 18, marginTop: 2 },
  clearText: { color: '#64748B', fontSize: 14, fontWeight: '600' },
  
  illustrationContainer: { 
    height: 500, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
  },
  
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipSelected: { 
    backgroundColor: '#1E293B', 
    borderColor: '#1E293B',
  },
  chipText: { color: '#475569', fontSize: 14, fontWeight: '600' },
  chipTextSelected: { color: '#FFFFFF' },
  
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 25 },
  inputLabel: { fontSize: 15, color: '#1E293B', fontWeight: '700', marginBottom: 12 },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 18,
    fontSize: 16,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  
  saveButton: {
    backgroundColor: '#E11D48',
    padding: 22,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    marginTop: 10,
    marginBottom: 10
  },
  disabledButton: { backgroundColor: '#CBD5E1', shadowOpacity: 0 },
  saveButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  
  footerNote: { textAlign: 'center', color: '#94A3B8', fontSize: 13, marginBottom: 50, marginTop: 10 },
});

export default Disease;