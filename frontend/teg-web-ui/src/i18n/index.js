import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'

import enJSON from './en'

const i18n = i18next
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en: enJSON,
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    debug: false,
  })

export default i18n
