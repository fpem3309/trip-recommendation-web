<template>
  <div>
    <!-- Add/Edit Modal -->
    <div v-if="isModalOpen" class="modal-overlay">
      <div class="modal-content">
        <h2>{{ modalMode === 'edit' ? '질문 수정' : '질문 추가' }}</h2>
        <form @submit.prevent="saveQuestion" v-if="selectedQuestion">
          <input type="hidden" name="order" id="order" v-model="selectedQuestion.order">
          <div class="form-group">
            <label for="question-text">질문:</label>
            <input type="text" id="question-text" v-model="selectedQuestion.question">
          </div>

          <div class="form-group">
            <label>옵션:</label>
            <div v-for="(option, index) in selectedQuestion.options" :key="index" class="option-input">
              <input type="text" v-model="option.label" placeholder="라벨">
              <input type="text" v-model="option.value" placeholder="값">
              <button type="button" @click="removeOption(index)" class="remove-option-btn">-</button>
            </div>
            <button type="button" @click="addOption" class="add-option-btn">옵션 추가</button>
          </div>

          <div class="modal-actions">
            <button type="submit" class="save-btn">저장</button>
            <button type="button" @click="closeModal" class="cancel-btn">취소</button>
          </div>
        </form>
      </div>
    </div>

    <div class="header">
      <h2>질문 관리</h2>
      <button @click="openAddModal" class="add-btn">질문 추가</button>
    </div>
    <p>이곳에서 설문조사 질문을 추가, 수정, 삭제할 수 있습니다.</p>

    <div class="question-list">
      <table>
        <thead>
          <tr>
            <th>순서</th>
            <th>질문</th>
            <th>옵션</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="question in questions" :key="question.id">
            <td>{{ question.order }}</td>
            <td>{{ question.question }}</td>
            <td>
              <div v-for="option in question.options" :key="option.value">{{ option.label }}</div>
            </td>
            <td class="actions">
              <button @click="openEditModal(question)" class="edit-btn">수정</button>
              <button @click="deleteQuestion(question.id)" class="delete-btn">삭제</button>
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
const isModalOpen = ref(false);
const modalMode = ref('add'); // 'add' or 'edit'
const selectedQuestion = ref(null);

onBeforeMount(async () => {
  try {
    const { data } = await api.get('/api/questions');
    questions.value = data;
  } catch (error) {
    console.error('Error fetching questions:', error);
  }
});

const openAddModal = () => {
  modalMode.value = 'add';
  selectedQuestion.value = {
    question: '',
    options: [{ label: '', value: '' }],
    order: questions.value.length + 1
  };
  isModalOpen.value = true;
};

const openEditModal = (question) => {
  modalMode.value = 'edit';
  selectedQuestion.value = JSON.parse(JSON.stringify(question)); // Deep copy
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedQuestion.value = null;
};

const addOption = () => {
  if (selectedQuestion.value) {
    selectedQuestion.value.options.push({ label: '', value: '' });
  }
};

const removeOption = (index) => {
  if (selectedQuestion.value) {
    selectedQuestion.value.options.splice(index, 1);
  }
};

const saveQuestion = async () => {
  if (!selectedQuestion.value) return;
  selectedQuestion.value.options = selectedQuestion.value.options.filter(
    opt => opt.label.trim() !== '' && opt.value.trim() !== ''
  );
  try {
    if (modalMode.value === 'edit') {
      // UPDATE
      await api.put(`/api/questions/${selectedQuestion.value.id}`, selectedQuestion.value);
      const index = questions.value.findIndex(q => q.id === selectedQuestion.value.id);
      if (index !== -1) questions.value[index] = selectedQuestion.value;
    } else {
      // INSERT
      await api.post('/api/questions', selectedQuestion.value);
      questions.value.push(selectedQuestion.value);
    }
  } catch (error) {
    console.error('Error saving question:', error);
    // Optionally, show an error message to the user
  } finally {
    closeModal();
  }
};


const deleteQuestion = (id) => {
  let confirmed = confirm('정말로 이 질문을 삭제하시겠습니까?');
  if (confirmed) {
    api.delete(`/api/questions/${id}`)
      .then(() => {
        questions.value = questions.value.filter(q => q.id !== id);
      })
      .catch(error => {
        console.error('Error deleting question:', error);
      });
  }
};
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  width: 500px;
  max-width: 90%;
}

.modal-content h2 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 1.5rem;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.form-group input[type="text"],
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

.option-input {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  gap: 10px;
}

.option-input input {
  flex: 1;
}

.remove-option-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  line-height: 1;
  padding: 0;
}

.add-option-btn {
  background-color: #2ecc71;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-top: 10px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
}

.modal-actions button {
  padding: 10px 20px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.3s;
}

.save-btn {
  background-color: #3498db;
  color: white;
}

.save-btn:hover {
  background-color: #2980b9;
}

.cancel-btn {
  background-color: #f1f1f1;
  color: #333;
  border: 1px solid #ccc;
}

.cancel-btn:hover {
  background-color: #e5e5e5;
}
</style>
