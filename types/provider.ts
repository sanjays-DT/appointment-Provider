export interface Provider {
  _id?: string;
  id?: string;
  name: string;
  email?: string;
  speciality: string;
  city: string;
  address: string;
  hourlyPrice: number;
  categoryId: string | { _id: string; name?: string };
  bio?: string;
  weeklyAvailability?: any[];
  avatar?: string;
}
