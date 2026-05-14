import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { confirmSignUp, resendSignUpCode, signIn, signOut, signUp } from 'aws-amplify/auth';
import { useAuthStore } from '../store/useAuthStore';
import { pullCloudStateAfterAuth } from '../services/cloudSyncAfterAuth';

type Mode = 'login' | 'signup';

function buildUsernameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? 'user';
  const normalized = local.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 18) || 'user';
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${normalized}_${suffix}`;
}

/** Cognito/Amplify hata nesnelerini okunabilir metne çevirir. */
function formatAuthError(err: unknown): string {
  if (err instanceof Error && err.message && err.message !== 'An unknown error has occurred') {
    return err.message;
  }
  if (err && typeof err === 'object') {
    const o = err as Record<string, unknown>;
    const name = typeof o.name === 'string' ? o.name : '';
    const msg = typeof o.message === 'string' ? o.message : '';
    if (name === 'NotAuthorizedException') {
      return 'E-posta veya şifre hatalı.';
    }
    if (name === 'UserNotConfirmedException') {
      return 'Hesap henüz doğrulanmamış. Kayıt e-postasındaki kodu girin.';
    }
    if (name === 'UserAlreadyAuthenticatedException') {
      return 'Zaten oturum açık. Uygulamayı yeniden başlatıp deneyin.';
    }
    if (msg && msg !== 'An unknown error has occurred') {
      return `${name ? `${name}: ` : ''}${msg}`.trim();
    }
    if (name) return name;
  }
  return 'Giriş yapılamadı. Expo Go kullanıyorsanız geliştirme derlemesi (npx expo run:android) deneyin veya Cognito istemcisinde USER_PASSWORD_AUTH etkin mi kontrol edin.';
}

export function AuthScreen() {
  const { login, loginAsGuest } = useAuthStore();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');

  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [pendingUsername, setPendingUsername] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const isVerificationStep = useMemo(() => pendingEmail !== null, [pendingEmail]);

  const switchMode = (next: Mode) => {
    setMode(next);
    setMessage(null);
    setError(null);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('E-posta ve şifre gerekli.');
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const { nextStep } = await signIn({
        username: email.trim(),
        password,
        options: {
          // RN varsayılan SRP, Expo Go'da yerel AmplifyRTNCore olmadan kırılır ("unknown error").
          authFlowType: 'USER_PASSWORD_AUTH',
        },
      });
      if (nextStep.signInStep !== 'DONE') {
        setError(`Ek adım gerekli: ${nextStep.signInStep}. Uygulama şimdilik yalnızca doğrudan girişi destekliyor.`);
        return;
      }
      login(email.trim());
      try {
        await pullCloudStateAfterAuth();
      } catch (pullErr) {
        const msg = pullErr instanceof Error ? pullErr.message : 'Bulut senkronu başarısız.';
        Alert.alert('Bulut', msg);
      }
    } catch (err: unknown) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email.trim() || !password) {
      setError('E-posta ve şifre gerekli.');
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const generatedUsername = buildUsernameFromEmail(email.trim());
      const result = await signUp({
        username: generatedUsername,
        password,
        options: {
          userAttributes: {
            email: email.trim(),
          },
        },
      });

      if (result.nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        setPendingUsername(generatedUsername);
        setPendingEmail(email.trim());
        setMessage('Doğrulama kodu e-posta adresine gönderildi.');
      } else {
        setMessage('Kayıt tamamlandı. Şimdi giriş yapabilirsin.');
        switchMode('login');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Kayıt oluşturulamadı.';
      if (msg.toLowerCase().includes('already exists') || msg.includes('AliasExistsException')) {
        setError('Bu e-posta adresi zaten kullanılıyor. Lütfen giriş yapın.');
        switchMode('login');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!pendingEmail || !pendingUsername) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await confirmSignUp({
        username: pendingUsername,
        confirmationCode: code.trim(),
      });
      setPendingUsername(null);
      setPendingEmail(null);
      setCode('');
      setMode('login');
      setMessage('E-posta doğrulandı. Artık giriş yapabilirsin.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Kod doğrulanamadı.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!pendingUsername) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await resendSignUpCode({ username: pendingUsername });
      setMessage('Yeni doğrulama kodu gönderildi.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Kod tekrar gönderilemedi.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    setError(null);
    try {
      try {
        await signOut();
      } catch {
        /* zaten oturum yok */
      }
      loginAsGuest();
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0F0F11' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 24,
          paddingVertical: 32,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            backgroundColor: '#1A1A1D',
            padding: 24,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: '#2A2A2E',
          }}
        >
          <Text style={{ color: '#E5E5E5', fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
            Lorekeeper
          </Text>
          <Text style={{ color: '#8A8A8E', marginBottom: 20 }}>
            AWS Cognito ile güvenli giriş; web ile aynı hesap ve bulut yedeği.
          </Text>

          {!isVerificationStep && (
            <View
              style={{
                flexDirection: 'row',
                marginBottom: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)',
                overflow: 'hidden',
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  backgroundColor: mode === 'login' ? 'rgba(198,160,82,0.2)' : 'transparent',
                }}
                onPress={() => switchMode('login')}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    color: mode === 'login' ? '#C6A052' : '#8A8A8E',
                    fontWeight: '600',
                    fontSize: 12,
                  }}
                >
                  GİRİŞ
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  backgroundColor: mode === 'signup' ? 'rgba(198,160,82,0.2)' : 'transparent',
                }}
                onPress={() => switchMode('signup')}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    color: mode === 'signup' ? '#C6A052' : '#8A8A8E',
                    fontWeight: '600',
                    fontSize: 12,
                  }}
                >
                  KAYIT
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {isVerificationStep ? (
            <View>
              <Text style={{ color: '#8A8A8E', fontSize: 13, marginBottom: 12 }}>
                <Text style={{ color: '#C6A052' }}>{pendingEmail}</Text> adresine gelen kodu girin.
              </Text>
              <TextInput
                style={{
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  padding: 12,
                  color: '#E5E5E5',
                  marginBottom: 12,
                }}
                placeholder="Doğrulama kodu"
                placeholderTextColor="#8A8A8E"
                value={code}
                onChangeText={setCode}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={{
                  backgroundColor: '#C6A052',
                  padding: 14,
                  borderRadius: 10,
                  alignItems: 'center',
                  marginBottom: 8,
                  opacity: loading ? 0.6 : 1,
                }}
                onPress={handleConfirm}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={{ fontWeight: 'bold', color: '#000' }}>ONAYLA</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={handleResendCode} disabled={loading}>
                <Text style={{ color: '#C6A052', textAlign: 'center', fontSize: 13 }}>Kodu tekrar gönder</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <TextInput
                style={{
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  padding: 12,
                  color: '#E5E5E5',
                  marginBottom: 12,
                }}
                placeholder="E-posta"
                placeholderTextColor="#8A8A8E"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TextInput
                style={{
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  padding: 12,
                  color: '#E5E5E5',
                  marginBottom: 16,
                }}
                placeholder="Şifre"
                placeholderTextColor="#8A8A8E"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TouchableOpacity
                style={{
                  backgroundColor: '#C6A052',
                  padding: 14,
                  borderRadius: 10,
                  alignItems: 'center',
                  marginBottom: 16,
                  opacity: loading ? 0.6 : 1,
                }}
                onPress={mode === 'login' ? handleLogin : handleSignUp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={{ fontWeight: 'bold', color: '#000' }}>
                    {mode === 'login' ? 'GİRİŞ YAP' : 'KAYIT OL'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {(message || error) && (
            <Text
              style={{
                marginTop: 8,
                fontSize: 12,
                color: error ? '#FF6B6B' : 'rgba(198,160,82,0.95)',
              }}
            >
              {error ?? message}
            </Text>
          )}

          <View style={{ height: 1, backgroundColor: '#2A2A2E', marginVertical: 20 }} />

          <TouchableOpacity
            style={{
              backgroundColor: 'rgba(198,160,82,0.15)',
              padding: 14,
              borderRadius: 10,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(198,160,82,0.35)',
              opacity: loading ? 0.6 : 1,
            }}
            onPress={handleGuest}
            disabled={loading}
          >
            <Text style={{ fontWeight: 'bold', color: '#C6A052' }}>MİSAFİR OLARAK DEVAM ET</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
