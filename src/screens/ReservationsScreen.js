import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { getMyReservations, getReceivedReservations, rateTrip, updateDriverRating } from '../services/reservationService';
import ReservationCard from '../components/ReservationCard';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme';

function EmptyState({ isDriver }) {
  return (
    <View style={styles.empty}>
      <Ionicons name={isDriver ? 'car-outline' : 'calendar-outline'} size={56} color={COLORS.border} />
      <Text style={styles.emptyTitle}>{isDriver ? 'Aucun passager' : 'Aucune réservation'}</Text>
      <Text style={styles.emptyText}>
        {isDriver
          ? 'Vous n\'avez pas encore de passagers sur vos trajets.'
          : 'Vous n\'avez pas encore réservé de trajet.'}
      </Text>
    </View>
  );
}

export default function ReservationsScreen({ navigation }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('passenger');
  const [myReservations, setMyReservations] = useState([]);
  const [receivedReservations, setReceivedReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const [mine, received] = await Promise.all([
        getMyReservations(user.uid),
        getReceivedReservations(user.uid),
      ]);
      setMyReservations(mine);
      setReceivedReservations(received);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleRate = async (reservationId, note) => {
    try {
      const reservation = myReservations.find((r) => r.id === reservationId);
      await rateTrip(reservationId, note);
      if (reservation?.conducteurId) {
        await updateDriverRating(reservation.conducteurId, note);
      }
      setMyReservations((prev) =>
        prev.map((r) => (r.id === reservationId ? { ...r, note } : r))
      );
      Alert.alert('Merci !', 'Votre note a bien été enregistrée.');
    } catch {
      Alert.alert('Erreur', 'Impossible d\'enregistrer la note.');
    }
  };

  const currentData = activeTab === 'passenger' ? myReservations : receivedReservations;
  const isDriver = activeTab === 'driver';

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'passenger' && styles.tabActive]}
          onPress={() => setActiveTab('passenger')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={activeTab === 'passenger' ? 'person' : 'person-outline'}
            size={16}
            color={activeTab === 'passenger' ? COLORS.white : COLORS.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'passenger' && styles.tabTextActive]}>
            Mes réservations
          </Text>
          {myReservations.length > 0 && (
            <View style={[styles.badge, activeTab === 'passenger' && styles.badgeActive]}>
              <Text style={[styles.badgeText, activeTab === 'passenger' && styles.badgeTextActive]}>
                {myReservations.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'driver' && styles.tabActive]}
          onPress={() => setActiveTab('driver')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={activeTab === 'driver' ? 'car' : 'car-outline'}
            size={16}
            color={activeTab === 'driver' ? COLORS.white : COLORS.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'driver' && styles.tabTextActive]}>
            Mes passagers
          </Text>
          {receivedReservations.length > 0 && (
            <View style={[styles.badge, activeTab === 'driver' && styles.badgeActive]}>
              <Text style={[styles.badgeText, activeTab === 'driver' && styles.badgeTextActive]}>
                {receivedReservations.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={currentData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={<EmptyState isDriver={isDriver} />}
          renderItem={({ item }) => (
            <ReservationCard
              reservation={item}
              isDriver={isDriver}
              onRate={handleRate}
            />
          )}
          ListHeaderComponent={
            currentData.length > 0 ? (
              <View style={styles.listHeader}>
                <Text style={styles.listCount}>
                  {currentData.length} {isDriver ? 'passager' : 'réservation'}{currentData.length > 1 ? 's' : ''}
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: SPACING.sm,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.white },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  badgeText: { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.textSecondary },
  badgeTextActive: { color: COLORS.white },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: SPACING.base, paddingBottom: SPACING['2xl'] },
  listHeader: { marginBottom: SPACING.md },
  listCount: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', paddingVertical: SPACING['4xl'], gap: SPACING.md },
  emptyTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text },
  emptyText: { fontSize: FONTS.sizes.base, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: SPACING.xl },
});
