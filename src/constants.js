export const CATEGORIES = [
  'Food', 'Groceries', 'Transport', 'Shopping', 'Bills', 
  'Entertainment', 'Health', 'Education', 'Beverages', 'Quick Commerce', 'Miscellaneous'
];

export const CATEGORY_COLORS = {
  Food: '#FF6B6B',
  Groceries: '#4ECDC4',
  Transport: '#45B7D1',
  Shopping: '#9B5DE5',
  Bills: '#F15BB5',
  Entertainment: '#00F5D4',
  Health: '#00BBF9',
  Education: '#FEE440',
  Beverages: '#8B5A2B', // Coffee & Drinks
  'Quick Commerce': '#FF9F1C', // Instamart, Blinkit, etc
  Miscellaneous: '#A0AEC0', // Slate Gray
};

export const DEFAULT_BUDGETS = {
  Food: 6000, Groceries: 4000, Transport: 3000, Shopping: 2000, Bills: 5000,
  Entertainment: 2000, Health: 1000, Education: 1000, Beverages: 1500, 'Quick Commerce': 3000, Miscellaneous: 2000,
};

export const MERCHANT_KEYWORDS = {
  'Quick Commerce': ['blinkit', 'zepto', 'instamart', 'dunzo', 'swiggy instamart'],
  Beverages: ['starbucks', 'ccd', 'coffee', 'chai', 'tea', 'cafe', 'boba', 'juice'],
  Food: ['zomato', 'swiggy', 'mcdonalds', 'kfc', 'dominos', 'pizza hut', 'restaurant', 'eatery', 'dinner', 'lunch', 'burger'],
  Groceries: ['dmart', 'bigbasket', 'reliance fresh', 'supermarket', 'grocery', 'spencers'],
  Transport: ['uber', 'ola', 'rapido', 'metro', 'irctc', 'petrol', 'fuel', 'hpcl', 'indianoil', 'bharat petroleum'],
  Shopping: ['amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'zara', 'h&m'],
  Bills: ['airtel', 'jio', 'vi', 'bescom', 'electricity', 'water', 'gas', 'broadband', 'recharge', 'wifi'],
  Entertainment: ['netflix', 'prime', 'hotstar', 'spotify', 'bookmyshow', 'pvr', 'inox', 'movie'],
  Health: ['apollo', 'pharmacy', 'hospital', 'clinic', 'netmeds', 'pharmeasy', 'medplus', 'prescription', 'chemical store', 'chemist', 'medical'],
  Education: ['udemy', 'coursera', 'byjus', 'unacademy', 'school', 'college', 'tuition', 'books', 'bookstore', 'stationery'],
};

export function categorizeExpense(merchantStr) {
  if (!merchantStr) return 'Miscellaneous';
  let lowerMerchant = merchantStr.toLowerCase().trim();
  for (const [category, keywords] of Object.entries(MERCHANT_KEYWORDS)) {
    if (keywords.some((k) => lowerMerchant.includes(k))) return category;
  }
  return 'Miscellaneous';
}
