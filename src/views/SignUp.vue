<template>
  <div class="login-container">
    <h2>Sign Up</h2>
    <form @submit.prevent="signup" class="login-form">
      <div class="form-group">
        <label for="user-id">ID:</label>
        <input type="text" id="user-id" v-model="userId" />
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" />
      </div>
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="email" />
      </div>
      <div class="form-group">
        <label for="nickname">Nickname:</label>
        <input type="text" id="nickname" v-model="nickname" />
      </div>
      <button type="submit" class="login-button">Sign Up</button>
    </form>
  </div>
</template>

<script>
import { signup } from '../api';

export default {
  data() {
    return {
      userId: '',
      email: '',
      nickname: '',
      password: '',
      role: ['ROLE_USER'],
      oauthProvider: null,
    };
  },
  methods: {
    async signup() {
      try {
        await signup({ userId: this.userId, email: this.email, nickname: this.nickname,
          password: this.password, role: this.role, oauthProvider: this.oauthProvider });
        this.$router.push('/login');
      } catch (error) {
        console.error(error);
      }
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nanum+Myeongjo&family=Noto+Sans+KR:wght@400;700&display=swap');

.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #222;
  font-family: 'Noto Sans KR', sans-serif;
}

h2 {
  font-family: 'Nanum Myeongjo', serif;
  font-size: 2.5rem;
  color: #fff;
  margin-bottom: 1.5rem;
}

.login-form {
  background: #333;
  padding: 2.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  border: 1px solid #555;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #fff;
  font-weight: bold;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="password"] {
  width: calc(100% - 20px);
  padding: 10px;
  border: 1px solid #555;
  border-radius: 4px;
  background-color: #444;
  color: #fff;
  box-sizing: border-box;
}

.login-button {
  width: 100%;
  padding: 10px;
  background-color: #ff8b80;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1.5rem;
  font-weight: 700;
  transition: background-color 0.3s;
}

.login-button:hover {
  background-color: #e67a70;
}
</style>
