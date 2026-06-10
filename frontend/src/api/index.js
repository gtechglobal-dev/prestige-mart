import API from './axios'

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/change-password', data),
}

export const productAPI = {
  getAll: (params) => API.get('/products', { params }),
  getBySlug: (slug) => API.get(`/products/${slug}`),
  getFeatured: () => API.get('/products/featured'),
  getBestSellers: () => API.get('/products/best-sellers'),
}

export const categoryAPI = {
  getAll: () => API.get('/categories'),
  getBySlug: (slug) => API.get(`/categories/${slug}`),
}

export const cartAPI = {
  get: () => API.get('/cart'),
  add: (data) => API.post('/cart/add', data),
  updateItem: (itemId, data) => API.put(`/cart/item/${itemId}`, data),
  removeItem: (itemId) => API.delete(`/cart/item/${itemId}`),
  clear: () => API.delete('/cart/clear'),
}

export const orderAPI = {
  create: (data) => API.post('/orders', data),
  getAll: () => API.get('/orders'),
  get: (id) => API.get(`/orders/${id}`),
  cancel: (id, data) => API.put(`/orders/${id}/cancel`, data),
}

export const wishlistAPI = {
  get: () => API.get('/wishlist'),
  add: (productId) => API.post('/wishlist/add', { productId }),
  remove: (productId) => API.delete(`/wishlist/${productId}`),
}

export const reviewAPI = {
  create: (data) => API.post('/reviews', data),
  getByProduct: (productId) => API.get(`/reviews/product/${productId}`),
}

export const couponAPI = {
  validate: (data) => API.post('/coupons/validate', data),
}

export const paymentAPI = {
  initializePaystack: (data) => API.post('/payments/paystack/initialize', data),
  verifyPaystack: (ref) => API.get(`/payments/paystack/verify/${ref}`),
  initializeFlutterwave: (data) => API.post('/payments/flutterwave/initialize', data),
  getTransactions: () => API.get('/payments/transactions'),
}

export const userAPI = {
  getAddresses: () => API.get('/users/addresses'),
  createAddress: (data) => API.post('/users/addresses', data),
  updateAddress: (id, data) => API.put(`/users/addresses/${id}`, data),
  deleteAddress: (id) => API.delete(`/users/addresses/${id}`),
}

export const adminAPI = {
  getDashboard: () => API.get('/admin/dashboard'),
  getOrders: (params) => API.get('/admin/orders', { params }),
  updateOrderStatus: (id, data) => API.put(`/admin/orders/${id}/status`, data),
  getCustomers: (params) => API.get('/admin/customers', { params }),
  getCustomer: (id) => API.get(`/admin/customers/${id}`),
  createProduct: (data) => API.post('/admin/products', data),
  updateProduct: (id, data) => API.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => API.delete(`/admin/products/${id}`),
  createCoupon: (data) => API.post('/admin/coupons', data),
  getCoupons: () => API.get('/admin/coupons'),
  getAnalytics: () => API.get('/admin/analytics'),
}

export const notificationAPI = {
  getAll: () => API.get('/notifications'),
  markAsRead: (id) => API.put(`/notifications/${id}/read`),
  markAllAsRead: () => API.put('/notifications/read-all'),
}

export const searchAPI = {
  search: (q) => API.get('/search', { params: { q } }),
}
