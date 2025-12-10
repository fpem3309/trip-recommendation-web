import { createRouter, createWebHistory } from 'vue-router';
import Survey from './views/Survey.vue';
import Login from './views/Login.vue';
import SignUp from './views/SignUp.vue';
import AdminLayout from './views/admin/layouts/AdminLayout.vue';
import QuestionManagement from './views/admin/pages/QuestionManagement.vue';
import UserManagement from './views/admin/pages/UserManagement.vue';

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
  { //TODO: 라우터 가드 필요
    path: '/admin',
    component: AdminLayout,
    children: [
      {
        path: '',
        redirect: '/admin/questions',
      },
      {
        path: 'questions',
        name: 'AdminQuestions',
        component: QuestionManagement,
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: UserManagement,
      }
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
