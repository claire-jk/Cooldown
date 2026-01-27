import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { Activity, Briefcase, Camera, CheckCircle2, ChevronRight, Clock, Flame, Info, Play, RotateCcw, ShieldCheck, UserCheck } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

type Mode = 'General' | 'Elderly' | 'Office';
type Intensity = '弱' | '中' | '強';
type ExerciseType = '羽球' | '籃球' | '排球' | '桌球' | '跑步' | '游泳';

// 定義單個動作格式
interface StretchStep {
  title: string;
  hint: string;
  img: string;
  duration: number;
}

// 擴充動作庫：每個運動現在是一組動作陣列
const EXERCISE_ROUTINES: Record<ExerciseType, StretchStep[]> = {
  '羽球': [
    { title: '肩袖肌群交叉牽拉', hint: '一手橫跨胸前，另一手勾住肘部向內緩慢加壓', img: 'https://cdn-icons-png.flaticon.com/512/3048/3048344.png', duration: 15 },
    { title: '前臂旋後肌放鬆', hint: '手掌向上伸直，另一手將手指輕輕向下扳，放鬆揮拍肌肉', img: 'https://cdn-icons-png.flaticon.com/512/3048/3048366.png', duration: 15 }
  ],
  '籃球': [
    { title: '比目魚肌靜態伸展', hint: '前弓後箭步，後腳跟踩平地面，緩解跳躍後的壓力', img: 'https://cdn-icons-png.flaticon.com/512/3048/3048374.png', duration: 20 },
    { title: '股四頭肌平衡伸展', hint: '單腳站立，手拉同側腳踝向臀部靠近，保持膝蓋併攏', img: 'https://cdn-icons-png.flaticon.com/512/3048/3048398.png', duration: 15 }
  ],
  '跑步': [
    { title: '膕繩肌與下背放鬆', hint: '單腳勾腳尖，臀部向後推，雙手緩慢向腳尖延伸', img: 'https://cdn-icons-png.flaticon.com/512/3048/3048398.png', duration: 20 },
    { title: '腓腸肌牆面牽拉', hint: '雙手扶牆，一腳向後踩實地面，感受小腿後側延展', img: 'https://cdn-icons-png.flaticon.com/512/3048/3048374.png', duration: 20 }
  ],
  '游泳': [
    { title: '胸大肌與肩前側擴張', hint: '雙手於背後交扣，肩胛骨向內收攏並挺胸', img: 'https://cdn-icons-png.flaticon.com/512/3048/3048383.png', duration: 15 },
    { title: '三頭肌過頂伸展', hint: '一手舉起彎曲至腦後，另一手輕壓肘部向下，放鬆划水肌肉', img: 'https://cdn-icons-png.flaticon.com/512/3048/3048344.png', duration: 15 }
  ],
  '桌球': [
    { title: '前臂伸腕肌群舒緩', hint: '手臂伸直掌心向下，另一手向內扳，預防持拍手勞損', img: 'https://cdn-icons-png.flaticon.com/512/3048/3048366.png', duration: 15 },
    { title: '腕關節旋轉放鬆', hint: '雙手十指交扣，輕鬆旋轉腕部，消除小肌肉緊張', img: 'https://cdn-icons-png.flaticon.com/512/3048/3048357.png', duration: 10 }
  ],
  '排球': [
    { title: '三角肌與肩鎖繞環', hint: '雙手輕搭肩膀，由內向外緩慢畫大圓', img: 'https://cdn-icons-png.flaticon.com/512/3048/3048357.png', duration: 20 },
    { title: '側腹斜肌延展', hint: '一隻手舉過頭向側邊傾斜，感受側腹與肩胛延展', img: 'https://cdn-icons-png.flaticon.com/512/3048/3048383.png', duration: 15 }
  ],
};

export default function AISessionScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isStarted, setIsStarted] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [isGuiding, setIsGuiding] = useState(false); 
  
  const [selectedMode, setSelectedMode] = useState<Mode>('General');
  const [exerciseType, setExerciseType] = useState<ExerciseType>('羽球');
  const [intensity, setIntensity] = useState<Intensity>('中');
  const [duration, setDuration] = useState(1);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isPoseCorrect, setIsPoseCorrect] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false); // 模擬影像辨識運算中
  const timerRef = useRef<any>(null);

  const activeRoutine = EXERCISE_ROUTINES[exerciseType];
  const currentStep = activeRoutine[currentStepIndex];

  const modeSettings = {
    General: { title: '一般', desc: '全方位伸展', icon: <UserCheck size={20} color="#FFF" />, color: '#3498DB' },
    Elderly: { title: '高齡', desc: '穩定性優化', icon: <ShieldCheck size={20} color="#FFF" />, color: '#2ECC71' },
    Office: { title: '上班族', desc: '肩頸舒壓', icon: <Briefcase size={20} color="#FFF" />, color: '#F1C40F' },
  };

  const clearActiveTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearActiveTimer();
  }, []);

  const handleGenerateClick = () => {
    setShowPrescriptionModal(true);
  };

  const startSession = () => {
    setShowPrescriptionModal(false);
    setIsStarted(true);
    setIsGuiding(true); 
    setCurrentStepIndex(0);
  };

  const startTimer = () => {
    clearActiveTimer();
    setTimer(currentStep.duration);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearActiveTimer();
          handleNextStep();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleNextStep = () => {
    if (currentStepIndex < activeRoutine.length - 1) {
      Speech.speak(`完成，下一個動作：${activeRoutine[currentStepIndex + 1].title}`, { language: 'zh-TW' });
      setCurrentStepIndex(prev => prev + 1);
      setIsPoseCorrect(false);
    } else {
      Speech.speak("完成整組收操，身體恢復良好", { language: 'zh-TW' });
      stopSession();
    }
  };

  // 核心邏輯：模擬影像辨識與姿勢校準
  const handlePoseTrigger = () => {
    if (!isPoseCorrect && !isGuiding && !isAnalyzing) {
      setIsAnalyzing(true);
      // 模擬 AI 辨識延遲：偵測人體關鍵點中...
      setTimeout(() => {
        setIsAnalyzing(false);
        setIsPoseCorrect(true);
        Speech.speak(`偵測成功，請維持姿勢`, { language: 'zh-TW' });
        startTimer();
      }, 2500); 
    }
  };

  const stopSession = () => {
    clearActiveTimer();
    setIsStarted(false);
    setIsPoseCorrect(false);
    setIsGuiding(false);
    setIsAnalyzing(false);
    setCurrentStepIndex(0);
    setTimer(0);
  };

  if (!permission?.granted) {
    return (
      <View style={styles.centerContainer}>
        <LinearGradient colors={['#F8FAFC', '#E2E8F0']} style={StyleSheet.absoluteFill} />
        <View style={styles.iconCircleBig}>
          <Camera size={48} color="#3498DB" />
        </View>
        <Text style={styles.permissionTitle}>開啟 AI 導引功能</Text>
        <Text style={styles.permissionText}>
          我們需要相機權限來偵測您的肢體動作，{"\n"}以提供精準的收操導引與即時回饋。
        </Text>
        <TouchableOpacity style={[styles.mainStartBtn, { width: '80%' }]} onPress={requestPermission}>
          <Text style={styles.startBtnText}>授權相機權限</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!isStarted ? (
        <ScrollView contentContainerStyle={styles.configContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.headerTitle}>客製化收操處方</Text>
          
          <Text style={styles.sectionTitle}>1. 選擇模式</Text>
          <View style={styles.modeRow}>
            {(Object.keys(modeSettings) as Mode[]).map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.modeCard, selectedMode === m && { borderColor: modeSettings[m].color, backgroundColor: modeSettings[m].color + '10' }]}
                onPress={() => setSelectedMode(m)}
              >
                <LinearGradient
                  colors={selectedMode === m ? [modeSettings[m].color, modeSettings[m].color + 'CC'] : ['#BDC3C7', '#95A5A6']}
                  style={styles.iconCircle}
                >
                  {modeSettings[m].icon}
                </LinearGradient>
                <Text style={[styles.modeTitle, selectedMode === m && { color: modeSettings[m].color, fontWeight: '700' }]}>
                  {modeSettings[m].title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>2. 運動參數</Text>
          <View style={styles.glassCard}>
            <ParamSection icon={<Activity size={16} color="#64748B"/>} label="運動項目">
              <View style={styles.chipRow}>
                {Object.keys(EXERCISE_ROUTINES).map((type) => (
                  <Chip key={type} label={type} active={exerciseType === type} onPress={() => setExerciseType(type as any)} />
                ))}
              </View>
            </ParamSection>

            <ParamSection icon={<Flame size={16} color="#64748B"/>} label="先前強度">
              <View style={styles.chipRow}>
                {['弱', '中', '強'].map((lvl) => (
                  <Chip key={lvl} label={lvl} active={intensity === lvl} onPress={() => setIntensity(lvl as any)} />
                ))}
              </View>
            </ParamSection>

            <ParamSection icon={<Clock size={16} color="#64748B"/>} label={`運動時長: ${duration}h`}>
              <View style={styles.chipRow}>
                {[0.5, 1, 2, 3].map((h) => (
                  <Chip key={h} label={`${h}h`} active={duration === h} onPress={() => setDuration(h)} />
                ))}
              </View>
            </ParamSection>
          </View>

          <TouchableOpacity onPress={handleGenerateClick}>
            <LinearGradient colors={['#3498DB', '#2980B9']} style={styles.mainStartBtn}>
              <Play color="#FFF" fill="#FFF" size={20} />
              <Text style={styles.startBtnText}>分析並生成 AI 處方</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View style={styles.cameraFullContainer}>
          <CameraView style={styles.camera} facing="front">
            <View style={styles.overlay}>
              {/* 右上角參考圖 */}
              <View style={styles.miniGuideBox}>
                <Image 
                  source={{ uri: currentStep.img }} 
                  style={styles.miniImg} 
                  resizeMode="contain"
                />
                <Text style={styles.miniText}>標準範例</Text>
              </View>

              <View style={styles.topHud}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>動作 {currentStepIndex + 1} / {activeRoutine.length}</Text>
                </View>
                <BlurBadge label={currentStep.title} />
                <Text style={styles.timerLarge}>{timer > 0 ? `${timer}s` : (isAnalyzing ? '辨識中...' : '待偵測')}</Text>
              </View>

              <TouchableOpacity style={styles.detectionBox} onPress={handlePoseTrigger} disabled={isGuiding || isAnalyzing}>
                {!isPoseCorrect && !isGuiding && (
                  <View style={styles.aiHintBox}>
                    {isAnalyzing ? (
                      <ActivityIndicator size="large" color="#3498DB" style={{marginBottom: 10}} />
                    ) : (
                      <Activity size={32} color="#3498DB" style={{marginBottom: 10}} />
                    )}
                    <Text style={styles.hintText}>{isAnalyzing ? '正在計算關節角度...' : '正在校準肢體骨架...'}</Text>
                    <Text style={styles.hintSubText}>請模仿右上角圖示並維持不動</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.stopBtn} onPress={stopSession}>
                <RotateCcw color="#FFF" size={18} />
                <Text style={styles.stopBtnText}>重新設定</Text>
              </TouchableOpacity>
            </View>

            {isGuiding && (
              <View style={styles.guideContainer}>
                <LinearGradient colors={['rgba(15,23,42,0.98)', 'rgba(30,41,59,0.95)']} style={StyleSheet.absoluteFill} />
                <View style={styles.guideContent}>
                  <Text style={styles.guideTitle}>{currentStep.title}</Text>
                  <View style={styles.guideImageShadow}>
                    <Image 
                      source={{ uri: currentStep.img }} 
                      style={styles.guideImage} 
                      resizeMode="contain" 
                    />
                  </View>
                  <View style={styles.guideHintBox}>
                    <Info size={24} color="#3498DB" />
                    <Text style={styles.guideHintText}>{currentStep.hint}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.guideConfirmBtn} 
                    onPress={() => {
                      setIsGuiding(false);
                      Speech.speak("請就位，系統正在尋找您的骨架", { language: 'zh-TW' });
                    }}
                  >
                    <Text style={styles.guideConfirmText}>準備好了，開始偵測</Text>
                    <ChevronRight size={20} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </CameraView>
        </View>
      )}

      <Modal transparent visible={showPrescriptionModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <CheckCircle2 size={50} color="#2ECC71" />
            <Text style={styles.modalTitle}>AI 處方已生成</Text>
            <View style={styles.prescriptionDetail}>
              <DetailRow label="針對運動" value={exerciseType} />
              <DetailRow label="包含動作" value={`${activeRoutine.length} 組部位伸展`} />
              <DetailRow label="AI 功能" value="即時骨架比對已開啟" />
            </View>
            <TouchableOpacity style={styles.modalConfirmBtn} onPress={startSession}>
              <Text style={styles.modalConfirmText}>查看醫學圖解</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowPrescriptionModal(false)}>
              <Text style={styles.modalCancelText}>返回修改</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// 輔助組件保持不變
const Chip = ({ label, active, onPress }: any) => (
  <TouchableOpacity onPress={onPress} style={[styles.chip, active && styles.activeChip]}>
    <Text style={[styles.chipText, active && styles.activeChipText]}>{label}</Text>
  </TouchableOpacity>
);

const ParamSection = ({ icon, label, children }: any) => (
  <View style={styles.paramSection}>
    <View style={styles.labelRow}>{icon}<Text style={styles.subLabel}>{label}</Text></View>
    {children}
  </View>
);

const DetailRow = ({ label, value }: any) => (
  <View style={styles.detailRow}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>
);

const BlurBadge = ({ label }: any) => (
  <View style={styles.blurBadge}><Text style={styles.blurBadgeText}>{label}</Text></View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  iconCircleBig: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginBottom: 20, elevation: 5 },
  permissionTitle: { fontSize: 22, color: '#1E293B', marginBottom: 10, fontWeight: 'bold' },
  permissionText: { fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  headerTitle: { fontSize: 24, color: '#1E293B', marginBottom: 25, textAlign: 'center', fontWeight: 'bold' },
  configContainer: { padding: 25 },
  sectionTitle: { fontSize: 16, color: '#475569', marginBottom: 15, fontWeight: '600' },
  modeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  modeCard: { width: '31%', backgroundColor: '#FFF', padding: 15, borderRadius: 20, alignItems: 'center', borderWidth: 2, borderColor: '#F1F5F9' },
  iconCircle: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  modeTitle: { fontSize: 13, color: '#94A3B8' },
  glassCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, elevation: 5, marginBottom: 30 },
  paramSection: { marginBottom: 15 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  subLabel: { fontSize: 14, color: '#64748B' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: '#F1F5F9' },
  activeChip: { backgroundColor: '#3498DB' },
  chipText: { fontSize: 13, color: '#64748B' },
  activeChipText: { color: '#FFF' },
  mainStartBtn: { flexDirection: 'row', padding: 18, borderRadius: 20, justifyContent: 'center', alignItems: 'center', gap: 12, elevation: 8, backgroundColor: '#3498DB' },
  startBtnText: { color: '#FFF', fontSize: 17, fontWeight: 'bold' },

  cameraFullContainer: { flex: 1 },
  camera: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.2)', padding: 30, justifyContent: 'space-between' },
  topHud: { alignItems: 'center', marginTop: 30 },
  stepBadge: { backgroundColor: '#3498DB', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 8 },
  stepBadgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  blurBadge: { backgroundColor: 'rgba(255, 255, 255, 0.9)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12 },
  blurBadgeText: { color: '#1E293B', fontSize: 14, fontWeight: '700' },
  timerLarge: { color: '#FFF', fontSize: 80, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.3)', textShadowRadius: 10 },
  detectionBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  aiHintBox: { backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: 25, borderRadius: 24, alignItems: 'center', width: '85%', elevation: 10 },
  hintText: { color: '#1E293B', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  hintSubText: { color: '#64748B', fontSize: 14, marginTop: 8, textAlign: 'center' },
  stopBtn: { flexDirection: 'row', alignSelf: 'center', backgroundColor: '#EF4444', paddingHorizontal: 25, paddingVertical: 12, borderRadius: 50, gap: 8, marginBottom: 20 },
  stopBtnText: { color: '#FFF', fontWeight: 'bold' },

  guideContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', padding: 25 },
  guideContent: { alignItems: 'center', width: '100%' },
  guideTitle: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginBottom: 25, textAlign: 'center' },
  guideImageShadow: { backgroundColor: '#FFF', borderRadius: 30, padding: 20, marginBottom: 30, elevation: 15 },
  guideImage: { width: 220, height: 220 },
  guideHintBox: { flexDirection: 'row', backgroundColor: 'rgba(52, 152, 219, 0.25)', padding: 20, borderRadius: 20, alignItems: 'center', gap: 15, marginBottom: 40, width: '100%' },
  guideHintText: { color: '#FFF', fontSize: 16, flex: 1, lineHeight: 24, fontWeight: '500' },
  guideConfirmBtn: { backgroundColor: '#3498DB', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 40, paddingVertical: 20, borderRadius: 50, gap: 10, elevation: 10 },
  guideConfirmText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  
  miniGuideBox: { position: 'absolute', top: 50, right: 20, width: 100, height: 130, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: 10, alignItems: 'center', borderWidth: 2, borderColor: '#3498DB', elevation: 5 },
  miniImg: { width: '100%', height: '80%' },
  miniText: { fontSize: 11, color: '#3498DB', fontWeight: 'bold', marginTop: 4 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.88, backgroundColor: '#FFF', borderRadius: 32, padding: 30, alignItems: 'center' },
  modalTitle: { fontSize: 24, color: '#1E293B', marginTop: 15, marginBottom: 20, fontWeight: 'bold' },
  prescriptionDetail: { width: '100%', backgroundColor: '#F8FAFC', borderRadius: 24, padding: 20, marginBottom: 25, borderWidth: 1, borderColor: '#E2E8F0' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  detailLabel: { color: '#64748B', fontSize: 15 },
  detailValue: { color: '#1E293B', fontSize: 15, fontWeight: '700' },
  modalConfirmBtn: { width: '100%', backgroundColor: '#3498DB', padding: 18, borderRadius: 18, alignItems: 'center', marginBottom: 15 },
  modalConfirmText: { color: '#FFF', fontSize: 17, fontWeight: 'bold' },
  modalCancelText: { color: '#94A3B8', fontSize: 14 },
});