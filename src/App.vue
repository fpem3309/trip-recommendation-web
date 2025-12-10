<template>
  <header>
    <nav>
      <div class="nav-left">
        <router-link to="/" class="home-link">Trip Recommendation</router-link>
      </div>
      <div class="nav-right">
        <span v-if="!isLoggedIn">
          <router-link to="/login">Login</router-link>
          <router-link to="/signup">Sign Up</router-link>
        </span>
        <span v-else>
          <button @click="logout">Logout</button>
          <button @click="mypage">mypage</button>
          <router-link id="btn-admin" v-if="getUserRole() === 'ROLE_ADMIN'" to="/admin">admin</router-link>
        </span>
      </div>
    </nav>
  </header>
  <main>
    <router-view />
  </main>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { jwtDecode } from "jwt-decode";
import api from './api';

const isLoggedIn = ref(false);
const router = useRouter();

const logout = () => {
  localStorage.removeItem('token');
  isLoggedIn.value = false;
  router.push('/login');
};

const updateLoginStatus = () => {
  isLoggedIn.value = !!localStorage.getItem('token');
};

const mypage = async () => {
  try {
    const response = await api.get('/api/auth/me');
    console.log(response);
  } catch (error) {
    console.log('Error:', error);
  }
};

const getUserRole = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const decoded = jwtDecode(token);
  return decoded.role;
}


onMounted(() => {
  updateLoginStatus();
  window.addEventListener('login-success', updateLoginStatus);
});

onBeforeUnmount(() => {
  window.removeEventListener('login-success', updateLoginStatus);
});
</script>

<style scoped>
header {
  background-color: #333;
  padding: 1rem;
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.nav-left .home-link {
  color: white;
  text-decoration: none;
  font-weight: bold;
  font-size: 1.2rem;
}

.nav-right a {
  color: white;
  text-decoration: none;
  margin-left: 1rem;
}

.nav-right button, #btn-admin {
  background-color: #ff8b80;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 1rem;
}
</style>