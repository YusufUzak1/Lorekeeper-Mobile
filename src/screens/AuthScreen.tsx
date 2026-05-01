import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { signIn, signUp, confirmSignUp } from 'aws-amplify/auth';
import { useAuthStore } from '../store/useAuthStore';

type Mode = 'login' | 'signup';

export function AuthScreen() {
  const { login } = useAuthStore();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [pendingUsername, setPendingUsername] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const buildUsernameFromEmail = (mail: string) => {
    const local = mail.split('@')[0] ?? 'user';
    const normalized = local.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 18) || 'user';
    const suffix = Math.random().toString(36).slice(2, 8);
    return `${normalized}_${suffix}`;
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signIn({ username: email.trim(), password });
      login(email.trim());
    } catch (err: any) {
      setError(err.message || 'Giriş yapılamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);
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
        setMessage('Doğrulama kodu e-posta adresinize gönderildi.');
      } else {
        setMessage('Kayıt tamamlandı. Şimdi giriş yapabilirsiniz.');
        setMode('login');
      }
    } catch (err: any) {
      const msg = err.message || 'Kayıt oluşturulamadı.';
      if (msg.toLowerCase().includes('already exists') || msg.includes('AliasExistsException')) {
        setError('Bu e-posta adresi zaten kullanılıyor. Lütfen giriş yapın.');
        setMode('login');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!pendingUsername) return;
    setLoading(true);
    setError(null);
    try {
      await confirmSignUp({
        username: pendingUsername,
        confirmationCode: code.trim(),
      });
      setPendingUsername(null);
      setPendingEmail(null);
      setCode('');
      setMode('login');
      setMessage('E-posta doğrulandı. Artık giriş yapabilirsiniz.');
    } catch (err: any) {
      setError(err.message || 'Kod doğrulanamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-mythos-bg">
      <View className="bg-mythos-panel p-6 rounded-2xl border border-mythos-border">
        <Text className="text-mythos-text text-2xl font-bold mb-2">Lorekeeper</Text>
        <Text className="text-mythos-muted mb-6">Evreninize giriş yapın.</Text>

        {pendingEmail ? (
          <View className="space-y-4">
            <Text className="text-mythos-text text-sm mb-4">
              <Text className="text-mythos-accent">{pendingEmail}</Text> adresine gelen kodu girin.
            </Text>
            <TextInput
              className="bg-black/30 border border-white/10 rounded-md p-3 text-white mb-4"
              placeholder="Doğrulama Kodu"
              placeholderTextColor="#8A8A8E"
              value={code}
              onChangeText={setCode}
            />
            <TouchableOpacity 
              className="bg-mythos-accent/80 p-3 rounded-md items-center mb-2"
              onPress={handleConfirm}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#000" /> : <Text className="font-bold text-black uppercase">Onayla</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <View className="space-y-4">
            <View className="flex-row rounded-xl border border-white/10 bg-black/25 p-1 mb-6">
              <TouchableOpacity
                className={`flex-1 p-2 items-center rounded-lg ${mode === 'login' ? 'bg-mythos-accent/20 border border-mythos-accent/40' : ''}`}
                onPress={() => setMode('login')}
              >
                <Text className={mode === 'login' ? 'text-mythos-accent font-bold' : 'text-white/60'}>GİRİŞ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 p-2 items-center rounded-lg ${mode === 'signup' ? 'bg-mythos-accent/20 border border-mythos-accent/40' : ''}`}
                onPress={() => setMode('signup')}
              >
                <Text className={mode === 'signup' ? 'text-mythos-accent font-bold' : 'text-white/60'}>KAYIT</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              className="bg-black/30 border border-white/10 rounded-md p-3 text-white mb-3"
              placeholder="E-posta"
              placeholderTextColor="#8A8A8E"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              className="bg-black/30 border border-white/10 rounded-md p-3 text-white mb-6"
              placeholder="Şifre"
              placeholderTextColor="#8A8A8E"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity 
              className="bg-mythos-accent/80 p-3 rounded-md items-center mb-4"
              onPress={mode === 'login' ? handleLogin : handleSignUp}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#000" /> : <Text className="font-bold text-black uppercase">{mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}</Text>}
            </TouchableOpacity>
          </View>
        )}

        {(error || message) && (
          <Text className={`text-sm mt-4 text-center ${error ? 'text-red-400' : 'text-mythos-accent'}`}>
            {error || message}
          </Text>
        )}
      </View>
    </View>
  );
}
