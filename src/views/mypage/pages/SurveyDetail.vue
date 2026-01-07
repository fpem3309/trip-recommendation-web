<template>
  <div class="survey-detail-container">
    <div v-if="loading" class="loading">Loading survey...</div>
    <div v-if="error" class="error">{{ error }}</div>
    
    <div v-if="recommendation" class="survey-card">
      <header class="survey-header">
        <h1>{{ recommendation.city }}, {{ recommendation.country }}</h1>
        <p class="survey-meta">"{{ recommendation.recommendation }}"</p>
      </header>

      <section class="survey-body">
        <div class="result-details">
          <div class="detail-item">
            <span class="detail-label">여행 기간</span>
            <span class="detail-value">{{ recommendation.period }}박{{ parseInt(recommendation.period) + 1 }}일</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">추천 시기</span>
            <span class="detail-value">{{ recommendation.bestSeason }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">예상 경비</span>
            <span class="detail-value">{{ Math.floor(recommendation.estimatedBudget).toLocaleString() }}원</span>
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
            <li v-for="(item, index) in itinerary" :key="item.dayNumber" class="itinerary-item">
              <div class="day-number">Day {{ index + 1 }}</div>
              <div class="day-plan">{{ item.plan }}</div>
            </li>
          </ul>
        </div>

        <div class="itinerary-section">
          <div class="answers-header" @click="toggleAnswers">
            <h3>{{ isAnswersVisible ? '답변 숨기기' : '내 답변보기' }}</h3>
            <span class="chevron" :class="{ rotated: isAnswersVisible }">▼</span>
          </div>
           <ul v-if="isAnswersVisible" class="itinerary-list">
            <li v-for="(answer, index) in answers" :key="answer.questionId" class="itinerary-item">
              <div class="day-number">Answer {{ index + 1 }}</div>
              <div class="day-plan">{{ answer.answer }}</div>
            </li>
          </ul>
        </div>
      </section>

      <footer class="survey-footer">
        <button @click="goBack" class="back-button">Back to List</button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../../../api';
import { generateMapUrls } from '../../../map';

const route = useRoute();
const router = useRouter();

const recommendation = ref(null);
const answers = ref([]);
const itinerary = ref([]);
const loading = ref(true);
const error = ref(null);
const mapUrls = ref([]);
const currentMapDayIndex = ref(0);
const googleMapPlaces = ref([]);
const isAnswersVisible = ref(false);

const toggleAnswers = () => {
  isAnswersVisible.value = !isAnswersVisible.value;
};

onMounted(async () => {
  try {
    const surveyId = route.params.id;
    const { data } = await api.get(`/api/auth/survey/${surveyId}`);
    recommendation.value = data.recommendation;
    answers.value = data.surveyAnswerList;
    itinerary.value = data.itineraryDtoList;
    googleMapPlaces.value = data.placeDtoList.map(day => ({
      places: day.places
    }));
    mapUrls.value = generateMapUrls(googleMapPlaces.value, recommendation.value);
  } catch (err) {
    error.value = err.message || 'Failed to load the survey.';
  } finally {
    loading.value = false;
  }
});

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

const goBack = () => {
  router.push('/mypage/surveys');
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nanum+Myeongjo&family=Noto+Sans+KR:wght@400;700&display=swap');

.survey-detail-container {
  padding: 2rem;
  background-color: #f4f7f9;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  font-family: 'Noto Sans KR', sans-serif;
}

.survey-card {
  width: 100%;
  max-width: 800px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.survey-header {
  padding: 1.5rem 2rem;
  text-align: center;
  border-bottom: 1px solid #e9ecef;
}

h1 {
  font-family: 'Nanum Myeongjo', serif;
  font-size: 2.2rem;
  color: #4f46e5;
  margin-bottom: 10px;
}

.survey-meta {
  font-size: 1.2rem;
  color: #555;
  font-style: italic;
}

.survey-body {
  padding: 2rem;
}

.result-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2.5rem;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
}

.detail-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 8px;
  font-weight: bold;
}

.detail-value {
  font-size: 1.1rem;
  color: #333;
  font-weight: bold;
}

.itinerary-section {
  margin-top: 2rem;
}

.itinerary-section h3 {
  font-size: 1.8rem;
  color: #4f46e5;
  margin: 0;
}

.answers-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.chevron {
  transition: transform 0.3s ease;
}

.chevron.rotated {
  transform: rotate(180deg);
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
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 5px solid #4f46e5;
  transition: background-color 0.3s;
}

.itinerary-item:hover {
  background-color: #f1f3f5;
}

.day-number {
  font-size: 1.2rem;
  font-weight: bold;
  color: #4f46e5;
  margin-right: 20px;
  flex-shrink: 0;
}

.day-plan {
  font-size: 1rem;
  color: #333;
}

.map-slider {
  position: relative;
  margin-bottom: 1.5rem;
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
  background-color: #e9ecef;
  color: #6c757d;
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

.survey-footer {
  padding: 2rem 0 1rem 0;
  background-color: transparent;
  text-align: center;
}

.back-button {
  background-color: #4f46e5;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.back-button:hover {
  background-color: #4338ca;
}

.loading,
.error {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: #555;
}
</style>