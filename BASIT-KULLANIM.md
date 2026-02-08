# 📱 BASİT KULLANIM REHBERİ

## 🎯 3 Basit Adımda Başla!

---

## ADIM 1: Admin Paneli Aç

```
📂 Dosya: admin-auto-sync.html
🔑 Kullanıcı: admin
🔐 Şifre: admin123
```

**Ne yapacaksın:**
1. `admin-auto-sync.html` dosyasına çift tıkla
2. Kullanıcı adı: `admin` yaz
3. Şifre: `admin123` yaz
4. "Giriş Yap" butonuna tıkla

✅ Admin paneline girdin!

---

## ADIM 2: Otomatik Senkronizasyonu Kur

### 2.1. GitHub Token Al

```
🌐 Adres: github.com/settings/tokens/new
```

**Ne yapacaksın:**
1. Tarayıcıda `github.com/settings/tokens/new` adresine git
2. "Note" kısmına `QR Menu` yaz
3. "Expiration" kısmında `No expiration` seç
4. Sadece `gist` kutucuğunu işaretle (diğerlerine dokunma!)
5. En alttaki "Generate token" butonuna tıkla
6. Çıkan token'ı kopyala (ghp_xxxxxxxxxxxx gibi)

⚠️ **ÖNEMLİ:** Token'ı bir yere kaydet! Bir daha göremezsin!

### 2.2. Admin Panelde Ayarla

**Ne yapacaksın:**
1. Admin panelde "⚙️ Senkronizasyon Ayarları" butonuna tıkla
2. "Senkronizasyon Yöntemi" kısmında `GitHub Gist` seç
3. "GitHub Personal Access Token" kutusuna token'ı yapıştır
4. "Gist ID" kutusunu boş bırak
5. "💾 Kaydet" butonuna tıkla
6. "🧪 Test Et" butonuna tıkla
7. "✅ Test başarılı!" mesajını gör

✅ Otomatik senkronizasyon kuruldu!

---

## ADIM 3: İlk Ürünü Ekle

**Ne yapacaksın:**
1. "Ürün Adı" kutusuna `Türk Kahvesi` yaz
2. "Kategori" kısmında `Sıcak İçecekler` seç
3. "Fiyat" kutusuna `45₺` yaz
4. "Açıklama" kutusuna `Geleneksel yöntemle hazırlanan` yaz
5. "💾 KAYDET VE OTOMATİK SENKRONİZE ET" butonuna tıkla
6. "✅ Ürün eklendi ve TÜM CİHAZLARA senkronize edildi!" mesajını gör

✅ İlk ürün eklendi!

### 3.1. Raw URL'yi Kopyala

**Ne yapacaksın:**
1. Klavyede `F12` tuşuna bas (veya sağ tık > İncele)
2. "Console" sekmesine tıkla
3. Şu mesajı bul:
   ```
   📋 Raw URL: https://gist.githubusercontent.com/...
   ```
4. URL'yi kopyala (tamamını!)

✅ Raw URL'yi kopyaladın!

### 3.2. sync-config.js'i Güncelle

**Ne yapacaksın:**
1. `sync-config.js` dosyasını aç (Not Defteri veya herhangi bir editör)
2. Şu satırı bul:
   ```javascript
   cloudUrl: '',
   ```
3. Kopyaladığın URL'yi yapıştır:
   ```javascript
   cloudUrl: 'https://gist.githubusercontent.com/kullanici/abc123/raw/menu-data.json',
   ```
4. Dosyayı kaydet (Ctrl+S)

✅ Müşteri menüsü hazır!

---

## 🎉 TAMAMLANDI!

### Şimdi Test Et

**Bilgisayarda:**
1. `index-simple.html` dosyasına çift tıkla
2. ✅ Ürünleri gör!

**Telefonda:**
1. `index-simple.html` dosyasını telefonda aç
2. ✅ Aynı ürünleri gör!

**Otomatik Güncelleme:**
1. Bilgisayarda yeni ürün ekle
2. Telefonda 1 dakika bekle
3. ✅ Yeni ürün otomatik görünür!

---

## 💡 GÜNLÜK KULLANIM

### Ürün Ekle

```
1. admin-auto-sync.html'i aç
2. Ürün bilgilerini doldur
3. "KAYDET VE OTOMATİK SENKRONİZE ET" butonuna tıkla
4. ✅ Tüm cihazlar 1 dakika içinde güncellenir!
```

### Fotoğraf Ekle

```
1. Ürün ekle/düzenle
2. "Fotoğraf" kısmından "Dosya Seç" butonuna tıkla
3. Bilgisayardan fotoğraf seç (max 2MB)
4. "KAYDET VE OTOMATİK SENKRONİZE ET" butonuna tıkla
5. ✅ Fotoğraf tüm cihazlarda görünür!
```

### Ürün Sil

```
1. Ürünün yanındaki "Sil" butonuna tıkla
2. "Tamam" butonuna tıkla
3. ✅ Otomatik senkronize edilir!
```

### Fiyat Değiştir

```
1. Ürünü düzenle
2. Yeni fiyatı yaz
3. "KAYDET VE OTOMATİK SENKRONİZE ET" butonuna tıkla
4. ✅ Tüm cihazlar 1 dakika içinde güncellenir!
```

---

## 🐛 SORUN YAŞARSAN

### "Test başarısız!" Hatası

**Çözüm:**
```
1. GitHub token'ın doğru olduğunu kontrol et
2. Token'da "gist" yetkisi olduğunu kontrol et
3. İnternet bağlantını kontrol et
4. Token'ı yeniden oluştur ve dene
```

### Menü Görünmüyor

**Çözüm:**
```
1. F12 tuşuna bas
2. "Console" sekmesine git
3. Hata mesajlarını oku
4. sync-config.js'de cloudUrl'in doğru olduğunu kontrol et
```

### Güncelleme Çalışmıyor

**Çözüm:**
```
1. 1 dakika bekle (otomatik güncelleme süresi)
2. Sayfayı yenile (F5)
3. Konsolu kontrol et (F12)
```

---

## 📞 YARDIM

**Detaylı Rehberler:**
- `HIZLI-BASLANGIC.md` - 5 dakikalık kurulum
- `OTOMATIK-SENKRONIZASYON-KURULUM.md` - Detaylı kurulum
- `CIHAZLAR-ARASI-SENKRONIZASYON.md` - Genel rehber

**Konsolu Kontrol Et:**
```
1. F12 tuşuna bas
2. "Console" sekmesine git
3. Hata mesajlarını oku
```

---

## ✅ ÖZET

**Yapman Gerekenler:**
1. ✅ Admin paneline gir
2. ✅ GitHub token oluştur
3. ✅ Senkronizasyon ayarlarını yap
4. ✅ İlk ürünü ekle
5. ✅ Raw URL'yi kopyala
6. ✅ sync-config.js'i güncelle
7. ✅ Test et

**Artık:**
- ✅ Ürün ekle → Tüm cihazlar otomatik güncellenir!
- ✅ Fiyat değiştir → Tüm cihazlar otomatik güncellenir!
- ✅ Fotoğraf ekle → Tüm cihazlar otomatik güncellenir!
- ✅ Manuel işlem yok!

---

**Başarılar! 🚀**

*Artık menün tüm cihazlarda otomatik!*
