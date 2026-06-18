import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { logout } from '../services/authService';
import { db } from '../config/firebase';
import StarRating from '../components/StarRating';
import { seedDatabase } from '../utils/seedData';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme';

const CO2_FACTOR = 0.021;

export default function ProfileScreen() {
  const { user, userProfile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [nom, setNom] = useState(userProfile?.nom || '');
  const [prenom, setPrenom] = useState(userProfile?.prenom || '');
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const co2Saved = ((userProfile?.kmTotal || 0) * CO2_FACTOR).toFixed(1);
  const initials = `${userProfile?.prenom?.charAt(0) || ''}${userProfile?.nom?.charAt(0) || ''}`.toUpperCase() || '?';

  const handleSave = async () => {
    if (!nom.trim() || !prenom.trim()) {
      Alert.alert('Erreur', 'Nom et prénom sont requis.');
      return;
    }
    setSaving(true);
    try {
      await db.collection('users').doc(user.uid).update({
        nom: nom.trim(),
        prenom: prenom.trim(),
      });
      await refreshProfile();
      setEditing(false);
      Alert.alert('Profil mis à jour !');
    } catch {
      Alert.alert('Erreur', 'Impossible de sauvegarder les modifications.');
    } finally {
      setSaving(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const nom = `${userProfile?.prenom || ''} ${userProfile?.nom || ''}`.trim();
      const count = await seedDatabase(user.uid, nom || 'Moi');
      Alert.alert('✅ Données injectées', `${count} trajets créés avec succès dans Firestore.`);
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setSeeding(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de se déconnecter : ' + e.message);
      setLoggingOut(false);
    }
  };

  const cancelEdit = () => {
    setNom(userProfile?.nom || '');
    setPrenom(userProfile?.prenom || '');
    setEditing(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            {!editing && (
              <TouchableOpacity style={styles.editAvatarBtn} onPress={() => setEditing(true)}>
                <Ionicons name="pencil" size={14} color={COLORS.white} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.displayName}>
            {userProfile?.prenom} {userProfile?.nom}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {/* Edit form */}
        {editing && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Modifier le profil</Text>
            <View style={styles.editRow}>
              <View style={styles.editField}>
                <Text style={styles.fieldLabel}>Prénom</Text>
                <TextInput
                  style={styles.editInput}
                  value={prenom}
                  onChangeText={setPrenom}
                  placeholder="Prénom"
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.editField}>
                <Text style={styles.fieldLabel}>Nom</Text>
                <TextInput
                  style={styles.editInput}
                  value={nom}
                  onChangeText={setNom}
                  placeholder="Nom"
                  autoCapitalize="words"
                />
              </View>
            </View>
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={cancelEdit} disabled={saving}>
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Sauvegarder</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Stats */}
        <Text style={styles.sectionTitle}>Mes statistiques</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: COLORS.primary }]}>
            <Ionicons name="leaf" size={28} color={COLORS.white} />
            <Text style={styles.statValue}>{co2Saved}</Text>
            <Text style={styles.statUnit}>kg CO₂</Text>
            <Text style={styles.statLabel}>économisé</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: COLORS.primaryLight }]}>
            <Ionicons name="car" size={28} color={COLORS.white} />
            <Text style={styles.statValue}>{userProfile?.kmTotal || 0}</Text>
            <Text style={styles.statUnit}>km</Text>
            <Text style={styles.statLabel}>parcourus</Text>
          </View>
        </View>

        {/* Rating */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Réputation</Text>
          <View style={styles.ratingRow}>
            <View style={styles.ratingScore}>
              <Text style={styles.ratingValue}>{userProfile?.noteMoyenne || 0}</Text>
              <Text style={styles.ratingMax}> / 5</Text>
            </View>
            <View style={styles.ratingRight}>
              <StarRating value={Math.round(userProfile?.noteMoyenne || 0)} readonly size={24} />
              <Text style={styles.ratingCount}>
                {userProfile?.nombreNotations || 0} avis
              </Text>
            </View>
          </View>
        </View>

        {/* Eco breakdown */}
        <View style={styles.ecoCard}>
          <View style={styles.ecoHeader}>
            <Ionicons name="earth" size={22} color={COLORS.primaryDark} />
            <Text style={styles.ecoTitle}>Votre bilan carbone</Text>
          </View>
          <Text style={styles.ecoDesc}>
            Grâce à vos covoiturages, vous avez évité l'émission de{' '}
            <Text style={styles.ecoBold}>{co2Saved} kg de CO₂</Text> dans l'atmosphère,
            soit l'équivalent de {Math.round(Number(co2Saved) / 2.3)} arbres plantés.
          </Text>
          <View style={styles.ecoBar}>
            <View style={[styles.ecoFill, { width: `${Math.min(Number(co2Saved) * 2, 100)}%` }]} />
          </View>
          <Text style={styles.ecoGoal}>Objectif : 50 kg CO₂ économisés</Text>
        </View>

        {/* Account info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mon compte</Text>
          <View style={styles.infoItem}>
            <Ionicons name="mail-outline" size={18} color={COLORS.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
          </View>
        </View>

        {/* Seed démo */}
        <TouchableOpacity
          style={[styles.seedBtn, seeding && styles.btnDisabled]}
          onPress={handleSeed}
          disabled={seeding}
          activeOpacity={0.85}
        >
          {seeding ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            <>
              <Ionicons name="leaf-outline" size={20} color={COLORS.primary} />
              <Text style={styles.seedText}>Peupler les données démo</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutBtn, loggingOut && styles.logoutBtnDisabled]}
          onPress={handleLogout}
          disabled={loggingOut}
          activeOpacity={0.85}
        >
          {loggingOut ? (
            <ActivityIndicator color={COLORS.error} />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
              <Text style={styles.logoutText}>Se déconnecter</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SPACING.base, paddingBottom: SPACING['4xl'] },
  profileHeader: { alignItems: 'center', marginBottom: SPACING.xl, paddingTop: SPACING.md },
  avatarWrapper: { position: 'relative', marginBottom: SPACING.md },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.button,
  },
  avatarText: { fontSize: FONTS.sizes['3xl'], fontWeight: '800', color: COLORS.white },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  displayName: { fontSize: FONTS.sizes['2xl'], fontWeight: '800', color: COLORS.text },
  email: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 4 },
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
  editRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.md },
  editField: { flex: 1 },
  fieldLabel: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.xs },
  editInput: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONTS.sizes.base,
    color: COLORS.text,
  },
  editActions: { flexDirection: 'row', gap: SPACING.md },
  cancelBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  cancelBtnText: { color: COLORS.textSecondary, fontWeight: '600' },
  saveBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    ...SHADOW.card,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: COLORS.white, fontWeight: '700' },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  statsGrid: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.base },
  statCard: {
    flex: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    alignItems: 'center',
    ...SHADOW.card,
  },
  statValue: { fontSize: FONTS.sizes['2xl'], fontWeight: '900', color: COLORS.white, marginTop: SPACING.sm },
  statUnit: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  statLabel: { fontSize: FONTS.sizes.xs, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.lg },
  ratingScore: { flexDirection: 'row', alignItems: 'baseline' },
  ratingValue: { fontSize: FONTS.sizes['4xl'], fontWeight: '900', color: COLORS.primary },
  ratingMax: { fontSize: FONTS.sizes.lg, color: COLORS.textSecondary },
  ratingRight: { gap: SPACING.xs },
  ratingCount: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  ecoCard: {
    backgroundColor: '#D8F3DC',
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.base,
  },
  ecoHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  ecoTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.primaryDark },
  ecoDesc: { fontSize: FONTS.sizes.sm, color: COLORS.primaryDark, lineHeight: 22, marginBottom: SPACING.md },
  ecoBold: { fontWeight: '800' },
  ecoBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  ecoFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: RADIUS.full, minWidth: 8 },
  ecoGoal: { fontSize: FONTS.sizes.xs, color: COLORS.primaryDark, opacity: 0.75 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: FONTS.sizes.base, color: COLORS.text, fontWeight: '500', marginTop: 2 },
  seedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.cardGreen,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.base,
    marginTop: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.borderGreen,
  },
  seedText: { color: COLORS.primary, fontWeight: '700', fontSize: FONTS.sizes.base },
  btnDisabled: { opacity: 0.5 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.base,
    marginTop: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.error,
    ...SHADOW.card,
  },
  logoutBtnDisabled: { opacity: 0.5 },
  logoutText: { color: COLORS.error, fontWeight: '700', fontSize: FONTS.sizes.md },
});
