// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'nav.dashboards',
      icon: 'tabler:smart-home',
      badgeContent: 'new',
      badgeColor: 'error',
      path: '/dashboards'
    },
    {
      sectionTitle: 'nav.section.main'
    },
    {
      title: 'nav.calendar',
      icon: 'tabler:calendar',
      path: '/apps/calendar'
    },
    {
      title: 'nav.documents',
      icon: 'tabler:folder',
      path: '/documents/new',
      children: [
        { title: 'nav.documents.status.new', path: '/documents/new' },
        { title: 'nav.documents.status.inProgress', path: '/documents/in_progress' },
        { title: 'nav.documents.status.onReview', path: '/documents/on_review' },
        { title: 'nav.documents.status.done', path: '/documents/done' },
        { title: 'nav.documents.status.cancelled', path: '/documents/cancelled' },
        { title: 'nav.documents.status.returned', path: '/documents/returned' }
      ]
    },
    {
      title: 'nav.commands',
      icon: 'tabler:command',
      path: '/commands'
    },
    {
      title: 'nav.replyLetters',
      icon: 'tabler:mail',
      path: '/reply-letter'
    },

    {
      sectionTitle: 'nav.section.catalogs'
    },
    {
      title: 'nav.users',
      icon: 'tabler:users',
      path: '/users'
    },
    {
      title: 'nav.documentForm',
      icon: 'tabler:file-description',
      path: '/document-form'
    },
    {
      title: 'nav.tasks',
      icon: 'tabler:checklist',
      path: '/tasks'
    },
    {
      title: 'nav.listOfMagazine',
      icon: 'tabler:notebook',
      path: '/list-of-magazine'
    },
    {
      title: 'nav.org',
      icon: 'tabler:users-group',
      path: '/org'
    },
    {
      title: 'nav.locations',
      icon: 'tabler:map-pin',
      path: '/locations'
    },
    {
      title: 'nav.company',
      icon: 'tabler:building',
      path: '/company'
    }
  ]
}

export default navigation
