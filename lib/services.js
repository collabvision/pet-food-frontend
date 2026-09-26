/**
 * Centralized API service layer for FurNest frontend.
 * Maps directly to API_DOCUMENTATION.md endpoints.
 * Base URL: http://localhost:5000/api/v1
 */
import { api } from './api';

// ─────────────────────────────────────────────
// 🔐 AUTH  /api/v1/auth
// ─────────────────────────────────────────────
export const authService = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }, { auth: false }),

  register: (name, email, password, confirmPassword, phone) =>
    api.post('/auth/register', { name, email, password, confirmPassword, phone }, { auth: false }),

  verifyEmail: (email, code) =>
    api.post('/auth/verify-email', { email, code }, { auth: false }),

  resendVerification: (email) =>
    api.post('/auth/resend-verification', { email }, { auth: false }),

  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }, { auth: false }),

  resetPassword: (email, code, newPassword, confirmNewPassword) =>
    api.post('/auth/reset-password', { email, code, newPassword, confirmNewPassword }, { auth: false }),

  changePassword: (currentPassword, newPassword, confirmNewPassword) =>
    api.patch('/auth/change-password', { currentPassword, newPassword, confirmNewPassword }),

  getMe: () => api.get('/auth/me'),

  logout: () => api.post('/auth/logout', {}),
};

// ─────────────────────────────────────────────
// 📦 CATEGORIES  /api/v1/categories
// ─────────────────────────────────────────────
export const categoryService = {
  getAll: () => api.get('/categories', { auth: false }),
  getById: (id) => api.get(`/categories/${id}`, { auth: false }),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.patch(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// ─────────────────────────────────────────────
// 🛍️ PRODUCTS  /api/v1/products
// ─────────────────────────────────────────────
export const productService = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/products${qs ? `?${qs}` : ''}`, { auth: false });
  },
  getBySlug: (slug) => api.get(`/products/slug/${slug}`, { auth: false }),
  getById: (id) => api.get(`/products/${id}`, { auth: false }),
  create: (data) => api.post('/products', data),
  createWithFiles: (formData) => api.postForm('/products', formData),
  update: (id, data) => api.patch(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// ─────────────────────────────────────────────
// 🛒 CART  /api/v1/cart
// ─────────────────────────────────────────────
export const cartService = {
  get: () => api.get('/cart'),
  addItem: (productId, quantity) => api.post('/cart/items', { productId, quantity }),
  updateItem: (productId, quantity) => api.patch(`/cart/items/${productId}`, { quantity }),
  removeItem: (productId) => api.delete(`/cart/items/${productId}`),
  clear: () => api.delete('/cart'),
};

// ─────────────────────────────────────────────
// 🚚 ORDERS  /api/v1/orders
// ─────────────────────────────────────────────
export const orderService = {
  create: (shippingAddress, paymentMethod, prescriptionId) =>
    api.post('/orders', { shippingAddress, paymentMethod, ...(prescriptionId ? { prescriptionId } : {}) }),

  getMyOrders: () => api.get('/orders'),
  getByOrderNumber: (orderNumber) => api.get(`/orders/number/${orderNumber}`),
  getById: (orderId) => api.get(`/orders/${orderId}`),
  cancel: (orderId, reason) => api.patch(`/orders/${orderId}/cancel`, { reason }),

  // Admin
  adminGetAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/orders/admin/all${qs ? `?${qs}` : ''}`);
  },
  adminUpdateStatus: (orderId, orderStatus, note) =>
    api.patch(`/orders/admin/${orderId}/status`, { status: orderStatus, note }),
};

// ─────────────────────────────────────────────
// ⚕️ PRESCRIPTIONS  /api/v1/prescriptions
// ─────────────────────────────────────────────
export const prescriptionService = {
  upload: (formData) => api.postForm('/prescriptions/upload', formData),
  getMy: () => api.get('/prescriptions'),
  getById: (id) => api.get(`/prescriptions/${id}`),

  // Admin
  adminGetAll: () => api.get('/prescriptions/admin/all'),
  adminReview: (id, status, rejectionReason = '') =>
    api.patch(`/prescriptions/admin/${id}/review`, { status, rejectionReason }),
};

// ─────────────────────────────────────────────
// 💳 PAYMENTS  /api/v1/payments
// ─────────────────────────────────────────────
export const paymentService = {
  createOrder: (orderId) => api.post('/payments/create-order', { orderId }),
  verify: (razorpayOrderId, razorpayPaymentId, razorpaySignature) =>
    api.post('/payments/verify', { razorpayOrderId, razorpayPaymentId, razorpaySignature }),
  getMy: () => api.get('/payments'),
  getByOrderId: (orderId) => api.get(`/payments/order/${orderId}`),
  getById: (paymentId) => api.get(`/payments/${paymentId}`),
};

// ─────────────────────────────────────────────
// 🏭 INVENTORY  /api/v1/inventory  [Admin Only]
// ─────────────────────────────────────────────
export const inventoryService = {
  getAll: () => api.get('/inventory'),
  getByProduct: (productId) => api.get(`/inventory/${productId}`),
  initialize: (productId, stock, lowStockThreshold, allowBackorder) =>
    api.post('/inventory', { productId, stock, lowStockThreshold, allowBackorder }),
  addStock: (productId, quantity, reason) =>
    api.post(`/inventory/${productId}/add-stock`, { quantity, reason }),
  removeStock: (productId, quantity, reason) =>
    api.post(`/inventory/${productId}/remove-stock`, { quantity, reason }),
  reserve: (productId, quantity) =>
    api.post(`/inventory/${productId}/reserve`, { quantity }),
  releaseReservation: (productId, quantity) =>
    api.post(`/inventory/${productId}/release-reservation`, { quantity }),
};

// ─────────────────────────────────────────────
// 🔔 NOTIFICATIONS  /api/v1/notifications
// ─────────────────────────────────────────────
export const notificationService = {
  getMy: () => api.get('/notifications'),
  getByOrder: (orderId) => api.get(`/notifications/order/${orderId}`),
  getById: (id) => api.get(`/notifications/${id}`),
  adminGetAll: () => api.get('/notifications/admin/all'),
  adminSendOrderStatus: (data) => api.post('/notifications/order-status', data),
};

// ─────────────────────────────────────────────
// 🔄 RETURNS  /api/v1/returns
// ─────────────────────────────────────────────
export const returnService = {
  request: (orderId, reason, comments, items) =>
    api.post('/returns', { orderId, reason, description: comments || "", items }),
  getMy: () => api.get('/returns'),
  getByNumber: (returnNumber) => api.get(`/returns/number/${returnNumber}`),
  getById: (returnId) => api.get(`/returns/${returnId}`),
  adminGetAll: () => api.get('/returns/admin/all'),
  adminUpdateStatus: (returnId, status, adminNote, extraPayload = {}) =>
    api.patch(`/returns/admin/${returnId}/status`, { status, adminNote, ...extraPayload }),
};

// ─────────────────────────────────────────────
// 🚛 SHIPPING  /api/v1/shipping
// ─────────────────────────────────────────────
export const shippingService = {
  getMy: () => api.get('/shipping'),
  trackByNumber: (trackingNumber) => api.get(`/shipping/tracking/${trackingNumber}`),
  getById: (shipmentId) => api.get(`/shipping/${shipmentId}`),
  adminGetAll: () => api.get('/shipping/admin/all'),
  adminCreate: (orderId, carrier, trackingNumber, estimatedDeliveryDate) =>
    api.post('/shipping', { orderId, carrier, trackingNumber, estimatedDeliveryDate }),
  adminUpdateStatus: (shipmentId, status, location, note) =>
    api.patch(`/shipping/${shipmentId}/status`, { status, location, note }),
};
