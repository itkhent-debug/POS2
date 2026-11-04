import { useSyncExternalStore } from "react";
import { SEED_ORDERS } from "./data";

// Dummy "database": a tiny store kept in the browser's localStorage. Clear it with the Reset button.
const KEY = "brewm-demo-state";
const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || { orders: SEED_ORDERS, staff: null, admin: false };
  } catch {
    return { orders: SEED_ORDERS, staff: null, admin: false };
  }
};
let state = load();
const listeners = new Set();

function set(patch) {
  state = { ...state, ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage blocked: the demo still works until refresh
  }
  listeners.forEach((l) => l());
}

export const useStore = () => useSyncExternalStore((cb) => (listeners.add(cb), () => listeners.delete(cb)), () => state);

export const actions = {
  staffLogin: (name) => set({ staff: { name, since: new Date().toISOString() } }),
  staffLogout: () => set({ staff: null }),
  adminLogin: () => set({ admin: true }),
  adminLogout: () => set({ admin: false }),
  addOrder: (o) => set({ orders: [...state.orders, o] }),
  reset: () => set({ orders: SEED_ORDERS }),
};
