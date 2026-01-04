<template>
  <div>
    <h1>내 설문 관리</h1>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <ul v-else>
      <li v-for="survey in surveys" :key="survey.id">
        {{ survey.title }} - {{ survey.createdAt }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../../api';

const surveys = ref([]);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    const {data} = await api.get('/api/auth/me');
    surveys.value = data.surveys;
  } catch (err) {
    error.value = '설문 목록을 가져오는 데 실패했습니다.';
    console.error(err);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
</style>
