import { createRouter, createWebHistory } from 'vue-router';
import Survey from './views/Survey.vue';
import Login from './views/Login.vue';
import SignUp from './views/SignUp.vue';
import Admin from './views/admin/Admin.vue';

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
  {
    path: '/signup',
    name: 'SignUp',
    component: SignUp,
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
