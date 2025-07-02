import { formatSpeaker } from './utils'

export interface Duration {
	secs: number
	nanos: number
}

export interface Transcript {
	processing_time?: Duration
	segments: Segment[]
	word_segments?: Segment[]
}

export interface Segment {
	start: number
	stop: number
	text: string
	speaker?: string
}

export function formatTimestamp(seconds: number, alwaysIncludeHours: boolean, decimalMarker: string, includeMilliseconds: boolean = true): string {
	if (seconds < 0) {
		throw new Error('Non-negative timestamp expected')
	}

	let milliseconds = seconds * 10

	const hours = Math.floor(milliseconds / 3_600_000)
	milliseconds -= hours * 3_600_000

	const minutes = Math.floor(milliseconds / 60_000)
	milliseconds -= minutes * 60_000

	const formattedSeconds = Math.floor(milliseconds / 1_000)
	milliseconds -= formattedSeconds * 1_000

	const hoursMarker = alwaysIncludeHours || hours !== 0 ? `${String(hours).padStart(2, '0')}:` : ''

	let result = `${hoursMarker}${String(minutes).padStart(2, '0')}:${String(formattedSeconds).padStart(2, '0')}`

	if (includeMilliseconds) {
		result += `${decimalMarker}${String(milliseconds).padStart(3, '0')}`
	}

	return result
}

export function mergeSpeakerSegments(segments: Segment[]) {
	let currentSpeaker: string | undefined
	const newSegments: Segment[] = []
	let currentSegment: Segment = { speaker: '', text: '', start: 0, stop: 0 }

	if (segments?.[0]?.speaker) {
		for (const segment of segments) {
			// First segment or speaker change
			if (!currentSpeaker || segment.speaker !== currentSpeaker) {
				// If it's not the first segment, push the previous segment
				if (currentSpeaker !== undefined) {
					newSegments.push(currentSegment)
				}

				// Start a new segment
				currentSegment = { ...segment } // Start with a copy of the current segment
			} else {
				// Continue adding to the current segment if it's the same speaker
				currentSegment.text += segment.text // Concatenate text
				currentSegment.stop = segment.stop // Update the stop time
			}

			currentSpeaker = segment.speaker // Update the current speaker
		}

		// Push the last segment after the loop
		newSegments.push(currentSegment)
		return newSegments
	} else {
		return segments
	}
}

export function asSrt(segments: Segment[], speakerPrefix = 'Speaker') {
	segments = mergeSpeakerSegments(segments)
	return segments.reduce((transcript, segment, i) => {
		return (
			transcript +
			`${i > 0 ? '\n' : ''}${i + 1}\n` +
			`${formatTimestamp(segment.start, true, ',')} --> ${formatTimestamp(segment.stop, true, ',')}\n` +
			`${segment.speaker ? formatSpeaker(segment.speaker, speakerPrefix) : ''}${segment.text.trim().replace('-->', '->')}\n`
		)
	}, '')
}

export function asVtt(segments: Segment[], speakerPrefix = 'Speaker') {
	segments = mergeSpeakerSegments(segments)
	return segments.reduce((transcript, segment) => {
		return (
			transcript +
			`${formatTimestamp(segment.start, false, '.')} --> ${formatTimestamp(segment.stop, false, '.')}\n` +
			`${segment.speaker ? formatSpeaker(segment.speaker, speakerPrefix) : ''}${segment.text.trim().replace('-->', '->')}\n`
		)
	}, '')
}

export function asText(segments: Segment[], speakerPrefix = 'Speaker') {
	segments = mergeSpeakerSegments(segments)
	return segments.reduce((transcript, segment) => {
		return (
			transcript + `${segment.speaker ? formatSpeaker(segment.speaker, speakerPrefix) + '\n' : ''}${segment.text.trim()}\n${segment.speaker ? '\n' : ''}`
		)
	}, '')
}

export function asJson(segments: Segment[]) {
        return JSON.stringify(segments, null, 4)
}

function parseTimestampStr(value: string) {
        const [hms, ms] = value.trim().split(/[.,]/)
        const [h, m, s] = hms.split(':').map(Number)
        const millis = parseInt(ms ?? '0')
        return h * 3600 + m * 60 + s + millis / 1000
}

export function parseSrt(content: string): Segment[] {
        const lines = content.replace(/\r/g, '').split(/\n/)
        const segments: Segment[] = []
        let i = 0
        while (i < lines.length) {
                if (!lines[i].trim()) {
                        i++
                        continue
                }
                i++ // skip index line
                const time = lines[i++]?.trim()
                if (!time) break
                const [start, end] = time.split('-->')
                let text = ''
                while (i < lines.length && lines[i].trim() !== '') {
                        text += (text ? '\n' : '') + lines[i]
                        i++
                }
                segments.push({ start: parseTimestampStr(start), stop: parseTimestampStr(end), text })
                while (i < lines.length && !lines[i].trim()) i++
        }
        return segments
}

export function parseVtt(content: string): Segment[] {
        const lines = content.replace(/\r/g, '').split(/\n/)
        const segments: Segment[] = []
        let i = 0
        if (lines[0]?.startsWith('WEBVTT')) {
                i++
        }
        while (i < lines.length) {
                if (!lines[i].trim()) {
                        i++
                        continue
                }
                const time = lines[i++]
                const [start, end] = time.split('-->')
                let text = ''
                while (i < lines.length && lines[i].trim() !== '') {
                        text += (text ? '\n' : '') + lines[i]
                        i++
                }
                segments.push({ start: parseTimestampStr(start), stop: parseTimestampStr(end), text })
                while (i < lines.length && !lines[i].trim()) i++
        }
        return segments
}

export function parseJson(content: string): Segment[] {
        try {
                const data = JSON.parse(content)
                if (Array.isArray(data)) {
                        return data
                }
                if (Array.isArray(data.segments)) {
                        return data.segments
                }
        } catch (e) {
                console.error(e)
        }
        return []
}

export function parseText(content: string): Segment[] {
        return content
                .split(/\n/)
                .filter((l) => l.trim())
                .map((text, i) => ({ start: i * 2, stop: i * 2 + 2, text: text.trim() }))
}
