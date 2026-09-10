const CHALLENGE_KEY = "auth2faChallenge";
const SETUP_KEY = "auth2faSetup";
const RECOVERY_KEY = "auth2faRecoveryCodes";

export function persist2faChallenge({ challengeToken, rememberMe = true }) {
  sessionStorage.removeItem(SETUP_KEY);
  sessionStorage.setItem(
    CHALLENGE_KEY,
    JSON.stringify({
      token: challengeToken,
      rememberMe: !!rememberMe,
      at: Date.now(),
    })
  );
}

export function persist2faSetup({ setupToken, rememberMe = true }) {
  sessionStorage.removeItem(CHALLENGE_KEY);
  sessionStorage.setItem(
    SETUP_KEY,
    JSON.stringify({
      token: setupToken,
      rememberMe: !!rememberMe,
      at: Date.now(),
    })
  );
}

export function getStored2faChallenge() {
  const raw = sessionStorage.getItem(CHALLENGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getStored2faSetup() {
  const raw = sessionStorage.getItem(SETUP_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function persist2faRecoveryCodes(codes) {
  if (Array.isArray(codes) && codes.length > 0) {
    sessionStorage.setItem(RECOVERY_KEY, JSON.stringify(codes));
  }
}

export function getStored2faRecoveryCodes() {
  const raw = sessionStorage.getItem(RECOVERY_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function clear2faRecoveryCodes() {
  sessionStorage.removeItem(RECOVERY_KEY);
}

export function clear2faChallenge() {
  sessionStorage.removeItem(CHALLENGE_KEY);
  sessionStorage.removeItem(SETUP_KEY);
  sessionStorage.removeItem(RECOVERY_KEY);
}
