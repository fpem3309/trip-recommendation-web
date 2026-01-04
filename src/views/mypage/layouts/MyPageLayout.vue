<template>
  <div class="mypage-layout">
    <aside class="sidebar">
      <h1 class="mypage-title">마이페이지</h1>
      <nav class="menu">
        <ul>
          <li>
            <router-link to="/mypage/surveys">내 설문 관리</router-link>
          </li>
          <!-- 다른 메뉴 항목들을 여기에 추가할 수 있습니다. -->
        </ul>
      </nav>
    </aside>
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.mypage-layout {
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

.mypage-title {
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
