import React, { useState } from 'react';
import { Cog6ToothIcon, XMarkIcon } from '@heroicons/react/24/outline';

const MODELS = [
  { label: 'Kontext Pro', value: 'flux-kontext-pro' },
  { label: 'Kontext Max', value: 'flux-kontext-max' },
];

const ASPECT_RATIOS = [
  { label: '3:2', value: '3:2' },
  { label: '2:3', value: '2:3' },
  { label: '9:16', value: '9:16' },
  { label: '16:9', value: '16:9' },
  { label: '1:1', value: '1:1' },
];

const FLUX_API_URL = 'https://api.grsai.com/v1/draw/flux';

export default function Sidebar({ onOpenApiKeyModal, onGenerateImage }) {
  const [images, setImages] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState(MODELS[0].value);
  const [aspectRatio, setAspectRatio] = useState('2:3');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [history, setHistory] = useState(JSON.parse(localStorage.getItem('flux_history') || '[]'));
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 上传图片
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    setImages(prev => [...prev, ...newImages]);
  };
  // 移除图片
  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  // 将图片文件转为base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // 生成按钮点击
  const handleGenerate = async () => {
    setError('');
    setProgress(0);
    if (!prompt.trim()) {
      setError('请输入提示词');
      return;
    }
    setLoading(true);
    try {
      // 1. 将所有图片转为base64
      let urls = [];
      if (images.length > 0) {
        urls = await Promise.all(images.map(img => fileToBase64(img.file)));
      }
      // 2. 请求draw接口（流式）
      const apiKey = localStorage.getItem('flux_api_key') || '';
      const body = {
        model,
        prompt,
        urls,
        aspectRatio,
        seed: 0,
        shutProgress: false,
        cdn: 'global',
        webHook: '', // 流式
      };
      const response = await fetch(FLUX_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });
      if (!response.body) throw new Error('接口未返回流');
      // 3. 处理流式响应
      const reader = response.body.getReader();
      let buffer = '';
      let finalUrl = '';
      let lastProgress = 0;
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += new TextDecoder().decode(value);
        // 按行分割处理
        const lines = buffer.split('\n');
        buffer = lines.pop(); // 剩余未完整的一行
        for (const line of lines) {
          const clean = line.trim();
          if (clean.startsWith('data:')) {
            try {
              const json = JSON.parse(clean.replace(/^data:/, ''));
              if (json.progress !== undefined) {
                lastProgress = json.progress;
                setProgress(Math.min(99, lastProgress));
              }
              if (json.url) {
                finalUrl = json.url;
              }
              if (json.status === 'failed') {
                setError(json.failure_reason || '生成失败');
                setLoading(false);
                return;
              }
            } catch { /* 忽略解析错误，继续处理流 */ }
          }
        }
      }
      // 4. 解析最终结果
      if (finalUrl) {
        setProgress(100);
        if (onGenerateImage) {
          onGenerateImage({
            url: finalUrl,
            prompt,
            model,
            time: Date.now(),
          });
        }
      } else {
        setError('生成失败');
      }
      // 5. 保存历史
      const newHistory = [
        { prompt, model, time: Date.now() },
        ...history.slice(0, 19),
      ];
      setHistory(newHistory);
      localStorage.setItem('flux_history', JSON.stringify(newHistory));
    } catch (err) {
      setError(err.message || '生成出错');
    } finally {
      setLoading(false);
    }
  };

  // 历史复用
  const reuseHistory = (item) => {
    setPrompt(item.prompt);
    setModel(item.model);
  };

  // 移动端折叠
  const toggleSidebar = () => setSidebarOpen((v) => !v);

  return (
    <aside className={`h-full bg-gray-900/90 border-r border-blue-900 transition-all duration-300 z-20
      ${sidebarOpen ? 'w-full' : 'w-0'}
      fixed sm:static top-0 left-0 sm:relative
      sm:w-full sm:block
      overflow-hidden`}
    >
      {/* 设置按钮（右上角） */}
      <button
        className="absolute top-4 right-4 z-30 p-2 rounded-full bg-gray-800 hover:bg-blue-700 transition sm:top-4 sm:right-4 text-blue-300"
        onClick={onOpenApiKeyModal}
        title="API密钥设置"
      >
        <Cog6ToothIcon className="w-6 h-6" />
      </button>
      {/* 移动端折叠按钮 */}
      <button className="sm:hidden absolute top-4 left-4 text-blue-400 z-30" onClick={toggleSidebar}>
        {sidebarOpen ? '收起' : '展开'}
      </button>
      <div className={`p-6 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ height: '100%', overflow: 'auto' }}>
        {/* 上传图片区 */}
        <div>
          <div className="text-lg font-bold text-blue-400 mb-2 tracking-wider">上传图片</div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <div className="mt-2">
            {images.map((img, idx) => (
              <div key={img.url} className="relative group inline-block mr-2 mb-2">
                <img src={img.url} alt={img.name} className="w-14 h-14 object-cover rounded border border-blue-700" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute -top-2 -right-2 bg-gray-800 text-blue-300 rounded-full p-1 shadow hover:bg-blue-700 transition opacity-80 group-hover:opacity-100"
                  title="移除"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
        {/* 生成模式 */}
        <div>
          <div className="text-lg font-bold text-blue-400 mb-2 tracking-wider">生成模式</div>
          <div>
            <button className="px-3 py-1 rounded bg-blue-700 text-white text-xs font-semibold shadow hover:bg-blue-800 transition inline-block mr-2">图生图</button>
            {/* 预留其他模式 */}
          </div>
        </div>
        <div>
          <div className="text-lg font-bold text-blue-400 mb-2 tracking-wider">提示词</div>
          <textarea
            rows={8}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="请输入提示词"
            className="w-full px-3 py-2 rounded bg-gray-800 text-blue-100 border border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
          />
        </div>
        <div>
          <div className="text-lg font-bold text-blue-400 mb-2 tracking-wider">模型选择</div>
          <select
            value={model}
            onChange={e => setModel(e.target.value)}
            className="w-full px-3 py-2 rounded bg-gray-800 text-blue-200 border border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          >
            {MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div>
          <div className="text-lg font-bold text-blue-400 mb-2 tracking-wider">宽高比</div>
          <select
            value={aspectRatio}
            onChange={e => setAspectRatio(e.target.value)}
            className="w-full px-3 py-2 rounded bg-gray-800 text-blue-200 border border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          >
            {ASPECT_RATIOS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-2 mt-2 rounded bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold text-lg shadow-lg hover:from-blue-600 hover:to-blue-800 transition text-center disabled:opacity-60"
        >
          {loading && <span className="loader border-blue-200 border-t-blue-700 mr-2 inline-block align-middle"></span>}
          <span className="inline-block align-middle">{loading ? `生成中...${progress > 0 ? `(${progress}%)` : ''}` : '生成图片'}</span>
        </button>
        {error && <div className="text-red-500 text-center text-sm mt-2">{error}</div>}
        <div className="mt-4">
          <div className="text-blue-300 font-semibold mb-2">历史记录</div>
          <div className="max-h-48 overflow-y-auto">
            {history.length === 0 && <div className="text-xs text-gray-500">暂无历史</div>}
            {history.map((item) => (
              <div className="mb-2" key={item.time}>
                <button
                  onClick={() => reuseHistory(item)}
                  className="text-left px-2 py-1 rounded bg-gray-800 text-blue-200 hover:bg-blue-900 text-xs truncate border border-blue-900 transition w-full"
                >
                  {item.prompt.slice(0, 24)}...（{MODELS.find(m => m.value === item.model)?.label}）
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}