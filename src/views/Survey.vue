<template>
  <header>
    <router-link to="/login">
      <button>Login</button>
    </router-link>
    <router-link to="/signup">
      <button>Sign Up</button>
    </router-link>
    <button @click="mypage">mypage</button>
  </header>
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
        <label
          v-for="(option, index) in questions[currentQuestionIndex]?.options"
          :key="index"
          class="option"
          :class="{ selected: answers[currentQuestionIndex] === option.value }"
        >
          <input
            type="radio"
            :name="'question-' + currentQuestionIndex"
            :value="option.value"
            v-model="answers[currentQuestionIndex]"
            class="hidden-radio"
          />
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
      <button @click="prevQuestion" :disabled="currentQuestionIndex === 0 || surveyCompleted">
        이전
      </button>
      <button @click="nextQuestion" v-if="currentQuestionIndex < questions.length - 1" :disabled="!isAnswered">
        다음
      </button>
      <button @click="submitsurvey" v-if="currentQuestionIndex === questions.length - 1 && !surveyCompleted" :disabled="!isAnswered || isSubmitting">
        제출
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeMount, } from 'vue';
import api from '../api';

const questions = ref([]);
const currentQuestionIndex = ref(0);
const answers = ref([]);
const surveyCompleted = ref(false);
const result = ref(null);
const isSubmitting = ref(false);

onBeforeMount(async () => {
    try {
        const {data} = await api.get('/api/questions');
        questions.value = data;
        answers.value = Array(data.length).fill(null);
      } catch (error) {
        console.log('Error:', error);
        alert('API 전송에 실패했습니다. 콘솔을 확인하세요.');
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
  if(!isAnswered.value) {
    alert('현재 문제에 답변해주세요.');
    return;
  }

  isSubmitting.value = true;

  const payload = {
    tripType: answers.value[0],
    period: answers.value[1],
    peopleCount: answers.value[2],
    budget: answers.value[3],
    preferenceType: answers.value[4],
    tripStyle: answers.value[5],
    transportation: answers.value[6],
    foodImportance: answers.value[7],
    accommodation: answers.value[8],
    companion: answers.value[9],
  };

  try {
    const response = await api.post('/api/survey', payload);
    console.log(response);
    result.value = response.data;
    // alert('성공적으로 제출되었습니다!'); // 결과 표시 후 alert 제거
  } catch (error) {
    console.log('Error submitting survey:', error);
    alert('API 전송에 실패했습니다. 콘솔을 확인하세요.');
  } finally {
    surveyCompleted.value = true;
    isSubmitting.value = false;
  }
}

function mypage() {
  try {
    const response = api.get('/api/auth/me');
    console.log(response);
  } catch (error) {
    console.log('Error:', error);
  }
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
  display: none; /* 결과가 오면 새 UI로 보여주므로 기존 pre는 숨김 */
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

header {
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
  gap: 1rem;
}

header button {
  padding: 10px 20px;
  background-color: #ff8b80;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 700;
  transition: background-color 0.3s;
}

header button:hover {
  background-color: #e67a70;
}
</style>
