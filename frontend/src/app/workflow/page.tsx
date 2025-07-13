'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WorkflowSummary() {
  const router = useRouter();
  
  // Load all data from localStorage
  const [productData, setProductData] = useState<any>(null);
  const [scriptResult, setScriptResult] = useState<any>(null);
  const [voiceResult, setVoiceResult] = useState<any>(null);
  const [imageResult, setImageResult] = useState<any>(null);
  const [avatarVideoResult, setAvatarVideoResult] = useState<any>(null);

  useEffect(() => {
    // Load all stored data
    const storedProductData = localStorage.getItem('productData');
    const storedScriptResult = localStorage.getItem('scriptResult');
    const storedVoiceResult = localStorage.getItem('voiceResult');
    const storedImageResult = localStorage.getItem('imageResult');
    const storedAvatarVideoResult = localStorage.getItem('avatarVideoResult');
    
    if (storedProductData) setProductData(JSON.parse(storedProductData));
    if (storedScriptResult) setScriptResult(JSON.parse(storedScriptResult));
    if (storedVoiceResult) setVoiceResult(JSON.parse(storedVoiceResult));
    if (storedImageResult) setImageResult(JSON.parse(storedImageResult));
    if (storedAvatarVideoResult) setAvatarVideoResult(JSON.parse(storedAvatarVideoResult));
  }, []);

  const handleStartOver = () => {
    // Clear all localStorage data
    localStorage.removeItem('sessionId');
    localStorage.removeItem('productData');
    localStorage.removeItem('scriptResult');
    localStorage.removeItem('voiceResult');
    localStorage.removeItem('imageResult');
    localStorage.removeItem('avatarVideoResult');
    
    // Navigate back to start
    router.push('/product-upload');
  };

  const handleNavigateTo = (page: string) => {
    router.push(`/${page}`);
  };

  const getStepStatus = (step: string) => {
    switch (step) {
      case 'product':
        return productData ? 'completed' : 'not-started';
      case 'script':
        return scriptResult ? 'completed' : 'not-started';
      case 'voice':
        return voiceResult ? 'completed' : 'not-started';
      case 'image':
        return imageResult ? 'completed' : 'not-started';
      case 'video':
        return avatarVideoResult ? 'completed' : 'not-started';
      default:
        return 'not-started';
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'not-started':
        return (
          <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-12 p-8 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🎉 Your Video Ad Journey Complete!</h1>
        <p className="text-gray-600 text-lg">Review your amazing AI-generated content and see how far you've come in creating your professional video ad.</p>
      </div>

      {/* Workflow Progress */}
      <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">🚀 Your Progress Journey</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: 'product', name: 'Product Upload', page: 'product-upload' },
            { key: 'script', name: 'Script Generation', page: 'script' },
            { key: 'voice', name: 'Voice Generation', page: 'voice' },
            { key: 'image', name: 'Image Generation', page: 'image' },
            { key: 'video', name: 'Video Generation', page: 'avatar' }
          ].map((step) => {
            const status = getStepStatus(step.key);
            return (
              <div
                key={step.key}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  status === 'completed'
                    ? 'border-green-200 bg-green-50 hover:bg-green-100'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
                onClick={() => handleNavigateTo(step.page)}
              >
                <div className="flex items-center gap-3">
                  {getStepIcon(status)}
                  <div>
                    <h3 className={`font-medium ${
                      status === 'completed' ? 'text-green-800' : 'text-gray-600'
                    }`}>
                      {step.name}
                    </h3>
                    <p className={`text-sm ${
                      status === 'completed' ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {status === 'completed' ? '✨ Completed' : 'Click to start'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Generated Content Summary */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">✨ Your Generated Content</h2>
        
        {/* Product Information */}
        {productData && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">📦 Your Product Story</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong className="text-blue-800">🎯 Product Name:</strong> 
                <span className="text-gray-700 ml-2">{productData.product?.name}</span>
              </div>
              {productData.product?.description && (
                <div>
                  <strong className="text-blue-800">📝 Description:</strong> 
                  <span className="text-gray-700 ml-2">{productData.product.description}</span>
                </div>
              )}
              <div>
                <strong className="text-blue-800">🆔 Session ID:</strong> 
                <span className="text-gray-700 ml-2 font-mono">{productData.session_id}</span>
              </div>
            </div>
          </div>
        )}

        {/* Script */}
        {scriptResult && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">📝 Your Winning Script</h3>
            <div className="p-3 bg-white rounded border">
              <pre className="whitespace-pre-wrap text-gray-800 text-sm">{scriptResult.script}</pre>
            </div>
            {scriptResult.image_caption && (
              <div className="mt-2 text-sm">
                <strong className="text-green-800">🖼️ Image Caption:</strong> 
                <span className="text-gray-700 ml-2">{scriptResult.image_caption}</span>
              </div>
            )}
          </div>
        )}

        {/* Voice */}
        {voiceResult && (
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">🎤 Your Voiceover</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong className="text-purple-800">🎭 Voiceover Text:</strong>
                <div className="mt-1 p-2 bg-white rounded border text-gray-700">
                  {voiceResult.voice_text}
                </div>
              </div>
              <div>
                <strong className="text-purple-800">🎵 Audio:</strong>
                <div className="mt-1">
                  {voiceResult.audio_base64 && (
                    <audio controls src={`data:audio/mpeg;base64,${voiceResult.audio_base64}`} className="w-full" />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image */}
        {imageResult && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h3 className="font-semibold text-orange-800 mb-2">🖼️ Generated Image</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong className="text-orange-800 text-sm">Optimized Prompt:</strong>
                <div className="mt-1 p-2 bg-white rounded border text-sm text-gray-700">
                  {imageResult.optimized_prompt}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <img 
                  src={imageResult.image_data} 
                  alt="AI Generated" 
                  className="rounded-lg shadow-lg max-w-full max-h-48" 
                />
                <a
                  href={imageResult.image_data}
                  download="ai-generated-image.png"
                  className="mt-2 text-orange-600 underline text-sm"
                >
                  Download Image
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Avatar Video */}
        {avatarVideoResult && (
          <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <h3 className="font-semibold text-indigo-800 mb-2">🎬 Professional Video</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong className="text-indigo-800">Avatar ID:</strong> 
                <span className="text-gray-700 ml-2">{avatarVideoResult.avatar_id}</span>
              </div>
              <div>
                <strong className="text-indigo-800">Voice ID:</strong> 
                <span className="text-gray-700 ml-2">{avatarVideoResult.voice_id}</span>
              </div>
            </div>
            {avatarVideoResult.video_url && (
              <div className="mt-3">
                <video 
                  controls 
                  src={avatarVideoResult.video_url} 
                  className="w-full rounded-lg shadow-lg" 
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleStartOver}
          className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-all"
        >
          🔄 Start New Workflow
        </button>
        
        <button
          onClick={() => handleNavigateTo('product-upload')}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
        >
          ✏️ Edit Product
        </button>
        
        <button
          onClick={() => handleNavigateTo('script')}
          className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all"
        >
          📝 Edit Script
        </button>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {productData ? '1' : '0'}
            </div>
            <div className="text-gray-600">Products</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {scriptResult ? '1' : '0'}
            </div>
            <div className="text-gray-600">Scripts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {voiceResult ? '1' : '0'}
            </div>
            <div className="text-gray-600">Voiceovers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {imageResult ? '1' : '0'}
            </div>
            <div className="text-gray-600">Images</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {avatarVideoResult ? '1' : '0'}
            </div>
            <div className="text-gray-600">Videos</div>
          </div>
        </div>
      </div>
    </div>
  );
} 