import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { register } from '../../services/authService';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../../theme';

// ── Stepper ──────────────────────────────────────────────────────────────────
const STEPS = ['Inscription', 'Vérification', 'Succès'];

function Stepper({ current }) {
  return (
    <View style={step.wrap}>
      <View style={step.row}>
        {STEPS.map((label, i) => {
          const num = i + 1;
          const done = num < current;
          const active = num === current;
          return (
            <React.Fragment key={i}>
              {/* Circle */}
              <View
                style={[
                  step.circle,
                  done && step.circleDone,
                  active && step.circleActive,
                  !done && !active && step.circleTodo,
                ]}
              >
                {done ? (
                  <Ionicons name="checkmark" size={13} color={COLORS.white} />
                ) : (
                  <Text style={[step.num, (done || active) && step.numActive]}>{num}</Text>
                )}
              </View>
              {/* Line between circles */}
              {i < STEPS.length - 1 && (
                <View style={[step.line, done && step.lineDone]} />
              )}
            </React.Fragment>
          );
        })}
      </View>
      {/* Labels */}
      <View style={step.labels}>
        {STEPS.map((label, i) => (
          <Text key={i} style={[step.lbl, i + 1 === current && step.lblActive]}>
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const step = StyleSheet.create({
  wrap: { marginBottom: 28 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  circleDone: { backgroundColor: COLORS.primary },
  circleActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  circleTodo: { backgroundColor: '#F0F0F0', borderWidth: 1.5, borderColor: COLORS.border },
  num: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  numActive: { color: COLORS.white },
  line: { flex: 1, height: 2, backgroundColor: COLORS.border },
  lineDone: { backgroundColor: COLORS.primary },
  labels: { flexDirection: 'row', justifyContent: 'space-between' },
  lbl: { fontSize: 11, color: COLORS.textMuted, width: 80, textAlign: 'center' },
  lblActive: { color: COLORS.primary, fontWeight: '600' },
});

// ── Password strength bar ─────────────────────────────────────────────────────
function PasswordStrength({ password }) {
  const len = password.length;
  const strength = len === 0 ? 0 : len < 6 ? 1 : len < 10 ? 2 : 3;
  const colors = ['#E5E7EB', '#EF4444', '#F59E0B', COLORS.primary];
  return (
    <View style={pw.row}>
      {[1, 2, 3, 4].map((i) => (
        <View
          key={i}
          style={[pw.bar, { backgroundColor: i <= strength ? colors[strength] : '#E5E7EB' }]}
        />
      ))}
    </View>
  );
}

const pw = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4, marginTop: 6 },
  bar: { flex: 1, height: 3, borderRadius: 2 },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.nom.trim()) e.nom = 'Requis';
    if (!form.prenom.trim()) e.prenom = 'Requis';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email invalide';
    if (form.password.length < 6) e.password = 'Au moins 6 caractères';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Les mots de passe ne correspondent pas';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setGlobalError('');
    setLoading(true);
    setCurrentStep(2);
    try {
      await register({
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      setCurrentStep(3);
    } catch (e) {
      setCurrentStep(1);
      const msg =
        e.code === 'auth/email-already-in-use'
          ? 'Cet email est déjà utilisé.'
          : 'Erreur lors de la création du compte.';
      setGlobalError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <Ionicons name="leaf" size={20} color={COLORS.white} />
            </View>
            <Text style={styles.logoText}>EcoRide</Text>
          </View>

          {/* Stepper */}
          <Stepper current={currentStep} />

          {/* ── STEP 1 : Form ─────────────────────────────────────────────── */}
          {currentStep === 1 && (
            <>
              <Text style={styles.title}>Créer un compte</Text>
              <Text style={styles.subtitle}>
                Rejoignez la communauté EcoRide et commencez à réduire votre empreinte carbone.
              </Text>

              {globalError ? (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={15} color={COLORS.error} />
                  <Text style={styles.errorText}>{globalError}</Text>
                </View>
              ) : null}

              {/* Prénom + Nom */}
              <View style={styles.row}>
                <View style={styles.half}>
                  <Text style={styles.fieldLabel}>Prénom</Text>
                  <TextInput
                    style={[styles.fieldInput, errors.prenom && styles.fieldInputError]}
                    placeholder="Jean"
                    placeholderTextColor={COLORS.textMuted}
                    value={form.prenom}
                    onChangeText={set('prenom')}
                    autoCapitalize="words"
                  />
                  {errors.prenom ? <Text style={styles.fieldError}>{errors.prenom}</Text> : null}
                </View>
                <View style={styles.half}>
                  <Text style={styles.fieldLabel}>Nom</Text>
                  <TextInput
                    style={[styles.fieldInput, errors.nom && styles.fieldInputError]}
                    placeholder="Dupont"
                    placeholderTextColor={COLORS.textMuted}
                    value={form.nom}
                    onChangeText={set('nom')}
                    autoCapitalize="words"
                  />
                  {errors.nom ? <Text style={styles.fieldError}>{errors.nom}</Text> : null}
                </View>
              </View>

              {/* Email */}
              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Email</Text>
                <TextInput
                  style={[styles.fieldInput, errors.email && styles.fieldInputError]}
                  placeholder="jean@email.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={form.email}
                  onChangeText={set('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.email ? <Text style={styles.fieldError}>{errors.email}</Text> : null}
              </View>

              {/* Password */}
              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Mot de passe</Text>
                <View style={styles.inputIconWrap}>
                  <TextInput
                    style={[
                      styles.fieldInput,
                      styles.fieldInputPad,
                      errors.password && styles.fieldInputError,
                    ]}
                    placeholder="Min. 6 caractères"
                    placeholderTextColor={COLORS.textMuted}
                    value={form.password}
                    onChangeText={set('password')}
                    secureTextEntry={!showPwd}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPwd((v) => !v)}>
                    <Ionicons
                      name={showPwd ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={COLORS.textMuted}
                    />
                  </TouchableOpacity>
                </View>
                <PasswordStrength password={form.password} />
                {errors.password ? <Text style={styles.fieldError}>{errors.password}</Text> : null}
              </View>

              {/* Confirm password */}
              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Confirmer le mot de passe</Text>
                <View style={styles.inputIconWrap}>
                  <TextInput
                    style={[
                      styles.fieldInput,
                      styles.fieldInputPad,
                      errors.confirmPassword && styles.fieldInputError,
                    ]}
                    placeholder="Répéter le mot de passe"
                    placeholderTextColor={COLORS.textMuted}
                    value={form.confirmPassword}
                    onChangeText={set('confirmPassword')}
                    secureTextEntry={!showConfirm}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowConfirm((v) => !v)}
                  >
                    <Ionicons
                      name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={COLORS.textMuted}
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword ? (
                  <Text style={styles.fieldError}>{errors.confirmPassword}</Text>
                ) : null}
              </View>

              <TouchableOpacity
                style={[styles.btnMain, loading && styles.btnDisabled]}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.88}
              >
                <Text style={styles.btnMainText}>Continuer →</Text>
              </TouchableOpacity>

              <View style={styles.linkRow}>
                <Text style={styles.linkText}>Déjà un compte ?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.link}> Se connecter</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* ── STEP 2 : Creating account ──────────────────────────────────── */}
          {currentStep === 2 && (
            <View style={styles.centered}>
              <View style={styles.loadingCircle}>
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
              <Text style={styles.loadingTitle}>Création du compte…</Text>
              <Text style={styles.loadingText}>
                Vérification de vos informations et création de votre profil EcoRide.
              </Text>
            </View>
          )}

          {/* ── STEP 3 : Success ───────────────────────────────────────────── */}
          {currentStep === 3 && (
            <>
              <View style={styles.successIconWrap}>
                <Ionicons name="checkmark-circle" size={42} color={COLORS.primary} />
              </View>
              <Text style={styles.successTitle}>Inscription réussie !</Text>
              <Text style={styles.successSub}>
                Bienvenue dans la communauté EcoRide.{'\n'}Votre compte a été créé avec succès.
              </Text>

              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Ionicons name="mail-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.infoText}>{form.email}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.infoText}>Compte sécurisé</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.infoText}>Membre depuis juin 2026</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.btnMain} activeOpacity={0.88}>
                <Text style={styles.btnMainText}>Compléter mon profil</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 40,
  },

  // Logo
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 28 },
  logoIcon: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { fontSize: 18, fontWeight: '600', color: COLORS.primary, letterSpacing: -0.3 },

  // Heading
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: -0.5,
    lineHeight: 32,
    marginBottom: 6,
  },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 24 },

  // Error
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.base,
  },
  errorText: { color: COLORS.error, fontSize: 13, flex: 1 },

  // Form layout
  row: { flexDirection: 'row', gap: SPACING.md, marginBottom: 2 },
  half: { flex: 1 },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  fieldInput: {
    height: 48,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  fieldInputPad: { paddingRight: 44 },
  fieldInputError: { borderColor: COLORS.error },
  fieldError: { color: COLORS.error, fontSize: 11, marginTop: 4 },
  inputIconWrap: { position: 'relative' },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },

  // Button
  btnMain: {
    width: '100%',
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...SHADOW.button,
  },
  btnDisabled: { opacity: 0.65 },
  btnMainText: { color: COLORS.white, fontSize: 15, fontWeight: '600', letterSpacing: 0.1 },

  // Footer link
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  linkText: { fontSize: 13, color: COLORS.textSecondary },
  link: { fontSize: 13, color: COLORS.primary, fontWeight: '500' },

  // Loading (step 2)
  centered: { alignItems: 'center', paddingVertical: 40 },
  loadingCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loadingTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  loadingText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },

  // Success (step 3)
  successIconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  successSub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: COLORS.cardGreen,
    borderWidth: 1.5,
    borderColor: COLORS.borderGreen,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    gap: SPACING.md,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  infoText: { fontSize: 14, color: COLORS.text },
});
