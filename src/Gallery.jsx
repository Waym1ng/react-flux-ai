import React, { useState } from 'react';

const PAGE_SIZE = 6;

export default function Gallery({ images = [] }) {
  const [modalImg, setModalImg] = useState(null);
  const [promptModal, setPromptModal] = useState(null);
  const [copied, setCopied] = useState(false);
  const [page, setPage] = useState(1);

  // 分页数据
  const total = images.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const pagedImages = images.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // 放大查看
  const openModal = (img) => setModalImg(img);
  const closeModal = () => setModalImg(null);

  // 提示词弹窗
  const openPromptModal = (img) => {
    setPromptModal(img);
    setCopied(false);
  };
  const closePromptModal = () => {
    setPromptModal(null);
    setCopied(false);
  };

  // 下载图片（新标签页打开）
  const downloadImg = (url) => {
    window.open(url, '_blank');
  };

  // 复制提示词
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text || '').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  };

  // 分页控件
  const Pagination = () => (
    <div className="text-center mt-4 select-none">
      <button
        className="px-2 py-1 rounded-md bg-gray-800 text-blue-300 border border-blue-700 hover:bg-blue-700 hover:text-white transition disabled:opacity-50 text-sm mr-2 inline-block"
        onClick={() => setPage(p => Math.max(1, p - 1))}
        disabled={page === 1}
      >上一页</button>
      <span className="text-blue-200 text-sm inline-block mx-2">{page} / {totalPages || 1}</span>
      <button
        className="px-2 py-1 rounded-md bg-gray-800 text-blue-300 border border-blue-700 hover:bg-blue-700 hover:text-white transition disabled:opacity-50 text-sm ml-2 inline-block"
        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
        disabled={page === totalPages || totalPages === 0}
      >下一页</button>
    </div>
  );

  return (
    <main className="w-full h-full p-4 sm:p-6 overflow-y-auto overflow-x-hidden relative">
      {/* 粒子/波纹背景特效区（可用canvas或SVG实现，预留div） */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        {/* 可插入粒子/波纹等AI科技感特效 */}
      </div>
      <div className="w-full h-full">
        <div className="mb-4 text-center">
          <div className="text-2xl font-bold text-blue-200 inline-block">生成结果</div>
        </div>
        <div className="w-full bg-gray-900/30 rounded-xl p-4 min-h-[500px]">
          <div className="grid grid-cols-3 grid-rows-2 gap-4 md:gap-6 lg:gap-8 w-full h-full">
            {pagedImages.length === 0 ? (
              <div className="h-full w-full col-span-full row-span-full text-gray-400 text-center text-xl select-none pt-20">
                暂无图片，快去生成吧！
              </div>
            ) : (
              pagedImages.map((img, idx) => (
                <div key={img.url + idx} className="bg-gray-800 rounded-2xl shadow-xl p-4 relative group transition hover:scale-102 h-full text-center">
                  <img
                    src={img.url}
                    alt={img.prompt}
                    className="w-full h-64 object-cover rounded-lg mb-3 cursor-pointer hover:shadow-2xl transition mx-auto"
                    onClick={() => openModal(img)}
                  />
                  <div className="w-full text-center">
                    <button
                      onClick={() => openPromptModal(img)}
                      className="text-blue-400 hover:text-blue-200 text-sm transition px-3 py-1.5 rounded bg-gray-900 border border-blue-700 mr-2 inline-block"
                    >
                      提示词
                    </button>
                    <button onClick={() => downloadImg(img.url)} className="text-blue-400 hover:text-blue-200 text-sm transition px-3 py-1.5 rounded bg-gray-900 border border-blue-700 inline-block">下载</button>
                  </div>
                </div>
              ))
            )}
          </div>
          {totalPages > 1 && <Pagination />}
        </div>
      </div>
      {/* 图片放大模态框 */}
      {modalImg && (
        <div className="fixed inset-0 bg-black/80 z-50 p-4 text-center" onClick={closeModal} style={{display: 'grid', placeItems: 'center'}}>
          <div className="bg-gray-900/95 rounded-xl p-4 max-w-4xl w-full relative shadow-2xl border border-blue-900/50 mx-auto" onClick={e => e.stopPropagation()}>
            <img src={modalImg.url} alt={modalImg.prompt} className="w-full max-h-[75vh] object-contain rounded-lg mx-auto" />
            <button onClick={closeModal} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-800 text-blue-400 hover:text-white hover:bg-blue-700 transition text-base shadow-lg" style={{lineHeight: '1.75rem'}}>✕</button>
          </div>
        </div>
      )}
      {/* 提示词弹窗 */}
      {promptModal && (
        <div className="fixed inset-0 bg-black/80 z-50 p-4 text-center" onClick={closePromptModal} style={{display: 'grid', placeItems: 'center'}}>
          <div className="bg-gray-900/95 rounded-xl p-5 max-w-md w-full relative shadow-2xl border border-blue-900/50 mx-auto" onClick={e => e.stopPropagation()}>
            <div className="text-blue-200 text-base text-center break-words px-2 max-h-48 overflow-y-auto w-full mb-4">{promptModal.prompt}</div>
            <button
              onClick={() => handleCopy(promptModal.prompt)}
              className="text-blue-400 hover:text-blue-200 text-sm transition px-4 py-1.5 rounded-md bg-gray-800 border border-blue-700 hover:bg-blue-700/70 mx-auto inline-block"
            >
              {copied ? '已复制' : '一键复制提示词'}
            </button>
            <button onClick={closePromptModal} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-800 text-blue-400 hover:text-white hover:bg-blue-700 transition text-base shadow-lg" style={{lineHeight: '1.75rem'}}>✕</button>
          </div>
        </div>
      )}
    </main>
  );
}