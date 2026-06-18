import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOW, RADIUS, SPACING, FONTS } from '../theme';

export default function TripCard({ trip, onPress }) {
  const { depart, arrivee, date, heure, prix, placesDisponibles, conducteurNom } = trip;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.header}>
        <View style={styles.route}>
          <View style={styles.dotLine}>
            <View style={styles.dotGreen} />
            <View style={styles.line} />
            <View style={styles.dotPrimary} />
          </View>
          <View style={styles.cities}>
            <Text style={styles.city}>{depart}</Text>
            <Text style={styles.city}>{arrivee}</Text>
          </View>
        </View>
        <Text style={styles.price}>{prix} €</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.info}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>{date}</Text>
        </View>
        <View style={styles.info}>
          <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>{heure}</Text>
        </View>
        <View style={styles.info}>
          <Ionicons name="people-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>{placesDisponibles} place{placesDisponibles > 1 ? 's' : ''}</Text>
        </View>
        <View style={styles.driverChip}>
          <Ionicons name="person-circle-outline" size={14} color={COLORS.primary} />
          <Text style={styles.driverText}>{conducteurNom}</Text>
        </View>
      </View>
    </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  route: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  dotLine: { alignItems: 'center', marginRight: SPACING.sm },
  dotGreen: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.secondary,
    marginBottom: 3,
  },
  line: { width: 2, height: 16, backgroundColor: COLORS.border },
  dotPrimary: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginTop: 3,
  },
  cities: { flex: 1 },
  city: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.text,
    marginVertical: 2,
  },
  price: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '800',
    color: COLORS.primary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  info: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  driverChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  driverText: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '600' },
});
