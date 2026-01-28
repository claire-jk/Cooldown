import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 重要：確保包含 RN 初始化
import '@tensorflow/tfjs-react-native';

// TensorFlow 與 Pose Detection
import * as posedetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';

// 圖標
import { Activity, Briefcase, Play, ShieldCheck, User } from 'lucide-react-native';

const { width } = Dimensions.get('window');

/* ---------- 專業收操動作資料庫 (新增圖片欄位) ---------- */
type ExerciseType = '羽球' | '籃球' | '跑步' | '游泳' | '桌球' | '排球';

interface StretchStep {
  title: string;
  hint: string;
  duration: number;
  imageUrl: string; // ✅ 新增圖片路徑
}

const EXERCISE_ROUTINES: Record<ExerciseType, StretchStep[]> = {
  羽球: [
    { title: '股四頭肌伸展', hint: '單腳站立，手拉同側腳踝', duration: 25, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3048/3048344.png' },
    { title: '膕繩肌伸展', hint: '臀部向後推，放鬆大腿後側', duration: 25, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3048/3048398.png' },
    { title: '小腿腓腸肌伸展', hint: '雙手扶牆，一腳向後踩平', duration: 25, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3048/3048370.png' },
    { title: '肩膀與背部放鬆', hint: '一隻手橫過胸前，另一手扣住', duration: 20, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3048/3048381.png' }
  ],
  籃球: [{ title: '臀部肌肉放鬆', hint: '坐姿，一腳跨過另一腳膝蓋轉向', duration: 30, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3048/3048344.png' }, { title: '股四頭肌伸展', hint: '單腳站立，手拉同側腳踝', duration: 30, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3048/3048344.png' }, { title: '核心與背部延展', hint: '雙手向上伸直，向左右側彎', duration: 25, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3048/3048344.png' }],
  跑步: [{ title: '小腿深層伸展', hint: '腳跟下沉延展小腿腓腸肌', duration: 30, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3048/3048344.png' }, { title: '大腿後側膕繩肌', hint: '一腳前伸腳尖勾起，身體前傾', duration: 30, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3048/3048344.png' }, { title: '臀大肌伸展', hint: '仰臥抱膝至胸前維持', duration: 30, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3048/3048344.png' }],
  游泳: [{ title: '肩旋轉肌群', hint: '牆角前傾或雙手後扣伸展肩膀', duration: 25, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3048/3048344.png' }, { title: '背闊肌伸展', hint: '單手向上抓柱子，身體向側推', duration: 25, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3048/3048344.png' }, { title: '肱三頭肌伸展', hint: '一手扶肘部，手掌摸向背後', duration: 20, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3048/3048344.png' }],
  桌球: [{ title: '腕部與手指放鬆', hint: '掌心向前，另一手將指尖向後拉', duration: 20, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3048/3048344.png' }, { title: '肩膀旋轉放鬆', hint: '緩慢旋轉肩關節，放鬆揮拍手', duration: 20, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3048/3048344.png' }, { title: '下肢穩定肌伸展', hint: '側壓腿，伸展大腿內側', duration: 20, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3048/3048344.png' }],
  排球: [{ title: '胸大肌擴張', hint: '雙手後扣挺胸，緩慢抬高', duration: 25, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3048/3048344.png' }, { title: '擊球手臂伸展', hint: '手臂伸直壓牆旋轉身體', duration: 25, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3048/3048344.png' }, { title: '小腿爆發肌伸展', hint: '弓箭步維持，腳跟踩實', duration: 25, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3048/3048344.png' }],
};

export default function AISessionScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const [detector, setDetector] = useState<posedetection.PoseDetector | null>(null);
  const [isModelReady, setIsModelReady] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isPoseCorrect, setIsPoseCorrect] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [selectedMode, setSelectedMode] = useState('一般');
  const [exerciseType, setExerciseType] = useState<ExerciseType>('羽球');
  const [intensity, setIntensity] = useState('中');
  const [duration, setDuration] = useState('1h');

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timer, setTimer] = useState(0);

  const timerRef = useRef<any>(null);
  const routine = EXERCISE_ROUTINES[exerciseType];
  const step = routine[currentStepIndex];

  useEffect(() => {
    async function initTF() {
      try {
        await tf.ready();
        await tf.setBackend('rn-webgl');
        const model = posedetection.SupportedModels.MoveNet;
        const detectorConfig = {
          modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          enableSmoothing: true,
        };
        const poseDetector = await posedetection.createDetector(model, detectorConfig);
        setDetector(poseDetector);
        setIsModelReady(true);
      } catch (error) {
        console.error("TF 初始化失敗:", error);
      }
    }
    initTF();
    return () => clearInterval(timerRef.current);
  }, []);

  const analyzePose = async () => {
    if (!detector || !cameraRef.current || isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      // 確保 UI 有機會更新轉圈圈狀態
      await tf.nextFrame(); 

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.2, // 降低畫質加速處理
        base64: true,
        skipProcessing: true,
      });

      if (photo?.base64) {
        const rawImageData = tf.util.encodeString(photo.base64, 'base64');
        const uint8Array = new Uint8Array(rawImageData);
        const imageTensor = decodeJpeg(uint8Array); // ✅ 移除 expandDims

        // 進行預測
        const poses = await detector.estimatePoses(imageTensor);

        if (poses && poses.length > 0) {
          const score = poses[0].score ?? 0;
          if (score > 0.2) {
            setIsPoseCorrect(true);
            Speech.speak(`偵測成功，開始${step.title}`, { language: 'zh-TW' });
            startTimer();
          } else {
            Speech.speak('請退後，確保全身入鏡', { language: 'zh-TW' });
          }
        }
        imageTensor.dispose(); 
      }
    } catch (e) {
      console.log("偵測發生錯誤:", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimer(step.duration);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          nextStep();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const nextStep = () => {
    if (currentStepIndex < routine.length - 1) {
      setCurrentStepIndex(i => i + 1);
      setIsPoseCorrect(false);
    } else {
      Speech.speak('收操圓滿結束', { language: 'zh-TW' });
      stopSession();
    }
  };

  const stopSession = () => {
    clearInterval(timerRef.current);
    setIsStarted(false);
    setIsPoseCorrect(false);
    setCurrentStepIndex(0);
  };

  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <TouchableOpacity onPress={requestPermission} style={styles.mainBtn}>
          <Text style={styles.btnText}>授權相機</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!isStarted ? (
        <ScrollView style={styles.scroll}>
          <Text style={styles.sectionTitle}>1. 選擇模式</Text>
          <View style={styles.modeRow}>
            {[
              { id: '一般', icon: <User size={24} color={selectedMode === '一般' ? '#FFF' : '#94A3B8'} /> },
              { id: '高齡', icon: <ShieldCheck size={24} color={selectedMode === '高齡' ? '#FFF' : '#94A3B8'} /> },
              { id: '上班族', icon: <Briefcase size={24} color={selectedMode === '上班族' ? '#FFF' : '#94A3B8'} /> }
            ].map(m => (
              <TouchableOpacity key={m.id} onPress={() => setSelectedMode(m.id)} style={[styles.modeCard, selectedMode === m.id && styles.modeCardActive]}>
                <View style={[styles.iconCircle, selectedMode === m.id && styles.iconCircleActive]}>{m.icon}</View>
                <Text style={[styles.modeLabel, selectedMode === m.id && styles.modeLabelActive]}>{m.id}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.paramCard}>
            <Text style={styles.sectionTitle}>2. 運動參數</Text>
            <View style={styles.paramItem}>
              <View style={styles.labelRow}><Activity size={18} color="#64748B" /><Text style={styles.paramLabel}>運動項目</Text></View>
              <View style={styles.chipGrid}>
                {Object.keys(EXERCISE_ROUTINES).map(t => (
                  <TouchableOpacity key={t} onPress={() => setExerciseType(t as any)} style={[styles.chip, exerciseType === t && styles.chipActive]}>
                    <Text style={[styles.chipText, exerciseType === t && styles.chipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.paramItem}>
              <Text style={styles.paramLabel}>先前強度</Text>
              <View style={styles.chipGrid}>
                {['弱', '中', '強'].map(v => (
                  <TouchableOpacity key={v} onPress={() => setIntensity(v)} style={[styles.chip, intensity === v && styles.chipActive]}>
                    <Text style={[styles.chipText, intensity === v && styles.chipTextActive]}>{v}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.paramItem}>
              <Text style={styles.paramLabel}>運動時長: {duration}</Text>
              <View style={styles.chipGrid}>
                {['0.5h', '1h', '2h', '3h'].map(v => (
                  <TouchableOpacity key={v} onPress={() => setDuration(v)} style={[styles.chip, duration === v && styles.chipActive]}>
                    <Text style={[styles.chipText, duration === v && styles.chipTextActive]}>{v}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <TouchableOpacity onPress={() => setIsStarted(true)} style={styles.startBtn}>
            <Play color="#FFF" fill="#FFF" size={20} />
            <Text style={styles.startBtnText}>開始訓練</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="front">
          <View style={styles.cameraOverlay}>
             <View style={styles.hudCard}>
                {/* ✅ 新增：動作指引小圖區塊 */}
                <View style={styles.instructionRow}>
                  <Image source={{ uri: step.imageUrl }} style={styles.guideImage} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.hudTitle}>{step.title}</Text>
                    <Text style={styles.hudHint}>{step.hint}</Text>
                  </View>
                </View>

                <View style={styles.timerCircle}>
                   <Text style={styles.hudTimer}>{timer > 0 ? timer : "--"}</Text>
                </View>
              </View>

              {!isPoseCorrect && (
                <TouchableOpacity onPress={analyzePose} style={styles.detectBtn} disabled={isAnalyzing}>
                  {isAnalyzing ? <ActivityIndicator color="#FFF" /> : <Text style={styles.detectBtnText}>辨識姿勢</Text>}
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={stopSession} style={styles.exitBtn}><Text style={styles.exitBtnText}>結束</Text></TouchableOpacity>
          </View>
        </CameraView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { padding: 20, paddingTop: 50 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#64748B', marginBottom: 15 },
  modeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  modeCard: { width: '30%', padding: 15, backgroundColor: '#FFF', borderRadius: 20, alignItems: 'center', borderWidth: 2, borderColor: '#E2E8F0' },
  modeCardActive: { borderColor: '#3498DB', backgroundColor: '#F0F9FF' },
  iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  iconCircleActive: { backgroundColor: '#3498DB' },
  modeLabel: { fontSize: 14, color: '#94A3B8', fontWeight: '600' },
  modeLabelActive: { color: '#3498DB' },
  paramCard: { backgroundColor: '#FFF', borderRadius: 30, padding: 25, elevation: 5 },
  paramItem: { marginBottom: 20 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  paramLabel: { fontSize: 15, color: '#64748B', fontWeight: '600' },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12, backgroundColor: '#F1F5F9' },
  chipActive: { backgroundColor: '#3498DB' },
  chipText: { color: '#94A3B8', fontWeight: '600' },
  chipTextActive: { color: '#FFF' },
  startBtn: { backgroundColor: '#0F172A', padding: 20, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 20, marginBottom: 50 },
  startBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  
  // HUD 樣式修正
  cameraOverlay: { flex: 1, justifyContent: 'space-between', padding: 20, backgroundColor: 'rgba(0,0,0,0.1)' },
  hudCard: { backgroundColor: 'rgba(255,255,255,0.95)', padding: 15, borderRadius: 25, alignItems: 'center' },
  instructionRow: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 10 },
  guideImage: { width: 70, height: 70, borderRadius: 12, backgroundColor: '#E2E8F0' },
  hudTitle: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  hudHint: { fontSize: 13, color: '#64748B' },
  timerCircle: { width: 70, height: 70, borderRadius: 35, borderWidth: 4, borderColor: '#3498DB', justifyContent: 'center', alignItems: 'center' },
  hudTimer: { fontSize: 28, fontWeight: 'bold', color: '#3498DB' },
  
  detectBtn: { backgroundColor: '#3498DB', padding: 18, borderRadius: 50, alignItems: 'center' },
  detectBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
  exitBtn: { alignSelf: 'center', padding: 10, marginBottom: 10 },
  exitBtnText: { color: '#FFF', fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mainBtn: { backgroundColor: '#3498DB', padding: 15, borderRadius: 10 },
  btnText: { color: '#FFF', fontWeight: 'bold' }
});