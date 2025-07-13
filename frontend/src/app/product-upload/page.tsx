'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function ProductUpload() {
  const router = useRouter();
  
  // Product Upload State
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productImages, setProductImages] = useState<FileList | null>(null);
  const [productVideo, setProductVideo] = useState<File | null>(null);
  const [productVoice, setProductVoice] = useState<File | null>(null);
  const [productLoading, setProductLoading] = useState(false);
  const [productResult, setProductResult] = useState<any>(null);
  const [productError, setProductError] = useState<string | null>(null);
  const [productUploadSuccess, setProductUploadSuccess] = useState(false);
  
  const productImageInputRef = useRef<HTMLInputElement>(null);
  const productVideoInputRef = useRef<HTMLInputElement>(null);
  const productVoiceInputRef = useRef<HTMLInputElement>(null);

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
      setProductUploadSuccess(true);
      setTimeout(() => setProductUploadSuccess(false), 2000);
      
      // Store session ID in localStorage for other pages
      if (data.session_id) {
        localStorage.setItem('sessionId', data.session_id);
        localStorage.setItem('productData', JSON.stringify(data));
      }
    } catch (err: any) {
      setProductError(err.message || 'Error');
    } finally {
      setProductLoading(false);
    }
  };

  const resetProductForm = () => {
    setProductName('');
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

  const handleContinue = () => {
    if (productResult?.session_id) {
      router.push('/script');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🎯 Launch Your Product's Success Story</h1>
        <p className="text-gray-600 text-lg">Transform your product into a compelling video ad that converts. Let's start by gathering your product's unique story and assets.</p>
      </div>

      <form onSubmit={handleProductSubmit} className="flex flex-col gap-6 mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
        <div>
          <label className="font-medium block mb-1">Product Name<span className="text-red-500">*</span></label>
          <input
            type="text"
            value={productName}
            onChange={e => setProductName(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="What's your product called? (e.g., 'SmartPet Feeder Pro')"
            disabled={productLoading}
            required
          />
        </div>
        
        <div>
          <label className="font-medium block mb-1">Product Story <span className="text-gray-400">(optional)</span></label>
          <textarea
            value={productDescription}
            onChange={e => setProductDescription(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            placeholder="Tell us about your product's key benefits, target audience, and what makes it special..."
            rows={3}
            disabled={productLoading}
          />
        </div>
        
        <div>
          <label className="font-medium block mb-1">📸 Product Visuals</label>
          <input
            type="file"
            accept="image/*"
            multiple
            ref={productImageInputRef}
            onChange={e => setProductImages(e.target.files)}
            className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={productLoading}
          />
          <span className="text-xs text-gray-500 block mt-1">✨ Upload high-quality product photos that showcase your product's best features. Multiple images recommended.</span>
        </div>
        
        <div>
          <label className="font-medium block mb-1">🎥 Product Demo Video <span className="text-gray-400">(optional)</span></label>
          <input
            type="file"
            accept="video/*"
            ref={productVideoInputRef}
            onChange={e => setProductVideo(e.target.files?.[0] || null)}
            className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={productLoading}
          />
          <span className="text-xs text-gray-500 block mt-1">🎬 Got a product demo? Share it! This helps our AI understand your product better.</span>
        </div>
        
        <div>
          <label className="font-medium block mb-1">🎤 Custom Voice Sample <span className="text-gray-400">(optional)</span></label>
          <input
            type="file"
            accept="audio/*"
            ref={productVoiceInputRef}
            onChange={e => setProductVoice(e.target.files?.[0] || null)}
            className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={productLoading}
          />
          <span className="text-xs text-gray-500 block mt-1">🎵 Want a specific voice tone? Upload a sample and we'll match it in your ad.</span>
        </div>
        
        <div className="flex gap-3">
          <button
            type="submit"
            className={`flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg transition-all flex items-center justify-center gap-2 font-semibold ${productLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            disabled={productLoading}
          >
            {productLoading && (
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            )}
            {productLoading ? '🚀 Processing Your Product...' : 'Upload Product Assets'}
            {!productLoading && productUploadSuccess && (
              <svg className="h-5 w-5 text-green-500 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          
          <button
            type="button"
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all"
            onClick={resetProductForm}
            disabled={productLoading}
          >
            Reset
          </button>
        </div>
      </form>

      {productError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center font-semibold">
          ❌ {productError}
        </div>
      )}

      {productResult && (
        <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-xl">
          <div className="text-center mb-4">
            <svg className="h-12 w-12 text-green-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-bold text-green-800">🎉 Product Successfully Launched!</h3>
            <p className="text-green-700">Your product is ready for the next step in creating an amazing video ad.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {productResult.assets?.images?.length > 0 && (
              <div className="p-3 bg-white rounded border">
                <strong className="text-green-800">📸 Visual Assets:</strong>
                <div className="text-sm text-green-700 mt-1">
                  {productResult.assets.images.length} stunning image(s) ready
                </div>
              </div>
            )}
            {productResult.assets?.video && (
              <div className="p-3 bg-white rounded border">
                <strong className="text-green-800">🎥 Demo Video:</strong>
                <div className="text-sm text-green-700 mt-1">Ready to inspire your ad</div>
              </div>
            )}
            {productResult.assets?.voice && (
              <div className="p-3 bg-white rounded border">
                <strong className="text-green-800">🎤 Voice Sample:</strong>
                <div className="text-sm text-green-700 mt-1">Perfect tone captured</div>
              </div>
            )}
          </div>
          
          <button
            onClick={handleContinue}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all"
          >
            ✨ Create My Compelling Script →
          </button>
        </div>
      )}
    </div>
  );
} 