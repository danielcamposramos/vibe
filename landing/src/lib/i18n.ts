import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpBackend from 'i18next-http-backend'
import { createI18nStore } from 'svelte-i18next'

export const supportedLanguages: { [key: string]: string } = {
       'en-US': 'English',
       'he-IL': '\u05e2\u05d1\u05e8\u05d9\u05ea',
       'fr-FR': 'Français',
       'pl-PL': 'polski',
       'pt-BR': 'Português',
       'zh-CN': '\u4e2d\u6587',
       'zh-HK': '\u4e2d\u6587 (HK)',
       'no-NO': 'norsk',
       'ru-RU': '\u0420\u0443\u0441\u0441\u043a\u0438\u0439',
       'es-MX': 'Español',
       'ko-KR': '\ud55c\uad6d\uc5b4',
}

i18next
	.use(HttpBackend)
	.use(LanguageDetector)
	.init({
		detection: {
			order: ['localStorage', 'querystring', 'navigator'],
			caches: ['localStorage'],
			lookupQuerystring: 'lng',
			lookupLocalStorage: 'locale',
		},
		fallbackLng: 'en-US',
		// lng: 'en', // testing in dev mode
               supportedLngs: Object.keys(supportedLanguages),
		ns: 'translation',
		backend: {
			loadPath: 'locales/{{lng}}.json',
		},
		debug: false,
	})

export const i18n = createI18nStore(i18next)
