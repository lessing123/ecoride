import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { searchTrips } from '../services/tripService';
import TripCard from '../components/TripCard';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme';

export default function SearchScreen({ navigation }) {
  const [depart, setDepart] = useState('');
  const [arrivee, setArrivee] = useState('');
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!depart.trim() || !arrivee.trim()) {
      setError('Veuillez indiquer une ville de départ et d\'arrivée.');
      return;
    }
    setError('');
    setLoading(true);
    setSearched(false);
    try {
      const results = await searchTrips({ depart, arrivee });
      setTrips(results);
      setSearched(true);
    } catch (e) {
      setError('Erreur lors de la recherche. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  const swap = () => {
    setDepart(arrivee);
    setArrivee(depart);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Search form */}
          <View style={styles.searchCard}>
            <Text style={styles.cardTitle}>Trouver un trajet</Text>

            <View style={styles.inputsWrapper}>
              <View style={styles.inputRow}>
                <View style={styles.dotGreen} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Ville de départ"
                  placeholderTextColor={COLORS.textMuted}
                  value={depart}
                  onChangeText={setDepart}
                  autoCapitalize="words"
                />
              </View>

              <TouchableOpacity style={styles.swapBtn} onPress={swap}>
                <Ionicons name="swap-vertical" size={20} color={COLORS.primary} />
              </TouchableOpacity>

              <View style={[styles.inputRow, styles.inputRowBottom]}>
                <View style={styles.dotPrimary} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Ville d'arrivée"
                  placeholderTextColor={COLORS.textMuted}
                  value={arrivee}
                  onChangeText={setArrivee}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {error ? (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle" size={14} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.searchBtn, loading && styles.searchBtnDisabled]}
              onPress={handleSearch}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <>
                  <Ionicons name="search" size={18} color={COLORS.white} />
                  <Text style={styles.searchBtnText}>Rechercher</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Results */}
          {searched && (
            <View style={styles.results}>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>
                  {trips.length === 0 ? 'Aucun résultat' : `${trips.length} trajet${trips.length > 1 ? 's' : ''} trouvé${trips.length > 1 ? 's' : ''}`}
                </Text>
                {trips.length > 0 && (
                  <Text style={styles.resultsSubtitle}>{depart} → {arrivee}</Text>
                )}
              </View>

              {trips.length === 0 ? (
                <View style={styles.empty}>
                  <Ionicons name="car-outline" size={52} color={COLORS.border} />
                  <Text style={styles.emptyTitle}>Aucun trajet disponible</Text>
                  <Text style={styles.emptyText}>
                    Pas de trajet de {depart} vers {arrivee} pour l'instant.
                  </Text>
                  <TouchableOpacity
                    style={styles.publishBtn}
                    onPress={() => navigation.navigate('Publish')}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="add" size={16} color={COLORS.white} />
                    <Text style={styles.publishBtnText}>Proposer ce trajet</Text>
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
            </View>
          )}

          {!searched && !loading && (
            <View style={styles.tips}>
              <Text style={styles.tipsTitle}>Comment ça marche ?</Text>
              {[
                { icon: 'search-outline', text: 'Entrez votre ville de départ et d\'arrivée' },
                { icon: 'car-outline', text: 'Choisissez un trajet qui vous convient' },
                { icon: 'checkmark-circle-outline', text: 'Réservez en un clic et voyagez éco !' },
              ].map((item, i) => (
                <View key={i} style={styles.tipRow}>
                  <View style={styles.tipIcon}>
                    <Ionicons name={item.icon} size={20} color={COLORS.primary} />
                  </View>
                  <Text style={styles.tipText}>{item.text}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  container: { padding: SPACING.base, paddingBottom: SPACING['2xl'] },
  searchCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    ...SHADOW.card,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  cardTitle: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.lg },
  inputsWrapper: { position: 'relative', marginBottom: SPACING.base },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  inputRowBottom: { marginTop: SPACING.xs },
  dotGreen: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.secondary, marginRight: SPACING.sm },
  dotPrimary: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary, marginRight: SPACING.sm },
  searchInput: { flex: 1, paddingVertical: SPACING.md, fontSize: FONTS.sizes.base, color: COLORS.text },
  swapBtn: {
    alignSelf: 'center',
    marginVertical: SPACING.xs,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.md },
  errorText: { color: COLORS.error, fontSize: FONTS.sizes.sm },
  searchBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.base,
    ...SHADOW.button,
  },
  searchBtnDisabled: { opacity: 0.6 },
  searchBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.md },
  results: { marginBottom: SPACING.xl },
  resultsHeader: { marginBottom: SPACING.md },
  resultsTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text },
  resultsSubtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: SPACING['3xl'], gap: SPACING.md },
  emptyTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text },
  emptyText: { fontSize: FONTS.sizes.base, color: COLORS.textSecondary, textAlign: 'center' },
  publishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
  },
  publishBtnText: { color: COLORS.white, fontWeight: '700' },
  tips: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOW.card,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  tipsTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.lg },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.md },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: { flex: 1, fontSize: FONTS.sizes.base, color: COLORS.textSecondary, lineHeight: 22 },
});
