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
      sectionTitle: 'Apps & Pages'
    },

    {
      title: 'Foydalanuvchilar',
      icon: 'tabler:users',
      path: '/users'
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
      title: 'Hududlar',
      icon: 'tabler:map-pin',
      path: '/locations'
    },
    {
      title: 'Bo‘lim/Lavozim',
      icon: 'tabler:users-group',
      path: '/org'
    },
    {
      title: 'Kompaniyalar',
      icon: 'tabler:building',
      path: '/company'
    }
  ]
}

export default navigation
