'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VideoGenerator() {
  const router = useRouter();
  
  // Video Generation State
  const [videoGenerationLoading, setVideoGenerationLoading] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [selectedHeyGenVoice, setSelectedHeyGenVoice] = useState('');
  const [availableAvatars, setAvailableAvatars] = useState<any[]>([]);
  const [availableVoices, setAvailableVoices] = useState<any[]>([]);
  const [videoStatus, setVideoStatus] = useState<string | null>(null);
  const [avatarsLoading, setAvatarsLoading] = useState(false);
  const [voicesLoading, setVoicesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptResult, setScriptResult] = useState<any>(null);
  const [voiceResult, setVoiceResult] = useState<any>(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedScriptResult = localStorage.getItem('scriptResult');
    const storedVoiceResult = localStorage.getItem('voiceResult');
    
    if (storedScriptResult) {
      setScriptResult(JSON.parse(storedScriptResult));
    }
    if (storedVoiceResult) {
      setVoiceResult(JSON.parse(storedVoiceResult));
    }
    
    // Load avatars and voices on component mount
    loadAvailableAvatars();
    loadAvailableVoices();
  }, []);

  const loadAvailableAvatars = async () => {
    setAvatarsLoading(true);
    try {
      const res = await fetch('http://localhost:8000/video/avatars');
      if (res.ok) {
        const data = await res.json();
        setAvailableAvatars(data.avatars || []);
        // Set a default avatar if available
        if (data.avatars && data.avatars.length > 0) {
          setSelectedAvatar(data.avatars[0].avatar_id);
        }
      }
    } catch (err) {
      console.error('Failed to load avatars:', err);
    } finally {
      setAvatarsLoading(false);
    }
  };

  const loadAvailableVoices = async () => {
    setVoicesLoading(true);
    try {
      const res = await fetch('http://localhost:8000/video/voices');
      if (res.ok) {
        const data = await res.json();
        setAvailableVoices(data.voices || []);
        // Set a default voice if available
        if (data.voices && data.voices.length > 0) {
          setSelectedHeyGenVoice(data.voices[0].voice_id);
        }
      }
    } catch (err) {
      console.error('Failed to load voices:', err);
    } finally {
      setVoicesLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!scriptResult?.script) {
      setError('Please generate a script first');
      return;
    }
    
    // Use voiceover text if available, otherwise use the raw script
    const videoText = voiceResult?.voice_text || scriptResult.script;
    
    if (!videoText) {
      setError('No voiceover text available. Please generate audio first or use the script.');
      return;
    }
    
    setVideoGenerationLoading(true);
    setGeneratedVideoUrl(null);
    setError(null);
    setVideoStatus('Starting video generation...');
    
    try {
      const res = await fetch('http://localhost:8000/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: videoText,
          avatar_id: selectedAvatar,
          voice_id: selectedHeyGenVoice,
          video_format: 'mp4'
        }),
      });
      
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      
      if (data.status === 'completed') {
        setGeneratedVideoUrl(data.video_url);
        setVideoStatus('Video generated successfully!');
        
        // Store video result in localStorage for other pages
        localStorage.setItem('avatarVideoResult', JSON.stringify(data));
      } else {
        setVideoStatus(`Video status: ${data.status}`);
      }
    } catch (err: any) {
      setError(err.message || 'Video generation error');
      setVideoStatus('Video generation failed');
    } finally {
      setVideoGenerationLoading(false);
    }
  };

  const handleContinue = () => {
    if (generatedVideoUrl) {
      router.push('/workflow');
    }
  };

  const handleBack = () => {
    router.push('/voice');
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🎬 Create Your Professional Video</h1>
        <p className="text-gray-600 text-lg">Bring your message to life with a professional talking avatar that delivers your script with perfect lip-sync technology.</p>
      </div>

      {!scriptResult && (
        <div className="mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="text-center">
            <svg className="h-12 w-12 text-yellow-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">📝 Script Required</h3>
            <p className="text-yellow-700 mb-4">You need to create a compelling script first before we can bring it to life with a talking avatar.</p>
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
            <h3 className="text-lg font-semibold text-green-800 mb-2">✨ Ready for Video Generation</h3>
            <div className="mb-4">
              <strong className="text-green-800 block mb-2">📝 Full Script:</strong>
              <div className="p-3 bg-white rounded border max-h-40 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-gray-800 text-sm">{scriptResult.script}</pre>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong className="text-green-800">🎤 Voiceover:</strong> 
                <span className="text-gray-700 ml-2">{voiceResult ? '✨ Available' : 'Not generated'}</span>
              </div>
              <div>
                <strong className="text-green-800">🚀 Status:</strong> 
                <span className="text-gray-700 ml-2">Ready to generate</span>
              </div>
            </div>
          </div>

          <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🎭 Choose Your Avatar & Voice</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="font-medium block mb-1">👤 Select Avatar:</label>
                <select
                  value={selectedAvatar}
                  onChange={e => setSelectedAvatar(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white shadow-sm transition-all duration-200 hover:border-gray-400"
                  disabled={videoGenerationLoading || avatarsLoading}
                >
                  {avatarsLoading ? (
                    <option value="">🔄 Loading avatars...</option>
                  ) : availableAvatars.length === 0 ? (
                    <option value="">No avatars available</option>
                  ) : (
                    availableAvatars.map((avatar, idx) => (
                      <option key={idx} value={avatar.avatar_id}>
                        {avatar.name || avatar.avatar_id}
                      </option>
                    ))
                  )}
                </select>
                {avatarsLoading && (
                  <div className="text-xs text-gray-500 mt-1">Loading available avatars...</div>
                )}
                {!avatarsLoading && availableAvatars.length === 0 && (
                  <div className="text-xs text-red-500 mt-1">No avatars available. Please check your HeyGen API key.</div>
                )}
              </div>
              
              <div>
                <label className="font-medium block mb-1">🎤 HeyGen Voice:</label>
                <select
                  value={selectedHeyGenVoice}
                  onChange={e => setSelectedHeyGenVoice(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white shadow-sm transition-all duration-200 hover:border-gray-400"
                  disabled={videoGenerationLoading || voicesLoading}
                >
                  {voicesLoading ? (
                    <option value="">🔄 Loading voices...</option>
                  ) : availableVoices.length === 0 ? (
                    <option value="">No voices available</option>
                  ) : (
                    availableVoices.map((voice, idx) => (
                      <option key={idx} value={voice.voice_id}>
                        {voice.name || voice.voice_id}
                      </option>
                    ))
                  )}
                </select>
                {voicesLoading && (
                  <div className="text-xs text-gray-500 mt-1">🔄 Loading available voices...</div>
                )}
                {!voicesLoading && availableVoices.length === 0 && (
                  <div className="text-xs text-red-500 mt-1">❌ No voices available. Please check your HeyGen API key.</div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={loadAvailableAvatars}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300 transition-all"
                disabled={videoGenerationLoading || avatarsLoading}
              >
                {avatarsLoading ? '🔄 Loading...' : '🔄 Refresh Avatars'}
              </button>
              
              <button
                type="button"
                onClick={loadAvailableVoices}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300 transition-all"
                disabled={videoGenerationLoading || voicesLoading}
              >
                {voicesLoading ? '🔄 Loading...' : '🔄 Refresh Voices'}
              </button>
            </div>

            <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-400 rounded">
              <span className="text-sm text-green-800">
                <strong>💡 Pro Tip:</strong> Generate audio first to use optimized voiceover text, or the raw script will be used. HeyGen uses its own voice system, separate from ElevenLabs voices used for audio generation.
              </span>
            </div>

            <div className="mb-6 p-4 bg-orange-100 border-l-4 border-orange-400 rounded">
              <span className="text-sm text-orange-800">
                <strong>⚠️ Important:</strong> Some avatars or voices may not be available. If one doesn't work, try refreshing the list or selecting a different option.
              </span>
            </div>
            
            <button
              type="button"
              className={`w-full bg-green-600 text-white px-6 py-3 rounded-lg transition-all flex items-center justify-center gap-2 font-semibold ${videoGenerationLoading || !selectedAvatar || avatarsLoading || !selectedHeyGenVoice || voicesLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-green-700'}`}
              onClick={handleGenerateVideo}
              disabled={videoGenerationLoading || !selectedAvatar || avatarsLoading || !selectedHeyGenVoice || voicesLoading}
            >
              {videoGenerationLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  🎬 Creating Your Avatar Video...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  🎭 Generate Talking Avatar Video
                </>
              )}
            </button>
          </div>

          {videoStatus && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              <strong>🚀 Status:</strong> {videoStatus}
            </div>
          )}
          
          {generatedVideoUrl && (
            <div className="mb-8 p-6 bg-white rounded-xl border border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-4">🎉 Your Avatar Video is Ready!</h3>
              <video 
                controls 
                src={generatedVideoUrl} 
                className="w-full rounded-lg shadow-lg mb-4" 
              />
              <div className="flex gap-3">
                <a
                  href={generatedVideoUrl}
                  download="talking-avatar-video.mp4"
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all text-center"
                >
                  📥 Download Video
                </a>
                
                <button
                  onClick={handleContinue}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                >
                  📊 Continue to Summary →
                </button>
              </div>
            </div>
          )}

          {!generatedVideoUrl && (
            <div className="flex gap-3">
              <button
                onClick={handleBack}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-all"
              >
                ← Back to Voice
              </button>
            </div>
          )}
        </>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center font-semibold">
          ❌ {error}
        </div>
      )}
    </div>
  );
} 