// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'
import { ROLES } from 'src/configs/consts'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'nav.dashboards',
      icon: 'tabler:smart-home',
      path: '/',
      roles: [ROLES.ADMIN, ROLES.MANAGER]
    },
    {
      sectionTitle: 'nav.section.main'
    },
    {
      title: 'nav.calendar',
      icon: 'tabler:calendar',
      path: '/calendar',
      roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.PERFORMER, ROLES.SIGNATORY]
    },
    {
      title: 'nav.documents',
      icon: 'tabler:folder',
      path: '/documents',

      roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.PERFORMER, ROLES.SIGNATORY]
    },
    {
      title: 'nav.archive',
      icon: 'tabler:archive',
      path: '/archive',
      roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.PERFORMER, ROLES.SIGNATORY]
    },
    {
      title: 'nav.commands',
      icon: 'tabler:command',
      path: '/commands',
      roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.PERFORMER, ROLES.SIGNATORY]
    },
    {
      title: 'nav.replyLetters',
      icon: 'tabler:mail',
      path: '/reply-letter',
      roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.PERFORMER, ROLES.SIGNATORY]
    },

    {
      sectionTitle: 'nav.section.catalogs'
    },
    {
      title: 'nav.users',
      icon: 'tabler:users',
      path: '/users',
      roles: [ROLES.ADMIN]
    },
    {
      title: 'nav.documentForm',
      icon: 'tabler:file-description',
      path: '/document-form',
      roles: [ROLES.ADMIN, ROLES.MANAGER]
    },

    {
      title: 'nav.listOfMagazine',
      icon: 'tabler:notebook',
      path: '/list-of-magazine',
      roles: [ROLES.ADMIN, ROLES.MANAGER]
    },
    {
      title: 'nav.org',
      icon: 'tabler:users-group',
      path: '/org',
      roles: [ROLES.ADMIN, ROLES.MANAGER]
    },
    {
      title: 'nav.locations',
      icon: 'tabler:map-pin',
      path: '/locations',
      roles: [ROLES.ADMIN, ROLES.MANAGER]
    },
    {
      title: 'nav.company',
      icon: 'tabler:building',
      path: '/company',
      roles: [ROLES.ADMIN]
    },
    {
      sectionTitle: 'nav.section.reports'
    },
    {
      title: 'nav.reports',
      icon: 'tabler:report-analytics',  
      path: '/reports',
      roles: [ROLES.ADMIN, ROLES.MANAGER]
    }
  ]
}

export default navigation
