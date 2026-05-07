# 📱 Lorekeeper Mobile

Lorekeeper, yazarlar, RPG oyun yöneticileri (DM/GM) ve dünya inşası (worldbuilding) yapanlar için geliştirilmiş, AWS tabanlı, bulut senkronizasyonlu ve AI destekli kişisel evren yönetim uygulamasıdır. Bu depo, projenin React Native / Expo tabanlı mobil versiyonudur.

## 🚀 Özellikler

- **Çoklu Evren Yönetimi:** Birden fazla evren (dünya) oluşturun ve yönetin.
- **Varlık (Entity) Takibi:** Karakterler, mekanlar ve olayları kaydedin.
- **Lore Notları:** Aklınıza gelen fikirleri hızlıca not alın.
- **Mitoloji:** Evreninizin efsanelerini, tanrılarını ve büyü sistemlerini hiyerarşik olarak düzenleyin.
- **Zaman Çizelgesi:** Olayları kronolojik sıraya dizerek evreninizin tarihini oluşturun.
- **Lore AI (Claude 3):** Notlarınızı AI'a gönderin, karakterleri ve olayları otomatik olarak çıkarıp evreninize eklesin.
- **Bulut Senkronizasyonu:** Web versiyonu ile anlık senkronizasyon (AWS API Gateway + DynamoDB).
- **Çevrimdışı Destek:** AsyncStorage ile cihazda kalıcı veri tutma, internet olmadan çalışabilme.

## 🛠️ Teknolojiler

- **Framework:** React Native + Expo (v54)
- **Dil:** TypeScript
- **Stil:** NativeWind (Tailwind CSS)
- **Navigasyon:** React Navigation (v7) (Stack + Bottom Tabs)
- **State Yönetimi:** Zustand + AsyncStorage Persist
- **Auth & Backend:** AWS Amplify, Cognito
- **İkonlar:** Lucide React Native

## 🏗️ Kurulum

### Ön Koşullar
- Node.js (v18+)
- Expo CLI (`npm install -g expo-cli`)
- AWS hesabı (Backend servisleri için)

### Adımlar

1. Depoyu klonlayın:
   ```bash
   git clone https://github.com/YusufUzak1/Lorekeeper-Mobile.git
   cd lorekeeper-mobile
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. Çevre değişkenlerini ayarlayın:
   Kök dizinde `.env` dosyası oluşturun ve AWS Cognito/API bilgilerinizi girin:
   ```env
   EXPO_PUBLIC_AWS_REGION="eu-central-1"
   EXPO_PUBLIC_COGNITO_USER_POOL_ID="your_pool_id"
   EXPO_PUBLIC_COGNITO_CLIENT_ID="your_client_id"
   EXPO_PUBLIC_API_ENDPOINT="your_api_gateway_url"
   ```

4. Uygulamayı başlatın:
   ```bash
   npx expo start
   ```

## 📱 Ekranlar & Akış

1. **Auth:** AWS Cognito ile Giriş/Kayıt veya Misafir girişi.
2. **Evren Seçimi:** Mevcut evrenleri listeleme veya yeni evren oluşturma.
3. **Dashboard (Ana Ekran):** Seçili evrenin istatistikleri ve son eklenenler.
4. **Varlıklar:** Karakter/Mekan/Olay listesi, filtreleme, arama ve detay sayfası.
5. **Notlar:** Hızlı not alma, düzenleme ve silme.
6. **Efsaneler (Mythology):** Tanrılar, büyüler ve mitolojik öğeler.
7. **Zaman Çizelgesi (Timeline):** Kronolojik olay sıralaması.
8. **Lore AI:** Notlardan otomatik lore çıkarımı.
9. **Ayarlar:** Profil, evren değiştirme, bulut senkronizasyonu (Push/Pull) ve çıkış.

## 🔄 Durum (Roadmap)

- [x] Temel Altyapı (Expo, TypeScript, Tailwind)
- [x] Auth Sistemi (Cognito)
- [x] Navigasyon (Bottom Tabs + Stack)
- [x] Tip Sistemi & Zustand Store (AsyncStorage)
- [x] API ve Sync Servisleri
- [x] UI Bileşenleri & Koyu Tema
- [x] Evren Seçimi ve Yönetimi
- [x] Dashboard ve İstatistikler
- [x] Varlık Yönetimi (Karakter, Mekan, Olay)
- [x] Not Sistemi
- [x] Mitoloji Modülü
- [x] Zaman Çizelgesi Modülü
- [x] Lore AI Entegrasyonu
- [ ] Harita Sistemi (SVG adaptasyonu)
- [ ] Dil ve Alfabe Modülü
- [ ] Push Notifications
- [ ] Üretim (Production) Build (EAS)
