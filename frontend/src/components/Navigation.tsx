'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const steps = [
  { path: '/product-upload', name: 'Product Upload', icon: '📦', shortName: 'Product' },
  { path: '/script', name: 'Script Generation', icon: '📝', shortName: 'Script' },
  { path: '/image', name: 'Image Generation', icon: '🖼️', shortName: 'Image' },
  { path: '/voice', name: 'Voice Generation', icon: '🎤', shortName: 'Voice' },
  { path: '/avatar', name: 'Video Generation', icon: '🎬', shortName: 'Video' },
  { path: '/workflow', name: 'Summary', icon: '📊', shortName: 'Summary' }
];

export default function Navigation() {
  const pathname = usePathname();
  const currentStepIndex = steps.findIndex(step => step.path === pathname);

  return (
    <nav className="bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg border-b border-blue-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center h-16">
            <div className="flex w-full justify-center items-center">
              <Link
                href="/product-upload"
                className="text-9xl font-extrabold text-center w-full tracking-wide text-blue-700 drop-shadow-lg"
                style={{ fontFamily: 'Comic Sans MS, Comic Sans, cursive, sans-serif', letterSpacing: '0.1em', lineHeight: 1.05 }}
              >
                AI Ad Maker
              </Link>
            </div>
            
            <div className="md:hidden">
              <span className="text-sm text-blue-600 font-medium">
                Step {currentStepIndex + 1} of {steps.length}
              </span>
            </div>
          </div>
          
          {/* Workflow Progress Bar */}
          <div className="hidden md:block pb-4">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const isActive = pathname === step.path;
                const isCompleted = index < currentStepIndex;
                const isClickable = isCompleted || index === currentStepIndex;
                const isNext = index === currentStepIndex + 1;
                
                return (
                  <div key={step.path} className="flex items-center flex-1">
                    {/* Step Circle */}
                    <Link
                      href={isClickable ? step.path : '#'}
                      className={`flex flex-col items-center group ${
                        isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                      }`}
                    >
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold transition-all duration-200
                        ${isActive 
                          ? 'bg-blue-600 text-white shadow-lg scale-110' 
                          : isCompleted 
                          ? 'bg-green-500 text-white shadow-md hover:scale-105' 
                          : isNext
                          ? 'bg-blue-100 text-blue-600 border-2 border-blue-300'
                          : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                        }
                      `}>
                        {isCompleted ? '✓' : step.icon}
                      </div>
                      
                      {/* Step Label */}
                      <span className={`
                        mt-2 text-xs font-medium text-center max-w-20 leading-tight
                        ${isActive 
                          ? 'text-blue-700 font-semibold' 
                          : isCompleted 
                          ? 'text-green-600' 
                          : isNext
                          ? 'text-blue-600'
                          : 'text-gray-400'
                        }
                      `}>
                        {step.shortName}
                      </span>
                      
                      {/* Step Number */}
                      <span className={`
                        text-xs mt-1
                        ${isActive 
                          ? 'text-blue-600 font-semibold' 
                          : isCompleted 
                          ? 'text-green-500' 
                          : isNext
                          ? 'text-blue-500'
                          : 'text-gray-400'
                        }
                      `}>
                        {index + 1}
                      </span>
                    </Link>
                    
                    {/* Connector Line */}
                    {index < steps.length - 1 && (
                      <div className={`
                        flex-1 h-0.5 mx-2 transition-all duration-300
                        ${isCompleted 
                          ? 'bg-green-400' 
                          : isNext
                          ? 'bg-blue-300'
                          : 'bg-gray-200'
                        }
                      `} />
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Progress Text */}
            <div className="text-center mt-3">
              <span className="text-sm text-blue-600 font-medium">
                {currentStepIndex >= 0 ? 'Current Step' : 'Getting Started'}: {steps[currentStepIndex]?.name || 'Product Upload'}
              </span>
              <div className="text-xs text-gray-500 mt-1">
                Step {currentStepIndex + 1} of {steps.length} • {Math.round(((currentStepIndex + 1) / steps.length) * 100)}% Complete
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 