import { useEffect } from 'react';

const AUTH_RESULT_KEY = 'microsoft_auth_result';
const AUTH_PENDING_KEY = 'microsoft_auth_pending';

const AuthCallback = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const status = params.get('status');
    const email = params.get('email');

    const connected = !error && status === 'success';
    const payload = { connected, email: email || '', timestamp: Date.now() };

    localStorage.setItem(AUTH_RESULT_KEY, JSON.stringify(payload));
    localStorage.setItem(AUTH_PENDING_KEY, Date.now().toString());

    if (window.opener) {
      window.opener.postMessage(
        { type: 'MICROSOFT_AUTH', payload },
        window.location.origin,
      );
    }

    window.close();
    setTimeout(() => {
      document.body.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;background:#0f172a;color:#e2e8f0;">
          <div style="text-align:center;">
            <h1 style="color:#d4a853;">${connected ? 'Connected' : 'Failed'}</h1>
            <p>${connected ? 'Outlook connected successfully.' : error || 'Connection failed.'}</p>
            <p style="font-size:12px;color:#64748b;">This window can be closed.</p>
          </div>
        </div>
      `;
    }, 300);
  }, []);

  return null;
};

export default AuthCallback;
