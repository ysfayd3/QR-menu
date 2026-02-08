// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_QH1cmFWtB6kmJpw85fUA_SsZxiK-vO8",
  authDomain: "leanor-cafe.firebaseapp.com",
  projectId: "leanor-cafe",
  storageBucket: "leanor-cafe.firebasestorage.app",
  messagingSenderId: "337142746266",
  appId: "1:337142746266:web:bc11ff096147c39e972323"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// Firestore Collections
const menuCollection = db.collection('menu');
const categoriesCollection = db.collection('categories');
const settingsCollection = db.collection('settings');

// Firebase Helper Functions
const FirebaseDB = {
  // Menü verilerini al
  async getMenu() {
    try {
      const snapshot = await menuCollection.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Menü alınamadı:', error);
      return [];
    }
  },

  // Menü verilerini kaydet (tümünü)
  async saveMenu(menuData) {
    try {
      const batch = db.batch();
      
      // Önce tüm eski verileri sil
      const oldDocs = await menuCollection.get();
      oldDocs.forEach(doc => batch.delete(doc.ref));
      
      // Yeni verileri ekle
      menuData.forEach(item => {
        const docRef = menuCollection.doc(item.id.toString());
        batch.set(docRef, item);
      });
      
      await batch.commit();
      console.log('Menü Firebase\'e kaydedildi');
      return true;
    } catch (error) {
      console.error('Menü kaydedilemedi:', error);
      return false;
    }
  },

  // Tek bir ürünü güncelle
  async updateProduct(product) {
    try {
      const docRef = menuCollection.doc(product.id.toString());
      await docRef.set(product);
      console.log('Ürün güncellendi:', product.name);
      return true;
    } catch (error) {
      console.error('Ürün güncellenemedi:', error);
      return false;
    }
  },

  // Tek bir ürünü sil
  async deleteProduct(productId) {
    try {
      const docRef = menuCollection.doc(productId.toString());
      await docRef.delete();
      console.log('Ürün silindi:', productId);
      return true;
    } catch (error) {
      console.error('Ürün silinemedi:', error);
      return false;
    }
  },

  // Kategorileri al
  async getCategories() {
    try {
      const doc = await categoriesCollection.doc('list').get();
      return doc.exists ? doc.data().items : [];
    } catch (error) {
      console.error('Kategoriler alınamadı:', error);
      return [];
    }
  },

  // Kategorileri kaydet
  async saveCategories(categories) {
    try {
      await categoriesCollection.doc('list').set({ items: categories });
      console.log('Kategoriler Firebase\'e kaydedildi');
      return true;
    } catch (error) {
      console.error('Kategoriler kaydedilemedi:', error);
      return false;
    }
  },

  // Ayarları al
  async getSettings() {
    try {
      const doc = await settingsCollection.doc('general').get();
      return doc.exists ? doc.data() : null;
    } catch (error) {
      console.error('Ayarlar alınamadı:', error);
      return null;
    }
  },

  // Ayarları kaydet
  async saveSettings(settings) {
    try {
      await settingsCollection.doc('general').set(settings);
      console.log('Ayarlar Firebase\'e kaydedildi');
      return true;
    } catch (error) {
      console.error('Ayarlar kaydedilemedi:', error);
      return false;
    }
  },

  // İlk verileri yükle (sadece bir kez)
  async initializeData(menuData, categories, settings) {
    try {
      // Veri var mı kontrol et
      const menuSnapshot = await menuCollection.limit(1).get();
      
      if (menuSnapshot.empty) {
        console.log('İlk veriler yükleniyor...');
        await this.saveMenu(menuData);
        await this.saveCategories(categories);
        await this.saveSettings(settings);
        console.log('İlk veriler başarıyla yüklendi!');
        return true;
      }
      return false;
    } catch (error) {
      console.error('İlk veriler yüklenemedi:', error);
      return false;
    }
  }
};

// Firebase Storage Helper Functions
const FirebaseStorage = {
  // Fotoğraf yükle
  async uploadImage(file, productId) {
    try {
      // Dosya kontrolü
      if (!file || !file.type.startsWith('image/')) {
        throw new Error('Geçersiz dosya formatı! Lütfen bir resim dosyası seçin.');
      }

      // Dosya boyutu kontrolü (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('Dosya boyutu çok büyük! Maksimum 5MB olmalıdır.');
      }

      // Benzersiz dosya adı oluştur (timestamp + productId + uzantı)
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const fileName = `products/${productId}_${timestamp}.${extension}`;

      // Storage referansı oluştur
      const storageRef = storage.ref(fileName);

      // Dosyayı yükle
      console.log('📤 Fotoğraf yükleniyor:', fileName);
      const uploadTask = storageRef.put(file);

      // Yükleme ilerlemesini takip et
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // İlerleme yüzdesi
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Yükleme: ${progress.toFixed(0)}%`);
            
            // İlerleme göstergesini güncelle
            if (window.updateUploadProgress) {
              window.updateUploadProgress(progress);
            }
          },
          (error) => {
            // Hata durumu
            console.error('Yükleme hatası:', error);
            reject(error);
          },
          async () => {
            // Başarılı yükleme - Download URL al
            try {
              const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
              console.log('✅ Fotoğraf yüklendi:', downloadURL);
              resolve(downloadURL);
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error('Fotoğraf yükleme hatası:', error);
      throw error;
    }
  },

  // Eski fotoğrafı sil
  async deleteImage(imageUrl) {
    try {
      if (!imageUrl || !imageUrl.includes('firebase')) {
        return true; // Firebase URL değilse silmeye gerek yok
      }

      // URL'den dosya yolunu çıkar
      const storageRef = storage.refFromURL(imageUrl);
      await storageRef.delete();
      console.log('🗑️ Eski fotoğraf silindi');
      return true;
    } catch (error) {
      // Dosya bulunamazsa hata vermeden devam et
      if (error.code === 'storage/object-not-found') {
        console.log('Silinecek dosya bulunamadı (zaten silinmiş olabilir)');
        return true;
      }
      console.error('Fotoğraf silme hatası:', error);
      return false;
    }
  }
};
