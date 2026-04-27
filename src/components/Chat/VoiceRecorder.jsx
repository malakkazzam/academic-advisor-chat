// src/components/Chat/VoiceRecorder.jsx
import  { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { FaMicrophone, FaStop, FaPlay, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const VoiceRecorder = forwardRef(({ onRecordingComplete }, ref) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  // ✅ دالة لمسح التسجيل من الـ UI
  const clearRecording = () => {
    setAudioURL(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // ✅ ن expose الدالة عشان تبقى متاحة من الـ parent component
  useImperativeHandle(ref, () => ({
    clearRecording
  }));

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        if (onRecordingComplete) onRecordingComplete(audioBlob);
        toast.success('Recording saved!');
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const deleteAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    toast.success('Recording deleted');
  };

  return (
    <div className="flex gap-2 items-center">
      {!isRecording ? (
        <button
          type="button"
          onClick={startRecording}
          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Start recording"
        >
          <FaMicrophone size={18} />
        </button>
      ) : (
        <button
          type="button"
          onClick={stopRecording}
          className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors animate-pulse"
          title="Stop recording"
        >
          <FaStop size={18} />
        </button>
      )}
      
      {audioURL && (
        <div className="flex gap-2 items-center bg-gray-100 rounded-lg p-2">
          <button
            type="button"
            onClick={isPlaying ? stopAudio : playAudio}
            className="p-1 text-primary-500 hover:text-primary-600"
          >
            <FaPlay size={14} />
          </button>
          <audio 
            ref={audioRef} 
            src={audioURL} 
            className="hidden"
            onEnded={() => setIsPlaying(false)}
          />
          <div className="w-24 h-1 bg-gray-300 rounded-full overflow-hidden">
            <div className="h-full bg-primary-500 rounded-full" style={{ width: isPlaying ? '100%' : '0%' }}></div>
          </div>
          <button
            type="button"
            onClick={deleteAudio}
            className="p-1 text-red-500 hover:text-red-600"
          >
            <FaTrash size={12} />
          </button>
        </div>
      )}
    </div>
  );
});

VoiceRecorder.displayName = 'VoiceRecorder';

export default VoiceRecorder;