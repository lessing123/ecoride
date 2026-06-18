import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOW, RADIUS, SPACING, FONTS } from '../theme';
import StarRating from './StarRating';

const STATUS_CONFIG = {
  confirmée: { label: 'Confirmée', color: COLORS.success, bg: COLORS.successLight, icon: 'checkmark-circle' },
  annulée: { label: 'Annulée', color: COLORS.error, bg: COLORS.errorLight, icon: 'close-circle' },
  terminée: { label: 'Terminée', color: COLORS.textSecondary, bg: COLORS.borderLight, icon: 'archive' },
};

export default function ReservationCard({ reservation, isDriver = false, onRate }) {
  const { depart, arrivee, date, heure, prix, statut, note, passagerNom } = reservation;
  const config = STATUS_CONFIG[statut] || STATUS_CONFIG['confirmée'];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.route}>
          <Text style={styles.city}>{depart}</Text>
          <Ionicons name="arrow-forward" size={16} color={COLORS.primary} style={styles.arrow} />
          <Text style={styles.city}>{arrivee}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: config.bg }]}>
          <Ionicons name={config.icon} size={12} color={config.color} />
          <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
        </View>
      </View>

      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.metaText}>{date} à {heure}</Text>
        </View>
        <Text style={styles.price}>{prix} €</Text>
      </View>

      {isDriver && passagerNom && (
        <View style={styles.passengerRow}>
          <Ionicons name="person-outline" size={14} color={COLORS.primary} />
          <Text style={styles.passengerText}>Passager : {passagerNom}</Text>
        </View>
      )}

      {!isDriver && statut === 'confirmée' && (
        <View style={styles.ratingRow}>
          {note ? (
            <View style={styles.ratedRow}>
              <Text style={styles.ratedLabel}>Votre note :</Text>
              <StarRating value={note} readonly size={18} />
            </View>
          ) : (
            <View>
              <Text style={styles.ratePrompt}>Noter ce trajet :</Text>
              <StarRating value={0} onRate={(n) => onRate && onRate(reservation.id, n)} size={22} />
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    ...SHADOW.card,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  route: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  city: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text },
  arrow: { marginHorizontal: SPACING.xs },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  badgeText: { fontSize: FONTS.sizes.xs, fontWeight: '700' },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.xs,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  price: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.primary },
  passengerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  passengerText: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '600' },
  ratingRow: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  ratePrompt: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: 6 },
  ratedRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  ratedLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
});
