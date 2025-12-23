import { createRouter, createWebHistory } from 'vue-router';
import { jwtDecode } from 'jwt-decode';
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
  {
    path: '/admin',
    component: AdminLayout,
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem('token');
      if (!token) {
        return next('/login');
      }

      // 토큰이 있을때 검증
      try {
        const { role } = jwtDecode(token);
        if (role && role.includes('ROLE_ADMIN')) {
          next();
        } else {
          alert('접근 권한이 없습니다.');
          next('/');
        }
      } catch (error) {
        console.error('Invalid token:', error);
        next('/login');
      }
    },
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
