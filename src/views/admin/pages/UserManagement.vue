<template>
  <div>
    <!-- Edit Modal -->
    <div v-if="isModalOpen" class="modal-overlay">
      <div class="modal-content">
        <h2>회원 정보 수정</h2>
        <form @submit.prevent="saveUser" v-if="selectedUser">
          <div class="form-group">
            <label for="user-email">이메일:</label>
            <input type="email" id="user-email" v-model="selectedUser.email">
          </div>
          <div class="form-group">
            <label for="user-nickname">닉네임:</label>
            <input type="text" id="user-nickname" v-model="selectedUser.nickname">
          </div>
          <div class="form-group">
            <label for="user-role">역할:</label>
            <input type="text" id="user-role" v-model="selectedUser.role">
          </div>
          <div class="modal-actions">
            <button type="submit" class="save-btn">저장</button>
            <button type="button" @click="closeModal" class="cancel-btn">취소</button>
          </div>
        </form>
      </div>
    </div>

    <div class="header">
      <h2>회원 관리</h2>
    </div>
    <p>이곳에서 회원의 정보를 관리하고 역할을 변경할 수 있습니다.</p>

    <div class="user-list">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>이메일</th>
            <th>닉네임</th>
            <th>역할</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.userId }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.nickname }}</td>
            <td>
              <div v-for="role in user.role" :key="role">{{ role }}</div>
            </td>
            <td class="actions">
              <button @click="openEditModal(user)" class="edit-btn">수정</button>
              <button @click="deleteUser(user.userId)" class="delete-btn">삭제</button>
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

const users = ref([]);
const isModalOpen = ref(false);
const selectedUser = ref(null);
const adminUserApi = '/api/admin/users';

onBeforeMount(async () => {
  try {
    const { data } = await api.get(`${adminUserApi}`);
    users.value = data.content;
  } catch (error) {
    console.error('Error fetching admin data:', error);
  }
});

const openEditModal = (user) => {
  selectedUser.value = JSON.parse(JSON.stringify(user)); // Deep copy
  selectedUser.value.role = selectedUser.value.role.join(',');
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedUser.value = null;
};

const saveUser = async () => {
  if (!selectedUser.value) return;

  const roles = selectedUser.value.role.split(',').map(r => r.trim()).filter(r => r);

  const userToUpdate = {
    userId: selectedUser.value.userId,
    email: selectedUser.value.email,
    nickname: selectedUser.value.nickname,
    role: roles,
  };

  try {
    await api.put(`${adminUserApi}`, userToUpdate);
    const index = users.value.findIndex(u => u.userId === selectedUser.value.userId);
    if (index !== -1) {
      const { data } = await api.get(`${adminUserApi}`);
      users.value = data.content;
    }
  } catch (error) {
    console.error('Error saving user:', error);
  } finally {
    closeModal();
  }
};

const deleteUser = (userId) => {
  let confirmed = confirm('정말로 이 회원을 삭제하시겠습니까?');
  if (confirmed) {
    api.delete(`${adminUserApi}/${userId}`)
      .then(() => {
        users.value = users.value.filter(u => u.userId !== userId);
      })
      .catch(error => {
        console.error('Error deleting user:', error);
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

.user-list table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.user-list th,
.user-list td {
  padding: 12px 15px;
  border-bottom: 1px solid #ddd;
}

.user-list thead {
  background-color: #f4f7f6;
  color: #333;
}

.user-list th {
  font-weight: 600;
}

.user-list tbody tr:hover {
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
.form-group input[type="email"],
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
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
