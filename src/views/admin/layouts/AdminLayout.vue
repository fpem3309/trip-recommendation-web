<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <h1 class="admin-title">관리자</h1>
      <nav class="menu">
        <ul>
          <li>
            <router-link to="/admin/questions">질문 관리</router-link>
            <router-link to="/admin/prompts">프롬프트 관리</router-link>
            <router-link to="/admin/users">회원 관리</router-link>
          </li>
        </ul>
      </nav>
    </aside>
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f4f7f6;
}

.sidebar {
  width: 240px;
  background-color: #2c3e50;
  color: #ecf0f1;
  padding: 20px;
  flex-shrink: 0;
}

.admin-title {
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
}

.menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu li a {
  display: block;
  padding: 12px 15px;
  color: #ecf0f1;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.menu li a:hover,
.menu li a.router-link-exact-active {
  background-color: #34495e;
  color: #ffffff;
}

.content {
  flex-grow: 1;
  padding: 30px;
  background-color: #ffffff;
}
</style>
