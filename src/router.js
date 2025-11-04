import { createRouter, createWebHistory } from 'vue-router';
import Survey from './components/Survey.vue';
import Login from './components/Login.vue';

const routes = [
  {
    path: '/',
    name: 'Survey',
    component: Survey,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
