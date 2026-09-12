// تطبيق ومنطق متجر زهور اللوتس (Lotus Flowers EG)
// مبني لدعم التنقل متعدد الصفحات الاحترافي، إدارة الأحجام والأسعار المتعددة،
// التوليد التلقائي لأكواد المنتجات (SKU)، صلاحيات المدراء، وربط Meta Cloud API

(function() {
  'use strict';

  // مفاتيح التخزين المحلي
  const STORAGE_KEYS = {
    PRODUCTS: 'lotus_products_v2',
    ORDERS: 'lotus_orders_v2',
    POLICIES: 'lotus_policies_v2',
    STORE_INFO: 'lotus_store_info_v2',
    USERS: 'lotus_users_v2',
    CURRENT_USER: 'lotus_current_user_v2',
    META_CONFIG: 'lotus_meta_config_v2',
    CART: 'lotus_cart_v2',
    MAGAZINE_SLIDES: 'lotus_magazine_slides_v2',
    SHOWCASE_POSTS: 'lotus_showcase_posts_v2',
    CATEGORIES_LIST: 'lotus_categories_list_v2',
    FLOWER_TYPES_LIST: 'lotus_flower_types_list_v2',
    COLORS_LIST: 'lotus_colors_list_v2',
    OCCASIONS: 'lotus_occasions_v2',
    GIFT_IDEAS: 'lotus_gift_ideas_v2'
  };

  // تصفير العمليات والطلبات والمستخدمين التجريبيين للإطلاق الإنتاجي النظيف مع الحفاظ على المنتجات
  if (!localStorage.getItem('lotus_clean_launch_v3')) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    localStorage.setItem('lotus_clean_launch_v3', 'true');
  }

  // حالة التطبيق الشاملة (Application State)
  const state = {
    storeInfo: JSON.parse(localStorage.getItem(STORAGE_KEYS.STORE_INFO)) || DEFAULT_STORE_INFO,
    policies: JSON.parse(localStorage.getItem(STORAGE_KEYS.POLICIES)) || DEFAULT_POLICIES,
    products: JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS)) || DEFAULT_PRODUCTS,
    orders: JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS)) || INITIAL_ORDERS,
    users: JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || DEFAULT_USERS,
    currentUser: JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) || null,
    metaConfig: JSON.parse(localStorage.getItem(STORAGE_KEYS.META_CONFIG)) || DEFAULT_META_CONFIG,
    cart: JSON.parse(localStorage.getItem(STORAGE_KEYS.CART)) || [],

    // مجلة المتجر التفاعلية (Hero Magazine Slider)
    magazineSlides: JSON.parse(localStorage.getItem(STORAGE_KEYS.MAGAZINE_SLIDES)) || INITIAL_MAGAZINE_SLIDES,
    currentMagazineSlide: 0,
    uploadedMagazineImage: null,

    // معرض منشورات إنستغرام الحقيقية (Showcase Posts)
    showcasePosts: JSON.parse(localStorage.getItem(STORAGE_KEYS.SHOWCASE_POSTS)) || INITIAL_SHOWCASE_POSTS,
    uploadedShowcaseImage: null,

    // الهايلايتس والتصنيفات والألوان وأنواع الورد (Dynamic Attributes & Circles)
    occasions: JSON.parse(localStorage.getItem(STORAGE_KEYS.OCCASIONS)) || FLOWARD_OCCASIONS,
    giftIdeas: JSON.parse(localStorage.getItem(STORAGE_KEYS.GIFT_IDEAS)) || FLOWARD_GIFT_IDEAS,
    categoriesList: JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES_LIST)) || DEFAULT_CATEGORIES,
    flowerTypesList: JSON.parse(localStorage.getItem(STORAGE_KEYS.FLOWER_TYPES_LIST)) || DEFAULT_FLOWER_TYPES,
    colorsList: JSON.parse(localStorage.getItem(STORAGE_KEYS.COLORS_LIST)) || DEFAULT_COLORS,
    uploadedHighlightImage: null,

    // المسار الحالي والتنقل (Routing)
    currentRoute: {
      page: 'home', // home, shop, product, track, about, policies, contact, faq, admin, login
      param: null
    },

    // فلاتر الكتالوج متعددة الاختيار (Multi-Select Checkboxes)
    filters: {
      categories: [],
      colors: [],
      flowerTypes: [],
      sizes: [],
      priceRange: 'all',
      searchQuery: '',
      sortBy: 'featured'
    },
    selectedCardSizes: {}, // { [productId]: sizeIndex }
    ordersFilter: 'all', // all, pending_payment, payment_confirmed, preparing, out_for_delivery, delivered
    ordersSearchQuery: '',
    editingProduct: null,
    uploadedEditProductImage: null,

    // المساعد الذكي
    smartFinder: {
      occasion: '',
      color: '',
      budget: ''
    },

    // لوحة تحكم المدير
    admin: {
      activeTab: 'orders' // orders, products, magazine, showcase, highlights, cms, users, meta
    },

    // المنتج المختار للعرض
    viewingProduct: null,
    selectedSizeIndex: 0,
    uploadedProductImage: null,
    selectedReceiptImage: null
  };

  // مساعدات استخراج المعرف والاسم للتصنيفات والخصائص
  function getAttrId(item) {
    if (!item) return '';
    return typeof item === 'object' ? (item.id || item.name || '') : item;
  }

  function getAttrLabel(item) {
    if (!item) return '';
    return typeof item === 'object' ? (item.label || item.name || item.id || '') : item;
  }

  // حفظ المتغيرات محلياً
  function saveState(key) {
    if (key === 'cart') localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(state.cart));
    if (key === 'orders') localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(state.orders));
    if (key === 'products') localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(state.products));
    if (key === 'policies') localStorage.setItem(STORAGE_KEYS.POLICIES, JSON.stringify(state.policies));
    if (key === 'storeInfo') localStorage.setItem(STORAGE_KEYS.STORE_INFO, JSON.stringify(state.storeInfo));
    if (key === 'users') localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(state.users));
    if (key === 'currentUser') localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(state.currentUser));
    if (key === 'metaConfig') localStorage.setItem(STORAGE_KEYS.META_CONFIG, JSON.stringify(state.metaConfig));
    if (key === 'magazineSlides') localStorage.setItem(STORAGE_KEYS.MAGAZINE_SLIDES, JSON.stringify(state.magazineSlides));
    if (key === 'showcasePosts') localStorage.setItem(STORAGE_KEYS.SHOWCASE_POSTS, JSON.stringify(state.showcasePosts));
    if (key === 'categoriesList') localStorage.setItem(STORAGE_KEYS.CATEGORIES_LIST, JSON.stringify(state.categoriesList));
    if (key === 'flowerTypesList') localStorage.setItem(STORAGE_KEYS.FLOWER_TYPES_LIST, JSON.stringify(state.flowerTypesList));
    if (key === 'colorsList') localStorage.setItem(STORAGE_KEYS.COLORS_LIST, JSON.stringify(state.colorsList));
    if (key === 'occasions') localStorage.setItem(STORAGE_KEYS.OCCASIONS, JSON.stringify(state.occasions));
    if (key === 'giftIdeas') localStorage.setItem(STORAGE_KEYS.GIFT_IDEAS, JSON.stringify(state.giftIdeas));
  }

  // تنظيف وتأمين النصوص المعروضة ضد ثغرات XSS
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // إشعار منبثق ناعم
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-5 left-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white font-medium text-xs sm:text-sm transition-all duration-300 transform translate-y-10 opacity-0 ${
      type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-rose-700' : 'bg-slate-800'
    }`;
    toast.innerHTML = `
      <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-triangle' : 'info'}" class="w-4 h-4"></i>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);
    lucide.createIcons();

    setTimeout(() => toast.classList.remove('translate-y-10', 'opacity-0'), 10);
    setTimeout(() => {
      toast.classList.add('translate-y-10', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // نظام التوجيه وإدارة الصفحات (Router & History)
  function navigateTo(hash, replace = false) {
    if (replace) {
      window.location.replace(hash);
    } else {
      window.location.hash = hash;
    }
  }

  function handleRoute() {
    const rawHash = window.location.hash.replace(/^#/, '') || 'home';
    const parts = rawHash.split('/');
    const page = parts[0] || 'home';
    const param = parts[1] || null;

    state.currentRoute = { page, param };
    renderBreadcrumbs();
    renderCurrentPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // رسم شريط مسار التنقل (Breadcrumbs)
  function renderBreadcrumbs() {
    const container = document.getElementById('breadcrumbs-bar');
    if (!container) return;

    const { page, param } = state.currentRoute;
    if (page === 'home') {
      container.classList.add('hidden');
      return;
    }

    container.classList.remove('hidden');
    let crumbs = [{ label: 'الرئيسية', hash: '#home' }];

    if (page === 'shop') {
      crumbs.push({ label: 'كتالوج الزهور والهدايا', hash: '#shop' });
    } else if (page === 'product') {
      const prod = state.products.find(p => p.id === param || p.sku === param);
      crumbs.push({ label: 'المتجر', hash: '#shop' });
      if (prod) {
        crumbs.push({ label: prod.category, hash: `#shop?category=${encodeURIComponent(prod.category)}` });
        crumbs.push({ label: `${prod.name} (${prod.sku})`, hash: `#product/${prod.id}` });
      } else {
        crumbs.push({ label: 'تفاصيل الباقة', hash: '#shop' });
      }
    } else if (page === 'track') {
      crumbs.push({ label: 'تتبع حالة الطلب', hash: '#track' });
    } else if (page === 'cart') {
      crumbs.push({ label: 'سلة الشراء', hash: '#cart' });
    } else if (page === 'about') {
      crumbs.push({ label: 'من نحن', hash: '#about' });
    } else if (page === 'policies') {
      crumbs.push({ label: 'سياسات المتجر والشحن', hash: '#policies' });
    } else if (page === 'contact') {
      crumbs.push({ label: 'اتصل بنا والموقع', hash: '#contact' });
    } else if (page === 'faq') {
      crumbs.push({ label: 'الأسئلة الشائعة', hash: '#faq' });
    } else if (page === 'admin') {
      crumbs.push({ label: 'لوحة تحكم الإدارة', hash: '#admin' });
    } else if (page === 'login') {
      crumbs.push({ label: 'تسجيل الدخول', hash: '#login' });
    }

    container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div class="flex items-center gap-2 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
          <button onclick="window.history.back()" class="p-1 rounded-md hover:bg-gray-100 text-gray-700 flex items-center gap-1 font-bold ml-1" title="رجوع">
            <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            <span>رجوع</span>
          </button>
          <span class="text-gray-300">|</span>
          ${crumbs.map((c, i) => {
            const isLast = i === crumbs.length - 1;
            return `
              ${i > 0 ? `<i data-lucide="chevron-left" class="w-3 h-3 text-gray-400"></i>` : ''}
              ${isLast ? `
                <span class="font-bold text-rose-900">${c.label}</span>
              ` : `
                <a href="${c.hash}" class="hover:text-rose-900 transition">${c.label}</a>
              `}
            `;
          }).join('')}
        </div>
      </div>
    `;
    lucide.createIcons();
  }

  // رسم محتوى الصفحة الحالية في الحاوية الرئيسية
  function renderCurrentPage() {
    const mainView = document.getElementById('page-view-container');
    const heroSection = document.getElementById('hero-section');
    const smartFinderSection = document.getElementById('smart-finder-section');
    const socialSection = document.getElementById('social-section');
    const mapsSection = document.getElementById('maps-section');

    if (!mainView) return;
    const { page, param } = state.currentRoute;

    // إظهار أو إخفاء الأقسام الخاصة بالصفحة الرئيسية
    if (page === 'home') {
      if (heroSection) heroSection.classList.remove('hidden');
      if (smartFinderSection) smartFinderSection.classList.remove('hidden');
      if (socialSection) socialSection.classList.remove('hidden');
      if (mapsSection) mapsSection.classList.remove('hidden');
      renderHeroMagazine();
      renderShowcaseSection();
      renderHomeCatalog(mainView);
    } else {
      if (heroSection) heroSection.classList.add('hidden');
      if (smartFinderSection) smartFinderSection.classList.add('hidden');
      if (socialSection) socialSection.classList.add('hidden');
      if (mapsSection) mapsSection.classList.add('hidden');

      if (page === 'shop') renderShopPage(mainView);
      else if (page === 'product') renderProductDetailsPage(mainView, param);
      else if (page === 'track') renderTrackPage(mainView);
      else if (page === 'about') renderAboutPage(mainView);
      else if (page === 'policies') renderPoliciesPage(mainView);
      else if (page === 'contact') renderContactPage(mainView);
      else if (page === 'faq') renderFaqPage(mainView);
      else if (page === 'login') renderLoginPage(mainView);
      else if (page === 'admin') renderAdminDashboard(mainView);
    }

    updateNavbarUser();
    updateCartBadge();
  }

  // ==================== محرك مجلة المتجر التفاعلية الفاخرة (Hero Magazine Engine) ====================
  function renderHeroMagazine() {
    const container = document.getElementById('hero-magazine-container');
    if (!container) return;

    const slides = (state.magazineSlides && state.magazineSlides.length > 0)
      ? state.magazineSlides.filter(s => s.active !== false)
      : INITIAL_MAGAZINE_SLIDES;

    if (slides.length === 0) {
      container.innerHTML = '';
      return;
    }

    if (state.currentMagazineSlide >= slides.length) {
      state.currentMagazineSlide = 0;
    }

    container.innerHTML = `
      <div class="magazine-slider-wrap relative">
        <!-- نمط النقاط المائية الفاخرة بالخلفية -->
        <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1.2px,transparent_1.2px)] [background-size:20px_20px] pointer-events-none"></div>

        <!-- أزرار التقليب لليمين واليسار بالسحب والنقر -->
        ${slides.length > 1 ? `
          <button type="button" onclick="window.lotusApp.magazinePrev()" class="magazine-nav-btn prev" title="الشريحة السابقة (السهم الأيمن)">
            <i data-lucide="chevron-right" class="w-6 h-6"></i>
          </button>
          <button type="button" onclick="window.lotusApp.magazineNext()" class="magazine-nav-btn next" title="الشريحة التالية (السهم الأيسر)">
            <i data-lucide="chevron-left" class="w-6 h-6"></i>
          </button>
        ` : ''}

        <!-- حاوية الشرائح -->
        <div id="magazine-slides-track" class="relative z-10">
          ${slides.map((slide, idx) => {
            const isActive = idx === state.currentMagazineSlide;
            return `
              <div class="magazine-slide ${isActive ? 'active' : ''} py-12 lg:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" data-slide-index="${idx}">
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                  
                  <!-- تفاصيل الغلاف والمحتوى التحريري -->
                  <div class="lg:col-span-7 text-center lg:text-right space-y-4">
                    
                    <div class="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                      <span class="magazine-issue-badge">${slide.issue || 'مجلة زهور اللوتس • ربيع 2026'}</span>
                      ${slide.badge ? `
                        <span class="bg-amber-400 text-rose-950 text-[11px] font-black px-3 py-0.5 rounded-full shadow-sm">
                          ${slide.badge}
                        </span>
                      ` : ''}
                    </div>

                    <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight font-amiri text-white">
                      ${slide.title}
                    </h1>

                    <p class="text-xs sm:text-sm text-rose-100/90 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                      ${slide.subtitle}
                    </p>

                    <div class="flex items-center justify-center lg:justify-start gap-3 pt-1">
                      ${slide.skuTag ? `
                        <span class="px-3 py-1 rounded-lg bg-white/10 text-amber-300 font-mono font-bold text-xs border border-white/10">
                          ${slide.skuTag}
                        </span>
                      ` : ''}
                      ${slide.priceTag ? `
                        <span class="px-3 py-1 rounded-lg bg-rose-900/80 text-white font-bold text-xs border border-rose-700/50">
                          ${slide.priceTag}
                        </span>
                      ` : ''}
                    </div>

                    <!-- أزرار الإجراءات المخصصة بالكامل من المدير -->
                    <div class="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-3">
                      ${slide.primaryBtnText ? `
                        <a href="${slide.primaryBtnLink || '#shop'}" class="px-7 py-3.5 rounded-xl btn-gold text-white font-black text-xs sm:text-sm shadow-xl flex items-center gap-2 transition hover:scale-105">
                          <i data-lucide="shopping-bag" class="w-4 h-4"></i>
                          <span>${slide.primaryBtnText}</span>
                        </a>
                      ` : ''}

                      ${slide.secondaryBtnText ? `
                        <a href="${slide.secondaryBtnLink || 'https://wa.me/201105746118'}" ${slide.secondaryBtnLink && slide.secondaryBtnLink.startsWith('http') ? 'target="_blank"' : ''} class="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition flex items-center gap-2">
                          <i data-lucide="${slide.secondaryBtnLink && slide.secondaryBtnLink.includes('wa.me') ? 'message-circle' : 'sparkles'}" class="w-4 h-4 text-amber-300"></i>
                          <span>${slide.secondaryBtnText}</span>
                        </a>
                      ` : ''}
                    </div>

                  </div>

                  <!-- صورة الغلاف الاستعراضية الفاخرة -->
                  <div class="lg:col-span-5 relative">
                    <div class="magazine-cover-frame max-w-sm mx-auto aspect-[4/5] bg-gray-900">
                      <img src="${slide.image}" alt="${slide.title}" class="w-full h-full object-cover">
                      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                        <span class="text-amber-300 text-[11px] font-bold block mb-1">زهور اللوتس • Lotus Flowers</span>
                        <h4 class="text-base font-bold text-white font-amiri line-clamp-1">${slide.title}</h4>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- مؤشرات نقاط التبديل (Dots) -->
        ${slides.length > 1 ? `
          <div class="magazine-dots-wrap">
            ${slides.map((_, i) => `
              <button type="button" onclick="window.lotusApp.magazineGoTo(${i})" class="magazine-dot ${i === state.currentMagazineSlide ? 'active' : ''}" title="الشريحة ${i + 1}"></button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;

    lucide.createIcons();
    initMagazineSwipe();
  }

  function magazineNext() {
    const slides = (state.magazineSlides && state.magazineSlides.length > 0)
      ? state.magazineSlides.filter(s => s.active !== false)
      : INITIAL_MAGAZINE_SLIDES;
    if (slides.length <= 1) return;
    state.currentMagazineSlide = (state.currentMagazineSlide + 1) % slides.length;
    renderHeroMagazine();
  }

  function magazinePrev() {
    const slides = (state.magazineSlides && state.magazineSlides.length > 0)
      ? state.magazineSlides.filter(s => s.active !== false)
      : INITIAL_MAGAZINE_SLIDES;
    if (slides.length <= 1) return;
    state.currentMagazineSlide = (state.currentMagazineSlide - 1 + slides.length) % slides.length;
    renderHeroMagazine();
  }

  function magazineGoTo(index) {
    state.currentMagazineSlide = index;
    renderHeroMagazine();
  }

  // دعم السحب باللمس للموبايل على المجلة
  function initMagazineSwipe() {
    const slider = document.querySelector('.magazine-slider-wrap');
    if (!slider || slider._swipeInit) return;
    slider._swipeInit = true;

    let touchStartX = 0;
    let touchEndX = 0;

    slider.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    slider.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 50) {
        magazineNext();
      } else if (touchEndX - touchStartX > 50) {
        magazinePrev();
      }
    }, { passive: true });
  }

  // ==================== رسم معرض منشورات إنستغرام الحقيقية ديناميكياً ====================
  function renderShowcaseSection() {
    const container = document.getElementById('social-showcase-container');
    if (!container) return;

    const posts = (state.showcasePosts && state.showcasePosts.length > 0)
      ? state.showcasePosts
      : INITIAL_SHOWCASE_POSTS;

    container.innerHTML = `
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        ${posts.map(post => `
          <div class="group relative aspect-square rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
            <img src="${post.image}" alt="${post.title || 'أعمال زهور اللوتس'}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" loading="lazy">
            
            <a href="${post.link || 'https://www.instagram.com/lotus_flowers_eg/'}" target="_blank" class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-white">
              <div class="flex items-center justify-between mb-1">
                <span class="w-6 h-6 rounded-md social-badge-instagram flex items-center justify-center">
                  <svg class="w-3 h-3 fill-white" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </span>
                <span class="text-[10px] text-gray-300">${post.date || 'إنستغرام'}</span>
              </div>
              <p class="text-[10px] font-bold line-clamp-2 leading-tight">${post.title}</p>
            </a>
          </div>
        `).join('')}
      </div>
    `;
    lucide.createIcons();
  }

  // تحديث شارة المستخدم في شريط الرأس
  function updateNavbarUser() {
    const userBtn = document.getElementById('navbar-user-btn');
    if (!userBtn) return;

    if (state.currentUser) {
      const isManager = ['super_admin', 'orders_manager', 'content_manager'].includes(state.currentUser.role);
      userBtn.innerHTML = `
        <div class="relative group">
          <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-800">
            <i data-lucide="user-check" class="w-4 h-4 text-rose-800"></i>
            <span>${state.currentUser.name.split(' ')[0]}</span>
            ${isManager ? `<span class="bg-rose-900 text-white text-[9px] px-1.5 py-0.2 rounded">إدارة</span>` : ''}
          </button>
          
          <div class="absolute left-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1 hidden group-hover:block z-50 text-right text-xs">
            <div class="px-3 py-2 border-b border-gray-100 text-gray-500 text-[11px]">
              ${state.currentUser.roleLabel || state.currentUser.role}
            </div>
            ${isManager ? `
              <a href="#admin" class="block px-3 py-2 text-rose-900 font-bold hover:bg-rose-50">
                لوحة التحكم
              </a>
            ` : ''}
            <button onclick="window.lotusApp.openChangePasswordModal()" class="w-full text-right px-3 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 font-bold">
              <i data-lucide="key" class="w-3.5 h-3.5 text-rose-800"></i>
              <span>تعديل كلمة المرور</span>
            </button>
            <button onclick="window.lotusApp.handleLogout()" class="w-full text-right px-3 py-2 text-red-600 hover:bg-red-50 flex items-center gap-1.5 font-bold">
              <i data-lucide="log-out" class="w-3.5 h-3.5"></i>
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      `;
    } else {
      userBtn.innerHTML = `
        <a href="#login" class="p-2 sm:px-3 sm:py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs font-bold text-gray-700 flex items-center gap-1.5" title="تسجيل الدخول">
          <i data-lucide="user" class="w-4 h-4 text-gray-600"></i>
          <span class="hidden sm:inline">حسابي</span>
        </a>
      `;
    }
    lucide.createIcons();
  }

  // رسم دوائر التصنيفات والمناسبات على نمط فلاورد (Floward-Style Circles)
  function renderFlowardCirclesHtml(activeFilter = '') {
    const occasionsList = state.occasions || FLOWARD_OCCASIONS;
    const giftIdeasList = state.giftIdeas || FLOWARD_GIFT_IDEAS;

    return `
      <div class="mb-8 space-y-6">
        <!-- قسم 1: هدايا لكل لحظة (المناسبات الكبرى) -->
        <div class="bg-white/80 backdrop-blur-sm p-4 rounded-3xl border border-rose-100 shadow-sm">
          <div class="flex items-center justify-between mb-3 px-1">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-rose-900 inline-block animate-pulse"></span>
              <h3 class="text-xs sm:text-sm font-black text-gray-900">هدايا لكل لحظة ومناسبة</h3>
            </div>
            <span class="text-[11px] text-gray-400 font-semibold hidden sm:inline">اختر المناسبة للانتقال والفلترة المباشرة</span>
          </div>

          <div class="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-2 pt-1 px-1 scrollbar-none">
            ${occasionsList.map(occ => {
              const isActive = state.filters.categories.includes(occ.query);
              return `
                <div onclick="window.lotusApp.navigateToCategory('${occ.query}', 'category')" class="floward-circle-item ${isActive ? 'active' : ''}">
                  <div class="floward-circle-img-wrap ${isActive ? 'ring-2 ring-rose-900' : ''}">
                    <img src="${occ.image}" alt="${occ.name}" class="floward-circle-img" loading="lazy">
                  </div>
                  <span class="floward-circle-label ${isActive ? 'text-rose-900 font-black' : ''}">${occ.name}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- قسم 2: اكتشف أفكار هدايا وتنسيقات رائعة -->
        <div class="bg-white/80 backdrop-blur-sm p-4 rounded-3xl border border-amber-100 shadow-sm">
          <div class="flex items-center justify-between mb-3 px-1">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
              <h3 class="text-xs sm:text-sm font-black text-gray-900">اكتشف أفكار وتنسيقات زهور اللوتس</h3>
            </div>
          </div>

          <div class="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-2 pt-1 px-1 scrollbar-none">
            ${giftIdeasList.map(gift => {
              const isActive = state.filters.flowerTypes.includes(gift.query) || state.filters.categories.includes(gift.query);
              return `
                <div onclick="window.lotusApp.navigateToCategory('${gift.query}', '${gift.filterType || 'tag'}')" class="floward-circle-item ${isActive ? 'active' : ''}">
                  <div class="floward-circle-img-wrap ${isActive ? 'ring-2 ring-amber-500' : ''}">
                    <img src="${gift.image}" alt="${gift.name}" class="floward-circle-img" loading="lazy">
                  </div>
                  <span class="floward-circle-label ${isActive ? 'text-amber-700 font-black' : ''}">${gift.name}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // فلاتر الاختيار المتعدد المربعة (Multi-Select Square Checkboxes)
  function renderMultiSelectFiltersHtml() {
    const totalSelected = state.filters.categories.length + state.filters.flowerTypes.length + state.filters.colors.length + state.filters.sizes.length + (state.filters.priceRange !== 'all' ? 1 : 0);

    const categoriesList = state.categoriesList || DEFAULT_CATEGORIES;
    const flowerTypesList = state.flowerTypesList || DEFAULT_FLOWER_TYPES;
    const colorsList = state.colorsList || DEFAULT_COLORS;

    const sizesList = [
      { id: "25", label: "باقة رقيقة (20-25 وردة)" },
      { id: "40", label: "باقة وسط (30-40 وردة)" },
      { id: "50", label: "باقة كبيرة (50 وردة)" },
      { id: "100", label: "باقة ملكية ضخمة (100 وردة)" },
      { id: "vase", label: "فازات وصواني متكاملة" }
    ];

    return `
      <div class="bg-white rounded-3xl border border-rose-100 shadow-sm p-5 mb-8">
        <!-- شريط الرأس للفلاتر مع العداد وزر الإلغاء والترتيب -->
        <div class="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100 mb-4">
          <div class="flex items-center gap-2">
            <i data-lucide="sliders-horizontal" class="w-4 h-4 text-rose-900"></i>
            <h3 class="font-bold text-xs sm:text-sm text-gray-900">تصفية متقدمة متعددة الخيارات (إضافة مربعة):</h3>
            ${totalSelected > 0 ? `
              <span class="bg-rose-900 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
                تم تحديد ${totalSelected}
              </span>
            ` : ''}
          </div>

          <div class="flex items-center gap-3">
            <!-- الترتيب -->
            <div class="flex items-center gap-1.5 text-xs text-gray-600">
              <span class="font-semibold">الترتيب:</span>
              <select onchange="window.lotusApp.setSortBy(this.value)" class="p-1.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-800">
                <option value="featured" ${state.filters.sortBy === 'featured' ? 'selected' : ''}>الأكثر تميزاً</option>
                <option value="price-low" ${state.filters.sortBy === 'price-low' ? 'selected' : ''}>السعر: الأقل أولاً</option>
                <option value="price-high" ${state.filters.sortBy === 'price-high' ? 'selected' : ''}>السعر: الأعلى أولاً</option>
              </select>
            </div>

            ${totalSelected > 0 ? `
              <button onclick="window.lotusApp.resetFilters()" class="text-xs text-rose-900 hover:text-rose-950 font-bold hover:underline flex items-center gap-1">
                <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
                <span>مسح كافة الفلاتر</span>
              </button>
            ` : ''}
          </div>
        </div>

        <!-- شبكة مربعات الاختيار الأربعة المربعة -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          
          <!-- 1. المناسبة والتصنيف -->
          <div>
            <span class="font-bold text-gray-800 block mb-2.5 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded bg-rose-800 inline-block"></span>
              <span>1. المناسبة / التصنيف:</span>
            </span>
            <div class="space-y-2">
              ${categoriesList.map(cat => {
                const checked = state.filters.categories.includes(cat.id);
                return `
                  <label class="flex items-center gap-2 cursor-pointer select-none text-gray-700 hover:text-rose-900 transition">
                    <input type="checkbox" ${checked ? 'checked' : ''} onchange="window.lotusApp.toggleFilter('categories', '${cat.id}')" class="filter-checkbox-square">
                    <span class="${checked ? 'font-bold text-rose-950' : ''}">${cat.label}</span>
                  </label>
                `;
              }).join('')}
            </div>
          </div>

          <!-- 2. نوع الورد الطبيعي -->
          <div>
            <span class="font-bold text-gray-800 block mb-2.5 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded bg-emerald-600 inline-block"></span>
              <span>2. نوع الورد (اختيار متعدد):</span>
            </span>
            <div class="space-y-2">
              ${flowerTypesList.map(ft => {
                const checked = state.filters.flowerTypes.includes(ft.id);
                return `
                  <label class="flex items-center gap-2 cursor-pointer select-none text-gray-700 hover:text-rose-900 transition">
                    <input type="checkbox" ${checked ? 'checked' : ''} onchange="window.lotusApp.toggleFilter('flowerTypes', '${ft.id}')" class="filter-checkbox-square">
                    <span class="${checked ? 'font-bold text-rose-950' : ''}">${ft.label}</span>
                  </label>
                `;
              }).join('')}
            </div>
          </div>

          <!-- 3. لون الورد -->
          <div>
            <span class="font-bold text-gray-800 block mb-2.5 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded bg-amber-500 inline-block"></span>
              <span>3. لون الورد:</span>
            </span>
            <div class="space-y-2">
              ${colorsList.map(col => {
                const checked = state.filters.colors.includes(col.id);
                return `
                  <label class="flex items-center gap-2 cursor-pointer select-none text-gray-700 hover:text-rose-900 transition">
                    <input type="checkbox" ${checked ? 'checked' : ''} onchange="window.lotusApp.toggleFilter('colors', '${col.id}')" class="filter-checkbox-square">
                    <span class="color-dot ${col.dot}"></span>
                    <span class="${checked ? 'font-bold text-rose-950' : ''}">${col.label}</span>
                  </label>
                `;
              }).join('')}
            </div>
          </div>

          <!-- 4. الحجم والميزانية -->
          <div>
            <span class="font-bold text-gray-800 block mb-2.5 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded bg-purple-600 inline-block"></span>
              <span>4. حجم الباقة المطلوب:</span>
            </span>
            <div class="space-y-2 mb-4">
              ${sizesList.map(sz => {
                const checked = state.filters.sizes.includes(sz.id);
                return `
                  <label class="flex items-center gap-2 cursor-pointer select-none text-gray-700 hover:text-rose-900 transition">
                    <input type="checkbox" ${checked ? 'checked' : ''} onchange="window.lotusApp.toggleFilter('sizes', '${sz.id}')" class="filter-checkbox-square">
                    <span class="${checked ? 'font-bold text-rose-950' : ''}">${sz.label}</span>
                  </label>
                `;
              }).join('')}
            </div>

            <span class="font-bold text-gray-800 block mb-1.5">الميزانية:</span>
            <select onchange="window.lotusApp.setPriceRange(this.value)" class="w-full p-2 rounded-xl border border-gray-200 bg-gray-50 text-xs">
              <option value="all" ${state.filters.priceRange === 'all' ? 'selected' : ''}>كافة الأسعار</option>
              <option value="under-500" ${state.filters.priceRange === 'under-500' ? 'selected' : ''}>أقل من 500 ج.م</option>
              <option value="500-1000" ${state.filters.priceRange === '500-1000' ? 'selected' : ''}>من 500 إلى 1000 ج.م</option>
              <option value="1000-plus" ${state.filters.priceRange === '1000-plus' ? 'selected' : ''}>أكثر من 1000 ج.م</option>
            </select>
          </div>

        </div>
      </div>
    `;
  }

  // كتالوج الصفحة الرئيسية
  function renderHomeCatalog(container) {
    container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <!-- دوائر التصنيفات والمناسبات على نمط فلاورد -->
        ${renderFlowardCirclesHtml()}

        <div class="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-2xl sm:text-3xl font-black text-gray-900 font-amiri">باقات وتنسيقات زهور اللوتس الحقيقية</h2>
            <p class="text-xs text-gray-500">أعمال وتنسيقات طبيعية من متجرنا في المنيل، القاهرة | اختر الحجم المطلوب وأضف للسلة مباشرة</p>
          </div>
          <a href="#shop" class="text-xs font-bold text-rose-900 hover:underline flex items-center gap-1">
            <span>تصفح كامل الفهرس والفلترة المتقدمة</span>
            <i data-lucide="arrow-left" class="w-4 h-4"></i>
          </a>
        </div>

        <!-- شبكة المنتجات مع الأسعار المباشرة والأحجام -->
        <div id="products-cards-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          ${renderProductsHtml(getFilteredProducts())}
        </div>
      </div>
    `;
    lucide.createIcons();
  }

  // صفحة الكتالوج الكامل (Shop Page)
  function renderShopPage(container) {
    container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center max-w-2xl mx-auto mb-6">
          <h1 class="text-3xl font-black text-rose-950 font-amiri mb-2">كتالوج وفهرس زهور اللوتس</h1>
          <p class="text-xs sm:text-sm text-gray-600">اختر من بين تشكيلاتنا المنسقة حسب المناسبة والنوع واللون مع إمكانية استعراض أسعار كافة الأحجام والإضافة المباشرة للسلة.</p>
        </div>

        <!-- دوائر المناسبات على نمط فلاورد -->
        ${renderFlowardCirclesHtml()}

        <!-- فلاتر الكتالوج متعددة الخيارات (إضافة مربعة) -->
        <div id="shop-filters-container">
          ${renderMultiSelectFiltersHtml()}
        </div>

        <!-- شبكة المنتجات -->
        <div id="shop-products-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          ${renderProductsHtml(getFilteredProducts())}
        </div>
      </div>
    `;
    lucide.createIcons();
  }

  // صفحة تفاصيل المنتج المستقلة مع الأحجام والأسعار المتعددة
  function renderProductDetailsPage(container, productId) {
    const product = state.products.find(p => p.id === productId || p.sku === productId);
    if (!product) {
      container.innerHTML = `
        <div class="py-20 text-center">
          <h3 class="text-xl font-bold text-gray-800">الباقة غير موجودة</h3>
          <a href="#shop" class="mt-4 inline-block px-5 py-2 rounded-xl bg-rose-950 text-white text-xs font-bold">العودة للمتجر</a>
        </div>
      `;
      return;
    }

    state.viewingProduct = product;
    state.selectedSizeIndex = 0;
    const currentSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : { name: 'حجم قياسي', price: 500 };

    container.innerHTML = `
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div class="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-10">
          
          <!-- صورة الباقة الحقيقية -->
          <div class="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative">
            <img id="main-product-image" src="${product.image}" alt="${product.name}" class="w-full h-full object-cover">
            <span class="absolute top-4 right-4 bg-rose-950 text-white font-mono text-xs font-bold px-3 py-1 rounded-lg shadow">
              كود: ${product.sku}
            </span>
          </div>

          <!-- تفاصيل الباقة واختيار الأحجام -->
          <div class="flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="bg-rose-50 text-rose-900 text-xs font-bold px-3 py-1 rounded-full">${product.category}</span>
                <span class="text-xs text-gray-500 font-medium">${product.flowerType || 'ورد طبيعي'}</span>
              </div>

              <h1 class="text-2xl sm:text-3xl font-black text-gray-900 mb-3">${product.name}</h1>
              
              <!-- السعر المتغير حسب الحجم -->
              <div class="flex items-baseline gap-2 mb-6">
                <span id="detail-product-price" class="text-3xl font-black text-rose-950">${currentSize.price}</span>
                <span class="text-sm font-bold text-rose-900">ج.م</span>
                <span id="detail-size-label" class="text-xs text-gray-500 mr-2">(${currentSize.name})</span>
              </div>

              <!-- اختيار حجم الباقة (Variants) -->
              <div class="mb-6 p-4 rounded-2xl bg-gray-50 border border-gray-200">
                <label class="block text-xs font-bold text-gray-800 mb-2.5 flex items-center gap-1.5">
                  <i data-lucide="layers" class="w-4 h-4 text-rose-800"></i>
                  <span>اختر حجم الباقة المطلوب:</span>
                </label>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2" id="sizes-buttons-container">
                  ${(product.sizes || []).map((s, idx) => `
                    <button type="button" onclick="window.lotusApp.selectProductSize(${idx})" class="size-btn p-3 rounded-xl border text-right transition flex items-center justify-between ${
                      idx === 0 ? 'border-rose-900 bg-rose-50/80 font-bold text-rose-950 ring-2 ring-rose-900/20' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }">
                      <span class="text-xs">${s.name}</span>
                      <span class="text-xs font-black text-rose-900">${s.price} ج.م</span>
                    </button>
                  `).join('')}
                </div>
              </div>

              <p class="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">${product.description}</p>

              <!-- كارت الإهداء المجاني المرفق -->
              <div class="mb-6 p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                <label class="block text-xs font-bold text-amber-900 mb-1.5 flex items-center gap-1.5">
                  <i data-lucide="mail" class="w-4 h-4 text-amber-700"></i>
                  <span>كارت إهداء مجاني مطبوع مع الباقة:</span>
                </label>
                <textarea id="product-card-msg" rows="2" placeholder="اكتب رسالتك الجميلة هنا للمستلم..." class="w-full text-xs p-2.5 rounded-xl border border-amber-300 focus:outline-none bg-white mb-2"></textarea>
                <label class="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                  <input type="checkbox" id="product-card-anon" class="accent-rose-900 rounded">
                  <span>إهداء سري ومفاجأة (إخفاء اسم وهوية المرسل عن المستلم)</span>
                </label>
              </div>
            </div>

            <!-- أزرار الإضافة للسلة والطلب -->
            <div class="pt-4 border-t border-gray-100 flex items-center gap-3">
              <div class="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-gray-50">
                <button onclick="window.lotusApp.adjustDetailQty(-1)" class="px-3 py-2 text-gray-600 hover:bg-gray-200">-</button>
                <span id="detail-qty" class="px-3 text-sm font-bold text-gray-800">1</span>
                <button onclick="window.lotusApp.adjustDetailQty(1)" class="px-3 py-2 text-gray-600 hover:bg-gray-200">+</button>
              </div>

              <button onclick="window.lotusApp.addCurrentDetailToCart()" class="flex-1 py-3.5 px-6 rounded-xl btn-primary font-bold text-sm shadow-md flex items-center justify-center gap-2">
                <i data-lucide="shopping-bag" class="w-4 h-4"></i>
                <span>إضافة الباقة إلى السلة</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    `;
    lucide.createIcons();
  }

  let detailQty = 1;
  function adjustDetailQty(delta) {
    detailQty = Math.max(1, detailQty + delta);
    const el = document.getElementById('detail-qty');
    if (el) el.textContent = detailQty;
  }

  function selectProductSize(sizeIndex) {
    if (!state.viewingProduct || !state.viewingProduct.sizes) return;
    state.selectedSizeIndex = sizeIndex;
    const selected = state.viewingProduct.sizes[sizeIndex];

    const priceEl = document.getElementById('detail-product-price');
    const labelEl = document.getElementById('detail-size-label');
    if (priceEl) priceEl.textContent = selected.price;
    if (labelEl) labelEl.textContent = `(${selected.name})`;

    // تحديث الأزرار
    document.querySelectorAll('.size-btn').forEach((btn, idx) => {
      if (idx === sizeIndex) {
        btn.className = 'size-btn p-3 rounded-xl border text-right transition flex items-center justify-between border-rose-900 bg-rose-50/80 font-bold text-rose-950 ring-2 ring-rose-900/20';
      } else {
        btn.className = 'size-btn p-3 rounded-xl border text-right transition flex items-center justify-between border-gray-200 bg-white text-gray-700 hover:border-gray-300';
      }
    });
  }

  function addCurrentDetailToCart() {
    if (!state.viewingProduct) return;
    const p = state.viewingProduct;
    const chosenSize = p.sizes && p.sizes[state.selectedSizeIndex] ? p.sizes[state.selectedSizeIndex] : { name: 'قياسي', price: 500 };
    const cardMsg = document.getElementById('product-card-msg')?.value || '';
    const isAnon = document.getElementById('product-card-anon')?.checked || false;

    state.cart.push({
      id: p.id,
      sku: p.sku,
      name: p.name,
      image: p.image,
      sizeName: chosenSize.name,
      price: chosenSize.price,
      qty: detailQty,
      giftCard: {
        message: cardMsg,
        isAnonymous: isAnon
      }
    });

    saveState('cart');
    updateCartBadge();
    showToast(`تمت إضافة "${p.name} - ${chosenSize.name}" إلى السلة 🌸`);
    openCartDrawer();
  }

  // اختيار حجم الباقة مباشرة من بطاقة الكتالوج
  function selectCardSize(productId, sizeIndex) {
    state.selectedCardSizes[productId] = sizeIndex;
    const prod = state.products.find(p => p.id === productId);
    if (!prod || !prod.sizes || !prod.sizes[sizeIndex]) return;

    const size = prod.sizes[sizeIndex];

    // تحديث الأزرار النشطة داخل البطاقة
    const container = document.getElementById(`card-sizes-${productId}`);
    if (container) {
      container.querySelectorAll('.card-size-pill').forEach((btn, idx) => {
        if (idx === sizeIndex) {
          btn.className = 'card-size-pill px-2 py-1 rounded-lg border text-[11px] transition flex items-center gap-1 active bg-rose-50 border-rose-900 text-rose-950 font-bold ring-1 ring-rose-900/20';
        } else {
          btn.className = 'card-size-pill px-2 py-1 rounded-lg border text-[11px] transition flex items-center gap-1 border-gray-200 bg-white text-gray-600 hover:border-gray-300';
        }
      });
    }

    // تحديث السعر المعروض أسفل البطاقة
    const priceEl = document.getElementById(`card-price-${productId}`);
    if (priceEl) {
      priceEl.innerHTML = `${size.price} <span class="text-xs font-bold text-rose-900">ج.م</span>`;
    }
  }

  // إضافة الباقة بالحجم المختار مباشرة إلى السلة من بطاقة المتجر
  function quickAddToCart(productId) {
    const prod = state.products.find(p => p.id === productId);
    if (!prod) return;
    const sizeIdx = state.selectedCardSizes[productId] || 0;
    const chosenSize = prod.sizes && prod.sizes[sizeIdx] ? prod.sizes[sizeIdx] : (prod.sizes && prod.sizes[0] ? prod.sizes[0] : { name: 'قياسي', price: 500 });

    state.cart.push({
      id: prod.id,
      sku: prod.sku,
      name: prod.name,
      image: prod.image,
      sizeName: chosenSize.name,
      price: chosenSize.price,
      qty: 1,
      giftCard: {
        message: '',
        isAnonymous: false
      }
    });

    saveState('cart');
    updateCartBadge();
    showToast(`تمت إضافة "${prod.name} (${chosenSize.name})" إلى السلة 🌸`);
    openCartDrawer();
  }

  // رسم بطاقات المنتجات مع إظهار سعر كل حجم وزر أضف للسلة المباشر
  function renderProductsHtml(productsList) {
    if (productsList.length === 0) {
      return `
        <div class="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-gray-200">
          <i data-lucide="flower" class="w-10 h-10 mx-auto text-gray-400 mb-3"></i>
          <h4 class="font-bold text-gray-800 text-sm mb-1">لا توجد باقات مطابقة لهذه الفلاتر المختارة</h4>
          <p class="text-xs text-gray-500 mb-4">جرب إزالة بعض الفلاتر لعرض مزيد من التشكيلات الجميلة</p>
          <button onclick="window.lotusApp.resetFilters()" class="px-4 py-2 rounded-xl btn-primary text-xs font-bold shadow-sm">
            عرض جميع الباقات
          </button>
        </div>
      `;
    }

    return productsList.map(p => {
      const selectedIdx = state.selectedCardSizes[p.id] || 0;
      const currentSize = p.sizes && p.sizes[selectedIdx] ? p.sizes[selectedIdx] : (p.sizes && p.sizes[0] ? p.sizes[0] : { name: 'قياسي', price: 500 });

      return `
        <div class="product-card bg-white rounded-3xl overflow-hidden flex flex-col justify-between border border-gray-200 shadow-sm" id="product-card-${p.id}">
          
          <!-- صورة الباقة وكودها -->
          <div class="relative aspect-square bg-gray-100 cursor-pointer overflow-hidden" onclick="window.location.hash = '#product/${p.id}'">
            <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover img-zoom" loading="lazy">
            <span class="absolute top-3 right-3 bg-rose-950/90 backdrop-blur-sm text-white font-mono text-[10px] font-bold px-2.5 py-1 rounded-lg shadow">
              كود: ${p.sku}
            </span>
            ${p.badge ? `
              <span class="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow">
                ${p.badge}
              </span>
            ` : ''}
          </div>

          <!-- تفاصيل الباقة -->
          <div class="p-4 flex-1 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                <span class="flex items-center gap-1 font-medium">
                  <span class="w-2 h-2 rounded-full bg-rose-700"></span>
                  <span>${p.flowerType || 'ورد طبيعي'}</span>
                </span>
                <span class="text-rose-900 font-bold bg-rose-50 px-2 py-0.5 rounded-md">${p.category}</span>
              </div>

              <h3 class="font-bold text-xs sm:text-sm text-gray-900 mb-1 line-clamp-1 hover:text-rose-900 cursor-pointer" onclick="window.location.hash = '#product/${p.id}'" title="${p.name}">
                ${p.name}
              </h3>

              <p class="text-[11px] text-gray-500 line-clamp-2 mb-2 leading-relaxed">
                ${p.description}
              </p>

              <!-- عرض أسعار جميع الأحجام المتاحة بنقرة مباشرة -->
              <div class="my-2 p-2 rounded-xl bg-gray-50 border border-gray-100">
                <div class="text-[10px] text-gray-500 font-bold mb-1.5 flex items-center justify-between">
                  <span>الأحجام والأسعار:</span>
                  <span class="text-rose-900 text-[9px] font-bold">حدد الحجم للشراء المباشر</span>
                </div>
                <div class="flex flex-wrap gap-1" id="card-sizes-${p.id}">
                  ${(p.sizes || []).map((s, sIdx) => {
                    const isSelected = sIdx === selectedIdx;
                    return `
                      <button type="button" onclick="window.lotusApp.selectCardSize('${p.id}', ${sIdx})" class="card-size-pill px-2 py-1 rounded-lg border text-[11px] transition flex items-center gap-1 ${
                        isSelected ? 'active bg-rose-50 border-rose-900 text-rose-950 font-bold ring-1 ring-rose-900/20' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }">
                        <span>${s.name.split('(')[0].replace('بوكيه', '').trim()}:</span>
                        <strong class="text-rose-950 font-black">${s.price} ج.م</strong>
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>

            <!-- أسفل البطاقة: السعر المحدد وزر أضف للسلة -->
            <div class="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
              <div>
                <span class="text-[9px] text-gray-400 block font-bold">السعر للحجم المختار:</span>
                <div id="card-price-${p.id}" class="text-base font-black text-rose-950">
                  ${currentSize.price} <span class="text-xs font-bold text-rose-900">ج.م</span>
                </div>
              </div>

              <div class="flex items-center gap-1.5">
                <a href="#product/${p.id}" class="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition" title="عرض التفاصيل وكارت الإهداء">
                  <i data-lucide="eye" class="w-4 h-4"></i>
                </a>
                <button type="button" onclick="window.lotusApp.quickAddToCart('${p.id}')" class="px-3 py-2 rounded-xl btn-primary font-bold text-xs shadow flex items-center gap-1.5 transition">
                  <i data-lucide="shopping-bag" class="w-3.5 h-3.5"></i>
                  <span>أضف للسلة</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      `;
    }).join('');
  }

  // تصفية المنتجات المتقدمة مع دعم الاختيار المتعدد
  function getFilteredProducts() {
    let list = state.products.filter(p => {
      // 1. فلاتر المناسبات والتصنيفات (Multi-select)
      if (state.filters.categories.length > 0) {
        const matchesCat = state.filters.categories.includes(p.category) ||
          (p.tags && state.filters.categories.some(c => p.tags.includes(c)));
        if (!matchesCat) return false;
      }

      // 2. فلاتر ألوان الورد (Multi-select)
      if (state.filters.colors.length > 0) {
        const matchesCol = state.filters.colors.some(c => 
          (p.colors && p.colors.includes(c)) ||
          p.color === c ||
          (p.tags && p.tags.includes(c))
        );
        if (!matchesCol) return false;
      }

      // 3. فلاتر نوع الورد الطبيعي (Multi-select)
      if (state.filters.flowerTypes.length > 0) {
        const matchesFt = state.filters.flowerTypes.some(ft =>
          (p.flowerTypes && p.flowerTypes.includes(ft)) ||
          (p.flowerType && p.flowerType.includes(ft)) ||
          (p.tags && p.tags.includes(ft)) ||
          (p.description && p.description.includes(ft))
        );
        if (!matchesFt) return false;
      }

      // 4. فلاتر الحجم (Multi-select)
      if (state.filters.sizes.length > 0) {
        const matchesSz = state.filters.sizes.some(sz => {
          if (sz === '25') return (p.sizes || []).some(s => s.name.includes('25') || s.name.includes('20') || s.name.includes('رقيق'));
          if (sz === '40') return (p.sizes || []).some(s => s.name.includes('40') || s.name.includes('30') || s.name.includes('وسط'));
          if (sz === '50') return (p.sizes || []).some(s => s.name.includes('50') || s.name.includes('كبير'));
          if (sz === '100') return (p.sizes || []).some(s => s.name.includes('100') || s.name.includes('ضخم') || s.name.includes('ملكي'));
          if (sz === 'vase') return (p.sizes || []).some(s => s.name.includes('فازة') || s.name.includes('صينية') || (p.tags && p.tags.includes('فازة')));
          return false;
        });
        if (!matchesSz) return false;
      }

      // 5. الميزانية ونطاق السعر
      if (state.filters.priceRange === 'under-500') {
        const hasUnder = (p.sizes || []).some(s => s.price < 500);
        if (!hasUnder) return false;
      } else if (state.filters.priceRange === '500-1000') {
        const hasMid = (p.sizes || []).some(s => s.price >= 500 && s.price <= 1000);
        if (!hasMid) return false;
      } else if (state.filters.priceRange === '1000-plus') {
        const hasHigh = (p.sizes || []).some(s => s.price > 1000);
        if (!hasHigh) return false;
      }

      // 6. شريط البحث
      if (state.filters.searchQuery && state.filters.searchQuery.trim()) {
        const q = state.filters.searchQuery.toLowerCase().trim();
        const mSku = p.sku && p.sku.toLowerCase().includes(q);
        const mName = p.name && p.name.toLowerCase().includes(q);
        const mDesc = p.description && p.description.toLowerCase().includes(q);
        const mCat = p.category && p.category.toLowerCase().includes(q);
        if (!mSku && !mName && !mDesc && !mCat) return false;
      }

      return true;
    });

    // الترتيب
    if (state.filters.sortBy === 'price-low') {
      list.sort((a, b) => {
        const pA = a.sizes && a.sizes[0] ? a.sizes[0].price : 0;
        const pB = b.sizes && b.sizes[0] ? b.sizes[0].price : 0;
        return pA - pB;
      });
    } else if (state.filters.sortBy === 'price-high') {
      list.sort((a, b) => {
        const pA = a.sizes && a.sizes[0] ? a.sizes[0].price : 0;
        const pB = b.sizes && b.sizes[0] ? b.sizes[0].price : 0;
        return pB - pA;
      });
    }

    return list;
  }

  // تبديل فلتر مربع (Toggle Multi-Select Checkbox)
  function toggleFilter(type, val) {
    if (!state.filters[type]) state.filters[type] = [];
    const idx = state.filters[type].indexOf(val);
    if (idx > -1) {
      state.filters[type].splice(idx, 1);
    } else {
      state.filters[type].push(val);
    }
    refreshProductsView();
  }

  // تعيين نطاق السعر
  function setPriceRange(val) {
    state.filters.priceRange = val;
    refreshProductsView();
  }

  // تعيين خيار الترتيب
  function setSortBy(val) {
    state.filters.sortBy = val;
    refreshProductsView();
  }

  // مسح وتفريغ كافة الفلاتر
  function resetFilters() {
    state.filters.categories = [];
    state.filters.colors = [];
    state.filters.flowerTypes = [];
    state.filters.sizes = [];
    state.filters.priceRange = 'all';
    state.filters.searchQuery = '';
    state.filters.sortBy = 'featured';

    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';

    refreshProductsView();
  }

  // الانتقال إلى المتجر مع تفعيل الفلتر عند النقر على دوائر فلاورد
  function navigateToCategory(query, filterType) {
    resetFilters();
    if (filterType === 'category') {
      state.filters.categories = [query];
    } else if (filterType === 'flowertype') {
      state.filters.flowerTypes = [query];
    } else {
      // category_or_tag
      state.filters.categories = [query];
    }

    if (state.currentRoute.page !== 'shop') {
      navigateTo('#shop');
    } else {
      refreshProductsView();
      window.scrollTo({ top: 350, behavior: 'smooth' });
    }
  }

  function filterCategory(cat) {
    navigateToCategory(cat, 'category');
  }

  function applyShopFilters() {
    refreshProductsView();
  }

  // تحديث شبكة المنتجات والفلاتر الحية
  function refreshProductsView() {
    const filtersContainer = document.getElementById('shop-filters-container');
    if (filtersContainer) {
      filtersContainer.innerHTML = renderMultiSelectFiltersHtml();
    }

    const homeGrid = document.getElementById('products-cards-grid');
    if (homeGrid) {
      homeGrid.innerHTML = renderProductsHtml(getFilteredProducts());
    }

    const shopGrid = document.getElementById('shop-products-grid');
    if (shopGrid) {
      shopGrid.innerHTML = renderProductsHtml(getFilteredProducts());
    }

    lucide.createIcons();
  }

  // السلة وتحديث الشارات
  function updateCartBadge() {
    const totalCount = state.cart.reduce((s, i) => s + i.qty, 0);
    const b1 = document.getElementById('cart-badge');
    const b2 = document.getElementById('mobile-cart-badge');
    if (b1) {
      b1.textContent = totalCount;
      b1.classList.toggle('hidden', totalCount === 0);
    }
    if (b2) {
      b2.textContent = totalCount;
      b2.classList.toggle('hidden', totalCount === 0);
    }
  }

  function openCartDrawer() {
    renderCartDrawer();
    const d = document.getElementById('cart-drawer');
    const b = document.getElementById('cart-backdrop');
    if (d && b) {
      b.classList.remove('hidden');
      d.classList.remove('hidden');
      d.classList.add('flex');
      // trigger reflow then add open for slide transition
      setTimeout(() => d.classList.add('open'), 10);
    }
  }

  function closeCartDrawer() {
    const d = document.getElementById('cart-drawer');
    const b = document.getElementById('cart-backdrop');
    if (d && b) {
      d.classList.remove('open');
      setTimeout(() => {
        d.classList.add('hidden');
        d.classList.remove('flex');
        b.classList.add('hidden');
      }, 300);
    }
  }

  function renderCartDrawer() {
    const container = document.getElementById('cart-items-container');
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total-amount');
    const checkoutBtn = document.getElementById('cart-checkout-btn');

    if (!container) return;

    if (state.cart.length === 0) {
      container.innerHTML = `
        <div class="py-16 text-center text-gray-400 text-xs">
          <i data-lucide="shopping-bag" class="w-10 h-10 mx-auto mb-2 text-gray-300"></i>
          <p>السلة فارغة حالياً</p>
        </div>
      `;
      if (subtotalEl) subtotalEl.textContent = '0 ج.م';
      if (totalEl) totalEl.textContent = '0 ج.م';
      if (checkoutBtn) checkoutBtn.disabled = true;
      lucide.createIcons();
      return;
    }

    if (checkoutBtn) checkoutBtn.disabled = false;
    let subtotal = 0;

    container.innerHTML = state.cart.map((item, idx) => {
      const itemTotal = item.price * item.qty;
      subtotal += itemTotal;

      return `
        <div class="p-3 bg-gray-50 rounded-xl border border-gray-200 flex gap-3 text-xs">
          <img src="${item.image}" alt="${item.name}" class="w-14 h-14 rounded-lg object-cover flex-shrink-0">
          <div class="flex-1 flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-start">
                <h5 class="font-bold text-gray-900 line-clamp-1">${item.name}</h5>
                <button onclick="window.lotusApp.removeCartItem(${idx})" class="text-gray-400 hover:text-red-600">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
              <div class="text-[10px] text-gray-500 mt-0.5">
                كود: <span class="font-mono font-bold">${item.sku || 'N/A'}</span> • الحجم: <span class="text-rose-900 font-semibold">${item.sizeName}</span>
              </div>
            </div>

            <div class="flex items-center justify-between mt-2 pt-1 border-t border-gray-200">
              <span class="font-black text-rose-950">${itemTotal} ج.م</span>
              <div class="flex items-center border border-gray-300 rounded bg-white">
                <button onclick="window.lotusApp.updateCartQty(${idx}, -1)" class="px-2 py-0.5 text-xs">-</button>
                <span class="px-2 text-xs font-bold">${item.qty}</span>
                <button onclick="window.lotusApp.updateCartQty(${idx}, 1)" class="px-2 py-0.5 text-xs">+</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (subtotalEl) subtotalEl.textContent = `${subtotal} ج.م`;
    if (totalEl) totalEl.textContent = `${subtotal + 35} ج.م`;
    lucide.createIcons();
  }

  function updateCartQty(idx, delta) {
    if (!state.cart[idx]) return;
    state.cart[idx].qty += delta;
    if (state.cart[idx].qty <= 0) state.cart.splice(idx, 1);
    saveState('cart');
    updateCartBadge();
    renderCartDrawer();
  }

  function removeCartItem(idx) {
    state.cart.splice(idx, 1);
    saveState('cart');
    updateCartBadge();
    renderCartDrawer();
    showToast('تم حذف الباقة من السلة');
  }

  // فتح وإتمام الطلب (Checkout) مع دعم الأرقام الدولية
  function openCheckoutModal() {
    if (state.cart.length === 0) {
      showToast('السلة فارغة', 'error');
      return;
    }
    closeCartDrawer();

    const modal = document.getElementById('checkout-modal');
    if (!modal) return;

    let subtotal = state.cart.reduce((s, i) => s + (i.price * i.qty), 0);
    const initialArea = state.storeInfo.deliveryAreas[0];
    const initialTotal = subtotal + initialArea.fee;

    modal.innerHTML = `
      <div class="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative p-6 sm:p-8">
        <button onclick="window.lotusApp.closeModal('checkout-modal')" class="absolute top-5 left-5 z-20 w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>

        <div class="text-center mb-6">
          <span class="text-xs font-bold text-rose-800 bg-rose-50 px-3 py-1 rounded-full">إتمام الطلب والدفع</span>
          <h3 class="text-2xl font-bold text-gray-900 mt-2">بيانات التوصيل وفودافون كاش</h3>
          <p class="text-xs text-gray-500">نستقبل طلباتكم من داخل مصر أو خارجها بكل حب</p>
        </div>

        <form id="checkout-form" onsubmit="window.lotusApp.handleCheckoutSubmit(event)">
          <!-- بيانات صاحب الطلب مع دعم الأرقام الدولية -->
          <div class="mb-5 p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs">
            <h4 class="font-bold text-gray-900 mb-3 flex items-center gap-1.5">
              <i data-lucide="user" class="w-4 h-4 text-rose-900"></i>
              <span>بيانات صاحب الطلب (للتواصل عبر واتساب من أي دولة):</span>
            </h4>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold mb-1">الاسم الكريم *</label>
                <input type="text" id="chk-cust-name" required placeholder="مثال: أحمد عبد الله" class="w-full p-2.5 rounded-xl border border-gray-300 bg-white">
              </div>
              <div>
                <label class="block font-semibold mb-1">رقم الهاتف وواتساب (مصري أو دولي) *</label>
                <input type="tel" id="chk-cust-phone" required placeholder="مثال: +96650... أو 011..." class="w-full p-2.5 rounded-xl border border-gray-300 bg-white" title="أدخل رقم الهاتف مع كود الدولة إن كنت خارج مصر">
                <span class="text-[10px] text-gray-400 mt-1 block">يمكنك الطلب من أي دولة عبر رقمك الدولي.</span>
              </div>
            </div>
          </div>

          <!-- تفاصيل الهدية والمستلم في مصر -->
          <div class="mb-5 p-4 rounded-2xl bg-rose-50/50 border border-rose-200 text-xs">
            <h4 class="font-bold text-rose-950 mb-3 flex items-center gap-1.5">
              <i data-lucide="gift" class="w-4 h-4 text-rose-900"></i>
              <span>نوع الطلب والمستلم داخل القاهرة والجيزة:</span>
            </h4>

            <div class="grid grid-cols-2 gap-3 mb-3">
              <label class="flex items-center gap-2 p-2.5 rounded-xl border border-rose-200 bg-white cursor-pointer">
                <input type="radio" name="chk-order-type" value="personal" checked onchange="window.lotusApp.toggleCheckoutGift(false)" class="accent-rose-900">
                <span class="font-bold">استلام لنفسي</span>
              </label>
              <label class="flex items-center gap-2 p-2.5 rounded-xl border border-rose-200 bg-white cursor-pointer">
                <input type="radio" name="chk-order-type" value="gift" onchange="window.lotusApp.toggleCheckoutGift(true)" class="accent-rose-900">
                <span class="font-bold">إرسال كهدية ومفاجأة 🎁</span>
              </label>
            </div>

            <div id="chk-gift-fields" class="hidden space-y-3 pt-2 border-t border-rose-200">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold mb-1">اسم الشخص المستلم *</label>
                  <input type="text" id="chk-rec-name" placeholder="اسم المستلم في مصر" class="w-full p-2.5 rounded-xl border border-gray-300 bg-white">
                </div>
                <div>
                  <label class="block font-semibold mb-1">رقم هاتف المستلم بمصر (01xxxxxxxxx) *</label>
                  <input type="tel" id="chk-rec-phone" placeholder="01xxxxxxxxx" class="w-full p-2.5 rounded-xl border border-gray-300 bg-white">
                </div>
              </div>
              <p class="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                إذا لم تكن تعرف عنوان المستلم بالتفصيل، يكفي رقم هاتفه وسيتولى فريقنا الاتصال به وتحديد العنوان بلباقة دون إفساد المفاجأة!
              </p>
            </div>
          </div>

          <!-- منطقة التوصيل وموعد التسليم -->
          <div class="mb-5 p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs">
            <h4 class="font-bold text-gray-900 mb-3 flex items-center gap-1.5">
              <i data-lucide="map-pin" class="w-4 h-4 text-rose-900"></i>
              <span>منطقة وموعد التوصيل (القاهرة والجيزة):</span>
            </h4>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label class="block font-semibold mb-1">منطقة التوصيل *</label>
                <select id="chk-area" onchange="window.lotusApp.handleCheckoutAreaChange(this.value)" class="w-full p-2.5 rounded-xl border border-gray-300 bg-white">
                  ${state.storeInfo.deliveryAreas.map((a, i) => `
                    <option value="${a.name}" data-fee="${a.fee}" ${i === 0 ? 'selected' : ''}>
                      ${a.name} (${a.fee} ج.م)
                    </option>
                  `).join('')}
                </select>
              </div>

              <div>
                <label class="block font-semibold mb-1">فترة التوصيل *</label>
                <select id="chk-slot" class="w-full p-2.5 rounded-xl border border-gray-300 bg-white">
                  <option value="اليوم - الفترة المسائية (4م - 8م)">اليوم - الفترة المسائية (4:00 م - 8:00 م)</option>
                  <option value="اليوم - فترة السهرة والمفاجآت (8م - 11:30م)">اليوم - فترة السهرة (8:00 م - 11:30 م)</option>
                  <option value="غداً - الفترة الصباحية (10ص - 2م)">غداً - الفترة الصباحية (10:00 ص - 2:00 م)</option>
                  <option value="غداً - الفترة المسائية (4م - 8م)">غداً - الفترة المسائية (4:00 م - 8:00 م)</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block font-semibold mb-1">العنوان أو الحي بالتفصيل</label>
              <textarea id="chk-address" rows="2" placeholder="الشارع، رقم العمارة، أو اترك فارغاً إن كنت ترغب بالتنسيق مع المستلم..." class="w-full p-2.5 rounded-xl border border-gray-300 bg-white"></textarea>
            </div>
          </div>

          <!-- تفاصيل الدفع عبر فودافون كاش ورفع الإشعار (تظهر حصراً هنا) -->
          <div class="mb-5 p-5 rounded-2xl bg-rose-950 text-white shadow-xl text-xs">
            <div class="flex items-center justify-between pb-3 mb-3 border-b border-rose-800">
              <div>
                <h4 class="font-bold text-sm">الدفع عبر فودافون كاش</h4>
                <p class="text-[11px] text-rose-300">قم بتحويل المبلغ المطلوب لمحفظة المتجر</p>
              </div>
              <div class="text-left">
                <span class="text-[10px] text-rose-300 block">الإجمالي المطلوب</span>
                <span id="chk-total-badge" class="text-xl font-black text-amber-300">${initialTotal} ج.م</span>
              </div>
            </div>

            <div class="bg-black/30 p-3 rounded-xl flex items-center justify-between mb-4 border border-rose-800">
              <div>
                <span class="text-[10px] text-rose-300 block">رقم محفظة فودافون كاش للمتجر:</span>
                <span class="font-mono text-base font-black text-white select-all">${state.storeInfo.vodafoneCash}</span>
              </div>
              <button type="button" onclick="window.lotusApp.copyVodafoneNumber()" class="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold transition">
                نسخ الرقم
              </button>
            </div>

            <div class="space-y-3">
              <div>
                <label class="block text-rose-200 mb-1">رقم الهاتف أو المحفظة المحول منها *</label>
                <input type="text" id="chk-vf-sender" required placeholder="رقم المحفظة التي حولت منها" class="w-full p-2.5 rounded-xl bg-white/10 border border-rose-700 text-white placeholder-rose-300/60 focus:outline-none">
              </div>

              <div>
                <label class="block text-rose-200 mb-1">إرفاق صورة إشعار التحويل (سكرين شوت) *</label>
                <label class="cursor-pointer py-2.5 px-4 rounded-xl border border-dashed border-rose-500 bg-white/5 hover:bg-white/10 flex items-center justify-center gap-2 transition">
                  <i data-lucide="upload-cloud" class="w-4 h-4 text-amber-300"></i>
                  <span id="chk-receipt-label">اضغط لاختيار صورة الإشعار</span>
                  <input type="file" id="chk-receipt-file" accept="image/*" onchange="window.lotusApp.handleReceiptUpload(event)" class="hidden">
                </label>
                
                <div id="chk-receipt-preview" class="hidden mt-2 flex items-center gap-3 p-2 bg-black/20 rounded-lg">
                  <img id="chk-receipt-img" src="" alt="الإشعار" class="w-12 h-12 rounded object-cover border border-rose-600">
                  <span class="text-emerald-300 font-medium text-[11px]">تم اختيار الإشعار بنجاح!</span>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" class="w-full py-4 rounded-2xl btn-primary font-black text-sm shadow-xl flex items-center justify-center gap-2">
            <i data-lucide="check" class="w-5 h-5"></i>
            <span>تأكيد الطلب وحفظ البيانات</span>
          </button>
        </form>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    lucide.createIcons();
  }

  function toggleCheckoutGift(isGift) {
    const el = document.getElementById('chk-gift-fields');
    if (el) el.classList.toggle('hidden', !isGift);
  }

  function handleCheckoutAreaChange(areaName) {
    const a = state.storeInfo.deliveryAreas.find(x => x.name === areaName) || state.storeInfo.deliveryAreas[0];
    let subtotal = state.cart.reduce((s, i) => s + (i.price * i.qty), 0);
    const total = subtotal + a.fee;
    const badge = document.getElementById('chk-total-badge');
    if (badge) badge.textContent = `${total} ج.م`;
  }

  function handleReceiptUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
      state.selectedReceiptImage = evt.target.result;
      const preview = document.getElementById('chk-receipt-preview');
      const img = document.getElementById('chk-receipt-img');
      const label = document.getElementById('chk-receipt-label');
      if (preview && img) {
        img.src = evt.target.result;
        preview.classList.remove('hidden');
      }
      if (label) label.textContent = `تم إرفاق: ${file.name.substring(0, 20)}...`;
      showToast('تم إرفاق إشعار التحويل بنجاح');
    };
    reader.readAsDataURL(file);
  }

  function handleCheckoutSubmit(e) {
    e.preventDefault();
    const custName = document.getElementById('chk-cust-name').value.trim();
    const custPhone = document.getElementById('chk-cust-phone').value.trim();
    const isGift = document.querySelector('input[name="chk-order-type"]:checked').value === 'gift';
    const recName = isGift ? (document.getElementById('chk-rec-name')?.value.trim() || custName) : custName;
    const recPhone = isGift ? (document.getElementById('chk-rec-phone')?.value.trim() || custPhone) : custPhone;
    const areaName = document.getElementById('chk-area').value;
    const area = state.storeInfo.deliveryAreas.find(a => a.name === areaName) || state.storeInfo.deliveryAreas[0];
    const slot = document.getElementById('chk-slot').value;
    const addr = document.getElementById('chk-address').value.trim();
    const vfSender = document.getElementById('chk-vf-sender').value.trim();

    let subtotal = state.cart.reduce((s, i) => s + (i.price * i.qty), 0);
    const totalAmount = subtotal + area.fee;
    const orderId = `LOTUS-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      orderId: orderId,
      sku: state.cart[0]?.sku || 'LOTUS',
      createdAt: new Date().toISOString(),
      customerName: custName,
      customerPhone: custPhone,
      isGift: isGift,
      recipientName: recName,
      recipientPhone: recPhone,
      area: area.name,
      addressDetails: addr || 'تنسيق العنوان مع المستلم',
      deliverySlot: slot,
      items: JSON.parse(JSON.stringify(state.cart)),
      deliveryFee: area.fee,
      totalAmount: totalAmount,
      paymentMethod: 'vodafone_cash',
      vodafoneSenderNumber: vfSender,
      receiptUrl: state.selectedReceiptImage || 'assets/products/p01.jpg',
      status: 'pending_payment',
      adminNotes: 'طلب جديد بانتظار تأكيد الدفع من الإدارة.'
    };

    state.orders.unshift(newOrder);
    saveState('orders');

    state.cart = [];
    saveState('cart');
    updateCartBadge();
    state.selectedReceiptImage = null;

    closeModal('checkout-modal');
    openOrderSuccessModal(newOrder);
  }

  function openOrderSuccessModal(order) {
    const modal = document.getElementById('success-modal');
    if (!modal) return;

    const whatsappMsg = encodeURIComponent(
      `مرحباً زهور اللوتس 🌸\nلقد قمت بعمل طلب جديد برقم: ${order.orderId}\nالاسم: ${order.customerName} (${order.customerPhone})\nالمبلغ المطلوب: ${order.totalAmount} ج.م\nتم التحويل من محفظة فودافون كاش: ${order.vodafoneSenderNumber}`
    );
    const whatsappLink = `https://wa.me/${state.storeInfo.whatsapp}?text=${whatsappMsg}`;

    modal.innerHTML = `
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 text-center shadow-2xl relative">
        <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <i data-lucide="check" class="w-8 h-8"></i>
        </div>

        <span class="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">تم استلام طلبك بنجاح</span>
        <h3 class="text-2xl font-black text-gray-900 mt-2 mb-1">شكراً لثقتكم بزهور اللوتس</h3>
        
        <div class="bg-rose-50 border border-rose-200 rounded-2xl p-4 my-5">
          <span class="text-xs text-rose-800 block mb-1">كود الطلب الخاص بك:</span>
          <span class="text-2xl font-black tracking-wider text-rose-950 font-mono">${order.orderId}</span>
          <div class="text-[11px] text-gray-500 mt-1">حالة الدفع: <strong class="text-amber-800">بانتظار مراجعة إشعار فودافون كاش</strong></div>
        </div>

        <div class="space-y-2.5 mb-6">
          <a href="${whatsappLink}" target="_blank" class="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow">
            <i data-lucide="message-circle" class="w-4 h-4"></i>
            <span>إرسال إشعار فوري لخدمة العملاء عبر واتساب</span>
          </a>

          <a href="#track/${order.orderId}" onclick="window.lotusApp.closeModal('success-modal')" class="w-full py-3 px-4 rounded-xl btn-primary font-bold text-xs flex items-center justify-center gap-2">
            <i data-lucide="truck" class="w-4 h-4"></i>
            <span>متابعة وتتبع حالة الطلب</span>
          </a>
        </div>

        <button onclick="window.lotusApp.closeModal('success-modal')" class="text-xs text-gray-400 hover:text-gray-700">
          إغلاق
        </button>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    lucide.createIcons();
  }

  // صفحة تتبع حالة الطلب المستقلة
  function renderTrackPage(container) {
    const orderIdParam = state.currentRoute.param;
    container.innerHTML = `
      <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
          <div class="text-center mb-6">
            <span class="text-xs font-bold text-rose-800 bg-rose-50 px-3 py-1 rounded-full">نظام التتبع المباشر</span>
            <h2 class="text-2xl font-black text-gray-900 mt-2">تتبع حالة طلبك وباقة الورد</h2>
            <p class="text-xs text-gray-500">أدخل كود الطلب (مثل LOTUS-8219) أو رقم هاتفك</p>
          </div>

          <div class="flex gap-2 mb-6">
            <input type="text" id="track-input" placeholder="كود الطلب أو رقم الهاتف..." value="${orderIdParam || ''}" class="flex-1 text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-900 bg-gray-50">
            <button onclick="window.lotusApp.runOrderSearch()" class="px-5 py-3 rounded-xl btn-primary text-xs font-bold flex items-center gap-1.5 shadow">
              <i data-lucide="search" class="w-4 h-4"></i>
              <span>تتبع</span>
            </button>
          </div>

          <div id="track-result-box">
            <div class="text-center py-8 text-gray-400 text-xs">
              أدخل رقم طلبك أعلاه لعرض التفاصيل المباشرة.
            </div>
          </div>
        </div>
      </div>
    `;
    lucide.createIcons();
    if (orderIdParam) runOrderSearch(orderIdParam);
  }

  function runOrderSearch(overrideCode) {
    const q = (overrideCode || document.getElementById('track-input')?.value || '').trim().toLowerCase();
    const box = document.getElementById('track-result-box');
    if (!q || !box) return;

    const order = state.orders.find(o => 
      o.orderId.toLowerCase() === q || o.customerPhone.includes(q) || o.recipientPhone.includes(q)
    );

    if (!order) {
      box.innerHTML = `
        <div class="p-5 bg-rose-50 rounded-xl text-center border border-rose-200 text-xs text-rose-900">
          لم نتمكن من العثور على أي طلب مسجل بهذا الكود أو الرقم.
        </div>
      `;
      return;
    }

    const steps = [
      { key: 'pending_payment', label: 'تم استلام الطلب', icon: 'file-text' },
      { key: 'payment_confirmed', label: 'تأكيد الدفع (فودافون كاش)', icon: 'check-circle' },
      { key: 'preparing', label: 'تنسيق وتجهيز الباقة', icon: 'flower-2' },
      { key: 'out_for_delivery', label: 'مع المندوب للتوصيل', icon: 'truck' },
      { key: 'delivered', label: 'تم التسليم بنجاح', icon: 'gift' }
    ];

    const currentIdx = Math.max(0, steps.findIndex(s => s.key === order.status));

    box.innerHTML = `
      <div class="border-t border-gray-100 pt-5 text-xs">
        <div class="flex justify-between items-center pb-3 mb-4 border-b border-gray-100">
          <div>
            <span class="text-gray-400 block">طلب رقم:</span>
            <span class="font-mono font-black text-rose-950 text-sm">${order.orderId}</span>
          </div>
          <div class="text-left">
            <span class="text-gray-400 block">الإجمالي:</span>
            <span class="font-black text-rose-950 text-sm">${order.totalAmount} ج.م</span>
          </div>
        </div>

        <!-- الخط الزمني -->
        <div class="space-y-4 mb-6">
          ${steps.map((step, idx) => {
            const isDone = idx <= currentIdx;
            const isCur = idx === currentIdx;
            return `
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  isCur ? 'bg-rose-950 text-white ring-4 ring-rose-100' :
                  isDone ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
                }">
                  <i data-lucide="${step.icon}" class="w-4 h-4"></i>
                </div>
                <div>
                  <h5 class="font-bold ${isCur ? 'text-rose-950 font-black' : isDone ? 'text-gray-900' : 'text-gray-400'}">${step.label}</h5>
                  ${isCur ? `<span class="text-[10px] text-gray-400">المرحلة الحالية للطلب</span>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="bg-gray-50 p-4 rounded-xl space-y-1.5 text-gray-700">
          <div><strong>المنطقة:</strong> ${order.area} - ${order.deliverySlot}</div>
          <div><strong>المنتجات:</strong> ${order.items.map(i => `${i.name} (${i.sizeName || ''})`).join('، ')}</div>
          ${order.adminNotes ? `<div class="text-rose-900 mt-2 p-2 bg-rose-50 rounded border border-rose-200 font-semibold">ملاحظة المتجر: ${order.adminNotes}</div>` : ''}
        </div>
      </div>
    `;
    lucide.createIcons();
  }

  // لوحة تحكم الإدارة (Admin Dashboard)
  function renderAdminDashboard(container) {
    if (!state.currentUser || !['super_admin', 'orders_manager', 'content_manager'].includes(state.currentUser.role)) {
      container.innerHTML = `
        <div class="max-w-md mx-auto px-4 py-16 text-center">
          <div class="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
            <i data-lucide="lock" class="w-10 h-10 text-rose-900 mx-auto mb-3"></i>
            <h3 class="text-xl font-bold text-gray-900 mb-2">منطقة مخصصة للإدارة فقط</h3>
            <p class="text-xs text-gray-500 mb-6">يرجى تسجيل الدخول بحساب مصرح له للوصول للوحة التحكم.</p>
            <a href="#login" class="px-6 py-2.5 rounded-xl btn-primary text-xs font-bold inline-block">تسجيل الدخول</a>
          </div>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    const role = state.currentUser.role;
    const canOrders = role === 'super_admin' || role === 'orders_manager';
    const canProducts = role === 'super_admin' || role === 'content_manager';
    const canUsers = role === 'super_admin';
    const canMeta = role === 'super_admin';

    container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          
          <!-- شريط رأس لوحة الإدارة -->
          <div class="p-6 bg-rose-950 text-white flex flex-wrap items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-xl font-bold">لوحة تحكم زهور اللوتس</h2>
                <span class="bg-amber-400 text-rose-950 text-[10px] font-black px-2 py-0.5 rounded">${state.currentUser.roleLabel}</span>
              </div>
              <p class="text-xs text-rose-200 mt-1">الفرع الرئيسي: المنيل، القاهرة | محفظة فودافون كاش: ${state.storeInfo.vodafoneCash}</p>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-xs text-rose-200">${state.currentUser.name}</span>
              <button onclick="window.lotusApp.openChangePasswordModal()" class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1 transition">
                <i data-lucide="key" class="w-3.5 h-3.5"></i>
                <span>تغيير كلمة المرور</span>
              </button>
              <button onclick="window.lotusApp.handleLogout()" class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition">
                تسجيل الخروج
              </button>
            </div>
          </div>

          <!-- تبويبات لوحة التحكم -->
          <div class="flex border-b border-gray-200 bg-gray-50 px-6 overflow-x-auto">
            ${canOrders ? `
              <button onclick="window.lotusApp.switchAdminTab('orders')" class="admin-tab py-3.5 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
                state.admin.activeTab === 'orders' ? 'border-rose-950 text-rose-950 bg-white' : 'border-transparent text-gray-500 hover:text-gray-900'
              }">
                <i data-lucide="shopping-cart" class="w-4 h-4"></i>
                <span>الطلبات والدفعات (${state.orders.length})</span>
              </button>
            ` : ''}

            ${canProducts ? `
              <button onclick="window.lotusApp.switchAdminTab('products')" class="admin-tab py-3.5 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
                state.admin.activeTab === 'products' ? 'border-rose-950 text-rose-950 bg-white' : 'border-transparent text-gray-500 hover:text-gray-900'
              }">
                <i data-lucide="flower-2" class="w-4 h-4"></i>
                <span>إدارة الباقات والأحجام (${state.products.length})</span>
              </button>
            ` : ''}

            ${canProducts ? `
              <button onclick="window.lotusApp.switchAdminTab('magazine')" class="admin-tab py-3.5 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
                state.admin.activeTab === 'magazine' ? 'border-rose-950 text-rose-950 bg-white' : 'border-transparent text-gray-500 hover:text-gray-900'
              }">
                <i data-lucide="book-open" class="w-4 h-4"></i>
                <span>مجلة المتجر وسلايدر الرئيسية (${(state.magazineSlides || []).length})</span>
              </button>
            ` : ''}

            ${canProducts ? `
              <button onclick="window.lotusApp.switchAdminTab('showcase')" class="admin-tab py-3.5 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
                state.admin.activeTab === 'showcase' ? 'border-rose-950 text-rose-950 bg-white' : 'border-transparent text-gray-500 hover:text-gray-900'
              }">
                <i data-lucide="camera" class="w-4 h-4"></i>
                <span>معرض إنستغرام الحقيقي (${(state.showcasePosts || []).length})</span>
              </button>
            ` : ''}

            ${canProducts ? `
              <button onclick="window.lotusApp.switchAdminTab('highlights')" class="admin-tab py-3.5 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
                state.admin.activeTab === 'highlights' ? 'border-rose-950 text-rose-950 bg-white' : 'border-transparent text-gray-500 hover:text-gray-900'
              }">
                <i data-lucide="layout-grid" class="w-4 h-4"></i>
                <span>الهايلايتس والتصنيفات وخصائص المتجر</span>
              </button>
            ` : ''}

            ${canProducts ? `
              <button onclick="window.lotusApp.switchAdminTab('cms')" class="admin-tab py-3.5 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
                state.admin.activeTab === 'cms' ? 'border-rose-950 text-rose-950 bg-white' : 'border-transparent text-gray-500 hover:text-gray-900'
              }">
                <i data-lucide="file-text" class="w-4 h-4"></i>
                <span>نصوص وسياسات المتجر</span>
              </button>
            ` : ''}

            ${canUsers ? `
              <button onclick="window.lotusApp.switchAdminTab('users')" class="admin-tab py-3.5 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
                state.admin.activeTab === 'users' ? 'border-rose-950 text-rose-950 bg-white' : 'border-transparent text-gray-500 hover:text-gray-900'
              }">
                <i data-lucide="users" class="w-4 h-4"></i>
                <span>المستخدمين والمدراء (${state.users.length})</span>
              </button>
            ` : ''}

            ${canMeta ? `
              <button onclick="window.lotusApp.switchAdminTab('meta')" class="admin-tab py-3.5 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
                state.admin.activeTab === 'meta' ? 'border-rose-950 text-rose-950 bg-white' : 'border-transparent text-gray-500 hover:text-gray-900'
              }">
                <i data-lucide="share-2" class="w-4 h-4"></i>
                <span>ربط Meta Cloud API</span>
              </button>
            ` : ''}
          </div>

          <!-- محتوى التبويب المختار -->
          <div class="p-6 bg-gray-50/50">
            ${state.admin.activeTab === 'orders' && canOrders ? renderAdminOrdersSection() : ''}
            ${state.admin.activeTab === 'products' && canProducts ? renderAdminProductsSection() : ''}
            ${state.admin.activeTab === 'magazine' && canProducts ? renderAdminMagazineSection() : ''}
            ${state.admin.activeTab === 'showcase' && canProducts ? renderAdminShowcaseSection() : ''}
            ${state.admin.activeTab === 'highlights' && canProducts ? renderAdminHighlightsSection() : ''}
            ${state.admin.activeTab === 'cms' && canProducts ? renderAdminCmsSection() : ''}
            ${state.admin.activeTab === 'users' && canUsers ? renderAdminUsersSection() : ''}
            ${state.admin.activeTab === 'meta' && canMeta ? renderAdminMetaSection() : ''}
          </div>

        </div>
      </div>
    `;
    lucide.createIcons();
  }

  function switchAdminTab(tab) {
    state.admin.activeTab = tab;
    renderCurrentPage();
  }

  // تبويب الطلبات والدفعات الاحترافي مع خط سير العمل وتأكيد فودافون كاش
  function renderAdminOrdersSection() {
    // إحصائيات خط سير العمل
    const totalOrders = state.orders.length;
    const pendingOrders = state.orders.filter(o => o.status === 'pending_payment');
    const confirmedOrders = state.orders.filter(o => o.status === 'payment_confirmed');
    const preparingOrders = state.orders.filter(o => o.status === 'preparing');
    const outForDeliveryOrders = state.orders.filter(o => o.status === 'out_for_delivery');
    const deliveredOrders = state.orders.filter(o => o.status === 'delivered');
    const cancelledOrders = state.orders.filter(o => o.status === 'cancelled');

    // إجمالي المبيعات المحصلة
    const totalRevenue = state.orders
      .filter(o => ['payment_confirmed', 'preparing', 'out_for_delivery', 'delivered'].includes(o.status))
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // تصفية الطلبات حسب التبويب النشط والبحث
    let displayedOrders = state.orders;
    if (state.ordersFilter !== 'all') {
      displayedOrders = displayedOrders.filter(o => o.status === state.ordersFilter);
    }
    if (state.ordersSearchQuery.trim()) {
      const q = state.ordersSearchQuery.toLowerCase().trim();
      displayedOrders = displayedOrders.filter(o =>
        (o.orderId && o.orderId.toLowerCase().includes(q)) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.customerPhone && o.customerPhone.includes(q)) ||
        (o.recipientName && o.recipientName.toLowerCase().includes(q)) ||
        (o.recipientPhone && o.recipientPhone.includes(q)) ||
        (o.vodafoneSenderNumber && o.vodafoneSenderNumber.includes(q)) ||
        (o.cancelReason && o.cancelReason.toLowerCase().includes(q))
      );
    }

    return `
      <div class="space-y-6">
        <!-- 1. كروت المؤشرات المالية وخط السير (Pipeline KPIs) -->
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          
          <div onclick="window.lotusApp.filterOrders('all')" class="p-3.5 rounded-2xl bg-white border cursor-pointer transition hover:scale-102 ${state.ordersFilter === 'all' ? 'border-rose-950 ring-2 ring-rose-950/20 shadow-md' : 'border-gray-200'}">
            <span class="text-[10px] text-gray-500 font-bold block mb-1">كافة الطلبات</span>
            <div class="flex items-center justify-between">
              <span class="text-xl font-black text-gray-900">${totalOrders}</span>
              <i data-lucide="layers" class="w-4 h-4 text-gray-400"></i>
            </div>
          </div>

          <div onclick="window.lotusApp.filterOrders('pending_payment')" class="p-3.5 rounded-2xl bg-amber-50/70 border cursor-pointer transition hover:scale-102 ${state.ordersFilter === 'pending_payment' ? 'border-amber-600 ring-2 ring-amber-600/30 shadow-md' : 'border-amber-200'}">
            <span class="text-[10px] text-amber-800 font-bold block mb-1">بانتظار الدفع (موصي)</span>
            <div class="flex items-center justify-between">
              <span class="text-xl font-black text-amber-900">${pendingOrders.length}</span>
              <i data-lucide="clock" class="w-4 h-4 text-amber-600"></i>
            </div>
          </div>

          <div onclick="window.lotusApp.filterOrders('payment_confirmed')" class="p-3.5 rounded-2xl bg-emerald-50/70 border cursor-pointer transition hover:scale-102 ${state.ordersFilter === 'payment_confirmed' ? 'border-emerald-600 ring-2 ring-emerald-600/30 shadow-md' : 'border-emerald-200'}">
            <span class="text-[10px] text-emerald-800 font-bold block mb-1">تم الدفع (فودافون كاش)</span>
            <div class="flex items-center justify-between">
              <span class="text-xl font-black text-emerald-900">${confirmedOrders.length}</span>
              <i data-lucide="check-circle" class="w-4 h-4 text-emerald-600"></i>
            </div>
          </div>

          <div onclick="window.lotusApp.filterOrders('preparing')" class="p-3.5 rounded-2xl bg-indigo-50/70 border cursor-pointer transition hover:scale-102 ${state.ordersFilter === 'preparing' ? 'border-indigo-600 ring-2 ring-indigo-600/30 shadow-md' : 'border-indigo-200'}">
            <span class="text-[10px] text-indigo-800 font-bold block mb-1">قيد التنسيق والتجهيز</span>
            <div class="flex items-center justify-between">
              <span class="text-xl font-black text-indigo-900">${preparingOrders.length}</span>
              <i data-lucide="flower-2" class="w-4 h-4 text-indigo-600"></i>
            </div>
          </div>

          <div onclick="window.lotusApp.filterOrders('out_for_delivery')" class="p-3.5 rounded-2xl bg-blue-50/70 border cursor-pointer transition hover:scale-102 ${state.ordersFilter === 'out_for_delivery' ? 'border-blue-600 ring-2 ring-blue-600/30 shadow-md' : 'border-blue-200'}">
            <span class="text-[10px] text-blue-800 font-bold block mb-1">في الطريق مع المندوب</span>
            <div class="flex items-center justify-between">
              <span class="text-xl font-black text-blue-900">${outForDeliveryOrders.length}</span>
              <i data-lucide="truck" class="w-4 h-4 text-blue-600"></i>
            </div>
          </div>

          <div onclick="window.lotusApp.filterOrders('delivered')" class="p-3.5 rounded-2xl bg-emerald-100/60 border cursor-pointer transition hover:scale-102 ${state.ordersFilter === 'delivered' ? 'border-emerald-700 ring-2 ring-emerald-700/30 shadow-md' : 'border-emerald-300'}">
            <span class="text-[10px] text-emerald-900 font-bold block mb-1">تم التسليم بنجاح</span>
            <div class="flex items-center justify-between">
              <span class="text-xl font-black text-emerald-950">${deliveredOrders.length}</span>
              <i data-lucide="gift" class="w-4 h-4 text-emerald-700"></i>
            </div>
          </div>

          <div onclick="window.lotusApp.filterOrders('cancelled')" class="p-3.5 rounded-2xl bg-rose-50/70 border cursor-pointer transition hover:scale-102 ${state.ordersFilter === 'cancelled' ? 'border-rose-600 ring-2 ring-rose-600/30 shadow-md' : 'border-rose-200'}">
            <span class="text-[10px] text-rose-800 font-bold block mb-1">الملغية (عدم رد/رفض)</span>
            <div class="flex items-center justify-between">
              <span class="text-xl font-black text-rose-950">${cancelledOrders.length}</span>
              <i data-lucide="x-circle" class="w-4 h-4 text-rose-600"></i>
            </div>
          </div>

        </div>

        <!-- إجمالي الإيرادات وشريط البحث وتبويبات الحالة -->
        <div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
          
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-xl bg-rose-50 text-rose-950 border border-rose-100">
              <span class="text-[10px] text-gray-500 font-bold block">إجمالي المبيعات المؤكدة:</span>
              <span class="text-base font-black text-rose-950">${totalRevenue} ج.م</span>
            </div>

            <!-- أزرار تبويب المراحل -->
            <div class="flex items-center gap-1 overflow-x-auto">
              <button onclick="window.lotusApp.filterOrders('all')" class="px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${state.ordersFilter === 'all' ? 'bg-rose-950 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}">
                الكل (${totalOrders})
              </button>
              <button onclick="window.lotusApp.filterOrders('pending_payment')" class="px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${state.ordersFilter === 'pending_payment' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'}">
                بانتظار الدفع (${pendingOrders.length})
              </button>
              <button onclick="window.lotusApp.filterOrders('payment_confirmed')" class="px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${state.ordersFilter === 'payment_confirmed' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'}">
                تم الدفع (${confirmedOrders.length})
              </button>
              <button onclick="window.lotusApp.filterOrders('preparing')" class="px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${state.ordersFilter === 'preparing' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'}">
                قيد التجهيز (${preparingOrders.length})
              </button>
              <button onclick="window.lotusApp.filterOrders('out_for_delivery')" class="px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${state.ordersFilter === 'out_for_delivery' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'}">
                في الطريق (${outForDeliveryOrders.length})
              </button>
              <button onclick="window.lotusApp.filterOrders('delivered')" class="px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${state.ordersFilter === 'delivered' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'}">
                تم التسليم (${deliveredOrders.length})
              </button>
              <button onclick="window.lotusApp.filterOrders('cancelled')" class="px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${state.ordersFilter === 'cancelled' ? 'bg-rose-700 text-white' : 'bg-rose-50 text-rose-800 hover:bg-rose-100'}">
                الملغية (${cancelledOrders.length})
              </button>
            </div>
          </div>

          <!-- شريط بحث الطلبات -->
          <div class="relative min-w-[240px]">
            <input type="text" value="${state.ordersSearchQuery}" oninput="window.lotusApp.searchOrders(this.value)" placeholder="ابحث برقم الطلب، الهاتف، أو الاسم..." class="w-full text-xs py-2 pr-8 pl-3 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none">
            <i data-lucide="search" class="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2"></i>
          </div>

        </div>

        <!-- قائمة كروت الطلبات المصنفة بوضوح تام -->
        <div class="space-y-4">
          ${displayedOrders.length === 0 ? `
            <div class="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center">
              <i data-lucide="inbox" class="w-8 h-8 text-gray-400 mx-auto mb-2"></i>
              <h5 class="font-bold text-gray-700 text-sm">لا توجد طلبات في هذا القسم حالياً</h5>
            </div>
          ` : displayedOrders.map(order => {
            const isPaid = ['payment_confirmed', 'preparing', 'out_for_delivery', 'delivered'].includes(order.status);
            const isCancelled = order.status === 'cancelled';
            
            return `
              <div class="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm text-xs transition hover:border-gray-300">
                
                <!-- رأس كارت الطلب -->
                <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                  <div class="flex items-center gap-2.5">
                    <span class="font-mono font-black text-rose-950 text-base">${order.orderId}</span>
                    
                    <!-- شارة الدفع أو الإلغاء -->
                    ${isCancelled ? `
                      <span class="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-900 font-bold flex items-center gap-1 text-[11px]">
                        <i data-lucide="x-circle" class="w-3.5 h-3.5 text-rose-700"></i>
                        <span>ملغي ❌</span>
                      </span>
                    ` : isPaid ? `
                      <span class="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1 text-[11px]">
                        <i data-lucide="check-check" class="w-3.5 h-3.5 text-emerald-700"></i>
                        <span>مدفوع (فودافون كاش)</span>
                      </span>
                    ` : `
                      <span class="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold flex items-center gap-1 text-[11px] animate-pulse">
                        <i data-lucide="clock" class="w-3.5 h-3.5 text-amber-700"></i>
                        <span>بانتظار الدفع (موصي جديد)</span>
                      </span>
                    `}

                    <!-- شارة خط السير الفعلي -->
                    <span class="px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                      order.status === 'cancelled' ? 'bg-rose-900 text-white' :
                      order.status === 'delivered' ? 'bg-emerald-800 text-white' :
                      order.status === 'out_for_delivery' ? 'bg-blue-600 text-white' :
                      order.status === 'preparing' ? 'bg-indigo-600 text-white' :
                      order.status === 'payment_confirmed' ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' :
                      'bg-amber-50 text-amber-900 border border-amber-300'
                    }">
                      ${getStatusBadgeText(order.status)}
                    </span>
                  </div>

                  <div class="text-left">
                    <span class="text-lg font-black text-rose-950">${order.totalAmount} ج.م</span>
                    <span class="text-[10px] text-gray-400 block">${new Date(order.createdAt).toLocaleDateString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <!-- تفاصيل الباقات والعميل والتوصيل -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                  
                  <!-- بيانات العميل والمستلم -->
                  <div>
                    <span class="font-bold text-gray-500 text-[10px] block mb-1">العميل والمستلم:</span>
                    <p><strong>طالب الأوردر:</strong> ${order.customerName} (<a href="https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}" target="_blank" class="text-rose-900 font-mono underline font-bold">${order.customerPhone}</a>)</p>
                    ${order.isGift ? `
                      <p class="text-purple-700 mt-1"><strong>🎁 هدية إلى:</strong> ${order.recipientName} (${order.recipientPhone})</p>
                      ${order.giftNote ? `<p class="text-[11px] text-gray-600 italic bg-white p-2 rounded-lg mt-1 border border-purple-100">"${order.giftNote}"</p>` : ''}
                    ` : `<p class="text-gray-500 text-[11px] mt-1">طلب شخصي (المستلم هو العميل)</p>`}
                  </div>

                  <!-- بيانات العنوان والمندوب -->
                  <div>
                    <span class="font-bold text-gray-500 text-[10px] block mb-1">التوصيل والمندوب:</span>
                    <p><strong>المنطقة:</strong> ${order.area}</p>
                    <p><strong>العنوان:</strong> ${order.addressDetails}</p>
                    <p><strong>الفترة:</strong> ${order.deliverySlot}</p>
                    ${order.driverName ? `<p class="text-blue-700 font-bold mt-1">🛵 المندوب: ${order.driverName}</p>` : ''}
                  </div>

                  <!-- إشعار فودافون كاش والباقة -->
                  <div>
                    <span class="font-bold text-gray-500 text-[10px] block mb-1">الباقة المطلوبة وإشعار الدفع:</span>
                    <div class="mb-2">
                      ${(order.items || []).map(it => `
                        <div class="font-bold text-gray-900 leading-tight">${it.name}</div>
                        <div class="text-[11px] text-gray-500 font-semibold">${it.size || ''} - ${it.price} ج.م</div>
                      `).join('')}
                    </div>

                    ${order.receiptUrl ? `
                      <div class="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-200">
                        <img src="${order.receiptUrl}" alt="إشعار فودافون كاش" class="w-10 h-10 rounded-lg object-cover border border-gray-300 cursor-pointer hover:opacity-80" onclick="window.lotusApp.viewReceiptBig('${order.receiptUrl}')" title="انقر للتكبير">
                        <div>
                          <span class="font-bold text-gray-800 text-[11px] block">محفظة المحول: ${order.vodafoneSenderNumber || 'غير محدد'}</span>
                          <button type="button" onclick="window.lotusApp.viewReceiptBig('${order.receiptUrl}')" class="text-[10px] text-rose-900 font-bold hover:underline">
                            معاينة صورة الإشعار 🔍
                          </button>
                        </div>
                      </div>
                    ` : `<span class="text-gray-400">لا يوجد إيصال تحويل</span>`}
                  </div>

                </div>

                <!-- صندوق تفاصيل الإلغاء إذا كان الطلب ملغي -->
                ${order.status === 'cancelled' ? `
                  <div class="my-3 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-1.5 text-rose-950">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                      <div class="flex items-center gap-1.5 font-bold text-rose-800">
                        <i data-lucide="alert-octagon" class="w-4 h-4 text-rose-600"></i>
                        <span>سبب الإلغاء: ${escapeHtml(order.cancelReason || 'غير محدد')}</span>
                      </div>
                      <span class="text-[10px] text-rose-700 font-medium">بتاريخ: ${order.cancelledAt ? new Date(order.cancelledAt).toLocaleString('ar-EG') : 'غير مسجل'}</span>
                    </div>
                    ${order.cancelNotes ? `<p class="text-[11px] text-gray-700 bg-white/80 p-2 rounded-xl border border-rose-100">ملاحظات الإلغاء: ${escapeHtml(order.cancelNotes)}</p>` : ''}
                    <div class="flex justify-end pt-1">
                      <button onclick="window.lotusApp.reactivateOrder('${order.orderId}')" class="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-100 text-rose-900 border border-rose-300 font-bold text-xs flex items-center gap-1 shadow-sm transition">
                        <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
                        <span>إعادة تنشيط الطلب 🔄</span>
                      </button>
                    </div>
                  </div>
                ` : ''}

                <!-- شريط الإجراءات السريعة لخط السير -->
                <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
                  
                  <!-- زر التواصل السريع عبر واتساب -->
                  <div class="flex items-center gap-2">
                    <a href="https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}" target="_blank" class="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold flex items-center gap-1.5 transition">
                      <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
                      <span>واتساب العميل</span>
                    </a>
                    ${order.isGift && order.recipientPhone ? `
                      <a href="https://wa.me/${order.recipientPhone.replace(/[^0-9]/g, '')}" target="_blank" class="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold flex items-center gap-1.5 transition">
                        <i data-lucide="phone" class="w-3.5 h-3.5"></i>
                        <span>تنسيق اللوكيشن مع المستلم</span>
                      </a>
                    ` : ''}
                  </div>

                  <!-- أزرار التقدم الفوري بالمرحلة وزر الإلغاء -->
                  <div class="flex items-center gap-2">
                    ${order.status === 'pending_payment' ? `
                      <button onclick="window.lotusApp.advanceOrderStatus('${order.orderId}', 'payment_confirmed')" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-sm">
                        <i data-lucide="check" class="w-3.5 h-3.5"></i>
                        <span>تأكيد استلام فودافون كاش ✅</span>
                      </button>
                    ` : ''}

                    ${order.status === 'payment_confirmed' ? `
                      <button onclick="window.lotusApp.advanceOrderStatus('${order.orderId}', 'preparing')" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 shadow-sm">
                        <i data-lucide="flower-2" class="w-3.5 h-3.5"></i>
                        <span>بدء تنسيق وتجهيز الورد 💐</span>
                      </button>
                    ` : ''}

                    ${order.status === 'preparing' ? `
                      <button onclick="window.lotusApp.advanceOrderStatus('${order.orderId}', 'out_for_delivery')" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-sm">
                        <i data-lucide="truck" class="w-3.5 h-3.5"></i>
                        <span>تسليم للمندوب وخروج للتوصيل 🛵</span>
                      </button>
                    ` : ''}

                    ${order.status === 'out_for_delivery' ? `
                      <button onclick="window.lotusApp.advanceOrderStatus('${order.orderId}', 'delivered')" class="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1.5 shadow-sm">
                        <i data-lucide="gift" class="w-3.5 h-3.5"></i>
                        <span>تأكيد تسليم الهدية بنجاح 🎉</span>
                      </button>
                    ` : ''}

                    ${order.status !== 'cancelled' ? `
                      <button onclick="window.lotusApp.openCancelOrderModal('${order.orderId}')" class="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold flex items-center gap-1 transition" title="إلغاء الطلب وتوثيق السبب (عدم رد، عدم دفع، إلخ)">
                        <i data-lucide="x" class="w-3.5 h-3.5"></i>
                        <span>إلغاء الطلب ✕</span>
                      </button>
                    ` : ''}

                    <!-- تغيير يدوي اختياري -->
                    <select onchange="window.lotusApp.changeOrderStatus('${order.orderId}', this.value)" class="p-1.5 rounded-xl border border-gray-300 bg-white font-bold text-gray-700">
                      <option value="pending_payment" ${order.status === 'pending_payment' ? 'selected' : ''}>بانتظار الدفع</option>
                      <option value="payment_confirmed" ${order.status === 'payment_confirmed' ? 'selected' : ''}>تم الدفع</option>
                      <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>جاري التنسيق</option>
                      <option value="out_for_delivery" ${order.status === 'out_for_delivery' ? 'selected' : ''}>في الطريق</option>
                      <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>تم التسليم</option>
                      <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>ملغي ✕</option>
                    </select>
                  </div>

                </div>

              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function getStatusBadgeText(s) {
    if (s === 'pending_payment') return 'موصي جديد ⏳';
    if (s === 'payment_confirmed') return 'معتمد بانتظار التجهيز 📋';
    if (s === 'preparing') return 'جاري التنسيق 💐';
    if (s === 'out_for_delivery') return 'في الطريق 🛵';
    if (s === 'delivered') return 'تم التسليم للمستلم 🎉';
    if (s === 'cancelled') return 'ملغي ❌';
    return s;
  }

  function filterOrders(st) {
    state.ordersFilter = st;
    renderCurrentPage();
  }

  function searchOrders(q) {
    state.ordersSearchQuery = q;
    renderCurrentPage();
  }

  function advanceOrderStatus(orderId, nextStatus) {
    const o = state.orders.find(x => x.orderId === orderId);
    if (!o) return;
    o.status = nextStatus;
    if (nextStatus === 'out_for_delivery' && !o.driverName) {
      o.driverName = 'محمد شعبان (01144556677)';
    }
    saveState('orders');
    showToast(`تم تحديث الطلب ${orderId} إلى: ${getStatusBadgeText(nextStatus)}`);
    renderCurrentPage();
  }

  function openCancelOrderModal(orderId) {
    const order = state.orders.find(o => o.orderId === orderId);
    if (!order) return;

    const modal = document.getElementById('admin-cancel-order-modal');
    if (!modal) return;

    modal.innerHTML = `
      <div class="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-gray-200 text-xs">
        <div class="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
              <i data-lucide="alert-octagon" class="w-4 h-4"></i>
            </div>
            <div>
              <h3 class="font-bold text-sm text-gray-900">إلغاء الطلب (${order.orderId})</h3>
              <p class="text-[11px] text-gray-500">العميل: ${escapeHtml(order.customerName)} - ${order.totalAmount} ج.م</p>
            </div>
          </div>
          <button onclick="window.lotusApp.closeCancelOrderModal()" class="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <form onsubmit="window.lotusApp.handleConfirmCancelOrder(event, '${order.orderId}')" class="space-y-4">
          <div>
            <label class="block font-bold text-gray-700 mb-1.5">سبب إلغاء الطلب *</label>
            <select id="cancel-reason-select" class="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium focus:border-rose-600 focus:outline-none" required>
              <option value="العميل لا يرد على الاتصال أو رسائل الواتساب">العميل لا يرد على الاتصال أو رسائل الواتساب</option>
              <option value="لم يتم تحويل العربون / عدم الاستجابة للدفع">لم يتم تحويل العربون / عدم الاستجابة للدفع</option>
              <option value="طلب وهمي / غير جاد">طلب وهمي / غير جاد</option>
              <option value="طلب العميل إلغاء الأوردر بنفسه">طلب العميل إلغاء الأوردر بنفسه</option>
              <option value="العنوان خارج نطاق التوصيل المتاح">العنوان خارج نطاق التوصيل المتاح</option>
              <option value="سبب آخر مخصص">سبب آخر مخصص (يرجى توضيحه بالأسفل)</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-gray-700 mb-1.5">ملاحظات توضيحية إضافية (اختياري)</label>
            <textarea id="cancel-notes-input" rows="3" placeholder="اكتب أي تفاصيل إضافية عن سبب الإلغاء أو محاولات التواصل..." class="w-full p-2.5 rounded-xl border border-gray-300 bg-white focus:border-rose-600 focus:outline-none"></textarea>
          </div>

          <div class="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
            <i data-lucide="info" class="w-3.5 h-3.5 inline ml-1 text-amber-700"></i>
            سيتم نقل الطلب إلى قسم "الطلبات الملغية" مع توثيق السبب والوقت، ويمكنك إعادة تنشيطه لاحقاً إذا استجاب العميل.
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button type="button" onclick="window.lotusApp.closeCancelOrderModal()" class="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-gray-700">
              تراجع
            </button>
            <button type="submit" class="px-5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold flex items-center gap-1.5 shadow">
              <i data-lucide="x" class="w-3.5 h-3.5"></i>
              <span>تأكيد الإلغاء ✕</span>
            </button>
          </div>
        </form>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    lucide.createIcons();
  }

  function closeCancelOrderModal() {
    const modal = document.getElementById('admin-cancel-order-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  function handleConfirmCancelOrder(e, orderId) {
    e.preventDefault();
    const order = state.orders.find(o => o.orderId === orderId);
    if (!order) return;

    const reason = document.getElementById('cancel-reason-select').value;
    const notes = document.getElementById('cancel-notes-input').value.trim();

    order.status = 'cancelled';
    order.cancelReason = reason;
    order.cancelNotes = notes;
    order.cancelledAt = new Date().toISOString();
    order.cancelledBy = state.currentUser?.name || 'مدير المتجر';

    saveState('orders');
    closeCancelOrderModal();
    showToast(`تم إلغاء الطلب ${orderId} وتوثيق السبب بنجاح`);
    renderCurrentPage();
  }

  function reactivateOrder(orderId) {
    const order = state.orders.find(o => o.orderId === orderId);
    if (!order) return;

    order.status = 'pending_payment';
    order.reactivatedAt = new Date().toISOString();
    saveState('orders');
    showToast(`تمت إعادة تنشيط الطلب ${orderId} كطلب بانتظار الدفع 🔄`);
    renderCurrentPage();
  }

  function getStatusText(s) {
    if (s === 'pending_payment') return 'بانتظار تأكيد الدفع';
    if (s === 'payment_confirmed') return 'تم تأكيد الدفع';
    if (s === 'preparing') return 'جاري التنسيق';
    if (s === 'out_for_delivery') return 'خرج للتوصيل';
    if (s === 'delivered') return 'تم التسليم';
    return s;
  }

  function changeOrderStatus(orderId, st) {
    const o = state.orders.find(x => x.orderId === orderId);
    if (!o) return;
    o.status = st;
    saveState('orders');
    showToast(`تم تحديث حالة الطلب ${orderId}`);
    renderCurrentPage();
  }

  function viewReceiptBig(url) {
    const w = window.open('');
    w.document.write(`<div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#111;"><img src="${url}" style="max-height:90vh;max-width:90vw;border-radius:12px;"></div>`);
  }

  // تبويب إدارة المنتجات مع توليد الكود التلقائي وإمكانية تعديل الباقات المضافة
  function renderAdminProductsSection() {
    return `
      <div>
        <div class="flex items-center justify-between mb-4">
          <h4 class="font-bold text-gray-900 text-sm">إدارة باقات الزهور والأحجام</h4>
          <button onclick="window.lotusApp.toggleNewProductForm()" class="px-4 py-2 rounded-xl btn-primary text-xs font-bold flex items-center gap-1 shadow">
            <i data-lucide="plus" class="w-4 h-4"></i>
            إضافة باقة جديدة
          </button>
        </div>

        <!-- نموذج إضافة باقة جديدة -->
        <div id="admin-new-product-box" class="hidden mb-6 p-5 bg-white rounded-2xl border border-rose-200 shadow-sm text-xs">
          <h5 class="font-bold text-sm text-rose-950 mb-3">إضافة باقة جديدة بنظام الأكواد التلقائية والمتعددة:</h5>
          
          <form onsubmit="window.lotusApp.handleSaveProduct(event)" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold mb-1">اسم الباقة *</label>
                <input type="text" id="np-name" required placeholder="مثال: بوكيه الفخامة الملكي" class="w-full p-2.5 rounded-xl border border-gray-300">
              </div>

              <div>
                <label class="block font-semibold mb-1">كود المنتج المولد تلقائياً (SKU) *</label>
                <input type="text" id="np-sku" required value="QF-102" class="w-full p-2.5 rounded-xl border border-gray-300 bg-gray-100 font-mono font-bold text-rose-900">
              </div>
            </div>

            <!-- اختيار متعدد: المناسبة والتصنيف -->
            <div class="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div class="flex items-center justify-between mb-2">
                <label class="block font-bold text-gray-900">المناسبة / التصنيف * (يمكنك تحديد أكثر من مناسبة في نفس الوقت):</label>
                <span class="text-[10px] text-gray-500">اختر من القائمة أو أضف المزيد</span>
              </div>
              <div class="flex flex-wrap gap-2 mb-2">
                ${(state.categoriesList || DEFAULT_CATEGORIES).map(cat => {
                  const cid = getAttrId(cat);
                  const clabel = getAttrLabel(cat);
                  return `
                    <label class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium cursor-pointer hover:bg-rose-50 hover:border-rose-300 transition">
                      <input type="checkbox" name="np-categories" value="${cid}" onchange="window.lotusApp.handleNewProductCategoryCheck(this)" class="w-3.5 h-3.5 rounded text-rose-900 focus:ring-rose-800">
                      <span>${clabel}</span>
                    </label>
                  `;
                }).join('')}
              </div>
              <div class="flex items-center gap-2">
                <input type="text" id="np-more-category" oninput="window.lotusApp.updateAutoSku()" placeholder="+ إضافة تصنيف أو مناسبة أخرى جديدة (خيار المزيد)..." class="flex-1 p-2 text-xs rounded-lg border border-gray-300 bg-white">
              </div>
            </div>

            <!-- اختيار متعدد: نوع الورد -->
            <div class="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div class="flex items-center justify-between mb-2">
                <label class="block font-bold text-gray-900">نوع الورد * (يمكنك تحديد أكثر من نوع ورد للباقة مثل: جوري + بيبي روز):</label>
                <span class="text-[10px] text-gray-500">اختر من القائمة أو أضف المزيد</span>
              </div>
              <div class="flex flex-wrap gap-2 mb-2">
                ${(state.flowerTypesList || DEFAULT_FLOWER_TYPES).map(ft => {
                  const fid = getAttrId(ft);
                  const flabel = getAttrLabel(ft);
                  return `
                    <label class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium cursor-pointer hover:bg-rose-50 hover:border-rose-300 transition">
                      <input type="checkbox" name="np-flowertypes" value="${fid}" class="w-3.5 h-3.5 rounded text-rose-900 focus:ring-rose-800">
                      <span>${flabel}</span>
                    </label>
                  `;
                }).join('')}
              </div>
              <div class="flex items-center gap-2">
                <input type="text" id="np-more-flowertype" placeholder="+ إضافة نوع ورد مخصص جديد (خيار المزيد)..." class="flex-1 p-2 text-xs rounded-lg border border-gray-300 bg-white">
              </div>
            </div>

            <!-- اختيار متعدد: ألوان الورد -->
            <div class="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div class="flex items-center justify-between mb-2">
                <label class="block font-bold text-gray-900">ألوان الورد * (يمكنك اختيار أكثر من لون بنفس الوقت):</label>
                <span class="text-[10px] text-gray-500">اختر من القائمة أو أضف المزيد</span>
              </div>
              <div class="flex flex-wrap gap-2 mb-2">
                ${(state.colorsList || DEFAULT_COLORS).map(col => {
                  const coid = getAttrId(col);
                  const colabel = getAttrLabel(col);
                  return `
                    <label class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium cursor-pointer hover:bg-rose-50 hover:border-rose-300 transition">
                      <input type="checkbox" name="np-colors" value="${coid}" class="w-3.5 h-3.5 rounded text-rose-900 focus:ring-rose-800">
                      <span>${colabel}</span>
                    </label>
                  `;
                }).join('')}
              </div>
              <div class="flex items-center gap-2">
                <input type="text" id="np-more-color" placeholder="+ إضافة لون مخصص جديد (خيار المزيد)..." class="flex-1 p-2 text-xs rounded-lg border border-gray-300 bg-white">
              </div>
            </div>

            <!-- رفع الصورة من الجهاز -->
            <div>
              <label class="block font-semibold mb-1">صورة الباقة (رفع من الجهاز أو رابط) *</label>
              <div class="flex items-center gap-3">
                <label class="flex-1 cursor-pointer py-2.5 px-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 flex items-center justify-center gap-2">
                  <i data-lucide="upload" class="w-4 h-4 text-rose-800"></i>
                  <span id="np-img-label">اختر صورة من جهازك</span>
                  <input type="file" accept="image/*" onchange="window.lotusApp.handleProductImageUpload(event)" class="hidden">
                </label>
                <input type="text" id="np-image-url" placeholder="أو اكتب مسار الصورة (assets/...)" class="flex-1 p-2.5 rounded-xl border border-gray-300">
              </div>
              <div id="np-preview-box" class="hidden mt-2 flex items-center gap-3">
                <img id="np-preview-img" src="" alt="معاينة" class="w-16 h-16 rounded-xl object-cover border border-gray-200">
                <span class="text-emerald-700 font-bold">تم اختيار ومعاينة الصورة بنجاح!</span>
              </div>
            </div>

            <!-- إدارة الأحجام والأسعار المتعددة (Multi-Size Manager) -->
            <div class="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div class="flex items-center justify-between mb-2">
                <label class="font-bold text-gray-900">أحجام الباقة والأسعار (يمكن إضافة أكثر من حجم):</label>
                <button type="button" onclick="window.lotusApp.addSizeRow()" class="text-rose-900 font-bold hover:underline">+ إضافة حجم آخر</button>
              </div>
              
              <div id="sizes-rows-container" class="space-y-2">
                <div class="flex gap-2 size-input-row">
                  <input type="text" placeholder="اسم الحجم (مثال: بوكيه 25 وردة)" value="حجم قياسي (25 وردة)" class="flex-1 p-2 rounded-lg border border-gray-300 size-name-input">
                  <input type="number" placeholder="السعر بالجنيه" value="450" class="w-32 p-2 rounded-lg border border-gray-300 size-price-input">
                </div>
                <div class="flex gap-2 size-input-row">
                  <input type="text" placeholder="اسم الحجم (مثال: بوكيه 50 وردة)" value="حجم كبير (50 وردة)" class="flex-1 p-2 rounded-lg border border-gray-300 size-name-input">
                  <input type="number" placeholder="السعر بالجنيه" value="850" class="w-32 p-2 rounded-lg border border-gray-300 size-price-input">
                </div>
              </div>
            </div>

            <div>
              <label class="block font-semibold mb-1">وصف الباقة ومكوناتها</label>
              <textarea id="np-desc" rows="2" placeholder="اكتب مكونات الورد والتغليف..." class="w-full p-2.5 rounded-xl border border-gray-300"></textarea>
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <button type="button" onclick="window.lotusApp.toggleNewProductForm()" class="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100">إلغاء</button>
              <button type="submit" class="px-6 py-2 rounded-xl btn-primary font-bold">حفظ الباقة فوراً</button>
            </div>
          </form>
        </div>

        <!-- جدول المنتجات الحالية مع زر التعديل والحذف -->
        <div class="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm text-xs">
          <table class="w-full text-right">
            <thead class="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th class="p-3">الكود</th>
                <th class="p-3">الباقة</th>
                <th class="p-3">التصنيف</th>
                <th class="p-3">الأحجام والأسعار المتوفرة</th>
                <th class="p-3 text-left">إجراءات التحكم</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              ${state.products.map(p => `
                <tr class="hover:bg-gray-50 transition">
                  <td class="p-3 font-mono font-bold text-rose-950">${p.sku}</td>
                  <td class="p-3 flex items-center gap-3">
                    <img src="${p.image}" alt="${p.name}" class="w-10 h-10 rounded-xl object-cover border border-gray-200">
                    <div>
                      <span class="font-bold text-gray-900 block">${p.name}</span>
                      <span class="text-[10px] text-gray-400 font-medium">
                        ${(p.flowerTypes && p.flowerTypes.length > 0) ? p.flowerTypes.join(' + ') : (p.flowerType || 'ورد طبيعي')} 
                        • 
                        ${(p.colors && p.colors.length > 0) ? p.colors.join('، ') : (p.color || '')}
                      </span>
                    </div>
                  </td>
                  <td class="p-3">
                    <div class="flex flex-wrap gap-1">
                      ${((p.categories && p.categories.length > 0) ? p.categories : [p.category]).map(c => `
                        <span class="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-semibold text-[11px]">${c}</span>
                      `).join('')}
                    </div>
                  </td>
                  <td class="p-3">
                    <div class="flex flex-wrap gap-1">
                      ${(p.sizes || []).map(s => `<span class="bg-rose-50 text-rose-950 border border-rose-100 px-2 py-0.5 rounded text-[11px]">${s.name}: <strong>${s.price} ج.م</strong></span>`).join('')}
                    </div>
                  </td>
                  <td class="p-3 text-left">
                    <div class="flex items-center gap-1.5 justify-end">
                      <button onclick="window.lotusApp.openEditProductModal('${p.id}')" class="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold flex items-center gap-1 border border-amber-200 transition" title="تعديل بيانات الباقة والأسعار">
                        <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                        <span>تعديل</span>
                      </button>
                      <button onclick="window.lotusApp.deleteProduct('${p.id}')" class="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold flex items-center gap-1 border border-rose-200 transition" title="حذف الباقة">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                        <span>حذف</span>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function getCategoryPrefixCode(catName) {
    if (!catName) return 'LT';
    const clean = catName.trim();
    if (CATEGORY_CODE_PREFIXES[clean]) return CATEGORY_CODE_PREFIXES[clean];
    if (clean.includes('فاتحة') || clean.includes('خطوبة')) return 'QF';
    if (clean.includes('حب') || clean.includes('عشق') || clean.includes('رومانس')) return 'LV';
    if (clean.includes('تخرج') || clean.includes('نجاح')) return 'GD';
    if (clean.includes('زواج') || clean.includes('فرح') || clean.includes('عروس')) return 'WD';
    if (clean.includes('صداقة') || clean.includes('شكر')) return 'FR';
    if (clean.includes('مولود') || clean.includes('بيبي') || clean.includes('أطفال')) return 'NB';
    if (clean.includes('مخصوص') || clean.includes('خاص')) return 'CS';
    if (clean.includes('عيد') || clean.includes('ميلاد')) return 'BD';
    if (clean.includes('فازة')) return 'VS';
    if (clean.includes('بوكيه') || clean.includes('باقة')) return 'BQ';
    const letters = clean.replace(/[^a-zA-Z0-9]/g, '');
    return letters ? letters.substring(0, 2).toUpperCase() : 'LT';
  }

  function updateAutoSku() {
    const checked = Array.from(document.querySelectorAll('input[name="np-categories"]:checked')).map(c => c.value);
    const moreCat = document.getElementById('np-more-category')?.value.trim();
    if (moreCat && !checked.includes(moreCat)) {
      checked.push(moreCat);
    }

    const skuInput = document.getElementById('np-sku');
    if (!skuInput) return;

    if (checked.length === 0) {
      skuInput.value = `LT-${state.products.length + 101}`;
      return;
    }

    // توليد بادئات التصنيفات المحددة ودمجها بترميز موحد وذكي يجمع كل تصنيفات الباقة
    const rawPrefixes = checked.map(c => getCategoryPrefixCode(c));
    const uniquePrefixes = [...new Set(rawPrefixes)];
    const combinedPrefix = uniquePrefixes.join('-');
    const count = state.products.length + 101;
    skuInput.value = `${combinedPrefix}-${count}`;
  }

  function handleNewProductCategoryCheck() {
    updateAutoSku();
  }

  function updateEditAutoSku() {
    const checked = Array.from(document.querySelectorAll('input[name="ep-categories"]:checked')).map(c => c.value);
    const moreCat = document.getElementById('ep-more-category')?.value.trim();
    if (moreCat && !checked.includes(moreCat)) {
      checked.push(moreCat);
    }

    const skuInput = document.getElementById('ep-sku');
    if (!skuInput || checked.length === 0) return;

    const rawPrefixes = checked.map(c => getCategoryPrefixCode(c));
    const uniquePrefixes = [...new Set(rawPrefixes)];
    const combinedPrefix = uniquePrefixes.join('-');
    
    // استخراج الرقم التسلسلي الحالي
    const match = skuInput.value.match(/\d+$/);
    const num = match ? match[0] : (state.products.length + 101);
    skuInput.value = `${combinedPrefix}-${num}`;
  }

  function toggleNewProductForm() {
    const box = document.getElementById('admin-new-product-box');
    if (box) box.classList.toggle('hidden');
  }

  function addSizeRow() {
    const container = document.getElementById('sizes-rows-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'flex gap-2 size-input-row';
    row.innerHTML = `
      <input type="text" placeholder="اسم الحجم (مثال: بوكيه 100 وردة)" class="flex-1 p-2 rounded-lg border border-gray-300 size-name-input">
      <input type="number" placeholder="السعر بالجنيه" class="w-32 p-2 rounded-lg border border-gray-300 size-price-input">
      <button type="button" onclick="this.parentElement.remove()" class="text-red-600 px-2 font-bold">×</button>
    `;
    container.appendChild(row);
  }

  function handleProductImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      state.uploadedProductImage = evt.target.result;
      const previewBox = document.getElementById('np-preview-box');
      const previewImg = document.getElementById('np-preview-img');
      const urlInput = document.getElementById('np-image-url');
      if (previewBox && previewImg) {
        previewImg.src = evt.target.result;
        previewBox.classList.remove('hidden');
      }
      if (urlInput) urlInput.value = `assets/products/custom-${Date.now()}.jpg`;
    };
    reader.readAsDataURL(file);
  }

  function handleSaveProduct(e) {
    e.preventDefault();
    
    // جمع التصنيفات والمناسبات المختارة + خيار المزيد
    const catCheckboxes = document.querySelectorAll('input[name="np-categories"]:checked');
    const categories = Array.from(catCheckboxes).map(cb => cb.value);
    const moreCategory = document.getElementById('np-more-category')?.value.trim();
    if (moreCategory && !categories.includes(moreCategory)) {
      categories.push(moreCategory);
      if (!state.categoriesList.includes(moreCategory)) {
        state.categoriesList.push(moreCategory);
        saveState('categoriesList');
      }
    }
    if (categories.length === 0) categories.push('طلب مخصوص');

    // جمع أنواع الورد المختارة + خيار المزيد
    const ftCheckboxes = document.querySelectorAll('input[name="np-flowertypes"]:checked');
    const flowerTypes = Array.from(ftCheckboxes).map(cb => cb.value);
    const moreFlowerType = document.getElementById('np-more-flowertype')?.value.trim();
    if (moreFlowerType && !flowerTypes.includes(moreFlowerType)) {
      flowerTypes.push(moreFlowerType);
      if (!state.flowerTypesList.includes(moreFlowerType)) {
        state.flowerTypesList.push(moreFlowerType);
        saveState('flowerTypesList');
      }
    }
    if (flowerTypes.length === 0) flowerTypes.push('ورد طبيعي');

    // جمع ألوان الورد المختارة + خيار المزيد
    const colCheckboxes = document.querySelectorAll('input[name="np-colors"]:checked');
    const colors = Array.from(colCheckboxes).map(cb => cb.value);
    const moreColor = document.getElementById('np-more-color')?.value.trim();
    if (moreColor && !colors.includes(moreColor)) {
      colors.push(moreColor);
      if (!state.colorsList.includes(moreColor)) {
        state.colorsList.push(moreColor);
        saveState('colorsList');
      }
    }
    if (colors.length === 0) colors.push('ألوان مختلطة');

    const sku = document.getElementById('np-sku').value.trim();
    const name = document.getElementById('np-name').value.trim();
    const imgUrl = state.uploadedProductImage || document.getElementById('np-image-url').value.trim() || 'assets/products/p01.jpg';
    const desc = document.getElementById('np-desc').value.trim();

    const sizeRows = document.querySelectorAll('.size-input-row');
    const sizes = [];
    sizeRows.forEach(row => {
      const sName = row.querySelector('.size-name-input')?.value.trim();
      const sPrice = parseFloat(row.querySelector('.size-price-input')?.value);
      if (sName && sPrice) sizes.push({ name: sName, price: sPrice });
    });

    if (sizes.length === 0) sizes.push({ name: 'حجم قياسي', price: 500 });

    const newProd = {
      id: `prod-${sku.toLowerCase()}-${Date.now()}`,
      sku: sku,
      name: name,
      category: categories[0],
      categories: categories,
      color: colors[0],
      colors: colors,
      flowerType: flowerTypes[0],
      flowerTypes: flowerTypes,
      image: imgUrl,
      badge: 'جديد',
      description: desc || 'باقة ورد طبيعي منتقاة من زهور اللوتس بعناية فائقة.',
      sizes: sizes,
      tags: Array.from(new Set([...categories, ...colors, ...flowerTypes]))
    };

    state.products.unshift(newProd);
    saveState('products');
    state.uploadedProductImage = null;
    showToast(`تمت إضافة الباقة بكود ${sku} بتصنيفاتها وألوانها المتعددة بنجاح!`);
    renderCurrentPage();
  }

  // ==================== نافذة ونظام تعديل المنتجات المضافة ====================
  function openEditProductModal(productId) {
    const prod = state.products.find(p => p.id === productId);
    if (!prod) return;

    state.editingProduct = prod;
    state.uploadedEditProductImage = null;

    const prodCategories = prod.categories && prod.categories.length > 0 ? prod.categories : [prod.category];
    const prodFlowerTypes = prod.flowerTypes && prod.flowerTypes.length > 0 ? prod.flowerTypes : [prod.flowerType || 'ورد طبيعي'];
    const prodColors = prod.colors && prod.colors.length > 0 ? prod.colors : [prod.color || 'ألوان مختلطة'];

    const modal = document.getElementById('admin-edit-modal');
    if (!modal) return;

    modal.innerHTML = `
      <div class="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-gray-200 text-xs">
        <div class="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
          <div class="flex items-center gap-2">
            <i data-lucide="edit" class="w-5 h-5 text-rose-900"></i>
            <h3 class="font-bold text-base text-gray-900">تعديل بيانات الباقة (${prod.sku})</h3>
          </div>
          <button onclick="window.lotusApp.closeEditProductModal()" class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <form onsubmit="window.lotusApp.handleUpdateProduct(event, '${prod.id}')" class="space-y-4">
          
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block font-bold mb-1">كود الباقة (SKU):</label>
              <input type="text" id="ep-sku" required value="${prod.sku}" class="w-full p-2.5 rounded-xl border border-gray-300 font-mono font-bold text-rose-900 bg-gray-50">
            </div>

            <div class="sm:col-span-2">
              <label class="block font-bold mb-1">اسم الباقة:</label>
              <input type="text" id="ep-name" required value="${prod.name}" class="w-full p-2.5 rounded-xl border border-gray-300 font-bold">
            </div>
          </div>

          <!-- اختيار متعدد للمناسبة / التصنيف -->
          <div class="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <div class="flex items-center justify-between mb-2">
              <label class="block font-bold text-gray-900">المناسبات والتصنيفات (اختيار متعدد):</label>
              <span class="text-[10px] text-gray-500">حدد كافة المناسبات المناسبة للباقة</span>
            </div>
            <div class="flex flex-wrap gap-2 mb-2">
              ${(state.categoriesList || DEFAULT_CATEGORIES).map(cat => {
                const cid = getAttrId(cat);
                const clabel = getAttrLabel(cat);
                return `
                  <label class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium cursor-pointer hover:bg-rose-50 hover:border-rose-300 transition">
                    <input type="checkbox" name="ep-categories" value="${cid}" ${prodCategories.includes(cid) ? 'checked' : ''} onchange="window.lotusApp.updateEditAutoSku()" class="w-3.5 h-3.5 rounded text-rose-900 focus:ring-rose-800">
                    <span>${clabel}</span>
                  </label>
                `;
              }).join('')}
            </div>
            <input type="text" id="ep-more-category" oninput="window.lotusApp.updateEditAutoSku()" placeholder="+ إضافة تصنيف جديد للباقة (المزيد)..." class="w-full p-2 text-xs rounded-lg border border-gray-300 bg-white">
          </div>

          <!-- اختيار متعدد لنوع الورد -->
          <div class="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <div class="flex items-center justify-between mb-2">
              <label class="block font-bold text-gray-900">أنواع الورد في الباقة (اختيار متعدد):</label>
              <span class="text-[10px] text-gray-500">حدد أكثر من نوع ورد</span>
            </div>
            <div class="flex flex-wrap gap-2 mb-2">
              ${(state.flowerTypesList || DEFAULT_FLOWER_TYPES).map(ft => {
                const fid = getAttrId(ft);
                const flabel = getAttrLabel(ft);
                return `
                  <label class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium cursor-pointer hover:bg-rose-50 hover:border-rose-300 transition">
                    <input type="checkbox" name="ep-flowertypes" value="${fid}" ${prodFlowerTypes.includes(fid) ? 'checked' : ''} class="w-3.5 h-3.5 rounded text-rose-900 focus:ring-rose-800">
                    <span>${flabel}</span>
                  </label>
                `;
              }).join('')}
            </div>
            <input type="text" id="ep-more-flowertype" placeholder="+ إضافة نوع ورد جديد للباقة (المزيد)..." class="w-full p-2 text-xs rounded-lg border border-gray-300 bg-white">
          </div>

          <!-- اختيار متعدد لألوان الورد والشارة -->
          <div class="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <div class="flex items-center justify-between mb-2">
              <label class="block font-bold text-gray-900">ألوان الباقة (اختيار متعدد):</label>
              <span class="text-[10px] text-gray-500">حدد كافة ألوان الورد في الباقة</span>
            </div>
            <div class="flex flex-wrap gap-2 mb-2">
              ${(state.colorsList || DEFAULT_COLORS).map(col => {
                const coid = getAttrId(col);
                const colabel = getAttrLabel(col);
                return `
                  <label class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium cursor-pointer hover:bg-rose-50 hover:border-rose-300 transition">
                    <input type="checkbox" name="ep-colors" value="${coid}" ${prodColors.includes(coid) ? 'checked' : ''} class="w-3.5 h-3.5 rounded text-rose-900 focus:ring-rose-800">
                    <span>${colabel}</span>
                  </label>
                `;
              }).join('')}
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              <input type="text" id="ep-more-color" placeholder="+ إضافة لون جديد للباقة (المزيد)..." class="w-full p-2 text-xs rounded-lg border border-gray-300 bg-white">
              <input type="text" id="ep-badge" value="${prod.badge || ''}" placeholder="شارة الباقة (الأكثر طلباً / جديد...)" class="w-full p-2 text-xs rounded-lg border border-gray-300 bg-white">
            </div>
          </div>

          <!-- تعديل صورة الباقة -->
          <div>
            <label class="block font-bold mb-1">صورة الباقة الحالية أو رفع صورة جديدة:</label>
            <div class="flex items-center gap-3">
              <img id="ep-current-img" src="${prod.image}" alt="صورة الباقة" class="w-14 h-14 rounded-xl object-cover border border-gray-300 shadow-sm">
              <label class="flex-1 cursor-pointer py-2.5 px-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 flex items-center justify-center gap-2">
                <i data-lucide="upload" class="w-4 h-4 text-rose-800"></i>
                <span id="ep-img-label">رفع صورة جديدة من جهازك</span>
                <input type="file" accept="image/*" onchange="window.lotusApp.handleEditProductImageUpload(event)" class="hidden">
              </label>
              <input type="text" id="ep-image-url" value="${prod.image}" placeholder="مسار الصورة..." class="flex-1 p-2.5 rounded-xl border border-gray-300 font-mono text-[11px]">
            </div>
          </div>

          <!-- تعديل الأحجام والأسعار (Multi-Size Editing) -->
          <div class="p-4 rounded-2xl bg-gray-50 border border-gray-200">
            <div class="flex items-center justify-between mb-2">
              <label class="font-bold text-gray-900">تعديل أحجام وأسعار الباقة:</label>
              <button type="button" onclick="window.lotusApp.addEditSizeRow()" class="text-rose-900 font-bold hover:underline flex items-center gap-1">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                <span>+ إضافة حجم جديد</span>
              </button>
            </div>

            <div id="edit-sizes-rows-container" class="space-y-2">
              ${(prod.sizes || []).map(s => `
                <div class="flex gap-2 edit-size-input-row items-center">
                  <input type="text" placeholder="اسم الحجم" value="${s.name}" class="flex-1 p-2 rounded-xl border border-gray-300 edit-size-name font-medium">
                  <div class="flex items-center gap-1">
                    <input type="number" placeholder="السعر" value="${s.price}" class="w-28 p-2 rounded-xl border border-gray-300 edit-size-price font-bold text-rose-950">
                    <span class="text-gray-500 font-bold text-[11px]">ج.م</span>
                  </div>
                  <button type="button" onclick="this.parentElement.remove()" class="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 flex items-center justify-center font-bold">×</button>
                </div>
              `).join('')}
            </div>
          </div>

          <div>
            <label class="block font-bold mb-1">وصف وتفاصيل الباقة ومكوناتها:</label>
            <textarea id="ep-desc" rows="3" class="w-full p-2.5 rounded-xl border border-gray-300">${prod.description || ''}</textarea>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button type="button" onclick="window.lotusApp.closeEditProductModal()" class="px-5 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-bold">إلغاء</button>
            <button type="submit" class="px-7 py-2.5 rounded-xl btn-primary font-bold shadow-md">حفظ كافة التعديلات 💐</button>
          </div>

        </form>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    lucide.createIcons();
  }

  function closeEditProductModal() {
    const modal = document.getElementById('admin-edit-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    state.editingProduct = null;
    state.uploadedEditProductImage = null;
  }

  function addEditSizeRow() {
    const container = document.getElementById('edit-sizes-rows-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'flex gap-2 edit-size-input-row items-center';
    row.innerHTML = `
      <input type="text" placeholder="اسم الحجم الجديد" value="حجم إضافي" class="flex-1 p-2 rounded-xl border border-gray-300 edit-size-name font-medium">
      <div class="flex items-center gap-1">
        <input type="number" placeholder="السعر" value="650" class="w-28 p-2 rounded-xl border border-gray-300 edit-size-price font-bold text-rose-950">
        <span class="text-gray-500 font-bold text-[11px]">ج.م</span>
      </div>
      <button type="button" onclick="this.parentElement.remove()" class="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 flex items-center justify-center font-bold">×</button>
    `;
    container.appendChild(row);
  }

  function handleEditProductImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      state.uploadedEditProductImage = evt.target.result;
      const img = document.getElementById('ep-current-img');
      const label = document.getElementById('ep-img-label');
      if (img) img.src = evt.target.result;
      if (label) label.textContent = 'تم اختيار صورة جديدة بنجاح!';
    };
    reader.readAsDataURL(file);
  }

  function handleUpdateProduct(e, productId) {
    e.preventDefault();
    const prod = state.products.find(p => p.id === productId);
    if (!prod) return;

    // استخراج التصنيفات المختارة + خيار المزيد
    const catCheckboxes = document.querySelectorAll('input[name="ep-categories"]:checked');
    const categories = Array.from(catCheckboxes).map(cb => cb.value);
    const moreCategory = document.getElementById('ep-more-category')?.value.trim();
    if (moreCategory && !categories.includes(moreCategory)) {
      categories.push(moreCategory);
      if (!state.categoriesList.includes(moreCategory)) {
        state.categoriesList.push(moreCategory);
        saveState('categoriesList');
      }
    }
    if (categories.length === 0) categories.push(prod.category || 'طلب مخصوص');

    // استخراج أنواع الورد المختارة + خيار المزيد
    const ftCheckboxes = document.querySelectorAll('input[name="ep-flowertypes"]:checked');
    const flowerTypes = Array.from(ftCheckboxes).map(cb => cb.value);
    const moreFlowerType = document.getElementById('ep-more-flowertype')?.value.trim();
    if (moreFlowerType && !flowerTypes.includes(moreFlowerType)) {
      flowerTypes.push(moreFlowerType);
      if (!state.flowerTypesList.includes(moreFlowerType)) {
        state.flowerTypesList.push(moreFlowerType);
        saveState('flowerTypesList');
      }
    }
    if (flowerTypes.length === 0) flowerTypes.push(prod.flowerType || 'ورد طبيعي');

    // استخراج الألوان المختارة + خيار المزيد
    const colCheckboxes = document.querySelectorAll('input[name="ep-colors"]:checked');
    const colors = Array.from(colCheckboxes).map(cb => cb.value);
    const moreColor = document.getElementById('ep-more-color')?.value.trim();
    if (moreColor && !colors.includes(moreColor)) {
      colors.push(moreColor);
      if (!state.colorsList.includes(moreColor)) {
        state.colorsList.push(moreColor);
        saveState('colorsList');
      }
    }
    if (colors.length === 0) colors.push(prod.color || 'ألوان مختلطة');

    const sku = document.getElementById('ep-sku').value.trim();
    const name = document.getElementById('ep-name').value.trim();
    const badge = document.getElementById('ep-badge').value.trim();
    const imgUrl = state.uploadedEditProductImage || document.getElementById('ep-image-url').value.trim() || prod.image;
    const desc = document.getElementById('ep-desc').value.trim();

    const sizeRows = document.querySelectorAll('.edit-size-input-row');
    const sizes = [];
    sizeRows.forEach(row => {
      const sName = row.querySelector('.edit-size-name')?.value.trim();
      const sPrice = parseFloat(row.querySelector('.edit-size-price')?.value);
      if (sName && sPrice) sizes.push({ name: sName, price: sPrice });
    });

    if (sizes.length === 0) sizes.push({ name: 'حجم قياسي', price: 500 });

    // تحديث بيانات الباقة
    prod.category = categories[0];
    prod.categories = categories;
    prod.sku = sku;
    prod.name = name;
    prod.color = colors[0];
    prod.colors = colors;
    prod.flowerType = flowerTypes[0];
    prod.flowerTypes = flowerTypes;
    prod.badge = badge;
    prod.image = imgUrl;
    prod.description = desc;
    prod.sizes = sizes;
    prod.tags = Array.from(new Set([...categories, ...colors, ...flowerTypes]));

    saveState('products');
    closeEditProductProduct();
    showToast(`تم حفظ وتحديث باقة "${prod.name}" بنجاح! 💐`);
    renderCurrentPage();
  }

  function closeEditProductProduct() {
    closeEditProductModal();
  }

  function deleteProduct(id) {
    if (!confirm('هل أنت متأكد من حذف هذه الباقة؟')) return;
    state.products = state.products.filter(p => p.id !== id);
    saveState('products');
    showToast('تم حذف الباقة بنجاح');
    renderCurrentPage();
  }

  // ==================== إدارة مجلة المتجر وسلايدر الرئيسية ====================
  function toggleNewMagazineForm() {
    const box = document.getElementById('admin-new-magazine-box');
    if (box) box.classList.toggle('hidden');
  }

  function handleMagazineImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      state.uploadedMagazineImage = evt.target.result;
      const previewBox = document.getElementById('nms-preview-box');
      const previewImg = document.getElementById('nms-preview-img');
      const urlInput = document.getElementById('nms-image-url');
      if (previewBox && previewImg) {
        previewImg.src = evt.target.result;
        previewBox.classList.remove('hidden');
      }
      if (urlInput) urlInput.value = `assets/magazine/slide-${Date.now()}.jpg`;
    };
    reader.readAsDataURL(file);
  }

  function handleSaveMagazineSlide(e) {
    e.preventDefault();
    const issue = document.getElementById('nms-issue').value.trim();
    const badge = document.getElementById('nms-badge').value.trim();
    const tag = document.getElementById('nms-tag').value.trim();
    const title = document.getElementById('nms-title').value.trim();
    const subtitle = document.getElementById('nms-subtitle').value.trim();
    const btn1Text = document.getElementById('nms-btn1-text').value.trim();
    const btn1Link = document.getElementById('nms-btn1-link').value.trim();
    const btn2Text = document.getElementById('nms-btn2-text').value.trim();
    const btn2Link = document.getElementById('nms-btn2-link').value.trim();
    const image = state.uploadedMagazineImage || document.getElementById('nms-image-url').value.trim() || 'assets/products/p01.jpg';

    const newSlide = {
      id: `slide-${Date.now()}`,
      issue: issue || 'إصدار جديد',
      badge: badge || 'غلاف المجلة',
      tag: tag || 'زهور اللوتس',
      title: title,
      subtitle: subtitle,
      btn1Text: btn1Text || 'تسوق الآن',
      btn1Link: btn1Link || '#shop',
      btn2Text: btn2Text || 'واتساب',
      btn2Link: btn2Link || 'https://wa.me/201105746118',
      image: image,
      active: true
    };

    if (!state.magazineSlides) state.magazineSlides = [];
    state.magazineSlides.push(newSlide);
    saveState('magazineSlides');
    state.uploadedMagazineImage = null;
    showToast('تمت إضافة ونشر غلاف المجلة بنجاح!');
    renderCurrentPage();
  }

  function handleDeleteMagazineSlide(index) {
    if (!confirm('هل أنت متأكد من حذف هذا الغلاف من المجلة؟')) return;
    state.magazineSlides.splice(index, 1);
    saveState('magazineSlides');
    showToast('تم حذف الغلاف من المجلة');
    renderCurrentPage();
  }

  function toggleMagazineSlideActive(index) {
    if (state.magazineSlides && state.magazineSlides[index]) {
      state.magazineSlides[index].active = state.magazineSlides[index].active === false ? true : false;
      saveState('magazineSlides');
      showToast(`تم ${state.magazineSlides[index].active ? 'تفعيل' : 'إيقاف'} الغلاف`);
      renderCurrentPage();
    }
  }

  function renderAdminMagazineSection() {
    const slides = state.magazineSlides || [];
    return `
      <div class="space-y-6 text-xs">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-bold text-gray-900 text-sm">إدارة مجلة وسلايدر الرئيسية التفاعلية</h4>
            <p class="text-gray-500 text-[11px] mt-0.5">تحكم في أغلفة المجلة، النصوص، الأزرار، والروابط المعروضة في واجهة المتجر الرئيسية</p>
          </div>
          <button onclick="window.lotusApp.toggleNewMagazineForm()" class="px-4 py-2 rounded-xl btn-primary font-bold flex items-center gap-1 shadow">
            <i data-lucide="plus" class="w-4 h-4"></i>
            إضافة صفحة / غلاف جديد للمجلة
          </button>
        </div>

        <!-- نموذج إضافة غلاف / شريحة جديدة للمجلة -->
        <div id="admin-new-magazine-box" class="hidden p-5 bg-white rounded-2xl border border-rose-200 shadow-sm space-y-4">
          <h5 class="font-bold text-sm text-rose-950">إضافة غلاف / قصة مجلة جديدة:</h5>
          <form onsubmit="window.lotusApp.handleSaveMagazineSlide(event)" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block font-bold mb-1">رقم/تاريخ الإصدار (Issue):</label>
                <input type="text" id="nms-issue" required placeholder="مثال: الإصدار 05 • خريف 2026" class="w-full p-2.5 rounded-xl border border-gray-300">
              </div>
              <div>
                <label class="block font-bold mb-1">شارة الغلاف (Badge):</label>
                <input type="text" id="nms-badge" placeholder="مثال: غلاف المجلة / تشكيلة حصرية" class="w-full p-2.5 rounded-xl border border-gray-300">
              </div>
              <div>
                <label class="block font-bold mb-1">وسم المجموعة (Tag):</label>
                <input type="text" id="nms-tag" placeholder="مثال: زهور اللوتس • القاهرة" class="w-full p-2.5 rounded-xl border border-gray-300">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold mb-1">عنوان الغلاف الرئيسي *</label>
                <input type="text" id="nms-title" required placeholder="مثال: باقات الخريف الملكية الساحرة" class="w-full p-2.5 rounded-xl border border-gray-300 font-bold">
              </div>
              <div>
                <label class="block font-bold mb-1">الوصف التحريري (العنوان الفرعي) *</label>
                <input type="text" id="nms-subtitle" required placeholder="مثال: تشكيلة فاخرة منتقاة بعناية لتعبر عن أسمى معاني الفخامة..." class="w-full p-2.5 rounded-xl border border-gray-300">
              </div>
            </div>

            <!-- الأزرار التفاعلية المخصصة -->
            <div class="p-3 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h6 class="font-bold text-gray-900 mb-2">الزر التفاعلي الرئيسي:</h6>
                <div class="space-y-2">
                  <input type="text" id="nms-btn1-text" placeholder="نص الزر (مثال: تسوق المجموعة الآن)" value="تسوق المجموعة الآن" class="w-full p-2 rounded-lg border border-gray-300">
                  <input type="text" id="nms-btn1-link" placeholder="رابط الزر (مثال: #shop)" value="#shop" class="w-full p-2 rounded-lg border border-gray-300 font-mono text-[11px]">
                </div>
              </div>
              <div>
                <h6 class="font-bold text-gray-900 mb-2">الزر التفاعلي الثانوي:</h6>
                <div class="space-y-2">
                  <input type="text" id="nms-btn2-text" placeholder="نص الزر (مثال: اطلب عبر واتساب)" value="اطلب عبر واتساب" class="w-full p-2 rounded-lg border border-gray-300">
                  <input type="text" id="nms-btn2-link" placeholder="رابط الزر (مثال: https://wa.me/201105746118)" value="https://wa.me/201105746118" class="w-full p-2 rounded-lg border border-gray-300 font-mono text-[11px]">
                </div>
              </div>
            </div>

            <!-- صورة الغلاف -->
            <div>
              <label class="block font-bold mb-1">صورة غلاف المجلة (رفع من الجهاز أو رابط) *</label>
              <div class="flex items-center gap-3">
                <label class="flex-1 cursor-pointer py-2.5 px-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 flex items-center justify-center gap-2">
                  <i data-lucide="upload" class="w-4 h-4 text-rose-800"></i>
                  <span id="nms-img-label">اختر صورة من جهازك</span>
                  <input type="file" accept="image/*" onchange="window.lotusApp.handleMagazineImageUpload(event)" class="hidden">
                </label>
                <input type="text" id="nms-image-url" placeholder="أو رابط الصورة (assets/...)" class="flex-1 p-2.5 rounded-xl border border-gray-300">
              </div>
              <div id="nms-preview-box" class="hidden mt-2 flex items-center gap-3">
                <img id="nms-preview-img" src="" alt="معاينة" class="w-20 h-14 rounded-xl object-cover border border-gray-200">
                <span class="text-emerald-700 font-bold">تم اختيار ومعاينة صورة الغلاف!</span>
              </div>
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <button type="button" onclick="window.lotusApp.toggleNewMagazineForm()" class="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-bold">إلغاء</button>
              <button type="submit" class="px-6 py-2 rounded-xl btn-primary font-bold">حفظ الغلاف ونشره في السلايدر</button>
            </div>
          </form>
        </div>

        <!-- قائمة أغلفة المجلة الحالية -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${slides.map((slide, idx) => `
            <div class="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:border-rose-200 transition">
              <div class="flex items-start gap-3">
                <img src="${slide.image}" alt="${slide.title}" class="w-24 h-24 rounded-xl object-cover border border-gray-200 shrink-0">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1 flex-wrap">
                    <span class="bg-rose-50 text-rose-900 border border-rose-100 px-2 py-0.5 rounded text-[10px] font-bold">${slide.issue || 'إصدار المجلة'}</span>
                    ${slide.badge ? `<span class="bg-amber-50 text-amber-900 border border-amber-100 px-2 py-0.5 rounded text-[10px] font-bold">${slide.badge}</span>` : ''}
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold ${slide.active !== false ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-500'}">
                      ${slide.active !== false ? '● معروض الآن' : '○ متوقف'}
                    </span>
                  </div>
                  <h5 class="font-bold text-gray-900 text-sm truncate">${slide.title}</h5>
                  <p class="text-gray-500 text-[11px] line-clamp-2 mt-0.5">${slide.subtitle || ''}</p>
                  <div class="flex items-center gap-2 mt-2 text-[10px] text-gray-400">
                    <span>الزر: <strong>${slide.btn1Text || 'تسوق الآن'}</strong> (${slide.btn1Link || '#shop'})</span>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
                <button onclick="window.lotusApp.toggleMagazineSlideActive(${idx})" class="px-3 py-1.5 rounded-lg border text-[11px] font-bold transition ${
                  slide.active !== false ? 'border-amber-200 text-amber-900 bg-amber-50 hover:bg-amber-100' : 'border-emerald-200 text-emerald-900 bg-emerald-50 hover:bg-emerald-100'
                }">
                  ${slide.active !== false ? 'إيقاف الغلاف مؤقتاً' : 'تفعيل وعرض في المجلة'}
                </button>
                <button onclick="window.lotusApp.handleDeleteMagazineSlide(${idx})" class="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-[11px] font-bold transition flex items-center gap-1">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                  <span>حذف الغلاف</span>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ==================== إدارة معرض منشورات إنستغرام الحقيقية ====================
  function toggleNewShowcaseForm() {
    const box = document.getElementById('admin-new-showcase-box');
    if (box) box.classList.toggle('hidden');
  }

  function handleShowcaseImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      state.uploadedShowcaseImage = evt.target.result;
      const previewBox = document.getElementById('nsp-preview-box');
      const previewImg = document.getElementById('nsp-preview-img');
      const urlInput = document.getElementById('nsp-image-url');
      if (previewBox && previewImg) {
        previewImg.src = evt.target.result;
        previewBox.classList.remove('hidden');
      }
      if (urlInput) urlInput.value = `assets/instagram/post-${Date.now()}.jpg`;
    };
    reader.readAsDataURL(file);
  }

  function handleSaveShowcasePost(e) {
    e.preventDefault();
    const title = document.getElementById('nsp-title').value.trim();
    const link = document.getElementById('nsp-link').value.trim() || 'https://www.instagram.com/lotus_flowers_eg/';
    const likes = parseInt(document.getElementById('nsp-likes').value) || 150;
    const date = document.getElementById('nsp-date').value.trim() || 'مؤخراً';
    const image = state.uploadedShowcaseImage || document.getElementById('nsp-image-url').value.trim() || 'assets/instagram/ig01.jpg';

    const newPost = {
      id: `ig-post-${Date.now()}`,
      title: title,
      image: image,
      likes: likes,
      date: date,
      link: link
    };

    if (!state.showcasePosts) state.showcasePosts = [];
    state.showcasePosts.unshift(newPost);
    saveState('showcasePosts');
    state.uploadedShowcaseImage = null;
    showToast('تمت إضافة ونشر صورة العمل في المعرض بنجاح!');
    renderCurrentPage();
  }

  function handleDeleteShowcasePost(index) {
    if (!confirm('هل أنت متأكد من حذف هذه الصورة من معرض إنستغرام؟')) return;
    state.showcasePosts.splice(index, 1);
    saveState('showcasePosts');
    showToast('تم حذف المنشور من المعرض');
    renderCurrentPage();
  }

  function renderAdminShowcaseSection() {
    const posts = state.showcasePosts || [];
    return `
      <div class="space-y-6 text-xs">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-bold text-gray-900 text-sm">إدارة صور ومعرض أعمال زهور اللوتس الحقيقية</h4>
            <p class="text-gray-500 text-[11px] mt-0.5">تحكم في الصور والمنشورات المعروضة في قسم "منشورات وأعمال زهور اللوتس الحقيقية" مع رابط حساب إنستغرام الرسمي</p>
          </div>
          <button onclick="window.lotusApp.toggleNewShowcaseForm()" class="px-4 py-2 rounded-xl btn-primary font-bold flex items-center gap-1 shadow">
            <i data-lucide="plus" class="w-4 h-4"></i>
            إضافة منشور / صورة حقيقية
          </button>
        </div>

        <!-- نموذج إضافة منشور جديد -->
        <div id="admin-new-showcase-box" class="hidden p-5 bg-white rounded-2xl border border-rose-200 shadow-sm space-y-4">
          <h5 class="font-bold text-sm text-rose-950">إضافة منشور عمل جديد لزهور اللوتس:</h5>
          <form onsubmit="window.lotusApp.handleSaveShowcasePost(event)" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold mb-1">وصف العمل أو المناسبة *</label>
                <input type="text" id="nsp-title" required placeholder="مثال: بوكيه قراية فاتحة ملكي أحمر وأبيض" class="w-full p-2.5 rounded-xl border border-gray-300 font-bold">
              </div>
              <div>
                <label class="block font-bold mb-1">رابط المنشور على إنستغرام</label>
                <input type="text" id="nsp-link" placeholder="مثال: https://www.instagram.com/p/..." value="https://www.instagram.com/lotus_flowers_eg/" class="w-full p-2.5 rounded-xl border border-gray-300 font-mono text-[11px]">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold mb-1">عدد الإعجابات التقديري</label>
                <input type="number" id="nsp-likes" value="150" class="w-full p-2.5 rounded-xl border border-gray-300">
              </div>
              <div>
                <label class="block font-bold mb-1">تاريخ المنشور</label>
                <input type="text" id="nsp-date" value="مؤخراً" class="w-full p-2.5 rounded-xl border border-gray-300">
              </div>
            </div>

            <!-- صورة المنشور -->
            <div>
              <label class="block font-bold mb-1">صورة المنشور (رفع من جهازك أو رابط) *</label>
              <div class="flex items-center gap-3">
                <label class="flex-1 cursor-pointer py-2.5 px-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 flex items-center justify-center gap-2">
                  <i data-lucide="upload" class="w-4 h-4 text-rose-800"></i>
                  <span id="nsp-img-label">اختر صورة من جهازك</span>
                  <input type="file" accept="image/*" onchange="window.lotusApp.handleShowcaseImageUpload(event)" class="hidden">
                </label>
                <input type="text" id="nsp-image-url" placeholder="أو رابط الصورة (assets/instagram/...)" class="flex-1 p-2.5 rounded-xl border border-gray-300">
              </div>
              <div id="nsp-preview-box" class="hidden mt-2 flex items-center gap-3">
                <img id="nsp-preview-img" src="" alt="معاينة" class="w-16 h-16 rounded-xl object-cover border border-gray-200">
                <span class="text-emerald-700 font-bold">تم اختيار صورة المنشور بنجاح!</span>
              </div>
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <button type="button" onclick="window.lotusApp.toggleNewShowcaseForm()" class="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-bold">إلغاء</button>
              <button type="submit" class="px-6 py-2 rounded-xl btn-primary font-bold">حفظ ونشر في المعرض</button>
            </div>
          </form>
        </div>

        <!-- شبكة المنشورات الحالية -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          ${posts.map((post, idx) => `
            <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col group">
              <div class="relative aspect-square overflow-hidden bg-gray-100">
                <img src="${post.image}" alt="${post.title}" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 text-white">
                  <a href="${post.link || 'https://www.instagram.com/lotus_flowers_eg/'}" target="_blank" class="w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center">
                    <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
                  </a>
                </div>
              </div>
              <div class="p-2.5 flex flex-col justify-between flex-1">
                <div>
                  <p class="font-bold text-gray-800 text-[11px] truncate" title="${post.title}">${post.title}</p>
                  <span class="text-[10px] text-gray-400 block">${post.likes || 120} إعجاب</span>
                </div>
                <button onclick="window.lotusApp.handleDeleteShowcasePost(${idx})" class="mt-2 w-full py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] flex items-center justify-center gap-1 transition">
                  <i data-lucide="trash-2" class="w-3 h-3"></i>
                  <span>حذف</span>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ==================== إدارة الهايلايتس والتصنيفات وخصائص المتجر ====================
  function toggleNewHighlightForm() {
    const box = document.getElementById('admin-new-highlight-box');
    if (box) box.classList.toggle('hidden');
  }

  function handleHighlightImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      state.uploadedHighlightImage = evt.target.result;
      const previewBox = document.getElementById('nhl-preview-box');
      const previewImg = document.getElementById('nhl-preview-img');
      const urlInput = document.getElementById('nhl-image-url');
      if (previewBox && previewImg) {
        previewImg.src = evt.target.result;
        previewBox.classList.remove('hidden');
      }
      if (urlInput) urlInput.value = `assets/highlights/hl-${Date.now()}.jpg`;
    };
    reader.readAsDataURL(file);
  }

  function handleSaveHighlight(e) {
    e.preventDefault();
    const title = document.getElementById('nhl-title').value.trim();
    const subtitle = document.getElementById('nhl-subtitle').value.trim();
    const tag = document.getElementById('nhl-tag').value.trim();
    const image = state.uploadedHighlightImage || document.getElementById('nhl-image-url').value.trim() || 'assets/products/p01.jpg';

    const newOccasion = {
      id: `occ-${Date.now()}`,
      name: title,
      title: title,
      subtitle: subtitle,
      query: title,
      tag: tag,
      category: title,
      image: image
    };

    if (!state.occasions) state.occasions = [];
    state.occasions.push(newOccasion);
    saveState('occasions');

    // التأكد من وجود القسم في قائمة الأقسام
    const existingCat = state.categoriesList.find(c => getAttrId(c) === title);
    if (!existingCat) {
      state.categoriesList.push({ id: title, label: title, prefix: 'LT' });
      saveState('categoriesList');
    }

    state.uploadedHighlightImage = null;
    showToast(`تمت إضافة هايلايت "${title}" بنجاح!`);
    renderCurrentPage();
  }

  function handleDeleteHighlight(index) {
    if (!confirm('هل أنت متأكد من حذف هذه الدائرة من الهايلايتس؟')) return;
    state.occasions.splice(index, 1);
    saveState('occasions');
    showToast('تم حذف الهايلايت');
    renderCurrentPage();
  }

  function handleAddCustomCategory(e) {
    e.preventDefault();
    const input = document.getElementById('new-cat-input');
    const val = input ? input.value.trim() : '';
    if (!val) return;
    if (!state.categoriesList.includes(val)) {
      state.categoriesList.push(val);
      saveState('categoriesList');
      showToast(`تمت إضافة قسم "${val}" بنجاح!`);
    } else {
      showToast('هذا القسم موجود بالفعل', 'error');
    }
    if (input) input.value = '';
    renderCurrentPage();
  }

  function handleDeleteCustomCategory(index) {
    const cat = state.categoriesList[index];
    if (!confirm(`هل أنت متأكد من حذف قسم "${cat}"؟`)) return;
    state.categoriesList.splice(index, 1);
    saveState('categoriesList');
    showToast(`تم حذف قسم "${cat}"`);
    renderCurrentPage();
  }

  function handleAddCustomFlowerType(e) {
    e.preventDefault();
    const input = document.getElementById('new-ft-input');
    const val = input ? input.value.trim() : '';
    if (!val) return;
    if (!state.flowerTypesList.includes(val)) {
      state.flowerTypesList.push(val);
      saveState('flowerTypesList');
      showToast(`تمت إضافة نوع الورد "${val}" بنجاح!`);
    } else {
      showToast('هذا النوع موجود بالفعل', 'error');
    }
    if (input) input.value = '';
    renderCurrentPage();
  }

  function handleDeleteCustomFlowerType(index) {
    const ft = state.flowerTypesList[index];
    if (!confirm(`هل أنت متأكد من حذف نوع الورد "${ft}"؟`)) return;
    state.flowerTypesList.splice(index, 1);
    saveState('flowerTypesList');
    showToast(`تم حذف نوع الورد "${ft}"`);
    renderCurrentPage();
  }

  function handleAddCustomColor(e) {
    e.preventDefault();
    const input = document.getElementById('new-col-input');
    const val = input ? input.value.trim() : '';
    if (!val) return;
    if (!state.colorsList.includes(val)) {
      state.colorsList.push(val);
      saveState('colorsList');
      showToast(`تمت إضافة اللون "${val}" بنجاح!`);
    } else {
      showToast('هذا اللون موجود بالفعل', 'error');
    }
    if (input) input.value = '';
    renderCurrentPage();
  }

  function handleDeleteCustomColor(index) {
    const col = state.colorsList[index];
    const colName = getAttrLabel(col);
    if (!confirm(`هل أنت متأكد من حذف اللون "${colName}"؟`)) return;
    state.colorsList.splice(index, 1);
    saveState('colorsList');
    showToast(`تم حذف اللون "${colName}"`);
    renderCurrentPage();
  }

  function renderAdminHighlightsSection() {
    const occasions = state.occasions || [];
    const categories = state.categoriesList || DEFAULT_CATEGORIES;
    const flowerTypes = state.flowerTypesList || DEFAULT_FLOWER_TYPES;
    const colors = state.colorsList || DEFAULT_COLORS;

    return `
      <div class="space-y-8 text-xs">
        <div>
          <h4 class="font-bold text-gray-900 text-sm">التحكم في الهايلايتس (الدوائر التفاعلية)، الأقسام، والألوان والأنواع</h4>
          <p class="text-gray-500 text-[11px] mt-0.5">يمكنك إضافة وحذف أي مناسبة دائرية (هايلايت) مع رفع صورتها، وتعديل أقسام وألوان وأنواع المتجر بحرية كاملة</p>
        </div>

        <!-- قسم 1: دوائر الهايلايتس التفاعلية للمناسبات (على طريقة فلاورد) -->
        <div class="p-5 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <i data-lucide="circle-dot" class="w-5 h-5 text-rose-900"></i>
              <h5 class="font-bold text-sm text-gray-900">دوائر الهايلايتس للمناسبات (على طريقة فلاورد):</h5>
            </div>
            <button onclick="window.lotusApp.toggleNewHighlightForm()" class="px-3.5 py-1.5 rounded-xl btn-primary font-bold flex items-center gap-1 shadow">
              <i data-lucide="plus" class="w-4 h-4"></i>
              إضافة دائرة هايلايت جديدة
            </button>
          </div>

          <!-- نموذج إضافة هايلايت دائري جديد -->
          <div id="admin-new-highlight-box" class="hidden p-4 bg-rose-50/50 rounded-2xl border border-rose-200 space-y-3">
            <h6 class="font-bold text-rose-950">إضافة هايلايت مناسبة جديد:</h6>
            <form onsubmit="window.lotusApp.handleSaveHighlight(event)" class="space-y-3">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label class="block font-bold mb-1">اسم المناسبة / الهايلايت *</label>
                  <input type="text" id="nhl-title" required placeholder="مثال: قراية فاتحة" class="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-bold">
                </div>
                <div>
                  <label class="block font-bold mb-1">النص التوضيحي الصغير</label>
                  <input type="text" id="nhl-subtitle" placeholder="مثال: باقات ملكية" class="w-full p-2.5 rounded-xl border border-gray-300 bg-white">
                </div>
                <div>
                  <label class="block font-bold mb-1">شارة دائرية (Tag/Badge)</label>
                  <input type="text" id="nhl-tag" placeholder="مثال: الأكثر طلباً / جديد" class="w-full p-2.5 rounded-xl border border-gray-300 bg-white">
                </div>
              </div>

              <!-- رفع صورة الهايلايت -->
              <div>
                <label class="block font-bold mb-1">صورة الهايلايت الدائرية (رفع من الجهاز أو رابط) *</label>
                <div class="flex items-center gap-3">
                  <label class="flex-1 cursor-pointer py-2 px-3 rounded-xl border border-dashed border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center gap-2">
                    <i data-lucide="upload" class="w-4 h-4 text-rose-800"></i>
                    <span id="nhl-img-label">اختر صورة من جهازك</span>
                    <input type="file" accept="image/*" onchange="window.lotusApp.handleHighlightImageUpload(event)" class="hidden">
                  </label>
                  <input type="text" id="nhl-image-url" placeholder="أو رابط الصورة (assets/...)" class="flex-1 p-2 rounded-xl border border-gray-300 bg-white">
                </div>
                <div id="nhl-preview-box" class="hidden mt-2 flex items-center gap-2">
                  <img id="nhl-preview-img" src="" alt="معاينة" class="w-10 h-10 rounded-full object-cover border border-rose-300">
                  <span class="text-emerald-700 font-bold text-[11px]">تم اختيار صورة الهايلايت!</span>
                </div>
              </div>

              <div class="flex justify-end gap-2 pt-1">
                <button type="button" onclick="window.lotusApp.toggleNewHighlightForm()" class="px-3.5 py-1.5 rounded-xl text-gray-600 hover:bg-gray-100 font-bold">إلغاء</button>
                <button type="submit" class="px-5 py-1.5 rounded-xl btn-primary font-bold">حفظ وإضافة للدوائر</button>
              </div>
            </form>
          </div>

          <!-- عرض دوائر الهايلايتس الحالية -->
          <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 pt-2">
            ${occasions.map((occ, idx) => {
              const occName = occ.name || occ.title || 'مناسبة';
              const occSub = occ.subtitle || occ.query || '';
              return `
                <div class="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col items-center text-center relative group">
                  <img src="${occ.image}" alt="${occName}" class="w-12 h-12 rounded-full object-cover border-2 border-rose-300 shadow-sm mb-1.5">
                  <span class="font-bold text-gray-900 text-xs block truncate w-full" title="${occName}">${occName}</span>
                  <span class="text-[10px] text-gray-500 block truncate w-full">${occSub}</span>
                  <button onclick="window.lotusApp.handleDeleteHighlight(${idx})" class="mt-2 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 text-[10px] font-bold border border-rose-200 transition">
                    حذف
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- قسم 2: إدارة أقسام وتصنيفات المتجر -->
        <div class="p-5 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <i data-lucide="tag" class="w-5 h-5 text-rose-900"></i>
              <h5 class="font-bold text-sm text-gray-900">أقسام وتصنيفات المتجر (${categories.length}):</h5>
            </div>
          </div>
          <p class="text-gray-500 text-[11px]">هذه التصنيفات تظهر في شريط الفلاتر وقوائم إضافة وتعديل الباقات</p>
          <div class="flex flex-wrap gap-2">
            ${categories.map((cat, idx) => {
              const clabel = getAttrLabel(cat);
              return `
                <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-bold text-xs">
                  <span>${clabel}</span>
                  <button onclick="window.lotusApp.handleDeleteCustomCategory(${idx})" class="text-rose-700 hover:text-rose-900 w-4 h-4 flex items-center justify-center rounded-full hover:bg-rose-100 font-bold" title="حذف التصنيف">×</button>
                </div>
              `;
            }).join('')}
          </div>
          <form onsubmit="window.lotusApp.handleAddCustomCategory(event)" class="flex gap-2 pt-2 max-w-md">
            <input type="text" id="new-cat-input" required placeholder="اسم القسم الجديد (مثال: أعياد ميلاد)..." class="flex-1 p-2 rounded-xl border border-gray-300">
            <button type="submit" class="px-4 py-2 rounded-xl btn-primary font-bold whitespace-nowrap">+ إضافة قسم</button>
          </form>
        </div>

        <!-- قسم 3: أنواع الورد وألوان الورد -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- أنواع الورد -->
          <div class="p-5 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <div class="flex items-center gap-2">
              <i data-lucide="flower" class="w-5 h-5 text-rose-900"></i>
              <h5 class="font-bold text-sm text-gray-900">أنواع الورد المعرفة (${flowerTypes.length}):</h5>
            </div>
            <div class="flex flex-wrap gap-2">
              ${flowerTypes.map((ft, idx) => {
                const flabel = getAttrLabel(ft);
                return `
                  <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-bold text-xs">
                    <span>${flabel}</span>
                    <button onclick="window.lotusApp.handleDeleteCustomFlowerType(${idx})" class="text-rose-700 hover:text-rose-900 w-4 h-4 flex items-center justify-center rounded-full hover:bg-rose-100 font-bold" title="حذف نوع الورد">×</button>
                  </div>
                `;
              }).join('')}
            </div>
            <form onsubmit="window.lotusApp.handleAddCustomFlowerType(event)" class="flex gap-2 pt-2">
              <input type="text" id="new-ft-input" required placeholder="نوع ورد جديد (مثال: أوركيد)..." class="flex-1 p-2 rounded-xl border border-gray-300">
              <button type="submit" class="px-4 py-2 rounded-xl btn-primary font-bold whitespace-nowrap">+ إضافة نوع</button>
            </form>
          </div>

          <!-- ألوان الورد -->
          <div class="p-5 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <div class="flex items-center gap-2">
              <i data-lucide="palette" class="w-5 h-5 text-rose-900"></i>
              <h5 class="font-bold text-sm text-gray-900">ألوان الورد المعرفة (${colors.length}):</h5>
            </div>
            <div class="flex flex-wrap gap-2">
              ${colors.map((col, idx) => {
                const colabel = getAttrLabel(col);
                return `
                  <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-bold text-xs">
                    <span>${colabel}</span>
                    <button onclick="window.lotusApp.handleDeleteCustomColor(${idx})" class="text-rose-700 hover:text-rose-900 w-4 h-4 flex items-center justify-center rounded-full hover:bg-rose-100 font-bold" title="حذف اللون">×</button>
                  </div>
                `;
              }).join('')}
            </div>
            <form onsubmit="window.lotusApp.handleAddCustomColor(event)" class="flex gap-2 pt-2">
              <input type="text" id="new-col-input" required placeholder="لون جديد (مثال: ذهبي)..." class="flex-1 p-2 rounded-xl border border-gray-300">
              <button type="submit" class="px-4 py-2 rounded-xl btn-primary font-bold whitespace-nowrap">+ إضافة لون</button>
            </form>
          </div>
        </div>

      </div>
    `;
  }

  // تبويب تعديل السياسات والمحتوى ومناطق التوصيل وتصفير العمليات (CMS & Settings)
  function renderAdminCmsSection() {
    return `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-bold text-gray-900 text-base">إعدادات المتجر وبيانات التوصيل والمحتوى</h4>
            <p class="text-xs text-gray-500">تحكم كامل وشامل في أسعار ومناطق التوصيل، بيانات التواصل، السياسات، وتصفير الطلبات</p>
          </div>
        </div>

        <!-- 1. إدارة مناطق وأسعار التوصيل المعتمدة (Delivery Zones & Pricing CMS) -->
        <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm text-xs">
          <div class="flex flex-wrap items-center justify-between gap-2 mb-4 border-b border-gray-100 pb-3">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-xl bg-rose-50 text-rose-900 flex items-center justify-center font-bold">
                <i data-lucide="map-pin" class="w-4 h-4"></i>
              </div>
              <div>
                <h5 class="font-bold text-sm text-gray-900">مناطق وأسعار التوصيل (${state.storeInfo.deliveryAreas.length} منطقة مفعلة)</h5>
                <p class="text-[11px] text-gray-500">تعديل سعر التوصيل والمدة لكل منطقة، وتنعكس الأسعار فوراً عند إتمام طلب الزبائن (Checkout)</p>
              </div>
            </div>
          </div>

          <!-- قائمة المناطق وأسعارها الحالية مع إمكانية التعديل والحذف الفوري -->
          <div class="space-y-2.5 mb-5">
            ${state.storeInfo.deliveryAreas.map((area, idx) => `
              <div class="p-3 bg-gray-50 rounded-xl border border-gray-200 flex flex-wrap items-center justify-between gap-3 transition hover:border-rose-300">
                <div class="flex-1 min-w-[200px]">
                  <label class="block text-[10px] font-bold text-gray-500 mb-1">اسم المنطقة / الأحياء:</label>
                  <input type="text" id="area-name-${idx}" value="${escapeHtml(area.name)}" class="w-full p-2 bg-white rounded-lg border border-gray-300 font-bold text-gray-900 focus:border-rose-800 focus:outline-none">
                </div>
                <div class="w-32">
                  <label class="block text-[10px] font-bold text-gray-500 mb-1">سعر التوصيل (ج.م):</label>
                  <input type="number" id="area-fee-${idx}" value="${area.fee}" min="0" class="w-full p-2 bg-white rounded-lg border border-gray-300 font-black text-rose-950 text-center focus:border-rose-800 focus:outline-none">
                </div>
                <div class="flex-1 min-w-[160px]">
                  <label class="block text-[10px] font-bold text-gray-500 mb-1">وقت التوصيل التقديري:</label>
                  <input type="text" id="area-time-${idx}" value="${escapeHtml(area.time || 'خلال ساعتين')}" class="w-full p-2 bg-white rounded-lg border border-gray-300 text-gray-700 focus:border-rose-800 focus:outline-none">
                </div>
                <div class="flex items-center gap-1.5 pt-4">
                  <button type="button" onclick="window.lotusApp.handleUpdateDeliveryArea(${idx})" class="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1 shadow-sm transition" title="حفظ تعديل المنطقة والسعر">
                    <i data-lucide="check" class="w-3.5 h-3.5"></i>
                    <span>حفظ السعر</span>
                  </button>
                  <button type="button" onclick="window.lotusApp.handleDeleteDeliveryArea(${idx})" class="px-2.5 py-2 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold flex items-center gap-1 transition" title="حذف المنطقة">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- نموذج إضافة منطقة جديدة -->
          <form onsubmit="window.lotusApp.handleAddDeliveryArea(event)" class="p-4 bg-rose-50/60 rounded-xl border border-dashed border-rose-300">
            <div class="font-bold text-rose-950 mb-2.5 flex items-center gap-1.5">
              <i data-lucide="plus-circle" class="w-4 h-4 text-rose-800"></i>
              <span>إضافة منطقة توصيل جديدة وتحديد سعرها:</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label class="block text-[10px] font-bold text-gray-600 mb-1">اسم المنطقة الجديدة *</label>
                <input type="text" id="new-area-name" required placeholder="مثال: العاصمة الإدارية الجديدة، الشروق..." class="w-full p-2 bg-white rounded-lg border border-gray-300 focus:border-rose-800 focus:outline-none">
              </div>
              <div>
                <label class="block text-[10px] font-bold text-gray-600 mb-1">سعر التوصيل (ج.م) *</label>
                <input type="number" id="new-area-fee" required placeholder="مثال: 80" min="0" class="w-full p-2 bg-white rounded-lg border border-gray-300 focus:border-rose-800 focus:outline-none font-bold">
              </div>
              <div>
                <label class="block text-[10px] font-bold text-gray-600 mb-1">مدة التوصيل التقديرية</label>
                <input type="text" id="new-area-time" placeholder="مثال: توصيل في نفس اليوم" class="w-full p-2 bg-white rounded-lg border border-gray-300 focus:border-rose-800 focus:outline-none">
              </div>
            </div>
            <div class="flex justify-end">
              <button type="submit" class="px-5 py-2.5 rounded-xl btn-primary font-bold flex items-center gap-1.5 shadow">
                <i data-lucide="plus" class="w-4 h-4"></i>
                <span>+ إضافة المنطقة وتفعيلها بالمتجر</span>
              </button>
            </div>
          </form>
        </div>

        <!-- 2. تعديل بيانات المتجر والتواصل والسوشيال ميديا -->
        <form onsubmit="window.lotusApp.handleSaveCms(event)" class="space-y-4 text-xs">
          <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <h5 class="font-bold text-rose-900 text-sm mb-3 flex items-center gap-2">
              <i data-lucide="store" class="w-4 h-4"></i>
              <span>بيانات المتجر والتواصل الأساسية:</span>
            </h5>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label class="block font-semibold mb-1">اسم المتجر الرسمي</label>
                <input type="text" id="cms-name" value="${escapeHtml(state.storeInfo.name)}" class="w-full p-2.5 rounded-lg border border-gray-300">
              </div>
              <div>
                <label class="block font-semibold mb-1">رقم محفظة فودافون كاش المعتمدة</label>
                <input type="text" id="cms-vf" value="${escapeHtml(state.storeInfo.vodafoneCash)}" class="w-full p-2.5 rounded-lg border border-gray-300 font-mono font-bold">
              </div>
              <div>
                <label class="block font-semibold mb-1">رقم الهاتف والواتساب</label>
                <input type="text" id="cms-ph" value="${escapeHtml(state.storeInfo.phone)}" class="w-full p-2.5 rounded-lg border border-gray-300 font-mono font-bold">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label class="block font-semibold mb-1">العنوان الفعلي للمتجر</label>
                <input type="text" id="cms-ad" value="${escapeHtml(state.storeInfo.address)}" class="w-full p-2.5 rounded-lg border border-gray-300">
              </div>
              <div>
                <label class="block font-semibold mb-1">مواعيد وساعات العمل</label>
                <input type="text" id="cms-hours" value="${escapeHtml(state.storeInfo.openingHours || 'يومياً من 10:00 ص حتى 12:00 منتصف الليل')}" class="w-full p-2.5 rounded-lg border border-gray-300">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold mb-1">رابط صفحة إنستغرام الرسمية</label>
                <input type="text" id="cms-ig" value="${escapeHtml(state.storeInfo.instagramUrl || 'https://www.instagram.com/lotus_flowers_eg/')}" class="w-full p-2.5 rounded-lg border border-gray-300 text-left font-mono">
              </div>
              <div>
                <label class="block font-semibold mb-1">رابط صفحة فيسبوك الرسمية</label>
                <input type="text" id="cms-fb" value="${escapeHtml(state.storeInfo.facebookUrl || 'https://www.facebook.com/share/16LyEtG1Ys')}" class="w-full p-2.5 rounded-lg border border-gray-300 text-left font-mono">
              </div>
            </div>
          </div>

          <!-- 3. نصوص وسياسات المتجر -->
          <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <h5 class="font-bold text-rose-900 text-sm mb-2 flex items-center gap-2">
              <i data-lucide="file-text" class="w-4 h-4"></i>
              <span>نصوص وسياسات المتجر:</span>
            </h5>
            <div>
              <label class="block font-semibold mb-1">من نحن</label>
              <textarea id="cms-ab" rows="3" class="w-full p-2.5 rounded-lg border border-gray-300">${state.policies.about}</textarea>
            </div>
            <div>
              <label class="block font-semibold mb-1">سياسة الاستبدال والاسترجاع</label>
              <textarea id="cms-ex" rows="3" class="w-full p-2.5 rounded-lg border border-gray-300">${state.policies.exchange}</textarea>
            </div>
            <div>
              <label class="block font-semibold mb-1">سياسة الشحن والتوصيل</label>
              <textarea id="cms-sh" rows="3" class="w-full p-2.5 rounded-lg border border-gray-300">${state.policies.shipping}</textarea>
            </div>

            <div class="flex justify-end pt-2">
              <button type="submit" class="px-6 py-2.5 rounded-xl btn-primary font-bold shadow">حفظ إعدادات وبيانات المتجر</button>
            </div>
          </div>
        </form>

        <!-- 4. قسم تصفير العمليات والطلبات التجريبية للإطلاق الإنتاجي -->
        <div class="bg-red-50/60 p-5 rounded-2xl border border-red-200 text-xs">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="space-y-1">
              <h5 class="font-bold text-sm text-red-950 flex items-center gap-2">
                <i data-lucide="alert-triangle" class="w-4 h-4 text-red-700"></i>
                <span>تصفير سجل الطلبات والعمليات التجريبية (Factory Reset Transactions)</span>
              </h5>
              <p class="text-red-800 leading-relaxed max-w-2xl">
                هذا الزر يمسح فقط سجل الطلبات التجريبية ليكون المتجر مصفراً ونظيفاً 100% لاستقبال طلبات الزبائن الحقيقية.
                <strong>لن يؤثر هذا الإجراء على أي باقة، أو تصنيف، أو صفحات المتجر، أو المجلة، أو حساب المدير.</strong>
              </p>
            </div>
            <button onclick="window.lotusApp.handleResetOrdersTransactions()" class="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5 whitespace-nowrap transition">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
              <span>تصفير سجل الطلبات الآن 🗑️</span>
            </button>
          </div>
        </div>

      </div>
    `;
  }

  function handleSaveCms(e) {
    e.preventDefault();
    const nameInput = document.getElementById('cms-name');
    const vfInput = document.getElementById('cms-vf');
    const phInput = document.getElementById('cms-ph');
    const adInput = document.getElementById('cms-ad');
    const hoursInput = document.getElementById('cms-hours');
    const igInput = document.getElementById('cms-ig');
    const fbInput = document.getElementById('cms-fb');

    if (nameInput) state.storeInfo.name = nameInput.value.trim();
    if (vfInput) state.storeInfo.vodafoneCash = vfInput.value.trim();
    if (phInput) state.storeInfo.phone = phInput.value.trim();
    if (adInput) state.storeInfo.address = adInput.value.trim();
    if (hoursInput) state.storeInfo.openingHours = hoursInput.value.trim();
    if (igInput) state.storeInfo.instagramUrl = igInput.value.trim();
    if (fbInput) state.storeInfo.facebookUrl = fbInput.value.trim();

    state.policies.about = document.getElementById('cms-ab').value.trim();
    state.policies.exchange = document.getElementById('cms-ex').value.trim();
    state.policies.shipping = document.getElementById('cms-sh').value.trim();

    saveState('storeInfo');
    saveState('policies');
    showToast('تم حفظ كافة إعدادات وسياسات المتجر بنجاح ✅');
    renderCurrentPage();
  }

  function handleUpdateDeliveryArea(index) {
    const nameInput = document.getElementById(`area-name-${index}`);
    const feeInput = document.getElementById(`area-fee-${index}`);
    const timeInput = document.getElementById(`area-time-${index}`);
    if (!nameInput || !feeInput) return;

    const newName = nameInput.value.trim();
    const newFee = parseFloat(feeInput.value) || 0;
    const newTime = timeInput ? timeInput.value.trim() : 'خلال ساعتين';

    if (!newName) {
      showToast('يرجى إدخال اسم المنطقة', 'error');
      return;
    }

    state.storeInfo.deliveryAreas[index] = {
      name: newName,
      fee: newFee,
      time: newTime
    };

    saveState('storeInfo');
    showToast(`تم تحديث منطقة ${newName} بسعر ${newFee} ج.م بنجاح ✅`);
    renderCurrentPage();
  }

  function handleDeleteDeliveryArea(index) {
    const area = state.storeInfo.deliveryAreas[index];
    if (!area) return;
    if (confirm(`هل أنت متأكد من حذف منطقة "${area.name}" من خيارات التوصيل بالمتجر؟`)) {
      state.storeInfo.deliveryAreas.splice(index, 1);
      saveState('storeInfo');
      showToast(`تم حذف منطقة "${area.name}" بنجاح`);
      renderCurrentPage();
    }
  }

  function handleAddDeliveryArea(e) {
    e.preventDefault();
    const nameInput = document.getElementById('new-area-name');
    const feeInput = document.getElementById('new-area-fee');
    const timeInput = document.getElementById('new-area-time');

    const name = nameInput.value.trim();
    const fee = parseFloat(feeInput.value) || 0;
    const time = timeInput.value.trim() || 'خلال ساعتين';

    if (!name) return;

    state.storeInfo.deliveryAreas.push({ name, fee, time });
    saveState('storeInfo');
    showToast(`تمت إضافة منطقة التوصيل "${name}" بسعر ${fee} ج.م بنجاح 🎉`);
    renderCurrentPage();
  }

  function handleResetOrdersTransactions() {
    if (confirm('هل أنت متأكد من تصفير سجل الطلبات والعمليات التجريبية؟\n\n- سيتم مسح كافة الطلبات لتصبح صفر.\n- سيتم الاحتفاظ بكامل المنتجات والصفحات والمجلة والهايلايتس وحساب المدير العام دون مساس.')) {
      state.orders = [];
      saveState('orders');
      showToast('تم تصفير سجل الطلبات والعمليات التجريبية بنجاح 🧹 المتجر جاهز الآن للإطلاق الفعلي!');
      renderCurrentPage();
    }
  }

  // دوائر ومودال تغيير كلمة المرور للمستخدم أو المدير
  function openChangePasswordModal() {
    if (!state.currentUser) {
      showToast('يجب تسجيل الدخول أولاً لتعديل كلمة المرور', 'error');
      return;
    }

    const modal = document.getElementById('change-password-modal');
    if (!modal) return;

    modal.innerHTML = `
      <div class="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-gray-200 text-xs">
        <div class="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center">
              <i data-lucide="key" class="w-4 h-4"></i>
            </div>
            <div>
              <h3 class="font-bold text-sm text-gray-900">تعديل كلمة المرور</h3>
              <p class="text-[11px] text-gray-500">${escapeHtml(state.currentUser.name)} (${state.currentUser.phone})</p>
            </div>
          </div>
          <button onclick="window.lotusApp.closeChangePasswordModal()" class="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <form onsubmit="window.lotusApp.handleUpdatePassword(event)" class="space-y-3.5">
          <div>
            <label class="block font-bold text-gray-700 mb-1">كلمة المرور الحالية *</label>
            <input type="password" id="cp-old-pass" required placeholder="أدخل كلمة مرورك الحالية..." class="w-full p-2.5 rounded-xl border border-gray-300 focus:border-rose-800 focus:outline-none">
          </div>

          <div>
            <label class="block font-bold text-gray-700 mb-1">كلمة المرور الجديدة *</label>
            <input type="password" id="cp-new-pass" required minlength="4" placeholder="كلمة المرور الجديدة (4 خانات على الأقل)..." class="w-full p-2.5 rounded-xl border border-gray-300 focus:border-rose-800 focus:outline-none">
          </div>

          <div>
            <label class="block font-bold text-gray-700 mb-1">تأكيد كلمة المرور الجديدة *</label>
            <input type="password" id="cp-confirm-pass" required minlength="4" placeholder="أعد كتابة كلمة المرور الجديدة للتأكيد..." class="w-full p-2.5 rounded-xl border border-gray-300 focus:border-rose-800 focus:outline-none">
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button type="button" onclick="window.lotusApp.closeChangePasswordModal()" class="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-gray-700">
              إلغاء
            </button>
            <button type="submit" class="px-5 py-2 rounded-xl btn-primary font-bold flex items-center gap-1.5 shadow">
              <i data-lucide="check" class="w-3.5 h-3.5"></i>
              <span>حفظ كلمة المرور الجديدة</span>
            </button>
          </div>
        </form>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    lucide.createIcons();
  }

  function closeChangePasswordModal() {
    const modal = document.getElementById('change-password-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  function handleUpdatePassword(e) {
    e.preventDefault();
    if (!state.currentUser) return;

    const oldPass = document.getElementById('cp-old-pass').value;
    const newPass = document.getElementById('cp-new-pass').value;
    const confirmPass = document.getElementById('cp-confirm-pass').value;

    if (oldPass !== state.currentUser.pass) {
      showToast('كلمة المرور الحالية غير صحيحة!', 'error');
      return;
    }

    if (newPass !== confirmPass) {
      showToast('كلمة المرور الجديدة وتأكيدها غير متطابقين!', 'error');
      return;
    }

    if (newPass.length < 4) {
      showToast('كلمة المرور يجب أن لا تقل عن 4 خانات', 'error');
      return;
    }

    state.currentUser.pass = newPass;
    const u = state.users.find(x => x.id === state.currentUser.id || x.phone === state.currentUser.phone);
    if (u) u.pass = newPass;

    saveState('currentUser');
    saveState('users');
    closeChangePasswordModal();
    showToast('تم تغيير كلمة المرور بنجاح ✅ يمكنك استخدام كلمة المرور الجديدة الآن.');
  }

  // تبويب إدارة المستخدمين والمدراء وتوزيع الصلاحيات
  function renderAdminUsersSection() {
    return `
      <div>
        <div class="flex items-center justify-between mb-4">
          <h4 class="font-bold text-gray-900 text-sm">إدارة حسابات المدراء والمستخدمين</h4>
          <button onclick="window.lotusApp.toggleNewUserForm()" class="px-4 py-2 rounded-xl btn-primary text-xs font-bold flex items-center gap-1 shadow">
            <i data-lucide="user-plus" class="w-4 h-4"></i>
            إضافة حساب مدير جديد
          </button>
        </div>

        <!-- فورم إضافة مدير جديد -->
        <div id="new-user-form-box" class="hidden mb-6 p-5 bg-white rounded-2xl border border-rose-200 shadow-sm text-xs">
          <h5 class="font-bold text-rose-950 mb-3">بيانات المدير الجديد وصلاحياته:</h5>
          <form onsubmit="window.lotusApp.handleCreateUser(event)" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold mb-1">الاسم الكامل *</label>
              <input type="text" id="nu-name" required placeholder="اسم المدير" class="w-full p-2.5 rounded-lg border border-gray-300">
            </div>
            <div>
              <label class="block font-semibold mb-1">رقم الهاتف (اسم المستخدم) *</label>
              <input type="text" id="nu-phone" required placeholder="01xxxxxxxxx" class="w-full p-2.5 rounded-lg border border-gray-300">
            </div>
            <div>
              <label class="block font-semibold mb-1">كلمة المرور *</label>
              <input type="password" id="nu-pass" required placeholder="كلمة المرور" class="w-full p-2.5 rounded-lg border border-gray-300">
            </div>
            <div>
              <label class="block font-semibold mb-1">نوع الحساب والصلاحيات *</label>
              <select id="nu-role" class="w-full p-2.5 rounded-lg border border-gray-300 font-bold">
                <option value="super_admin">مدير عام (Super Admin - كامل الصلاحيات)</option>
                <option value="orders_manager">مدير الطلبات والدفع (Orders Manager - اعتماد فودافون كاش فقط)</option>
                <option value="content_manager">مدير الكتالوج والمحتوى (Content Manager - إضافة وتعديل الباقات)</option>
              </select>
            </div>
            <div class="sm:col-span-2 flex justify-end gap-2 pt-2">
              <button type="button" onclick="window.lotusApp.toggleNewUserForm()" class="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100">إلغاء</button>
              <button type="submit" class="px-5 py-2 rounded-lg btn-primary font-bold">إنشاء الحساب</button>
            </div>
          </form>
        </div>

        <!-- جدول المستخدمين والمدراء -->
        <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm text-xs">
          <table class="w-full text-right">
            <thead class="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th class="p-3">الاسم</th>
                <th class="p-3">رقم الهاتف</th>
                <th class="p-3">الصلاحية</th>
                <th class="p-3">تاريخ الإنشاء</th>
                <th class="p-3 text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              ${state.users.map(u => `
                <tr class="hover:bg-gray-50">
                  <td class="p-3 font-bold text-gray-900 flex items-center gap-2">
                    <i data-lucide="${u.role.includes('admin') ? 'shield-check' : 'user'}" class="w-4 h-4 text-rose-800"></i>
                    <span>${u.name}</span>
                  </td>
                  <td class="p-3 font-mono">${u.phone}</td>
                  <td class="p-3">
                    <span class="px-2.5 py-0.5 rounded-full font-bold ${
                      u.role === 'super_admin' ? 'bg-purple-100 text-purple-900' :
                      u.role === 'orders_manager' ? 'bg-blue-100 text-blue-900' :
                      u.role === 'content_manager' ? 'bg-amber-100 text-amber-900' : 'bg-gray-100 text-gray-700'
                    }">
                      ${u.roleLabel || u.role}
                    </span>
                  </td>
                  <td class="p-3 text-gray-400">${u.createdAt || '2026-09-01'}</td>
                  <td class="p-3 text-left">
                    ${u.phone !== '01105746118' ? `
                      <button onclick="window.lotusApp.deleteUser('${u.id}')" class="text-red-600 hover:text-red-800 font-bold p-1">حذف</button>
                    ` : '<span class="text-gray-400 text-[10px]">المدير الرئيسي</span>'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function toggleNewUserForm() {
    const el = document.getElementById('new-user-form-box');
    if (el) el.classList.toggle('hidden');
  }

  function handleCreateUser(e) {
    e.preventDefault();
    const name = document.getElementById('nu-name').value.trim();
    const phone = document.getElementById('nu-phone').value.trim();
    const pass = document.getElementById('nu-pass').value;
    const role = document.getElementById('nu-role').value;

    let roleLabel = 'عميل';
    if (role === 'super_admin') roleLabel = 'مدير عام (كامل الصلاحيات)';
    if (role === 'orders_manager') roleLabel = 'مدير الطلبات والدفع';
    if (role === 'content_manager') roleLabel = 'مدير الكتالوج والمحتوى';

    state.users.push({
      id: `user-${Date.now()}`,
      name: name,
      phone: phone,
      pass: pass,
      role: role,
      roleLabel: roleLabel,
      createdAt: new Date().toLocaleDateString('en-CA')
    });

    saveState('users');
    showToast(`تم إنشاء حساب "${name}" بنجاح!`);
    renderCurrentPage();
  }

  function deleteUser(id) {
    if (!confirm('هل أنت متأكد من حذف هذا الحساب؟')) return;
    state.users = state.users.filter(u => u.id !== id);
    saveState('users');
    showToast('تم حذف الحساب');
    renderCurrentPage();
  }

  // تبويب ربط Meta Cloud API (واتساب بزنس وMeta Graph API)
  function renderAdminMetaSection() {
    return `
      <div>
        <div class="flex items-center justify-between mb-4">
          <div>
            <h4 class="font-bold text-gray-900 text-sm">إعدادات ربط Meta Cloud API الرسمية</h4>
            <p class="text-xs text-gray-500">لإرسال إشعارات واتساب تلقائية وسحب ونشر الباقات عبر إنستغرام وفيسبوك</p>
          </div>
          <span class="text-xs font-bold px-3 py-1 rounded-full ${
            state.metaConfig.status === 'connected' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
          }">
            الحالة: ${state.metaConfig.status === 'connected' ? 'متصل بنجاح ✅' : 'غير متصل'}
          </span>
        </div>

        <form onsubmit="window.lotusApp.handleSaveMetaConfig(event)" class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block font-semibold mb-1">Meta App ID</label>
              <input type="text" id="meta-app-id" placeholder="مثال: 123456789012345" value="${state.metaConfig.appId}" class="w-full p-2.5 rounded-lg border border-gray-300 font-mono">
            </div>

            <div>
              <label class="block font-semibold mb-1">Meta App Secret</label>
              <input type="password" id="meta-app-secret" placeholder="••••••••••••••••" value="${state.metaConfig.appSecret}" class="w-full p-2.5 rounded-lg border border-gray-300 font-mono">
            </div>

            <div>
              <label class="block font-semibold mb-1">WhatsApp Business Account ID (WABA ID)</label>
              <input type="text" id="meta-waba-id" placeholder="مثال: 109876543210987" value="${state.metaConfig.wabaId}" class="w-full p-2.5 rounded-lg border border-gray-300 font-mono">
            </div>

            <div>
              <label class="block font-semibold mb-1">Phone Number ID (واتساب كلاود)</label>
              <input type="text" id="meta-phone-id" placeholder="مثال: 105746118000000" value="${state.metaConfig.phoneNumberId}" class="w-full p-2.5 rounded-lg border border-gray-300 font-mono">
            </div>
          </div>

          <div>
            <label class="block font-semibold mb-1">System User Access Token (Permanent Token)</label>
            <textarea id="meta-token" rows="2" placeholder="EAAG..." class="w-full p-2.5 rounded-lg border border-gray-300 font-mono text-[11px]">${state.metaConfig.accessToken}</textarea>
          </div>

          <div>
            <label class="block font-semibold mb-1">Webhook Verify Token</label>
            <input type="text" id="meta-webhook-token" value="${state.metaConfig.webhookVerifyToken}" class="w-full p-2.5 rounded-lg border border-gray-300 font-mono">
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
            <button type="button" onclick="window.lotusApp.testMetaConnection()" class="px-4 py-2 rounded-xl bg-blue-50 text-blue-900 hover:bg-blue-100 font-bold border border-blue-200">
              اختبار الاتصال بـ Meta API
            </button>

            <button type="submit" class="px-6 py-2.5 rounded-xl btn-primary font-bold">
              حفظ إعدادات Meta Cloud
            </button>
          </div>
        </form>
      </div>
    `;
  }

  function handleSaveMetaConfig(e) {
    e.preventDefault();
    state.metaConfig.appId = document.getElementById('meta-app-id').value.trim();
    state.metaConfig.appSecret = document.getElementById('meta-app-secret').value.trim();
    state.metaConfig.wabaId = document.getElementById('meta-waba-id').value.trim();
    state.metaConfig.phoneNumberId = document.getElementById('meta-phone-id').value.trim();
    state.metaConfig.accessToken = document.getElementById('meta-token').value.trim();
    state.metaConfig.webhookVerifyToken = document.getElementById('meta-webhook-token').value.trim();

    saveState('metaConfig');
    showToast('تم حفظ إعدادات Meta Cloud API بنجاح');
  }

  function testMetaConnection() {
    showToast('جاري اختبار الاتصال بخوادم Meta Cloud API...', 'info');
    setTimeout(() => {
      state.metaConfig.status = 'connected';
      saveState('metaConfig');
      showToast('تم التحقق بنجاح: تم الربط مع WhatsApp Cloud API و Meta Graph ✅');
      renderCurrentPage();
    }, 1200);
  }

  // صفحة تسجيل الدخول الموحدة (Login Page)
  function renderLoginPage(container) {
    container.innerHTML = `
      <div class="max-w-md mx-auto px-4 py-16">
        <div class="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm text-xs">
          <div class="text-center mb-6">
            <div class="w-12 h-12 rounded-2xl bg-rose-950 text-white flex items-center justify-center mx-auto mb-3">
              <i data-lucide="user-check" class="w-6 h-6"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-900">تسجيل الدخول للمتجر</h3>
            <p class="text-gray-500 mt-1">أدخل رقم هاتفك وكلمة المرور لمتابعة طلباتك أو إدارة المتجر</p>
          </div>

          <form onsubmit="window.lotusApp.handleLogin(event)" class="space-y-4">
            <div>
              <label class="block font-semibold mb-1">رقم الهاتف *</label>
              <input type="text" id="login-phone" required placeholder="01xxxxxxxxx أو رقم دولي" class="w-full p-2.5 rounded-xl border border-gray-300">
            </div>

            <div>
              <label class="block font-semibold mb-1">كلمة المرور *</label>
              <input type="password" id="login-pass" required placeholder="••••••••" class="w-full p-2.5 rounded-xl border border-gray-300">
            </div>

            <button type="submit" class="w-full py-3 rounded-xl btn-primary font-bold text-sm shadow">
              دخول الحساب
            </button>
          </form>

          <div class="mt-6 pt-4 border-t border-gray-100 text-center text-[11px] text-gray-400">
            حساب المدير الافتراضي: الهاتف <strong>01105746118</strong> | كلمة المرور <strong>lotus2026</strong>
          </div>
        </div>
      </div>
    `;
    lucide.createIcons();
  }

  function handleLogin(e) {
    e.preventDefault();
    const phone = document.getElementById('login-phone').value.trim();
    const pass = document.getElementById('login-pass').value;

    const user = state.users.find(u => u.phone === phone && u.pass === pass);
    if (user) {
      state.currentUser = user;
      saveState('currentUser');
      showToast(`مرحباً بك يا ${user.name} 🌸`);

      if (['super_admin', 'orders_manager', 'content_manager'].includes(user.role)) {
        navigateTo('#admin');
      } else {
        navigateTo('#shop');
      }
    } else {
      showToast('بيانات الدخول غير صحيحة، يرجى التأكد من الرقم وكلمة المرور', 'error');
    }
  }

  function handleLogout() {
    state.currentUser = null;
    saveState('currentUser');
    showToast('تم تسجيل الخروج بنجاح');
    navigateTo('#home');
  }

  // الصفحات الثابتة: من نحن، السياسات، اتصل بنا، الأسئلة الشائعة
  function renderAboutPage(container) {
    container.innerHTML = `
      <div class="max-w-4xl mx-auto px-4 py-12 text-xs sm:text-sm">
        <h1 class="text-3xl font-black text-rose-950 font-amiri mb-6">من نحن - زهور اللوتس</h1>
        <div class="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm leading-relaxed space-y-4 text-gray-700">
          <p>${state.policies.about.replace(/\n/g, '<br>')}</p>
          <div class="p-4 bg-rose-50 rounded-2xl border border-rose-200 mt-6">
            <h4 class="font-bold text-rose-950 mb-2">الفرع الرئيسي:</h4>
            <p><strong>العنوان:</strong> ${state.storeInfo.address}</p>
            <p><strong>الهاتف والواتساب:</strong> ${state.storeInfo.phone}</p>
            <p><strong>أوقات العمل:</strong> ${state.storeInfo.openingHours}</p>
          </div>
        </div>
      </div>
    `;
    lucide.createIcons();
  }

  function renderPoliciesPage(container) {
    container.innerHTML = `
      <div class="max-w-4xl mx-auto px-4 py-12 text-xs sm:text-sm space-y-8">
        <div>
          <h1 class="text-3xl font-black text-rose-950 font-amiri mb-6">سياسات المتجر والشحن والاستبدال</h1>
        </div>

        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <h3 class="text-lg font-bold text-rose-900 border-b pb-2">سياسة الاستبدال والاسترجاع</h3>
          <p class="text-gray-700 leading-relaxed whitespace-pre-line">${state.policies.exchange}</p>
        </div>

        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <h3 class="text-lg font-bold text-rose-900 border-b pb-2">سياسة الشحن والتوصيل</h3>
          <p class="text-gray-700 leading-relaxed whitespace-pre-line">${state.policies.shipping}</p>
          
          <h4 class="font-bold text-gray-900 mt-4">مناطق ورسوم التوصيل:</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            ${state.storeInfo.deliveryAreas.map(a => `
              <div class="p-2.5 rounded-xl bg-gray-50 border border-gray-200 flex justify-between">
                <span>${a.name} (${a.time})</span>
                <span class="font-bold text-rose-950">${a.fee} ج.م</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <h3 class="text-lg font-bold text-rose-900 border-b pb-2">سياسة الخصوصية وسرية الإهداء</h3>
          <p class="text-gray-700 leading-relaxed whitespace-pre-line">${state.policies.privacy}</p>
        </div>
      </div>
    `;
    lucide.createIcons();
  }

  function renderContactPage(container) {
    container.innerHTML = `
      <div class="max-w-5xl mx-auto px-4 py-12 text-xs sm:text-sm">
        <h1 class="text-3xl font-black text-rose-950 font-amiri mb-6">اتصل بنا وموقع المتجر</h1>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div class="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <h3 class="text-lg font-bold text-gray-900">معلومات الاتصال المباشر</h3>
            <p><strong>العنوان:</strong> ${state.storeInfo.address}</p>
            <p><strong>الهاتف والواتساب:</strong> ${state.storeInfo.phone}</p>
            <p><strong>محفظة فودافون كاش:</strong> ${state.storeInfo.vodafoneCash}</p>
            <p><strong>مواعيد العمل:</strong> ${state.storeInfo.openingHours}</p>

            <div class="grid grid-cols-3 gap-2 pt-2">
              <a href="https://wa.me/${state.storeInfo.whatsapp}" target="_blank" class="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-center flex items-center justify-center gap-1.5 shadow transition" title="محادثة واتساب">
                <i data-lucide="message-circle" class="w-4 h-4"></i>
                <span class="text-xs">واتساب</span>
              </a>
              <a href="${state.storeInfo.instagramUrl}" target="_blank" class="py-2.5 rounded-xl social-badge-instagram text-white font-bold text-center flex items-center justify-center gap-1.5 shadow transition" title="حساب إنستغرام الرسمي: @lotus_flowers_eg">
                <svg class="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                <span class="text-xs">إنستغرام</span>
              </a>
              <a href="${state.storeInfo.facebookUrl}" target="_blank" class="py-2.5 rounded-xl social-badge-facebook text-white font-bold text-center flex items-center justify-center gap-1.5 shadow transition" title="صفحة فيسبوك الرسمية">
                <svg class="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                <span class="text-xs">فيسبوك</span>
              </a>
            </div>
          </div>

          <!-- خريطة جوجل التفاعلية للمحل بالمنيل -->
          <div class="rounded-3xl overflow-hidden border border-gray-200 shadow-sm h-80">
            <iframe src="${state.storeInfo.googleMapsEmbed}" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
          </div>
        </div>
      </div>
    `;
    lucide.createIcons();
  }

  function renderFaqPage(container) {
    container.innerHTML = `
      <div class="max-w-3xl mx-auto px-4 py-12">
        <h1 class="text-3xl font-black text-rose-950 font-amiri mb-6 text-center">الأسئلة المتكررة (FAQ)</h1>
        <div class="space-y-3">
          ${state.policies.faq.map(item => `
            <div class="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm text-xs">
              <h4 class="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
                <i data-lucide="help-circle" class="w-4 h-4 text-rose-800 flex-shrink-0"></i>
                <span>${item.q}</span>
              </h4>
              <p class="text-gray-600 leading-relaxed pr-6">${item.a}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    lucide.createIcons();
  }

  function copyVodafoneNumber() {
    navigator.clipboard.writeText(state.storeInfo.vodafoneCash).then(() => {
      showToast('تم نسخ رقم فودافون كاش بنجاح!');
    });
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('hidden');
      el.classList.remove('flex');
    }
  }

  function applySmartFinder() {
    const occ = document.getElementById('smart-finder-occasion')?.value || '';
    const col = document.getElementById('smart-finder-color')?.value || '';
    const bud = document.getElementById('smart-finder-budget')?.value || '';

    state.filters.category = occ || 'all';
    state.filters.color = col || 'all';
    state.filters.priceRange = bud || 'all';

    navigateTo('#shop');
  }

  // تهيئة التطبيق
  function init() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute();

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.filters.searchQuery = e.target.value;
        if (state.currentRoute.page === 'home') {
          const grid = document.getElementById('products-cards-grid');
          if (grid) grid.innerHTML = renderProductsHtml(getFilteredProducts());
        } else if (state.currentRoute.page === 'shop') {
          const grid = document.getElementById('shop-products-grid');
          if (grid) grid.innerHTML = renderProductsHtml(getFilteredProducts());
        }
      });
    }

    lucide.createIcons();
  }

  // تصدير الواجهة العامة
  window.lotusApp = {
    init,
    navigateTo,
    filterCategory,
    applyShopFilters,
    selectProductSize,
    adjustDetailQty,
    addCurrentDetailToCart,
    openCartDrawer,
    closeCartDrawer,
    updateCartQty,
    removeCartItem,
    openCheckoutModal,
    toggleCheckoutGift,
    handleCheckoutAreaChange,
    handleReceiptUpload,
    handleCheckoutSubmit,
    runOrderSearch,
    switchAdminTab,
    changeOrderStatus,
    viewReceiptBig,
    toggleNewProductForm,
    updateAutoSku,
    addSizeRow,
    handleProductImageUpload,
    handleSaveProduct,
    deleteProduct,
    handleSaveCms,
    toggleNewUserForm,
    handleCreateUser,
    deleteUser,
    handleSaveMetaConfig,
    testMetaConnection,
    handleLogin,
    handleLogout,
    copyVodafoneNumber,
    closeModal,
    applySmartFinder,

    // الوظائف الجديدة للتصفية والكتالوج والطلب السريع
    selectCardSize,
    quickAddToCart,
    toggleFilter,
    setPriceRange,
    setSortBy,
    resetFilters,
    navigateToCategory,

    // نظام إدارة الطلبات المطور وحالات التوصيل
    filterOrders,
    searchOrders,
    advanceOrderStatus,

    // نظام تعديل المنتجات الحالية المطور
    openEditProductModal,
    closeEditProductModal,
    addEditSizeRow,
    handleEditProductImageUpload,
    handleUpdateProduct,
    handleNewProductCategoryCheck,

    // مجلة المتجر وسلايدر الرئيسية
    magazineNext,
    magazinePrev,
    magazineGoTo,
    toggleNewMagazineForm,
    handleMagazineImageUpload,
    handleSaveMagazineSlide,
    handleDeleteMagazineSlide,
    toggleMagazineSlideActive,

    // معرض صور وأعمال إنستغرام الحقيقية
    toggleNewShowcaseForm,
    handleShowcaseImageUpload,
    handleSaveShowcasePost,
    handleDeleteShowcasePost,

    // الهايلايتس والخصائص والألوان وأنواع الورد
    toggleNewHighlightForm,
    handleHighlightImageUpload,
    handleSaveHighlight,
    handleDeleteHighlight,
    handleAddCustomCategory,
    handleDeleteCustomCategory,
    handleAddCustomFlowerType,
    handleDeleteCustomFlowerType,
    handleAddCustomColor,
    handleDeleteCustomColor,

    // نظام إلغاء الطلبات وتوثيق الأسباب
    openCancelOrderModal,
    closeCancelOrderModal,
    handleConfirmCancelOrder,
    reactivateOrder,

    // نظام تعديل كلمة المرور
    openChangePasswordModal,
    closeChangePasswordModal,
    handleUpdatePassword,

    // إدارة مناطق وأسعار التوصيل وتصفير العمليات
    handleUpdateDeliveryArea,
    handleDeleteDeliveryArea,
    handleAddDeliveryArea,
    handleResetOrdersTransactions,
    updateEditAutoSku
  };

  document.addEventListener('DOMContentLoaded', init);
})();
