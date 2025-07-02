import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { basename } from '@tauri-apps/api/path'
import * as dialog from '@tauri-apps/plugin-dialog'
import * as fs from '@tauri-apps/plugin-fs'
import Layout from '~/components/Layout'
import FormatSelect, { TextFormat, formatExtensions } from '~/components/FormatSelect'
import { Segment, asJson, asSrt, asText, asVtt, parseJson, parseSrt, parseText, parseVtt } from '~/lib/transcript'

export default function ConvertPage() {
    const { t } = useTranslation()
    const [segments, setSegments] = useState<Segment[] | null>(null)
    const [file, setFile] = useState<{ path: string; name: string } | null>(null)
    const [output, setOutput] = useState<TextFormat>('srt')

    async function selectFile() {
        const selected = await dialog.open({
            multiple: false,
            filters: [{ name: 'Subtitles', extensions: ['srt', 'vtt', 'json', 'txt'] }],
        })
        if (selected) {
            const p = selected as string
            const name = await basename(p)
            const content = await fs.readTextFile(p)
            const ext = p.split('.').pop()?.toLowerCase()
            let segs: Segment[] = []
            if (ext === 'srt') segs = parseSrt(content)
            else if (ext === 'vtt') segs = parseVtt(content)
            else if (ext === 'json') segs = parseJson(content)
            else segs = parseText(content)
            setSegments(segs)
            setFile({ path: p, name })
        }
    }

    async function convert() {
        if (!segments || !file) return
        let text = ''
        if (output === 'srt') text = asSrt(segments)
        else if (output === 'vtt') text = asVtt(segments)
        else if (output === 'json') text = asJson(segments)
        else text = asText(segments)
        const ext = formatExtensions[output]
        const defaultPath = file.path.replace(/\.[^.]+$/, ext)
        const savePath = await dialog.save({
            filters: [{ name: '', extensions: [ext.slice(1)] }],
            defaultPath,
            canCreateDirectories: true,
        })
        if (savePath) {
            await fs.writeTextFile(savePath, text)
        }
    }

    return (
        <Layout>
            <div className="flex flex-col gap-3 w-[300px] m-auto">
                <button className="btn btn-primary" onMouseDown={selectFile}>
                    {t('common.select-file')}
                </button>
                {file && <div className="text-center text-sm break-all">{file.name}</div>}
                <FormatSelect format={output} setFormat={setOutput} />
                <button className="btn btn-primary" disabled={!segments} onMouseDown={convert}>
                    {t('common.save-transcript')}
                </button>
            </div>
        </Layout>
    )
}
