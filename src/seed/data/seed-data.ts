interface SeedImage {
  url: string;
  isMain?: boolean;
}

interface SeedProduct {
  name: string;
  shortDescription: string;
  longDescription: string;
  price: number;
  specifications?: string;
  images: SeedImage[];
}

interface SeedSubcategory {
  name: string;
  products: SeedProduct[];
}

interface SeedCategory {
  name: string;
  subcategories: SeedSubcategory[];
}

export const seedData: SeedCategory[] = [
  {
    name: 'Ropa y Calzado',
    subcategories: [
      {
        name: 'Calzado',
        products: [
          {
            name: 'Zapatillas Urban Black',
            shortDescription: 'Zapatillas urbanas minimalistas color negro.',
            longDescription:
              'Zapatillas urbanas modernas con diseño minimalista, fabricadas con materiales cómodos y ligeros. Ideales para uso diario, outfit casual y estilo streetwear.',
            price: 59.99,
            images: [
              {
                url: 'https://res.cloudinary.com/di7lw3pla/image/upload/q_auto/f_auto/v1778976857/zapatillas2_hfuykc.png',
                isMain: true,
              },
              {
                url: 'https://res.cloudinary.com/di7lw3pla/image/upload/q_auto/f_auto/v1778976850/zapatillas3_wpsxdp.png',
              },
              {
                url: 'https://res.cloudinary.com/di7lw3pla/image/upload/q_auto/f_auto/v1778976849/zapatillas1_yn9wsm.png',
              },
            ],
          },
          {
            name: 'Botas Chelsea Caramel',
            shortDescription: 'Botas Chelsea de cuero sintético color caramelo.',
            longDescription:
              'Botas estilo Chelsea de cuero sintético con elastico lateral y suela de goma antideslizante. Diseño elegante y versátil, combinan con jeans, faldas o vestidos.',
            price: 74.99,
            specifications: 'Material: Cuero sintético | Suela: Goma | Tallas: 35-41',
            images: [
              { url: 'https://res.cloudinary.com/di7lw3pla/image/upload/q_auto/f_auto/v1779270248/botas_p1fgi1.jpg', isMain: true },
              { url: 'https://res.cloudinary.com/di7lw3pla/image/upload/q_auto/f_auto/v1779270248/botas_2_cakcpe.jpg' },
            ],
          },
          {
            name: 'Sandalias Planas Blancas',
            shortDescription: 'Sandalias planas minimalistas en blanco.',
            longDescription:
              'Sandalias planas de correa simple con cierre de hebilla metálica. Ligeras y cómodas para días de calor, combinan con cualquier look veraniego o casual.',
            price: 34.99,
            images: [
              { url: 'https://res.cloudinary.com/di7lw3pla/image/upload/q_auto/f_auto/v1779270245/sandalias_ycwcuj.jpg', isMain: true },
              { url: 'https://res.cloudinary.com/di7lw3pla/image/upload/q_auto/f_auto/v1779270245/sandalias_2_mn4gmi.jpg' },
            ],
          },
        ],
      },
      {
        name: 'Accesorios',
        products: [
          {
            name: 'Jockey Classic Black',
            shortDescription: 'Jockey negro clásico de estilo casual.',
            longDescription:
              'Gorro tipo jockey con diseño moderno y elegante, confeccionado en tela suave y resistente. Perfecto para complementar outfits urbanos y casuales.',
            price: 24.99,
            images: [
              {
                url: 'https://res.cloudinary.com/di7lw3pla/image/upload/q_auto/f_auto/v1778976851/gorro1_hyzhls.png',
                isMain: true,
              },
              {
                url: 'https://res.cloudinary.com/di7lw3pla/image/upload/q_auto/f_auto/v1778976850/gorro3_k0jed4.png',
              },
              {
                url: 'https://res.cloudinary.com/di7lw3pla/image/upload/q_auto/f_auto/v1778976850/gorro2_pafgp3.png',
              },
            ],
          },
          {
            name: 'Bolso Tote Canvas Beige',
            shortDescription: 'Bolso tote de lona resistente color beige.',
            longDescription:
              'Bolso tote spacioso confeccionado en lona de algodón gruesa. Cuenta con asas largas para llevar al hombro y bolsillo interior con cierre. Ideal para el día a día, compras o la playa.',
            price: 29.99,
            specifications: 'Material: Lona de algodón | Dimensiones: 40x35x10 cm',
            images: [
              { url: 'https://res.cloudinary.com/di7lw3pla/image/upload/q_auto/f_auto/v1779270247/bolso_2_xiengk.jpg', isMain: true },
              { url: 'https://res.cloudinary.com/di7lw3pla/image/upload/q_auto/f_auto/v1779270248/bolso_qesgsn.jpg' },
            ],
          },
          {
            name: 'Cinturón Cuero Café',
            shortDescription: 'Cinturón de cuero genuino color café.',
            longDescription:
              'Cinturón de cuero genuino con hebilla metálica dorada. Corte limpio y elegante, perfecto para pantalones formales o casuales. Disponible en tallas S a XL.',
            price: 19.99,
            specifications: 'Material: Cuero genuino | Hebilla: Aleación metálica dorada | Tallas: S, M, L, XL',
            images: [
              { url: 'https://res.cloudinary.com/di7lw3pla/image/upload/q_auto/f_auto/v1779270245/cinturon_zj65iy.jpg', isMain: true },
            ],
          },
        ],
      },
      {
        name: 'Ropa Deportiva',
        products: [
          {
            name: 'Leggings Active Flex',
            shortDescription: 'Leggings deportivos de tiro alto con compresion ligera.',
            longDescription:
              'Leggings de entrenamiento confeccionados en tela elastica de secado rapido. Ofrecen ajuste comodo, soporte en cintura y libertad de movimiento para gym, running o yoga.',
            price: 39.99,
            specifications: 'Material: Poliester + elastano | Tallas: XS-XL | Tecnologia: Secado rapido',
            images: [
              { url: 'https://res.cloudinary.com/di7lw3pla/image/upload/q_auto/f_auto/v1779270246/leggins_w5xzzd.jpg', isMain: true },
              { url: 'https://res.cloudinary.com/di7lw3pla/image/upload/q_auto/f_auto/v1779270246/leggins_2_rauz0u.jpg' },
            ],
          },
          {
            name: 'Polera Dry Fit Performance',
            shortDescription: 'Polera deportiva transpirable para entrenamientos intensos.',
            longDescription:
              'Polera tecnica de corte regular con paneles de ventilacion y tecnologia anti humedad. Ideal para sesiones de cardio, entrenamiento funcional o actividades al aire libre.',
            price: 27.99,
            specifications: 'Material: Mesh tecnico | Tallas: S-XXL | Corte: Regular fit',
            images: [
              { url: 'https://res.cloudinary.com/di7lw3pla/image/upload/q_auto/f_auto/v1779270247/polera_3_kkp7fj.jpg', isMain: true },
              { url: 'https://res.cloudinary.com/di7lw3pla/image/upload/q_auto/f_auto/v1779270247/polera_2_qyv4q4.jpg' },
            ],
          },
          {
            name: 'Chaqueta Running Light',
            shortDescription: 'Chaqueta liviana cortaviento para running y ciclismo urbano.',
            longDescription:
              'Chaqueta deportiva ultraligera con cierre frontal, bolsillos laterales y detalles reflectantes para mayor visibilidad nocturna. Facil de plegar y transportar.',
            price: 49.99,
            specifications: 'Material: Nylon ripstop | Caracteristicas: Cortaviento, reflectantes | Tallas: S-XL',
            images: [
              { url: 'https://res.cloudinary.com/di7lw3pla/image/upload/q_auto/f_auto/v1779270248/chaqueta_nbimcp.jpg', isMain: true },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Tecnología',
    subcategories: [
      {
        name: 'Audio',
        products: [
          {
            name: 'Auriculares Wireless Pro',
            shortDescription: 'Auriculares inalámbricos premium over-ear.',
            longDescription:
              'Auriculares bluetooth con diseño moderno, sonido envolvente y almohadillas cómodas para largas sesiones de música, gaming o trabajo.',
            price: 89.99,
            specifications: 'Conectividad: Bluetooth 5.0 | Batería: 30h | Driver: 40mm',
            images: [
              {
                url: 'https://res.cloudinary.com/di7lw3pla/image/upload/q_auto/f_auto/v1778976849/audifonos3_muxttm.png',
                isMain: true,
              },
              {
                url: 'https://res.cloudinary.com/di7lw3pla/image/upload/q_auto/f_auto/v1778976849/audifonos2_bjdwcc.png',
              },
              {
                url: 'https://res.cloudinary.com/di7lw3pla/image/upload/q_auto/f_auto/v1778976849/audifonos1_h8e3z6.png',
              },
            ],
          },
          {
            name: 'Parlante Portátil Mini',
            shortDescription: 'Parlante bluetooth compacto resistente al agua.',
            longDescription:
              'Parlante portátil con certificación IPX6 resistente al agua, sonido 360° y batería de 12 horas. Ligero y fácil de llevar a cualquier parte.',
            price: 44.99,
            specifications: 'Conectividad: Bluetooth 5.0 | Batería: 12h | Resistencia: IPX6 | Potencia: 10W',
            images: [
              { url: 'https://res.cloudinary.com/di7lw3pla/image/upload/q_auto/f_auto/v1779270246/parlante_dnx77h.jpg', isMain: true },
              { url: 'https://res.cloudinary.com/di7lw3pla/image/upload/q_auto/f_auto/v1779270248/parlante2_llqdmf.jpg' },
            ],
          },
          {
            name: 'Earbuds TWS Sport',
            shortDescription: 'Audífonos inalámbricos deportivos con estuche de carga.',
            longDescription:
              'Earbuds true wireless con diseño ergonómico y aletas de silicona para actividad física. Incluye estuche de carga con batería adicional para hasta 24h de reproducción total.',
            price: 54.99,
            specifications: 'Conectividad: Bluetooth 5.2 | Batería earbuds: 6h | Batería total con estuche: 24h | Resistencia: IPX5',
            images: [
              { url: 'https://res.cloudinary.com/di7lw3pla/image/upload/q_auto/f_auto/v1779270245/earpods_orahho.jpg', isMain: true },
              { url: 'https://res.cloudinary.com/di7lw3pla/image/upload/q_auto/f_auto/v1779270245/earpods2_zq31qa.jpg' },
            ],
          },
        ],
      },
      {
        name: 'Gadgets',
        products: [
          {
            name: 'Smartwatch Fitness',
            shortDescription: 'Reloj inteligente con monitoreo de salud y notificaciones.',
            longDescription:
              'Smartwatch con pantalla AMOLED, monitoreo de frecuencia cardíaca, SpO2, contador de pasos y notificaciones desde el celular. Compatible con Android e iOS.',
            price: 79.99,
            specifications: 'Pantalla: AMOLED 1.4" | Batería: 7 días | Resistencia: IP68 | Sensores: FC, SpO2, acelerómetro',
            images: [
              { url: 'https://res.cloudinary.com/di7lw3pla/image/upload/q_auto/f_auto/v1779270246/smartwatch3_u0xkx2.jpg', isMain: true },
              { url: 'https://res.cloudinary.com/di7lw3pla/image/upload/q_auto/f_auto/v1779270245/smartwatch2_ev6s3c.jpg' },
              { url: 'https://res.cloudinary.com/di7lw3pla/image/upload/q_auto/f_auto/v1779270245/smartwatch_ggxiby.jpg' },
            ],
          },
          {
            name: 'Power Bank 10000mAh',
            shortDescription: 'Batería portátil de 10000mAh con carga rápida.',
            longDescription:
              'Power bank compacto con capacidad de 10000mAh, soporte para carga rápida 22.5W y dos puertos USB-A más un puerto USB-C. Indicador LED de batería restante.',
            price: 34.99,
            specifications: 'Capacidad: 10000mAh | Carga rápida: 22.5W | Puertos: 2x USB-A, 1x USB-C | Peso: 220g',
            images: [
              { url: 'https://res.cloudinary.com/di7lw3pla/image/upload/q_auto/f_auto/v1779270247/bateria_ddhlmb.jpg', isMain: true },

            ],
          },
          {
            name: 'Cable USB-C Trenzado 2m',
            shortDescription: 'Cable USB-C reforzado de 2 metros con carga rápida.',
            longDescription:
              'Cable USB-C a USB-C de nylon trenzado de alta resistencia, compatible con carga rápida 60W y transferencia de datos USB 3.1. Longitud de 2 metros para mayor comodidad.',
            price: 12.99,
            specifications: 'Longitud: 2m | Material: Nylon trenzado | Carga: 60W | Transferencia: USB 3.1 (10Gbps)',
            images: [
              { url: 'https://res.cloudinary.com/di7lw3pla/image/upload/q_auto/f_auto/v1779270247/tipoc2_opebys.jpg', isMain: true },
              { url: 'https://res.cloudinary.com/di7lw3pla/image/upload/q_auto/f_auto/v1779270246/tipoc_2_bwxvn9.jpg'},
            ],
          },
        ],
      },
      {
        name: 'Hogar Inteligente',
        products: [
          {
            name: 'Ampolleta Smart RGB WiFi',
            shortDescription: 'Ampolleta inteligente multicolor compatible con asistentes de voz.',
            longDescription:
              'Ampolleta LED inteligente con control desde app, programacion horaria y cambio de color RGB. Permite ajustar intensidad y crear escenas para cada ambiente del hogar.',
            price: 16.99,
            specifications: 'Conectividad: WiFi 2.4GHz | Potencia: 9W | Compatibilidad: Google Assistant, Alexa',
            images: [
              { url: 'https://res.cloudinary.com/di7lw3pla/image/upload/q_auto/f_auto/v1779270247/ampolleta_zup41k.jpg', isMain: true },
              { url: 'https://res.cloudinary.com/di7lw3pla/image/upload/q_auto/f_auto/v1779270247/ampolleta_2_jyuh03.jpg' },
            ],
          },
          {
            name: 'Camara de Seguridad 360',
            shortDescription: 'Camara IP interior con vision nocturna y seguimiento automatico.',
            longDescription:
              'Camara de seguridad para interior con rotacion panoramica 360, deteccion de movimiento y almacenamiento en nube o microSD. Incluye audio bidireccional en tiempo real.',
            price: 59.99,
            specifications: 'Resolucion: 2K | Vision nocturna: Si | Audio: Bidireccional | Almacenamiento: microSD/nube',
            images: [
              { url: 'https://res.cloudinary.com/di7lw3pla/image/upload/q_auto/f_auto/v1779270248/camara_2_ntrx8b.jpg', isMain: true },
              { url: 'https://res.cloudinary.com/di7lw3pla/image/upload/q_auto/f_auto/v1779270248/camara_e0acfk.jpg' },
            ],
          },
          {
            name: 'Enchufe Inteligente Mini',
            shortDescription: 'Enchufe inteligente compacto con control remoto por app.',
            longDescription:
              'Enchufe smart de formato mini que permite encender y apagar dispositivos desde el celular, configurar temporizadores y monitorear consumo electrico en tiempo real.',
            price: 21.99,
            specifications: 'Conectividad: WiFi | Voltaje: 220V | Funciones: Temporizador y medicion de consumo',
            images: [
              { url: 'https://res.cloudinary.com/di7lw3pla/image/upload/q_auto/f_auto/v1779270246/enchufe_pe0y5p.jpg', isMain: true },
              { url: 'https://res.cloudinary.com/di7lw3pla/image/upload/q_auto/f_auto/v1779270245/enchufe_2_ipxb1c.jpg' },
            ],
          },
        ],
      },
    ],
  },
];
