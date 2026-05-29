import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/questionnaire',
      name: 'questionnaire',
      component: () => import('../views/QuestionnaireView.vue'),
    },
    {
      path: '/warehouse',
      name: 'warehouse',
      component: () => import('../views/BrainMapView.vue'),
    },
    {
      path: '/cabinet',
      name: 'cabinet',
      component: () => import('../views/CabinetView.vue'),
    },
    {
      path: '/cabinet/:id',
      name: 'experience-detail',
      component: () => import('../views/ExperienceDetailView.vue'),
      props: true,
    },
    {
      path: '/resume',
      name: 'resume-input',
      component: () => import('../views/ResumeInputView.vue'),
    },
    {
      path: '/resume/preview',
      name: 'resume-preview',
      component: () => import('../views/ResumePreviewView.vue'),
    },
  ],
})

export default router
