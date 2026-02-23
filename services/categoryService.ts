import axios from '../lib/axios';

// Get all categories
export const getCategories = async () => {
  return await axios.get('/categories');
};

// Get single category by ID
export const getSingleCategory = async (id: string) => {
  return await axios.get(`/categories/${id}`);
};


