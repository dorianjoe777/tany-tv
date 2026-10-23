/* ============================================================
   SNOOPY TV · datos y arte
   Todo el arte es SVG generado: ni una sola imagen externa.
   ============================================================ */

/* ---------- MOTIVOS: piezas dibujadas para los pósters ---------- */
const INK = '#1a1610';

const MOTIFS = {
  tree: `<g>
    <path d="M150 300 V190" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>
    <path d="M150 220 q-40 -20 -52 -58 M150 236 q38 -16 50 -50 M150 196 q-24 -30 -8 -62 M150 210 q26 -28 12 -58"
      stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M132 150 q-16 -12 -4 -22 q14 4 8 20" fill="#7ea76a" stroke="${INK}" stroke-width="5"/>
    <path d="M168 152 q16 -12 4 -22 q-14 4 -8 20" fill="#7ea76a" stroke="${INK}" stroke-width="5"/>
    <path d="M140 168 q-10 -8 -2 -14 q10 3 6 13" fill="#7ea76a" stroke="${INK}" stroke-width="4"/>
  </g>`,

  pumpkin: `<g>
    <ellipse cx="150" cy="235" rx="86" ry="72" fill="#e07a2c" stroke="${INK}" stroke-width="8"/>
    <ellipse cx="122" cy="235" rx="30" ry="66" fill="#c9641f" opacity=".55"/>
    <path d="M150 165 q-4 -34 12 -44 q10 26 -4 46" fill="#7ea76a" stroke="${INK}" stroke-width="7"/>
    <path d="M118 176 q-14 52 2 96 M182 176 q14 52 -2 96" stroke="${INK}" stroke-width="5" fill="none" opacity=".5"/>
  </g>`,

  turkey: `<g>
    <path d="M150 170 q-14 -34 -6 -56 q10 22 8 56" fill="#c9641f" stroke="${INK}" stroke-width="6"/>
    <ellipse cx="150" cy="238" rx="74" ry="60" fill="#8a5a2b" stroke="${INK}" stroke-width="8"/>
    <path d="M96 224 q-24 -18 -34 -44 q26 6 40 30 M110 206 q-16 -24 -18 -50 q22 12 30 38
             M190 224 q24 -18 34 -44 q-26 6 -40 30 M176 206 q16 -24 18 -50 q-22 12 -30 38"
      fill="#c9641f" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M150 262 q-12 26 4 34 q16 -6 8 -34" fill="#f3c34d" stroke="${INK}" stroke-width="6"/>
    <path d="M132 250 l-8 16 h16 z M168 250 l-8 16 h16 z" fill="${INK}"/>
  </g>`,

  piano: `<g>
    <path d="M86 268 h128 q26 0 26 26 v18 H60 v-18 q0 -26 26 -26z" fill="#241a14" stroke="${INK}" stroke-width="8"/>
    <path d="M78 250 h144 q22 0 22 -22 v-56 q0 -22 -22 -22 H112 q-22 0 -22 22 v50 q0 28 -12 28z"
      fill="#3a2a1c" stroke="${INK}" stroke-width="8"/>
    <g fill="#f8f2e1">
      <rect x="92" y="186" width="16" height="26" rx="3"/><rect x="114" y="186" width="16" height="26" rx="3"/>
      <rect x="136" y="186" width="16" height="26" rx="3"/><rect x="158" y="186" width="16" height="26" rx="3"/>
      <rect x="180" y="186" width="16" height="26" rx="3"/>
    </g>
    <g fill="#1a1610">
      <rect x="104" y="186" width="10" height="17" rx="2"/><rect x="126" y="186" width="10" height="17" rx="2"/>
      <rect x="170" y="186" width="10" height="17" rx="2"/><rect x="192" y="186" width="10" height="17" rx="2"/>
    </g>
    <rect x="86" y="272" width="12" height="34" rx="4" fill="#1a1610"/>
    <rect x="202" y="272" width="12" height="34" rx="4" fill="#1a1610"/>
  </g>`,

  fence: `<g fill="#f0e7d0" stroke="${INK}" stroke-width="7">
    <rect x="54" y="176" width="30" height="116" rx="5"/>
    <rect x="96" y="176" width="30" height="116" rx="5"/>
    <rect x="138" y="176" width="30" height="116" rx="5"/>
    <rect x="180" y="176" width="30" height="116" rx="5"/>
    <rect x="222" y="176" width="30" height="116" rx="5"/>
  </g>
  <g fill="#d9cdb2" stroke="${INK}" stroke-width="7">
    <rect x="40" y="192" width="226" height="18" rx="6"/>
    <rect x="40" y="238" width="226" height="18" rx="6"/>
  </g>`,

  plane: `<g>
    <path d="M40 244 h150 q26 0 26 -18 q0 -12 -16 -16 l-58 -10 l-26 -42 q-8 -14 -24 -12 l-10 2 l16 44 l-46 -8 l-18 -22 l-12 2 l14 32 l-28 8 l-16 -14 l-10 2 l10 30 q2 10 14 8z"
      fill="#7aa7cd" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
    <circle cx="74" cy="212" r="14" fill="#f3c34d" stroke="${INK}" stroke-width="6"/>
    <path d="M196 226 q30 -10 34 8 q-4 16 -34 10z" fill="#7aa7cd" stroke="${INK}" stroke-width="6"/>
    <path d="M40 244 l-22 26" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
  </g>`,

  camel: `<g>
    <path d="M74 268 q0 -44 26 -62 q6 -44 44 -44 q36 0 42 40 q22 8 22 34 q0 24 -26 32z"
      fill="#e0b071" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>
    <path d="M96 268 v34 M204 268 v34 M132 268 v34 M172 268 v34" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
    <path d="M190 162 q26 -6 34 8 l-6 14 q-16 -8 -30 -8z" fill="#e0b071" stroke="${INK}" stroke-width="7"/>
    <circle cx="204" cy="176" r="4" fill="${INK}"/>
    <path d="M104 206 q-30 -8 -44 -26" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round"/>
  </g>`,

  glasses: `<g>
    <path d="M56 210 h58 q14 0 14 16 q0 30 -28 30 h-16 q-26 0 -28 -30 q-2 -16 0 -16z"
      fill="#241a14" stroke="${INK}" stroke-width="7"/>
    <path d="M186 210 h58 q14 0 14 16 q0 30 -28 30 h-16 q-26 0 -28 -30 q-2 -16 0 -16z"
      fill="#241a14" stroke="${INK}" stroke-width="7"/>
    <path d="M128 218 q22 -12 44 0" stroke="${INK}" stroke-width="8" fill="none"/>
    <path d="M114 216 q-28 -6 -50 -22 M186 216 q28 -6 50 -22" stroke="${INK}" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M66 222 q16 -8 34 -2" stroke="#f8f2e1" stroke-width="5" fill="none" opacity=".65"/>
  </g>`,

  balloon: `<g>
    <path d="M150 148 q56 0 56 58 q0 44 -38 60 q-18 8 -18 8 q0 0 -18 -8 q-38 -16 -38 -60 q0 -58 56 -58z"
      fill="#d9543f" stroke="${INK}" stroke-width="8"/>
    <path d="M150 214 q-22 14 0 22 q22 -8 0 -22z" fill="${INK}"/>
    <path d="M150 274 q10 24 0 36" stroke="${INK}" stroke-width="5" fill="none"/>
    <circle cx="150" cy="146" r="24" fill="#f3c34d" stroke="${INK}" stroke-width="7"/>
    <circle cx="160" cy="140" r="4.5" fill="${INK}"/>
    <path d="M172 148 l16 6 l-16 6z" fill="#e08a3c" stroke="${INK}" stroke-width="4"/>
  </g>`,

  tv: `<g>
    <rect x="58" y="176" width="184" height="128" rx="16" fill="#3a2a1c" stroke="${INK}" stroke-width="8"/>
    <rect x="76" y="194" width="112" height="92" rx="10" fill="#8fb8cf" stroke="${INK}" stroke-width="7"/>
    <path d="M150 176 l-42 -44 M150 176 l44 -42" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
    <circle cx="106" cy="132" r="7" fill="#f3c34d" stroke="${INK}" stroke-width="5"/>
    <circle cx="206" cy="280" r="12" fill="#f3c34d" stroke="${INK}" stroke-width="6"/>
    <rect x="196" y="228" width="28" height="10" rx="4" fill="#f8f2e1" stroke="${INK}" stroke-width="5"/>
  </g>`,

  ball: `<g>
    <circle cx="150" cy="232" r="68" fill="#f8f2e1" stroke="${INK}" stroke-width="8"/>
    <path d="M150 168 q-16 34 0 64 q16 30 0 64" stroke="${INK}" stroke-width="6" fill="none"/>
    <path d="M116 190 l16 10 M116 210 l18 4 M116 232 l16 -4 M116 252 l18 -10
             M184 190 l-16 10 M184 210 l-18 4 M184 232 l-16 -4 M184 252 l-18 -10"
      stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
  </g>`,

  blanket: `<g>
    <path d="M70 150 h160 v130 q-20 26 -40 0 q-20 -26 -40 0 q-20 26 -40 0 q-20 -26 -40 0z"
      fill="#d9543f" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>
    <path d="M70 176 h160 M70 204 h160 M70 232 h160" stroke="#f8f2e1" stroke-width="14"/>
  </g>`,

  doghouse: `<g>
    <path d="M150 140 L246 202 L54 202 Z" fill="#d9543f" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>
    <rect x="72" y="202" width="156" height="98" rx="6" fill="#f3ead2" stroke="${INK}" stroke-width="8"/>
    <path d="M112 300 v-48 a38 38 0 0 1 76 0 v48z" fill="${INK}"/>
    <text x="150" y="290" text-anchor="middle" font-family="Bangers,cursive" font-size="20"
      fill="#f8f2e1" opacity=".55">SNOOPY</text>
  </g>`,

  snowman: `<g>
    <circle cx="150" cy="272" r="52" fill="#f8f2e1" stroke="${INK}" stroke-width="8"/>
    <circle cx="150" cy="196" r="38" fill="#f8f2e1" stroke="${INK}" stroke-width="8"/>
    <path d="M120 176 h60 l-30 -40z" fill="#d9543f" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
    <circle cx="138" cy="190" r="5" fill="${INK}"/><circle cx="162" cy="190" r="5" fill="${INK}"/>
    <path d="M150 196 l10 8 l-10 5z" fill="#e08a3c" stroke="${INK}" stroke-width="4"/>
    <circle cx="150" cy="264" r="6" fill="${INK}"/><circle cx="150" cy="284" r="6" fill="${INK}"/>
    <path d="M126 220 l-38 22 M174 220 l38 22" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
    <rect x="112" y="222" width="76" height="12" rx="5" fill="#d9543f" stroke="${INK}" stroke-width="5"/>
  </g>`,

  kite: `<g>
    <path d="M150 140 L214 186 L150 246 L86 186 Z" fill="#f3c34d" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>
    <path d="M150 140 L214 186 L150 246 Z" fill="#d9543f" stroke="${INK}" stroke-width="6"/>
    <path d="M150 246 v26" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
    <path d="M150 272 q18 14 0 26 q-18 12 0 24" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M150 296 q-14 6 -10 18 q10 -4 14 -16z" fill="#7aa7cd" stroke="${INK}" stroke-width="5"/>
  </g>`,

  snoopy: `<g>
    <ellipse cx="132" cy="248" rx="74" ry="40" fill="#f8f2e1" stroke="${INK}" stroke-width="8"/>
    <circle cx="204" cy="222" r="40" fill="#f8f2e1" stroke="${INK}" stroke-width="8"/>
    <path d="M222 194 q30 -6 22 26 q-8 30 -34 22z" fill="${INK}"/>
    <circle cx="214" cy="214" r="5.5" fill="${INK}"/>
    <path d="M232 224 q14 4 0 12" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M92 232 q-26 -22 -6 -38 q24 8 30 30z" fill="${INK}"/>
    <path d="M96 280 q-16 6 -26 -2" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/>
  </g>`,

  woodstock: `<g>
    <circle cx="150" cy="232" r="62" fill="#f3c34d" stroke="${INK}" stroke-width="8"/>
    <circle cx="176" cy="216" r="9" fill="${INK}"/>
    <path d="M206 234 l30 12 l-30 12z" fill="#e08a3c" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M124 178 q10 -26 30 -12" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
    <path d="M120 244 q-16 4 -20 -10" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round"/>
  </g>`,

  charlie: `<g>
    <circle cx="150" cy="196" r="46" fill="#f8f2e1" stroke="${INK}" stroke-width="8"/>
    <path d="M112 190 q-14 -12 -6 -22 q14 4 14 18" fill="${INK}"/>
    <circle cx="136" cy="192" r="5" fill="${INK}"/><circle cx="166" cy="192" r="5" fill="${INK}"/>
    <path d="M138 216 q12 10 26 0" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M96 252 h108 q-6 56 -54 56 q-48 0 -54 -56z" fill="#f3c34d" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>
    <path d="M104 268 l10 -10 l10 10 l10 -10 l10 10 l10 -10 l10 10 l10 -10"
      stroke="${INK}" stroke-width="6" fill="none"/>
  </g>`,
};

/* ---------- CATÁLOGO ---------- */
const MOVIES = [
  { id:'mv1', art:'p-mv1.jpg', title:'A Charlie Brown Christmas', year:1965, dur:25, genres:['Navidad','Clásico'], motif:'tree',
    pal:['#12304a','#1f5b52','#f3c34d'], badge:'Navidad',
    syn:'Charlie Brown se queja de que la Navidad se ha vuelto un negocio. Snoopy gana un premio de decoración y la pandilla termina entendiendo algo que Charlie Brown no.' },
  { id:'mv2', art:'p-mv2.jpg', title:"It's the Great Pumpkin, Charlie Brown", year:1966, dur:25, genres:['Halloween','Clásico'], motif:'pumpkin',
    pal:['#3a1f4d','#7a2f6b','#e07a2c'],
    syn:'Snoopy se empeña en la limpieza de Halloween mientras sus amigos buscan la Gran Calabaza. Linus cree en eluciérnago con una fe que no le pide pruebas a nadie.' },
  { id:'mv3', art:'p-mv3.jpg', title:'A Charlie Brown Thanksgiving', year:1967, dur:25, genres:['Acción de gracias','Clásico'], motif:'turkey',
    pal:['#5a2a12','#a4531f','#f3c34d'],
    syn:'Una turkey prestada, una cena demasiado llena y una responsabilidad que Charlie Brown asume aunque no la quiera. El pavo termina siendo el héroe.' },
  { id:'mv4', art:'p-mv4.jpg', title:"You're a Good Man, Charlie Brown", year:1969, dur:75, genres:['Musical','Clásico'], motif:'piano',
    pal:['#1c2a4a','#3c4f7a','#f3c34d'], badge:'Musical',
    syn:'La historia de Charlie Brown convertida en musical de Broadway, con Schroeder al piano y toda la pandilla preguntándose qué hacer con su vida.' },
  { id:'mv5', art:'p-mv5.jpg', title:"Snoopy's Reunion", year:1990, dur:25, genres:['Familia','Clásico'], motif:'fence',
    pal:['#2a4a2a','#4a7a4a','#f0e7d0'],
    syn:'El regreso de Snoopy a casa de Charlie Brown. Su familia viene de visita, todo se vuelve nostálgico y alguien dice algo muy tierno con una pata.' },
  { id:'mv6', art:'p-mv6.jpg', title:'A Boy Named Charlie Brown', year:2003, dur:94, genres:['Biografía','Animación'], motif:'ball',
    pal:['#7a3a1c','#c9641f','#f8f2e1'], badge:'94 min',
    syn:'La historia real de Charles Schulz y del niño que no entendía por qué todos le decían lo mismo, hasta que empezó a dibujar a Snoopy.' },
  { id:'mv7', art:'p-mv7.jpg', title:'Snoopy: The Masterpiece', year:2000, dur:84, genres:['Aventura','Animación'], motif:'plane',
    pal:['#8a6a3a','#c9a25a','#7aa7cd'], badge:'84 min',
    syn:'Snoopy se convierte en piloto de la Gran Guerra y acaba en las trincheras, donde firma su avión con el nombre de Napoleón.' },
  { id:'mv8', art:'p-mv8.jpg', title:'The Peanuts Movie', year:2015, dur:98, genres:['Comedia','Animación'], motif:'glasses',
    pal:['#1f3f6b','#3f6ba8','#f3c34d'], badge:'98 min',
    syn:'Un festival de jazz, un concurso de talento y un Snoopy que intenta robarse el protagonista. Charlie Brown aprende a pedir ayuda.' },
  { id:'mv9', art:'p-mv9.jpg', title:'Snoopy Come Home', year:1972, dur:25, genres:['Familia','Clásico'], motif:'doghouse',
    pal:['#4a2a1c','#8a5a2b','#f3c34d'],
    syn:'Snoopy vuelve a casa después de una aventura en la plaza de juegos. La casa del perro, Charlie Brown y un lugar al que regresar.' },
  { id:'mv10', art:'p-mv10.jpg', title:"It Was a Short Summer, Charlie Brown", year:1972, dur:25, genres:['Aventura','Clásico'], motif:'snoopy',
    pal:['#2a5a5a','#4a8a8a','#f3c34d'],
    syn:'Snoopy y sus amigos se van de campamento a la playa y descubren que el mundo es un sitio bastante pequeño. Perfecto para un verano muy corto.' },
  { id:'mv11', art:'p-mv11.jpg', title:"You're Not You, Charlie Brown", year:1972, dur:25, genres:['Musical','Clásico'], motif:'piano',
    pal:['#5a1c3a','#8a3a5a','#f3c34d'], badge:'Musical',
    syn:'Charlie Brown consigue un papel en la obra del colegio y descubre que la vida real es mucho más sencilla que el teatro.' },
];

const SERIES = [
  { id:'sr1', art:'p-sr1.jpg', title:'The New Adventures of Charlie Brown', year:1985, dur:24, genres:['Serie','Clásico'], motif:'charlie',
    pal:['#2a3a6b','#4a5a9a','#f3c34d'],
    syn:'Charlie Brown y su pandilla vuelven a la pantalla con aventuras nuevas, con mucho más ruido que antes.' },
  { id:'sr2', art:'p-sr2.jpg', title:'This Is America, Charlie Brown', year:1989, dur:24, genres:['Serie','Historia'], motif:'fence',
    pal:['#3a2a5a','#6a4a8a','#f3c34d'],
    syn:'Un viaje por la historia de Estados Unidos con Charlie Brown como guía involuntario de un mundo que no entiende.' },
  { id:'sr3', art:'p-sr3.jpg', title:"Charlie Brown's Holiday Classics", year:2020, dur:24, genres:['Navidad','Serie'], motif:'snowman',
    pal:['#1c3a5a','#3a6a9a','#f3c34d'], badge:'Nuevo',
    syn:'Los clásicos regrabados con animación nueva, producción de Apple TV+ y toda la pandilla de siempre.' },
  { id:'sr4', art:'p-sr4.jpg', title:'The Snoopy Show', year:2021, dur:24, genres:['Serie','Animación'], motif:'snoopy',
    pal:['#7a2f4a','#b04a6a','#f3c34d'], badge:'Nuevo',
    syn:'Snoopy es la estrella absoluta de esta serie stop-motion donde su mundo es completamente surreal. La casa del perro, de nuevo.' },
  { id:'sr5', art:'p-sr5.jpg', title:'Snoopy in Space', year:2019, dur:24, genres:['Serie','Espacio'], motif:'balloon',
    pal:['#16244d','#2a3a7a','#f3c34d'],
    syn:'La patrulla espacial de Snoopy con Woodstock al mando. Absurdamente ridículo y completamente fiel al personaje.' },
  { id:'sr6', art:'p-sr6.jpg', title:'Snoopy Presents: To the Moon', year:2021, dur:24, genres:['Serie','Corto'], motif:'balloon',
    pal:['#1c2a4a','#3a4a7a','#f3c34d'],
    syn:'Pequeñas aventuras con estética de anuncio de perfume: Snoopy persigue un sueño hasta la luna.' },
  { id:'sr7', art:'p-sr7.jpg', title:'Peanuts', year:2014, dur:24, genres:['Serie','Animación'], motif:'charlie',
    pal:['#3a5a2a','#6a8a4a','#f3c34d'],
    syn:'La serie de 2014 que reinventó el barrio con un trazo más limpio y un Charlie Brown que camina con más intención.' },
  { id:'sr8', art:'p-sr8.jpg', title:'The Peanuts Gang', year:1950, dur:24, genres:['Serie','Corto'], motif:'woodstock',
    pal:['#6a5a2a','#a08a4a','#f3c34d'],
    syn:'Los cortijos originales de los años cincuenta, cuando el dibujo era una línea y todo era mucho más simple.' },
];

const CONTINUE = [
  { id:'cv1', ref:'mv1', prog:0.62, left:9,  note:'Snoopy ya decoró el árbol. Tú sigues sin entender por qué.' },
  { id:'cv2', ref:'mv2', prog:0.28, left:18, note:'Snoopy sigue esperando en la colina. Nadie va a ir.' },
  { id:'cv3', ref:'sr4', prog:0.81, left:5,  note:'Woodstock se quedó dormido en el especial. No lo despiertes.' },
  { id:'cv4', ref:'mv7', prog:0.44, left:47, note:'El piloto está en la trinchera. Asústale con un poco de Beethoven.' },
  { id:'cv5', ref:'sr2', prog:0.15, left:20, note:'Falta la parte en la que Charlie Brown pregunta quién inventó las leyes.' },
  { id:'cv6', ref:'mv4', prog:0.55, left:34, note:'Schroeder sigue en el piano. Nadie le ha pedido que pare.' },
];

/* ---------- CANALES DE SNOOPY'S WORLD ---------- */
const CHANNELS = [
  { id:'ch1', num:'Canal 01', name:'The Flying Ace', desc:'Snoopy contra el Barón Rojo, en un avión que claramente fue una silla de oficina.', hue:'sepia' },
  { id:'ch2', num:'Canal 02', name:'Sopwith Camel Network', desc:'Desierto, camellos y bombas que sobreviven bastante más de lo que deberían.', hue:'desert' },
  { id:'ch3', num:'Canal 03', name:'Joe Cool Television', desc:'Gafas de sol, sombra dura y un nivel de confianza que no se explica con pruebas.', hue:'cool' },
  { id:'ch4', num:'Canal 04', name:'Lucy’s Telepathy TV', desc:'El quiosco de Lucy y respuestas que nunca son las que esperabas.', hue:'booth' },
  { id:'ch5', num:'Canal 05', name:'The Kite Weather Channel', desc:'Pronóstico del viento, nublado con peas y un cometa que nunca aterriza.', hue:'sky' },
  { id:'ch6', num:'Canal 06', name:'Charlie Brown’s Baseball', desc:'El equipo de siempre, la pelota siempre en el aire y el marcador siempre en contra.', hue:'field' },
];

/* ---------- TIENDA ---------- */
const SHOP = [
  { id:'sh1', name:'Casa del perro (edición limitada)', price:'$89', note:'Techo rojo, pared de tablones y un Snoopy de guardia. No incluye Vienna.',
    icon:'doghouse' },
  { id:'sh2', name:'Cometa de Charlie Brown', price:'$14', note:'El cometa más famoso de la historia. No lo sujetes muy fuerte.',
    icon:'kite' },
  { id:'sh3', name:'Manta de Linus (a rayas)', price:'$29', note:'Suficientemente grande para cubrir a un humano. O a un perro.',
    icon:'blanket' },
  { id:'sh4', name:'Gafas de Joe Cool', price:'$19', note:'Para tener las manos más frescas del barrio.',
    icon:'glasses' },
  { id:'sh5', name:'Convertible de Snoopy', price:'$79', note:'El descapotable de Snoopy, con capota y todo.',
    icon:'snoopy' },
  { id:'sh6', name:'Pelota de baseball', price:'$12', note:'La que Charlie Brown nunca ha tenido en la mano.',
    icon:'ball' },
];

/* ---------- AYUDAS DE ARTE ---------- */
function fitLines(title, maxW, baseSize) {
  const words = String(title).split(' ');
  const approx = (s, size) => s.length * size * 0.415;
  let lines = [''];
  for (const w of words) {
    const test = lines[lines.length - 1] ? lines[lines.length - 1] + ' ' + w : w;
    if (approx(test, baseSize) > maxW && lines[lines.length - 1]) lines.push(w);
    else lines[lines.length - 1] = test;
  }
  if (lines.length > 3) lines = [lines.slice(0, 2).join(' '), lines.slice(2).join(' ')];
  let size = baseSize;
  while (lines.length > 1 && Math.max.apply(null, lines.map(l => approx(l, size))) > maxW) {
    size -= 1.5;
    if (size < 13) break;
  }
  return { lines, size };
}

function posterSVG(item, opts) {
  opts = opts || {};
  const uid = 'p' + item.id;
  const pal = item.pal || ['#2A3348', '#4A5570', '#EFC24A'];
  const c1 = pal[0], c2 = pal[1], acc = pal[2];
  const motif = MOTIFS[item.motif] || MOTIFS.snoopy;
  const fit = fitLines(item.title, 248, opts.size || 27);
  const size = fit.size;
  const startY = 356 - (fit.lines.length - 1) * (size * 1.02);

  const lineEls = fit.lines.map((l, i) =>
    `<text x="150" y="${startY + i * size * 1.02}" text-anchor="middle" font-family="DM Serif Display,Georgia,serif"
       font-size="${size}" fill="#F6F1E4">${esc(l)}</text>`).join('');

  const year = item.year ? String(item.year) : '';
  const dur = item.dur ? ' / ' + item.dur + "'" : '';

  return `<svg viewBox="0 0 300 450" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(item.title)}">
    <defs>
      <linearGradient id="${uid}g" x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
      </linearGradient>
      <pattern id="${uid}d" width="5" height="5" patternUnits="userSpaceOnUse">
        <circle cx="2.5" cy="2.5" r="1.1" fill="#ffffff" opacity=".5"/>
      </pattern>
      <radialGradient id="${uid}v" cx="50%" cy="42%" r="72%">
        <stop offset="55%" stop-color="#000000" stop-opacity="0"/>
        <stop offset="100%" stop-color="#000000" stop-opacity=".34"/>
      </radialGradient>
    </defs>
    <rect width="300" height="450" fill="url(#${uid}g)"/>
    <circle cx="240" cy="62" r="46" fill="${acc}" opacity=".13"/>
    <g transform="translate(0,-8)">${motif}</g>
    <rect width="300" height="450" fill="url(#${uid}v)"/>
    <rect y="296" width="300" height="154" fill="#0B0A07" opacity=".86"/>
    <rect y="296" width="300" height="1.4" fill="${acc}"/>
    ${lineEls}
    <text x="150" y="424" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="10.5"
      letter-spacing="2.2" fill="${acc}" opacity=".92">${esc(year + dur)}</text>
    <rect x=".7" y=".7" width="298.6" height="448.6" fill="none" stroke="#ffffff" stroke-opacity=".1"/>
  </svg>`;
}

function posterHTML(item, opts) {
  opts = opts || {};
  if (item.art) {
    const fit = fitLines(item.title, 250, opts.size || 27);
    const size = fit.size;
    const startY = 352 - (fit.lines.length - 1) * (size * 1.02);
    const lines = fit.lines.map((l, i) =>
      `<text x="150" y="${startY + i * size * 1.02}" text-anchor="middle" font-family="DM Serif Display,Georgia,serif"
         font-size="${size}" fill="#F6F1E4">${esc(l)}</text>`).join('');
    const meta = (item.year ? String(item.year) : '') + (item.dur ? ' / ' + item.dur + "'" : '');
    return `<div class="poster">
      <img src="assets/posters/${item.art}" alt="${esc(item.title)}" loading="lazy">
      <div class="poster-veil"></div>
      <svg class="poster-text" viewBox="0 0 300 450" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <rect y="292" width="300" height="158" fill="#0B0A07" opacity=".82"/>
        <rect y="292" width="300" height="1.4" fill="#EFC24A"/>
        ${lines}
        <text x="150" y="424" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="10.5"
          letter-spacing="2.2" fill="#EFC24A" opacity=".92">${esc(meta)}</text>
      </svg>
    </div>`;
  }
  return posterSVG(item, opts);
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
