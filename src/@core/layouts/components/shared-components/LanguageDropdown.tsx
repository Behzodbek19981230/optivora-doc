// ** React Import
import { useEffect } from 'react'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Import
import { useTranslation } from 'react-i18next'

// ** Custom Components Imports
import OptionsMenu from 'src/@core/components/option-menu'

// ** Type Import
import { Settings } from 'src/@core/context/settingsContext'

interface Props {
  settings: Settings
  saveSettings: (values: Settings) => void
}

const LanguageDropdown = ({ settings, saveSettings }: Props) => {
  // ** Hook
  const { i18n, t } = useTranslation()

  const handleLangItemClick = (lang: 'en' | 'ru' | 'uz') => {
    i18n.changeLanguage(lang)
    localStorage.setItem('i18nextLng', lang)
    window.location.reload()
  }

  // ** Change html `lang` attribute when changing locale
  useEffect(() => {
    document.documentElement.setAttribute('lang', i18n.language)
  }, [i18n.language])

  return (
    <OptionsMenu
      iconButtonProps={{ color: 'inherit' }}
      icon={<Icon fontSize='1.625rem' icon='tabler:language' />}
      menuProps={{ sx: { '& .MuiMenu-paper': { mt: 4.25, minWidth: 130 } } }}
      options={[
        {
          text: t('language.en'),
          menuItemProps: {
            sx: { py: 2 },
            selected: i18n.language === 'en',
            onClick: () => {
              handleLangItemClick('en')
              saveSettings({ ...settings, direction: 'ltr' })
            }
          }
        },
        {
          text: t('language.ru'),
          menuItemProps: {
            sx: { py: 2 },
            selected: i18n.language === 'ru',
            onClick: () => {
              handleLangItemClick('ru')
              saveSettings({ ...settings, direction: 'ltr' })
            }
          }
        },
        {
          text: t('language.uz'),
          menuItemProps: {
            sx: { py: 2 },
            selected: i18n.language === 'uz',
            onClick: () => {
              handleLangItemClick('uz')
              saveSettings({ ...settings, direction: 'ltr' })
            }
          }
        }
      ]}
    />
  )
}

export default LanguageDropdown
