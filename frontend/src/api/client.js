import axios from 'axios';

const isProd = import.meta.env.PROD;

const api = axios.create({
  baseURL: isProd ? '/_/backend/api' : '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach admin key on every request if present
api.interceptors.request.use((config) => {
  const key = sessionStorage.getItem('adminKey');
  if (key) config.headers['x-admin-key'] = key;
  return config;
});

// Normalize error messages
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!err.response) {
      err.message = 'Cannot connect to server. Make sure the backend is running.';
    }
    return Promise.reject(err);
  }
);

export const submitConsultation  = (data)  => api.post('/consultations', data);
export const getSlots            = ()       => api.get('/consultations/slots');
export const placeOrder          = (data)  => api.post('/orders', data);
export const trackOrder          = (id)    => api.get(`/orders/${id}`);
export const trackPageView       = ()      => api.post('/analytics/pageview', {
  page: window.location.pathname,
  referrer: document.referrer,
}).catch(() => {}); // silent — never block the page

// Appointments
export const getBookedSlots      = (date)  => api.get('/appointments/slots', { params: { date } });
export const createAppointment   = (data)  => api.post('/appointments', data);

// Admin
export const adminStats         = ()           => api.get('/admin/stats');
export const adminConsultations = (params)     => api.get('/admin/consultations', { params });
export const adminOrders        = (params)     => api.get('/admin/orders', { params });
export const adminAppointments  = (params)     => api.get('/admin/appointments', { params });
export const updateConsultation = (id, data)   => api.patch(`/admin/consultations/${id}`, data);
export const updateOrder        = (id, data)   => api.patch(`/admin/orders/${id}`, data);
export const updateAppointment  = (id, data)   => api.patch(`/admin/appointments/${id}`, data);
export const deleteConsultation = (id)         => api.delete(`/admin/consultations/${id}`);
export const deleteOrder        = (id)         => api.delete(`/admin/orders/${id}`);
export const deleteAppointment  = (id)         => api.delete(`/admin/appointments/${id}`);

export default api;
