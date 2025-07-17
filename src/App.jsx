import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Gallery from './Gallery';
import './index.css';

function ApiKeyModal({ open, onClose }) {
  const [apiKey, setApiKey] = useState(localStorage.getItem('flux_api_key') || 'sk-xxxx');
  const [showKey, setShowKey] = useState(false);

  const saveKey = () => {
    localStorage.setItem('flux_api_key', apiKey);
    onClose();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 text-center" style={{display: 'grid', placeItems: 'center'}}>
      <div className="bg-gray-900 rounded-xl p-8 w-full max-w-sm shadow-2xl relative border border-blue-700 mx-auto">
        <div className="text-lg font-bold text-blue-400 mb-4 text-center">API密钥设置</div>
        <input
          type={showKey ? 'text' : 'password'}
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          placeholder="输入API密钥"
          className="w-full px-3 py-2 rounded bg-gray-800 text-blue-200 border border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition mb-4"
        />
        <div className="text-center">
          <button onClick={() => setShowKey(v => !v)} className="text-blue-300 px-2 py-1 text-xs hover:underline inline-block mr-2">
            {showKey ? '隐藏' : '显示'}
          </button>
          <button onClick={saveKey} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition inline-block mr-2">保存</button>
          <button onClick={onClose} className="text-blue-400 hover:text-blue-200 text-xs inline-block">关闭</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  // // 生成20个模拟图片数据用于分页测试
  const mockImages = Array.from({ length: 20 }).map((_, i) => ({
    url: 'https://ugc-media.4gamers.com.tw/puku-prod-zh/anonymous-story/f32954ce-1699-4ca2-b804-299db2146f3e.jpg',
    prompt: `模拟提示词 ${i + 1}`,
    model: 'flux-kontext-max',
    time: Date.now() + i,
  }));
  const [images, setImages] = useState(mockImages); // 所有生成图片
  // const [images, setImages] = useState([]); // 所有生成图片

  // 新增图片后追加到images
  const handleAddImage = (imgObj) => {
    setImages(prev => [imgObj, ...prev]);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-tr from-gray-900 via-gray-800 to-blue-950 overflow-auto">
      <div className="w-full min-h-screen px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 xl:px-12 xl:py-10 text-center">
        <div className="w-full max-w-7xl mx-auto bg-gray-900/95 shadow-2xl rounded-xl overflow-hidden inline-block text-left">
          <ApiKeyModal open={apiKeyModalOpen} onClose={() => setApiKeyModalOpen(false)} />
          <div className="w-full h-full bg-gray-900/80 overflow-y-auto min-w-0">
            <div className="relative" style={{display: 'grid', gridTemplateColumns: '350px 1fr'}}>
              {/* 左侧功能区 */}
              <div>
                <Sidebar onOpenApiKeyModal={() => setApiKeyModalOpen(true)} onGenerateImage={handleAddImage} />
              </div>
              {/* 右侧展示区 */}
              <div>
                <Gallery images={images} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
