// 🌐 Otomatik Senkronizasyon Yapılandırması
// Bu dosyayı düzenleyerek menünüzü tüm cihazlarda otomatik senkronize edebilirsiniz

const SyncConfig = {
    // ✅ ADIM 1: Menü verilerinizi bir URL'de barındırın
    // Seçenekler:
    // - GitHub Gist (ücretsiz): https://gist.github.com
    // - JSONBin.io (ücretsiz): https://jsonbin.io
    // - Kendi sunucunuz
    
    // ✅ ADIM 2: JSON dosyanızın URL'sini buraya yapıştırın
    cloudUrl: 'https://gist.githubusercontent.com/ysfayd3/2a6d587947d9914acefcc5abaa115580/raw/menu-data.json', // BURAYA "Raw" BUTONUNDAN ALDIĞINIZ UZUN LİNKİ YAPIŞTIRIN
    
    // Otomatik güncelleme süresi (milisaniye)
    autoRefreshInterval: 60000, // 60 saniye = 1 dakika
    
    // Önbellek süresi (milisaniye)
    cacheTimeout: 300000, // 5 dakika
    
    // Hata durumunda varsayılan menüyü göster
    fallbackToDefault: true,
    
    // Debug modu (konsol logları)
    debug: true
};

// Senkronizasyon Yöneticisi
const SyncManager = {
    // Son güncelleme zamanı
    lastUpdate: null,
    
    // Önbellek anahtarı
    cacheKey: 'qr_menu_cloud_cache',
    
    // Cloud'dan menüyü çek
    async fetchFromCloud() {
        if (!SyncConfig.cloudUrl) {
            if (SyncConfig.debug) {
                console.log('⚠️ Cloud URL tanımlanmamış, varsayılan menü kullanılıyor');
            }
            return null;
        }
        
        try {
            if (SyncConfig.debug) {
                console.log('🌐 Cloud\'dan menü çekiliyor:', SyncConfig.cloudUrl);
            }
            
            // Cache busting (Önbellek temizleme) için timestamp ekle
            const url = new URL(SyncConfig.cloudUrl);
            url.searchParams.append('t', Date.now());
            const fetchUrl = url.toString();
            
            const response = await fetch(fetchUrl, {
                cache: 'no-store', // Kesinlikle önbellek kullanma
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Önbelleğe kaydet
            this.saveToCache(data);
            this.lastUpdate = new Date();
            
            if (SyncConfig.debug) {
                console.log('✅ Cloud\'dan menü yüklendi:', data.products?.length || 0, 'ürün');
            }
            
            return data;
            
        } catch (error) {
            console.error('❌ Cloud\'dan menü yüklenemedi:', error.message);
            
            // Önbellekten dene
            const cached = this.loadFromCache();
            if (cached) {
                if (SyncConfig.debug) {
                    console.log('📦 Önbellekten menü yüklendi');
                }
                return cached;
            }
            
            return null;
        }
    },
    
    // Önbelleğe kaydet
    saveToCache(data) {
        try {
            const cache = {
                data: data,
                timestamp: Date.now()
            };
            localStorage.setItem(this.cacheKey, JSON.stringify(cache));
        } catch (error) {
            console.error('Önbelleğe kaydedilemedi:', error);
        }
    },
    
    // Önbellekten yükle
    loadFromCache() {
        try {
            const cached = localStorage.getItem(this.cacheKey);
            if (!cached) return null;
            
            const cache = JSON.parse(cached);
            
            // Önbellek süresi dolmuş mu?
            const age = Date.now() - cache.timestamp;
            if (age > SyncConfig.cacheTimeout) {
                if (SyncConfig.debug) {
                    console.log('⏰ Önbellek süresi dolmuş');
                }
                return null;
            }
            
            return cache.data;
            
        } catch (error) {
            console.error('Önbellekten yüklenemedi:', error);
            return null;
        }
    },
    
    // Otomatik güncellemeyi başlat
    startAutoRefresh(callback) {
        if (!SyncConfig.cloudUrl) return;
        
        setInterval(async () => {
            if (SyncConfig.debug) {
                console.log('🔄 Otomatik güncelleme kontrol ediliyor...');
            }
            
            const data = await this.fetchFromCloud();
            if (data && callback) {
                callback(data);
            }
        }, SyncConfig.autoRefreshInterval);
        
        if (SyncConfig.debug) {
            console.log('✅ Otomatik güncelleme aktif:', SyncConfig.autoRefreshInterval / 1000, 'saniyede bir');
        }
    },
    
    // Manuel güncelleme
    async refresh() {
        if (SyncConfig.debug) {
            console.log('🔄 Manuel güncelleme başlatıldı...');
        }
        return await this.fetchFromCloud();
    }
};

// Global olarak erişilebilir yap
if (typeof window !== 'undefined') {
    window.SyncConfig = SyncConfig;
    window.SyncManager = SyncManager;
}
