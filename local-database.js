// 🗄️ Yerel Veritabanı Sistemi - Firebase Alternatifi
// LocalStorage tabanlı basit ve güçlü veritabanı

const LocalDB = {
  // Veritabanı anahtarları
  keys: {
    menu: 'qr_menu_products',
    categories: 'qr_menu_categories',
    settings: 'qr_menu_settings',
    backup: 'qr_menu_backup'
  },

  // 📦 Menü İşlemleri
  menu: {
    // Tüm ürünleri getir
    getAll() {
      try {
        const data = localStorage.getItem(LocalDB.keys.menu);
        return data ? JSON.parse(data) : [];
      } catch (error) {
        console.error('Menü yüklenemedi:', error);
        return [];
      }
    },

    // Tek ürün getir
    getById(id) {
      const products = this.getAll();
      return products.find(p => p.id === parseInt(id));
    },

    // Kategoriye göre getir
    getByCategory(categoryId) {
      const products = this.getAll();
      return products.filter(p => p.category === categoryId);
    },

    // Tüm ürünleri kaydet
    saveAll(products) {
      try {
        localStorage.setItem(LocalDB.keys.menu, JSON.stringify(products));
        console.log(`✅ ${products.length} ürün kaydedildi`);
        return true;
      } catch (error) {
        console.error('Menü kaydedilemedi:', error);
        if (error.name === 'QuotaExceededError') {
          alert('⚠️ Depolama alanı dolu! Lütfen bazı fotoğrafları küçültün veya silin.');
        }
        return false;
      }
    },

    // Tek ürün ekle/güncelle
    save(product) {
      const products = this.getAll();
      const index = products.findIndex(p => p.id === product.id);
      
      if (index !== -1) {
        products[index] = product;
        console.log('✅ Ürün güncellendi:', product.name);
      } else {
        products.push(product);
        console.log('✅ Ürün eklendi:', product.name);
      }
      
      return this.saveAll(products);
    },

    // Ürün sil
    delete(id) {
      const products = this.getAll();
      const filtered = products.filter(p => p.id !== parseInt(id));
      
      if (filtered.length < products.length) {
        console.log('✅ Ürün silindi:', id);
        return this.saveAll(filtered);
      }
      return false;
    },

    // Arama
    search(query) {
      const products = this.getAll();
      const lowerQuery = query.toLowerCase();
      return products.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) ||
        (p.description && p.description.toLowerCase().includes(lowerQuery))
      );
    }
  },

  // 📂 Kategori İşlemleri
  categories: {
    // Tüm kategorileri getir
    getAll() {
      try {
        const data = localStorage.getItem(LocalDB.keys.categories);
        return data ? JSON.parse(data) : LocalDB.getDefaultCategories();
      } catch (error) {
        console.error('Kategoriler yüklenemedi:', error);
        return LocalDB.getDefaultCategories();
      }
    },

    // Tek kategori getir
    getById(id) {
      const categories = this.getAll();
      return categories.find(c => c.id === id);
    },

    // Tüm kategorileri kaydet
    saveAll(categories) {
      try {
        localStorage.setItem(LocalDB.keys.categories, JSON.stringify(categories));
        console.log(`✅ ${categories.length} kategori kaydedildi`);
        return true;
      } catch (error) {
        console.error('Kategoriler kaydedilemedi:', error);
        return false;
      }
    },

    // Tek kategori ekle/güncelle
    save(category) {
      const categories = this.getAll();
      const index = categories.findIndex(c => c.id === category.id);
      
      if (index !== -1) {
        categories[index] = category;
      } else {
        categories.push(category);
      }
      
      return this.saveAll(categories);
    },

    // Kategori sil
    delete(id) {
      const categories = this.getAll();
      const filtered = categories.filter(c => c.id !== id);
      return this.saveAll(filtered);
    }
  },

  // ⚙️ Ayarlar İşlemleri
  settings: {
    // Ayarları getir
    get() {
      try {
        const data = localStorage.getItem(LocalDB.keys.settings);
        return data ? JSON.parse(data) : LocalDB.getDefaultSettings();
      } catch (error) {
        console.error('Ayarlar yüklenemedi:', error);
        return LocalDB.getDefaultSettings();
      }
    },

    // Ayarları kaydet
    save(settings) {
      try {
        localStorage.setItem(LocalDB.keys.settings, JSON.stringify(settings));
        console.log('✅ Ayarlar kaydedildi');
        return true;
      } catch (error) {
        console.error('Ayarlar kaydedilemedi:', error);
        return false;
      }
    }
  },

  // 📸 Fotoğraf İşlemleri (Base64)
  image: {
    // Fotoğrafı Base64'e çevir
    async toBase64(file) {
      return new Promise((resolve, reject) => {
        // Dosya kontrolü
        if (!file || !file.type.startsWith('image/')) {
          reject(new Error('Geçersiz dosya formatı! Lütfen bir resim dosyası seçin.'));
          return;
        }

        // Boyut kontrolü (max 2MB)
        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
          reject(new Error('Fotoğraf boyutu 2MB\'dan küçük olmalıdır!'));
          return;
        }

        const reader = new FileReader();
        
        reader.onload = (e) => {
          resolve(e.target.result);
        };
        
        reader.onerror = (error) => {
          reject(new Error('Fotoğraf okunamadı!'));
        };
        
        reader.readAsDataURL(file);
      });
    },

    // Fotoğrafı optimize et (boyutunu küçült)
    async optimize(base64, maxWidth = 800, maxHeight = 600, quality = 0.8) {
      return new Promise((resolve) => {
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Oranı koru
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // JPEG olarak sıkıştır
          const optimized = canvas.toDataURL('image/jpeg', quality);
          resolve(optimized);
        };

        img.src = base64;
      });
    }
  },

  // 💾 Yedekleme İşlemleri
  backup: {
    // Tam yedek oluştur
    create() {
      const backup = {
        menu: LocalDB.menu.getAll(),
        categories: LocalDB.categories.getAll(),
        settings: LocalDB.settings.get(),
        timestamp: new Date().toISOString(),
        version: '1.0'
      };

      // JSON dosyası olarak indir
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-menu-yedek-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      console.log('✅ Yedek oluşturuldu');
      return backup;
    },

    // Yedeği geri yükle
    restore(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            const backup = JSON.parse(e.target.result);
            
            // Verileri geri yükle
            LocalDB.menu.saveAll(backup.menu || []);
            LocalDB.categories.saveAll(backup.categories || []);
            LocalDB.settings.save(backup.settings || {});
            
            console.log('✅ Yedek geri yüklendi');
            resolve(backup);
          } catch (error) {
            console.error('Yedek geri yüklenemedi:', error);
            reject(error);
          }
        };
        
        reader.onerror = () => reject(new Error('Dosya okunamadı'));
        reader.readAsText(file);
      });
    },

    // Otomatik yedek (LocalStorage'a)
    autoSave() {
      const backup = {
        menu: LocalDB.menu.getAll(),
        categories: LocalDB.categories.getAll(),
        settings: LocalDB.settings.get(),
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(LocalDB.keys.backup, JSON.stringify(backup));
      console.log('✅ Otomatik yedek alındı');
    },

    // Otomatik yedeği geri yükle
    autoRestore() {
      try {
        const data = localStorage.getItem(LocalDB.keys.backup);
        if (data) {
          const backup = JSON.parse(data);
          console.log('📦 Otomatik yedek bulundu:', backup.timestamp);
          return backup;
        }
      } catch (error) {
        console.error('Otomatik yedek yüklenemedi:', error);
      }
      return null;
    }
  },

  // 📊 İstatistikler
  stats: {
    // Depolama kullanımı
    getStorageUsage() {
      let total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
      
      const totalMB = (total / 1024 / 1024).toFixed(2);
      const maxMB = 10; // Tarayıcı limiti ~10MB
      const percentage = ((total / (maxMB * 1024 * 1024)) * 100).toFixed(1);
      
      return {
        used: totalMB,
        max: maxMB,
        percentage: percentage,
        available: (maxMB - totalMB).toFixed(2)
      };
    },

    // Ürün istatistikleri
    getProductStats() {
      const products = LocalDB.menu.getAll();
      const categories = LocalDB.categories.getAll();
      
      const stats = {
        totalProducts: products.length,
        withImages: products.filter(p => p.image).length,
        withoutImages: products.filter(p => !p.image).length,
        byCategory: {}
      };
      
      categories.forEach(cat => {
        stats.byCategory[cat.name] = products.filter(p => p.category === cat.id).length;
      });
      
      return stats;
    }
  },

  // 🔧 Yardımcı Fonksiyonlar
  getDefaultCategories() {
    return [
      { id: 'nargile', name: 'Nargile', icon: '🪔' },
      { id: 'sicak', name: 'Sıcak İçecekler', icon: '☕' },
      { id: 'soguk', name: 'Soğuk İçecekler', icon: '🧃' },
      { id: 'yemek', name: 'Yemekler', icon: '🍽️' },
      { id: 'tatli', name: 'Tatlılar', icon: '🍰' },
      { id: 'sandvic', name: 'Sandviçler', icon: '🥪' }
    ];
  },

  getDefaultSettings() {
    return {
      cafeName: 'Leanor Cafe',
      tagline: 'Lezzetin ve Keyifin Adresi'
    };
  },

  // Tüm verileri sil
  clearAll() {
    if (confirm('⚠️ TÜM VERİLER SİLİNECEK! Emin misiniz?')) {
      localStorage.removeItem(this.keys.menu);
      localStorage.removeItem(this.keys.categories);
      localStorage.removeItem(this.keys.settings);
      console.log('🗑️ Tüm veriler silindi');
      return true;
    }
    return false;
  },

  // Veritabanını başlat
  initialize() {
    console.log('🗄️ Yerel Veritabanı başlatılıyor...');
    
    // Eğer veri yoksa varsayılanları yükle
    if (this.menu.getAll().length === 0) {
      console.log('📦 Varsayılan veriler yükleniyor...');
      this.loadDefaultData();
    }
    
    // Otomatik yedekleme (her 5 dakikada bir)
    setInterval(() => {
      this.backup.autoSave();
    }, 5 * 60 * 1000);
    
    console.log('✅ Veritabanı hazır!');
  },

  // Varsayılan verileri yükle
  loadDefaultData() {
    // Kategorileri yükle
    this.categories.saveAll(this.getDefaultCategories());
    
    // Ayarları yükle
    this.settings.save(this.getDefaultSettings());
    
    // Örnek ürünler (fotoğrafsız)
    const sampleProducts = [
      { id: 1, name: "Türk Kahvesi", category: "sicak", image: "", description: "Geleneksel yöntemle hazırlanan Türk kahvesi", price: "45₺", details: { ingredients: "Özel çekilmiş Türk kahvesi", serving: "Fincan", calories: "~5 kcal" } },
      { id: 2, name: "Cappuccino", category: "sicak", image: "", description: "Sütlü köpüklü İtalyan kahvesi", price: "55₺", details: { ingredients: "Espresso, süt köpüğü, tarçın", serving: "Orta boy fincan", calories: "~120 kcal" } },
      { id: 3, name: "Limonata", category: "soguk", image: "", description: "Taze sıkılmış limonata", price: "45₺", details: { ingredients: "Taze limon, nane, şeker", serving: "Büyük bardak", calories: "~120 kcal" } },
      { id: 4, name: "Elma Nargile", category: "nargile", image: "", description: "Taze elma aroması ile ferahlatıcı nargile keyfi", price: "150₺", details: { ingredients: "Premium elma aroması, özel nargile tütünü", serving: "Tek kişilik", time: "45-60 dakika" } },
      { id: 5, name: "Waffle", category: "tatli", image: "", description: "Meyveli veya çikolatalı waffle", price: "80₺", details: { ingredients: "Waffle hamuru, meyve/çikolata sosu", serving: "1 porsiyon", calories: "~450 kcal" } }
    ];
    
    this.menu.saveAll(sampleProducts);
    console.log('✅ Varsayılan veriler yüklendi');
  }
};

// Sayfa yüklendiğinde veritabanını başlat
if (typeof window !== 'undefined') {
  window.LocalDB = LocalDB;
  console.log('🗄️ LocalDB hazır!');
}
