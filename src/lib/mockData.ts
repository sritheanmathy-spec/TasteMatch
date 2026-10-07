// src/lib/mockData.ts

export type FriendVisit = {
  id: string;
  friendName: string;
  avatar: string;
  schoolGrade: string;
  dishName: string;
  restaurantName: string;
  reaction: string;
  comment: string;
  rating: number;
  timeAgo: string;
  dishId: number;
  imageUrl: string;
};

export type MockDish = {
  id: number;
  name: string;
  restaurant_name: string;
  category: string;
  description: string;
  image_url: string;
  price?: string;
  averageRating: number;
  reviewCount: number;
  spice_level: number;
  sweetness_level: number;
  tag?: string;
  studentBudgetRating?: string;
  examStudyFuelScore?: number;
  friendRecommendation?: {
    friendName: string;
    grade: string;
    quote: string;
  };
};

export const FRIEND_VISITS: FriendVisit[] = [
  {
    id: "fv-1",
    friendName: "Rohan M.",
    avatar: "🧑‍💻",
    schoolGrade: "Class 11-A",
    dishName: "Crispy Peri Peri Fries",
    restaurantName: "The Fries Factory",
    reaction: "🔥 Best Recess Snack",
    comment: "Crunch is insane, and the garlic mayo balance is perfect for a 15-min break!",
    rating: 5,
    timeAgo: "25m ago",
    dishId: 103,
    imageUrl: "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "fv-2",
    friendName: "Priya Sharma",
    avatar: "👩‍🎨",
    schoolGrade: "Class 10-C",
    dishName: "Double Cheese Burst Pizza",
    restaurantName: "Crust & Craft",
    reaction: "🧀 Cheese Pull Heaven",
    comment: "Split this with 3 friends after math coaching. Absolute comfort food!",
    rating: 5,
    timeAgo: "1h ago",
    dishId: 102,
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "fv-3",
    friendName: "Aryan K.",
    avatar: "⚡",
    schoolGrade: "Class 12-B",
    dishName: "Steamed Kurkure Momos",
    restaurantName: "Dragon Delights",
    reaction: "🌶️ Spicy Wake-up Call",
    comment: "The red garlic chutney is fiery! Instantly woke me up during evening study session.",
    rating: 4.8,
    timeAgo: "2h ago",
    dishId: 104,
    imageUrl: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b4?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "fv-4",
    friendName: "Sneha Patel",
    avatar: "✨",
    schoolGrade: "Class 11-B",
    dishName: "Molten Chocolate Lava Cake",
    restaurantName: "Sweet Sin Bakery",
    reaction: "🍫 Pure Exam Therapy",
    comment: "Warm molten center cures any test stress. 10/10 would recommend!",
    rating: 5,
    timeAgo: "3h ago",
    dishId: 105,
    imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "fv-5",
    friendName: "Karthik R.",
    avatar: "🏏",
    schoolGrade: "Class 10-A",
    dishName: "Hyderabadi Dum Biryani",
    restaurantName: "Paradise Spice House",
    reaction: "👑 Supreme Feast",
    comment: "Celebrated after our sports match here. Huge portion, aromatic basmati rice!",
    rating: 4.9,
    timeAgo: "4h ago",
    dishId: 101,
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80",
  },
];

export const MOCK_DISHES: MockDish[] = [
  {
    id: 101,
    name: "Hyderabadi Dum Biryani",
    restaurant_name: "Paradise Spice House",
    category: "Biryani",
    description: "Fragrant basmati rice layered with aromatic spices, caramelized onions, and tender marinated pieces.",
    image_url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80",
    price: "₹240",
    averageRating: 4.9,
    reviewCount: 342,
    spice_level: 4,
    sweetness_level: 1,
    tag: "Crowd Favorite 🔥",
    studentBudgetRating: "Pocket Friendly (Splits easily)",
    examStudyFuelScore: 92,
    friendRecommendation: {
      friendName: "Karthik R. (10-A)",
      grade: "Class 10-A",
      quote: "Best shared feast after exams!",
    },
  },
  {
    id: 102,
    name: "Double Cheese Burst Pizza",
    restaurant_name: "Crust & Craft",
    category: "Italian",
    description: "Hand-tossed crust overloaded with mozzarella, cheddar, bell peppers, olives, and herb marinara.",
    image_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
    price: "₹299",
    averageRating: 4.8,
    reviewCount: 289,
    spice_level: 2,
    sweetness_level: 2,
    tag: "Cheesy Goodness 🧀",
    studentBudgetRating: "Squad Favorite",
    examStudyFuelScore: 88,
    friendRecommendation: {
      friendName: "Priya S. (10-C)",
      grade: "Class 10-C",
      quote: "Cheese pull is legendary!",
    },
  },
  {
    id: 103,
    name: "Crispy Peri Peri Fries",
    restaurant_name: "The Fries Factory",
    category: "Fast Food",
    description: "Golden crispy potato fries generously tossed in zesty peri-peri seasoning with garlic mayo dip.",
    image_url: "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=800&auto=format&fit=crop&q=80",
    price: "₹120",
    averageRating: 4.7,
    reviewCount: 198,
    spice_level: 4,
    sweetness_level: 1,
    tag: "Snack King 🍟",
    studentBudgetRating: "Under ₹150 Gold",
    examStudyFuelScore: 85,
    friendRecommendation: {
      friendName: "Rohan M. (11-A)",
      grade: "Class 11-A",
      quote: "Top pick during 15-min break!",
    },
  },
  {
    id: 104,
    name: "Steamed Kurkure Momos",
    restaurant_name: "Dragon Delights",
    category: "Chinese",
    description: "Crispy coated steamed dumplings served with blazing spicy red garlic chutney and creamy mayo.",
    image_url: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b4?w=800&auto=format&fit=crop&q=80",
    price: "₹130",
    averageRating: 4.8,
    reviewCount: 215,
    spice_level: 5,
    sweetness_level: 1,
    tag: "Super Spicy 🌶️",
    studentBudgetRating: "Budget Street Bite",
    examStudyFuelScore: 90,
    friendRecommendation: {
      friendName: "Aryan K. (12-B)",
      grade: "Class 12-B",
      quote: "Chutney wakes you right up!",
    },
  },
  {
    id: 105,
    name: "Molten Chocolate Lava Cake",
    restaurant_name: "Sweet Sin Bakery",
    category: "Dessert",
    description: "Warm dark chocolate sponge cake with an irresistible flowing warm fudge center.",
    image_url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=80",
    price: "₹160",
    averageRating: 4.9,
    reviewCount: 412,
    spice_level: 1,
    sweetness_level: 5,
    tag: "Pure Joy 🍫",
    studentBudgetRating: "Reward Treat",
    examStudyFuelScore: 94,
    friendRecommendation: {
      friendName: "Sneha P. (11-B)",
      grade: "Class 11-B",
      quote: "Best exam relief dessert ever.",
    },
  },
  {
    id: 106,
    name: "Gourmet Smash Veggie Burger",
    restaurant_name: "Burger District",
    category: "Fast Food",
    description: "Crispy spiced vegetable patty, caramelised onions, pickles, cheese slice, and signature sauce in brioche.",
    image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80",
    price: "₹180",
    averageRating: 4.6,
    reviewCount: 167,
    spice_level: 2,
    sweetness_level: 2,
    tag: "Mega Crunchy 🍔",
    studentBudgetRating: "Satisfying Meal",
    examStudyFuelScore: 82,
  },
  {
    id: 107,
    name: "Spicy Schezwan Hakka Noodles",
    restaurant_name: "Wok & Roll",
    category: "Chinese",
    description: "Wok-tossed noodles with shredded vegetables, spring onions, and fiery house-made schezwan sauce.",
    image_url: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&auto=format&fit=crop&q=80",
    price: "₹170",
    averageRating: 4.7,
    reviewCount: 145,
    spice_level: 4,
    sweetness_level: 1,
    tag: "Wok Tossed 🥢",
    studentBudgetRating: "Big Portion Value",
    examStudyFuelScore: 87,
  },
  {
    id: 108,
    name: "Crispy Ghee Podi Masala Dosa",
    restaurant_name: "Dakshin Tiffin Room",
    category: "South Indian",
    description: "Golden paper-crisp fermented crepe spiced with gunpowder podi, pure ghee, potato masala, and 3 chutneys.",
    image_url: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop&q=80",
    price: "₹110",
    averageRating: 4.9,
    reviewCount: 520,
    spice_level: 3,
    sweetness_level: 1,
    tag: "Traditional Classic 🥞",
    studentBudgetRating: "Under ₹120 Champion",
    examStudyFuelScore: 95,
  },
  {
    id: 109,
    name: "Delhi Street Pani Puri (6 Pcs)",
    restaurant_name: "Chaat Chowk",
    category: "Fast Food",
    description: "Crisp puffed puris filled with boiled potatoes, chickpeas, and plunged in ice-cold mint and tamarind waters.",
    image_url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80",
    price: "₹60",
    averageRating: 4.9,
    reviewCount: 680,
    spice_level: 5,
    sweetness_level: 2,
    tag: "Street Hero 💧",
    studentBudgetRating: "Pocket Change (₹60)",
    examStudyFuelScore: 89,
  },
  {
    id: 110,
    name: "Iced Caramel Macchiato",
    restaurant_name: "The Bean Haven",
    category: "Beverage",
    description: "Chilled rich espresso poured over creamy milk, vanilla syrup, and finished with buttery caramel drizzle.",
    image_url: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80",
    price: "₹150",
    averageRating: 4.8,
    reviewCount: 230,
    spice_level: 1,
    sweetness_level: 4,
    tag: "Energy Booster ☕",
    studentBudgetRating: "All-Nighter Fuel",
    examStudyFuelScore: 98,
  },
  {
    id: 111,
    name: "Creamy Paneer Butter Masala",
    restaurant_name: "Punjab Junction",
    category: "Indian",
    description: "Melt-in-mouth cottage cheese cubes simmered in rich tomato, butter, and cashew gravy with kasuri methi.",
    image_url: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80",
    price: "₹260",
    averageRating: 4.8,
    reviewCount: 310,
    spice_level: 2,
    sweetness_level: 3,
    tag: "Comfort Feast 🍲",
    studentBudgetRating: "Family/Squad Dinner",
    examStudyFuelScore: 91,
  },
  {
    id: 112,
    name: "Brown Sugar Boba Milk Tea",
    restaurant_name: "Bubble Pop Café",
    category: "Beverage",
    description: "Chewy warm brown sugar tapioca pearls drowned in iced fresh organic milk and black tea.",
    image_url: "https://images.unsplash.com/photo-1558857563-b371033873b8?w=800&auto=format&fit=crop&q=80",
    price: "₹170",
    averageRating: 4.7,
    reviewCount: 190,
    spice_level: 1,
    sweetness_level: 5,
    tag: "Viral Sensation 🧋",
    studentBudgetRating: "Weekend Treat",
    examStudyFuelScore: 86,
  },
];
