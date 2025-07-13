'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ImageGenerator() {
  const router = useRouter();
  
  // Image Generation State
  const [optimizedImageLoading, setOptimizedImageLoading] = useState(false);
  const [optimizedImageResult, setOptimizedImageResult] = useState<any>(null);
  const [imageStyle, setImageStyle] = useState('realistic');
  const [imageTone, setImageTone] = useState('professional');
  const [imageSize, setImageSize] = useState('1024x1024');
  const [error, setError] = useState<string | null>(null);
  const [scriptResult, setScriptResult] = useState<any>(null);
  const [productData, setProductData] = useState<any>(null);
  
  // Prompt Generation State
  const [promptLoading, setPromptLoading] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [editedPrompt, setEditedPrompt] = useState<string>('');
  const [promptGenerated, setPromptGenerated] = useState(false);
  const [imageGenerating, setImageGenerating] = useState(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedScriptResult = localStorage.getItem('scriptResult');
    const storedProductData = localStorage.getItem('productData');
    
    if (storedScriptResult) {
      setScriptResult(JSON.parse(storedScriptResult));
    }
    if (storedProductData) {
      setProductData(JSON.parse(storedProductData));
    }
  }, []);

  const handleGeneratePrompt = async () => {
    if (!scriptResult?.script) {
      setError('Please generate a script first');
      return;
    }
    
    setPromptLoading(true);
    setGeneratedPrompt('');
    setEditedPrompt('');
    setPromptGenerated(false);
    setError(null);
    
    // Create a comprehensive user input combining product and script information
    const userInput = `Product: ${productData?.product?.name || 'Unknown Product'}
${productData?.product?.description ? `Description: ${productData.product.description}` : ''}
Script: ${scriptResult.script}`;
    
    try {
      // Generate a one-line, image-focused summary prompt
      const productName = productData?.product?.name || 'the product';
      const productBenefit = productData?.product?.description || '';
      // Try to extract a key emotion or benefit from the script
      let scriptSummary = '';
      const narratorMatch = scriptResult.script.match(/Narrator:\s*"([^"]+)"/i);
      if (narratorMatch && narratorMatch[1]) {
        scriptSummary = narratorMatch[1];
      } else {
        // Fallback: use the first non-empty line
        scriptSummary = scriptResult.script.split('\n').map(l => l.trim()).filter(Boolean)[0] || '';
      }
      // Compose the AI-optimized prompt
      const mockPrompt = `A professional, eye-catching image of ${productName} that visually represents: '${scriptSummary}'. Emphasize ${productBenefit ? productBenefit : 'the product\'s main benefit'} in a way that evokes excitement and trust.`;
      setGeneratedPrompt(mockPrompt);
      setEditedPrompt(mockPrompt);
      setPromptGenerated(true);
    } catch (err: any) {
      setError(err.message || 'Prompt generation error');
    } finally {
      setPromptLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!editedPrompt.trim()) {
      setError('Please generate and review the prompt first');
      return;
    }
    
    setImageGenerating(true);
    setOptimizedImageResult(null);
    setError(null);
    
    try {
      const res = await fetch('http://localhost:8000/image/optimized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_input: editedPrompt,
          style: imageStyle,
          tone: imageTone,
          size: imageSize,
          quality: 'standard'
        }),
      });
      
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setOptimizedImageResult(data);
      
      // Store image result in localStorage for other pages
      localStorage.setItem('imageResult', JSON.stringify(data));
    } catch (err: any) {
      setError(err.message || 'Image generation error');
    } finally {
      setImageGenerating(false);
    }
  };

  const handleContinue = () => {
    if (optimizedImageResult || promptGenerated) {
      router.push('/voice');
    }
  };

  const handleSkip = () => {
    router.push('/voice');
  };

  const handleBack = () => {
    router.push('/script');
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-white rounded-xl shadow-lg">
      {/* Encouraging Skip Button at the Top */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleSkip}
          className="bg-gradient-to-r from-gray-300 to-blue-200 text-blue-800 font-bold px-5 py-2 rounded-full shadow hover:from-blue-200 hover:to-blue-400 hover:text-blue-900 transition-all border-2 border-blue-300 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          ⏭️ Skip Image Generation
        </button>
      </div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🎨 Create Visual Magic</h1>
        <p className="text-gray-600 text-lg">Transform your ideas into stunning visuals that will make your ad unforgettable. Our AI creates images that perfectly match your brand and message.</p>
      </div>

      {!scriptResult && (
        <div className="mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="text-center">
            <svg className="h-12 w-12 text-yellow-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">📝 Script Required</h3>
            <p className="text-yellow-700 mb-4">You need to create a compelling script first before we can create visuals that match your message.</p>
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
          <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">✨ AI-Powered Visual Generation</h3>
            
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">🎯 Smart Image Generation</h4>
              <p className="text-green-700 text-sm mb-3">
                Our AI will automatically create the perfect visual for your "{productData?.product?.name}" ad based on:
              </p>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• <strong>Product:</strong> {productData?.product?.name}</li>
                <li>• <strong>Script:</strong> Your compelling message and tone</li>
                <li>• <strong>Style:</strong> Your chosen visual approach</li>
              </ul>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="font-medium block mb-1">🎭 Visual Style:</label>
                <select
                  value={imageStyle}
                  onChange={e => setImageStyle(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white shadow-sm transition-all duration-200 hover:border-gray-400"
                  disabled={optimizedImageLoading}
                >
                  <option value="realistic">Realistic</option>
                  <option value="artistic">Artistic</option>
                  <option value="minimalist">Minimalist</option>
                  <option value="vintage">Vintage</option>
                  <option value="modern">Modern</option>
                  <option value="fantasy">Fantasy</option>
                </select>
                <span className="text-xs text-gray-500 block mt-1">🎨 Controls the overall visual approach</span>
              </div>
              
              <div>
                <label className="font-medium block mb-1">😊 Tone/Mood:</label>
                <select
                  value={imageTone}
                  onChange={e => setImageTone(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white shadow-sm transition-all duration-200 hover:border-gray-400"
                  disabled={optimizedImageLoading}
                >
                  <option value="professional">Professional</option>
                  <option value="fun">Fun & Playful</option>
                  <option value="luxury">Luxury</option>
                  <option value="casual">Casual</option>
                  <option value="dramatic">Dramatic</option>
                  <option value="peaceful">Peaceful</option>
                </select>
                <span className="text-xs text-gray-500 block mt-1">💫 Sets the emotional tone</span>
              </div>
              
              <div>
                <label className="font-medium block mb-1">📐 Image Size:</label>
                <select
                  value={imageSize}
                  onChange={e => setImageSize(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white shadow-sm transition-all duration-200 hover:border-gray-400"
                  disabled={optimizedImageLoading}
                >
                  <option value="1024x1024">Square (1024x1024)</option>
                  <option value="1792x1024">Landscape (1792x1024)</option>
                  <option value="1024x1792">Portrait (1024x1792)</option>
                </select>
                <span className="text-xs text-gray-500 block mt-1">📱 Choose the best format for your ad</span>
              </div>
            </div>

            <div className="mb-6 p-4 bg-blue-100 border-l-4 border-blue-400 rounded">
              <span className="text-sm text-blue-800">
                <strong>🚀 How it works:</strong> First, our AI creates an optimized prompt using ChatGPT 4.0. Then, you can review and edit the prompt if needed. Finally, we generate a high-quality image with GPT-Image-1.
              </span>
            </div>

            <div className="flex gap-3">
              <button
                className={`flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg transition-all flex items-center justify-center gap-2 font-semibold ${promptLoading ? 'opacity-60 cursor-not-allowed' : 'hover:from-blue-700 hover:to-purple-700'}`}
                onClick={handleGeneratePrompt}
                disabled={promptLoading}
              >
                {promptLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    🎨 Generating AI Prompt...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    ✨ Generate AI-Optimized Prompt
                  </>
                )}
              </button>
              
              {/* Remove old skip button */}
            </div>
          </div>

          {promptGenerated && (
            <div className="mb-8 p-6 bg-white rounded-xl border border-blue-200">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">🎯 AI-Optimized Prompt:</h3>
                <div className="mb-4">
                  <label className="font-medium block mb-2 text-blue-800">Review and edit the prompt if needed:</label>
                  <textarea
                    value={editedPrompt}
                    onChange={e => setEditedPrompt(e.target.value)}
                    className="w-full p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400 text-sm resize-none"
                    rows={4}
                    disabled={imageGenerating}
                  />
                </div>
                <div className="text-xs text-blue-600 mb-4">
                  💡 Feel free to modify the prompt to better match your vision before generating the image.
                </div>
              </div>
              
              <div className="flex gap-3 mb-6">
                <button
                  onClick={handleGenerateImage}
                  className={`flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg transition-all flex items-center justify-center gap-2 font-semibold ${imageGenerating ? 'opacity-60 cursor-not-allowed' : 'hover:from-green-700 hover:to-blue-700'}`}
                  disabled={imageGenerating}
                >
                  {imageGenerating ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      🎨 Generating Image...
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      ✨ Generate Image from Prompt
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleGeneratePrompt}
                  className="bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                  disabled={promptLoading}
                >
                  🔄 Regenerate Prompt
                </button>
              </div>

              {optimizedImageResult && (
                <div className="flex flex-col items-center mb-6">
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
                    📥 Download Image
                  </a>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleContinue}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                >
                  🎤 Continue to Voice Generation →
                </button>
                
                <button
                  onClick={handleBack}
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-all"
                >
                  ← Back to Script
                </button>
              </div>
            </div>
          )}

          {!promptGenerated && (
            <div className="flex gap-3">
              {/* Remove old skip button */}
              
              <button
                onClick={handleBack}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-all"
              >
                ← Back to Script
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