'use client';

import { useState, useRef, useEffect } from 'react';

export default function ScriptTest() {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [voiceText, setVoiceText] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState('');
  const [productUploadSuccess, setProductUploadSuccess] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  // Optimized Image Generation State
  const [optimizedImageLoading, setOptimizedImageLoading] = useState(false);
  const [optimizedImageResult, setOptimizedImageResult] = useState<any>(null);
  const [userImageInput, setUserImageInput] = useState('');
  const [imageStyle, setImageStyle] = useState('realistic');
  const [imageTone, setImageTone] = useState('professional');
  const [imageSize, setImageSize] = useState('1024x1024');

  // Two-step Image Generation State
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [promptGenerationLoading, setPromptGenerationLoading] = useState(false);
  const [imageGenerationLoading, setImageGenerationLoading] = useState(false);

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

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Load avatars and voices on component mount
  useEffect(() => {
    loadAvailableAvatars();
    loadAvailableVoices();
  }, []);

  // --- Product Upload State ---
  const [productName, setProductName] = useState('catnip for dogs');
  const [productDescription, setProductDescription] = useState('');
  const [productImages, setProductImages] = useState<FileList | null>(null);
  const [productVideo, setProductVideo] = useState<File | null>(null);
  const [productVoice, setProductVoice] = useState<File | null>(null);
  const [productLoading, setProductLoading] = useState(false);
  const [productResult, setProductResult] = useState<any>(null);
  const [productError, setProductError] = useState<string | null>(null);
  const productImageInputRef = useRef<HTMLInputElement>(null);
  const productVideoInputRef = useRef<HTMLInputElement>(null);
  const productVoiceInputRef = useRef<HTMLInputElement>(null);

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
    { value: 'transformational', label: 'Transformational', description: 'Emotional appeal that portrays how the product changes a consumer’s life.' },
    { value: 'brand-image', label: 'Brand‑image / Lifestyle', description: 'Associates product with a desired lifestyle, identity, or status.' },
    { value: 'use-occasion', label: 'Use‑occasion', description: 'Frames product around a specific use‑case or moment (e.g., “for your morning commute”).' },
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    setAudioUrl(null);

    const formData = new FormData();
    if (prompt) formData.append('prompt', prompt);
    if (image) formData.append('image', image);
    if (video) formData.append('video', video);
    if (sessionId) formData.append('session_id', sessionId);
    formData.append('script_format', scriptFormat === 'custom' ? customScriptFormat : scriptFormat);
    formData.append('creative_strategy', creativeStrategy === 'custom' ? customCreativeStrategy : creativeStrategy);
    formData.append('execution_style', executionStyle === 'custom' ? customExecutionStyle : executionStyle);
    formData.append('voice_id', voiceId === 'custom' ? customVoiceId : voiceId);

    try {
      const res = await fetch('http://localhost:8000/script', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!result?.script) return;
    setAudioLoading(true);
    setAudioUrl(null);
    setVoiceText(null);
    setError(null);
    try {
      const res = await fetch('http://localhost:8000/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: result.script,
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
    } catch (err: any) {
      setError(err.message || 'Audio generation error');
    } finally {
      setAudioLoading(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductLoading(true);
    setProductResult(null);
    setProductError(null);
    setProductUploadSuccess(false);
    const formData = new FormData();
    formData.append('name', productName);
    if (productDescription) formData.append('description', productDescription);
    if (productImages) {
      Array.from(productImages).forEach((file) => {
        formData.append('images', file);
      });
    }
    if (productVideo) formData.append('video', productVideo);
    if (productVoice) formData.append('voice', productVoice);
    try {
      const res = await fetch('http://localhost:8000/upload-product', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setProductResult(data);
      setSessionId(data.session_id || '');
      setProductUploadSuccess(true);
      setTimeout(() => setProductUploadSuccess(false), 2000);
    } catch (err: any) {
      setProductError(err.message || 'Error');
    } finally {
      setProductLoading(false);
    }
  };

  const handleGenerateOptimizedPrompt = async () => {
    setPromptGenerationLoading(true);
    setOptimizedPrompt('');
    setError(null);
    
    const preset = IMAGE_PRESETS.find(opt => opt.value === imagePreset);
    let prompt = '';
    if (preset) {
      prompt = preset.prompt.replace('[Product Name]', productName || 'the product');
    }
    const promptParts = [prompt];
    if (creativeStrategy !== 'custom') {
      const strat = CREATIVE_STRATEGIES.find(opt => opt.value === creativeStrategy);
      if (strat) promptParts.push(`Tone: ${strat.label}`);
    } else if (customCreativeStrategy) {
      promptParts.push(`Tone: ${customCreativeStrategy}`);
    }
    const finalPrompt = promptParts.join('. ');
    
    try {
      const optimizeRes = await fetch('http://localhost:8000/image/optimized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_input: finalPrompt,
          style: 'realistic',
          tone: creativeStrategy === 'custom' ? 'professional' : creativeStrategy,
          size: '1024x1024'
        }),
      });
      
      if (!optimizeRes.ok) throw new Error(await optimizeRes.text());
      const optimizedData = await optimizeRes.json();
      
      setOptimizedPrompt(optimizedData.optimized_prompt);
      setIsEditingPrompt(true);
    } catch (err: any) {
      setError(err.message || 'Prompt optimization error');
    } finally {
      setPromptGenerationLoading(false);
    }
  };

  const handleGenerateImageWithPrompt = async () => {
    if (!optimizedPrompt.trim()) {
      setError('Please generate and review the prompt first');
      return;
    }
    
    setImageGenerationLoading(true);
    setGeneratedImageUrl(null);
    setError(null);
    
    try {
      const imageRes = await fetch('http://localhost:8000/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: optimizedPrompt,
          size: '1024x1024',
          quality: 'standard'
        }),
      });
      
      if (!imageRes.ok) throw new Error(await imageRes.text());
      const imageData = await imageRes.json();
      
      setGeneratedImageUrl(imageData.image_url);
    } catch (err: any) {
      setError(err.message || 'Image generation error');
    } finally {
      setImageGenerationLoading(false);
    }
  };

  const handleGenerateOptimizedImage = async () => {
    if (!userImageInput.trim()) {
      setError('Please enter a description for the image');
      return;
    }
    
    setOptimizedImageLoading(true);
    setOptimizedImageResult(null);
    setError(null);
    
    try {
      const res = await fetch('http://localhost:8000/image/optimized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_input: userImageInput,
          style: imageStyle,
          tone: imageTone,
          size: imageSize,
          quality: 'standard'
        }),
      });
      
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setOptimizedImageResult(data);
    } catch (err: any) {
      setError(err.message || 'Optimized image generation error');
    } finally {
      setOptimizedImageLoading(false);
    }
  };

  const resetForm = () => {
    setPrompt('');
    setImage(null);
    setVideo(null);
    setResult(null);
    setError(null);
    setAudioUrl(null);
    setOptimizedPrompt('');
    setIsEditingPrompt(false);
    setGeneratedImageUrl(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const resetImageGeneration = () => {
    setOptimizedPrompt('');
    setIsEditingPrompt(false);
    setGeneratedImageUrl(null);
    setError(null);
  };

  const handleGenerateVideo = async () => {
    if (!result?.script) {
      setError('Please generate a script first');
      return;
    }
    
    // Use voiceover text if available, otherwise use the raw script
    const videoText = voiceText || result.script;
    
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

  const resetProductForm = () => {
    setProductName('catnip for dogs');
    setProductDescription('');
    setProductImages(null);
    setProductVideo(null);
    setProductVoice(null);
    setProductResult(null);
    setProductError(null);
    if (productImageInputRef.current) productImageInputRef.current.value = '';
    if (productVideoInputRef.current) productVideoInputRef.current.value = '';
    if (productVoiceInputRef.current) productVoiceInputRef.current.value = '';
  };

  const IMAGE_PRESETS = [
    {
      value: 'product',
      label: 'Product Focus',
      description: 'Clean, high-contrast image of the product on a simple background.',
      prompt: 'A professional product photo of [Product Name] on a clean white background, well-lit, high contrast.'
    },
    {
      value: 'lifestyle',
      label: 'Lifestyle/Contextual',
      description: 'Product in use, showing people or a setting that matches the target audience.',
      prompt: '[Product Name] being used by a happy person in a modern home environment, bright and inviting.'
    },
    {
      value: 'emotional',
      label: 'Emotional/Storytelling',
      description: 'Scene that evokes a specific emotion or story.',
      prompt: 'A joyful scene featuring [Product Name], vibrant colors, people smiling, energetic atmosphere.'
    },
    {
      value: 'minimalist',
      label: 'Minimalist/Modern',
      description: 'Simple, bold, and modern design with lots of negative space.',
      prompt: 'Minimalist ad for [Product Name], bold text, modern design, lots of white space.'
    },
    {
      value: 'bold',
      label: 'Bold/Colorful',
      description: 'Eye-catching, colorful, and dynamic composition.',
      prompt: 'A bold, colorful ad for [Product Name], dynamic layout, attention-grabbing.'
    },
    {
      value: 'testimonial',
      label: 'Testimonial/Quote',
      description: 'Product with a customer quote or testimonial overlay.',
      prompt: '[Product Name] with a customer testimonial overlay, clean and trustworthy design.'
    },
    {
      value: 'seasonal',
      label: 'Seasonal/Occasion',
      description: 'Themed for a holiday or event.',
      prompt: '[Product Name] in a festive Christmas setting, cozy and warm.'
    }
  ];
  const [imagePreset, setImagePreset] = useState(IMAGE_PRESETS[0].value);

  return (
    <div className="max-w-lg mx-auto mt-12 p-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Product Upload</h2>
      <form onSubmit={handleProductSubmit} className="flex flex-col gap-5 mb-8">
        <label className="font-medium">
          Product Name:
          <input
            type="text"
            value={productName}
            onChange={e => setProductName(e.target.value)}
            className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Product name"
            disabled={productLoading}
          />
        </label>
        <label className="font-medium">
          Description (optional):
          <input
            type="text"
            value={productDescription}
            onChange={e => setProductDescription(e.target.value)}
            className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Product description"
            disabled={productLoading}
          />
        </label>
        <label className="font-medium">
          Images (you can select multiple):
          <input
            type="file"
            accept="image/*"
            multiple
            ref={productImageInputRef}
            onChange={e => setProductImages(e.target.files)}
            className="w-full mt-1"
            disabled={productLoading}
          />
        </label>
        <label className="font-medium">
          Video (optional):
          <input
            type="file"
            accept="video/*"
            ref={productVideoInputRef}
            onChange={e => setProductVideo(e.target.files?.[0] || null)}
            className="w-full mt-1"
            disabled={productLoading}
          />
        </label>
        <label className="font-medium">
          Voice (optional):
          <input
            type="file"
            accept="audio/*"
            ref={productVoiceInputRef}
            onChange={e => setProductVoice(e.target.files?.[0] || null)}
            className="w-full mt-1"
            disabled={productLoading}
          />
        </label>
        <button
          type="submit"
          className={`bg-blue-600 text-white px-4 py-2 rounded transition-all flex items-center justify-center gap-2 ${
            productLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
          disabled={productLoading}
        >
          {productLoading && (
            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          )}
          {productLoading ? 'Uploading...' : 'Upload Product'}
          {!productLoading && productUploadSuccess && (
            <svg className="h-5 w-5 text-green-500 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <button
          type="button"
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-all"
          onClick={resetProductForm}
          disabled={productLoading}
        >
          Reset
        </button>
      </form>
      {productError && (
        <div className="text-red-600 mb-6 text-center font-semibold">{productError}</div>
      )}
      {(productResult?.assets?.images?.length || productResult?.assets?.video || productResult?.assets?.voice) && (
        <div className="mb-8 p-4 bg-gray-50 rounded border">
          {productResult.assets?.images?.length > 0 && (
            <div className="mb-2">
              <strong>Images:</strong>
              <ul className="list-disc ml-6">
                {productResult.assets.images.map((img: string, idx: number) => {
                  const originalName = img.split('_').slice(3).join('_');
                  return <li key={idx} className="break-all text-xs">{originalName}</li>;
                })}
              </ul>
            </div>
          )}
          {productResult.assets?.video && (
            <div className="mb-2"><strong>Video:</strong> <span className="break-all text-xs">{productResult.assets.video.split('_').slice(2).join('_')}</span></div>
          )}
          {productResult.assets?.voice && (
            <div><strong>Voice:</strong> <span className="break-all text-xs">{productResult.assets.voice.split('_').slice(2).join('_')}</span></div>
          )}
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6 text-center">Ad Script Generator</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label className="font-medium">
          Script Format:
          <select
            value={scriptFormat}
            onChange={e => setScriptFormat(e.target.value)}
            className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
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
              className="w-full mt-2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter custom script format"
              disabled={loading}
            />
          )}
          <span className="text-xs text-gray-500 block mt-1">
            {scriptFormat !== 'custom'
              ? SCRIPT_FORMATS.find(opt => opt.value === scriptFormat)?.description
              : customScriptFormat ? `Custom: ${customScriptFormat}` : 'Enter your custom format above.'}
          </span>
        </label>
        <label className="font-medium">
          Creative Strategy / Tone:
          <select
            value={creativeStrategy}
            onChange={e => setCreativeStrategy(e.target.value)}
            className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
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
              className="w-full mt-2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter custom strategy/tone"
              disabled={loading}
            />
          )}
          <span className="text-xs text-gray-500 block mt-1">
            {creativeStrategy !== 'custom'
              ? CREATIVE_STRATEGIES.find(opt => opt.value === creativeStrategy)?.description
              : customCreativeStrategy ? `Custom: ${customCreativeStrategy}` : 'Enter your custom strategy/tone above.'}
          </span>
        </label>
        <label className="font-medium">
          Creative Execution Style:
          <select
            value={executionStyle}
            onChange={e => setExecutionStyle(e.target.value)}
            className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
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
              className="w-full mt-2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter custom execution style"
              disabled={loading}
            />
          )}
          <span className="text-xs text-gray-500 block mt-1">
            {executionStyle !== 'custom'
              ? EXECUTION_STYLES.find(opt => opt.value === executionStyle)?.description
              : customExecutionStyle ? `Custom: ${customExecutionStyle}` : 'Enter your custom execution style above.'}
          </span>
        </label>
        <label className="font-medium">
          Voice:
          <select
            value={voiceId}
            onChange={e => setVoiceId(e.target.value)}
            className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={loading}
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
              className="w-full mt-2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter custom ElevenLabs voice ID"
              disabled={loading}
            />
          )}
          <span className="text-xs text-gray-500 block mt-1">
            {voiceId !== 'custom'
              ? VOICES.find(v => v.id === voiceId)?.description
              : customVoiceId ? `Custom voice ID: ${customVoiceId}` : 'Enter a custom ElevenLabs voice ID above.'}
          </span>
        </label>
        <label className="font-medium">
          Prompt (optional):
          <input
            type="text"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter your ad prompt (optional)"
            disabled={loading}
          />
        </label>
        <label className="font-medium">
          Image (optional):
          <input
            type="file"
            accept="image/*"
            ref={imageInputRef}
            onChange={e => setImage(e.target.files?.[0] || null)}
            className="w-full mt-1"
            disabled={loading}
          />
        </label>
        <label className="font-medium">
          Video (optional):
          <input
            type="file"
            accept="video/*"
            ref={videoInputRef}
            onChange={e => setVideo(e.target.files?.[0] || null)}
            className="w-full mt-1"
            disabled={loading}
          />
        </label>
        <button
          type="submit"
          className={`bg-blue-600 text-white px-4 py-2 rounded transition-all flex items-center justify-center gap-2 ${
            loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
          disabled={loading || (!sessionId && !image && !video)}
        >
          {loading && (
            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          )}
          {loading ? 'Generating...' : 'Generate Script'}
        </button>
        <button
          type="button"
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-all"
          onClick={resetForm}
          disabled={loading}
        >
          Reset
        </button>
        <label className="font-medium">
          Image Style Preset:
          <select
            value={imagePreset}
            onChange={e => setImagePreset(e.target.value)}
            className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
            disabled={imageLoading}
          >
            {IMAGE_PRESETS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <span className="text-xs text-gray-500 block mt-1">
            {IMAGE_PRESETS.find(opt => opt.value === imagePreset)?.description}
          </span>
        </label>
        {/* Show the image generation prompt for transparency */}
        {(() => {
          const preset = IMAGE_PRESETS.find(opt => opt.value === imagePreset);
          let prompt = '';
          if (preset) {
            prompt = preset.prompt.replace('[Product Name]', productName || 'the product');
          }
          const promptParts = [prompt];
          if (creativeStrategy !== 'custom') {
            const strat = CREATIVE_STRATEGIES.find(opt => opt.value === creativeStrategy);
            if (strat) promptParts.push(`Tone: ${strat.label}`);
          } else if (customCreativeStrategy) {
            promptParts.push(`Tone: ${customCreativeStrategy}`);
          }
          const finalPrompt = promptParts.join('. ');
          return finalPrompt ? (
            <div className="bg-gray-50 border rounded p-2 my-2 text-xs text-gray-700">
              <strong>Image Generation Prompt:</strong>
              <div className="mt-1 whitespace-pre-wrap">{finalPrompt}</div>
            </div>
          ) : null;
        })()}
        <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
          <p className="text-sm text-blue-800">
            <strong>💡 Two-Step AI Enhancement:</strong> First generate an optimized prompt with ChatGPT 4.0, then edit it if needed, and finally generate the image with GPT-Image-1.
          </p>
        </div>
        
        {/* Step 1: Generate Optimized Prompt */}
        <button
          type="button"
          className={`bg-blue-600 text-white px-4 py-2 rounded transition-all flex items-center justify-center gap-2 mb-4 ${
            promptGenerationLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
          onClick={handleGenerateOptimizedPrompt}
          disabled={promptGenerationLoading || !result?.script}
        >
          {promptGenerationLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Generating AI Prompt...
            </>
          ) : (
            <>
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Step 1: Generate AI-Optimized Prompt
            </>
          )}
        </button>

        {/* Step 2: Editable Prompt Area */}
        {isEditingPrompt && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Step 2: Review & Edit Prompt</h4>
            <p className="text-sm text-yellow-700 mb-3">
              Review the AI-generated prompt below. You can edit it to better match your vision before generating the image.
            </p>
            <textarea
              value={optimizedPrompt}
              onChange={(e) => setOptimizedPrompt(e.target.value)}
              className="w-full p-3 border border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
              rows={4}
              placeholder="AI-optimized prompt will appear here..."
            />
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                className="text-sm text-yellow-700 underline hover:text-yellow-800"
                onClick={() => setIsEditingPrompt(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="text-sm text-red-600 underline hover:text-red-700"
                onClick={resetImageGeneration}
              >
                Reset All
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Generate Image */}
        <button
          type="button"
          className={`bg-purple-600 text-white px-4 py-2 rounded transition-all flex items-center justify-center gap-2 ${
            imageGenerationLoading || !optimizedPrompt ? 'opacity-60 cursor-not-allowed' : 'hover:bg-purple-700'
          }`}
          onClick={handleGenerateImageWithPrompt}
          disabled={imageGenerationLoading || !optimizedPrompt}
        >
          {imageGenerationLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Generating Image...
            </>
          ) : (
            <>
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Step 3: Generate Image
            </>
          )}
        </button>
        {generatedImageUrl && (
          <div className="mt-6 flex flex-col items-center">
            {/* Show the final prompt used */}
            <div className="mb-4 w-full p-3 bg-green-50 rounded border-l-4 border-green-400">
              <h4 className="font-semibold text-green-800 mb-2">Final Prompt Used:</h4>
              <div className="text-sm text-green-700 whitespace-pre-wrap">
                {optimizedPrompt}
              </div>
            </div>
            <img src={generatedImageUrl} alt="Generated Ad" className="rounded shadow max-w-full max-h-96" />
            <a
              href={generatedImageUrl}
              download="ad-image.png"
              className="mt-2 text-blue-600 underline text-sm"
            >
              Download Image
            </a>
          </div>
        )}
      </form>
      {error && (
        <div className="text-red-600 mt-6 text-center font-semibold">{error}</div>
      )}
      {result && (
        <div className="mt-8 p-4 bg-gray-50 rounded border">
          <div className="mb-2 text-sm text-gray-500">Session ID: <span className="font-mono">{result.session_id}</span></div>
          <div className="mb-4">
            <strong className="block mb-1">Script:</strong>
            <pre className="whitespace-pre-wrap text-gray-800">{result.script}</pre>
          </div>
          {result.image_caption && (
            <div className="mb-2">
              <strong>Image Caption:</strong> <span className="text-gray-700">{result.image_caption}</span>
            </div>
          )}
          {result.video_caption && (
            <div>
              <strong>Video Caption:</strong> <span className="text-gray-700">{result.video_caption}</span>
            </div>
          )}
          <div className="mt-4">
            <button
              className={`bg-green-600 text-white px-4 py-2 rounded transition-all flex items-center justify-center gap-2 ${audioLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-green-700'}`}
              onClick={handleGenerateAudio}
              disabled={audioLoading}
            >
              {audioLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : null}
              {audioLoading ? 'Generating Audio...' : 'Generate Audio'}
            </button>
            {voiceText && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                <strong>Voiceover Text:</strong>
                <div className="mt-1 whitespace-pre-wrap text-green-900">{voiceText}</div>
              </div>
            )}
            {audioUrl && (
              <audio controls src={audioUrl} className="mt-4 w-full" />
            )}
          </div>
        </div>
      )}

      {/* Video Generation Section */}
      {result && (
        <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
          <h3 className="text-xl font-bold mb-4 text-green-800">🎬 Talking Avatar Video Generation</h3>
          <p className="text-sm text-green-700 mb-4">
            Create a professional talking avatar video using your generated script and voice.
            {!voiceText && (
              <span className="block mt-2 text-orange-700">
                💡 Tip: Generate audio first to use optimized voiceover text, or the raw script will be used.
              </span>
            )}
            <span className="block mt-2 text-blue-700">
              📝 Note: HeyGen uses its own voice system, separate from ElevenLabs voices used for audio generation.
            </span>
          </p>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="font-medium">
                Avatar:
                <select
                  value={selectedAvatar}
                  onChange={e => setSelectedAvatar(e.target.value)}
                  className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                  disabled={videoGenerationLoading || avatarsLoading}
                >
                  {avatarsLoading ? (
                    <option value="">Loading avatars...</option>
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
              </label>
              
              <label className="font-medium">
                HeyGen Voice:
                <select
                  value={selectedHeyGenVoice}
                  onChange={e => setSelectedHeyGenVoice(e.target.value)}
                  className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                  disabled={videoGenerationLoading || voicesLoading}
                >
                  {voicesLoading ? (
                    <option value="">Loading voices...</option>
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
                  <div className="text-xs text-gray-500 mt-1">Loading available voices...</div>
                )}
                {!voicesLoading && availableVoices.length === 0 && (
                  <div className="text-xs text-red-500 mt-1">No voices available. Please check your HeyGen API key.</div>
                )}
              </label>
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={loadAvailableAvatars}
                className="bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-300 transition-all"
                disabled={videoGenerationLoading || avatarsLoading}
              >
                {avatarsLoading ? 'Loading...' : 'Refresh Avatars'}
              </button>
              
              <button
                type="button"
                onClick={loadAvailableVoices}
                className="bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-300 transition-all"
                disabled={videoGenerationLoading || voicesLoading}
              >
                {voicesLoading ? 'Loading...' : 'Refresh Voices'}
              </button>
            </div>
            
            <button
              type="button"
              className={`w-full bg-green-600 text-white px-6 py-3 rounded-lg transition-all flex items-center justify-center gap-2 font-semibold ${
                videoGenerationLoading || !selectedAvatar || avatarsLoading || !selectedHeyGenVoice || voicesLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-green-700'
              }`}
              onClick={handleGenerateVideo}
              disabled={videoGenerationLoading || !selectedAvatar || avatarsLoading || !selectedHeyGenVoice || voicesLoading}
            >
              {videoGenerationLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Generating Video...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Talking Avatar Video
                </>
              )}
            </button>
            
            {videoStatus && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                <strong>Status:</strong> {videoStatus}
              </div>
            )}
            
            {generatedVideoUrl && (
              <div className="mt-4">
                <h4 className="font-semibold text-green-800 mb-2">Generated Video:</h4>
                <video 
                  controls 
                  src={generatedVideoUrl} 
                  className="w-full rounded-lg shadow-lg" 
                />
                <a
                  href={generatedVideoUrl}
                  download="talking-avatar-video.mp4"
                  className="mt-2 inline-block text-green-600 underline text-sm font-medium"
                >
                  Download Video
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Optimized Image Generation Section */}
      <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">AI-Powered Image Generation</h2>
        <p className="text-center text-gray-600 mb-6">
          Let ChatGPT 4.0 create the perfect image prompt for you, then generate high-quality images with GPT-Image-1
        </p>
        
        <div className="space-y-4">
          <label className="font-medium">
            Describe what you want to see:
            <textarea
              value={userImageInput}
              onChange={e => setUserImageInput(e.target.value)}
              className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              placeholder="e.g., A modern smartphone on a sleek desk with soft lighting, perfect for a tech advertisement"
              rows={3}
              disabled={optimizedImageLoading}
            />
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="font-medium">
              Visual Style:
              <select
                value={imageStyle}
                onChange={e => setImageStyle(e.target.value)}
                className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={optimizedImageLoading}
              >
                <option value="realistic">Realistic</option>
                <option value="artistic">Artistic</option>
                <option value="minimalist">Minimalist</option>
                <option value="vintage">Vintage</option>
                <option value="modern">Modern</option>
                <option value="fantasy">Fantasy</option>
              </select>
            </label>
            
            <label className="font-medium">
              Tone/Mood:
              <select
                value={imageTone}
                onChange={e => setImageTone(e.target.value)}
                className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={optimizedImageLoading}
              >
                <option value="professional">Professional</option>
                <option value="fun">Fun & Playful</option>
                <option value="luxury">Luxury</option>
                <option value="casual">Casual</option>
                <option value="dramatic">Dramatic</option>
                <option value="peaceful">Peaceful</option>
              </select>
            </label>
            
            <label className="font-medium">
              Image Size:
              <select
                value={imageSize}
                onChange={e => setImageSize(e.target.value)}
                className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={optimizedImageLoading}
              >
                <option value="1024x1024">Square (1024x1024)</option>
                <option value="1792x1024">Landscape (1792x1024)</option>
                <option value="1024x1792">Portrait (1024x1792)</option>
              </select>
            </label>
          </div>
          
          <button
            type="button"
            className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg transition-all flex items-center justify-center gap-2 font-semibold ${
              optimizedImageLoading ? 'opacity-60 cursor-not-allowed' : 'hover:from-blue-700 hover:to-purple-700'
            }`}
            onClick={handleGenerateOptimizedImage}
            disabled={optimizedImageLoading}
          >
            {optimizedImageLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
            {optimizedImageLoading ? 'Generating with AI...' : 'Generate AI-Optimized Image'}
          </button>
        </div>
        
        {optimizedImageResult && (
          <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
            <div className="mb-4">
              <h3 className="font-semibold text-blue-800 mb-2">Generated Prompt:</h3>
              <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400 text-sm">
                {optimizedImageResult.optimized_prompt}
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <img 
                src={optimizedImageResult.image_data} 
                alt="AI Generated" 
                className="rounded-lg shadow-lg max-w-full max-h-96" 
              />
              <a
                href={optimizedImageResult.image_data}
                download="ai-generated-image.png"
                className="mt-3 text-blue-600 underline text-sm font-medium"
              >
                Download Image
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}