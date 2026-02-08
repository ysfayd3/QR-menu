// LocalStorage'dan veri yükleme (fallback)
let menuData = [];
let categories = [];
let settings = {
    cafeName: 'Leanor Cafe',
    tagline: 'Lezzetin ve Keyifin Adresi'
};

let currentCategory = 'all';
let searchTerm = '';
let currentLanguage = localStorage.getItem('language') || 'tr';
let isDataLoaded = false;

// Çeviriler
const translations = {
    tr: {
        searchPlaceholder: 'Ürün ara...',
        emptyState: 'Ürün bulunamadı',
        products: 'ürün',
        categories: {
            nargile: 'Nargile',
            sicak: 'Sıcak İçecekler',
            soguk: 'Soğuk İçecekler',
            yemek: 'Yemekler',
            tatli: 'Tatlılar',
            sandvic: 'Sandviçler'
        }
    },
    en: {
        searchPlaceholder: 'Search products...',
        emptyState: 'No products found',
        products: 'products',
        categories: {
            nargile: 'Hookah',
            sicak: 'Hot Beverages',
            soguk: 'Cold Beverages',
            yemek: 'Food',
            tatli: 'Desserts',
            sandvic: 'Sandwiches'
        }
    }
};

// Ürün çevirileri
const productTranslations = {
    // Nargile
    "Elma Nargile": { en: "Apple Hookah", desc: "Refreshing hookah with fresh apple flavor" },
    "Çilek Nargile": { en: "Strawberry Hookah", desc: "Delightful hookah with sweet strawberry flavor" },
    "Nane Limon Nargile": { en: "Mint Lemon Hookah", desc: "Refreshing mint lemon mix" },
    "Karpuz Nargile": { en: "Watermelon Hookah", desc: "Summer delight with cool watermelon flavor" },
    "Karışık Meyve Nargile": { en: "Mixed Fruit Hookah", desc: "Special blend of fruit flavors" },
    "Şeftali Nargile": { en: "Peach Hookah", desc: "Sweet peach flavor" },
    "Üzüm Nargile": { en: "Grape Hookah", desc: "Cool grape flavor" },
    "Kavun Nargile": { en: "Melon Hookah", desc: "Sweet melon flavor" },
    
    // Sıcak İçecekler
    "Türk Kahvesi": { en: "Turkish Coffee", desc: "Traditional Turkish coffee" },
    "Cappuccino": { en: "Cappuccino", desc: "Milky foamy Italian coffee" },
    "Latte": { en: "Latte", desc: "Milky espresso coffee" },
    "Sıcak Çikolata": { en: "Hot Chocolate", desc: "Rich Belgian chocolate" },
    "Çay": { en: "Tea", desc: "Traditional brewed tea" },
    "Espresso": { en: "Espresso", desc: "Strong Italian espresso" },
    "Americano": { en: "Americano", desc: "Classic American coffee" },
    "Mocha": { en: "Mocha", desc: "Chocolate coffee" },
    "Salep": { en: "Salep", desc: "Traditional Turkish salep" },
    
    // Soğuk İçecekler
    "Limonata": { en: "Lemonade", desc: "Fresh squeezed lemonade" },
    "Ice Latte": { en: "Ice Latte", desc: "Iced milk coffee" },
    "Milkshake": { en: "Milkshake", desc: "Chocolate, vanilla or strawberry" },
    "Smoothie": { en: "Smoothie", desc: "Fresh fruit smoothie" },
    "Soğuk Çay": { en: "Iced Tea", desc: "Peach or lemon flavored" },
    "Frappe": { en: "Frappe", desc: "Iced foamy coffee" },
    "Portakal Suyu": { en: "Orange Juice", desc: "Fresh squeezed orange juice" },
    "Mojito": { en: "Mojito", desc: "Minty lemon refreshing drink" },
    
    // Yemekler
    "Serpme Kahvaltı": { en: "Turkish Breakfast", desc: "Rich Turkish breakfast platter for 2" },
    "Bonfile Izgara": { en: "Grilled Tenderloin", desc: "200gr beef tenderloin with special sauce" },
    "Leanor Burger": { en: "Leanor Burger", desc: "Premium burger with special sauce" },
    "Tavuk Şinitzel": { en: "Chicken Schnitzel", desc: "Crispy chicken schnitzel" },
    "Makarna": { en: "Pasta", desc: "Creamy or tomato sauce" },
    "Pizza": { en: "Pizza", desc: "Italian pizza, various options" },
    "Köfte": { en: "Meatballs", desc: "Grilled meatballs" },
    "Tost": { en: "Toast", desc: "Cheese toast" },
    "Omlet": { en: "Omelet", desc: "Cheese or mixed omelet" },
    
    // Tatlılar
    "Waffle": { en: "Waffle", desc: "Fruit or chocolate waffle" },
    "Cheesecake": { en: "Cheesecake", desc: "Berry cheesecake" },
    "Brownie": { en: "Brownie", desc: "Hot chocolate brownie" },
    "Tiramisu": { en: "Tiramisu", desc: "Italian classic tiramisu" },
    "Sütlaç": { en: "Rice Pudding", desc: "Baked rice pudding" },
    "Profiterol": { en: "Profiterole", desc: "Profiterole with chocolate sauce" },
    "Magnolia": { en: "Magnolia", desc: "Banana magnolia" },
    "Künefe": { en: "Kunefe", desc: "Hot kunefe" },
    "Dondurma": { en: "Ice Cream", desc: "Various flavors" }
};

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', async () => {
    // LocalDB'den verileri yükle
    await loadDataFromLocalDB();
    
    // Cafe adını güncelle
    document.getElementById('cafe-name-welcome').textContent = settings.cafeName;
    document.getElementById('cafe-tagline-welcome').textContent = settings.tagline;
    document.getElementById('cafe-name').textContent = settings.cafeName;
    document.getElementById('cafe-tagline').textContent = settings.tagline;
    
    // Dil ayarını uygula
    updateLanguage();
    
    renderMenu();
});

// LocalDB'den verileri yükle
async function loadDataFromLocalDB() {
    try {
        console.log('LocalDB\'den veriler yükleniyor...');
        
        // Yükleme göstergesi göster
        const emptyState = document.getElementById('empty-state');
        if (emptyState) {
            emptyState.classList.remove('hidden');
            document.getElementById('empty-text').textContent = 'Veriler yükleniyor...';
        }
        
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
        
        // Yükleme göstergesini gizle
        if (emptyState) {
            emptyState.classList.add('hidden');
        }
    } catch (error) {
        console.error('LocalDB\'den veri yüklenirken hata:', error);
    }
}
function loadFromLocalStorage() {
    console.log('LocalStorage\'dan veriler yükleniyor...');
    menuData = JSON.parse(localStorage.getItem('menuData')) || [];
    categories = JSON.parse(localStorage.getItem('categories')) || [
        { id: 'nargile', name: 'Nargile', icon: '🪔' },
        { id: 'sicak', name: 'Sıcak İçecekler', icon: '☕' },
        { id: 'soguk', name: 'Soğuk İçecekler', icon: '🧃' },
        { id: 'yemek', name: 'Yemekler', icon: '🍽️' },
        { id: 'tatli', name: 'Tatlılar', icon: '🍰' }
    ];
    settings = JSON.parse(localStorage.getItem('settings')) || settings;
    isDataLoaded = true;
}

// Firebase'den gerçek zamanlı güncellemeleri dinle
function listenToFirebaseChanges() {
    // Menü değişikliklerini dinle
    db.collection('menu').onSnapshot((snapshot) => {
        if (isDataLoaded) {
            console.log('🔄 Menü güncellendi, yeniden yükleniyor...');
            menuData = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: parseInt(doc.id) || data.id,
                    ...data
                };
            });
            renderMenu();
        }
    }, (error) => {
        console.error('Menü dinleme hatası:', error);
    });
    
    // Kategori değişikliklerini dinle
    db.collection('categories').doc('list').onSnapshot((doc) => {
        if (isDataLoaded && doc.exists) {
            console.log('🔄 Kategoriler güncellendi, yeniden yükleniyor...');
            categories = doc.data().items;
            renderMenu();
        }
    }, (error) => {
        console.error('Kategori dinleme hatası:', error);
    });
    
    // Ayar değişikliklerini dinle
    db.collection('settings').doc('general').onSnapshot((doc) => {
        if (isDataLoaded && doc.exists) {
            console.log('🔄 Ayarlar güncellendi, yeniden yükleniyor...');
            settings = doc.data();
            document.getElementById('cafe-name-welcome').textContent = settings.cafeName;
            document.getElementById('cafe-tagline-welcome').textContent = settings.tagline;
            document.getElementById('cafe-name').textContent = settings.cafeName;
            document.getElementById('cafe-tagline').textContent = settings.tagline;
        }
    }, (error) => {
        console.error('Ayar dinleme hatası:', error);
    });
}

// Dil değiştir
function toggleLanguage() {
    currentLanguage = currentLanguage === 'tr' ? 'en' : 'tr';
    localStorage.setItem('language', currentLanguage);
    updateLanguage();
    renderMenu();
}

// Dil güncellemesi
function updateLanguage() {
    document.getElementById('current-language').textContent = currentLanguage.toUpperCase();
    document.getElementById('search-input').placeholder = translations[currentLanguage].searchPlaceholder;
    document.getElementById('empty-text').textContent = translations[currentLanguage].emptyState;
}

// Giriş ekranından menüye geçiş
function enterMenu() {
    const welcomeScreen = document.getElementById('welcome-screen');
    const mainMenu = document.getElementById('main-menu');
    
    welcomeScreen.style.opacity = '0';
    welcomeScreen.style.transform = 'scale(0.95)';
    welcomeScreen.style.transition = 'all 0.5s ease';
    
    setTimeout(() => {
        welcomeScreen.style.display = 'none';
        mainMenu.classList.remove('hidden');
        mainMenu.style.animation = 'fadeInUp 0.6s ease-out';
    }, 500);
}

// Arama fonksiyonu
function searchProducts() {
    searchTerm = document.getElementById('search-input').value.toLowerCase();
    renderMenu();
}

// Menüyü render et - Dikey düzen (her kategori altında ürünleri)
function renderMenu() {
    const menuSections = document.getElementById('menu-sections');
    const emptyState = document.getElementById('empty-state');
    
    if (menuData.length === 0) {
        menuSections.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    // Her kategori için bir bölüm oluştur (sadece ürünü olanlar)
    let sectionsHTML = '';
    let hasAnyProducts = false;
    
    categories.forEach(category => {
        let categoryProducts = menuData.filter(item => item.category === category.id);
        
        // Arama filtresi
        if (searchTerm) {
            categoryProducts = categoryProducts.filter(item => {
                const productName = getTranslatedProductName(item.name);
                const productDesc = getTranslatedProductDesc(item.name, item.description);
                return productName.toLowerCase().includes(searchTerm) ||
                       productDesc.toLowerCase().includes(searchTerm);
            });
        }
        
        // Sadece en az 1 ürünü olan kategorileri göster
        if (categoryProducts.length > 0) {
            hasAnyProducts = true;
            const categoryName = translations[currentLanguage].categories[category.id] || category.name;
            
            sectionsHTML += `
                <div class="category-section mb-10" data-category="${category.id}">
                    <!-- Category Header - Horizontal -->
                    <div class="flex items-center justify-center gap-3 mb-6 pb-4 border-b-2 border-purple-200">
                        <span class="text-5xl">${category.icon || '📦'}</span>
                        <h2 class="text-3xl font-bold text-gray-800">${categoryName}</h2>
                        <span class="text-sm text-gray-500 bg-purple-100 px-3 py-1 rounded-full">${categoryProducts.length} ${translations[currentLanguage].products}</span>
                    </div>
                    
                    <!-- Products Grid -->
                    <div class="grid grid-cols-1 gap-4">
                        ${categoryProducts.map((item, index) => {
                            const productName = getTranslatedProductName(item.name);
                            const productDesc = getTranslatedProductDesc(item.name, item.description);
                            
                            // Resim URL'sini hazırla (IndexedDB desteği)
                            let bgStyle = `background-image: url('https://via.placeholder.com/200')`;
                            let dataAttr = '';
                            
                            if (item.image) {
                                if (item.image.startsWith('data:') || item.image.startsWith('http')) {
                                    bgStyle = `background-image: url('${item.image}')`;
                                } else {
                                    dataAttr = `data-photo-id="${item.image}"`;
                                }
                            }
                            
                            return `
                            <div 
                                class="product-card bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform hover:shadow-xl"
                                onclick="showProductDetails(${item.id})"
                                style="animation: fadeInUp 0.6s ease-out; animation-delay: ${index * 0.05}s; animation-fill-mode: both;"
                            >
                                <div class="flex gap-4 p-4">
                                    <!-- Product Info - Left Side -->
                                    <div class="flex-1 min-w-0 flex flex-col justify-between">
                                        <div>
                                            <h3 class="text-xl font-bold text-gray-800 mb-2">${productName}</h3>
                                            <p class="text-sm text-gray-600 mb-3 line-clamp-2">${productDesc}</p>
                                        </div>
                                        <div class="flex items-center justify-between">
                                            <span class="text-2xl font-bold text-purple-600">${item.price}</span>
                                            <button class="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white shadow-lg">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <!-- Product Image - Right Side -->
                                    <div class="flex-shrink-0">
                                        <div 
                                            class="w-32 h-32 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 bg-cover bg-center product-image loaded shadow-md product-image-async"
                                            style="${bgStyle}" ${dataAttr}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        `}).join('')}
                    </div>
                </div>
            `;
        }
    });
    
    // Hiç ürün yoksa empty state göster
    if (!hasAnyProducts) {
        menuSections.innerHTML = '';
        emptyState.classList.remove('hidden');
    } else {
        menuSections.innerHTML = sectionsHTML;
    }
    
    // Asenkron fotoğrafları yükle
    loadImagesAsync();
}

// Ürün adını çevir
function getTranslatedProductName(name) {
    if (currentLanguage === 'en' && productTranslations[name]) {
        return productTranslations[name].en;
    }
    return name;
}

// Ürün açıklamasını çevir
function getTranslatedProductDesc(name, originalDesc) {
    if (currentLanguage === 'en' && productTranslations[name]) {
        return productTranslations[name].desc;
    }
    return originalDesc || '';
}

// Asenkron fotoğraf yükleyici (IndexedDB için)
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

// Ürün detaylarını göster
function showProductDetails(productId) {
    const product = menuData.find(item => item.id === productId);
    if (!product) return;
    
    const modal = document.getElementById('product-modal');
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const modalPrice = document.getElementById('modal-price');
    const modalDetails = document.getElementById('modal-details');
    
    // Set image
    if (product.image) {
        if (product.image.startsWith('data:') || product.image.startsWith('http')) {
            modalImage.style.backgroundImage = `url('${product.image}')`;
        } else if (typeof PhotoStorage !== 'undefined') {
            // IndexedDB'den yükle
            PhotoStorage.getBlobUrl(product.image).then(url => {
                if (url) modalImage.style.backgroundImage = `url('${url}')`;
            });
        }
    } else {
        modalImage.style.backgroundImage = `url('https://via.placeholder.com/400x300')`;
    }
    
    // Set basic info with translation
    const productName = getTranslatedProductName(product.name);
    const productDesc = getTranslatedProductDesc(product.name, product.description);
    
    modalTitle.textContent = productName;
    modalDescription.textContent = productDesc;
    modalPrice.textContent = product.price;
    
    // Set details with translation
    if (product.details) {
        const detailLabels = currentLanguage === 'en' ? {
            ingredients: 'Ingredients',
            serving: 'Serving',
            temperature: 'Temperature',
            time: 'Duration',
            calories: 'Calories',
            note: 'Note'
        } : {
            ingredients: 'İçindekiler',
            serving: 'Sunum',
            temperature: 'Sıcaklık',
            time: 'Süre',
            calories: 'Kalori',
            note: 'Not'
        };
        
        const detailsHTML = Object.entries(product.details)
            .filter(([key, value]) => value)
            .map(([key, value]) => {
                const icons = {
                    ingredients: '🥘',
                    serving: '🍽️',
                    temperature: '🌡️',
                    time: '⏱️',
                    calories: '🔥',
                    note: '💡'
                };
                
                return `
                    <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                        <span class="text-2xl">${icons[key] || '📌'}</span>
                        <div class="flex-1">
                            <p class="text-sm font-semibold text-gray-700">${detailLabels[key] || key}</p>
                            <p class="text-sm text-gray-600">${value}</p>
                        </div>
                    </div>
                `;
            }).join('');
        
        modalDetails.innerHTML = detailsHTML;
    } else {
        modalDetails.innerHTML = '';
    }
    
    // Show modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Add haptic feedback (if supported)
    if (navigator.vibrate) {
        navigator.vibrate(10);
    }
}

// Modal'ı kapat
function closeModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Swipe to close modal
let touchStartY = 0;
let touchEndY = 0;

document.getElementById('product-modal')?.addEventListener('touchstart', (e) => {
    touchStartY = e.changedTouches[0].screenY;
}, false);

document.getElementById('product-modal')?.addEventListener('touchend', (e) => {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
}, false);

function handleSwipe() {
    if (touchEndY - touchStartY > 100) {
        closeModal();
    }
}

// Prevent zoom on double tap
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);
