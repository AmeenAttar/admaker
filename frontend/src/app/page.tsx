'use client';

import { useState, useRef } from 'react';

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

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

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
        body: JSON.stringify({ script: result.script }),
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

  const resetForm = () => {
    setPrompt('');
    setImage(null);
    setVideo(null);
    setResult(null);
    setError(null);
    setAudioUrl(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
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
    </div>
  );
}