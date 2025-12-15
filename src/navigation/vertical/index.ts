// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'Dashboards',
      icon: 'tabler:smart-home',
      badgeContent: 'new',
      badgeColor: 'error',
      path: '/dashboards'
    },
    {
      sectionTitle: 'Asosiy'
    },
    {
      title: 'Calendar',
      icon: 'tabler:calendar',
      path: '/apps/calendar'
    },
    {
      title: 'Buyruqlar',
      icon: 'tabler:command',
      path: '/commands'
    },
    {
      title: 'Javob xatlari',
      icon: 'tabler:mail',
      path: '/reply-letter'
    },
    {
      title: 'Hujjatlar',
      icon: 'tabler:folder',
      path: '/documents/new',
      children: [
        { title: 'New', path: '/documents/new' },
        { title: 'In Progress', path: '/documents/in_progress' },
        { title: 'On review', path: '/documents/on_review' },
        { title: 'Done', path: '/documents/done' },
        { title: 'Cancelled', path: '/documents/cancelled' },
        { title: 'Returned', path: '/documents/returned' }
      ]
    },
    {
      sectionTitle: 'Kataloglar'
    },
    {
      title: 'Foydalanuvchilar',
      icon: 'tabler:users',
      path: '/users'
    },
    {
      title: 'Hujjat shakli',
      icon: 'tabler:file-description',
      path: '/document-form'
    },
    {
      title: 'Vazifalar',
      icon: 'tabler:checklist',
      path: '/tasks'
    },
    {
      title: "Jurnallar ro'yxati",
      icon: 'tabler:notebook',
      path: '/list-of-magazine'
    },
    {
      title: 'Bo‘lim/Lavozim',
      icon: 'tabler:users-group',
      path: '/org'
    },
    {
      title: 'Hududlar',
      icon: 'tabler:map-pin',
      path: '/locations'
    },
    {
      title: 'Kompaniyalar',
      icon: 'tabler:building',
      path: '/company'
    }
  ]
}

export default navigation
