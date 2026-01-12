<template>
  <div class="survey-container">
    <h1 class="main-title">여행 스타일 테스트</h1>

    <!-- Loading Overlay -->
    <div v-if="isSubmitting" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>결과를 처리 중입니다. 잠시만 기다려주세요...</p>
    </div>

    <!-- Progress Bar -->
    <div class="progress-bar-container">
      <div class="progress-bar" :style="{ width: progress + '%' }"></div>
      <span class="progress-text">{{ Math.round(progress) }}%</span>
    </div>

    <!-- Question -->
    <div class="question-container" v-if="!surveyCompleted">
      <h3 class="question-title">{{ questions[currentQuestionIndex]?.question }}</h3>
      <div class="options-container">
        <label v-for="(option, index) in questions[currentQuestionIndex]?.options" :key="index" class="option"
          :class="{ selected: answers[currentQuestionIndex] === option.value }">
          <input type="radio" :name="'question-' + currentQuestionIndex" :value="option.value"
            v-model="answers[currentQuestionIndex]" class="hidden-radio" />
          <span>{{ option.label }}</span>
        </label>
      </div>
    </div>

    <!-- Result -->
    <div v-if="surveyCompleted && result" class="result-display">
      <div class="result-header">
        <h2>{{ result.city }}, {{ result.country }}로 떠나는 당신을 위한 추천!</h2>
        <p class="recommendation-text">"{{ result.recommendation }}"</p>
      </div>

      <div class="result-details">
        <div class="detail-item">
          <span class="detail-label">여행 기간</span>
          <span class="detail-value">{{ result.period }}박{{ parseInt(result.period) + 1 }}일</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">추천 시기</span>
          <span class="detail-value">{{ result.bestSeason }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">예상 경비</span>
          <span class="detail-value">{{ Math.floor(result.estimatedBudget).toLocaleString() }}원</span>
        </div>
      </div>

      <div class="itinerary-section">
        <h3>상세 일정</h3>
        <div class="itinerary-map">
          <div class="map-slider">
            <button @click="prevMap" :disabled="currentMapDayIndex === 0" class="slider-nav prev">&lt;</button>
            <div class="map-container">
              <iframe
                v-if="mapUrls[currentMapDayIndex]"
                :key="currentMapDayIndex"
                width="100%"
                height="500"
                style="border:0"
                loading="lazy"
                allowfullscreen
                referrerpolicy="no-referrer-when-downgrade"
                :src="mapUrls[currentMapDayIndex]">
              </iframe>
              <div v-else class="no-map-data">
                지도 데이터가 없습니다.
              </div>
              <div class="map-day-indicator">
                {{ currentMapDayIndex + 1 }}일차
              </div>
            </div>
            <button @click="nextMap" :disabled="currentMapDayIndex >= mapUrls.length - 1" class="slider-nav next">&gt;</button>
          </div>
        </div>
        <ul class="itinerary-list">
          <li v-for="item in result.itinerary" :key="item.dayNumber" class="itinerary-item">
            <div class="day-number">Day {{ item.dayNumber }}</div>
            <div class="day-plan">{{ item.plan }}</div>
          </li>
        </ul>
      </div>
    </div>
    <div v-else-if="surveyCompleted" class="result-container">
      <h4>제출 완료!</h4>
      <p>결과를 받아오는 중입니다...</p>
    </div>

    <!-- Navigation -->
    <div class="navigation-buttons">
      <template v-if="!surveyCompleted">
        <button @click="prevQuestion" :disabled="currentQuestionIndex === 0">
          이전
        </button>
        <button @click="nextQuestion" v-if="currentQuestionIndex < questions.length - 1" :disabled="!isAnswered">
          다음
        </button>
        <button @click="submitsurvey" v-if="currentQuestionIndex === questions.length - 1"
          :disabled="!isAnswered || isSubmitting">
          제출
        </button>
      </template>
      <template v-else>
        <button @click="retrySurvey">
          다시하기
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeMount, } from 'vue';
import api from '../api';
import Swal from 'sweetalert2';
import { generateMapUrls } from '../map';

const questions = ref([]);
const currentQuestionIndex = ref(0);
const answers = ref([]);
const surveyCompleted = ref(false);
const result = ref(null);
const isSubmitting = ref(false);
const currentMapDayIndex = ref(0);
const mapUrls = ref([]);

onBeforeMount(async () => {
  try {
    const { data } = await api.get('/api/questions');
    questions.value = data;
    answers.value = Array(data.length).fill(null);
  } catch (error) {
    console.log('Error:', error);
    Swal.fire({
      icon: 'error',
      title: '질문을 받아오지 못했습니다.',
      text: error.response.data.message
    });
  }
});

const progress = computed(() => {
  if (questions.value.length === 0) {
    return 0;
  }
  if (surveyCompleted.value) {
    return 100;
  }
  const answeredQuestions = answers.value.slice(0, currentQuestionIndex.value).filter(a => a !== null).length;
  const totalProgress = (answeredQuestions / questions.value.length) * 100;

  if (isAnswered.value) {
    return ((currentQuestionIndex.value + 1) / questions.value.length) * 100;
  }

  return (currentQuestionIndex.value / questions.value.length) * 100;
});

const isAnswered = computed(() => {
  return answers.value[currentQuestionIndex.value] !== null;
});

function nextQuestion() {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++;
  }
}

function prevQuestion() {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
  }
}

async function submitsurvey() {
  if (!isAnswered.value) {
    alert('현재 문제에 답변해주세요.');
    return;
  }

  isSubmitting.value = true;

  const payload = {
    surveyAnswers: questions.value.map((question, index) => ({
      questionId: question.questionId,
      answer: question.question + ": " + answers.value[index]
    }))
  };

  try {
    const response = await api.post('/api/survey', payload);
    result.value = response.data;
    mapUrls.value = generateMapUrls(result.value.googleMapPlaces, result.value);
  } catch (error) {
    console.log('Error submitting survey:', error);
    Swal.fire({
      icon: 'error',
      title: '제출 실패',
      text: error.response.data.message
    });
  } finally {
    surveyCompleted.value = true;
    isSubmitting.value = false;
  }
}

const nextMap = () => {
  if (currentMapDayIndex.value < mapUrls.value.length - 1) {
    currentMapDayIndex.value++;
  }
};

const prevMap = () => {
  if (currentMapDayIndex.value > 0) {
    currentMapDayIndex.value--;
  }
};

function retrySurvey() {
  currentQuestionIndex.value = 0;
  answers.value.fill(null);
  surveyCompleted.value = false;
  result.value = null;
  isSubmitting.value = false;
  currentMapDayIndex.value = 0;
  mapUrls.value = [];
}

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nanum+Myeongjo&family=Noto+Sans+KR:wght@400;700&display=swap');

.survey-container {
  background-color: #222;
  color: #fff;
  max-width: 980px;
  min-height: 100vh;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: 'Noto Sans KR', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.main-title {
  font-family: 'Nanum Myeongjo', serif;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 30px;
  text-align: center;
}

.progress-bar-container {
  width: 100%;
  max-width: 400px;
  background-color: #444;
  border-radius: 10px;
  margin: 20px 0;
  position: relative;
  height: 12px;
}

.progress-bar {
  height: 100%;
  background-color: #ff8b80;
  border-radius: 10px;
  transition: width 0.5s ease-in-out;
}

.progress-text {
  position: absolute;
  top: -25px;
  right: 0;
  color: #ff8b80;
  font-weight: bold;
  font-size: 1rem;
}

.question-container {
  width: 100%;
  max-width: 500px;
  text-align: center;
  margin-bottom: 30px;
}

.question-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 40px;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.option {
  background-color: #333;
  padding: 20px;
  border: 1px solid #555;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s, border-color 0.3s;
  text-align: center;
  font-size: 1.1rem;
}

.option:hover {
  background-color: #444;
}

.option.selected {
  background-color: #ff8b80;
  border-color: #ff8b80;
  color: #fff;
}

.hidden-radio {
  display: none;
}

.navigation-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.navigation-buttons button {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  background-color: #ff8b80;
  color: white;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 700;
  transition: background-color 0.3s;
}

.navigation-buttons button:disabled {
  background-color: #555;
  cursor: not-allowed;
}

.navigation-buttons button:hover:not(:disabled) {
  background-color: #e67a70;
}

.result-container {
  text-align: center;
  padding: 40px 20px;
}

.result-container h4 {
  font-size: 2rem;
  color: #ff8b80;
}

pre {
  display: none;
  /* 결과가 오면 새 UI로 보여주므로 기존 pre는 숨김 */
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ff8b80;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.result-display {
  width: 100%;
  max-width: 800px;
  margin-top: 40px;
  background-color: #333;
  border-radius: 12px;
  padding: 30px;
  border: 1px solid #555;
}

.result-header h2 {
  font-family: 'Nanum Myeongjo', serif;
  font-size: 2.2rem;
  color: #ff8b80;
  text-align: center;
  margin-bottom: 15px;
}

.recommendation-text {
  font-size: 1.2rem;
  color: #eee;
  text-align: center;
  margin-bottom: 30px;
  font-style: italic;
}

.result-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #2a2a2a;
  border-radius: 8px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  background-color: #383838;
  border-radius: 8px;
}

.detail-label {
  font-size: 0.9rem;
  color: #aaa;
  margin-bottom: 8px;
  font-weight: bold;
}

.detail-value {
  font-size: 1.1rem;
  color: #fff;
  font-weight: bold;
}

.itinerary-section h3 {
  font-size: 1.8rem;
  color: #ff8b80;
  margin-bottom: 20px;
  text-align: center;
  border-bottom: 2px solid #555;
  padding-bottom: 10px;
}

.itinerary-list {
  list-style: none;
  padding: 0;
}

.itinerary-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 15px;
  background-color: #2a2a2a;
  border-radius: 8px;
  border-left: 5px solid #ff8b80;
  transition: background-color 0.3s;
}

.itinerary-item:hover {
  background-color: #3a3a3a;
}

.day-number {
  font-size: 1.2rem;
  font-weight: bold;
  color: #ff8b80;
  margin-right: 20px;
  flex-shrink: 0;
}

.day-plan {
  font-size: 1rem;
  color: #ddd;
}

.map-slider {
  position: relative;
}

.map-container {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}

.slider-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 20px;
  line-height: 1;
}

.slider-nav:disabled {
  background-color: rgba(0, 0, 0, 0.2);
  cursor: not-allowed;
}

.slider-nav.prev {
  left: 10px;
}

.slider-nav.next {
  right: 10px;
}

.no-map-data {
  width: 100%;
  height: 450px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #2a2a2a;
  color: #aaa;
  font-size: 1.2rem;
}

.map-day-indicator {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: bold;
}
</style>
