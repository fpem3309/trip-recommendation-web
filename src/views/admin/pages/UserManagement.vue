<template>
  <div>
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

const users = ref([]);

onBeforeMount(async () => {
  try {
    const { data } = await api.get('/api/admin/users');
    users.value = data.content;
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
</style>
