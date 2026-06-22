const decodeToken = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};

const createAuthManager = () => {
  let timer = null;

  const getMsUntilExpiry = (token) => {
    const payload = decodeToken(token);
    if (!payload || !payload.exp) return 0;
    return Math.max(0, payload.exp * 1000 - Date.now());
  };

  const stop = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const start = (token, { onExpired }) => {
    stop();

    if (!token) {
      onExpired();
      return;
    }

    const ms = getMsUntilExpiry(token);
    if (ms <= 0) {
      onExpired();
      return;
    }

    timer = setTimeout(onExpired, ms);
  };

  const refresh = (token, { onExpired }) => {
    start(token, { onExpired });
  };

  return { start, stop, refresh };
};

export default createAuthManager;
