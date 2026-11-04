// Sample data only. There is no database or server.
export const DEMO_STAFF = [
  { name: "Juan", password: "brewm123" },
  { name: "Maria", password: "brewm123" },
];
export const DEMO_ADMIN = { username: "admin", password: "brewm123" };

export const CATEGORIES = ["All", "Espresso", "Non-Coffee", "Refreshers", "Pastry"];

export const PRODUCTS = [
  { id: 1, name: "Americano", category: "Espresso", price: 100 },
  { id: 2, name: "Cafe Latte", category: "Espresso", price: 120 },
  { id: 3, name: "Spanish Latte", category: "Espresso", price: 140 },
  { id: 4, name: "Mocha Cloud", category: "Espresso", price: 140 },
  { id: 5, name: "Matcha Latte", category: "Non-Coffee", price: 140 },
  { id: 6, name: "Strawberry Milk", category: "Non-Coffee", price: 120 },
  { id: 7, name: "Chocolate Milk", category: "Non-Coffee", price: 120 },
  { id: 8, name: "Blue Lagoon", category: "Refreshers", price: 130 },
  { id: 9, name: "Blueberry Lime", category: "Refreshers", price: 130 },
  { id: 10, name: "Croissant", category: "Pastry", price: 90 },
  { id: 11, name: "Cinnamon Roll", category: "Pastry", price: 110 },
  { id: 12, name: "Banana Bread", category: "Pastry", price: 85 },
];

export const ORDER_TYPES = ["Pickup", "Delivery", "Dine In"];
export const TAX_RATE = 0.05;

const today = new Date().toISOString().slice(0, 10);
export const SEED_ORDERS = [
  { orderNumber: 1, customer: "Ana", staff: "Juan", items: "Americano x2, Croissant x1", orderType: "Dine In", total: 290, time: "08:12 AM", date: today },
  { orderNumber: 2, customer: "Guest", staff: "Maria", items: "Cafe Latte x1", orderType: "Pickup", total: 126, time: "09:05 AM", date: today },
  { orderNumber: 3, customer: "Ben", staff: "Juan", items: "Spanish Latte x2", orderType: "Delivery", total: 294, time: "10:30 AM", date: today },
  { orderNumber: 4, customer: "Carla", staff: "Maria", items: "Matcha Latte x1, Banana Bread x1", orderType: "Dine In", total: 236, time: "11:47 AM", date: today },
  { orderNumber: 5, customer: "Guest", staff: "Juan", items: "Blue Lagoon x2", orderType: "Pickup", total: 273, time: "01:15 PM", date: today },
];
