'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VoiceGenerator() {
  const router = useRouter();
  
  // Voice Generation State
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [voiceText, setVoiceText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scriptResult, setScriptResult] = useState<any>(null);

  // ElevenLabs voice presets
  const VOICES = [
    { id: 'kdmDKE6EkgrWrrykO9Qt', name: 'Alexandra', description: 'A super realistic, young female voice that likes to chat' },
    { id: 'L0Dsvb3SLTyegXwtm47J', name: 'Archer', description: 'Grounded and friendly young British male with charm' },
    { id: 'g6xIsTj2HwM6VR4iXFCw', name: 'Jessica Anne Bogart', description: 'Empathetic and expressive, great for wellness coaches' },
    { id: 'OYTbf65OHHFELVut7v2H', name: 'Hope', description: 'Bright and uplifting, perfect for positive interactions' },
    { id: 'dj3G1R1ilKoFKhBnWOzG', name: 'Eryn', description: 'Friendly and relatable, ideal for casual interactions' },
    { id: 'HDA9tsk27wYi3uq0fPcK', name: 'Stuart', description: 'Professional & friendly Aussie, ideal for technical assistance' },
    { id: '1SM7GgM6IMuvQlz2BwM3', name: 'Mark', description: 'Relaxed and laid back, suitable for nonchalant chats' },
    { id: 'PT4nqlKZfc06VW1BuClj', name: 'Angela', description: 'Raw and relatable, great listener and down to earth' },
    { id: 'vBKc2FfBKJfcZNyEt1n6', name: 'Finn', description: 'Tenor pitched, excellent for podcasts and light chats' },
    { id: '56AoDkrOh6qfVPDXZ7Pt', name: 'Cassidy', description: 'Engaging and energetic, good for entertainment contexts' },
    { id: 'NOpBlnGInO9m6vDvFkFC', name: 'Grandpa Spuds Oxley', description: 'Distinctive character voice for unique agents' },
  ];

  const [voiceId, setVoiceId] = useState(VOICES[0].id);
  const [customVoiceId, setCustomVoiceId] = useState('');

  // Load script result from localStorage on component mount
  useEffect(() => {
    const storedScriptResult = localStorage.getItem('scriptResult');
    if (storedScriptResult) {
      setScriptResult(JSON.parse(storedScriptResult));
    }
  }, []);

  const handleGenerateAudio = async () => {
    if (!scriptResult?.script) {
      setError('No script available. Please generate a script first.');
      return;
    }
    
    setAudioLoading(true);
    setAudioUrl(null);
    setVoiceText(null);
    setError(null);
    
    try {
      const res = await fetch('http://localhost:8000/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: scriptResult.script,
          voice_id: voiceId === 'custom' ? customVoiceId : voiceId,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setVoiceText(data.voice_text || null);
      if (data.audio_base64) {
        setAudioUrl(`data:audio/mpeg;base64,${data.audio_base64}`);
      } else {
        setAudioUrl(null);
      }
      
      // Store voice result in localStorage for other pages
      localStorage.setItem('voiceResult', JSON.stringify(data));
    } catch (err: any) {
      setError(err.message || 'Audio generation error');
    } finally {
      setAudioLoading(false);
    }
  };

  const handleContinue = () => {
    if (voiceText) {
      router.push('/avatar');
    }
  };

  const handleBack = () => {
    router.push('/image');
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🎤 Bring Your Message to Life</h1>
        <p className="text-gray-600 text-lg">Transform your script into captivating voiceover audio that connects with your audience on a deeper level.</p>
      </div>

      {!scriptResult && (
        <div className="mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="text-center">
            <svg className="h-12 w-12 text-yellow-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">📝 Script Required</h3>
            <p className="text-yellow-700 mb-4">You need to create a compelling script first before we can bring it to life with voice.</p>
            <button
              onClick={handleBack}
              className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-all"
            >
              ← Back to Script Creation
            </button>
          </div>
        </div>
      )}

      {scriptResult && (
        <>
          <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-xl">
            <h3 className="text-lg font-semibold text-green-800 mb-2">✨ Your Script is Ready for Voice</h3>
            <div className="p-3 bg-white rounded border">
              <pre className="whitespace-pre-wrap text-gray-800 text-sm">{scriptResult.script}</pre>
            </div>
          </div>

          <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
            <div className="mb-6">
              <label className="font-medium block mb-1">🎭 Choose Your Voice Personality:</label>
              <select
                value={voiceId}
                onChange={e => setVoiceId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white shadow-sm transition-all duration-200 hover:border-gray-400"
                disabled={audioLoading}
              >
                {VOICES.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
                <option value="custom">Custom...</option>
              </select>
              {voiceId === 'custom' && (
                <input
                  type="text"
                  value={customVoiceId}
                  onChange={e => setCustomVoiceId(e.target.value)}
                  className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white shadow-sm transition-all duration-200 hover:border-gray-400"
                  placeholder="Enter custom ElevenLabs voice ID"
                  disabled={audioLoading}
                />
              )}
              <span className="text-xs text-gray-500 block mt-1">
                {voiceId !== 'custom'
                  ? VOICES.find(v => v.id === voiceId)?.description
                  : customVoiceId ? `Custom voice ID: ${customVoiceId}` : 'Enter a custom ElevenLabs voice ID above.'}
              </span>
              <span className="text-xs text-orange-600 block mt-2 font-semibold">
                ⚠️ Voice availability may vary. If one doesn't work, try another voice option.
              </span>
            </div>

            <button
              className={`w-full bg-green-600 text-white px-6 py-3 rounded-lg transition-all flex items-center justify-center gap-2 font-semibold ${audioLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-green-700'}`}
              onClick={handleGenerateAudio}
              disabled={audioLoading}
            >
              {audioLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  🎵 Creating Your Voiceover...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  🎤 Generate Captivating Voiceover
                </>
              )}
            </button>
          </div>

          {/* Show voiceover text right below the audio button */}
          {voiceText && (
            <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-xl">
              <h3 className="text-lg font-semibold text-green-800 mb-3">🎭 Voiceover Script Ready</h3>
              <div className="p-4 bg-white rounded-lg border">
                <pre className="whitespace-pre-wrap text-green-900 font-medium">{voiceText}</pre>
              </div>
            </div>
          )}

          {audioUrl && (
            <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-xl">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">🎵 Your Voiceover Audio</h3>
              <audio controls src={audioUrl} className="w-full" />
              <p className="text-sm text-blue-600 mt-2">✨ Listen to your professionally generated voiceover above.</p>
            </div>
          )}

          {voiceText && (
            <div className="flex gap-3">
              <button
                onClick={handleContinue}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all"
              >
                🎬 Continue to Video Generation →
              </button>
              
              <button
                onClick={handleBack}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-all"
              >
                ← Back to Image
              </button>
            </div>
          )}
        </>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center font-semibold">
          {error}
        </div>
      )}
    </div>
  );
} 