<template>
  <div class="my-survey-container">
    <h1>내 설문 관리</h1>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="survey-list">
      <div v-for="survey in surveys" :key="survey.id" class="survey-card" @click="goToDetail(survey.surveyId)">
        <div class="survey-header">
          <h3>{{ survey.city }}, {{ survey.country }}</h3>
        </div>
        <div class="survey-body">
          <p><strong>예산:</strong> {{ survey.estimatedBudget }}</p>
          <p><strong>기간:</strong> {{ survey.period }}박 {{ parseInt(survey.period) + 1 }}일</p>
          <p><strong>교통수단:</strong> {{ survey.transportation }}</p>
          <p><strong>추천:</strong> {{ survey.recommendation }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../../api';

const surveys = ref([]);
const loading = ref(true);
const error = ref(null);
const router = useRouter();

onMounted(async () => {
  try {
    const { data } = await api.get('/api/auth/survey');
    surveys.value = data;
  } catch (err) {
    error.value = '설문 목록을 가져오는 데 실패했습니다.';
    console.error(err);
  } finally {
    loading.value = false;
  }
});

const goToDetail = (id) => {
  if (id) {
    router.push(`/mypage/surveys/${id}`);
  } else {
    // Mock data doesn't have a real ID, so we use a placeholder for navigation
    // In a real scenario, every survey item should have a unique ID.
    router.push(`/mypage/surveys/test-id`);
  }
};
</script>

<style scoped>
.my-survey-container {
  padding: 2rem;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: #333;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
}

.loading,
.error {
  text-align: center;
  font-size: 1.2rem;
  color: #666;
}

.error {
  color: #e74c3c;
}

.survey-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.survey-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  overflow: hidden;
  cursor: pointer;
}

.survey-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

.survey-header {
  background-color: #3498db;
  color: #fff;
  padding: 1rem 1.5rem;
}

.survey-header h3 {
  margin: 0;
  font-size: 1.5rem;
}

.survey-body {
  padding: 1.5rem;
}

.survey-body p {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  line-height: 1.5;
}

.survey-body p:last-child {
  margin-bottom: 0;
}

.survey-body strong {
  font-weight: 600;
  color: #555;
  margin-right: 0.5rem;
}
</style>
