import axios from "axios";
import { apiClient } from "../contexts/JWTAuthContext";
import { authJWTConfig } from "../authJWTConfig";

const API_BASE = `${(authJWTConfig.domain || "").replace(/\/$/, "")}/api`;

export function verify2faChallenge(challengeToken, code, trustDevice = false) {
  return axios
    .post(`${API_BASE}/auth/2fa/verify`, {
      challenge_token: challengeToken,
      code,
      trust_device: !!trustDevice,
    })
    .then((r) => r.data);
}

export function mandatory2faInit(setupToken) {
  return axios
    .post(`${API_BASE}/auth/2fa/mandatory/init`, { setup_token: setupToken })
    .then((r) => r.data.result);
}

export function mandatory2faConfirm(setupToken, code) {
  return axios
    .post(`${API_BASE}/auth/2fa/mandatory/confirm`, { setup_token: setupToken, code })
    .then((r) => r.data);
}

export function status2fa() {
  return apiClient.get("/auth/2fa/status").then((r) => r.data.result);
}

export function setup2fa() {
  return apiClient.post("/auth/2fa/setup").then((r) => r.data.result);
}

export function confirm2fa(code) {
  return apiClient.post("/auth/2fa/confirm", { code }).then((r) => r.data);
}

export function disable2fa(code) {
  return apiClient.post("/auth/2fa/disable", { code }).then((r) => r.data);
}

export function regenerateRecovery2fa(code) {
  return apiClient.post("/auth/2fa/recovery/regenerate", { code }).then((r) => r.data);
}
