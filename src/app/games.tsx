// src/app/games.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { COLORS, RADIUS, SPACING } from "../lib/theme";
import BottomNav from "../components/ui/BottomNav";

const { width } = Dimensions.get("window");

type GameMode = "quiz" | "wheel" | "clash" | "memory";

// ==========================================
// 1. QUIZ DATA & TYPES
// ==========================================
type Question = {
  id: number;
  question: string;
  subtitle: string;
  options: {
    emoji: string;
    text: string;
    traits: {
      ambition?: number;
      chill?: number;
      rebel?: number;
      sweet?: number;
    };
  }[];
};

const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "Recess with ₹100 pocket money! What's your winning order?",
    subtitle: "Your resource allocation reveals your economic instinct",
    options: [
      { emoji: "🍟", text: "Peri-Peri Fries (Max spice & crunch satisfaction)", traits: { rebel: 3, ambition: 1 } },
      { emoji: "💧", text: "6 Pani Puris + Extra Sukha Puri (Street king for ₹60)", traits: { chill: 3, rebel: 1 } },
      { emoji: "🍔", text: "Split a double burger with your bench partner (Teamwork)", traits: { sweet: 3, chill: 1 } },
      { emoji: "☕", text: "Iced Cold Coffee (Caffeine stamina for the next 3 classes)", traits: { ambition: 3, sweet: 1 } },
    ],
  },
  {
    id: 2,
    question: "Exam tomorrow morning! It's 11 PM and your brain is tired:",
    subtitle: "Your emergency response under deadline pressure",
    options: [
      { emoji: "🍫", text: "Dark Chocolate Brownie (Rapid glucose to memory centers)", traits: { sweet: 3, ambition: 1 } },
      { emoji: "🍜", text: "2-Min Maggi with extra masala (Warm comfort morale booster)", traits: { chill: 3, rebel: 1 } },
      { emoji: "🍕", text: "Leftover pizza slice (Zero prep, keep reading formulas)", traits: { ambition: 2, chill: 2 } },
      { emoji: "🍎", text: "Water & fresh almonds (Disciplined focus, sleep on time)", traits: { chill: 3, ambition: 2 } },
    ],
  },
  {
    id: 3,
    question: "School festival squad lunch! What role do you play in the order?",
    subtitle: "Your squad role reveals your social intelligence",
    options: [
      { emoji: "👑", text: "The Commander ('Follow me, I know the best stall deal!')", traits: { ambition: 3, rebel: 2 } },
      { emoji: "🤝", text: "The Diplomat ('Let's order 4 dishes so everyone tastes!')", traits: { sweet: 3, chill: 2 } },
      { emoji: "🔬", text: "The Analyst ('Check the star ratings & reviews first')", traits: { ambition: 2, sweet: 2 } },
      { emoji: "💸", text: "The Calculator ('Calculating exact UPI split to 50 paise')", traits: { chill: 2, ambition: 3 } },
    ],
  },
  {
    id: 4,
    question: "Spicy food cafeteria challenge! A dish has 5 ghost chillies:",
    subtitle: "Your physical risk appetite and pain threshold",
    options: [
      { emoji: "🔥", text: "First bite is mine! Capsaicin gives an adrenaline high!", traits: { rebel: 3, ambition: 2 } },
      { emoji: "🥛", text: "I'll do it, but only with a mango lassi backup", traits: { sweet: 2, chill: 2 } },
      { emoji: "🙅", text: "I protect my stomach and peace of mind, no thanks", traits: { chill: 3 } },
      { emoji: "📸", text: "I'll record the reaction video for the class group chat!", traits: { sweet: 2, rebel: 2 } },
    ],
  },
  {
    id: 5,
    question: "What is your secret food-mindset superpower?",
    subtitle: "The cognitive instinct driving your daily choices",
    options: [
      { emoji: "⚡", text: "Instant reboot: Savory food unlocks pure motivation", traits: { ambition: 3 } },
      { emoji: "🧠", text: "Sensory memory: I remember great meals for months", traits: { sweet: 2, chill: 2 } },
      { emoji: "🎁", text: "Generosity: I always save the crispiest fry for my buddy", traits: { sweet: 3 } },
      { emoji: "🎯", text: "Radar instinct: I can spot a sub-par dish before ordering", traits: { rebel: 3 } },
    ],
  },
];

type PersonaResult = {
  title: string;
  badge: string;
  archetype: string;
  description: string;
  strengths: string[];
  signatureDish: string;
  dishImage: string;
  studyHack: string;
  squadMatch: string;
  budgetSecret: string;
  stats: {
    brainpower: number;
    chillFactor: number;
    spiceDare: number;
    socialEnergy: number;
  };
};

const PERSONAS: Record<string, PersonaResult> = {
  ambition: {
    title: "The Midnight Hustler",
    badge: "⚡ 100% AMBITIOUS",
    archetype: "The Driven Visionary",
    description:
      "You thrive under pressure and turn late-night stress into pure momentum. You have big academic goals, high focus, and food is your ultimate rocket fuel.",
    strengths: ["Laser Focus", "High Stamina", "Natural Leader"],
    signatureDish: "Iced Caramel Macchiato + Peri Peri Fries",
    dishImage:
      "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80",
    studyHack: "💡 Pre-Exam Hack: Avoid heavy carbs 1h before exams to prevent sugar crashes; combine black coffee with almonds for peak alertness.",
    squadMatch: "🤝 Ideal Squad Partner: The Zen Comfort Seeker (balances your high-intensity drive).",
    budgetSecret: "💰 Budget Winner: Cold Coffee + Fries under ₹180 gives maximum alertness per rupee.",
    stats: { brainpower: 96, chillFactor: 64, spiceDare: 88, socialEnergy: 82 },
  },
  rebel: {
    title: "The Flavor Rebel",
    badge: "🌶️ 100% FEARLESS",
    archetype: "The Adrenaline Seeker",
    description:
      "Rules are suggestions, and mild food is boring! You love challenges, laugh in the face of spicy ghost chillies, and bring magnetic energy to your squad.",
    strengths: ["Bold Risk-Taker", "Life of the Party", "Zero Hesitation"],
    signatureDish: "Steamed Kurkure Momos + Spicy Schezwan Noodles",
    dishImage:
      "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b4?w=800&auto=format&fit=crop&q=80",
    studyHack: "💡 Pre-Exam Hack: Capsaicin in spicy food triggers endorphins that shake off sleepiness, but don't eat it immediately before an exam hall!",
    squadMatch: "🤝 Ideal Squad Partner: The Sweet Strategist (keeps the squad united after your bold plans).",
    budgetSecret: "💰 Budget Winner: Street Momos with spicy chutney (elite taste for ₹130).",
    stats: { brainpower: 84, chillFactor: 58, spiceDare: 99, socialEnergy: 95 },
  },
  chill: {
    title: "The Zen Comfort Seeker",
    badge: "🍜 100% UNBOTHERED",
    archetype: "The Peaceful Soul",
    description:
      "Nothing can rattle your calm. You value authentic friendships, warm comfort food, and zero drama. People love hanging out with you because you radiate relaxation.",
    strengths: ["Unshakeable Calm", "Super Loyal", "Master of Comfort"],
    signatureDish: "Hyderabadi Dum Biryani + Crispy Ghee Dosa",
    dishImage:
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80",
    studyHack: "💡 Pre-Exam Hack: Warm soups or comforting dal-rice stabilize serotonin, keeping your heart rate steady during high-pressure tests.",
    squadMatch: "🤝 Ideal Squad Partner: The Midnight Hustler (pushes you to aim higher while you keep them calm).",
    budgetSecret: "💰 Budget Winner: Ghee Masala Dosa (complete wholesome meal for ₹110).",
    stats: { brainpower: 88, chillFactor: 98, spiceDare: 60, socialEnergy: 78 },
  },
  sweet: {
    title: "The Sweet Strategist",
    badge: "🍩 100% CREATIVE",
    archetype: "The Radiant Optimist",
    description:
      "You have a big heart, creative mind, and an eye for aesthetics. You solve problems by keeping everyone motivated, and dessert is your guaranteed secret weapon.",
    strengths: ["High EQ & Empathy", "Creative Genius", "Spreads Joy"],
    signatureDish: "Molten Chocolate Lava Cake + Brown Sugar Boba",
    dishImage:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=80",
    studyHack: "💡 Pre-Exam Hack: High-percentage dark chocolate increases cerebral blood flow and dopamine, boosting memory recall for formulas.",
    squadMatch: "🤝 Ideal Squad Partner: The Flavor Rebel (they bring the hype, you bring the heart).",
    budgetSecret: "💰 Budget Winner: Shareable Lava Cake (₹160 split by 2 = pure happiness).",
    stats: { brainpower: 92, chillFactor: 86, spiceDare: 65, socialEnergy: 94 },
  },
};

// ==========================================
// 2. WHEEL DATA
// ==========================================
const WHEEL_ITEMS = [
  { text: "Hyderabadi Biryani 🍛", type: "dish", detail: "Royal feast! You deserve rich aromatic biryani today.", color: "#F59E0B" },
  { text: "STALL DARE: Tell your worst food story! 🎤", type: "dare", detail: "Share a hilarious food disaster with the stall crowd!", color: "#EF4444" },
  { text: "Cheesy Pizza 🍕", type: "dish", detail: "Cheese pull paradise! Grab a hot slice.", color: "#3B82F6" },
  { text: "STALL DARE: Staring contest with a friend! 👀", type: "dare", detail: "Challenge whoever is standing next to you. First to blink loses!", color: "#8B5CF6" },
  { text: "Kurkure Momos 🥟", type: "dish", detail: "Crispy outer crust with blazing red chutney!", color: "#10B981" },
  { text: "STALL DARE: Describe Biryani in 3 words 🗣️", type: "dare", detail: "Describe it without using 'good', 'tasty', or 'nice'!", color: "#EC4899" },
  { text: "Choco Lava Cake 🍫", type: "dish", detail: "Warm molten chocolate goodness coming your way.", color: "#6366F1" },
  { text: "STALL DARE: High-five 3 stall visitors! ✋", type: "dare", detail: "Spread the stall energy! High five 3 people around you!", color: "#14B8A6" },
];

// ==========================================
// 3. FOOD CLASH DATA
// ==========================================
const CLASH_ROUNDS = [
  {
    id: 1,
    title: "The King of Main Course",
    optionA: { name: "Hyderabadi Dum Biryani", emoji: "🍗", initialPct: 68 },
    optionB: { name: "Cheese Burst Pizza", emoji: "🍕", initialPct: 32 },
  },
  {
    id: 2,
    title: "Street Food Showdown",
    optionA: { name: "Delhi Crispy Pani Puri", emoji: "💧", initialPct: 61 },
    optionB: { name: "Steamed Kurkure Momos", emoji: "🥟", initialPct: 39 },
  },
  {
    id: 3,
    title: "Study Energy Fuel",
    optionA: { name: "Desi Masala Chai", emoji: "☕", initialPct: 54 },
    optionB: { name: "Iced Caramel Coffee", emoji: "🧋", initialPct: 46 },
  },
  {
    id: 4,
    title: "Midnight Craving",
    optionA: { name: "2 AM Cheesy Maggi", emoji: "🍜", initialPct: 73 },
    optionB: { name: "Fiery Schezwan Noodles", emoji: "🥢", initialPct: 27 },
  },
  {
    id: 5,
    title: "Sweet Finish",
    optionA: { name: "Molten Lava Cake", emoji: "🍫", initialPct: 59 },
    optionB: { name: "Hot Gulab Jamun with Ice Cream", emoji: "🍨", initialPct: 41 },
  },
];

// ==========================================
// 4. MEMORY BLITZ CARDS
// ==========================================
const MEMORY_ICONS = ["🍛", "🍕", "🥟", "🍫", "🍟", "🧋"];

type CardItem = {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
};

function generateMemoryCards(): CardItem[] {
  const paired = [...MEMORY_ICONS, ...MEMORY_ICONS];
  // Shuffle
  for (let i = paired.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [paired[i], paired[j]] = [paired[j], paired[i]];
  }
  return paired.map((icon, idx) => ({
    id: idx,
    icon,
    isFlipped: false,
    isMatched: false,
  }));
}

export default function GamesScreen() {
  const [activeTab, setActiveTab] = useState<GameMode>("quiz");
  const [totalXp, setTotalXp] = useState(450);

  // 1. Quiz state
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [traitsScore, setTraitsScore] = useState({ ambition: 0, rebel: 0, chill: 0, sweet: 0 });
  const [personaResult, setPersonaResult] = useState<PersonaResult | null>(null);

  // 2. Wheel state
  const [spinning, setSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState<(typeof WHEEL_ITEMS)[0] | null>(null);
  const spinAnim = useRef(new Animated.Value(0)).current;

  // 3. Clash state
  const [clashRound, setClashRound] = useState(0);
  const [clashVotes, setClashVotes] = useState<string[]>([]);
  const [selectedClashOption, setSelectedClashOption] = useState<"A" | "B" | null>(null);
  const [clashComplete, setClashComplete] = useState(false);

  // 4. Memory Blitz state
  const [cards, setCards] = useState<CardItem[]>(generateMemoryCards());
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [movesCount, setMovesCount] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [gameWon, setGameWon] = useState(false);

  // ==========================================
  // QUIZ LOGIC
  // ==========================================
  function handleSelectOption(option: (typeof QUIZ_QUESTIONS)[0]["options"][0]) {
    const newTraits = {
      ambition: traitsScore.ambition + (option.traits.ambition || 0),
      rebel: traitsScore.rebel + (option.traits.rebel || 0),
      chill: traitsScore.chill + (option.traits.chill || 0),
      sweet: traitsScore.sweet + (option.traits.sweet || 0),
    };
    setTraitsScore(newTraits);
    setTotalXp((prev) => prev + 25);

    if (currentQIndex + 1 < QUIZ_QUESTIONS.length) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      let bestTrait: keyof typeof newTraits = "ambition";
      let maxScore = -1;
      (Object.keys(newTraits) as (keyof typeof newTraits)[]).forEach((trait) => {
        if (newTraits[trait] > maxScore) {
          maxScore = newTraits[trait];
          bestTrait = trait;
        }
      });
      setPersonaResult(PERSONAS[bestTrait] || PERSONAS.ambition);
      setTotalXp((prev) => prev + 150);
    }
  }

  function resetQuiz() {
    setCurrentQIndex(0);
    setTraitsScore({ ambition: 0, rebel: 0, chill: 0, sweet: 0 });
    setPersonaResult(null);
  }

  // ==========================================
  // WHEEL LOGIC
  // ==========================================
  function spinTheWheel() {
    if (spinning) return;
    setSpinning(true);
    setWheelResult(null);

    const randomIndex = Math.floor(Math.random() * WHEEL_ITEMS.length);
    const targetDeg = 360 * 6 + randomIndex * (360 / WHEEL_ITEMS.length);

    spinAnim.setValue(0);
    Animated.timing(spinAnim, {
      toValue: targetDeg,
      duration: 3500,
      useNativeDriver: true,
    }).start(() => {
      setSpinning(false);
      setWheelResult(WHEEL_ITEMS[randomIndex]);
      setTotalXp((prev) => prev + 100);
    });
  }

  // ==========================================
  // CLASH LOGIC
  // ==========================================
  function handleClashVote(choice: "A" | "B") {
    if (selectedClashOption) return;
    setSelectedClashOption(choice);
    setTotalXp((prev) => prev + 50);

    setTimeout(() => {
      const currentRoundData = CLASH_ROUNDS[clashRound];
      const votedItem = choice === "A" ? currentRoundData.optionA.name : currentRoundData.optionB.name;
      const updatedVotes = [...clashVotes, votedItem];
      setClashVotes(updatedVotes);
      setSelectedClashOption(null);

      if (clashRound + 1 < CLASH_ROUNDS.length) {
        setClashRound(clashRound + 1);
      } else {
        setClashComplete(true);
        setTotalXp((prev) => prev + 200);
      }
    }, 900);
  }

  function resetClash() {
    setClashRound(0);
    setClashVotes([]);
    setSelectedClashOption(null);
    setClashComplete(false);
  }

  // ==========================================
  // MEMORY BLITZ LOGIC
  // ==========================================
  function handleCardPress(index: number) {
    if (cards[index].isFlipped || cards[index].isMatched || selectedIndices.length === 2) {
      return;
    }

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newSelected = [...selectedIndices, index];
    setSelectedIndices(newSelected);

    if (newSelected.length === 2) {
      setMovesCount((m) => m + 1);
      const [idx1, idx2] = newSelected;

      if (cards[idx1].icon === cards[idx2].icon) {
        // MATCH!
        setTimeout(() => {
          newCards[idx1].isMatched = true;
          newCards[idx2].isMatched = true;
          setCards(newCards);
          setSelectedIndices([]);
          setMatchedPairs((p) => {
            const next = p + 1;
            if (next === 6) {
              setGameWon(true);
              setTotalXp((x) => x + 350 * comboMultiplier);
            }
            return next;
          });
          setComboMultiplier((c) => c + 1);
          setTotalXp((x) => x + 80 * comboMultiplier);
        }, 400);
      } else {
        // NO MATCH
        setTimeout(() => {
          newCards[idx1].isFlipped = false;
          newCards[idx2].isFlipped = false;
          setCards(newCards);
          setSelectedIndices([]);
          setComboMultiplier(1);
        }, 900);
      }
    }
  }

  function resetMemoryGame() {
    setCards(generateMemoryCards());
    setSelectedIndices([]);
    setMatchedPairs(0);
    setMovesCount(0);
    setComboMultiplier(1);
    setGameWon(false);
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.push("/dashboard")} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Dashboard</Text>
          </Pressable>
          <View style={styles.xpPill}>
            <Text style={styles.xpPillText}>🏆 XP: {totalXp}</Text>
          </View>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.badgeLabel}>⭐ SCHOOL STALL ARCADIA ⭐</Text>
          <Text style={styles.headerTitle}>TasteMatch Arcade</Text>
          <Text style={styles.headerSubtitle}>
            Interactive food scanner, lucky spin, showdowns & reaction blitz!
          </Text>
        </View>
      </View>

      {/* TOP TABS */}
      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tabItem, activeTab === "quiz" && styles.activeTabItem]}
          onPress={() => setActiveTab("quiz")}
        >
          <Text style={[styles.tabItemText, activeTab === "quiz" && styles.activeTabItemText]}>
            🧠 Scanner
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabItem, activeTab === "wheel" && styles.activeTabItem]}
          onPress={() => setActiveTab("wheel")}
        >
          <Text style={[styles.tabItemText, activeTab === "wheel" && styles.activeTabItemText]}>
            🎡 Spin Wheel
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabItem, activeTab === "clash" && styles.activeTabItem]}
          onPress={() => setActiveTab("clash")}
        >
          <Text style={[styles.tabItemText, activeTab === "clash" && styles.activeTabItemText]}>
            🥊 Food Clash
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabItem, activeTab === "memory" && styles.activeTabItem]}
          onPress={() => setActiveTab("memory")}
        >
          <Text style={[styles.tabItemText, activeTab === "memory" && styles.activeTabItemText]}>
            ⚡ Blitz Match
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* ==============================================================
            MODE 1: MINDSET & PERSONALITY SCANNER
        ============================================================== */}
        {activeTab === "quiz" && (
          <View style={styles.quizWrapper}>
            {!personaResult ? (
              <View style={styles.questionCard}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${((currentQIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.questionCount}>
                  QUESTION {currentQIndex + 1} OF {QUIZ_QUESTIONS.length}
                </Text>
                <Text style={styles.questionTitle}>
                  {QUIZ_QUESTIONS[currentQIndex].question}
                </Text>
                <Text style={styles.questionSubtitle}>
                  {QUIZ_QUESTIONS[currentQIndex].subtitle}
                </Text>

                <View style={styles.optionsList}>
                  {QUIZ_QUESTIONS[currentQIndex].options.map((option, idx) => (
                    <Pressable
                      key={idx}
                      style={styles.optionButton}
                      onPress={() => handleSelectOption(option)}
                    >
                      <Text style={styles.optionEmoji}>{option.emoji}</Text>
                      <Text style={styles.optionText}>{option.text}</Text>
                      <Text style={styles.optionArrow}>→</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : (
              /* RESULT PERSONA SCREEN */
              <View style={styles.resultCard}>
                <View style={styles.resultBadgeContainer}>
                  <Text style={styles.resultBadge}>{personaResult.badge}</Text>
                </View>
                <Text style={styles.personaTitle}>{personaResult.title}</Text>
                <Text style={styles.personaArchetype}>{personaResult.archetype}</Text>

                <Text style={styles.personaDescription}>
                  {personaResult.description}
                </Text>

                {/* STATS BREAKDOWN */}
                <View style={styles.statsBox}>
                  <Text style={styles.statsBoxTitle}>📊 YOUR MINDSET RADAR</Text>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>🧠 Brainpower / Focus</Text>
                    <View style={styles.meterTrack}>
                      <View style={[styles.meterFill, { width: `${personaResult.stats.brainpower}%`, backgroundColor: "#60A5FA" }]} />
                    </View>
                    <Text style={styles.statValue}>{personaResult.stats.brainpower}%</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>🧘 Chill & Composure</Text>
                    <View style={styles.meterTrack}>
                      <View style={[styles.meterFill, { width: `${personaResult.stats.chillFactor}%`, backgroundColor: "#34D399" }]} />
                    </View>
                    <Text style={styles.statValue}>{personaResult.stats.chillFactor}%</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>🌶️ Spice & Risk Dare</Text>
                    <View style={styles.meterTrack}>
                      <View style={[styles.meterFill, { width: `${personaResult.stats.spiceDare}%`, backgroundColor: "#F87171" }]} />
                    </View>
                    <Text style={styles.statValue}>{personaResult.stats.spiceDare}%</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>✨ Social Vibe Index</Text>
                    <View style={styles.meterTrack}>
                      <View style={[styles.meterFill, { width: `${personaResult.stats.socialEnergy}%`, backgroundColor: "#FBBF24" }]} />
                    </View>
                    <Text style={styles.statValue}>{personaResult.stats.socialEnergy}%</Text>
                  </View>
                </View>

                {/* SIGNATURE DISH MATCH */}
                <View style={styles.signatureDishBox}>
                  <Text style={styles.signatureDishHeader}>🍽️ YOUR SIGNATURE SOUL FOOD</Text>
                  <Image source={{ uri: personaResult.dishImage }} style={styles.dishImageThumb} />
                  <Text style={styles.signatureDishName}>{personaResult.signatureDish}</Text>
                </View>

                {/* PRACTICAL STUDENT INSIGHTS */}
                <View style={styles.practicalBox}>
                  <Text style={styles.practicalBoxHeader}>💡 PRACTICAL STUDENT INSIGHTS</Text>
                  <Text style={styles.practicalText}>{personaResult.studyHack}</Text>
                  <View style={styles.practicalDivider} />
                  <Text style={styles.practicalText}>{personaResult.squadMatch}</Text>
                  <View style={styles.practicalDivider} />
                  <Text style={styles.practicalText}>{personaResult.budgetSecret}</Text>
                </View>

                {/* RESET BUTTON */}
                <Pressable style={styles.nextStudentButton} onPress={resetQuiz}>
                  <Text style={styles.nextStudentButtonText}>↻ NEXT STUDENT TURN</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}

        {/* ==============================================================
            MODE 2: WHEEL OF CRAVINGS & DARES
        ============================================================== */}
        {activeTab === "wheel" && (
          <View style={styles.wheelWrapper}>
            <View style={styles.wheelHeaderBox}>
              <Text style={styles.wheelHeading}>🎡 Wheel of Craving & Dares</Text>
              <Text style={styles.wheelSubheading}>
                Spin to test your food destiny or pull a hilarious live stall challenge!
              </Text>
            </View>

            <View style={styles.wheelContainer}>
              <View style={styles.wheelPointer}>
                <Text style={{ fontSize: 36 }}>🔻</Text>
              </View>

              <Animated.View
                style={[
                  styles.wheelDisk,
                  {
                    transform: [
                      {
                        rotate: spinAnim.interpolate({
                          inputRange: [0, 360],
                          outputRange: ["0deg", "360deg"],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.wheelSliceTop}>
                  <Text style={styles.sliceEmoji}>🍛 Biryani</Text>
                </View>
                <View style={styles.wheelSliceRight}>
                  <Text style={styles.sliceEmoji}>🍕 Pizza</Text>
                </View>
                <View style={styles.wheelSliceBottom}>
                  <Text style={styles.sliceEmoji}>🍫 Lava Cake</Text>
                </View>
                <View style={styles.wheelSliceLeft}>
                  <Text style={styles.sliceEmoji}>🥟 Momos</Text>
                </View>
                <View style={styles.wheelHub}>
                  <Text style={{ fontSize: 26 }}>🎯</Text>
                </View>
              </Animated.View>
            </View>

            <Pressable
              style={[styles.spinButton, spinning && styles.spinButtonDisabled]}
              onPress={spinTheWheel}
              disabled={spinning}
            >
              <Text style={styles.spinButtonText}>
                {spinning ? "🎲 SPINNING DESTINY..." : "🎲 SPIN THE WHEEL (+100 XP)"}
              </Text>
            </Pressable>

            {wheelResult && (
              <View style={[styles.wheelResultBox, wheelResult.type === "dare" && styles.dareResultBox]}>
                <Text style={styles.wheelResultBadge}>
                  {wheelResult.type === "dare" ? "⚠️ STALL DARE UNLOCKED!" : "🎉 YOUR FOOD MATCH"}
                </Text>
                <Text style={styles.wheelResultTitle}>{wheelResult.text}</Text>
                <Text style={styles.wheelResultDetail}>{wheelResult.detail}</Text>
              </View>
            )}
          </View>
        )}

        {/* ==============================================================
            MODE 3: FOOD CLASH (RAPID FIRE THIS VS THAT)
        ============================================================== */}
        {activeTab === "clash" && (
          <View style={styles.clashWrapper}>
            {!clashComplete ? (
              <View style={styles.clashCard}>
                <Text style={styles.clashRoundIndicator}>
                  ROUND {clashRound + 1} OF {CLASH_ROUNDS.length}
                </Text>
                <Text style={styles.clashRoundTitle}>{CLASH_ROUNDS[clashRound].title}</Text>

                {/* OPTION A */}
                <Pressable
                  style={[
                    styles.clashOptionButton,
                    selectedClashOption === "A" && styles.clashOptionSelected,
                  ]}
                  onPress={() => handleClashVote("A")}
                >
                  <Text style={styles.clashOptionEmoji}>{CLASH_ROUNDS[clashRound].optionA.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.clashOptionName}>{CLASH_ROUNDS[clashRound].optionA.name}</Text>
                    {selectedClashOption && (
                      <Text style={styles.clashPctText}>
                        👥 {CLASH_ROUNDS[clashRound].optionA.initialPct}% of students picked this!
                      </Text>
                    )}
                  </View>
                  <Text style={styles.clashOptionVoteIcon}>👍</Text>
                </Pressable>

                <View style={styles.vsBadgeContainer}>
                  <Text style={styles.vsBadgeText}>VS</Text>
                </View>

                {/* OPTION B */}
                <Pressable
                  style={[
                    styles.clashOptionButton,
                    selectedClashOption === "B" && styles.clashOptionSelected,
                  ]}
                  onPress={() => handleClashVote("B")}
                >
                  <Text style={styles.clashOptionEmoji}>{CLASH_ROUNDS[clashRound].optionB.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.clashOptionName}>{CLASH_ROUNDS[clashRound].optionB.name}</Text>
                    {selectedClashOption && (
                      <Text style={styles.clashPctText}>
                        👥 {CLASH_ROUNDS[clashRound].optionB.initialPct}% of students picked this!
                      </Text>
                    )}
                  </View>
                  <Text style={styles.clashOptionVoteIcon}>👍</Text>
                </Pressable>
              </View>
            ) : (
              /* CLASH SUMMARY */
              <View style={styles.clashSummaryCard}>
                <Text style={styles.clashSummaryBadge}>🏆 CLASH CHAMPION VERDICT</Text>
                <Text style={styles.clashSummaryTitle}>You are a Taste Maverick!</Text>
                <Text style={styles.clashSummarySub}>
                  Your rapid-fire choices reveal you have distinct, uncompromising food standards.
                </Text>
                <View style={styles.picksListBox}>
                  <Text style={styles.picksListTitle}>YOUR 5 WINNING PICKS:</Text>
                  {clashVotes.map((pick, i) => (
                    <Text key={i} style={styles.pickItem}>
                      • {pick}
                    </Text>
                  ))}
                </View>
                <Pressable style={styles.nextStudentButton} onPress={resetClash}>
                  <Text style={styles.nextStudentButtonText}>↻ REPLAY / NEXT STUDENT</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}

        {/* ==============================================================
            MODE 4: FLAVOR BLITZ (FOOD MEMORY MATCH)
        ============================================================== */}
        {activeTab === "memory" && (
          <View style={styles.memoryWrapper}>
            <View style={styles.memoryHeaderBox}>
              <Text style={styles.memoryHeading}>⚡ Flavor Speed Blitz</Text>
              <Text style={styles.memorySubheading}>
                Match all 6 food pairs in minimum moves to unlock the Stall Grandmaster Badge!
              </Text>

              <View style={styles.memoryStatsBar}>
                <View style={styles.memStatItem}>
                  <Text style={styles.memStatLabel}>PAIRS</Text>
                  <Text style={styles.memStatVal}>{matchedPairs} / 6</Text>
                </View>
                <View style={styles.memStatItem}>
                  <Text style={styles.memStatLabel}>MOVES</Text>
                  <Text style={styles.memStatVal}>{movesCount}</Text>
                </View>
                <View style={styles.memStatItem}>
                  <Text style={styles.memStatLabel}>COMBO</Text>
                  <Text style={[styles.memStatVal, { color: comboMultiplier > 1 ? "#F59E0B" : COLORS.white }]}>
                    x{comboMultiplier} 🔥
                  </Text>
                </View>
              </View>
            </View>

            {/* CARD GRID */}
            <View style={styles.cardGrid}>
              {cards.map((card, idx) => {
                const isOpen = card.isFlipped || card.isMatched;
                return (
                  <Pressable
                    key={card.id}
                    style={[
                      styles.memoryCard,
                      isOpen && styles.memoryCardOpen,
                      card.isMatched && styles.memoryCardMatched,
                    ]}
                    onPress={() => handleCardPress(idx)}
                  >
                    <Text style={styles.memoryCardText}>
                      {isOpen ? card.icon : "❓"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {gameWon && (
              <View style={styles.winBanner}>
                <Text style={styles.winBadge}>🎉 STALL RECORD BROKEN!</Text>
                <Text style={styles.winTitle}>Grandmaster Memory Completed!</Text>
                <Text style={styles.winSubtitle}>
                  You solved the grid in only {movesCount} moves! Claim your stall stickers!
                </Text>
                <Pressable style={styles.nextStudentButton} onPress={resetMemoryGame}>
                  <Text style={styles.nextStudentButtonText}>⚡ PLAY AGAIN / NEXT STUDENT</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* BOTTOM NAVIGATION */}
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 45,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.backgroundSoft,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.sm,
  },
  backButtonText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  xpPill: {
    backgroundColor: "rgba(245, 185, 66, 0.2)",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: RADIUS.round,
    borderWidth: 1,
    borderColor: "rgba(245, 185, 66, 0.4)",
  },
  xpPillText: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: "900",
  },
  titleContainer: {
    marginTop: 4,
  },
  badgeLabel: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: RADIUS.md,
    marginHorizontal: 2,
  },
  activeTabItem: {
    backgroundColor: "rgba(245, 185, 66, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(245, 185, 66, 0.4)",
  },
  tabItemText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
  activeTabItemText: {
    color: COLORS.accent,
    fontWeight: "900",
  },
  contentContainer: {
    padding: SPACING.lg,
  },

  // QUIZ STYLES
  quizWrapper: {
    width: "100%",
  },
  questionCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xxl,
    padding: SPACING.xl,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 3,
    marginBottom: SPACING.md,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.accent,
  },
  questionCount: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: SPACING.xs,
  },
  questionTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 28,
    marginBottom: 6,
  },
  questionSubtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginBottom: SPACING.lg,
  },
  optionsList: {
    gap: SPACING.md,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  optionEmoji: {
    fontSize: 26,
    marginRight: SPACING.md,
  },
  optionText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  optionArrow: {
    color: COLORS.accent,
    fontSize: 18,
    fontWeight: "800",
    marginLeft: SPACING.sm,
  },

  // RESULT STYLES
  resultCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.accent,
    borderRadius: RADIUS.xxl,
    padding: SPACING.xl,
    alignItems: "center",
  },
  resultBadgeContainer: {
    backgroundColor: "rgba(245, 185, 66, 0.2)",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: RADIUS.round,
    marginBottom: SPACING.sm,
  },
  resultBadge: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },
  personaTitle: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 4,
  },
  personaArchetype: {
    color: COLORS.accent,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: SPACING.md,
  },
  personaDescription: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  statsBox: {
    width: "100%",
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  statsBoxTitle: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  statLabel: {
    width: 140,
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  meterTrack: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 4,
    marginHorizontal: SPACING.sm,
    overflow: "hidden",
  },
  meterFill: {
    height: "100%",
    borderRadius: 4,
  },
  statValue: {
    width: 36,
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "right",
  },
  signatureDishBox: {
    width: "100%",
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: "center",
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  signatureDishHeader: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  dishImageThumb: {
    width: "100%",
    height: 140,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  signatureDishName: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  practicalBox: {
    width: "100%",
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: "rgba(245, 185, 66, 0.3)",
  },
  practicalBoxHeader: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: SPACING.sm,
  },
  practicalText: {
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
  practicalDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.sm,
  },
  nextStudentButton: {
    width: "100%",
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: RADIUS.lg,
    alignItems: "center",
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  nextStudentButtonText: {
    color: "#18181B",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1,
  },

  // WHEEL STYLES
  wheelWrapper: {
    alignItems: "center",
  },
  wheelHeaderBox: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  wheelHeading: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 4,
  },
  wheelSubheading: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: "center",
  },
  wheelContainer: {
    width: 260,
    height: 260,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xxl,
    position: "relative",
  },
  wheelPointer: {
    position: "absolute",
    top: -24,
    zIndex: 10,
  },
  wheelDisk: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 6,
    borderColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 10,
  },
  wheelSliceTop: {
    position: "absolute",
    top: 25,
  },
  wheelSliceBottom: {
    position: "absolute",
    bottom: 25,
  },
  wheelSliceLeft: {
    position: "absolute",
    left: 20,
  },
  wheelSliceRight: {
    position: "absolute",
    right: 20,
  },
  sliceEmoji: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "800",
  },
  wheelHub: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.surface,
    borderWidth: 3,
    borderColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  spinButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: RADIUS.round,
    marginBottom: SPACING.xl,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  spinButtonDisabled: {
    opacity: 0.6,
  },
  spinButtonText: {
    color: "#18181B",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1,
  },
  wheelResultBox: {
    width: "100%",
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.accent,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: "center",
  },
  dareResultBox: {
    borderColor: "#F87171",
  },
  wheelResultBadge: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  wheelResultTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 6,
  },
  wheelResultDetail: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },

  // CLASH STYLES
  clashWrapper: {
    width: "100%",
  },
  clashCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xxl,
    padding: SPACING.xl,
    alignItems: "center",
  },
  clashRoundIndicator: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  clashRoundTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
  clashOptionButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
  },
  clashOptionSelected: {
    borderColor: COLORS.accent,
    backgroundColor: "rgba(245, 185, 66, 0.15)",
  },
  clashOptionEmoji: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  clashOptionName: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 2,
  },
  clashPctText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: "700",
  },
  clashOptionVoteIcon: {
    fontSize: 20,
    marginLeft: SPACING.sm,
  },
  vsBadgeContainer: {
    marginVertical: SPACING.md,
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  vsBadgeText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "900",
  },
  clashSummaryCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.accent,
    borderRadius: RADIUS.xxl,
    padding: SPACING.xl,
    alignItems: "center",
  },
  clashSummaryBadge: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  clashSummaryTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 6,
  },
  clashSummarySub: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: SPACING.lg,
  },
  picksListBox: {
    width: "100%",
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  picksListTitle: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  pickItem: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },

  // MEMORY BLITZ STYLES
  memoryWrapper: {
    width: "100%",
  },
  memoryHeaderBox: {
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  memoryHeading: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 4,
  },
  memorySubheading: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  memoryStatsBar: {
    flexDirection: "row",
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.lg,
    paddingVertical: 10,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: SPACING.xl,
  },
  memStatItem: {
    alignItems: "center",
  },
  memStatLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 2,
  },
  memStatVal: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "900",
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  memoryCard: {
    width: (width - SPACING.lg * 2 - 24) / 3,
    height: 90,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.xl,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.borderLight,
  },
  memoryCardOpen: {
    borderColor: COLORS.accent,
    backgroundColor: "rgba(245, 185, 66, 0.15)",
  },
  memoryCardMatched: {
    borderColor: "#10B981",
    backgroundColor: "rgba(16, 185, 129, 0.2)",
  },
  memoryCardText: {
    fontSize: 32,
  },
  winBanner: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: "#10B981",
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: "center",
  },
  winBadge: {
    color: "#10B981",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  winTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 4,
  },
  winSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
});
