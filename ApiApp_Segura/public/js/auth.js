import { api } from "./api.js";

export const authState = {
  authenticated: false,
  user: null
};

export async function loadSession() {
  const session = await api.session();
  authState.authenticated = session.authenticated;
  authState.user = session.user;
  return authState;
}

export async function login(username, password) {
  const result = await api.login({ username, password });
  authState.authenticated = true;
  authState.user = result.user;
  return result;
}

export async function logout() {
  const result = await api.logout();
  authState.authenticated = false;
  authState.user = null;
  return result;
}

export function isAuthenticated() {
  return authState.authenticated;
}
