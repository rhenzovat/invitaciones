import { createContext, useEffect, useReducer, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios"; // Importa axios
// GLOBAL CUSTOM COMPONENTS
import Loading from "app/components/MatxLoading";
import { handleErrorMessages, toastSuccess, handleInfoMessages } from "../components/notify-messages";
import { authJWTConfig } from "app/authJWTConfig";
import { clearSidebarCache } from "../store/sidebarCache";
import { refreshAppSidebarMenu } from "../utils/refreshAppSidebarMenu";
import { clearObjetosCache } from "../store/objetosCache";
import {
  clearAuthStorage,
  clearAccessTokenOnly,
  clearSessionCompletely,
  clearTrustedDeviceToken,
  getSignInUrl,
  getStoredAccessToken,
  getStoredRefreshToken,
  getStoredTrustedDeviceToken,
  getStoredUserId,
  getTokenStorage,
  persistAuthTokens,
  persistRefreshToken,
  persistTrustedDeviceToken,
} from "../utils/authStorage";
import {
  persist2faChallenge,
  persist2faSetup,
  getStored2faChallenge,
  getStored2faSetup,
  clear2faChallenge,
} from "../utils/authChallengeStorage";
import {
  persistLastSessionUser,
  getLastSessionUser,
  clearLastSessionUser,
} from "../utils/authLastSession";
import { isAuthRefreshUrl, requestRefreshToken } from "../utils/sessionRefresh";

/** Mensaje mostrado en el modal cuando falla el login (contacto soporte). */
const LOGIN_SUPPORT_MESSAGE = "Si el problema persiste, contacte a soporte técnico: soporte@lucdesoft.com o consulte con el administrador del sistema.";

// Configuración inicial
const initialState = {
  user: null,
  perfil: null,
  isInitialized: false,
  isAuthenticated: false,
};

/** Evita redirigir a login mientras se restaura la sesión al recargar (F5). */
let authBootstrapping = false;

// En dev, apiClient/apiFormDataClient usan ruta relativa para pasar por el
// proxy de Vite (server.proxy en vite.config.js) y evitar CORS/cortes de
// archivos al llamar directo a localhost:8000. En build de produccion,
// import.meta.env.DEV es false y se mantiene el dominio completo de siempre.
const API_URL = import.meta.env.DEV ? "/api" : authJWTConfig.domain + "/api";

/** Convierte avatar (ruta relativa del backend o base64) a URL usable para la img. */
const getAvatarUrl = (avatar, avatarBase64) => {
  if (avatarBase64) return `data:image/jpeg;base64,${avatarBase64}`;
  if (!avatar) return null;
  if (avatar.startsWith("data:") || /^https?:\/\//i.test(avatar)) return avatar;
  const base = (authJWTConfig.domain || "").replace(/\/$/, "");
  const path = avatar.replace(/^\//, "");
  // Rutas del disco public (campus avatars, uploads) requieren el prefijo /storage/
  const withStorage = path.startsWith("storage/") ? path : `storage/${path}`;
  return base ? `${base}/${withStorage}` : avatar;
};

const normalizeUser = (user) => {
  if (!user) return user;
  const avatar = getAvatarUrl(user.avatar, user.avatar_base64);
  const next = { ...user };
  if (avatar) next.avatar = avatar;
  if (next.avatar_base64) delete next.avatar_base64;
  return next;
};

// Crea una instancia de Axios para toda la aplicación que maneje interceptores
export  const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
  // No necesitamos withCredentials: true aquí ni en llamadas individuales
  // para un esquema de autenticación JWT puro, ya que no se basa en cookies de sesión.
});

// Interceptor para añadir el JWT a cada solicitud saliente
apiClient.interceptors.request.use(
  (config) => {
    const token = getStoredAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Refresh token: renovar JWT en 401 (no en 403 — permiso denegado no debe cerrar sesión)
let isRefreshing = false;
let failedQueue = [];
/** Actualiza user/perfil en contexto tras refresh exitoso (registrado desde AuthProvider). */
let onSessionRefreshed = null;
export const registerSessionRefreshed = (fn) => {
  onSessionRefreshed = fn;
};

const redirectToSignIn = () => {
  if (authBootstrapping) return;
  const path = window.location.pathname || "";
  const enLogin =
    /\/session\/(signin|signup|oauth-callback|two-factor|two-factor-setup|forgot-password)/.test(path);
  if (!enLogin) {
    window.location.replace(getSignInUrl());
  }
};

const applyRefreshPayload = (res) => {
  const token = res.data.token ?? res.data.result?.token;
  const newRefresh = res.data.refreshToken ?? res.data.result?.refreshToken;
  const user = res.data.user ?? res.data.result?.user;
  const perfil = res.data.perfil ?? res.data.result?.perfil;
  if (!token) {
    throw new Error("Refresh sin token");
  }
  const store = getTokenStorage() || localStorage;
  store.setItem("accessToken", token);
  if (newRefresh) persistRefreshToken(newRefresh);
  apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  apiFormDataClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  if (onSessionRefreshed && user) {
    onSessionRefreshed({
      user: normalizeUser(user),
      perfil: Array.isArray(perfil) ? perfil[0] || null : perfil || null,
    });
  }
  return token;
};

const processQueue = (err, token = null) => {
  failedQueue.forEach(({ resolve, reject, originalRequest, client }) => {
    if (token && originalRequest && client) {
      originalRequest.headers.Authorization = `Bearer ${token}`;
      resolve(client(originalRequest));
    } else {
      reject(err);
    }
  });
  failedQueue = [];
};

const attachUnauthorizedInterceptor = (httpClient) => {
  httpClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const status = error.response?.status;

      if (status === 403) {
        return Promise.reject(error);
      }

      if (originalRequest?.skipAuthRefresh || isAuthRefreshUrl(originalRequest?.url || "")) {
        return Promise.reject(error);
      }

      if (status !== 401 || !originalRequest) {
        return Promise.reject(error);
      }

      if (originalRequest._retry) {
        processQueue(error, null);
        clearAuthStorage();
        redirectToSignIn();
        return Promise.reject(error);
      }

      const refreshToken = getStoredRefreshToken();
      if (!refreshToken) {
        clearAuthStorage();
        redirectToSignIn();
        return Promise.reject(error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        originalRequest._retry = true;
        return requestRefreshToken(apiClient, applyRefreshPayload)
          .then(({ token }) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            processQueue(null, token);
            return httpClient(originalRequest);
          })
          .catch((refreshErr) => {
            processQueue(refreshErr, null);
            if (refreshErr?.response?.status === 401 || !getStoredRefreshToken()) {
              clearAuthStorage();
              redirectToSignIn();
            }
            return Promise.reject(refreshErr);
          })
          .finally(() => {
            isRefreshing = false;
          });
      }

      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, originalRequest, client: httpClient });
      });
    }
  );
};

attachUnauthorizedInterceptor(apiClient);

//===================   FORMADATA: PARA ENVIOS DE IMAGENES ================================
export const apiFormDataClient = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
  },
});

apiFormDataClient.interceptors.request.use(
  (config) => {
    const token = getStoredAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

attachUnauthorizedInterceptor(apiFormDataClient);
//=================================================================================

// Helpers
const isValidToken = (accessToken) => {
  if (!accessToken || accessToken === "null") return false;

  try {
    const decodedToken = jwtDecode(accessToken);
    const currentTime = Date.now() / 1000; // Tiempo actual en segundos

    // Comprueba si el token tiene una ID y si no ha expirado
    return !!decodedToken?.id && decodedToken.exp > currentTime;
  } catch (error) {
    console.error("Error decoding token or token expired:", error);
    return false;
  }
};

const AuthContext = createContext({
  ...initialState,
  method: "JWT",
  login: () => { },
  loginWithOAuthExchange: async () => { },
  resumeSession: async () => { },
  getLastSessionUser: () => null,
  verify2fa: async () => { },
  completeMandatory2fa: async () => { },
  logout: () => { },
  switchAccount: () => { },
  register: () => { },
  validar_perfil: () => { },
  refreshUser: () => { },
  updateUser: () => { }
});

const reducer = (state, action) => {
  switch (action.type) {
    case "INIT": {
      const { isAuthenticated, user, perfil } = action.payload;
      return { ...state, user: normalizeUser(user), perfil, isAuthenticated, isInitialized: true };
    }
    case "LOGIN":
    case "VALIDATE_PROFILE": {
      const { user, perfil } = action.payload;
      return { ...state, user: normalizeUser(user), perfil, isAuthenticated: true };
    }
    case "LOGOUT": {
      return {
        user: null,
        perfil: null,
        isAuthenticated: false,
        isInitialized: true,
      };
    }
    case "UPDATE_USER": {
      const { user, perfil } = action.payload;
      const nextUser = user ?? state.user;
      return { ...state, user: normalizeUser(nextUser), perfil: perfil ?? state.perfil };
    }
    case "REGISTER": {
      const { user } = action.payload;
      return { ...state, isAuthenticated: true, user: normalizeUser(user) };
    }
    default: {
      return state;
    }
  }
};

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Manejo de sesión
  /** Renueva JWT con refresh token guardado (sin Google ni contraseña). */
  const refreshAccessToken = useCallback(async () => {
    if (!getStoredRefreshToken()) {
      throw new Error("No hay sesión guardada.");
    }
    const { token } = await requestRefreshToken(apiClient, applyRefreshPayload);
    return token;
  }, []);

  const restoreSessionFromRefresh = useCallback(async () => {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) {
      throw new Error("No hay sesión guardada.");
    }
    const res = await apiClient.post(
      "/auth/refresh",
      { refreshToken },
      { skipAuthRefresh: true }
    );
    applyRefreshPayload(res);
    const user = res.data.user ?? res.data.result?.user;
    const perfil = res.data.perfil ?? res.data.result?.perfil;
    const normalized = normalizeUser(user);
    persistLastSessionUser(normalized);
    const perfilActivo = Array.isArray(perfil) ? perfil[0] || null : perfil || null;
    dispatch({
      type: "LOGIN",
      payload: {
        user: normalized,
        perfil: perfilActivo,
      },
    });
    return { user: normalized, perfil: perfilActivo };
  }, []);

  const setSession = useCallback(async (accessToken) => {
    if (accessToken) {
      apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      return;
    }
    clearAuthStorage();
    delete apiClient.defaults.headers.common.Authorization;
  }, []);


  const logout = useCallback(async () => {
    const refreshToken = getStoredRefreshToken();
    delete apiClient.defaults.headers.common.Authorization;
    if (refreshToken) {
      try {
        await apiClient.post('/auth/logout', { refreshToken });
      } catch (e) {
        // ignore
      }
    }
    clearSidebarCache();
    clearObjetosCache();
    clear2faChallenge();
    clearSessionCompletely();
    await setSession(null);
    dispatch({ type: "LOGOUT" });
    window.location.replace(getSignInUrl());
  }, [setSession]);

  const completeAuthFromPayload = useCallback(async (data, rememberMe = true, loginMethod = null) => {
    const { token, user, perfil, refreshToken, trusted_device_token } = data;
    const normalized = normalizeUser(user);
    persistAuthTokens({
      accessToken: token,
      refreshToken: refreshToken || null,
      userId: normalized.id,
      rememberMe: true,
    });
    if (trusted_device_token) {
      persistTrustedDeviceToken(trusted_device_token);
    }
    persistLastSessionUser(normalized, loginMethod);
    await setSession(token);
    dispatch({
      type: "LOGIN",
      payload: {
        user: normalized,
        perfil: perfil?.[0] || null,
      },
    });
  }, [setSession]);

  /** Entrada directa con avatar (usa refresh token, sin OAuth). */
  const resumeSession = useCallback(async () => {
    try {
      const { user, perfil } = await restoreSessionFromRefresh();
      return { user, perfil };
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        clearAuthStorage();
      }
      throw err;
    }
  }, [restoreSessionFromRefresh]);

  const switchAccount = useCallback(() => {
    clear2faChallenge();
    clearSessionCompletely();
    setSession(null);
    dispatch({ type: "LOGOUT" });
  }, [setSession]);

  // Acciones de autenticación
  const login = async (email, password, rememberMe = false) => {
    try {
      const trusted = getStoredTrustedDeviceToken();
      const response = await apiClient.post(`/login`, {
        email,
        password,
        remember: rememberMe,
        ...(trusted ? { trusted_device_token: trusted } : {}),
      });
      if (response.data.status === 422) {
        const msg = response.data.message || "Credenciales incorrectas.";
        handleInfoMessages("Error de inicio de sesión", `${msg}\n\n${LOGIN_SUPPORT_MESSAGE}`);
        return;
      }

      if (response.data.requires_2fa_setup) {
        clearSessionCompletely();
        dispatch({ type: "LOGOUT" });
        persist2faSetup({
          setupToken: response.data.setup_token,
          rememberMe: !!rememberMe,
        });
        return { requires2faSetup: true };
      }

      if (response.data.requires_2fa) {
        clearSessionCompletely();
        dispatch({ type: "LOGOUT" });
        persist2faChallenge({
          challengeToken: response.data.challenge_token,
          rememberMe: !!rememberMe,
        });
        return { requires2fa: true };
      }

      await completeAuthFromPayload(response.data, rememberMe, "local");
    } catch (err) {
      console.error('Login error:', err);
      const status = err.response?.status;
      const data = err.response?.data || {};
      const serverMsg = data.message;
      const errors = data.errors;
      let errorMessage;
      if (status === 422) {
        if (errors && typeof errors === 'object') {
          const firstKey = Object.keys(errors)[0];
          const first = firstKey && Array.isArray(errors[firstKey]) ? errors[firstKey][0] : null;
          errorMessage = first || serverMsg || "El correo o la contraseña no son correctos. Verifique sus credenciales.";
        } else {
          errorMessage = serverMsg || "El correo o la contraseña no son correctos. Verifique sus credenciales.";
        }
      } else if (status === 401) {
        errorMessage = "Credenciales incorrectas.";
      } else if (err.response) {
        errorMessage = serverMsg || "Error en el servidor. Intente más tarde.";
      } else if (err.code === "ERR_NETWORK" || err.message?.includes("Network Error")) {
        errorMessage = "No se pudo conectar con el servidor. Verifique que el backend esté en ejecución (php artisan serve) y que la configuración CORS permita su origen.";
      } else {
        errorMessage = "Error de conexión. Verifique su red.";
      }
      handleInfoMessages("Error de inicio de sesión", `${errorMessage}\n\n${LOGIN_SUPPORT_MESSAGE}`);
    }
  };

  /** Completa login OAuth con código de un solo uso (sin exponer JWT en la URL). */
  const loginWithOAuthExchange = async (exchangeCode) => {
    const { oauthExchange } = await import("../api/authProveedor.api");
    const trusted = getStoredTrustedDeviceToken();
    const data = await oauthExchange(exchangeCode, trusted);
    if (data.status === 422) {
      throw new Error(data.message || "OAuth inválido");
    }
    if (data.requires_2fa_setup) {
      clearSessionCompletely();
      dispatch({ type: "LOGOUT" });
      persist2faSetup({
        setupToken: data.setup_token,
        rememberMe: true,
      });
      return { requires2faSetup: true };
    }

    if (data.requires_2fa) {
      clearSessionCompletely();
      dispatch({ type: "LOGOUT" });
      persist2faChallenge({
        challengeToken: data.challenge_token,
        rememberMe: true,
      });
      return { requires2fa: true };
    }
    await completeAuthFromPayload(data, true, "google");
    clear2faChallenge();
    const u = normalizeUser(data.user);
    return {
      success: true,
      user: u,
      profileCount: u?.count ?? (Array.isArray(data.perfil) ? data.perfil.length : 0),
    };
  };

  const completeMandatory2fa = useCallback(async (data, rememberMe = true) => {
    await completeAuthFromPayload(data, rememberMe);
    clear2faChallenge();
  }, [completeAuthFromPayload]);

  /** Segundo paso tras login/OAuth cuando el usuario tiene 2FA activo. */
  const verify2fa = async (code, trustDevice = false) => {
    const challenge = getStored2faChallenge();
    if (!challenge?.token) {
      throw new Error("No hay verificación pendiente.");
    }
    const { verify2faChallenge } = await import("../api/auth2fa.api");
    const data = await verify2faChallenge(challenge.token, code, trustDevice);
    if (data.status === 422) {
      throw new Error(data.message || "Código incorrecto");
    }
    clear2faChallenge();
    await completeAuthFromPayload(data, challenge.rememberMe, "local");
  };

  /**
   * Fija el perfil y rol activos tras la selección en el segundo formulario del login.
   * Necesario: el backend devuelve un único perfil con menu_objetos y modulos_permitidos de ese rol,
   * que el sidebar usa para filtrar ítems. Sin este endpoint no tendríamos permisos por rol.
   */
  const validar_perfil = async (id_perfil, id_rol) => {
    try {
      const response = await apiClient.post(`/perfil/validar_perfil`, { id_perfil, id_rol });
      if (response.data.status === 422) {
        handleInfoMessages("Error", response.data.message);
        return;
      }

      const { user, perfil } = response.data;
      clearSidebarCache();
      clearObjetosCache();
      dispatch({
        type: "VALIDATE_PROFILE",
        payload: {
          user,
          perfil: perfil?.[0] || null
        }
      });
      await refreshAppSidebarMenu();
    } catch (err) {
      console.error('Profile validation error:', err);
      handleInfoMessages("Error", err.response?.data?.message || "Error validando perfil");
    }
  };

  /**
   * Refresca user y perfil desde el backend (p. ej. tras actualizar avatar).
   * Usa validar_conexion: el refresh token solo renueva el JWT, no devuelve user/perfil.
   */
  const refreshUser = useCallback(async () => {
    try {
      const response = await apiClient.post(`/perfil/validar_conexion`);
      const { user, perfil } = response.data;
      dispatch({
        type: "UPDATE_USER",
        payload: {
          user,
          perfil: perfil?.[0] ?? null
        }
      });
    } catch (err) {
      console.error("Error al refrescar usuario:", err);
    }
  }, []);

  /** Actualiza el user en el contexto (p. ej. avatar desde perfil tras subir foto). */
  const updateUser = useCallback((partialUser) => {
    if (!state.user) return;
    const user = { ...state.user, ...partialUser };
    dispatch({ type: "UPDATE_USER", payload: { user } });
  }, [state.user]);

  const register = async (email, username, password) => {
    try {
      const { data } = await apiClient.post("/auth/register", { email, username, password });
      const { accessToken, user } = data;
      if (accessToken && user?.id) {
        persistAuthTokens({
          accessToken,
          refreshToken: data.refreshToken ?? null,
          userId: user.id,
          rememberMe: true,
        });
      }
      await setSession(accessToken);
      dispatch({ type: "REGISTER", payload: { user } });
    } catch (err) {
      console.error('Registration error:', err);
      throw err;
    }
  };

  // Inicialización: con token en storage (local o sesión), restaura user + perfil vía validar_conexion.
  // El refresh token solo se usa en el interceptor 401 para renovar el JWT; no devuelve user/perfil.
  useEffect(() => {
    const initializeAuth = async () => {
      authBootstrapping = true;
      try {
        const pending2fa =
          getStored2faSetup()?.token || getStored2faChallenge()?.token;
        if (pending2fa && isSessionPublicRoute()) {
          const path = window.location.pathname || "";
          const en2fa = /\/session\/two-factor/.test(path);
          if (!en2fa) {
            clearAuthStorage();
            dispatch({
              type: "INIT",
              payload: {
                isAuthenticated: false,
                user: null,
                perfil: null,
              },
            });
            return;
          }
        }

        const accessToken = getStoredAccessToken();
        const refreshToken = getStoredRefreshToken();

        if (accessToken && isValidToken(accessToken)) {
          await setSession(accessToken);
          try {
            const response = await apiClient.post(`/perfil/validar_conexion`, null, {
              skipAuthRefresh: true,
            });
            const { user, perfil } = response.data;
            const normalized = normalizeUser(user);
            persistLastSessionUser(normalized);
            dispatch({
              type: "INIT",
              payload: {
                isAuthenticated: true,
                user: normalized,
                perfil: perfil?.[0] || null,
              },
            });
          } catch (connErr) {
            if (connErr?.response?.status === 401 && refreshToken) {
              const { user, perfil } = await restoreSessionFromRefresh();
              dispatch({
                type: "INIT",
                payload: { isAuthenticated: true, user, perfil },
              });
            } else {
              throw connErr;
            }
          }
        } else if (refreshToken) {
          try {
            const { user, perfil } = await restoreSessionFromRefresh();
            dispatch({
              type: "INIT",
              payload: {
                isAuthenticated: true,
                user,
                perfil,
              },
            });
          } catch {
            clearAuthStorage();
            dispatch({
              type: "INIT",
              payload: {
                isAuthenticated: false,
                user: null,
                perfil: null,
              },
            });
          }
        } else {
          if (accessToken) {
            clearAuthStorage();
          }
          dispatch({
            type: "INIT",
            payload: {
              isAuthenticated: false,
              user: null,
              perfil: null
            }
          });
        }
      } catch (err) {
        console.error("Initialization error:", err);
        clearAuthStorage();
        dispatch({
          type: "INIT",
          payload: {
            isAuthenticated: false,
            user: null,
            perfil: null,
          },
        });
      } finally {
        authBootstrapping = false;
      }
    };

    initializeAuth();
  }, [setSession, restoreSessionFromRefresh]);

  useEffect(() => {
    registerSessionRefreshed(({ user, perfil }) => {
      dispatch({
        type: "UPDATE_USER",
        payload: { user, perfil },
      });
    });
    return () => registerSessionRefreshed(null);
  }, []);

  /** Renueva JWT en segundo plano (solo tras init, para no competir con F5). */
  useEffect(() => {
    if (!state.isInitialized) return undefined;

    const intervalMs = 45 * 60 * 1000;
    const tick = async () => {
      if (!getStoredRefreshToken() || authBootstrapping) return;
      try {
        await refreshAccessToken();
      } catch {
        /* silencioso */
      }
    };
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [state.isInitialized, refreshAccessToken]);

  /** Rutas de sesión (login, OAuth callback, 2FA) deben renderizar aunque la init tarde. */
  const isSessionPublicRoute = () => {
    const path = window.location.pathname || "";
    return /\/session\/(signin|signup|oauth-callback|two-factor|two-factor-setup|forgot-password)/.test(path);
  };

  if (!state.isInitialized && !isSessionPublicRoute()) {
    return <Loading />;
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: "JWT",
        login,
        loginWithOAuthExchange,
        resumeSession,
        getLastSessionUser,
        verify2fa,
        completeMandatory2fa,
        logout,
        switchAccount,
        register,
        validar_perfil,
        refreshUser,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
export { AuthProvider };