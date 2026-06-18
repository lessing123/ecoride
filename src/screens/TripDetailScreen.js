import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getTrip } from '../services/tripService';
import { reserveTrip } from '../services/reservationService';
import { useAuth } from '../contexts/AuthContext';
import StarRating from '../components/StarRating';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme';

const CO2_FACTOR = 0.021;

function InfoRow({ icon, label, value, highlight }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconBox}>
        <Ionicons name={icon} size={18} color={COLORS.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, highlight && styles.infoValueHighlight]}>{value}</Text>
      </View>
    </View>
  );
}

export default function TripDetailScreen({ route, navigation }) {
  const { tripId } = route.params;
  const { user, userProfile } = useAuth();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [reserved, setReserved] = useState(false);

  useEffect(() => {
    getTrip(tripId)
      .then(setTrip)
      .catch(() => Alert.alert('Erreur', 'Trajet introuvable.'))
      .finally(() => setLoading(false));
  }, [tripId]);

  const isOwnTrip = trip?.conducteurId === user?.uid;
  const noSeats = trip?.placesDisponibles === 0;

  const handleReserve = async () => {
    if (isOwnTrip) {
      Alert.alert('Impossible', 'Vous ne pouvez pas réserver votre propre trajet.');
      return;
    }
    Alert.alert(
      'Confirmer la réservation',
      `Réserver une place de ${trip.depart} → ${trip.arrivee} pour ${trip.prix} € ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            setReserving(true);
            try {
              await reserveTrip({
                passagerId: user.uid,
                passagerNom: `${userProfile?.prenom} ${userProfile?.nom}`.trim(),
                trajetId: tripId,
                trajetInfo: trip,
              });
              setReserved(true);
              setTrip((t) => ({ ...t, placesDisponibles: t.placesDisponibles - 1 }));
              Alert.alert('Réservation confirmée !', 'Votre place a bien été réservée.', [
                { text: 'Mes réservations', onPress: () => navigation.navigate('Reservations') },
                { text: 'OK' },
              ]);
            } catch (e) {
              Alert.alert('Erreur', e.message || 'Impossible de réserver ce trajet.');
            } finally {
              setReserving(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!trip) return null;

  const estimatedKm = 100;
  const co2Saved = (estimatedKm * CO2_FACTOR).toFixed(1);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Route banner */}
        <View style={styles.routeBanner}>
          <View style={styles.routeItem}>
            <View style={styles.routeDot} />
            <Text style={styles.routeCity}>{trip.depart}</Text>
          </View>
          <View style={styles.routeArrow}>
            <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
          </View>
          <View style={styles.routeItem}>
            <View style={[styles.routeDot, styles.routeDotEnd]} />
            <Text style={styles.routeCity}>{trip.arrivee}</Text>
          </View>
        </View>

        {/* Main info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informations du trajet</Text>
          <InfoRow icon="calendar-outline" label="Date" value={trip.date} />
          <InfoRow icon="time-outline" label="Heure de départ" value={trip.heure} />
          <InfoRow icon="people-outline" label="Places disponibles" value={`${trip.placesDisponibles} / ${trip.places}`} />
          <InfoRow icon="cash-outline" label="Prix par personne" value={`${trip.prix} €`} highlight />
        </View>

        {/* Eco card */}
        <View style={styles.ecoCard}>
          <Ionicons name="leaf" size={24} color={COLORS.primaryDark} />
          <View style={styles.ecoText}>
            <Text style={styles.ecoTitle}>Impact écologique</Text>
            <Text style={styles.ecoDesc}>
              En partageant ce trajet, vous économisez environ <Text style={styles.ecoBold}>{co2Saved} kg de CO₂</Text>.
            </Text>
          </View>
        </View>

        {/* Driver card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Conducteur</Text>
          <View style={styles.driverRow}>
            <View style={styles.driverAvatar}>
              <Text style={styles.driverInitial}>
                {trip.conducteurNom?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{trip.conducteurNom}</Text>
              {isOwnTrip && <Text style={styles.ownLabel}>Votre trajet</Text>}
            </View>
          </View>
        </View>

        {/* Reserve button */}
        {!isOwnTrip && (
          <TouchableOpacity
            style={[
              styles.reserveBtn,
              (noSeats || reserved || reserving) && styles.reserveBtnDisabled,
            ]}
            onPress={handleReserve}
            disabled={noSeats || reserved || reserving}
            activeOpacity={0.85}
          >
            {reserving ? (
              <ActivityIndicator color={COLORS.white} />
            ) : reserved ? (
              <>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                <Text style={styles.reserveBtnText}>Réservé !</Text>
              </>
            ) : noSeats ? (
              <Text style={styles.reserveBtnText}>Complet</Text>
            ) : (
              <>
                <Ionicons name="car" size={20} color={COLORS.white} />
                <Text style={styles.reserveBtnText}>Réserver cette place</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {isOwnTrip && (
          <View style={styles.ownTripBanner}>
            <Ionicons name="information-circle-outline" size={18} color={COLORS.primary} />
            <Text style={styles.ownTripText}>C'est votre trajet. Rendez-vous dans "Réservations" pour voir vos passagers.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  container: { padding: SPACING.base, paddingBottom: SPACING['3xl'] },
  routeBanner: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.base,
    ...SHADOW.button,
  },
  routeItem: { alignItems: 'center', flex: 1 },
  routeDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.secondary, marginBottom: SPACING.xs },
  routeDotEnd: { backgroundColor: COLORS.white },
  routeCity: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.white, textAlign: 'center' },
  routeArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.base,
    ...SHADOW.card,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  cardTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text, marginTop: 2 },
  infoValueHighlight: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.primary },
  ecoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: '#D8F3DC',
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.base,
  },
  ecoText: { flex: 1 },
  ecoTitle: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.primaryDark },
  ecoDesc: { fontSize: FONTS.sizes.sm, color: COLORS.primaryDark, lineHeight: 20, marginTop: 2 },
  ecoBold: { fontWeight: '800' },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  driverAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverInitial: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.white },
  driverInfo: { flex: 1 },
  driverName: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text },
  ownLabel: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '600', marginTop: 2 },
  reserveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.base + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    ...SHADOW.button,
    marginTop: SPACING.md,
  },
  reserveBtnDisabled: { backgroundColor: COLORS.textMuted },
  reserveBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.lg },
  ownTripBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.borderLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  ownTripText: { flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.primary, lineHeight: 20 },
});
