import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Segment, Transcript, serializeSegments, SegmentFormat } from '~/lib/transcript'
import { cx, NamedPath, openPath } from '~/lib/utils'
import FormatSelect, { TextFormat, formatExtensions } from './FormatSelect'
import * as dialog from '@tauri-apps/plugin-dialog'
import * as fs from '@tauri-apps/plugin-fs'
import { invoke } from '@tauri-apps/api/core'
import toast from 'react-hot-toast'
import { path } from '@tauri-apps/api'
import { toDocx } from '~/lib/docx'
import { usePreferenceProvider } from '~/providers/Preference'
import { ReactComponent as DownloadIcon } from '~/icons/download.svg'

export interface SubtitleEditorProps {
    transcript: Transcript
    setTranscript: (t: Transcript) => void
    videoSrc: string
    autoSave?: boolean
    onSave?: (t: Transcript) => void
    file?: NamedPath
}

interface EditorContextValue {
    segments: Segment[]
    updateSegments: (s: Segment[]) => void
    videoRef: React.RefObject<HTMLVideoElement>
}

const EditorContext = createContext<EditorContextValue | null>(null)

export function useSubtitleEditor() {
    return useContext(EditorContext) as EditorContextValue
}

function EditorSegment({ segment, index }: { segment: Segment; index: number }) {
    const { segments, updateSegments, videoRef } = useSubtitleEditor()
    const [local, setLocal] = useState(segment)
    const ref = useRef<HTMLTextAreaElement>(null)
    const cps = Math.round((segment.text.length / Math.max(0.001, segment.stop - segment.start)) * 100) / 100

    useEffect(() => setLocal(segment), [segment])

    function update(newSeg: Segment) {
        const newSegs = [...segments]
        newSegs[index] = newSeg
        updateSegments(newSegs)
    }

    return (
        <div className={cx('flex flex-col gap-1 border rounded p-2', 'w-full')}>
            <div className="flex gap-2 items-center">
                <label className="flex items-center gap-1">
                    <span>Start</span>
                    <input
                        type="number"
                        step="0.01"
                        value={local.start}
                        onChange={(e) => {
                            const v = parseFloat(e.target.value)
                            setLocal({ ...local, start: v })
                            update({ ...local, start: v })
                        }}
                        className="input input-bordered input-xs w-24"
                    />
                    <button
                        className="btn btn-xs"
                        onMouseDown={() => {
                            if (videoRef.current) {
                                const v = parseFloat(videoRef.current.currentTime.toFixed(2))
                                setLocal({ ...local, start: v })
                                update({ ...local, start: v })
                            }
                        }}
                    >
                        ⏱
                    </button>
                </label>
                <label className="flex items-center gap-1">
                    <span>End</span>
                    <input
                        type="number"
                        step="0.01"
                        value={local.stop}
                        onChange={(e) => {
                            const v = parseFloat(e.target.value)
                            setLocal({ ...local, stop: v })
                            update({ ...local, stop: v })
                        }}
                        className="input input-bordered input-xs w-24"
                    />
                    <button
                        className="btn btn-xs"
                        onMouseDown={() => {
                            if (videoRef.current) {
                                const v = parseFloat(videoRef.current.currentTime.toFixed(2))
                                setLocal({ ...local, stop: v })
                                update({ ...local, stop: v })
                            }
                        }}
                    >
                        ⏱
                    </button>
                </label>
                <span className="ms-auto text-xs">{cps} cps</span>
            </div>
            <textarea
                ref={ref}
                className="textarea textarea-bordered text-sm"
                value={local.text}
                onChange={(e) => {
                    setLocal({ ...local, text: e.target.value })
                    update({ ...local, text: e.target.value })
                }}
            />
            <div className="flex gap-1">
                <button
                    className="btn btn-xs"
                    onMouseDown={() => {
                        const current = videoRef.current?.currentTime ?? 0
                        const seg: Segment = { start: current, stop: current + 1, text: '' }
                        const newSegs = [...segments]
                        newSegs.splice(index, 0, seg)
                        updateSegments(newSegs)
                    }}
                >
                    + above
                </button>
                <button
                    className="btn btn-xs"
                    onMouseDown={() => {
                        const current = videoRef.current?.currentTime ?? 0
                        const seg: Segment = { start: current, stop: current + 1, text: '' }
                        const newSegs = [...segments]
                        newSegs.splice(index + 1, 0, seg)
                        updateSegments(newSegs)
                    }}
                >
                    + below
                </button>
                <button
                    className="btn btn-xs"
                    onMouseDown={() => {
                        const current = videoRef.current?.currentTime ?? (segment.start + segment.stop) / 2
                        if (current <= segment.start || current >= segment.stop) return
                        const first: Segment = { start: segment.start, stop: current, text: local.text }
                        const second: Segment = { start: current, stop: segment.stop, text: '' }
                        const newSegs = [...segments]
                        newSegs.splice(index, 1, first, second)
                        updateSegments(newSegs)
                    }}
                >
                    split
                </button>
                <button
                    className="btn btn-xs"
                    onMouseDown={() => {
                        const newSegs = segments.filter((_, i) => i !== index)
                        updateSegments(newSegs)
                    }}
                >
                    delete
                </button>
            </div>
        </div>
    )
}

export default function SubtitleEditor({ transcript, setTranscript, videoSrc, autoSave = true, onSave, file }: SubtitleEditorProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const preference = usePreferenceProvider()
    const [segments, setSegments] = useState<Segment[]>(transcript.segments)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [auto, setAuto] = useState(autoSave)
    const [output, setOutput] = useState<TextFormat>('srt')
    const historyRef = useRef<Segment[][]>([])

    function updateSegments(newSegs: Segment[]) {
        setSegments(newSegs)
        historyRef.current.push(newSegs)
    }

    async function saveToFile() {
        const ext = formatExtensions[output].slice(1)
        const defaultSrc = file?.path ?? `subtitle.${ext}`
        const defaultPath = await invoke<NamedPath>('get_save_path', { srcPath: defaultSrc, targetExt: ext })
        const savePath = await dialog.save({
            filters: [{ name: '', extensions: [ext] }],
            canCreateDirectories: true,
            defaultPath: defaultPath.path,
        })
        if (savePath) {
            if (output === 'docx') {
                const fileName = await path.basename(savePath)
                const doc = await toDocx(fileName, segments, preference.textAreaDirection)
                const arrayBuffer = await doc.arrayBuffer()
                const buffer = new Uint8Array(arrayBuffer)
                await fs.writeFile(savePath, buffer)
            } else {
                const text = serializeSegments(segments, output as SegmentFormat, 'Speaker')
                await fs.writeTextFile(savePath, text)
            }
            toast(
                (mytoast) => (
                    <span>
                        {`Saved Successfully!`}
                        <button
                            onClick={() => {
                                toast.dismiss(mytoast.id)
                                openPath({ name: '', path: savePath })
                            }}
                        >
                            <div className="link link-primary ms-5">{defaultPath?.name}</div>
                        </button>
                    </span>
                ),
                {
                    duration: 5000,
                    position: 'bottom-center',
                    iconTheme: { primary: '#000', secondary: '#fff' },
                }
            )
        }
    }

    useEffect(() => {
        setTranscript({ ...transcript, segments })
    }, [segments])

    useEffect(() => {
        if (!auto) return
        const id = setTimeout(() => {
            onSave?.({ ...transcript, segments })
        }, preference.subtitleAutoSaveInterval)
        return () => clearTimeout(id)
    }, [segments, auto, preference.subtitleAutoSaveInterval])

    useEffect(() => {
        function handler(e: KeyboardEvent) {
            if (e.ctrlKey && e.key.toLowerCase() === 'z') {
                e.preventDefault()
                const h = historyRef.current
                if (h.length > 1) {
                    h.pop()
                    setSegments(h[h.length - 1])
                }
            } else if (e.ctrlKey && e.key.toLowerCase() === 's') {
                e.preventDefault()
                saveToFile()
                onSave?.({ ...transcript, segments })
            }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [segments])

    useEffect(() => {
        const t = setInterval(() => {
            const current = videoRef.current?.currentTime ?? 0
            const idx = segments.findIndex((s) => current >= s.start && current <= s.stop)
            if (idx >= 0) setCurrentIndex(idx)
        }, 200)
        return () => clearInterval(t)
    }, [segments])

    useEffect(() => {
        historyRef.current = [segments]
    }, [])

    return (
        <EditorContext.Provider value={{ segments, updateSegments, videoRef }}>
            <div className="flex flex-col gap-2">
                <video ref={videoRef} src={videoSrc} controls className="w-full" />
                <label className="flex items-center gap-2">
                    <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} />
                    <span>autosave</span>
                </label>
                <div className="flex items-center gap-2">
                    <FormatSelect format={output} setFormat={setOutput} />
                    <button onMouseDown={saveToFile} className="btn btn-square">
                        <DownloadIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex flex-col gap-2 overflow-y-auto max-h-[60vh]">
                    {segments.map((seg, i) => (
                        <div key={i} className={cx(i === currentIndex && 'bg-base-200 p-1 rounded')}>
                            <EditorSegment segment={seg} index={i} />
                        </div>
                    ))}
                </div>
            </div>
        </EditorContext.Provider>
    )
}

