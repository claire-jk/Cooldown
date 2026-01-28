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
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

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

  const HitArea = ({ cx, cy, r = 25, part }: { cx: number, cy: number, r?: number, part: string }) => (
    <Circle
      cx={cx}
      cy={cy}
      r={r}
      fill="transparent"
      onPress={() => handleBodyPartPress(part)}
    />
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#F0F4F8' }}
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
            <Text style={styles.badgeText}>PRECISION TRACKING</Text>
          </View>
        </View>

        {/* 1. Body Selector Card */}
        <View style={[styles.card, styles.shadowProp]}>
          <View style={styles.cardHeader}>
            <View style={styles.stepCircle}><Text style={styles.stepText}>1</Text></View>
            <Text style={styles.cardTitle}>受傷位置定位</Text>
          </View>
          
          <Text style={styles.statusLabel}>
            選定區域：<Text style={styles.selectedText}>{selectedPart || '等待選取...'}</Text>
          </Text>
          
          <View style={styles.illustrationContainer}>
            
            <Svg height="380" width="220" viewBox="0 0 200 400">
              <Defs>
                <LinearGradient id="selectedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#FB7185" />
                  <Stop offset="100%" stopColor="#E11D48" />
                </LinearGradient>
              </Defs>
              <G>
                {/* 簡約質感人體 */}
                <Circle cx="100" cy="40" r="25" fill={selectedPart === '頭部' ? "url(#selectedGrad)" : '#CBD5E1'} />
                <Rect x="88" y="65" width="24" height="15" rx="4" fill={selectedPart === '頸部' ? "url(#selectedGrad)" : '#CBD5E1'} />
                <Path d="M75,85 Q100,80 125,85 L130,175 Q100,185 70,175 Z" fill={selectedPart === '核心軀幹' ? "url(#selectedGrad)" : '#E2E8F0'} />
                
                {/* 關節點標註 */}
                <Circle cx="60" cy="95" r="12" fill={selectedPart === '左肩' ? "url(#selectedGrad)" : '#94A3B8'} stroke="#FFF" strokeWidth="2" />
                <Circle cx="140" cy="95" r="12" fill={selectedPart === '右肩' ? "url(#selectedGrad)" : '#94A3B8'} stroke="#FFF" strokeWidth="2" />
                
                <Path d="M45,100 L55,180" stroke={selectedPart === '左臂' ? "#E11D48" : '#94A3B8'} strokeWidth="12" strokeLinecap="round" />
                <Path d="M155,100 L145,180" stroke={selectedPart === '右臂' ? "#E11D48" : '#94A3B8'} strokeWidth="12" strokeLinecap="round" />
                
                <Circle cx="75" cy="230" r="18" fill={selectedPart === '左大腿' ? "url(#selectedGrad)" : '#CBD5E1'} />
                <Circle cx="125" cy="230" r="18" fill={selectedPart === '右大腿' ? "url(#selectedGrad)" : '#CBD5E1'} />
                
                <Circle cx="75" cy="300" r="12" fill={selectedPart === '左膝' ? "url(#selectedGrad)" : '#64748B'} stroke="#FFF" strokeWidth="2" />
                <Circle cx="125" cy="300" r="12" fill={selectedPart === '右膝' ? "url(#selectedGrad)" : '#64748B'} stroke="#FFF" strokeWidth="2" />

                {/* 觸控層 */}
                <HitArea cx={100} cy={40} r={35} part="頭部" />
                <HitArea cx={100} cy={72} r={20} part="頸部" />
                <HitArea cx={100} cy={130} r={50} part="核心軀幹" />
                <HitArea cx={60} cy={95} r={25} part="左肩" />
                <HitArea cx={140} cy={95} r={25} part="右肩" />
                <HitArea cx={75} cy={230} r={30} part="左大腿" />
                <HitArea cx={125} cy={230} r={30} part="右大腿" />
                <HitArea cx={75} cy={300} r={25} part="左膝" />
                <HitArea cx={125} cy={300} r={25} part="右膝" />
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
            placeholder="點擊輸入自定義描述..."
            placeholderTextColor="#94A3B8"
            value={customInjury}
            onChangeText={(text) => { setCustomInjury(text); setInjuryType(null); }}
          />
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, (!selectedPart || (!injuryType && !customInjury)) && styles.disabledButton]} 
          onPress={handleSave}
          activeOpacity={0.9}
        >
          <Text style={styles.saveButtonText}>確認並同步雲端數據</Text>
        </TouchableOpacity>
        
        <Text style={styles.footerNote}>資料將透過加密通訊協議存儲於個人醫療庫</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 20, paddingTop: 40 },
  header: { marginBottom: 25 },
  title: { fontSize: 32, fontWeight: '900', color: '#0F172A', letterSpacing: -0.5 },
  badge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
    alignSelf: 'flex-start',
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 8, 
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 6 },
  badgeText: { fontSize: 10, color: '#64748B', fontWeight: '800', letterSpacing: 1 },
  
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
  },
  shadowProp: {
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  stepCircle: { 
    width: 28, 
    height: 28, 
    borderRadius: 14, 
    backgroundColor: '#0F172A', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 10
  },
  stepText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  cardTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  
  statusLabel: { fontSize: 14, color: '#64748B', marginBottom: 15 },
  selectedText: { color: '#E11D48', fontWeight: '800', fontSize: 16 },
  
  illustrationContainer: { 
    height: 400, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipSelected: { 
    backgroundColor: '#1E293B', 
    borderColor: '#1E293B',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  chipText: { color: '#475569', fontSize: 14, fontWeight: '600' },
  chipTextSelected: { color: '#FFFFFF' },
  
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 20 },
  inputLabel: { fontSize: 14, color: '#64748B', fontWeight: '700', marginBottom: 10 },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: '#0F172A',
  },
  
  saveButton: {
    backgroundColor: '#E11D48',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
    marginTop: 10,
    marginBottom: 10
  },
  disabledButton: { backgroundColor: '#CBD5E1', shadowOpacity: 0 },
  saveButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  
  footerNote: { textAlign: 'center', color: '#94A3B8', fontSize: 12, marginBottom: 40 },
});

export default Disease;