// Sample automotive parts and oils data
const products = [
  // Engine Oils
  {
    id: 1,
    name: 'Castrol GTX 20W-50',
    category: 'engine-oils',
    price: 850,
    sku: 'CAST-GTX-20W50',
    image: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=300&h=300&fit=crop',
    stock: 45,
    vehicleCompatibility: 'Universal',
    batch: 'B2024001',
    expiry: '2027-12-31'
  },
  {
    id: 2,
    name: 'Mobil 1 5W-30 Fully Synthetic',
    category: 'engine-oils',
    price: 2450,
    sku: 'MOB1-5W30-SYN',
    image: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=300&h=300&fit=crop',
    stock: 28,
    vehicleCompatibility: 'Honda City, Hyundai i20',
    batch: 'M2024015',
    expiry: '2028-06-30'
  },
  {
    id: 3,
    name: 'Shell Helix Ultra 10W-40',
    category: 'engine-oils',
    price: 1650,
    sku: 'SHELL-HX7-10W40',
    image: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=300&h=300&fit=crop',
    stock: 32,
    vehicleCompatibility: 'Maruti Swift, Baleno',
    batch: 'SH2024022',
    expiry: '2028-03-31'
  },
  {
    id: 4,
    name: 'Valvoline MaxLife 20W-40',
    category: 'engine-oils',
    price: 720,
    sku: 'VAL-MAX-20W40',
    image: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=300&h=300&fit=crop',
    stock: 55,
    vehicleCompatibility: 'Older vehicles',
    batch: 'VV2024010',
    expiry: '2027-11-30'
  },
  
  // Brake Parts
  {
    id: 5,
    name: 'Brake Pad Set - Front',
    category: 'brake-parts',
    price: 1250,
    sku: 'BRK-PAD-FRT-001',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300&h=300&fit=crop',
    stock: 18,
    vehicleCompatibility: 'Honda Activa 125',
    lowStock: false
  },
  {
    id: 6,
    name: 'Brake Disc Rotor',
    category: 'brake-parts',
    price: 2800,
    sku: 'BRK-DISC-ROT-002',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300&h=300&fit=crop',
    stock: 12,
    vehicleCompatibility: 'Maruti Swift Dzire',
    lowStock: true
  },
  {
    id: 7,
    name: 'Brake Shoe Set - Rear',
    category: 'brake-parts',
    price: 950,
    sku: 'BRK-SHOE-RER-003',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300&h=300&fit=crop',
    stock: 25,
    vehicleCompatibility: 'Hyundai i10',
    lowStock: false
  },
  
  // Filters
  {
    id: 8,
    name: 'Air Filter Premium',
    category: 'filters',
    price: 450,
    sku: 'FLT-AIR-PRM-001',
    image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=300&h=300&fit=crop',
    stock: 60,
    vehicleCompatibility: 'Tata Nexon',
    lowStock: false
  },
  {
    id: 9,
    name: 'Oil Filter Element',
    category: 'filters',
    price: 180,
    sku: 'FLT-OIL-ELEM-002',
    image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=300&h=300&fit=crop',
    stock: 85,
    vehicleCompatibility: 'Mahindra Scorpio',
    lowStock: false
  },
  {
    id: 10,
    name: 'Fuel Filter Diesel',
    category: 'filters',
    price: 650,
    sku: 'FLT-FUE-DIE-003',
    image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=300&h=300&fit=crop',
    stock: 8,
    vehicleCompatibility: 'Toyota Innova',
    lowStock: true
  },
  {
    id: 11,
    name: 'Cabin Air Filter AC',
    category: 'filters',
    price: 550,
    sku: 'FLT-CAB-AC-004',
    image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=300&h=300&fit=crop',
    stock: 42,
    vehicleCompatibility: 'Kia Seltos',
    lowStock: false
  },
  
  // Batteries
  {
    id: 12,
    name: 'Exide Battery 45Ah',
    category: 'batteries',
    price: 4200,
    sku: 'BAT-EXI-45AH',
    image: 'https://images.unsplash.com/photo-1619641773019-b69c36358b61?w=300&h=300&fit=crop',
    stock: 15,
    vehicleCompatibility: 'Maruti Alto 800',
    warranty: '36 months'
  },
  {
    id: 13,
    name: 'Amaron Battery 55Ah',
    category: 'batteries',
    price: 5500,
    sku: 'BAT-AMA-55AH',
    image: 'https://images.unsplash.com/photo-1619641773019-b69c36358b61?w=300&h=300&fit=crop',
    stock: 10,
    vehicleCompatibility: 'Honda City VX',
    warranty: '48 months',
    lowStock: true
  },
  {
    id: 14,
    name: 'Luminous Battery 60Ah',
    category: 'batteries',
    price: 6200,
    sku: 'BAT-LUM-60AH',
    image: 'https://images.unsplash.com/photo-1619641773019-b69c36358b61?w=300&h=300&fit=crop',
    stock: 7,
    vehicleCompatibility: 'MUVs & SUVs',
    warranty: '60 months',
    lowStock: true
  },
  
  // Spark Plugs
  {
    id: 15,
    name: 'NGK Spark Plug Standard',
    category: 'spark-plugs',
    price: 180,
    sku: 'SPK-NGK-STD-001',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300&h=300&fit=crop',
    stock: 120,
    vehicleCompatibility: 'Maruti 800, WagonR',
    lowStock: false
  },
  {
    id: 16,
    name: 'Bosch Platinum Spark Plug',
    category: 'spark-plugs',
    price: 350,
    sku: 'SPK-BOS-PLT-002',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300&h=300&fit=crop',
    stock: 95,
    vehicleCompatibility: 'Hyundai Verna',
    lowStock: false
  },
  {
    id: 17,
    name: 'Denso Iridium Spark Plug',
    category: 'spark-plugs',
    price: 650,
    sku: 'SPK-DEN-IRD-003',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300&h=300&fit=crop',
    stock: 65,
    vehicleCompatibility: 'Honda Civic',
    lowStock: false
  },
  
  // Accessories
  {
    id: 18,
    name: 'Car Wash Shampoo 1L',
    category: 'accessories',
    price: 350,
    sku: 'ACC-WASH-SHP-1L',
    image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=300&h=300&fit=crop',
    stock: 40,
    vehicleCompatibility: 'All vehicles',
    lowStock: false
  },
  {
    id: 19,
    name: 'Microfiber Cleaning Cloth',
    category: 'accessories',
    price: 150,
    sku: 'ACC-CLTH-MCR-001',
    image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=300&h=300&fit=crop',
    stock: 150,
    vehicleCompatibility: 'Universal',
    lowStock: false
  },
  {
    id: 20,
    name: 'Tyre Shine Spray',
    category: 'accessories',
    price: 280,
    sku: 'ACC-TYRE-SHN-SPR',
    image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=300&h=300&fit=crop',
    stock: 55,
    vehicleCompatibility: 'All vehicles',
    lowStock: false
  },
  {
    id: 21,
    name: 'Dashboard Polish',
    category: 'accessories',
    price: 320,
    sku: 'ACC-DASH-POL-001',
    image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=300&h=300&fit=crop',
    stock: 48,
    vehicleCompatibility: 'Interior care',
    lowStock: false
  },
  {
    id: 22,
    name: 'Windshield Wiper Blade 24"',
    category: 'accessories',
    price: 450,
    sku: 'ACC-WIP-24IN-001',
    image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=300&h=300&fit=crop',
    stock: 35,
    vehicleCompatibility: 'Universal fit',
    lowStock: false
  },
  {
    id: 23,
    name: 'Car Cover Body',
    category: 'accessories',
    price: 1200,
    sku: 'ACC-COV-BDY-001',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&h=300&fit=crop',
    stock: 20,
    vehicleCompatibility: 'Hatchback',
    lowStock: false
  },
  {
    id: 24,
    name: 'Seat Cover Set',
    category: 'accessories',
    price: 2500,
    sku: 'ACC-SEAT-CVR-SET',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&h=300&fit=crop',
    stock: 15,
    vehicleCompatibility: 'Sedan cars',
    lowStock: true
  }
];

export default products;
