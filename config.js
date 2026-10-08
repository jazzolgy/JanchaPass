// JanchaPass browser map SDK configuration.
// Only browser-public keys belong here: Naver Maps ncpKeyId and Kakao JavaScript app key.
// NEVER put REST API secrets, admin keys, or private tokens here.
window.JANCHA_MAP_KEYS = { naver: '', kakao: '', google: '' };

// Public Cloudflare Worker endpoint for Naver local place search (no credentials).
window.JANCHA_SEARCH_API_URL = 'https://janchapass.musehh.workers.dev';
