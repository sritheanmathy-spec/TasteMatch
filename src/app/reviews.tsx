import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { backend } from '../lib/backend';

const GOLD = '#D6A84F';

type Review = {
  id: string | number;
  rating: number;
  spice_level?: number;
  salt_level?: number;
  sugar_level?: number;
  review_text?: string;
  created_at?: string;
  dish_id?: string | number;
};

export default function ReviewsScreen() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    try {
      setLoading(true);
      const data = await backend.fetchReviewsForDish();
      setReviews((data as unknown as Review[]) || []);
    } catch (error) {
      console.log('REVIEWS ERROR:', error);
      setReviews((backend.getReviews() as unknown as Review[]) || []);
    } finally {
      setLoading(false);
    }
  }

  function renderStars(rating: number) {
    return [1, 2, 3, 4, 5]
      .map((number) =>
        number <= rating ? '★' : '☆'
      )
      .join('');
  }

  function getAverageRating() {
    if (reviews.length === 0) return '0.0';

    const total = reviews.reduce(
      (sum, review) =>
        sum + Number(review.rating || 0),
      0
    );

    return (total / reviews.length).toFixed(1);
  }

  function getTime(createdAt?: string) {
    if (!createdAt) return 'Recently';

    const date = new Date(createdAt);
    const now = new Date();

    const difference =
      now.getTime() - date.getTime();

    const minutes = Math.floor(
      difference / 60000
    );

    if (minutes < 1) return 'Just now';

    if (minutes < 60) {
      return `${minutes} min ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} hour${
        hours > 1 ? 's' : ''
      } ago`;
    }

    const days = Math.floor(hours / 24);

    return `${days} day${
      days > 1 ? 's' : ''
    } ago`;
  }

  return (
    <View style={styles.screen}>

      <StatusBar barStyle="light-content" />

      {/* HEADER */}

      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backIcon}>
            ‹
          </Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>

          <Text style={styles.headerSmall}>
            FOODREVIEW
          </Text>

          <Text style={styles.headerTitle}>
            Reviews
          </Text>

        </View>

        <View style={styles.headerSpace} />

      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* INTRO */}

        <View style={styles.intro}>

          <Text style={styles.introLabel}>
            COMMUNITY REVIEWS
          </Text>

          <Text style={styles.introTitle}>
            What people are saying
          </Text>

          <Text style={styles.introSubtitle}>
            Honest opinions from food lovers.
          </Text>

        </View>

        {/* RATING SUMMARY */}

        <View style={styles.summaryCard}>

          <View style={styles.averageSection}>

            <Text style={styles.averageRating}>
              {getAverageRating()}
            </Text>

            <Text style={styles.averageStars}>
              ★★★★★
            </Text>

            <Text style={styles.totalReviews}>
              {reviews.length} reviews
            </Text>

          </View>

          <View style={styles.verticalDivider} />

          <View style={styles.ratingBars}>

            {[5, 4, 3, 2, 1].map(
              (number) => {

                const count =
                  reviews.filter(
                    (review) =>
                      Number(
                        review.rating
                      ) === number
                  ).length;

                const percentage =
                  reviews.length > 0
                    ? count / reviews.length
                    : 0;

                return (
                  <View
                    key={number}
                    style={styles.barRow}
                  >

                    <Text style={styles.barNumber}>
                      {number}
                    </Text>

                    <Text style={styles.barStar}>
                      ★
                    </Text>

                    <View
                      style={styles.barBackground}
                    >
                      <View
                        style={[
                          styles.barFill,
                          {
                            width: `${Math.max(
                              percentage * 100,
                              count > 0 ? 4 : 0
                            )}%`,
                          },
                        ]}
                      />
                    </View>

                  </View>
                );
              }
            )}

          </View>

        </View>

        {/* WRITE REVIEW */}

        <TouchableOpacity
          style={styles.writeButton}
          onPress={() =>
            router.push({
              pathname: '/review',
              params: {
                dishId: '1',
                dishName: 'Chicken Biryani',
              },
            })
          }
        >

          <Text style={styles.writeIcon}>
            ✎
          </Text>

          <View style={styles.writeInfo}>

            <Text style={styles.writeTitle}>
              Share your experience
            </Text>

            <Text style={styles.writeSubtitle}>
              Write a review
            </Text>

          </View>

          <Text style={styles.writeArrow}>
            →
          </Text>

        </TouchableOpacity>

        {/* REVIEW HEADER */}

        <View style={styles.reviewHeader}>

          <View>

            <Text style={styles.sectionLabel}>
              RECENT
            </Text>

            <Text style={styles.sectionTitle}>
              Latest Reviews
            </Text>

          </View>

          <Text style={styles.goldSymbol}>
            ✦
          </Text>

        </View>

        {/* LOADING */}

        {loading ? (

          <View style={styles.loadingContainer}>

            <ActivityIndicator
              size="large"
              color={GOLD}
            />

            <Text style={styles.loadingText}>
              Loading reviews...
            </Text>

          </View>

        ) : reviews.length === 0 ? (

          /* EMPTY */

          <View style={styles.emptyCard}>

            <Text style={styles.emptyIcon}>
              ★
            </Text>

            <Text style={styles.emptyTitle}>
              No reviews yet
            </Text>

            <Text style={styles.emptyText}>
              Be the first person to share
              your experience.
            </Text>

            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() =>
                router.push({
                  pathname: '/review',
                  params: {
                    dishId: '1',
                    dishName:
                      'Chicken Biryani',
                  },
                })
              }
            >
              <Text style={styles.emptyButtonText}>
                WRITE FIRST REVIEW
              </Text>
            </TouchableOpacity>

          </View>

        ) : (

          /* REVIEWS */

          reviews.map((review, index) => (

            <View
              key={review.id || index}
              style={styles.reviewCard}
            >

              {/* TOP */}

              <View style={styles.reviewTop}>

                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    U
                  </Text>
                </View>

                <View style={styles.userInfo}>

                  <Text style={styles.userName}>
                    Food Lover
                  </Text>

                  <Text style={styles.reviewDate}>
                    {getTime(
                      review.created_at
                    )}
                  </Text>

                </View>

                <View style={styles.ratingBadge}>

                  <Text style={styles.badgeStar}>
                    ★
                  </Text>

                  <Text style={styles.badgeRating}>
                    {Number(
                      review.rating || 0
                    ).toFixed(1)}
                  </Text>

                </View>

              </View>

              {/* STARS */}

              <Text style={styles.reviewStars}>
                {renderStars(
                  Number(review.rating || 0)
                )}
              </Text>

              {/* TEXT */}

              <Text style={styles.reviewText}>
                {review.review_text ||
                  'No written review.'}
              </Text>

              {/* TASTE */}

              <View style={styles.tasteRow}>

                {review.spice_level !==
                  undefined && (
                  <View style={styles.tasteTag}>
                    <Text style={styles.tasteTagText}>
                      🌶️{' '}
                      {review.spice_level}/5
                    </Text>
                  </View>
                )}

                {review.salt_level !==
                  undefined && (
                  <View style={styles.tasteTag}>
                    <Text style={styles.tasteTagText}>
                      🧂{' '}
                      {review.salt_level}/5
                    </Text>
                  </View>
                )}

                {review.sugar_level !==
                  undefined && (
                  <View style={styles.tasteTag}>
                    <Text style={styles.tasteTagText}>
                      🍬{' '}
                      {review.sugar_level}/5
                    </Text>
                  </View>
                )}

              </View>

            </View>

          ))

        )}

        <View style={styles.bottomSpace} />

      </ScrollView>

      {/* BOTTOM NAV */}

      <View style={styles.bottomNav}>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            router.push('/dashboard')
          }
        >
          <Text style={styles.navIcon}>
            ⌂
          </Text>

          <Text style={styles.navText}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            router.push('/dashboard')
          }
        >
          <Text style={styles.navIcon}>
            ⌕
          </Text>

          <Text style={styles.navText}>
            Explore
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
        >
          <Text style={styles.navIconActive}>
            ★
          </Text>

          <Text style={styles.navTextActive}>
            Reviews
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
        >
          <Text style={styles.navIcon}>
            ◉
          </Text>

          <Text style={styles.navText}>
            Profile
          </Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  screen: {
    flex: 1,
    backgroundColor: '#090909',
  },

  header: {
    height: 105,
    paddingTop: 45,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E1E',
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#292929',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backIcon: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '200',
    marginTop: -4,
  },

  headerCenter: {
    alignItems: 'center',
  },

  headerSmall: {
    color: GOLD,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 2,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },

  headerSpace: {
    width: 43,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },

  intro: {
    marginBottom: 21,
  },

  introLabel: {
    color: GOLD,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
  },

  introTitle: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '900',
    marginTop: 6,
    letterSpacing: -0.5,
  },

  introSubtitle: {
    color: '#707070',
    fontSize: 12,
    marginTop: 6,
  },

  /* SUMMARY */

  summaryCard: {
    backgroundColor: '#151515',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#272727',
    padding: 19,
    flexDirection: 'row',
    minHeight: 145,
  },

  averageSection: {
    width: '42%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  averageRating: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '900',
  },

  averageStars: {
    color: GOLD,
    fontSize: 14,
    letterSpacing: 2,
    marginTop: 3,
  },

  totalReviews: {
    color: '#666666',
    fontSize: 10,
    marginTop: 5,
  },

  verticalDivider: {
    width: 1,
    backgroundColor: '#292929',
    marginVertical: 5,
  },

  ratingBars: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 16,
  },

  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 18,
  },

  barNumber: {
    color: '#777777',
    fontSize: 9,
    width: 9,
  },

  barStar: {
    color: GOLD,
    fontSize: 9,
    marginLeft: 2,
    width: 15,
  },

  barBackground: {
    height: 5,
    flex: 1,
    backgroundColor: '#292929',
    borderRadius: 4,
    overflow: 'hidden',
  },

  barFill: {
    height: '100%',
    backgroundColor: GOLD,
    borderRadius: 4,
  },

  /* WRITE */

  writeButton: {
    height: 70,
    backgroundColor: GOLD,
    borderRadius: 18,
    marginTop: 15,
    paddingHorizontal: 17,
    flexDirection: 'row',
    alignItems: 'center',
  },

  writeIcon: {
    color: '#090909',
    fontSize: 23,
  },

  writeInfo: {
    flex: 1,
    marginLeft: 13,
  },

  writeTitle: {
    color: '#090909',
    fontSize: 14,
    fontWeight: '900',
  },

  writeSubtitle: {
    color: '#3C301B',
    fontSize: 10,
    marginTop: 3,
  },

  writeArrow: {
    color: '#090909',
    fontSize: 23,
  },

  /* HEADER */

  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 29,
    marginBottom: 15,
  },

  sectionLabel: {
    color: GOLD,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 5,
  },

  goldSymbol: {
    color: GOLD,
    fontSize: 21,
  },

  /* REVIEW */

  reviewCard: {
    backgroundColor: '#141414',
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#252525',
    padding: 17,
    marginBottom: 11,
  },

  reviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#242424',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: GOLD,
    fontSize: 14,
    fontWeight: '900',
  },

  userInfo: {
    flex: 1,
    marginLeft: 11,
  },

  userName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  reviewDate: {
    color: '#5F5F5F',
    fontSize: 10,
    marginTop: 3,
  },

  ratingBadge: {
    backgroundColor: '#202020',
    borderRadius: 13,
    paddingHorizontal: 9,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },

  badgeStar: {
    color: GOLD,
    fontSize: 10,
  },

  badgeRating: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 4,
  },

  reviewStars: {
    color: GOLD,
    fontSize: 15,
    letterSpacing: 2,
    marginTop: 14,
  },

  reviewText: {
    color: '#A0A0A0',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
  },

  tasteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
    gap: 7,
  },

  tasteTag: {
    backgroundColor: '#202020',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  tasteTagText: {
    color: '#858585',
    fontSize: 9,
  },

  /* EMPTY */

  emptyCard: {
    backgroundColor: '#141414',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#252525',
    padding: 35,
    alignItems: 'center',
  },

  emptyIcon: {
    color: GOLD,
    fontSize: 42,
  },

  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    marginTop: 10,
  },

  emptyText: {
    color: '#666666',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 7,
    lineHeight: 18,
  },

  emptyButton: {
    backgroundColor: GOLD,
    borderRadius: 13,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginTop: 17,
  },

  emptyButtonText: {
    color: '#090909',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },

  loadingContainer: {
    padding: 50,
    alignItems: 'center',
  },

  loadingText: {
    color: '#666666',
    fontSize: 12,
    marginTop: 12,
  },

  /* NAV */

  bottomNav: {
    height: 77,
    backgroundColor: '#111111',
    borderTopWidth: 1,
    borderTopColor: '#242424',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 7,
  },

  navItem: {
    width: 75,
    alignItems: 'center',
  },

  navIcon: {
    color: '#606060',
    fontSize: 22,
  },

  navIconActive: {
    color: GOLD,
    fontSize: 22,
  },

  navText: {
    color: '#606060',
    fontSize: 9,
    marginTop: 4,
  },

  navTextActive: {
    color: GOLD,
    fontSize: 9,
    fontWeight: '800',
    marginTop: 4,
  },

  bottomSpace: {
    height: 25,
  },
});