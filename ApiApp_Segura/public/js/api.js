export async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo completar la solicitud.");
  }

  return data;
}

export const api = {
  login(credentials) {
    return apiRequest("/login", {
      method: "POST",
      body: JSON.stringify(credentials)
    });
  },
  logout() {
    return apiRequest("/logout", { method: "POST" });
  },
  session() {
    return apiRequest("/session");
  },
  home() {
    return apiRequest("/api/home");
  },
  filtrar() {
    return apiRequest("/api/filtrar");
  },
  detalles(name) {
    return apiRequest(`/api/detalles/${name}`);
  }
};
