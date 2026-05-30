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
      path: '/street',
      name: 'street',
      component: () => import('../views/StreetView.vue'),
    },
    {
      path: '/house/:id',
      name: 'house',
      component: () => import('../views/HouseView.vue'),
      props: true,
    },
    {
      path: '/qa',
      name: 'qa',
      component: () => import('../views/QAView.vue'),
    },
    {
      path: '/backpack',
      name: 'backpack',
      component: () => import('../components/cabin/BackpackView.vue'),
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
    {
      path: '/warehouse',
      name: 'warehouse',
      component: () => import('../views/BrainMapView.vue'),
    },
    {
      path: '/cabinet/:id',
      name: 'experience-detail',
      component: () => import('../views/ExperienceDetailView.vue'),
      props: true,
    },
    // Legacy redirects
    { path: '/cabin', redirect: '/street' },
    { path: '/questionnaire', redirect: '/street' },
    { path: '/cabinet', redirect: '/street' },
  ],
})

export default router
