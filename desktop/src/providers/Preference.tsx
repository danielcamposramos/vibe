import { invoke } from '@tauri-apps/api/core'
import { ReactNode, createContext, useContext, useEffect, useRef } from 'react'
import { useLocalStorage } from 'usehooks-ts'
import { TextFormat } from '~/components/FormatSelect'
import { ModifyState } from '~/lib/utils'
import * as os from '@tauri-apps/plugin-os'
import { supportedLanguages } from '~/lib/i18n'
import WhisperLanguages from '~/assets/whisper-languages.json'
import { useTranslation } from 'react-i18next'
import { defaultOllamaConfig, LlmConfig } from '~/lib/llm'
import { message } from '@tauri-apps/plugin-dialog'

type Direction = 'ltr' | 'rtl'

export interface AdvancedTranscribeOptions {
	includeSubFolders: boolean
	skipIfExists: boolean
	saveNextToAudioFile: boolean
}

// Define the type of preference
export interface Preference {
	displayLanguage: string
	setDisplayLanguage: ModifyState<string>
	soundOnFinish: boolean
	setSoundOnFinish: ModifyState<boolean>
	focusOnFinish: boolean
	setFocusOnFinish: ModifyState<boolean>
	modelPath: string | null
	setModelPath: ModifyState<string | null>
	skippedSetup: boolean
	setSkippedSetup: ModifyState<boolean>
	textAreaDirection: Direction
	setTextAreaDirection: ModifyState<Direction>
	textFormat: TextFormat
	setTextFormat: ModifyState<TextFormat>
	modelOptions: ModelOptions
	setModelOptions: ModifyState<ModelOptions>
	theme: 'light' | 'dark'
	setTheme: ModifyState<'light' | 'dark'>
	storeRecordInDocuments: boolean
	setStoreRecordInDocuments: ModifyState<boolean>
	gpuDevice: number
	setGpuDevice: ModifyState<number>
	useGpu: boolean | null
	setUseGpu: ModifyState<boolean | null>

	highGraphicsPreference: boolean
	setHighGraphicsPreference: ModifyState<boolean>

	recognizeSpeakers: boolean
	setRecognizeSpeakers: ModifyState<boolean>
	maxSpeakers: number
	setMaxSpeakers: ModifyState<number>
	diarizeThreshold: number
	setDiarizeThreshold: ModifyState<number>
	setLanguageDirections: () => void
	homeTabIndex: number
	setHomeTabIndex: ModifyState<number>

	llmConfig: LlmConfig
	setLlmConfig: ModifyState<LlmConfig>
	ffmpegOptions: FfmpegOptions
	setFfmpegOptions: ModifyState<FfmpegOptions>
	resetOptions: () => void
	enableSubtitlesPreset: () => void
        ytDlpVersion: string | null
        setYtDlpVersion: ModifyState<string | null>
        shouldCheckYtDlpVersion: boolean
        setShouldCheckYtDlpVersion: ModifyState<boolean>

        subtitleAutoSaveInterval: number
        setSubtitleAutoSaveInterval: ModifyState<number>

        advancedTranscribeOptions: AdvancedTranscribeOptions
        setAdvancedTranscribeOptions: ModifyState<AdvancedTranscribeOptions>
}

// Create the context
const PreferenceContext = createContext<Preference | null>(null)

// Custom hook to use the preference context
export function usePreferenceProvider() {
	return useContext(PreferenceContext) as Preference
}

export interface FfmpegOptions {
	normalize_loudness: boolean
	custom_command: string | null
}

export interface ModelOptions {
	lang: string
	verbose: boolean
	n_threads?: number
	init_prompt?: string
	temperature?: number
	translate?: boolean
	max_text_ctx?: number
	word_timestamps?: boolean
	max_sentence_len?: number
	sampling_strategy: 'greedy' | 'beam search'
	sampling_bestof_or_beam_size?: number
}

const systemIsDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

const defaultOptions = {
	gpuDevice: 0,
	soundOnFinish: true,
	focusOnFinish: true,
	modelPath: null,
	modelOptions: {
		init_prompt: '',
		verbose: false,
		lang: 'en',
		n_threads: 4,
		temperature: 0.4,
		max_text_ctx: undefined,
		word_timestamps: false,
		max_sentence_len: 1,
		sampling_strategy: 'beam search' as 'greedy' | 'beam search',
		sampling_bestof_or_beam_size: 5,
	},
	ffmpegOptions: {
		normalize_loudness: false,
		custom_command: null,
	},
	recognizeSpeakers: false,
	maxSpeakers: 5,
	diarizeThreshold: 0.5,
	storeRecordInDocuments: true,
	llmConfig: defaultOllamaConfig(),
        ytDlpVersion: null,
        shouldCheckYtDlpVersion: true,
        subtitleAutoSaveInterval: 1000,
}

// Preference provider component
export function PreferenceProvider({ children }: { children: ReactNode }) {
	const { i18n } = useTranslation()
	const previ18Language = useRef(i18n.language)
	const [language, setLanguage] = useLocalStorage('prefs_display_language', i18n.language)
	const [isFirstRun, setIsFirstRun] = useLocalStorage('prefs_first_localstorage_read', true)

	const [gpuDevice, setGpuDevice] = useLocalStorage<number>('prefs_gpu_device', 0)
	const [useGpu, setUseGpu] = useLocalStorage<boolean | null>('prefs_use_gpu', true)

	const [modelPath, setModelPath] = useLocalStorage<string | null>('prefs_model_path', null)
	const [skippedSetup, setSkippedSetup] = useLocalStorage<boolean>('prefs_skipped_setup', false)
	const [textAreaDirection, setTextAreaDirection] = useLocalStorage<Direction>('prefs_textarea_direction', 'ltr')
	const [textFormat, setTextFormat] = useLocalStorage<TextFormat>('prefs_text_format', 'pdf')
	const isMounted = useRef<boolean>()
	const [theme, setTheme] = useLocalStorage<'dark' | 'light'>('prefs_theme', systemIsDark ? 'dark' : 'light')
	const [highGraphicsPreference, setHighGraphicsPreference] = useLocalStorage<boolean>('prefs_high_graphics_performance', false)
	const [homeTabIndex, setHomeTabIndex] = useLocalStorage<number>('prefs_home_tab_index', 1)

	const [soundOnFinish, setSoundOnFinish] = useLocalStorage('prefs_sound_on_finish', defaultOptions.soundOnFinish)
	const [focusOnFinish, setFocusOnFinish] = useLocalStorage('prefs_focus_on_finish', defaultOptions.focusOnFinish)
	const [modelOptions, setModelOptions] = useLocalStorage<ModelOptions>('prefs_modal_args', defaultOptions.modelOptions)
	const [ffmpegOptions, setFfmpegOptions] = useLocalStorage<FfmpegOptions>('prefs_ffmpeg_options', defaultOptions.ffmpegOptions)
	const [recognizeSpeakers, setRecognizeSpeakers] = useLocalStorage<boolean>('prefs_recognize_speakers', defaultOptions.recognizeSpeakers)
	const [maxSpeakers, setMaxSpeakers] = useLocalStorage<number>('prefs_max_speakers', defaultOptions.maxSpeakers)
	const [diarizeThreshold, setDiarizeThreshold] = useLocalStorage<number>('prefs_diarize_threshold', defaultOptions.diarizeThreshold)
	const [storeRecordInDocuments, setStoreRecordInDocuments] = useLocalStorage('prefs_store_record_in_documents', defaultOptions.storeRecordInDocuments)
	const [llmConfig, setLlmConfig] = useLocalStorage<LlmConfig>('prefs_llm_config', defaultOptions.llmConfig)
	const [ytDlpVersion, setYtDlpVersion] = useLocalStorage<string | null>('prefs_ytdlp_version', null)
        const [shouldCheckYtDlpVersion, setShouldCheckYtDlpVersion] = useLocalStorage<boolean>('prefs_should_check_ytdlp_version', true)
        const [subtitleAutoSaveInterval, setSubtitleAutoSaveInterval] = useLocalStorage<number>('prefs_subtitle_autosave_interval', 1000)
        const [advancedTranscribeOptions, setAdvancedTranscribeOptions] = useLocalStorage<AdvancedTranscribeOptions>('prefs_advanced_transcribe_options', {
                includeSubFolders: false,
                saveNextToAudioFile: true,
                skipIfExists: true,
        })

	useEffect(() => {
		setIsFirstRun(false)
	}, [])

	useEffect(() => {
		if (!isMounted.current || os.platform() !== 'windows') {
			isMounted.current = true
			return
		}
		invoke('set_high_gpu_preference', { mode: highGraphicsPreference })
	}, [highGraphicsPreference])

	useEffect(() => {
		document.documentElement.setAttribute('data-theme', theme)
	}, [theme])

	function setLanguageDefaults() {
		const name = supportedLanguages[preference.displayLanguage]
		if (name) {
			preference.setModelOptions({ ...preference.modelOptions, lang: WhisperLanguages[name as keyof typeof WhisperLanguages] })
			preference.setTextAreaDirection(i18n.dir())
		}
	}
	useEffect(() => {
		if (!isMounted.current) {
			isMounted.current = true
			return
		}
		if (previ18Language.current != i18n.language || isFirstRun) {
			previ18Language.current = i18n.language
			setLanguageDefaults()
		}
	}, [i18n.language])

	useEffect(() => {
		i18n.changeLanguage(language)
	}, [language])

	function resetOptions() {
		setSoundOnFinish(defaultOptions.soundOnFinish)
		setFocusOnFinish(defaultOptions.focusOnFinish)
		setModelOptions(defaultOptions.modelOptions)
		setFfmpegOptions(defaultOptions.ffmpegOptions)
		setRecognizeSpeakers(defaultOptions.recognizeSpeakers)
		setMaxSpeakers(defaultOptions.maxSpeakers)
                setDiarizeThreshold(defaultOptions.diarizeThreshold)
                setStoreRecordInDocuments(defaultOptions.storeRecordInDocuments)
                setLlmConfig(defaultOptions.llmConfig)
                setSubtitleAutoSaveInterval(defaultOptions.subtitleAutoSaveInterval)
                message(i18n.t('common.success-action'))
        }

	function enableSubtitlesPreset() {
		setModelOptions({ ...preference.modelOptions, word_timestamps: true, max_sentence_len: 32 })
		setTextFormat('srt')
		message(i18n.t('common.success-action'))
	}

	const preference: Preference = {
		useGpu,
		setUseGpu,
		enableSubtitlesPreset,
		llmConfig,
		resetOptions,
		setLlmConfig,
		setLanguageDirections: setLanguageDefaults,
		diarizeThreshold,
		setDiarizeThreshold,
		maxSpeakers,
		setMaxSpeakers,
		highGraphicsPreference,
		setHighGraphicsPreference,
		recognizeSpeakers,
		setRecognizeSpeakers,
		modelOptions,
		setModelOptions,
		storeRecordInDocuments,
		setStoreRecordInDocuments,
		textFormat,
		setTextFormat,
		textAreaDirection,
		setTextAreaDirection,
		skippedSetup,
		setSkippedSetup,
		displayLanguage: language,
		setDisplayLanguage: setLanguage,
		soundOnFinish,
		setSoundOnFinish,
		focusOnFinish,
		setFocusOnFinish,
		modelPath,
		setModelPath,
		theme,
		setTheme,
		gpuDevice,
		setGpuDevice,
		homeTabIndex,
		setHomeTabIndex,
		ffmpegOptions,
		setFfmpegOptions,
		ytDlpVersion,
		setYtDlpVersion,
		shouldCheckYtDlpVersion,
                setShouldCheckYtDlpVersion,
                subtitleAutoSaveInterval,
                setSubtitleAutoSaveInterval,
                advancedTranscribeOptions,
                setAdvancedTranscribeOptions,
        }

	return <PreferenceContext.Provider value={preference}>{children}</PreferenceContext.Provider>
}
