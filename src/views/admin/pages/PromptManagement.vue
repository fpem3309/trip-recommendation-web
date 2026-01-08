<template>
  <div>
    <!-- Add/Edit Modal -->
    <div v-if="isModalOpen" class="modal-overlay">
      <div class="modal-content">
        <h2>{{ modalMode === 'edit' ? '프롬프트 수정' : '프롬프트 추가' }}</h2>
        <form @submit.prevent="savePrompt" v-if="selectedPrompt">
          <div class="form-group">
            <label for="prompt-role">역할:</label>
            <input type="text" id="prompt-role" v-model="selectedPrompt.role" />
          </div>
          <div class="form-group">
            <label for="prompt-text">프롬프트:</label>
            <textarea id="prompt-text" v-model="selectedPrompt.content" rows="5"></textarea>
          </div>
          <div class="form-group">
            <input type="radio" id="prompt-active" v-model="selectedPrompt.isActive"
              :checked="selectedPrompt.isActive" />
            <label for="prompt-active">활성화 여부</label>
          </div>

          <div class="modal-actions">
            <button type="submit" class="save-btn">저장</button>
            <button type="button" @click="closeModal" class="cancel-btn">취소</button>
          </div>
        </form>
      </div>
    </div>

    <div class="header">
      <h2>프롬프트 관리</h2>
      <button @click="openAddModal" class="add-btn">프롬프트 추가</button>
    </div>
    <p>이곳에서 프롬프트를 추가, 수정, 삭제할 수 있습니다.</p>

    <div class="prompt-list">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>역할</th>
            <th>프롬프트</th>
            <th>활성화 여부</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="prompt in prompts" :key="prompt.id">
            <td>{{ truncateText(prompt.id, 5) }}</td>
            <td>{{ prompt.role }}</td>
            <td>{{ truncateText(prompt.content, 100) }}</td>
            <td><input type="radio" :checked="prompt.isActive" disabled /></td>
            <td class="actions">
              <button @click="openEditModal(prompt)" class="edit-btn">수정</button>
              <button @click="deletePrompt(prompt.id)" class="delete-btn">삭제</button>
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

const prompts = ref([]);
const isModalOpen = ref(false);
const modalMode = ref('add'); // 'add' or 'edit'
const selectedPrompt = ref(null);
const adminPromptApi = '/api/admin/prompt';

onBeforeMount(async () => {
  try {
    const { data } = await api.get(adminPromptApi);
    prompts.value = data;
  } catch (error) {
    console.error('Error fetching prompts:', error);
  }
});

const truncateText = (text, maxLength) => {
  if (text && text.length > maxLength) {
    return text.substring(0, maxLength) + '...';
  }
  return text;
};

const openAddModal = () => {
  modalMode.value = 'add';
  selectedPrompt.value = {
    role: 'system',
    content: '',
    isActive: 0,
  };
  isModalOpen.value = true;
};

const openEditModal = (prompt) => {
  modalMode.value = 'edit';
  selectedPrompt.value = JSON.parse(JSON.stringify(prompt)); // Deep copy
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedPrompt.value = null;
};

const savePrompt = async () => {
  if (!selectedPrompt.value) return;

  try {
    convertIsActiveToInteger();
    if (modalMode.value === 'edit') {
      await api.patch(`${adminPromptApi}/${selectedPrompt.value.id}`, selectedPrompt.value);
      const index = prompts.value.findIndex(p => p.id === selectedPrompt.value.id);
      if (index !== -1) prompts.value[index] = selectedPrompt.value;
    } else {
      await api.post(adminPromptApi, selectedPrompt.value);
    }
  } catch (error) {
    console.error('Error saving prompt:', error);
  } finally {
    closeModal();
    window.location.reload();
  }
};

const deletePrompt = (id) => {
  let confirmed = confirm('정말로 이 프롬프트를 삭제하시겠습니까?');
  if (confirmed) {
    api.delete(`${adminPromptApi}/${id}`)
      .then(() => {
        prompts.value = prompts.value.filter(p => p.id !== id);
      })
      .catch(error => {
        console.error('Error deleting prompt:', error);
      });
  }
};

const convertIsActiveToInteger = () => {
  if (selectedPrompt.value.isActive == 'on') {
    selectedPrompt.value.isActive = 1;
  } else {
    selectedPrompt.value.isActive = 0;
  }
}
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

.prompt-list table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.prompt-list th,
.prompt-list td {
  padding: 12px 15px;
  border-bottom: 1px solid #ddd;
  vertical-align: middle;
}

.prompt-list thead {
  background-color: #f4f7f6;
  color: #333;
}

.prompt-list th {
  font-weight: 600;
}

.prompt-list tbody tr:hover {
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
  width: 700px;
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

.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
  resize: vertical;
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
