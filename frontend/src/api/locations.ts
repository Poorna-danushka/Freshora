import type { Location } from '@/types';
import apiClient from './client';

// Mock data for development
const COLOMBO_ZONES: Location[] = [
  { id: 'col-01', name: 'Colombo 01', area: 'Fort', city: 'Colombo', postalCode: '00100' },
  { id: 'col-02', name: 'Colombo 02', area: 'Slave Island', city: 'Colombo', postalCode: '00200' },
  { id: 'col-03', name: 'Colombo 03', area: 'Kollupitiya', city: 'Colombo', postalCode: '00300' },
  { id: 'col-04', name: 'Colombo 04', area: 'Bambalapitiya', city: 'Colombo', postalCode: '00400' },
  { id: 'col-05', name: 'Colombo 05', area: 'Havelock Town', city: 'Colombo', postalCode: '00500' },
  { id: 'col-06', name: 'Colombo 06', area: 'Wellawatte', city: 'Colombo', postalCode: '00600' },
  { id: 'col-07', name: 'Colombo 07', area: 'Cinnamon Gardens', city: 'Colombo', postalCode: '00700' },
  { id: 'col-08', name: 'Colombo 08', area: 'Borella', city: 'Colombo', postalCode: '00800' },
  { id: 'col-09', name: 'Colombo 09', area: 'Dematagoda', city: 'Colombo', postalCode: '00900' },
  { id: 'col-10', name: 'Colombo 10', area: 'Maradana', city: 'Colombo', postalCode: '01000' },
  { id: 'col-11', name: 'Colombo 11', area: 'Pettah', city: 'Colombo', postalCode: '01100' },
  { id: 'col-15', name: 'Colombo 15', area: 'Mutwal', city: 'Colombo', postalCode: '01500' },
  { id: 'dehiwala', name: 'Dehiwala', area: 'Dehiwala', city: 'Colombo', postalCode: '10350' },
  { id: 'mt-lavinia', name: 'Mount Lavinia', area: 'Mount Lavinia', city: 'Colombo', postalCode: '10370' },
  { id: 'nugegoda', name: 'Nugegoda', area: 'Nugegoda', city: 'Colombo', postalCode: '10250' },
  { id: 'rajagiriya', name: 'Rajagiriya', area: 'Rajagiriya', city: 'Colombo', postalCode: '10100' },
  { id: 'battaramulla', name: 'Battaramulla', area: 'Battaramulla', city: 'Colombo', postalCode: '10120' },
  { id: 'maharagama', name: 'Maharagama', area: 'Maharagama', city: 'Colombo', postalCode: '10280' },
  { id: 'kotte', name: 'Sri Jayawardenepura Kotte', area: 'Kotte', city: 'Colombo', postalCode: '10100' },
  { id: 'moratuwa', name: 'Moratuwa', area: 'Moratuwa', city: 'Colombo', postalCode: '10400' },
];

export const locationApi = {
  getLocations: async (): Promise<Location[]> => {
    try {
      const res = await apiClient.get<{ data: Location[] }>('/locations');
      return res.data.data;
    } catch {
      return COLOMBO_ZONES;
    }
  },

  searchLocations: async (query: string): Promise<Location[]> => {
    if (!query.trim()) return COLOMBO_ZONES;
    try {
      const res = await apiClient.get<{ data: Location[] }>(`/locations/search?q=${query}`);
      return res.data.data;
    } catch {
      const q = query.toLowerCase();
      return COLOMBO_ZONES.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.area.toLowerCase().includes(q) ||
          (l.postalCode && l.postalCode.includes(q))
      );
    }
  },
};
