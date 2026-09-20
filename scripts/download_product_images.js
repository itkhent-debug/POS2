import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRODUCTS_MAP = [
  // Espresso (1-13)
  { id: 1, name: "Americano", query: "photo-1514432324607-a09d9b4aefdd" },
  { id: 2, name: "Cafe Latte", query: "photo-1570968915860-54d5c301fa9f" },
  { id: 3, name: "Spanish Latte", query: "photo-1534778101976-62847782c213" },
  { id: 4, name: "Mocha Cloud", query: "photo-1578314675249-a6910f80cc4e" },
  { id: 5, name: "Brown Sugar Ice Shake", query: "photo-1517701550927-30cf4ba1dba5" },
  { id: 6, name: "Salted Caramel Ice Shaken", query: "photo-1461023058943-07fcbe16d735" },
  { id: 7, name: "Pistachio Cream", query: "photo-1541167760496-1628856ab772" },
  { id: 8, name: "Lotus Biscoff Cream", query: "photo-1517256064527-09c73fc73e38" },
  { id: 9, name: "Barista Drink", query: "photo-1495474472287-4d71bcdd2085" },
  { id: 10, name: "Sea Salt Cream", query: "photo-1588776814546-1ffcf47267a5" },
  { id: 11, name: "Vanilla With Coffee Jelly", query: "photo-1559496417-e7f25cb247f3" },
  { id: 12, name: "Black Forrest", query: "photo-1572442388796-11668a67e53d" },
  { id: 13, name: "Ca Phe Trung (Vietnamese)", query: "photo-1509042239860-f550ce710b93" },

  // Non-Coffee (14-20)
  { id: 14, name: "Matcha Latte", query: "photo-1536256263959-770b48d82b0a" },
  { id: 15, name: "Strawberry Milk", query: "photo-1553530666-ba11a7da3888" },
  { id: 16, name: "Blueberry Milk", query: "photo-1550258987-190a2d41a8ba" },
  { id: 17, name: "Strawberry Matcha", query: "photo-1517256064527-09c73fc73e38" },
  { id: 18, name: "Chocolate Strawberry", query: "photo-1542990253-0d0f5be5f0ed" },
  { id: 19, name: "Milky White", query: "photo-1550583724-b2692b85b150" },
  { id: 20, name: "Chocolate Milk", query: "photo-1541658016709-82535e94bc69" },

  // Refreshers (21-24)
  { id: 21, name: "Strawberry Lychee Mojito", query: "photo-1513558161293-cdaf765ed2fd" },
  { id: 22, name: "Blue Lagoon", query: "photo-1551024709-8f23befc6f87" },
  { id: 23, name: "Blueberry Lime", query: "photo-1513558161293-cdaf765ed2fd" },
  { id: 24, name: "Sunrise Mocktail", query: "photo-1536935338788-846bb9981813" },

  // Blended - Coffee Based (25-30)
  { id: 25, name: "Darko Choco Chips", query: "photo-1572490122747-3968b75cc699" },
  { id: 26, name: "Darko Blended", query: "photo-1572490122747-3968b75cc699" },
  { id: 27, name: "Lotus Biscoff Blended", query: "photo-1577805947697-89e18249d767" },
  { id: 28, name: "Caramel Blended", query: "photo-1572490122747-3968b75cc699" },
  { id: 29, name: "Coffee Jelly Blended", query: "photo-1559496417-e7f25cb247f3" },
  { id: 30, name: "Caramel Coffee Jelly", query: "photo-1577805947697-89e18249d767" },

  // Blended - Non Coffee Based (31-39)
  { id: 31, name: "Chocolate Chips Blended", query: "photo-1572490122747-3968b75cc699" },
  { id: 32, name: "Nutella Oreo", query: "photo-1563805042-7684c019e1cb" },
  { id: 33, name: "Strawberry Cheesecake", query: "photo-1588776814546-1ffcf47267a5" },
  { id: 34, name: "Strawberry Oreo", query: "photo-1588776814546-1ffcf47267a5" },
  { id: 35, name: "Matcha Cream Blended", query: "photo-1536256263959-770b48d82b0a" },
  { id: 36, name: "Lotus Biscoff Creamcheese", query: "photo-1572490122747-3968b75cc699" },
  { id: 37, name: "Cookie n Cream Cheesecake", query: "photo-1563805042-7684c019e1cb" },
  { id: 38, name: "Caramel Cream Blended", query: "photo-1572490122747-3968b75cc699" },
  { id: 39, name: "Salted Caramel Cream", query: "photo-1461023058943-07fcbe16d735" },

  // Pasta (40-43)
  { id: 40, name: "Pesto Pasta", query: "photo-1621996346565-e3d5d6281694" },
  { id: 41, name: "Creamy Bacon Mushroom", query: "photo-1608897013039-887f21d8c804" },
  { id: 42, name: "Spicy Spaghetti", query: "photo-1551183053-bf91a1d81141" },
  { id: 43, name: "Spanish Sardines", query: "photo-1563379091339-03b21ab4a4f8" },

  // Chicken Wings (44-46)
  { id: 44, name: "3pcs Chicken Wings w/ Rice", query: "photo-1567620832903-9fc6debc209f" },
  { id: 45, name: "6pcs Chicken Wings (2 flavors)", query: "photo-1608039755401-742074f0548d" },
  { id: 46, name: "9pcs Chicken Wings (3 flavors)", query: "photo-1585703900468-13c7a978ad86" },

  // Burger (47-50)
  { id: 47, name: "Burger With Fries", query: "photo-1568901346375-23c9450c58cd" },
  { id: 48, name: "Cheese Burger With Fries", query: "photo-1550547660-d9450f859349" },
  { id: 49, name: "Egg Burger With Fries", query: "photo-1586190848861-99aa4a171e90" },
  { id: 50, name: "Overload With Fries", query: "photo-1594212699903-ec8a3eca50f5" },

  // Nachos (51-52)
  { id: 51, name: "Cheesy Beef Nachos", query: "photo-1513456852971-30c0b8199d4d" },
  { id: 52, name: "Cheesy Beef Fries", query: "photo-1585109649139-366815a0d713" },

  // Waffle (53-57)
  { id: 53, name: "Plain Waffle", query: "photo-1562376552-0d160a2f238d" },
  { id: 54, name: "Chocolate Waffle", query: "photo-1504400792618-912b7a972c72" },
  { id: 55, name: "Strawberry Waffle", query: "photo-1484723091739-30a097e8f929" },
  { id: 56, name: "Caramel Waffle", query: "photo-1562376552-0d160a2f238d" },
  { id: 57, name: "Biscoff Waffle", query: "photo-1562376552-0d160a2f238d" },

  // Iced Coffee (58-62)
  { id: 58, name: "Cafe Latte (Iced)", query: "photo-1517701550927-30cf4ba1dba5" },
  { id: 59, name: "Cafe Mocha", query: "photo-1572442388796-11668a67e53d" },
  { id: 60, name: "Caramel Latte", query: "photo-1461023058943-07fcbe16d735" },
  { id: 61, name: "Vanilla Latte", query: "photo-1534778101976-62847782c213" },
  { id: 62, name: "Spanish Latte (Iced)", query: "photo-1588776814546-1ffcf47267a5" },

  // Milk Tea (63-68)
  { id: 63, name: "Chocolate Milk Tea", query: "photo-1541658016709-82535e94bc69" },
  { id: 64, name: "Wintermelon Milk Tea", query: "photo-1558857563-b37cf0c7921e" },
  { id: 65, name: "Taro Milk Tea", query: "photo-1550258987-190a2d41a8ba" },
  { id: 66, name: "Matcha Milk Tea", query: "photo-1536256263959-770b48d82b0a" },
  { id: 67, name: "Red Velvet Milk Tea", query: "photo-1570778640167-27b2b7377854" },
  { id: 68, name: "Cheesecake Milk Tea", query: "photo-1588776814546-1ffcf47267a5" },

  // Fruit Tea (69-73)
  { id: 69, name: "Strawberry Fruit Tea", query: "photo-1513558161293-cdaf765ed2fd" },
  { id: 70, name: "Lychee Fruit Tea", query: "photo-1556679343-c7306c1976bc" },
  { id: 71, name: "Lemon Fruit Tea", query: "photo-1556679343-c7306c1976bc" },
  { id: 72, name: "Kiwi Fruit Tea", query: "photo-1544145945-f90425340c7e" },
  { id: 73, name: "Blueberry Fruit Tea", query: "photo-1497534446932-c925b458314e" },

  // Frappe (74-83)
  { id: 74, name: "Java Chips Frappe", query: "photo-1572490122747-3968b75cc699" },
  { id: 75, name: "Mocha Frappe", query: "photo-1579888944880-d9834124570c" },
  { id: 76, name: "Caramel Frappe", query: "photo-1577805947697-89e18249d767" },
  { id: 77, name: "Vanilla Frappe", query: "photo-1572490122747-3968b75cc699" },
  { id: 78, name: "Matcha Frappe", query: "photo-1536256263959-770b48d82b0a" },
  { id: 79, name: "Strawberry Frappe", query: "photo-1588776814546-1ffcf47267a5" },
  { id: 80, name: "Cookies & Cream Frappe", query: "photo-1563805042-7684c019e1cb" },
  { id: 81, name: "Red Velvet Frappe", query: "photo-1570778640167-27b2b7377854" },
  { id: 82, name: "Taro Frappe", query: "photo-1550258987-190a2d41a8ba" },
  { id: 83, name: "Cheesecake Frappe", query: "photo-1588776814546-1ffcf47267a5" },
];

const outDir = path.join(__dirname, '..', 'public', 'products');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log(`Starting image preparation for ${PRODUCTS_MAP.length} products...`);
  
  const queryCache = new Map();
  const uniqueQueries = [...new Set(PRODUCTS_MAP.map(p => p.query))];
  console.log(`Found ${uniqueQueries.length} unique curated images to download.`);

  for (let i = 0; i < uniqueQueries.length; i++) {
    const q = uniqueQueries[i];
    const url = `https://images.unsplash.com/${q}?auto=format&fit=crop&w=400&h=300&q=80`;
    try {
      console.log(`[${i + 1}/${uniqueQueries.length}] Downloading ${q}...`);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      queryCache.set(q, buf);
    } catch (err) {
      console.error(`Failed to download ${q}:`, err.message);
    }
  }

  let savedCount = 0;
  for (const item of PRODUCTS_MAP) {
    const buf = queryCache.get(item.query);
    if (buf) {
      const destPath = path.join(outDir, `${item.id}.jpg`);
      fs.writeFileSync(destPath, buf);
      savedCount++;
    }
  }

  console.log(`Done! Successfully saved ${savedCount}/${PRODUCTS_MAP.length} product images in ${outDir}`);
}

run().catch(console.error);
