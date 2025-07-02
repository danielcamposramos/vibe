import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Layout from '~/components/Layout'
import SubtitleEditor from '~/components/SubtitleEditor'
import { Transcript } from '~/lib/transcript'
import { NamedPath } from '~/lib/utils'

export default function EditorPage() {
    const location = useLocation()
    const navigate = useNavigate()
    const [transcript, setTranscript] = useState<Transcript>({ segments: [] })
    const videoSrc = location.state?.videoSrc as string | undefined
    const file = location.state?.file as NamedPath | undefined

    useEffect(() => {
        if (location.state?.transcript) {
            setTranscript({ segments: location.state.transcript })
        } else {
            navigate('/')
        }
    }, [])

    return (
        <Layout>
            <div className="w-[90%] max-w-[1000px] m-auto">
                <SubtitleEditor transcript={transcript} setTranscript={setTranscript} videoSrc={videoSrc ?? ''} file={file} />
            </div>
        </Layout>
    )
}
