import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { publishTrip } from '../services/tripService';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme';

function FormField({ label, icon, error, children }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <Ionicons name={icon} size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
        {children}
      </View>
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

export default function PublishScreen({ navigation }) {
  const { user, userProfile } = useAuth();
  const [form, setForm] = useState({
    depart: '',
    arrivee: '',
    date: '',
    heure: '',
    places: '',
    prix: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.depart.trim()) e.depart = 'Requis';
    if (!form.arrivee.trim()) e.arrivee = 'Requis';
    if (!form.date.trim() || !/^\d{2}\/\d{2}\/\d{4}$/.test(form.date)) e.date = 'Format JJ/MM/AAAA';
    if (!form.heure.trim() || !/^\d{2}:\d{2}$/.test(form.heure)) e.heure = 'Format HH:MM';
    if (!form.places || isNaN(form.places) || Number(form.places) < 1 || Number(form.places) > 8)
      e.places = 'Entre 1 et 8 places';
    if (!form.prix || isNaN(form.prix) || Number(form.prix) < 0)
      e.prix = 'Prix invalide';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePublish = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const conducteurNom = `${userProfile?.prenom || ''} ${userProfile?.nom || ''}`.trim() || 'Conducteur';
      await publishTrip({
        conducteurId: user.uid,
        conducteurNom,
        depart: form.depart,
        arrivee: form.arrivee,
        date: form.date,
        heure: form.heure,
        places: form.places,
        prix: form.prix,
      });
      Alert.alert(
        'Trajet publié ! 🎉',
        'Votre trajet est maintenant visible par tous les voyageurs.',
        [
          {
            text: 'Voir mes trajets',
            onPress: () => {
              navigation.navigate('Reservations');
              setForm({ depart: '', arrivee: '', date: '', heure: '', places: '', prix: '' });
            },
          },
          {
            text: 'Publier un autre',
            onPress: () => setForm({ depart: '', arrivee: '', date: '', heure: '', places: '', prix: '' }),
          },
        ]
      );
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de publier le trajet. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.heroBanner}>
            <View style={styles.heroIcon}>
              <Ionicons name="car" size={30} color={COLORS.white} />
            </View>
            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>Publier un trajet</Text>
              <Text style={styles.heroSub}>Partagez votre route et réduisez votre empreinte</Text>
            </View>
          </View>

          {/* Route */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Itinéraire</Text>

            <FormField label="Ville de départ" icon="location-outline" error={errors.depart}>
              <TextInput
                style={styles.input}
                placeholder="Paris, Lyon, Marseille..."
                placeholderTextColor={COLORS.textMuted}
                value={form.depart}
                onChangeText={set('depart')}
                autoCapitalize="words"
              />
            </FormField>

            <View style={styles.swapRow}>
              <View style={styles.swapLine} />
              <View style={styles.swapIcon}>
                <Ionicons name="swap-vertical" size={18} color={COLORS.primary} />
              </View>
            </View>

            <FormField label="Ville d'arrivée" icon="navigate-circle-outline" error={errors.arrivee}>
              <TextInput
                style={styles.input}
                placeholder="Bordeaux, Nice, Nantes..."
                placeholderTextColor={COLORS.textMuted}
                value={form.arrivee}
                onChangeText={set('arrivee')}
                autoCapitalize="words"
              />
            </FormField>
          </View>

          {/* Date & Heure */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Date et heure</Text>
            <View style={styles.row}>
              <View style={styles.half}>
                <FormField label="Date" icon="calendar-outline" error={errors.date}>
                  <TextInput
                    style={styles.input}
                    placeholder="JJ/MM/AAAA"
                    placeholderTextColor={COLORS.textMuted}
                    value={form.date}
                    onChangeText={set('date')}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </FormField>
              </View>
              <View style={styles.half}>
                <FormField label="Heure" icon="time-outline" error={errors.heure}>
                  <TextInput
                    style={styles.input}
                    placeholder="HH:MM"
                    placeholderTextColor={COLORS.textMuted}
                    value={form.heure}
                    onChangeText={set('heure')}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </FormField>
              </View>
            </View>
          </View>

          {/* Places & Prix */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Détails pratiques</Text>
            <View style={styles.row}>
              <View style={styles.half}>
                <FormField label="Nb. de places" icon="people-outline" error={errors.places}>
                  <TextInput
                    style={styles.input}
                    placeholder="1 - 8"
                    placeholderTextColor={COLORS.textMuted}
                    value={form.places}
                    onChangeText={set('places')}
                    keyboardType="numeric"
                    maxLength={1}
                  />
                </FormField>
              </View>
              <View style={styles.half}>
                <FormField label="Prix / place (€)" icon="cash-outline" error={errors.prix}>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor={COLORS.textMuted}
                    value={form.prix}
                    onChangeText={set('prix')}
                    keyboardType="decimal-pad"
                    maxLength={6}
                  />
                </FormField>
              </View>
            </View>

            {form.depart && form.arrivee && form.places && form.prix ? (
              <View style={styles.previewRow}>
                <Ionicons name="leaf-outline" size={16} color={COLORS.primary} />
                <Text style={styles.previewText}>
                  {form.depart} → {form.arrivee} · {form.places} place{Number(form.places) > 1 ? 's' : ''} · {form.prix} €/pers.
                </Text>
              </View>
            ) : null}
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handlePublish}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color={COLORS.white} />
                <Text style={styles.submitBtnText}>Publier mon trajet</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  container: { padding: SPACING.base, paddingBottom: SPACING['3xl'] },
  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.base,
    ...SHADOW.button,
  },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: { flex: 1 },
  heroTitle: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.white },
  heroSub: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
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
  row: { flexDirection: 'row', gap: SPACING.md },
  half: { flex: 1 },
  field: { marginBottom: SPACING.sm },
  label: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.xs },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
  },
  inputError: { borderColor: COLORS.error },
  inputIcon: { marginRight: SPACING.xs },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: FONTS.sizes.base,
    color: COLORS.text,
  },
  fieldError: { color: COLORS.error, fontSize: FONTS.sizes.xs, marginTop: 4 },
  swapRow: { flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.xs },
  swapLine: { flex: 1, height: 1, backgroundColor: COLORS.borderLight },
  swapIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.md,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.borderLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.xs,
  },
  previewText: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '600' },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.base + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    ...SHADOW.button,
    marginTop: SPACING.sm,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.lg },
});
