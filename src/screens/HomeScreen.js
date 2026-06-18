import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { getRecentTrips } from '../services/tripService';
import TripCard from '../components/TripCard';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme';

const CO2_FACTOR = 0.021;

export default function HomeScreen({ navigation }) {
  const { userProfile } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getRecentTrips(6);
      setTrips(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const co2Saved = ((userProfile?.kmTotal || 0) * CO2_FACTOR).toFixed(1);
  const prenom = userProfile?.prenom || 'Voyageur';

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour, {prenom} 👋</Text>
            <Text style={styles.subGreeting}>Prêt pour un voyage éco-responsable ?</Text>
          </View>
          <View style={styles.notifBtn}>
            <Ionicons name="leaf" size={24} color={COLORS.white} />
          </View>
        </View>

        {/* Stats CO2 */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: COLORS.primary }]}>
            <Ionicons name="leaf" size={24} color={COLORS.white} />
            <Text style={styles.statValue}>{co2Saved} kg</Text>
            <Text style={styles.statLabel}>CO₂ économisé</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: COLORS.primaryLight }]}>
            <Ionicons name="car" size={24} color={COLORS.white} />
            <Text style={styles.statValue}>{userProfile?.kmTotal || 0} km</Text>
            <Text style={styles.statLabel}>En covoiturage</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: COLORS.secondary }]}>
            <Ionicons name="star" size={24} color={COLORS.white} />
            <Text style={styles.statValue}>{userProfile?.noteMoyenne || '-'}</Text>
            <Text style={styles.statLabel}>Note moyenne</Text>
          </View>
        </View>

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Search')}
            activeOpacity={0.85}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="search" size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.actionLabel}>Rechercher</Text>
            <Text style={styles.actionSub}>Trouver un trajet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Publish')}
            activeOpacity={0.85}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="add-circle" size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.actionLabel}>Publier</Text>
            <Text style={styles.actionSub}>Partager mon trajet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Reservations')}
            activeOpacity={0.85}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="calendar" size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.actionLabel}>Mes trajets</Text>
            <Text style={styles.actionSub}>Réservations</Text>
          </TouchableOpacity>
        </View>

        {/* Eco tip */}
        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={20} color={COLORS.primaryDark} />
          <Text style={styles.tipText}>
            Chaque trajet partagé élimine en moyenne <Text style={styles.tipBold}>{CO2_FACTOR} kg de CO₂</Text> par kilomètre.
          </Text>
        </View>

        {/* Recent trips */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trajets disponibles</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <Text style={styles.seeAll}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
        ) : trips.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="car-outline" size={48} color={COLORS.border} />
            <Text style={styles.emptyText}>Aucun trajet disponible pour l'instant.</Text>
            <TouchableOpacity style={styles.publishBtn} onPress={() => navigation.navigate('Publish')}>
              <Text style={styles.publishBtnText}>Publier le premier</Text>
            </TouchableOpacity>
          </View>
        ) : (
          trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onPress={() => navigation.navigate('TripDetail', { tripId: trip.id })}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SPACING.base, paddingBottom: SPACING['2xl'] },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingTop: SPACING.sm,
  },
  greeting: { fontSize: FONTS.sizes['2xl'], fontWeight: '800', color: COLORS.text },
  subGreeting: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  notifBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.card,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  statCard: {
    flex: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    ...SHADOW.card,
  },
  statValue: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.white, marginTop: 4 },
  statLabel: { fontSize: FONTS.sizes.xs, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: 2 },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  seeAll: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.xl },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    ...SHADOW.card,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  actionLabel: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.text },
  actionSub: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, textAlign: 'center', marginTop: 2 },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: '#D8F3DC',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  tipText: { flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.primaryDark, lineHeight: 20 },
  tipBold: { fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: SPACING['3xl'] },
  emptyText: { color: COLORS.textSecondary, marginTop: SPACING.md, marginBottom: SPACING.lg },
  publishBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  publishBtnText: { color: COLORS.white, fontWeight: '700' },
});
