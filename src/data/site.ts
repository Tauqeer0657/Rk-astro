/** Single source of truth for NAP (Name/Address/Phone) — critical for local SEO.
 *  These MUST stay byte-identical to the Google Business Profile listing. */
export const site = {
  name: 'Dr. Raghavendra Kulkarni',
  legalName: 'Dr. Raghavendra Kulkarni — Consultant Urologist',
  tagline: 'Urologist Doctor in Secunderabad',
  url: 'https://raghavendrakulkarni.com',
  locale: 'en_IN',

  phone: '+91-7411088875',
  phoneHref: 'tel:+917411088875',
  whatsapp: 'https://wa.me/917411088875',
  email: 'drkulkarniraghavendra79@gmail.com',

  clinic: {
    name: 'Asian Institute of Nephrology and Urology',
    street: 'C17, Vikrampuri Colony, Karkhana',
    locality: 'Secunderabad',
    region: 'Telangana',
    postalCode: '500009',
    country: 'IN',
    lat: 17.4601,
    lng: 78.5047,
    mapEmbed:
      'https://www.google.com/maps?q=Asian+Institute+of+Nephrology+and+Urology,+Vikrampuri+Colony,+Karkhana,+Secunderabad,+Telangana+500009&output=embed',
  },

  social: {
    facebook: 'https://www.facebook.com/profile.php?id=61588837993008',
    instagram: 'https://www.instagram.com/drraghavendrakulkarni',
    youtube: 'https://youtube.com/channel/UCiuG9uSViYCz-eQ_LFbHucw',
  },

  /** TODO(client): confirm real consulting hours — these drive LocalBusiness schema
   *  and the Google "open now" badge, so wrong values actively hurt. */
  hours: [
    { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '10:00', closes: '18:00' },
  ],
  hoursLabel: 'Mon – Sat: 10:00 AM – 6:00 PM',

  medicalSpecialty: 'Urology',
  areaServed: ['Secunderabad', 'Hyderabad', 'Telangana'],
} as const;

export const services = [
  {
    slug: 'advanced-prostate-care',
    title: 'Advanced Prostate Care',
    short: 'BPH, prostatitis and prostate cancer evaluation with laser and minimally invasive treatment.',
    icon: 'prostate',
    image: '~/assets/img/prostate-ribbon.jpg',
  },
  {
    slug: 'kidney-stone-treatment',
    title: 'Kidney Stone Treatment',
    short: 'RIRS, PCNL, ureteroscopy and ESWL — matched to stone size, hardness and location.',
    icon: 'stone',
    image: '~/assets/img/kidney-model-pills.jpg',
  },
  {
    slug: 'urological-cancer-care',
    title: 'Urological Cancer Care',
    short: 'Kidney, bladder, prostate and testicular cancer surgery with organ preservation where safe.',
    icon: 'cancer',
    image: '~/assets/img/cancer-ribbon.jpg',
  },
  {
    slug: 'additional-urology-expertise',
    title: 'Additional Urology Expertise',
    short: 'Laparoscopic urology, andrology, female urology, reconstruction and paediatric care.',
    icon: 'plus',
    image: '~/assets/img/urology-glow-hands.jpg',
  },
] as const;

export const nav = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about-us', children: null },
  { label: 'Services', href: '/services', children: services.map((s) => ({ label: s.title, href: `/${s.slug}` })) },
  { label: 'Blog', href: '/blog' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Contact Us', href: '/contact-us' },
] as const;
