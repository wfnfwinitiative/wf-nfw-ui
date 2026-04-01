import { useState } from 'react';
import { Loader2, ExternalLink, X, Copy, Check } from 'lucide-react';
import { serviceApi } from '../../services/api/apiClient';
import { showToast } from '../common/Toast';

const STEPS = [
  {
    title: 'Authorize Google Drive',
    body: ({ onAuthorize, loading }) => (
      <div>
        <p className="text-sm text-gray-600 mb-3">
          Click the button below. A Google sign-in page opens in a new tab. Sign in with
          the Google account that owns the Drive folder where photos should be stored.
        </p>
        <button
          onClick={onAuthorize}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg
            hover:bg-blue-700 text-sm font-medium disabled:opacity-60 transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
          Open Google Authorization Page
        </button>
      </div>
    ),
  },
  {
    title: 'Copy the Refresh Token',
    body: () => (
      <p className="text-sm text-gray-600">
        After completing Google authorization, your browser tab shows a JSON response.
        Find the{' '}
        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">refresh_token</code>{' '}
        field and copy its value. It looks like:{' '}
        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono break-all">
          1//0gXyyyyyyy...
        </code>
      </p>
    ),
  },
  {
    title: 'Add Environment Variable in Vercel',
    body: ({ copied, onCopy }) => (
      <div>
        <p className="text-sm text-gray-600 mb-2">
          Go to{' '}
          <strong>Vercel Dashboard → wf-nfw-services → Settings → Environment Variables</strong>.
          Add a new variable named:
        </p>
        <div className="flex items-center gap-2 bg-gray-900 text-green-400 rounded-lg px-3 py-2 text-xs font-mono">
          <span className="flex-1">GOOGLE_REFRESH_TOKEN</span>
          <button
            onClick={onCopy}
            title="Copy variable name"
            className="shrink-0 text-gray-400 hover:text-white transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Set its value to the refresh token you copied in step 2.
        </p>
      </div>
    ),
  },
  {
    title: 'Redeploy the Backend',
    body: () => (
      <p className="text-sm text-gray-600">
        Go to <strong>Vercel → wf-nfw-services → Deployments</strong> and click{' '}
        <strong>Redeploy</strong>. Once redeployed, drivers will be able to upload photos.
      </p>
    ),
  },
];

export function GoogleDriveSetupPanel({ onClose }) {
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAuthorize = async () => {
    setFetchingUrl(true);
    try {
      const data = await serviceApi.get('/api/oauth-url');
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch {
      showToast('Could not get authorization URL. Check Google credentials in backend config.', 'error');
    } finally {
      setFetchingUrl(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText('GOOGLE_REFRESH_TOKEN');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* silent */ }
  };

  return (
    <div className="mt-5 border border-blue-200 bg-blue-50/50 rounded-xl p-4">
      <div className="flex items-start justify-between gap-2 mb-4">
        <div>
          <h4 className="font-semibold text-gray-900 text-sm">One-time Setup Required</h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Follow these steps to connect Google Drive before drivers can upload photos.
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <ol className="space-y-5">
        {STEPS.map((step, i) => (
          <li key={i} className="flex gap-3">
            <div className="shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
              {i + 1}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 mb-1.5">{step.title}</p>
              <step.body onAuthorize={handleAuthorize} loading={fetchingUrl} copied={copied} onCopy={handleCopy} />
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-4 pt-4 border-t border-blue-200">
        <p className="text-xs text-blue-700 font-medium">
          ✓ The flag has been enabled in the database. Image upload will be fully active once
          the backend is redeployed with the refresh token.
        </p>
      </div>
    </div>
  );
}
