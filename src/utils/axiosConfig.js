import axios from 'axios';

// baseURL إلى رابط ngrok
axios.defaults.baseURL = 'http://127.0.0.1:8000';

// ضروري لإرسال الكوكيز مثل XSRF-TOKEN و session
axios.defaults.withCredentials = true;

// (اختياري) إرسال XSRF-TOKEN تلقائيًا من الكوكيز
axios.interceptors.request.use((config) => {
  const getCookie = (name) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  };

  const csrfToken = getCookie('XSRF-TOKEN');
  if (csrfToken) {
    config.headers['X-XSRF-TOKEN'] = csrfToken;
  }

  return config;
}, (error) => Promise.reject(error));

export default axios;
