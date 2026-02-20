import axios from 'axios';

// Get all categories
export const getCategories = async () => {
  return await axios.get('http://localhost:5000/api/categories');
};

// Get single category by ID
export const getSingleCategory = async (id: string) => {
  return await axios.get(`/categories/${id}`);
};


