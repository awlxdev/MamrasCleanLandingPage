export function openWhatsAppIfAuthenticated(url) {
  const token = sessionStorage.getItem("mamras_clean_user_token");

  if (!token) {
    window.dispatchEvent(new Event("mamras:require-auth"));
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}
