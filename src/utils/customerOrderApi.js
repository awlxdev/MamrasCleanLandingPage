const API_URL = "/api/orders";

function getAuthHeaders() {
  const token = sessionStorage.getItem("mamras_clean_user_token");

  if (!token) {
    throw new Error("Sesi login tidak ditemukan. Silakan login kembali.");
  }

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers
    }
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      sessionStorage.removeItem("mamras_clean_user_token");
      sessionStorage.removeItem("mamras_clean_user");
      window.location.assign("/");
    }

    const validationMessage = result.errors
      ? Object.values(result.errors).flat().join(" ")
      : "";

    throw new Error(
      validationMessage ||
      result.message ||
      "Permintaan pesanan gagal diproses."
    );
  }

  return result;
}

export async function getCustomerOrders(page = 1, view = "active") {
  return request(`${API_URL}?page=${page}&view=${view}`);
}

export async function getCustomerOrder(id) {
  return request(`${API_URL}/${id}`);
}

export async function createCustomerOrder(payload) {
  return request(API_URL, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function cancelCustomerOrder(id) {
  return request(`${API_URL}/${id}/cancel`, {
    method: "PATCH"
  });
}