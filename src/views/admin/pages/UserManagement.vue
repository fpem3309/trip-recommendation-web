<template>
  <div>
    <h2>회원 관리</h2>
    <p>이곳에서 회원 정보를 추가, 수정, 삭제할 수 있습니다.</p>
  </div>
</template>

<script setup>
import { onBeforeMount } from 'vue';
import api from '../../../api';

onBeforeMount(async () => {
  try {
    const { data } = await api.get('/api/admin/users');
    console.log('Admin data:', data);
  } catch (error) {
    console.error('Error fetching admin data:', error);
  }
});
</script>

<style scoped>
h2 {
  font-size: 2rem;
  margin-bottom: 20px;
  color: #2c3e50;
}
</style>
