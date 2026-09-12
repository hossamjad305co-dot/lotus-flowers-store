// بيانات متجر زهور اللوتس (Lotus Flowers EG)
// مبنية على بيانات حقيقية 100% مستخرجة من الحسابات الرسمية
// المقر: ٣ شارع سعيد ذو الفقار، المنيل، القاهرة | هاتف وواتساب: 01105746118

const DEFAULT_STORE_INFO = {
  name: "زهور اللوتس & Lotus Flowers",
  tagline: "محل ورد & هدايا & جاليري - المنيل، القاهرة",
  phone: "01105746118",
  whatsapp: "201105746118",
  vodafoneCash: "01105746118",
  address: "٣ شارع سعيد ذو الفقار، المنيل، القاهرة، مصر",
  googleMapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3454.0894082855586!2d31.2227188!3d30.0342674!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x145846d0a793a343%3A0x7e8346cb39c18511!2z2LTYp9ix2Lkg2LPYudmK2K8g2LDZiCDYp9mE2YHZgtin2LHYjCDYp9mE2YXZhtmK2YTYjCDZhdit2KfZgdi42Kkg2KfZhNmC2KfZh9ix2KnYjCDZhdi12LE!5e0!3m2!1sar!2seg!4v1710000000000!5m2!1sar!2seg",
  facebookUrl: "https://www.facebook.com/share/16LyEtG1Ys",
  instagramUrl: "https://www.instagram.com/lotus_flowers_eg/",
  openingHours: "يومياً من 10:00 صباحاً حتى 12:00 منتصف الليل",
  deliveryAreas: [
    { name: "المنيل ومصر القديمة", fee: 35, time: "خلال ساعتين" },
    { name: "وسط البلد والزمالك وجاردن سيتي", fee: 50, time: "خلال 2-3 ساعات" },
    { name: "الدقي والمهندسين والعجوزة", fee: 50, time: "خلال 2-3 ساعات" },
    { name: "المعادي والمقطم", fee: 65, time: "خلال 3 ساعات" },
    { name: "مدينة نصر ومصر الجديدة", fee: 65, time: "خلال 3 ساعات" },
    { name: "التجمع والقاهرة الجديدة والرحاب", fee: 85, time: "توصيل في نفس اليوم" },
    { name: "الشيخ زايد ومدينة 6 أكتوبر", fee: 90, time: "توصيل في نفس اليوم" },
    { name: "الجيزة وفيصل والهرم", fee: 60, time: "خلال 3 ساعات" },
  ]
};

// بادئات الأكواد التلقائية للمنتجات بحسب التصنيف
const CATEGORY_CODE_PREFIXES = {
  "قراية فاتحة": "QF",
  "حب ورومانسية": "LV",
  "تخرج": "GD",
  "زواج وخطوبة": "WD",
  "صداقة وامتنان": "FR",
  "مولود جديد": "NB",
  "طلب مخصوص": "CS"
};

// دوائر المناسبات على نمط فلاورد (Floward-Style Occasions)
const FLOWARD_OCCASIONS = [
  { id: "occ-fatiha", name: "صواني قراية فاتحة 💍", query: "قراية فاتحة", image: "assets/products/p01.jpg" },
  { id: "occ-love", name: "أحبك ورومانسية ❤️", query: "حب ورومانسية", image: "assets/products/p02.jpg" },
  { id: "occ-grad", name: "مبروك التخرج 🎓", query: "تخرج", image: "assets/products/p03.jpg" },
  { id: "occ-bday", name: "عيد ميلاد سعيد 🎂", query: "حب ورومانسية", image: "assets/products/p04.jpg" },
  { id: "occ-congrats", name: "ألف مبروك وزواج 🎉", query: "زواج وخطوبة", image: "assets/products/p08.jpg" },
  { id: "occ-heal", name: "تمنيات بالشفاء 💐", query: "صداقة وامتنان", image: "assets/products/p06.jpg" },
  { id: "occ-baby", name: "تهنئة بالمولود 🧸", query: "طلب مخصوص", image: "assets/products/p07.jpg" }
];

// أفكار الهدايا الرائعة على نمط فلاورد (Floward-Style Gift Ideas)
const FLOWARD_GIFT_IDEAS = [
  { id: "gift-hand", name: "باقات يد 💐", query: "باقات يد", filterType: "category_or_tag", image: "assets/products/p02.jpg" },
  { id: "gift-vase", name: "زهور في فازة 🏺", query: "فازة", filterType: "tag", image: "assets/products/p05.jpg" },
  { id: "gift-trays", name: "صواني ملكية 👑", query: "قراية فاتحة", filterType: "category", image: "assets/products/p01.jpg" },
  { id: "gift-choc", name: "شوكولاتة وهدايا 🍫", query: "شوكولاتة", filterType: "tag", image: "assets/products/p09.jpg" },
  { id: "gift-bridal", name: "مسكات عرائس 👰", query: "مسكة عروس", filterType: "tag", image: "assets/products/p08.jpg" },
  { id: "gift-tulip", name: "توليب وربيع 🌷", query: "توليب", filterType: "flowertype", image: "assets/products/p06.jpg" }
];

// شرائح المجلة التفاعلية الفاخرة أعلى الصفحة الرئيسية (Hero Interactive Magazine)
const INITIAL_MAGAZINE_SLIDES = [
  {
    id: "slide-1",
    issue: "العدد الملكي • ربيع 2026",
    badge: "تنسيق حصري لزهور اللوتس",
    title: "صواني قراية الفاتحة والخطوبة الفاخرة",
    subtitle: "تنسيقات أكريليك وخشب طبيعي مزينة بأجود زهور الجوري والبيبي روز مع أماكن مخصصة للمصحف والشبكة والشوكولاتة.",
    image: "assets/products/p01.jpg",
    skuTag: "كود: QF-101",
    priceTag: "تبدأ من 850 ج.م",
    primaryBtnText: "تصفح صواني الفاتحة",
    primaryBtnLink: "#shop",
    secondaryBtnText: "طلب مخصوص عبر واتساب",
    secondaryBtnLink: "https://wa.me/201105746118",
    active: true
  },
  {
    id: "slide-2",
    issue: "إصدار العشاق والأفراح",
    badge: "الأكثر طلباً ومبيعاً",
    title: "بوكيه الحب الملكي الفاخر (100 وردة)",
    subtitle: "أجود أنواع الجوري الأحمر المخملي بتغليف أسود ملكي وشريط حريري فاخر للتعبير عن أصدق المشاعر مع توصيل مبرد وسريع.",
    image: "assets/products/p02.jpg",
    skuTag: "كود: LV-201",
    priceTag: "تبدأ من 490 ج.م",
    primaryBtnText: "اطلب بوكيه الحب الآن",
    primaryBtnLink: "#shop",
    secondaryBtnText: "معاينة كافة الأحجام",
    secondaryBtnLink: "#shop",
    active: true
  },
  {
    id: "slide-3",
    issue: "موسم التخرج والاحتفالات 2026",
    badge: "مبهج ومميز",
    title: "باقة بهجة التخرج مع مجسم الكاب والشوكولاتة",
    subtitle: "مزيج مشرق يجمع بين زهور دوار الشمس والبيبي روز الأبيض مع علبة شوكولاتة راقية ومجسم كاب التخرج الأنيق.",
    image: "assets/products/p03.jpg",
    skuTag: "كود: GD-301",
    priceTag: "تبدأ من 650 ج.م",
    primaryBtnText: "استكشف هدايا التخرج",
    primaryBtnLink: "#shop",
    secondaryBtnText: "تنسيق خاص للتخرج",
    secondaryBtnLink: "https://wa.me/201105746118",
    active: true
  },
  {
    id: "slide-4",
    issue: "فخامة الفازات والقصور",
    badge: "إطلالة ساحرة",
    title: "فازة ليليوم وأوركيد ملكية عِطرية",
    subtitle: "تحفة فنية من زهور الليليوم الوردي والأوركيد الأبيض الطبيعي تدوم طويلاً وتملأ المكان بأجمل الروائح الزكية في نفس اليوم.",
    image: "assets/products/p05.jpg",
    skuTag: "كود: FR-501",
    priceTag: "تبدأ من 850 ج.م",
    primaryBtnText: "تسوق الفازات الملكية",
    primaryBtnLink: "#shop",
    secondaryBtnText: "تواصل مع المنسق",
    secondaryBtnLink: "https://wa.me/201105746118",
    active: true
  }
];

// منشورات معرض إنستغرام الحقيقية للحساب الرسمي
const INITIAL_SHOWCASE_POSTS = [
  { id: "post-1", image: "assets/products/p01.jpg", title: "صينية قراية فاتحة ملكية بالورد الأبيض والبيبي روز", date: "منشور حديث", link: "https://www.instagram.com/lotus_flowers_eg/" },
  { id: "post-2", image: "assets/products/p02.jpg", title: "بوكيه جوري أحمر ملكي تغليف أسود مخملي", date: "منشور حديث", link: "https://www.instagram.com/lotus_flowers_eg/" },
  { id: "post-3", image: "assets/products/p03.jpg", title: "باقة بهجة التخرج مع مجسم كاب التخرج والشوكولاتة", date: "منشور حديث", link: "https://www.instagram.com/lotus_flowers_eg/" },
  { id: "post-4", image: "assets/products/p04.jpg", title: "باقة ورد زهري رقيق سحر البيبي روز", date: "منشور حديث", link: "https://www.instagram.com/lotus_flowers_eg/" },
  { id: "post-5", image: "assets/products/p05.jpg", title: "فازة ليليوم وأوركيد ملكية عطرية للمنزل الراقي", date: "منشور حديث", link: "https://www.instagram.com/lotus_flowers_eg/" },
  { id: "post-6", image: "assets/products/p06.jpg", title: "بوكيه سحر الربيع الملون بتوليب هولندي وبيبي روز", date: "منشور حديث", link: "https://www.instagram.com/lotus_flowers_eg/" }
];

// التصنيفات المعتمدة للمتجر (قابلة للإضافة والتعديل عبر لوحة الإدارة)
const DEFAULT_CATEGORIES = [
  { id: "قراية فاتحة", label: "صواني قراية فاتحة 💍", prefix: "QF" },
  { id: "حب ورومانسية", label: "حب ورومانسية ❤️", prefix: "LV" },
  { id: "تخرج", label: "تخرج واحتفال 🎓", prefix: "GD" },
  { id: "زواج وخطوبة", label: "زواج ومسكات عرائس 👰", prefix: "WD" },
  { id: "صداقة وامتنان", label: "صداقة وشكر 🤝", prefix: "FR" },
  { id: "مولود جديد", label: "مولود جديد 🧸", prefix: "NB" },
  { id: "طلب مخصوص", label: "طلب مخصوص وهدايا 🎨", prefix: "CS" }
];

// أنواع الورد الطبيعي المعتمدة
const DEFAULT_FLOWER_TYPES = [
  { id: "جوري طبيعي", label: "جوري طبيعي 🌹" },
  { id: "بيبي روز", label: "بيبي روز ناعم 🌸" },
  { id: "ليليوم", label: "ليليوم عِطري 🌺" },
  { id: "توليب", label: "توليب مستورد 🌷" },
  { id: "دوار الشمس", label: "دوار الشمس المبهج 🌻" },
  { id: "أوركيد", label: "أوركيد ملكي 🪷" },
  { id: "جبسوفيليا", label: "جبسوفيليا 🌿" }
];

// الألوان المعتمدة للورد
const DEFAULT_COLORS = [
  { id: "أحمر", label: "أحمر ملكي", hex: "#dc2626" },
  { id: "وردي", label: "وردي (بينك)", hex: "#f472b6" },
  { id: "أبيض", label: "أبيض ناصع", hex: "#ffffff" },
  { id: "بنفسجي", label: "بنفسجي ملكي", hex: "#9333ea" },
  { id: "أصفر", label: "أصفر مشرق", hex: "#eab308" },
  { id: "ألوان مختلطة", label: "ألوان مختلطة", hex: "linear-gradient(45deg, #f43f5e, #fbbf24, #3b82f6)" }
];

// كتالوج المنتجات الحقيقية بصور أعمال المتجر المسحوبة محلياً مع دعم الأحجام والأسعار المتعددة
const DEFAULT_PRODUCTS = [
  {
    id: "prod-qf-101",
    sku: "QF-101",
    name: "صينية قراية فاتحة ملكية مع ورد طبيعي وشوكولاتة",
    category: "قراية فاتحة",
    color: "أبيض",
    colors: ["أبيض"],
    flowerType: "جوري طبيعي",
    flowerTypes: ["جوري طبيعي", "بيبي روز"],
    image: "assets/products/p01.jpg",
    badge: "الأكثر طلباً",
    description: "صينية خشبية وأكريليك راقية مزينة بأجود زهور الجوري والبيبي روز الأبيض مع مكان مخصص لتقديم الشوكولاتة والمصحف والدبل.",
    sizes: [
      { name: "صينية وسط (30 وردة طبيعية)", price: 850 },
      { name: "صينية ملكية كبيرة (50 وردة طبيعية + إضافات)", price: 1350 }
    ],
    tags: ["قراية فاتحة", "خطوبة", "أبيض", "جوري", "بيبي روز", "صواني ملكية"]
  },
  {
    id: "prod-lv-201",
    sku: "LV-201",
    name: "بوكيه الحب الملكي الفاخر (جوري أحمر مخملي)",
    category: "حب ورومانسية",
    color: "أحمر",
    colors: ["أحمر"],
    flowerType: "جوري طبيعي",
    flowerTypes: ["جوري طبيعي"],
    image: "assets/products/p02.jpg",
    badge: "كلاسيك رومانسي",
    description: "باقة ضخمة آسرة من أجود أنواع الجوري الأحمر المستورد بتغليف أسود فاخر وشريط حريري للتعبير عن أصدق المشاعر.",
    sizes: [
      { name: "بوكيه رقيق (25 وردة)", price: 490 },
      { name: "بوكيه كلاسيكي (50 وردة)", price: 950 },
      { name: "بوكيه ملكي ضخم (100 وردة)", price: 1750 }
    ],
    tags: ["حب ورومانسية", "أحمر", "جوري", "باقات يد"]
  },
  {
    id: "prod-gd-301",
    sku: "GD-301",
    name: "باقة بهجة التخرج مع مجسم كاب التخرج والشوكولاتة",
    category: "تخرج",
    color: "أصفر",
    colors: ["أصفر", "أبيض"],
    flowerType: "دوار الشمس",
    flowerTypes: ["دوار الشمس", "بيبي روز"],
    image: "assets/products/p03.jpg",
    badge: "توصيل اليوم",
    description: "باقة مشرقة تجمع بين زهور دوار الشمس والبيبي روز الأبيض مع كاب تخرج أنيق وعلبة شوكولاتة راقية.",
    sizes: [
      { name: "حجم قياسي (مع كاب التخرج)", price: 650 },
      { name: "حجم كبير فاخر (مع شوكولاتة وكاب تخرج)", price: 980 }
    ],
    tags: ["تخرج", "أصفر", "دوار الشمس", "باقات يد"]
  },
  {
    id: "prod-lv-202",
    sku: "LV-202",
    name: "بوكيه ورد زهري رقيق (سحر البيبي روز)",
    category: "حب ورومانسية",
    color: "وردي",
    colors: ["وردي"],
    flowerType: "بيبي روز",
    flowerTypes: ["بيبي روز", "جبسوفيليا"],
    image: "assets/products/p04.jpg",
    badge: "الأكثر مبيعاً",
    description: "باقة ناعمة تجمع بين البيبي روز الوردي وأغصان الجبسوفيليا المستوردة بتغليف أنيق وجذاب.",
    sizes: [
      { name: "حجم وسط (20 عود بيبي روز)", price: 450 },
      { name: "حجم كبير (40 عود بيبي روز)", price: 780 }
    ],
    tags: ["وردي", "بيبي روز", "حب ورومانسية", "باقات يد"]
  },
  {
    id: "prod-wd-401",
    sku: "WD-401",
    name: "فازة ليليوم وأوركيد ملكية عطرية",
    category: "زواج وخطوبة",
    color: "أبيض",
    colors: ["أبيض"],
    flowerType: "ليليوم",
    flowerTypes: ["ليليوم", "أوركيد"],
    image: "assets/products/p05.jpg",
    badge: "فخامة منزلية",
    description: "فازة زجاجية أسطوانية منسقة بزهور الليليوم الأبيض ذات الرائحة العطرة الفواحة مع أفرع الأوركيد الخضراء.",
    sizes: [
      { name: "فازة وسط (مناسبة للطاولات)", price: 890 },
      { name: "فازة ملكية ضخمة (استقبال وفنادق)", price: 1450 }
    ],
    tags: ["أبيض", "ليليوم", "فازة", "زواج", "أوركيد"]
  },
  {
    id: "prod-fr-501",
    sku: "FR-501",
    name: "بوكيه سحر الربيع الملون (توليب هولندي وبيبي روز)",
    category: "صداقة وامتنان",
    color: "ألوان مختلطة",
    colors: ["ألوان مختلطة", "وردي", "أصفر"],
    flowerType: "توليب",
    flowerTypes: ["توليب", "بيبي روز"],
    image: "assets/products/p06.jpg",
    badge: "مستورد",
    description: "مزيج بديع من زهور التوليب والروز بألوان الباستيل المبهجة لإدخال البهجة والسرور على قلوب الأصدقاء.",
    sizes: [
      { name: "باقة ناعمة (15 زهرة)", price: 520 },
      { name: "باقة غنية (30 زهرة)", price: 890 }
    ],
    tags: ["ألوان مختلطة", "توليب", "صداقة", "باقات يد"]
  },
  {
    id: "prod-lv-203",
    sku: "LV-203",
    name: "بوكيه البنفسج الملكي (رويال باربل)",
    category: "حب ورومانسية",
    color: "بنفسجي",
    colors: ["بنفسجي"],
    flowerType: "جوري طبيعي",
    flowerTypes: ["جوري طبيعي"],
    image: "assets/products/p07.jpg",
    badge: "إطلالة ساحرة",
    description: "تناغم راقٍ بين الجوري البنفسجي مع زهور الستاتيس واللافندر العطرية لأصحاب الذوق الفريد.",
    sizes: [
      { name: "حجم قياسي (25 وردة)", price: 580 },
      { name: "حجم ملكي (50 وردة)", price: 1050 }
    ],
    tags: ["بنفسجي", "جوري", "حب ورومانسية", "باقات يد"]
  },
  {
    id: "prod-wd-402",
    sku: "WD-402",
    name: "مسكة عروس ملكية (Bridal Bouquet) زهور بيضاء طبيعية",
    category: "زواج وخطوبة",
    color: "أبيض",
    colors: ["أبيض"],
    flowerType: "جوري طبيعي",
    flowerTypes: ["جوري طبيعي", "كالا"],
    image: "assets/products/p08.jpg",
    badge: "خاص بالعرائس",
    description: "بوكيه عروس دائري فخم منسق بأجود أنواع الكالا والجوري الأبيض مع مقبض حريري مرصع بحبات اللؤلؤ.",
    sizes: [
      { name: "مسكة عروس كلاسيكية", price: 1250 },
      { name: "مسكة عروس ملكية منسدلة (Cascade)", price: 1750 }
    ],
    tags: ["مسكة عروس", "زواج", "أبيض", "باقات يد"]
  },
  {
    id: "prod-cs-701",
    sku: "CS-701",
    name: "صندوق اللوتس المميز (ورد طبيعي + درج شوكولاتة)",
    category: "طلب مخصوص",
    color: "أحمر",
    colors: ["أحمر"],
    flowerType: "جوري طبيعي",
    flowerTypes: ["جوري طبيعي"],
    image: "assets/products/p09.jpg",
    badge: "هدية متكاملة",
    description: "بوكس هدايا فاخر بطبقتين: درج سفلي يحتوي على قطع الشوكولاتة الفاخرة وطبقة علوية غنية بالجوري الأحمر.",
    sizes: [
      { name: "بوكس هدايا وسط (مع 16 قطعة شوكولاتة)", price: 950 },
      { name: "بوكس هدايا كبير (مع 32 قطعة شوكولاتة)", price: 1550 }
    ],
    tags: ["طلب مخصوص", "شوكولاتة", "بوكس هدايا"]
  }
];

// إضافات الشراء (Upselling Add-ons)
const STORE_ADDONS = [
  {
    id: "addon-choc-ferrero",
    name: "علبة شوكولاتة فيريرو روشيه (16 قطعة)",
    price: 180
  },
  {
    id: "addon-balloon-helium",
    name: "بالون هيليوم للمناسبات (حب / تخرج / مبروك)",
    price: 75
  },
  {
    id: "addon-glass-vase",
    name: "فازة زجاجية كريستالية أسطوانية",
    price: 140
  },
  {
    id: "addon-scented-candle",
    name: "شمعة معطرة برائحة الياسمين واللافندر",
    price: 95
  }
];

// السياسات التعريفية للمتجر (قابلة للتعديل من الإدارة)
const DEFAULT_POLICIES = {
  about: `نحن في "زهور اللوتس (Lotus Flowers EG)" نفخر بكوننا وجهتكم الأولى لاختيار أرقى باقات الورد الطبيعي وتنسيقات الهدايا في قلب القاهرة (المنيل).
منذ انطلاقتنا في شارع سعيد ذو الفقار، كرسنا جهودنا لتحويل مشاعركم الصادقة إلى تحف فنية تنبض بالجمال والأناقة، سواء كنتم تحتفلون بقراية فاتحة، زفاف، تخرج، أو تودون التعبير عن الحب والامتنان.
نختار زهورنا بعناية فائقة يومياً لتبقى نضرة ومزهرة لأطول فترة ممكنة، ونتعامل مع كل طلب باهتمام شخصي يضمن وصول مشاعركم كاملة لأحبائكم.`,

  exchange: `نظراً لطبيعة الزهور الطبيعية كمنتجات حية سريعة التأثر بالعوامل الجوية:
• يُسمح بالاستبدال الفوري في حال وصول المنتج بحالة غير مطابقة للمواصفات المتفق عليها أو وجود تلف أثناء التسليم، بشرط إبلاغنا خلال ساعة واحدة من وقت استلام الباقة مع إرفاق صورة واضحة.
• في حال قبول الاسترجاع، يتم رد المبلغ عبر فودافون كاش خلال 24 ساعة عمل.
• الطلبات المخصوصة (المصنوعة خصيصاً بأسماء أو أرقام محددة) لا تقبل الإلغاء بعد بدء فريق التنسيق في تجهيزها.`,

  privacy: `نحن في زهور اللوتس نلتزم بحماية خصوصية عملائنا والمستلمين بأعلى معايير الأمان:
• نستخدم بياناتكم الشخصية (الاسم، رقم الهاتف، العنوان) حصراً لتأكيد الطلب وتنسيق التوصيل.
• خدمة الإهداء السري: في حال اختياركم إرسال الطلب كهدية، نلتزم تماماً بعدم الكشف عن هوية المرسل أو قيمة الباقة للمستلم إذا رغبتم بذلك.
• لا نشارك بياناتكم أو أرقامكم الهاتفية مع أي طرف ثالث خارج فريق التوصيل المعتمد.`,

  shipping: `نوفر خدمة التوصيل السريع والدقيق في سيارات مجهزة لضمان وصول الورد بكامل نضارته:
• تغطية شاملة لجميع أحياء القاهرة والجيزة في نفس اليوم.
• فترات التوصيل المتاحة: 
  - الفترة الصباحية: 10:00 ص - 2:00 م
  - الفترة المسائية: 4:00 م - 8:00 م
  - فترة السهرة والمفاجآت: 8:00 م - 11:30 م
• خدمة الاتصال بالمستلم: إذا لم تكن تعرف عنوان المستلم بدقة، يمكنك تزويدنا برقم هاتفه فقط، وسيتولى فريقنا التواصل معه بلباقة لتحديد الموقع المناسب دون إفساد المفاجأة!`,

  faq: [
    {
      q: "كيف يتم الدفع عبر فودافون كاش؟",
      a: "عند الوصول لخطوة الدفع في الطلب، يظهر لك رقم محفظة المتجر (01105746118). تقوم بالتحويل من محفظتك ثم رفع صورة إشعار التحويل وكتابة رقمك المحول منه لتأكيد الطلب."
    },
    {
      q: "هل يمكنني الطلب وأنا خارج مصر لإرسال هدية لأحد في القاهرة؟",
      a: "نعم بالتأكيد! يمكنك كتابة رقم هاتفك الخارجي على واتساب للتواصل، وسيقوم فريقنا بتوصيل الهدية للشخص المطلوب داخل القاهرة والجيزة بكل دقة."
    },
    {
      q: "هل يمكنني إرسال بوكيه كمفاجأة دون أن يعرف المستلم من المرسل؟",
      a: "نعم، يمكنك اختيار 'إهداء سري' ولن يتم إرفاق الفاتورة أو ذكر اسمك للمستلم نهائياً."
    },
    {
      q: "ماذا لو لم أكن أعرف عنوان المستلم بالتفصيل؟",
      a: "يكفي تزويدنا برقم هاتف المستلم، وسيقوم فريق التوصيل بالاتصال به بلباقة لمعرفة اللوكيشن الأنسب له دون إخباره بمحتوى الهدية."
    },
    {
      q: "هل الورد طبيعي 100%؟",
      a: "نعم، جميع زهورنا طبيعية طازجة تورّد يومياً في متجرنا بالمنيل لضمان أعلى جودة ونضارة."
    }
  ]
};

// حسابات المستخدمين والمدراء مع الصلاحيات (Role-Based Access Control)
const DEFAULT_USERS = [
  {
    id: "user-admin-01",
    name: "مدير المتجر العام",
    phone: "01105746118",
    pass: "lotus2026",
    role: "super_admin", // super_admin, orders_manager, content_manager, customer
    roleLabel: "مدير عام (كامل الصلاحيات)",
    createdAt: "2026-09-01"
  }
];

// إعدادات ربط Meta Cloud API الافتراضية
const DEFAULT_META_CONFIG = {
  appId: "",
  appSecret: "",
  accessToken: "",
  wabaId: "",
  phoneNumberId: "",
  webhookVerifyToken: "lotus_flowers_meta_secret_2026",
  status: "not_configured" // not_configured, connected, error
};

// سجل الطلبات الأولي مصفّر وجاهز للإطلاق الإنتاجي
const INITIAL_ORDERS = [];

