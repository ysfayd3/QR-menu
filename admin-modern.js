// 📸 PhotoStorage (IndexedDB) ve LocalDB yüklenmesi gerekiyor!
// Bu script, photo-storage.js ve local-database.js'ten sonra yüklenmelidir

// LocalStorage'dan veri yükleme
let menuData = [];
let categories = [];
let settings = {
    cafeName: 'Leanor Cafe',
    tagline: 'Lezzetin ve Keyifin Adresi'
};

let currentSection = 'products';
let isDataLoaded = false;

// Sayfa yüklendiğinde LocalDB'den verileri yükle
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // PhotoStorage'ın yüklendiğini kontrol et
        if (typeof PhotoStorage === 'undefined') {
            console.warn('⚠️ PhotoStorage yüklenmedi! İndexedDB kullanılamayacak.');
        } else {
            console.log('✅ PhotoStorage başlatıldı');
        }
        
        // Veritabanını başlat
        if (typeof LocalDB !== 'undefined') {
            LocalDB.initialize();
        } else {
            console.error('LocalDB yüklenemedi!');
            alert('Veritabanı yüklenemedi! Lütfen sayfayı yenileyin.');
            return;
        }
        
        // Verileri yükle
        await loadDataFromLocalDB();
        
        // Eğer hiç ürün yoksa varsayılanları yükle
        if (menuData.length === 0) {
            console.log('Hiç ürün yok, varsayılanlar yükleniyor...');
            loadDefaultData();
        }
        
        renderSidebar();
        showSection('products');
        updateUsernameDisplay();
        
        // Depolama kullanımını göster
        showStorageUsage();
    } catch (error) {
        console.error('Başlatma hatası:', error);
        alert('Sayfa yüklenirken hata oluştu: ' + error.message);
    }
});

// LocalDB'den verileri yükle
async function loadDataFromLocalDB() {
    try {
        console.log('LocalDB\'den veriler yükleniyor...');
        
        // Menü verilerini al
        menuData = LocalDB.menu.getAll();
        console.log(`${menuData.length} ürün yüklendi`);
        
        // Kategorileri al
        categories = LocalDB.categories.getAll();
        console.log(`${categories.length} kategori yüklendi`);
        
        // Ayarları al
        settings = LocalDB.settings.get();
        console.log('Ayarlar yüklendi');
        
        isDataLoaded = true;
        console.log('✅ Tüm veriler LocalDB\'den yüklendi!');
    } catch (error) {
        console.error('LocalDB\'den veri yüklenirken hata:', error);
        showNotification('Veriler yüklenirken hata oluştu!', 'error');
    }
}

// Varsayılan verileri yükle
function loadDefaultData() {
    const defaultProducts = [
        { id: 1, name: "Türk Kahvesi", category: "sicak", image: "", description: "Geleneksel yöntemle hazırlanan Türk kahvesi", price: "45₺", details: { ingredients: "Özel çekilmiş Türk kahvesi", serving: "Fincan", calories: "~5 kcal" } },
        { id: 2, name: "Cappuccino", category: "sicak", image: "", description: "Sütlü köpüklü İtalyan kahvesi", price: "55₺", details: { ingredients: "Espresso, süt köpüğü, tarçın", serving: "Orta boy fincan", calories: "~120 kcal" } },
        { id: 3, name: "Limonata", category: "soguk", image: "", description: "Taze sıkılmış limonata", price: "45₺", details: { ingredients: "Taze limon, nane, şeker", serving: "Büyük bardak", calories: "~120 kcal" } },
        { id: 4, name: "Elma Nargile", category: "nargile", image: "", description: "Taze elma aroması ile ferahlatıcı nargile keyfi", price: "150₺", details: { ingredients: "Premium elma aroması, özel nargile tütünü", serving: "Tek kişilik", time: "45-60 dakika" } },
        { id: 5, name: "Waffle", category: "tatli", image: "", description: "Meyveli veya çikolatalı waffle", price: "80₺", details: { ingredients: "Waffle hamuru, meyve/çikolata sosu", serving: "1 porsiyon", calories: "~450 kcal" } }
    ];
    
    menuData = defaultProducts;
    LocalDB.menu.saveAll(menuData);
    console.log('✅ Varsayılan 5 ürün yüklendi');
}

// LocalDB'ye kaydet
async function saveToLocalDB() {
    try {
        LocalDB.menu.saveAll(menuData);
        LocalDB.categories.saveAll(categories);
        LocalDB.settings.save(settings);
        console.log('✅ Veriler LocalDB\'ye kaydedildi!');
        return true;
    } catch (error) {
        console.error('LocalDB\'ye kaydetme hatası:', error);
        showNotification('Veriler kaydedilirken hata oluştu!', 'error');
        return false;
    }
}

// Sidebar render
function renderSidebar() {
    const nav = document.getElementById('sidebar-nav');
    const sections = [
        { id: 'products', icon: '📦', label: 'Ürünler' },
        { id: 'categories', icon: '📂', label: 'Kategoriler' },
        { id: 'settings', icon: '⚙️', label: 'Ayarlar' },
        { id: 'security', icon: '🔒', label: 'Güvenlik' }
    ];
    
    nav.innerHTML = sections.map(section => `
        <button 
            onclick="showSection('${section.id}')"
            class="nav-item w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${currentSection === section.id ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5'}"
            data-section="${section.id}"
        >
            <span class="text-xl">${section.icon}</span>
            <span class="font-medium">${section.label}</span>
        </button>
    `).join('');
}

// Bölüm göster
function showSection(section) {
    currentSection = section;
    renderSidebar();
    
    const titles = {
        products: 'Ürün Yönetimi',
        categories: 'Kategori Yönetimi',
        settings: 'Genel Ayarlar',
        security: 'Güvenlik Ayarları'
    };
    
    document.getElementById('page-title').textContent = titles[section];
    
    if (section === 'products') renderProductsSection();
    if (section === 'categories') renderCategoriesSection();
    if (section === 'settings') renderSettingsSection();
    if (section === 'security') renderSecuritySection();
}

// Kullanıcı adını göster
function updateUsernameDisplay() {
    const loginData = JSON.parse(localStorage.getItem('adminLogin')) || 
                     JSON.parse(sessionStorage.getItem('adminLogin'));
    if (loginData && loginData.username) {
        document.getElementById('username-display').textContent = loginData.username;
    }
}

// Bildirim göster
function showNotification(message, type = 'success') {
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500'
    };
    
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slide-out 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// CSS animasyonları ekle
const style = document.createElement('style');
style.textContent = `
    @keyframes slide-in {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slide-out {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
    .animate-slide-in { animation: slide-in 0.3s ease; }
`;
document.head.appendChild(style);


// Ürünler bölümünü render et
function renderProductsSection() {
    const content = document.getElementById('content-area');
    content.innerHTML = `
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 class="text-lg font-semibold text-gray-700">Tüm Ürünler</h3>
                    <p class="text-sm text-gray-500">${menuData.length} ürün bulundu</p>
                </div>
                <button onclick="openProductModal()" class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition font-medium">
                    + Yeni Ürün Ekle
                </button>
            </div>
            
            <!-- Filters -->
            <div class="flex flex-col sm:flex-row gap-4">
                <select id="category-filter" onchange="filterProducts()" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="all">Tüm Kategoriler</option>
                    ${categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
                </select>
                <input type="text" id="search-input" placeholder="Ürün ara..." oninput="filterProducts()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
            
            <!-- Products Grid -->
            <div id="products-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Products will be inserted here -->
            </div>
        </div>
    `;
    
    renderProducts();
}

// Ürünleri render et
function renderProducts() {
    const grid = document.getElementById('products-grid');
    
    if (!grid) {
        console.error('products-grid elementi bulunamadı!');
        return;
    }
    
    const categoryFilter = document.getElementById('category-filter')?.value || 'all';
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    
    console.log('renderProducts çağrıldı');
    console.log('Toplam ürün sayısı:', menuData.length);
    console.log('Kategori filtresi:', categoryFilter);
    console.log('Arama terimi:', searchTerm);
    
    let filtered = menuData;
    
    if (categoryFilter !== 'all') {
        filtered = filtered.filter(p => p.category === categoryFilter);
        console.log('Kategori filtresinden sonra:', filtered.length);
    }
    
    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            (p.description && p.description.toLowerCase().includes(searchTerm))
        );
        console.log('Arama filtresinden sonra:', filtered.length);
    }
    
    console.log('Gösterilecek ürün sayısı:', filtered.length);
    
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-20">
                <svg class="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                </svg>
                <p class="text-gray-500">Ürün bulunamadı</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = filtered.map(product => {
        console.log('Ürün render ediliyor:', product.name, 'ID:', product.id);
        
        // Resim URL'sini hazırla (IndexedDB desteği)
        let bgStyle = '';
        let dataAttr = '';
        
        if (product.image) {
            if (product.image.startsWith('data:') || product.image.startsWith('http')) {
                bgStyle = `background-image: url('${product.image}')`;
            } else {
                dataAttr = `data-photo-id="${product.image}"`;
            }
        }
        
        return `
        <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden">
            <div class="h-48 bg-gradient-to-br from-blue-100 to-purple-100 bg-cover bg-center product-image-async" style="${bgStyle}" ${dataAttr}></div>
            <div class="p-4">
                <h4 class="font-bold text-lg text-gray-800 mb-1">${product.name}</h4>
                <p class="text-sm text-gray-500 mb-2">${getCategoryName(product.category)}</p>
                <p class="text-sm text-gray-600 mb-3 line-clamp-2">${product.description || ''}</p>
                <div class="flex items-center justify-between">
                    <span class="text-xl font-bold text-blue-600">${product.price}</span>
                    <div class="flex gap-2">
                        <button onclick="editProduct(${product.id})" class="px-3 py-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition text-sm font-medium">
                            Düzenle
                        </button>
                        <button onclick="deleteProduct(${product.id})" class="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition text-sm font-medium">
                            Sil
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    }).join('');
    
    // Asenkron fotoğrafları yükle
    loadImagesAsync();
    
    console.log('✅ Ürünler render edildi');
}

function filterProducts() {
    renderProducts();
}

// Asenkron fotoğraf yükleyici
async function loadImagesAsync() {
    if (typeof PhotoStorage === 'undefined') return;
    
    const elements = document.querySelectorAll('.product-image-async[data-photo-id]');
    
    for (const el of elements) {
        const photoId = el.dataset.photoId;
        try {
            const blobUrl = await PhotoStorage.getBlobUrl(photoId);
            if (blobUrl) {
                el.style.backgroundImage = `url('${blobUrl}')`;
            }
        } catch (err) {
            console.warn('Fotoğraf yüklenemedi:', photoId);
        }
    }
}

function getCategoryName(categoryId) {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : categoryId;
}

function editProduct(id) {
    openProductModal(id);
}

function deleteProduct(id) {
    const product = menuData.find(p => p.id === id);
    if (!product) return;
    
    const modalHTML = `
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all" onclick="event.stopPropagation()">
                <!-- Icon -->
                <div class="pt-8 pb-4 flex justify-center">
                    <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </div>
                </div>
                
                <!-- Content -->
                <div class="px-8 pb-6 text-center">
                    <h3 class="text-xl font-bold text-gray-900 mb-2">Ürünü Sil</h3>
                    <p class="text-gray-600 mb-1">
                        <span class="font-semibold text-gray-900">${product.name}</span> ürününü silmek istediğinizden emin misiniz?
                    </p>
                    <p class="text-sm text-red-600 font-medium">
                        Bu işlem geri alınamaz!
                    </p>
                </div>
                
                <!-- Actions -->
                <div class="flex gap-3 px-8 pb-8">
                    <button 
                        onclick="closeModal()" 
                        class="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                    >
                        İptal
                    </button>
                    <button 
                        onclick="confirmDeleteProduct(${id})" 
                        class="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium shadow-lg"
                    >
                        Evet, Sil
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modals-container').innerHTML = modalHTML;
}

function confirmDeleteProduct(id) {
    try {
        // Silinci ürünü bul
        const product = menuData.find(p => p.id === id);
        
        // Fotoğrafı IndexedDB'den sil
        if (product && product.image) {
            if (product.image.startsWith('data:')) {
                // Base64 ise direkt sil (sadece veritabanından kaldır)
                console.log('📸 Base64 fotoğraf kaldırılıyor');
            } else if (typeof PhotoStorage !== 'undefined' && PhotoStorage.db) {
                // IndexedDB'den sil
                PhotoStorage.deleteProductPhotos(id)
                    .then(() => console.log('✅ Ürüne ait fotoğraflar silindi'))
                    .catch(err => console.error('⚠️ Fotoğraf silinirken hata:', err));
            }
        }
        
        // Ürünü veritabanından sil
        menuData = menuData.filter(p => p.id !== id);
        LocalDB.menu.delete(id);
        closeModal();
        renderProducts();
        showNotification('Ürün başarıyla silindi! 🗑️', 'success');
        
        // Otomatik senkronizasyon tetikle
        if (window.triggerAutoSync) window.triggerAutoSync();
    } catch (error) {
        console.error('❌ Ürün silme hatası:', error);
        showErrorModal('Ürün silinirken hata oluştu: ' + error.message);
    }
}


// Ürün modal aç
function openProductModal(productId = null) {
    const product = productId ? menuData.find(p => p.id === productId) : null;
    const isEdit = !!product;
    
    const modalHTML = `
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onclick="closeModal(event)">
            <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
                <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h3 class="text-xl font-bold text-gray-800">${isEdit ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}</h3>
                    <button onclick="closeModal()" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                <form onsubmit="saveProduct(event)" class="p-6 space-y-4">
                    <input type="hidden" id="product-id" value="${product?.id || ''}">
                    <input type="hidden" id="product-image" value="${product?.image || ''}">
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Ürün Adı *</label>
                        <input type="text" id="product-name" required value="${product?.name || ''}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Kategori *</label>
                        <select id="product-category" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            ${categories.map(cat => `<option value="${cat.id}" ${product?.category === cat.id ? 'selected' : ''}>${cat.name}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Fiyat *</label>
                        <input type="text" id="product-price" required value="${product?.price || ''}" placeholder="örn: 45₺" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                            📸 Ürün Fotoğrafı
                            <span class="text-xs text-gray-500 font-normal ml-2">(Maksimum 2MB, JPG/PNG)</span>
                        </label>
                        <div class="space-y-3">
                            <input 
                                type="file" 
                                id="product-image-file" 
                                accept="image/*" 
                                onchange="handleImageUpload(event)" 
                                class="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            >
                            ${product?.image ? `
                                <div class="relative">
                                    <img src="${product.image}" id="image-preview" class="w-full h-48 object-cover rounded-lg border-2 border-gray-200">
                                    <div class="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                        </svg>
                                        Mevcut Fotoğraf
                                    </div>
                                </div>
                            ` : `
                                <img id="image-preview" class="hidden w-full h-48 object-cover rounded-lg border-2 border-gray-200">
                            `}
                            <p class="text-xs text-gray-500">
                                💡 <strong>Yerel Depolama:</strong> Fotoğraflar tarayıcınızda güvenle saklanır. Otomatik optimize edilir (800x600px).
                            </p>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Açıklama</label>
                        <textarea id="product-description" rows="2" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">${product?.description || ''}</textarea>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">İçindekiler</label>
                        <textarea id="product-ingredients" rows="2" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">${product?.details?.ingredients || ''}</textarea>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Sunum</label>
                            <input type="text" id="product-serving" value="${product?.details?.serving || ''}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Kalori</label>
                            <input type="text" id="product-calories" value="${product?.details?.calories || ''}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Not</label>
                        <input type="text" id="product-note" value="${product?.details?.note || ''}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    
                    <div class="flex gap-3 pt-4">
                        <button type="button" onclick="closeModal()" class="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">
                            İptal
                        </button>
                        <button type="submit" class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition font-medium">
                            💾 Kaydet
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.getElementById('modals-container').innerHTML = modalHTML;
}

async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showErrorModal('Lütfen sadece resim dosyası yükleyin!');
        event.target.value = '';
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        showErrorModal('Fotoğraf boyutu 10MB\'dan küçük olmalıdır!');
        event.target.value = '';
        return;
    }
    
    console.log('Fotoğraf seçildi:', file.name, (file.size / 1024).toFixed(2) + ' KB');
    
    try {
        // Ürün ID'sini al (varsa)
        const productIdInput = document.getElementById('product-id');
        const productId = productIdInput?.value || 'temp_' + Date.now();
        
        // Base64'e çevir
        const base64 = await LocalDB.image.toBase64(file);
        console.log('Base64 dönüşümü tamamlandı');
        
        // Optimize et
        const optimized = await LocalDB.image.optimize(base64, 800, 600, 0.8);
        console.log('Optimizasyon tamamlandı');
        
        // Fotoğrafı IndexedDB'ye kaydet
        let photoId;
        if (typeof PhotoStorage !== 'undefined' && PhotoStorage.db) {
            console.log('📦 IndexedDB kullanılıyor...');
            photoId = await PhotoStorage.savePhoto(file, productId);
            console.log('✅ Fotoğraf IndexedDB\'ye kaydedildi:', photoId);
        } else {
            // Fallback: Base64'i direkt kullan
            photoId = optimized;
            console.warn('⚠️ IndexedDB hazır değil, Base64 kullanılıyor');
        }
        
        // Önizleme güncelle (img elementi)
        const preview = document.getElementById('image-preview');
        if (preview) {
            // Eğer img elementi ise
            if (preview.tagName === 'IMG') {
                if (photoId.startsWith('data:')) {
                    preview.src = photoId;
                } else if (typeof PhotoStorage !== 'undefined') {
                    const blobUrl = await PhotoStorage.getBlobUrl(photoId);
                    if (blobUrl) {
                        preview.src = blobUrl;
                    }
                }
            } else {
                // Eğer div ise (background-image)
                if (photoId.startsWith('data:')) {
                    preview.style.backgroundImage = `url('${photoId}')`;
                } else if (typeof PhotoStorage !== 'undefined') {
                    const blobUrl = await PhotoStorage.getBlobUrl(photoId);
                    if (blobUrl) {
                        preview.style.backgroundImage = `url('${blobUrl}')`;
                    }
                }
            }
            
            preview.classList.remove('hidden');
            console.log('✅ Önizleme güncellendi');
        } else {
            console.warn('⚠️ image-preview elementi bulunamadı');
        }
        
        // PhotoID'i hidden input'a kaydet
        const imageInput = document.getElementById('product-image');
        if (imageInput) {
            imageInput.value = photoId;
            imageInput.dataset.photoId = photoId;
            console.log('📸 Fotoğraf ID kaydedildi:', photoId);
        }
        
        showNotification('✅ Fotoğraf başarıyla kaydedildi! Şimdi "Kaydet" butonuna tıklayın.', 'success');
        
    } catch (error) {
        console.error('❌ Fotoğraf yükleme hatası:', error);
        showErrorModal('Fotoğraf yüklenirken hata oluştu: ' + error.message);
        event.target.value = '';
    }
}

function saveProduct(event) {
    event.preventDefault();
    
    try {
        const id = document.getElementById('product-id');
        const imageValue = document.getElementById('product-image');
        const productName = document.getElementById('product-name');
        const productCategory = document.getElementById('product-category');
        const productPrice = document.getElementById('product-price');
        const productDescription = document.getElementById('product-description');
        const productIngredients = document.getElementById('product-ingredients');
        const productServing = document.getElementById('product-serving');
        const productCalories = document.getElementById('product-calories');
        const productNote = document.getElementById('product-note');
        
        // Element kontrolü
        if (!productName || !productCategory || !productPrice) {
            throw new Error('Form elemanları bulunamadı!');
        }
        
        // Ürün verisini oluştur
        const productData = {
            id: id && id.value ? parseInt(id.value) : Date.now(),
            name: productName.value,
            category: productCategory.value,
            price: productPrice.value,
            image: imageValue ? imageValue.value : '',
            description: productDescription ? productDescription.value : '',
            details: {
                ingredients: productIngredients ? productIngredients.value : '',
                serving: productServing ? productServing.value : '',
                calories: productCalories ? productCalories.value : '',
                note: productNote ? productNote.value : ''
            }
        };
        
        console.log('💾 Ürün kaydediliyor:', productData.name, 'ID:', productData.id);
        
        if (id && id.value) {
            // Düzenleme
            const index = menuData.findIndex(p => p.id === parseInt(id.value));
            if (index !== -1) {
                menuData[index] = productData;
                console.log('✏️ Ürün güncellendi, index:', index);
            }
        } else {
            // Yeni ekleme
            menuData.push(productData);
            console.log('➕ Yeni ürün eklendi, toplam:', menuData.length);
        }
        
        // LocalDB'ye kaydet
        console.log('💾 LocalDB\'ye kaydediliyor...');
        const saved = LocalDB.menu.saveAll(menuData);
        
        if (!saved) {
            throw new Error('LocalDB\'ye kaydetme başarısız!');
        }
        
        console.log('✅ LocalDB\'ye kaydedildi');
        
        // Modal'ı kapat
        closeModal();
        
        // Ürünleri yeniden yükle ve render et
        console.log('🔄 Veriler yeniden yükleniyor...');
        menuData = LocalDB.menu.getAll();
        console.log('📊 Yüklenen ürün sayısı:', menuData.length);
        
        // Render et
        renderProducts();
        
        // Bildirim göster
        if (id && id.value) {
            showNotification('✅ Ürün güncellendi!', 'success');
        } else {
            showNotification('✅ Ürün eklendi!', 'success');
        }
        
        // Otomatik senkronizasyon tetikle
        if (window.triggerAutoSync) window.triggerAutoSync();
        
    } catch (error) {
        console.error('❌ Ürün kaydetme hatası:', error);
        showErrorModal(error.message || 'Ürün kaydedilirken bir hata oluştu!');
    }
}

// Yükleme modal'ı (Base64 için)
function showImageProcessingModal() {
    const modalHTML = `
        <div id="processing-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl max-w-md w-full p-8 text-center">
                <div class="mb-6">
                    <div class="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                        <svg class="w-8 h-8 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                    </div>
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">İşleniyor...</h3>
                <p id="processing-status" class="text-gray-600">Fotoğraf yükleniyor</p>
                <div class="mt-4 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div class="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full animate-pulse" style="width: 100%"></div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modals-container').innerHTML = modalHTML;
}

// İşlem durumunu güncelle
function updateProcessingStatus(message) {
    const statusElement = document.getElementById('processing-status');
    if (statusElement) {
        statusElement.textContent = message;
    }
}

// Yükleme modal'ı (eski - uyumluluk için)
function showUploadingModal() {
    showImageProcessingModal();
}

// İlerleme güncelleme fonksiyonu (uyumluluk için)
window.updateUploadProgress = function(progress) {
    // Base64 için gerekli değil
};

function closeModal(event) {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById('modals-container').innerHTML = '';
}


// Kategoriler bölümü
function renderCategoriesSection() {
    const content = document.getElementById('content-area');
    content.innerHTML = `
        <div class="space-y-6">
            <div class="flex justify-between items-center">
                <div>
                    <h3 class="text-lg font-semibold text-gray-700">Kategoriler</h3>
                    <p class="text-sm text-gray-500">${categories.length} kategori</p>
                </div>
                <button onclick="openCategoryModal()" class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition font-medium">
                    + Yeni Kategori
                </button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${categories.map(cat => {
                    const count = menuData.filter(p => p.category === cat.id).length;
                    return `
                        <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden">
                            <div class="p-6">
                                <div class="flex items-center justify-between mb-4">
                                    <span class="text-4xl">${cat.icon || '📦'}</span>
                                    <div class="flex gap-2">
                                        <button onclick="editCategory('${cat.id}')" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-100 text-blue-600 transition" title="Düzenle">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                            </svg>
                                        </button>
                                        <button onclick="deleteCategory('${cat.id}')" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-100 text-red-600 transition" title="Sil">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <h4 class="font-bold text-lg text-gray-800 mb-2">${cat.name}</h4>
                                <p class="text-sm text-gray-500 mb-4">${count} ürün</p>
                                <button 
                                    onclick="viewCategoryProducts('${cat.id}')" 
                                    class="w-full px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 rounded-lg hover:from-blue-100 hover:to-purple-100 transition font-medium text-sm"
                                >
                                    Ürünleri Görüntüle →
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function openCategoryModal(categoryId = null) {
    const category = categoryId ? categories.find(c => c.id === categoryId) : null;
    const isEdit = !!category;
    
    const modalHTML = `
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onclick="closeModal(event)">
            <div class="bg-white rounded-2xl max-w-md w-full" onclick="event.stopPropagation()">
                <div class="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h3 class="text-xl font-bold text-gray-800">${isEdit ? 'Kategori Düzenle' : 'Yeni Kategori'}</h3>
                    <button onclick="closeModal()" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                <form onsubmit="saveCategory(event, ${isEdit})" class="p-6 space-y-4">
                    <input type="hidden" id="category-original-id" value="${category?.id || ''}">
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Kategori ID *</label>
                        <input 
                            type="text" 
                            id="category-id" 
                            required 
                            placeholder="örn: tatli" 
                            value="${category?.id || ''}"
                            ${isEdit ? 'readonly' : ''}
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isEdit ? 'bg-gray-100' : ''}"
                        >
                        ${isEdit ? '<p class="text-xs text-gray-500 mt-1">ID değiştirilemez</p>' : '<p class="text-xs text-gray-500 mt-1">Küçük harf, Türkçe karakter yok</p>'}
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Kategori Adı *</label>
                        <input type="text" id="category-name" required placeholder="örn: Tatlılar" value="${category?.name || ''}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">İkon</label>
                        <input type="text" id="category-icon" placeholder="örn: 🍰" value="${category?.icon || ''}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <p class="text-xs text-gray-500 mt-1">Emoji seçmek için Windows: Win + . veya Mac: Cmd + Ctrl + Space</p>
                    </div>
                    
                    <div class="flex gap-3 pt-4">
                        <button type="button" onclick="closeModal()" class="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">
                            İptal
                        </button>
                        <button type="submit" class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition font-medium">
                            ${isEdit ? 'Güncelle' : 'Kaydet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.getElementById('modals-container').innerHTML = modalHTML;
}

function editCategory(id) {
    openCategoryModal(id);
}

function viewCategoryProducts(categoryId) {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    
    // Ürünler bölümüne geç
    showSection('products');
    
    // Kategori filtresini ayarla
    setTimeout(() => {
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.value = categoryId;
            filterProducts();
        }
    }, 100);
}

function saveCategory(event, isEdit = false) {
    event.preventDefault();
    
    const originalId = document.getElementById('category-original-id').value;
    const categoryData = {
        id: document.getElementById('category-id').value.toLowerCase().replace(/[^a-z0-9]/g, ''),
        name: document.getElementById('category-name').value,
        icon: document.getElementById('category-icon').value
    };
    
    if (isEdit) {
        // Düzenleme modu
        const index = categories.findIndex(c => c.id === originalId);
        if (index !== -1) {
            categories[index] = categoryData;
            LocalDB.categories.saveAll(categories);
            closeModal();
            renderCategoriesSection();
            showNotification('Kategori başarıyla güncellendi! ✨', 'success');
        }
        
        // Otomatik senkronizasyon tetikle
        if (window.triggerAutoSync) window.triggerAutoSync();
    } else {
        // Yeni ekleme modu
        if (categories.find(c => c.id === categoryData.id)) {
            showErrorModal('Bu ID zaten kullanılıyor! Lütfen farklı bir ID girin.');
            return;
        }
        
        categories.push(categoryData);
        LocalDB.categories.saveAll(categories);
        closeModal();
        renderCategoriesSection();
        showNotification('Kategori başarıyla eklendi! 🎉', 'success');
        
        // Otomatik senkronizasyon tetikle
        if (window.triggerAutoSync) window.triggerAutoSync();
    }
}

function deleteCategory(id) {
    const category = categories.find(c => c.id === id);
    if (!category) return;
    
    const hasProducts = menuData.some(p => p.category === id);
    
    if (hasProducts) {
        const productCount = menuData.filter(p => p.category === id).length;
        const modalHTML = `
            <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all" onclick="event.stopPropagation()">
                    <!-- Icon -->
                    <div class="pt-8 pb-4 flex justify-center">
                        <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                            <svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                        </div>
                    </div>
                    
                    <!-- Content -->
                    <div class="px-8 pb-6 text-center">
                        <h3 class="text-xl font-bold text-gray-900 mb-2">Kategori Silinemez</h3>
                        <p class="text-gray-600 mb-2">
                            <span class="font-semibold text-gray-900">${category.name}</span> kategorisinde <span class="font-bold text-amber-600">${productCount} ürün</span> bulunuyor.
                        </p>
                        <p class="text-sm text-amber-700 font-medium">
                            Önce bu kategorideki ürünleri silin veya başka kategoriye taşıyın.
                        </p>
                    </div>
                    
                    <!-- Actions -->
                    <div class="px-8 pb-8">
                        <button 
                            onclick="closeModal()" 
                            class="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition font-medium"
                        >
                            Anladım
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modals-container').innerHTML = modalHTML;
        return;
    }
    
    const modalHTML = `
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all" onclick="event.stopPropagation()">
                <!-- Icon -->
                <div class="pt-8 pb-4 flex justify-center">
                    <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </div>
                </div>
                
                <!-- Content -->
                <div class="px-8 pb-6 text-center">
                    <h3 class="text-xl font-bold text-gray-900 mb-2">Kategoriyi Sil</h3>
                    <p class="text-gray-600 mb-1">
                        <span class="font-semibold text-gray-900">${category.name}</span> kategorisini silmek istediğinizden emin misiniz?
                    </p>
                    <p class="text-sm text-red-600 font-medium">
                        Bu işlem geri alınamaz!
                    </p>
                </div>
                
                <!-- Actions -->
                <div class="flex gap-3 px-8 pb-8">
                    <button 
                        onclick="closeModal()" 
                        class="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                    >
                        İptal
                    </button>
                    <button 
                        onclick="confirmDeleteCategory('${id}')" 
                        class="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium shadow-lg"
                    >
                        Evet, Sil
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modals-container').innerHTML = modalHTML;
}

function confirmDeleteCategory(id) {
    categories = categories.filter(c => c.id !== id);
    LocalDB.categories.saveAll(categories);
    closeModal();
    renderCategoriesSection();
    showNotification('Kategori başarıyla silindi! 🗑️', 'success');
    
    // Otomatik senkronizasyon tetikle
    if (window.triggerAutoSync) window.triggerAutoSync();
}

// Ayarlar bölümü
function renderSettingsSection() {
    const content = document.getElementById('content-area');
    const storageStats = LocalDB.stats.getStorageUsage();
    const productStats = LocalDB.stats.getProductStats();
    
    content.innerHTML = `
        <div class="max-w-2xl space-y-6">
            <!-- Depolama Kullanımı -->
            <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-sm p-6 border border-blue-100">
                <h3 class="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path>
                    </svg>
                    Depolama Kullanımı
                </h3>
                <div class="space-y-3">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Kullanılan:</span>
                        <span class="font-bold text-blue-600">${storageStats.used} MB / ${storageStats.max} MB</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div class="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all" style="width: ${storageStats.percentage}%"></div>
                    </div>
                    <div class="flex justify-between text-xs text-gray-500">
                        <span>%${storageStats.percentage} dolu</span>
                        <span>${storageStats.available} MB boş</span>
                    </div>
                    <div class="pt-2 border-t border-blue-200">
                        <p class="text-xs text-gray-600">
                            📊 <strong>${productStats.totalProducts}</strong> ürün, 
                            <strong>${productStats.withImages}</strong> fotoğraflı, 
                            <strong>${productStats.withoutImages}</strong> fotoğrafsız
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- Genel Ayarlar -->
            <div class="bg-white rounded-xl shadow-sm p-6 space-y-6">
                <h3 class="text-lg font-semibold text-gray-700 mb-4">Genel Ayarlar</h3>
                
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Cafe Adı</label>
                    <input type="text" id="cafe-name" value="${settings.cafeName}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Cafe Sloganı</label>
                    <input type="text" id="cafe-tagline" value="${settings.tagline}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                
                <button onclick="saveSettings()" class="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition font-medium">
                    💾 Ayarları Kaydet
                </button>
            </div>
            
            <!-- Yedekleme -->
            <div class="bg-white rounded-xl shadow-sm p-6 space-y-4">
                <h3 class="text-lg font-semibold text-gray-700 mb-4">Yedekleme İşlemleri</h3>
                
                <button onclick="createBackup()" class="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition font-medium">
                    📥 Yedek Oluştur (JSON İndir)
                </button>
                
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Yedeği Geri Yükle</label>
                    <input 
                        type="file" 
                        id="restore-file" 
                        accept=".json" 
                        onchange="restoreBackup(event)"
                        class="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition"
                    >
                </div>
                
                <p class="text-xs text-gray-500 text-center">
                    💡 Düzenli olarak yedek alın! Tarayıcı cache'i temizlenirse veriler kaybolabilir.
                </p>
            </div>
        </div>
    `;
}

function saveSettings() {
    try {
        const cafeName = document.getElementById('cafe-name');
        const cafeTagline = document.getElementById('cafe-tagline');
        
        if (!cafeName || !cafeTagline) {
            throw new Error('Form elemanları bulunamadı!');
        }
        
        settings.cafeName = cafeName.value;
        settings.tagline = cafeTagline.value;
        LocalDB.settings.save(settings);
        showNotification('Ayarlar kaydedildi! ✨', 'success');
        
        // Otomatik senkronizasyon tetikle
        if (window.triggerAutoSync) window.triggerAutoSync();
    } catch (error) {
        console.error('Ayarlar kaydedilemedi:', error);
        showErrorModal('Ayarlar kaydedilirken hata oluştu!');
    }
}

function createBackup() {
    LocalDB.backup.create();
    showNotification('Yedek dosyası indirildi! 📥', 'success');
}

function restoreBackup(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (confirm('⚠️ Mevcut veriler silinip yedek geri yüklenecek. Emin misiniz?')) {
        LocalDB.backup.restore(file)
            .then(() => {
                showNotification('Yedek geri yüklendi! Sayfa yenileniyor...', 'success');
                setTimeout(() => location.reload(), 1500);
            })
            .catch(error => {
                showErrorModal('Yedek geri yüklenemedi: ' + error.message);
            });
    }
    event.target.value = '';
}

// Depolama kullanımını göster
function showStorageUsage() {
    try {
        const stats = LocalDB.stats.getStorageUsage();
        if (parseFloat(stats.percentage) > 80) {
            showNotification(`⚠️ Depolama %${stats.percentage} dolu! Bazı fotoğrafları silin.`, 'error');
        }
    } catch (error) {
        console.error('Depolama istatistikleri alınamadı:', error);
    }
}

// Güvenlik bölümü
function renderSecuritySection() {
    const credentials = JSON.parse(localStorage.getItem('adminCredentials')) || { username: 'admin', password: 'admin123' };
    const content = document.getElementById('content-area');
    content.innerHTML = `
        <div class="max-w-2xl">
            <!-- Mevcut Bilgiler -->
            <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-sm p-6 mb-6 border border-blue-100">
                <div class="flex items-start">
                    <svg class="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                    </svg>
                    <div class="flex-1">
                        <p class="text-sm font-semibold text-blue-900 mb-2">Mevcut Giriş Bilgileri</p>
                        <div class="space-y-1">
                            <p class="text-sm text-blue-700">
                                <span class="font-medium">Kullanıcı Adı:</span> <span class="font-mono bg-white px-2 py-1 rounded">${credentials.username}</span>
                            </p>
                            <p class="text-sm text-blue-700">
                                <span class="font-medium">Şifre:</span> <span class="font-mono bg-white px-2 py-1 rounded">${'•'.repeat(credentials.password.length)}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Güvenlik Formu -->
            <div class="bg-white rounded-xl shadow-sm p-6 space-y-6">
                <h3 class="text-lg font-semibold text-gray-700 mb-4">Giriş Bilgilerini Güncelle</h3>
                
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Yeni Kullanıcı Adı</label>
                    <input type="text" id="new-username" placeholder="Yeni kullanıcı adı (opsiyonel)" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <p class="text-xs text-gray-500 mt-1">Boş bırakırsanız mevcut kullanıcı adı korunur</p>
                </div>
                
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Mevcut Şifre *</label>
                    <input type="password" id="current-password" placeholder="Mevcut şifreniz" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Yeni Şifre</label>
                    <input type="password" id="new-password" placeholder="Yeni şifre (min 6 karakter)" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <p class="text-xs text-gray-500 mt-1">Boş bırakırsanız mevcut şifre korunur</p>
                </div>
                
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Yeni Şifre Tekrar</label>
                    <input type="password" id="confirm-password" placeholder="Yeni şifreyi tekrar girin" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                
                <div class="pt-4 border-t border-gray-200">
                    <button onclick="changeCredentials()" class="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition font-medium">
                        🔒 Bilgileri Güncelle
                    </button>
                </div>
                
                <!-- Güvenlik Uyarısı -->
                <div class="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div class="flex items-start">
                        <svg class="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                        </svg>
                        <div>
                            <p class="text-sm font-semibold text-amber-900 mb-1">⚠️ Güvenlik Önerisi</p>
                            <p class="text-sm text-amber-700">
                                Güvenliğiniz için düzenli olarak şifrenizi değiştirin ve güçlü şifreler kullanın.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function changeCredentials() {
    const currentPassword = document.getElementById('current-password').value;
    const newUsername = document.getElementById('new-username').value.trim();
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (!currentPassword) {
        showErrorModal('Mevcut şifrenizi girmelisiniz!');
        return;
    }
    
    const credentials = JSON.parse(localStorage.getItem('adminCredentials')) || { username: 'admin', password: 'admin123' };
    
    if (currentPassword !== credentials.password) {
        showErrorModal('Mevcut şifre hatalı!');
        return;
    }
    
    // Eğer hiçbir değişiklik yapılmadıysa
    if (!newUsername && !newPassword) {
        showErrorModal('Lütfen en az bir alanı doldurun (kullanıcı adı veya şifre)!');
        return;
    }
    
    // Yeni kullanıcı adı kontrolü
    if (newUsername && newUsername.length < 3) {
        showErrorModal('Kullanıcı adı en az 3 karakter olmalıdır!');
        return;
    }
    
    // Yeni şifre kontrolü
    if (newPassword) {
        if (newPassword.length < 6) {
            showErrorModal('Yeni şifre en az 6 karakter olmalıdır!');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showErrorModal('Yeni şifreler eşleşmiyor!');
            return;
        }
    }
    
    // Bilgileri güncelle
    const updatedCredentials = {
        username: newUsername || credentials.username,
        password: newPassword || credentials.password
    };
    
    localStorage.setItem('adminCredentials', JSON.stringify(updatedCredentials));
    
    const loginData = JSON.parse(localStorage.getItem('adminLogin')) || JSON.parse(sessionStorage.getItem('adminLogin'));
    if (loginData) {
        loginData.username = updatedCredentials.username;
        if (localStorage.getItem('adminLogin')) {
            localStorage.setItem('adminLogin', JSON.stringify(loginData));
        } else {
            sessionStorage.setItem('adminLogin', JSON.stringify(loginData));
        }
    }
    
    showNotification('Bilgiler başarıyla güncellendi! 🎉', 'success');
    updateUsernameDisplay();
    renderSecuritySection();
}

function showErrorModal(message) {
    const modalHTML = `
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all" onclick="event.stopPropagation()">
                <!-- Icon -->
                <div class="pt-8 pb-4 flex justify-center">
                    <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                </div>
                
                <!-- Content -->
                <div class="px-8 pb-6 text-center">
                    <h3 class="text-xl font-bold text-gray-900 mb-2">Hata</h3>
                    <p class="text-gray-600">
                        ${message}
                    </p>
                </div>
                
                <!-- Actions -->
                <div class="px-8 pb-8">
                    <button 
                        onclick="closeModal()" 
                        class="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition font-medium"
                    >
                        Tamam
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modals-container').innerHTML = modalHTML;
}
