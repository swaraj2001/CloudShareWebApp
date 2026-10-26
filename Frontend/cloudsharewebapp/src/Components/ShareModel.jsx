
import React, { useState } from 'react';

export default function ShareModal({
  isOpen,
  onClose,
  link,
  title = 'Check this out!',
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Format share messages for query strings
  const encodedUrl = encodeURIComponent(link);
  const encodedText = encodeURIComponent(title);

  // Copy to clipboard handler
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Social sharing links
  const socialPlatforms = [
    {
      name: 'WhatsApp',
      url: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      color: 'bg-[#25D366]',
    },
    {
      name: 'X (Twitter)',
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      color: 'bg-[#1DA1F2]',
    },
    {
      name: 'LinkedIn',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'bg-[#0A66C2]',
    },
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'bg-[#1877F2]',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur">
      {/* Modal Wrapper */}
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl transition-all">

        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Share Link
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            &#x2715;
          </button>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-3 py-4">
          {socialPlatforms.map((platform) => (
            <a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 ${platform.color}`}
            >
              Share on {platform.name}
            </a>
          ))}
        </div>

        {/* Input Box with Copy Button */}
        <div className="mt-2">
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Page Link
          </label>

          <div className="flex items-center overflow-hidden rounded-md border bg-gray-50">
            <input
              type="text"
              readOnly
              value={link}
              className="w-full bg-transparent px-3 py-2 text-sm text-gray-600 focus:outline-none"
            />

            <button
              type="button"
              onClick={handleCopy}
              className={`whitespace-nowrap px-4 py-2 text-sm font-medium text-white transition-colors duration-200 focus:outline-none ${
                copied
                  ? 'bg-green-600'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}