import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type State = {
  currentVehicleId: number | null;
  setCurrentVehicleId: (id: number | null) => void;
};

export const useCurrentVehicleStore = create<State>()(
  persist(
    (set) => ({
      currentVehicleId: null,
      setCurrentVehicleId: (id) => set({ currentVehicleId: id }),
    }),
    {
      name: 'current-vehicle',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
