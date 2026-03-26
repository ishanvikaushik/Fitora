import axiosInstance from './axiosConfig';

export const authAPI = {
  signup: (email: string, password: string, name: string) =>
    axiosInstance.post('/auth/signup', { email, password, name }),

  login: (email: string, password: string) =>
    axiosInstance.post('/auth/login', { email, password }),

  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  },
};

export const clothingAPI = {
  getAllClothes: () => axiosInstance.get('/clothes'),

  getClothingById: (id: string) => axiosInstance.get(`/clothes/${id}`),

  addClothing: (data: FormData) =>
    axiosInstance.post('/clothes', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateClothing: (id: string, data: FormData) =>
    axiosInstance.put(`/clothes/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteClothing: (id: string) => axiosInstance.delete(`/clothes/${id}`),
};

export const uploadAPI = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return axiosInstance.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const outfitAPI = {
  generateOutfit: (occasion: string, weather: string, preference: string) =>
    axiosInstance.post('/outfits/generate', { occasion, weather, preference }),

  saveOutfit: (outfitData: unknown) =>
    axiosInstance.post('/outfits/save', outfitData),

  getSavedOutfits: () => axiosInstance.get('/outfits/saved'),

  deleteOutfit: (id: string) => axiosInstance.delete(`/outfits/${id}`),
};
