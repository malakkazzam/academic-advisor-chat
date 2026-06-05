import { useState, useRef } from 'react'
import { Mic, Square, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const VoiceRecorder = ({ onRecordingComplete }) => {
  const [recording, setRecording] = useState(false)
  const [loading] = useState(false)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const streamRef = useRef(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunksRef.current = []
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      
      recorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const audioUrl = URL.createObjectURL(audioBlob)
        const audioId = `audio-${Date.now()}`
        
        if (onRecordingComplete) {
          onRecordingComplete({
            id: audioId,
            url: audioUrl,
            blob: audioBlob,
            duration: 0
          })
        }
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop())
        }
      }
      
      recorder.start()
      setRecording(true)
      toast.success('Recording started...', { duration: 1500 })
    } catch {
      toast.error('Microphone access denied')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      setRecording(false)
      toast.success('Recording saved', { duration: 1500 })
    }
  }

  return (
    <button
      type="button"
      onClick={recording ? stopRecording : startRecording}
      disabled={loading}
      className={`p-2 rounded-full transition ${recording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
      title={recording ? 'Stop recording' : 'Start recording'}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : recording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </button>
  )
}

export default VoiceRecorder