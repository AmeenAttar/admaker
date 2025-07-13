'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ScriptGenerator() {
  const router = useRouter();
  
  // Script Generation State
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState('');
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Load session ID from localStorage on component mount
  useEffect(() => {
    const storedSessionId = localStorage.getItem('sessionId');
    if (storedSessionId) {
      setSessionId(storedSessionId);
    }
  }, []);

  // Preset options
  const SCRIPT_FORMATS = [
    { value: '15-second', label: '15‑second spot', description: 'Very short burst: brand/product intro, quick hook, ending with CTA. Ideal for social or TV where brevity matters.' },
    { value: '30-second', label: '30‑second spot', description: 'Standard commercial length. Enables a basic narrative (problem → solution → CTA), most commonly purchased time slot.' },
    { value: '60-second', label: '60‑second (or longer)', description: 'Infomercial or longer-form storytelling. Useful when you need explanation or emotion-building.' },
  ];
  
  const CREATIVE_STRATEGIES = [
    { value: 'informational', label: 'Informational / Generic', description: 'Straightforward description or category messaging; best for new products/categories.' },
    { value: 'usp', label: 'Unique Selling Proposition (USP)', description: 'Focuses on one standout feature/benefit that matters to consumers.' },
    { value: 'comparative', label: 'Comparative', description: 'Direct comparison vs. competitor(s)—used cautiously to avoid legal or backlash.' },
    { value: 'transformational', label: 'Transformational', description: 'Emotional appeal that portrays how the product changes a consumer\'s life.' },
    { value: 'brand-image', label: 'Brand‑image / Lifestyle', description: 'Associates product with a desired lifestyle, identity, or status.' },
    { value: 'use-occasion', label: 'Use‑occasion', description: 'Frames product around a specific use‑case or moment (e.g., "for your morning commute").' },
  ];
  
  const EXECUTION_STYLES = [
    { value: 'flashy', label: 'Flashy / Energetic Promo', description: 'Fast pacing, upbeat tone, dynamic visuals or punchy audio. Great for impulse buys or social ads.' },
    { value: 'story-driven', label: 'Story‑driven / Narrative', description: 'Build an emotional journey: character, conflict, resolution using the product.' },
    { value: 'host-read', label: 'Host‑read / Endorsement style', description: 'A familiar voice or influencer gives a personal recommendation.' },
    { value: 'demo', label: 'Demo or Tutorial', description: 'Product in action with walkthrough or explanation (common for tech or complex products).' },
    { value: 'jingle', label: 'Jingle / Musical hook', description: 'Uses music, slogan or rhyme to boost recall (think jingles or catchy slogans).' },
  ];

  const [scriptFormat, setScriptFormat] = useState(SCRIPT_FORMATS[0].value);
  const [customScriptFormat, setCustomScriptFormat] = useState('');
  const [creativeStrategy, setCreativeStrategy] = useState(CREATIVE_STRATEGIES[0].value);
  const [customCreativeStrategy, setCustomCreativeStrategy] = useState('');
  const [executionStyle, setExecutionStyle] = useState(EXECUTION_STYLES[0].value);
  const [customExecutionStyle, setCustomExecutionStyle] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    const formData = new FormData();
    if (prompt) formData.append('prompt', prompt);
    if (image) formData.append('image', image);
    if (video) formData.append('video', video);
    if (sessionId) formData.append('session_id', sessionId);
    formData.append('script_format', scriptFormat === 'custom' ? customScriptFormat : scriptFormat);
    formData.append('creative_strategy', creativeStrategy === 'custom' ? customCreativeStrategy : creativeStrategy);
    formData.append('execution_style', executionStyle === 'custom' ? customExecutionStyle : executionStyle);

    try {
      const res = await fetch('http://localhost:8000/script', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult(data);
      
      // Store script result in localStorage for other pages
      localStorage.setItem('scriptResult', JSON.stringify(data));
    } catch (err: any) {
      setError(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPrompt('');
    setImage(null);
    setVideo(null);
    setResult(null);
    setError(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleContinue = () => {
    if (result?.script) {
      router.push('/image');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">✨ Craft Your Winning Message</h1>
        <p className="text-gray-600 text-lg">Transform your product into a compelling story that resonates with your audience. Our AI will create a script that converts viewers into customers.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
        <div>
          <label className="font-medium block mb-1">📏 Script Duration:</label>
          <select
            value={scriptFormat}
            onChange={e => setScriptFormat(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white shadow-sm transition-all duration-200 hover:border-gray-400"
            disabled={loading}
          >
            {SCRIPT_FORMATS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
            <option value="custom">Custom...</option>
          </select>
          {scriptFormat === 'custom' && (
            <input
              type="text"
              value={customScriptFormat}
              onChange={e => setCustomScriptFormat(e.target.value)}
              className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white shadow-sm transition-all duration-200 hover:border-gray-400"
              placeholder="Enter custom script format"
              disabled={loading}
            />
          )}
          <span className="text-xs text-gray-500 block mt-1">
            {scriptFormat !== 'custom'
              ? SCRIPT_FORMATS.find(opt => opt.value === scriptFormat)?.description
              : customScriptFormat ? `Custom: ${customScriptFormat}` : 'Enter your custom format above.'}
          </span>
        </div>

        <div>
          <label className="font-medium block mb-1">🎯 Creative Strategy & Tone:</label>
          <select
            value={creativeStrategy}
            onChange={e => setCreativeStrategy(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white shadow-sm transition-all duration-200 hover:border-gray-400"
            disabled={loading}
          >
            {CREATIVE_STRATEGIES.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
            <option value="custom">Custom...</option>
          </select>
          {creativeStrategy === 'custom' && (
            <input
              type="text"
              value={customCreativeStrategy}
              onChange={e => setCustomCreativeStrategy(e.target.value)}
              className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white shadow-sm transition-all duration-200 hover:border-gray-400"
              placeholder="Enter custom strategy/tone"
              disabled={loading}
            />
          )}
          <span className="text-xs text-gray-500 block mt-1">
            {creativeStrategy !== 'custom'
              ? CREATIVE_STRATEGIES.find(opt => opt.value === creativeStrategy)?.description
              : customCreativeStrategy ? `Custom: ${customCreativeStrategy}` : 'Enter your custom strategy/tone above.'}
          </span>
        </div>

        <div>
          <label className="font-medium block mb-1">🎬 Creative Execution Style:</label>
          <select
            value={executionStyle}
            onChange={e => setExecutionStyle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white shadow-sm transition-all duration-200 hover:border-gray-400"
            disabled={loading}
          >
            {EXECUTION_STYLES.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
            <option value="custom">Custom...</option>
          </select>
          {executionStyle === 'custom' && (
            <input
              type="text"
              value={customExecutionStyle}
              onChange={e => setCustomExecutionStyle(e.target.value)}
              className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white shadow-sm transition-all duration-200 hover:border-gray-400"
              placeholder="Enter custom execution style"
              disabled={loading}
            />
          )}
          <span className="text-xs text-gray-500 block mt-1">
            {executionStyle !== 'custom'
              ? EXECUTION_STYLES.find(opt => opt.value === executionStyle)?.description
              : customExecutionStyle ? `Custom: ${customExecutionStyle}` : 'Enter your custom execution style above.'}
          </span>
        </div>

        <div>
          <label className="font-medium block mb-1">💡 Creative Inspiration <span className="text-gray-400">(optional)</span></label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            placeholder="Share specific ideas, target audience insights, or unique selling points you want to highlight..."
            rows={3}
            disabled={loading}
          />
        </div>

        <div>
          <label className="font-medium block mb-1">🖼️ Reference Image <span className="text-gray-400">(optional)</span></label>
          <input
            type="file"
            accept="image/*"
            ref={imageInputRef}
            onChange={e => setImage(e.target.files?.[0] || null)}
            className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={loading}
          />
          <span className="text-xs text-gray-500 block mt-1">📸 Upload a reference image to inspire the visual direction of your ad.</span>
        </div>

        <div>
          <label className="font-medium block mb-1">🎥 Reference Video <span className="text-gray-400">(optional)</span></label>
          <input
            type="file"
            accept="video/*"
            ref={videoInputRef}
            onChange={e => setVideo(e.target.files?.[0] || null)}
            className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={loading}
          />
          <span className="text-xs text-gray-500 block mt-1">🎬 Share a video that captures the mood or style you're aiming for.</span>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className={`flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg transition-all flex items-center justify-center gap-2 font-semibold ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            disabled={loading || (!sessionId && !image && !video)}
          >
            {loading && (
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            )}
            {loading ? '✨ Crafting Your Message...' : '✨ Generate Winning Script'}
          </button>
          
          <button
            type="button"
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all"
            onClick={resetForm}
            disabled={loading}
          >
            Reset
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center font-semibold">
          ❌ {error}
        </div>
      )}

      {/* Show generated script directly below the button */}
      {result && (
        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-blue-800 mb-2">🎉 Your Compelling Script is Ready!</h3>
            <p className="text-sm text-blue-600 mb-2">Session ID: <span className="font-mono">{result.session_id}</span></p>
          </div>
          
          <div className="mb-4 p-4 bg-white rounded-lg border">
            <pre className="whitespace-pre-wrap text-gray-800 font-medium">{result.script}</pre>
          </div>
          
          {result.image_caption && (
            <div className="mb-2 p-3 bg-white rounded border">
              <strong className="text-blue-800">🖼️ Image Caption:</strong> 
              <span className="text-gray-700 ml-2">{result.image_caption}</span>
            </div>
          )}
          
          {result.video_caption && (
            <div className="mb-4 p-3 bg-white rounded border">
              <strong className="text-blue-800">🎥 Video Caption:</strong> 
              <span className="text-gray-700 ml-2">{result.video_caption}</span>
            </div>
          )}
          
          <button
            onClick={handleContinue}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
          >
            🎤 Bring Your Script to Life with Voice →
          </button>
        </div>
      )}
    </div>
  );
} 