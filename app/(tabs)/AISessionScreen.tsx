import AsyncStorage from '@react-native-async-storage/async-storage';
import * as posedetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

const { width } = Dimensions.get('window');
const STORAGE_KEY = '@health_fatigue_data';

type ExerciseType = '羽球' | '籃球' | '跑步' | '游泳' | '桌球' | '排球' | '長期久坐' | '長期久站' | '搬運重物';

const EXERCISE_IMPACT: Record<ExerciseType, string[]> = {
  '羽球': ['手臂', '小腿', '肩部', '大腿', '腰部'],
  '籃球': ['大腿', '小腿', '腰部', '肩部'],
  '跑步': ['大腿', '小腿', '腰部'],
  '游泳': ['肩部', '手臂', '腰部', '大腿'],
  '桌球': ['手臂', '頸部', '肩部', '大腿'],
  '排球': ['肩部', '大腿', '手臂', '小腿'],
  '長期久坐': ['頸部', '腰部'],
  '長期久站': ['小腿', '腰部', '大腿'],
  '搬運重物': ['腰部', '手臂', '肩部'],
};

interface StretchStep {

  title: string;

  hint: string;

  duration: number;

  imageUrl: string;

}



const ROUTINES: Record<ExerciseType, StretchStep[]> = {

  羽球: [

    { title: '股四頭肌伸展', hint: '單腳站立，手拉同側腳踝往後', duration: 25, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3048/3048344.png' },

    { title: '小腿腓腸肌放鬆', hint: '弓箭步，後腳跟踩死地面', duration: 25, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3048/3048344.png' },

    { title: '肩膀與擊球臂伸展', hint: '一手橫過胸前，另一手扣住拉向身體', duration: 25, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3048/3048381.png' }

  ],

  籃球: [

    { title: '臀部肌肉放鬆', hint: '坐姿，一腳跨過另一腳膝蓋轉向側邊', duration: 30, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3048/3048344.png' },

    { title: '腿部綜合伸展', hint: '手觸腳尖，感受大腿後側拉伸', duration: 25, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3048/3048344.png' },

    { title: '上肢肩膀放鬆', hint: '雙手向後互扣，挺胸向上抬', duration: 25, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3048/3048381.png' }

  ],

  跑步: [

    { title: '大腿後側伸展', hint: '坐姿，一腳伸直，身體前傾摸腳趾', duration: 30, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3048/3048344.png' },

    { title: '小腿深層拉伸', hint: '推牆做弓箭步，拉伸後腿小腿', duration: 30, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3048/3048344.png' }

  ],

  游泳: [

    { title: '肩旋轉肌群', hint: '手扶牆角，身體前傾旋轉肩膀', duration: 25, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3048/3048381.png' },

    { title: '背闊肌拉伸', hint: '雙手抓門框，臀部向後坐，拉長側背', duration: 30, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3048/3048381.png' }

  ],

  桌球: [

    { title: '腕部與手指放鬆', hint: '掌心向前，另一手將指尖向後壓', duration: 20, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3048/3048344.png' },

    { title: '手臂肱二頭肌', hint: '手扶固定物，身體轉向另一側', duration: 20, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3048/3048344.png' }

  ],

  排球: [

    { title: '胸大肌擴張', hint: '雙手後扣挺胸，緩慢抬高', duration: 25, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3048/3048381.png' },

    { title: '擊球手臂伸展', hint: '手臂舉高手肘彎曲，另一手向下壓手肘', duration: 25, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3048/3048381.png' }

  ],

  長期久坐: [{ title: '頸部與腰部', hint: '坐姿體前彎，頭部自然下垂', duration: 30, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3048/3048344.png' }],

  長期久站: [{ title: '足底與小腿', hint: '腳趾勾起，手扳住腳掌前緣', duration: 30, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3048/3048344.png' }],

  搬運重物: [{ title: '貓牛式背部', hint: '四足跪姿，背部交替拱起下沉', duration: 30, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3048/3048344.png' }]

};

export default function AISessionScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [detector, setDetector] = useState<posedetection.PoseDetector | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isPoseCorrect, setIsPoseCorrect] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [selectedMode, setSelectedMode] = useState('一般');
  const [exerciseType, setExerciseType] = useState<ExerciseType>('羽球');
  const [exerciseDuration, setExerciseDuration] = useState('30');

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<any>(null);

  const isOfficeMode = selectedMode === '上班族';
  const availableOptions = isOfficeMode 
    ? (['長期久坐', '長期久站', '搬運重物'] as ExerciseType[])
    : (['羽球', '籃球', '跑步', '游泳', '桌球', '排球'] as ExerciseType[]);

  useEffect(() => { setExerciseType(availableOptions[0]); }, [selectedMode]);

  useEffect(() => {
    async function initTF() {
      await tf.ready();
      const poseDetector = await posedetection.createDetector(posedetection.SupportedModels.MoveNet, {
        modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      });
      setDetector(poseDetector);
    }
    initTF();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const routine = ROUTINES[exerciseType] || ROUTINES['羽球'];
  const step = routine[currentStepIndex];

  // --- 新增：核心同步邏輯，點擊按鈕即觸發 ---
  const syncFatigueData = async () => {
    console.log("--- 立即同步流程開始 ---");
    const impactedAreas = EXERCISE_IMPACT[exerciseType];
    const today = new Date().toLocaleDateString('zh-TW');

    try {
      // 1. 本地讀取
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      let currentScores: Record<string, number> = { "頸部": 0, "肩部": 0, "腰部": 0, "大腿": 0, "小腿": 0, "手臂": 0 };
      
      if (savedData) {
        const parsed = JSON.parse(savedData);
        currentScores = parsed.scores || currentScores;
      }

      // 2. 計算加權
      const fatigueGain = parseInt(exerciseDuration) >= 60 ? 20 : 10;
      impactedAreas.forEach(area => {
        if (currentScores[area] !== undefined) {
          currentScores[area] = Math.min(100, currentScores[area] + fatigueGain);
        }
      });

      const finalData = {
        scores: currentScores,
        lastExercise: exerciseType,
        lastUpdate: today,
        timestamp: new Date().getTime()
      };

      console.log("準備寫入 Firebase:", JSON.stringify(finalData));

      // 3. Firebase 寫入
      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        await setDoc(userRef, { fatigueData: finalData }, { merge: true });
        console.log("✅ Firebase 立即寫入成功！");
      }

      // 4. 本地儲存
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(finalData));
      return finalData;

    } catch (error) {
      console.error("❌ 立即同步失敗:", error);
    }
  };

  const handleStartAI = async () => {
    // 點擊瞬間馬上同步
    await syncFatigueData();
    // 啟動相機介面
    setIsStarted(true);
  };

  const stopSession = (isFinished = false) => {
    console.log("--- 停止會話流程 ---");
    if (timerRef.current) clearInterval(timerRef.current);
    
    if (isFinished && navigation) {
      // 流程結束時僅負責跳轉，因為數據已經在 handleStartAI 寫過了
      navigation.navigate('HealthDataAnalysis', { refresh: Date.now() });
    }
    
    setIsStarted(false);
    setIsPoseCorrect(false);
    setCurrentStepIndex(0);
    setTimer(0);
  };

  const startTimer = () => {
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
      Speech.speak('收操完成', { language: 'zh-TW' });
      stopSession(true); 
    }
  };

  const analyzePose = async () => {
    if (!detector || !cameraRef.current || isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.2, base64: true });
      if (photo?.base64) {
        const rawImageData = tf.util.encodeString(photo.base64, 'base64');
        const imageTensor = decodeJpeg(new Uint8Array(rawImageData));
        const poses = await detector.estimatePoses(imageTensor);
        if (poses && poses.length > 0 && (poses[0].score ?? 0) > 0.2) {
          setIsPoseCorrect(true);
          Speech.speak(`偵測成功，收操開始`, { language: 'zh-TW' });
          startTimer();
        }
        imageTensor.dispose();
      }
    } catch (e) {
      console.error("AI 辨識錯誤:", e);
    } finally { 
      setIsAnalyzing(false); 
    }
  };

  if (!permission?.granted) return (
    <View style={styles.center}>
      <TouchableOpacity onPress={requestPermission} style={styles.mainBtn}>
        <Text style={styles.btnText}>授權相機以啟用 AI 偵測</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {!isStarted ? (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
          <Text style={styles.header}>AI 智慧舒緩助手</Text>
          
          <Text style={styles.sectionTitle}>1. 選擇模式</Text>
          <View style={styles.modeRow}>
            {[{ id: '一般', icon: '🏃‍♂️', color: '#3498DB' }, { id: '高齡', icon: '👴', color: '#E67E22' }, { id: '上班族', icon: '💼', color: '#16A085' }].map(m => (
              <TouchableOpacity key={m.id} onPress={() => setSelectedMode(m.id)} style={[styles.modeCard, selectedMode === m.id && { borderColor: m.color, backgroundColor: m.color + '15' }]}>
                <Text style={styles.modeIcon}>{m.icon}</Text>
                <Text style={[styles.modeLabel, selectedMode === m.id && { color: m.color }]}>{m.id}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.paramCard}>
            <Text style={styles.sectionTitle}>2. {isOfficeMode ? '生活型態' : '先前運動'}</Text>
            <View style={styles.chipGrid}>
              {availableOptions.map(t => (
                <TouchableOpacity key={t} onPress={() => setExerciseType(t)} style={[styles.chip, exerciseType === t && styles.chipActive]}>
                  <Text style={[styles.chipText, exerciseType === t && styles.chipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>3. 方才運動時長 (分鐘)</Text>
            <View style={styles.chipGrid}>
              {['15', '30', '60+'].map(d => (
                <TouchableOpacity key={d} onPress={() => setExerciseDuration(d)} style={[styles.timeChip, exerciseDuration === d && styles.timeChipActive]}>
                  <Text style={[styles.chipText, exerciseDuration === d && styles.chipTextActive]}>{d} 分鐘</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 修改點：改為呼叫 handleStartAI */}
          <TouchableOpacity onPress={handleStartAI} style={styles.startBtn}>
            <Text style={styles.startBtnText}>進入 AI 偵測收操</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="front">
          <View style={styles.cameraOverlay}>
            <View style={styles.hudCard}>
              <Image source={{ uri: step.imageUrl }} style={styles.guideImage} />
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={styles.hudTitle}>{step.title}</Text>
                <Text style={styles.hudHint}>{step.hint}</Text>
              </View>
              <View style={styles.timerCircle}><Text style={styles.hudTimer}>{timer}</Text></View>
            </View>
            
            <View style={styles.bottomControls}>
              {!isPoseCorrect && (
                <TouchableOpacity onPress={analyzePose} style={styles.detectBtn}>
                  <Text style={styles.detectBtnText}>{isAnalyzing ? '姿勢分析中...' : '📸 點擊辨識姿勢並計時'}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => stopSession(false)} style={styles.exitBtn}>
                <Text style={styles.exitBtnText}>結束當前會話</Text>
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      )}
    </View>
  );
}

// ... styles 部分保持不變
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  scroll: { padding: 25, paddingTop: 60 },
  header: { fontSize: 26, fontFamily:'Zen', color: '#2C3E50', marginBottom: 30, textAlign: 'center',marginTop: -40 },
  sectionTitle: { fontSize: 16, fontFamily:'Zen', color: '#7F8C8D', marginBottom: 15 },
  modeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  modeCard: { 
    width: '31%', padding: 15, backgroundColor: '#FFF', borderRadius: 20, 
    alignItems: 'center', borderWidth: 2, borderColor: 'transparent',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5
  },
  modeIcon: { fontSize: 28, marginBottom: 5, fontFamily:'Zen' },
  modeLabel: { fontSize: 14, fontFamily:'Zen', color: '#95A5A6' },
  paramCard: { backgroundColor: '#FFF', borderRadius: 25, padding: 20, elevation: 3 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: '#F1F5F9' },
  chipActive: { backgroundColor: '#34495E' },
  timeChip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 50, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DCDFE6' },
  timeChipActive: { backgroundColor: '#27AE60', borderColor: '#27AE60' },
  chipText: { color: '#7F8C8D', fontFamily:'Zen', fontSize: 13 },
  chipTextActive: { color: '#FFF', fontFamily:'Zen' },
  startBtn: { backgroundColor: '#2C3E50', padding: 20, borderRadius: 20, alignItems: 'center', marginTop: 30, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
  startBtnText: { color: '#FFF', fontSize: 18, fontFamily:'Zen' },
  cameraOverlay: { flex: 1, justifyContent: 'space-between', padding: 20 },
  hudCard: { 
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.95)', 
    padding: 15, borderRadius: 25, alignItems: 'center', marginTop: 40 
  },
  guideImage: { width: 60, height: 60, borderRadius: 10 },
  hudTitle: { fontSize: 18, fontFamily:'Zen' },
  hudHint: { fontSize: 12, color: '#7F8C8D', fontFamily:'Zen' },
  timerCircle: { width: 50, height: 50, borderRadius: 25, borderWidth: 3, borderColor: '#3498DB', justifyContent: 'center', alignItems: 'center' },
  hudTimer: { fontSize: 20, fontFamily:'Zen', color: '#3498DB' },
  bottomControls: { gap: 10 },
  detectBtn: { backgroundColor: '#3498DB', padding: 18, borderRadius: 50, alignItems: 'center', elevation: 5 },
  detectBtnText: { color: '#FFF', fontFamily:'Zen', fontSize: 16 },
  exitBtn: { alignSelf: 'center', padding: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 15 },
  exitBtnText: { color: '#FFF', fontSize: 12, fontFamily:'Zen' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mainBtn: { backgroundColor: '#3498DB', padding: 15, borderRadius: 12 },
  btnText: { color: '#FFF', fontFamily:'Zen' }
});