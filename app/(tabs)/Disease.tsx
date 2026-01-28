import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

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

  // 輔助組件：建立一個「透明且較大」的點擊感應區
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
      style={{ flex: 1 }}
    >
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>醫療安全網</Text>
          <View style={styles.badge}><Text style={styles.badgeText}>精密傷病記錄</Text></View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>1. 定位受傷位置</Text>
          <Text style={styles.statusText}>
            目前選取：<Text style={styles.highlightText}>{selectedPart || '請點擊圖示部位'}</Text>
          </Text>
          
          <View style={styles.illustrationWrapper}>
            {/* 增加 pointerEvents 確保事件正確傳遞 */}
            <Svg height="350" width="220" viewBox="0 0 200 400">
              <G>
                {/* --- 視覺層：繪製人體 --- */}
                <Circle cx="100" cy="40" r="25" fill={selectedPart === '頭部' ? '#FF5252' : '#CBD5E0'} />
                <Rect x="85" y="65" width="30" height="15" fill={selectedPart === '頸部' ? '#FF5252' : '#CBD5E0'} />
                <Path d="M70,85 L130,85 L135,180 L65,180 Z" fill={selectedPart === '核心軀幹' ? '#FF5252' : '#CBD5E0'} />
                <Circle cx="60" cy="95" r="12" fill={selectedPart === '左肩' ? '#FF5252' : '#A0AEC0'} />
                <Circle cx="140" cy="95" r="12" fill={selectedPart === '右肩' ? '#FF5252' : '#A0AEC0'} />
                <Path d="M45,100 L55,180 L35,180 Z" fill={selectedPart === '左臂' ? '#FF5252' : '#CBD5E0'} />
                <Path d="M155,100 L145,180 L165,180 Z" fill={selectedPart === '右臂' ? '#FF5252' : '#CBD5E0'} />
                <Circle cx="45" cy="185" r="8" fill={selectedPart === '左肘' ? '#FF5252' : '#718096'} />
                <Circle cx="155" cy="185" r="8" fill={selectedPart === '右肘' ? '#FF5252' : '#718096'} />
                <Path d="M65,185 L98,185 L98,280 L60,280 Z" fill={selectedPart === '左大腿' ? '#FF5252' : '#CBD5E0'} />
                <Path d="M102,185 L135,185 L140,280 L102,280 Z" fill={selectedPart === '右大腿' ? '#FF5252' : '#CBD5E0'} />
                <Circle cx="78" cy="295" r="10" fill={selectedPart === '左膝' ? '#FF5252' : '#718096'} />
                <Circle cx="122" cy="295" r="10" fill={selectedPart === '右膝' ? '#FF5252' : '#718096'} />
                <Path d="M70,310 L88,310 L85,380 L65,380 Z" fill={selectedPart === '左小腿' ? '#FF5252' : '#CBD5E0'} />
                <Path d="M112,310 L130,310 L135,380 L115,380 Z" fill={selectedPart === '右小腿' ? '#FF5252' : '#CBD5E0'} />

                {/* --- 觸控層：透明且較大的感應區域，放在最上層 --- */}
                <HitArea cx={100} cy={40} r={35} part="頭部" />
                <HitArea cx={100} cy={72} r={20} part="頸部" />
                <HitArea cx={100} cy={130} r={40} part="核心軀幹" />
                <HitArea cx={60} cy={95} r={22} part="左肩" />
                <HitArea cx={140} cy={95} r={22} part="右肩" />
                <HitArea cx={45} cy={140} r={25} part="左臂" />
                <HitArea cx={155} cy={140} r={25} part="右臂" />
                <HitArea cx={45} cy={185} r={20} part="左肘" />
                <HitArea cx={155} cy={185} r={20} part="右肘" />
                <HitArea cx={78} cy={230} r={30} part="左大腿" />
                <HitArea cx={122} cy={230} r={30} part="右大腿" />
                <HitArea cx={78} cy={295} r={25} part="左膝" />
                <HitArea cx={122} cy={295} r={25} part="右膝" />
                <HitArea cx={78} cy={345} r={25} part="左小腿" />
                <HitArea cx={122} cy={345} r={25} part="右小腿" />
              </G>
            </Svg>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>2. 傷病類型標註</Text>
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

          <Text style={styles.inputLabel}>或是自定義描述：</Text>
          <TextInput
            style={styles.input}
            placeholder="例如：稍微紅腫、早起僵硬..."
            value={customInjury}
            onChangeText={(text) => { setCustomInjury(text); setInjuryType(null); }}
          />
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, (!selectedPart || (!injuryType && !customInjury)) && styles.disabledButton]} 
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>確認並存入檔案</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  contentContainer: { padding: 20 },
  header: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#1E293B', letterSpacing: 1 },
  badge: { backgroundColor: '#E2E8F0', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 5 },
  badgeText: { fontSize: 12, color: '#64748B', fontWeight: 'bold' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#334155', marginBottom: 15 },
  statusText: { fontSize: 14, color: '#94A3B8', marginBottom: 10 },
  highlightText: { color: '#FF5252', fontWeight: 'bold' },
  illustrationWrapper: { 
    height: 380, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 15,
  },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipSelected: { backgroundColor: '#334155', borderColor: '#334155' },
  chipText: { color: '#64748B', fontSize: 14 },
  chipTextSelected: { color: '#FFFFFF', fontWeight: '600' },
  inputLabel: { fontSize: 14, color: '#64748B', marginBottom: 8, marginTop: 5 },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1E293B',
  },
  saveButton: {
    backgroundColor: '#FF5252',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#FF5252',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 30
  },
  disabledButton: { backgroundColor: '#CBD5E0', shadowOpacity: 0 },
  saveButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});

export default Disease;