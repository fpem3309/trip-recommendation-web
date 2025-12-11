<template>
  <div>
    <div class="header">
      <h2>질문 관리</h2>
      <button class="add-btn">새 질문 추가</button>
    </div>
    <p>이곳에서 설문조사 질문을 추가, 수정, 삭제할 수 있습니다.</p>

    <div class="question-list">
      <table>
        <thead>
          <tr>
            <th>질문</th>
            <th>옵션</th>
            <th>유형</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="question in questions" :key="question.id">
            <td>{{ question.question }}</td>
            <td>
              <div v-for="option in question.options" :key="option">{{ option.label }}</div>
            </td>
            <td class="actions">
              <button class="edit-btn">수정</button>
              <button class="delete-btn">삭제</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue';
import api from '../../../api';

const questions = ref([]);

onBeforeMount(async () => {
  try {
    const { data } = await api.get('/api/admin/questions');
    questions.value = data;
  } catch (error) {
    console.error('Error fetching admin data:', error);
  }
});
</script>

<style scoped>
div {
  color: black;
}

h2 {
  font-size: 1.8rem;
  color: #2c3e50;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

p {
  margin-bottom: 20px;
  color: #555;
}

.add-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.add-btn:hover {
  background-color: #2980b9;
}

.question-list table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.question-list th,
.question-list td {
  padding: 12px 15px;
  border-bottom: 1px solid #ddd;
}

.question-list thead {
  background-color: #f4f7f6;
  color: #333;
}

.question-list th {
  font-weight: 600;
}

.question-list tbody tr:hover {
  background-color: #f9f9f9;
}

.actions button {
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  margin-right: 5px;
  transition: background-color 0.3s;
}

.edit-btn {
  background-color: #f39c12;
  color: white;
}

.edit-btn:hover {
  background-color: #e67e22;
}

.delete-btn {
  background-color: #e74c3c;
  color: white;
}

.delete-btn:hover {
  background-color: #c0392b;
}
</style>
