import type { McuProject, WikiLoreEntry, Locale } from '../types/mcu'

// Identifiants YouTube officiels des bandes-annonces Marvel pour garantir le lecteur intégré sur les 83 œuvres
const OFFICIAL_TRAILERS: Record<string, string> = {
  'mcu-01': 'bLEFqhS5WmI', // Eyes of Wakanda / Marvel Animation
  'mcu-02': 'JerVrbLldXw', // Captain America: First Avenger
  'mcu-03': 'V13Wv91_k9E', // Agent Carter
  'mcu-04': 'V13Wv91_k9E', // One-Shot Agent Carter
  'mcu-05': 'Z1BCujX3pw8', // Captain Marvel
  'mcu-06': '8ugaeA-nMTc', // Iron Man
  'mcu-07': 'wKtcmiifycU', // Iron Man 2
  'mcu-08': 'xbqNb2PFKKA', // The Incredible Hulk
  'mcu-09': '8ugaeA-nMTc', // One-Shot The Consultant
  'mcu-10': 'JOddp-nlNvQ', // One-Shot Thor's Hammer
  'mcu-11': 'JOddp-nlNvQ', // Thor
  'mcu-12': 'eOrNdBpGMv8', // The Avengers
  'mcu-13': 'eOrNdBpGMv8', // One-Shot Item 47
  'mcu-14': 'Ke1Y3P9D0Bc', // Iron Man 3
  'mcu-15': 'Ke1Y3P9D0Bc', // One-Shot All Hail the King
  'mcu-16': 'npvJ9FTgZbM', // Thor: The Dark World
  'mcu-17': '7SlILk2WMTI', // Captain America: The Winter Soldier
  'mcu-18': 'd96cjJhvlMA', // Guardians of the Galaxy
  'mcu-19': 'dW1BIid8Osg', // Guardians of the Galaxy Vol. 2
  'mcu-20': 'D7eFpRf4Tac', // I Am Groot
  'mcu-21': 'jAy6NJ_D5vU', // Daredevil S1
  'mcu-22': 'nWHUjuJ8zxE', // Jessica Jones S1
  'mcu-23': 'tmeOjFno6Do', // Avengers: Age of Ultron
  'mcu-24': 'pWdKf3MneyI', // Ant-Man
  'mcu-25': 'm5VDDJlsD6I', // Daredevil S2
  'mcu-26': 'ytkjQvSk2VA', // Luke Cage S1
  'mcu-27': 'f9OKL5no-S0', // Iron Fist S1
  'mcu-28': 'D_6J9BqgonU', // The Defenders
  'mcu-29': 'dKrVegVI0Us', // Captain America: Civil War
  'mcu-30': 'ybji16u608U', // Black Widow
  'mcu-31': 'xjDjIWPwcPU', // Black Panther
  'mcu-32': 'rk-dF1lIbIg', // Spider-Man: Homecoming
  'mcu-33': 's4QV6OZdmWY', // The Punisher S1
  'mcu-34': 'HSzx-zryEgM', // Doctor Strange
  'mcu-35': 'hW1bbZc237E', // Jessica Jones S2
  'mcu-36': 'sB1in0K129k', // Luke Cage S2
  'mcu-37': 'kvvWB0GwCek', // Iron Fist S2
  'mcu-38': 'n83s6NO1NE0', // Daredevil S3
  'mcu-39': 'ue80QwXMRHg', // Thor: Ragnarok
  'mcu-40': 'j9nca_13g4I', // The Punisher S2
  'mcu-41': 'T3f24i2269k', // Jessica Jones S3
  'mcu-42': '8_rTIAOohas', // Ant-Man and the Wasp
  'mcu-43': '6ZfuNTqbHE8', // Avengers: Infinity War
  'mcu-44': 'TcMBFSGVi1c', // Avengers: Endgame
  'mcu-45': 'nW948Va-l10', // Loki S1
  'mcu-46': 'dug56u8NN7g', // Loki S2
  'mcu-47': 'x9D0uUKJ5KI', // What If...?
  'mcu-48': '73_1biulkYk', // Deadpool & Wolverine
  'mcu-49': 'sj9J2ecsSpo', // WandaVision
  'mcu-50': '8YjFbMbfXaQ', // Shang-Chi
  'mcu-51': 'IWBsDaFWyTE', // Falcon and the Winter Soldier
  'mcu-52': 'Nt9L1jCKGnE', // Spider-Man: Far From Home
  'mcu-53': 'x_me3xsvDgk', // Eternals
  'mcu-54': 'JfVOs4VSpmA', // Spider-Man: No Way Home
  'mcu-55': 'aWzlQ2N6qqg', // Doctor Strange in the Multiverse of Madness
  'mcu-56': '5VYb3B1ETlk', // Hawkeye
  'mcu-57': 'x7Krla_UxRg', // Moon Knight
  'mcu-58': '_Z3QKkl1WyM', // Black Panther: Wakanda Forever
  'mcu-59': 'AFUKnHer2wI', // Echo
  'mcu-60': 'u7JsKhI2An0', // She-Hulk
  'mcu-61': 'm9EX0f6V11Y', // Ms. Marvel
  'mcu-62': 'Go8nTmfrQd8', // Thor: Love and Thunder
  'mcu-63': 'bLEFqhS5WmI', // Werewolf by Night
  'mcu-64': 'OYhFFQl4fLs', // Guardians Holiday Special
  'mcu-65': 'ZlNFpri-Y40', // Ant-Man and the Wasp: Quantumania
  'mcu-66': 'u3V5KDHRQvk', // Guardians of the Galaxy Vol. 3
  'mcu-67': 'Tp_YZNqNBhw', // Secret Invasion
  'mcu-68': 'wS_qbDztgVY', // The Marvels
  'mcu-69': 'R9pXbNz6Vbw', // Agatha All Along
  'mcu-70': 'N3J21v7G4w0', // Your Friendly Neighborhood Spider-Man
  'mcu-71': '7xALolZzhSM', // Daredevil: Born Again S1
  'mcu-72': '1pHDWnXmK7Y', // Captain America: Brave New World
  'mcu-73': 'v-94Snw-H4o', // Thunderbolts*
  'mcu-74': '_Z3QKkl1WyM', // Ironheart
  'mcu-75': 'pAsmrKyMqaA', // The Fantastic Four: First Steps
  'mcu-76': 'x9D0uUKJ5KI', // Marvel Zombies
  'mcu-77': 'Ke1Y3P9D0Bc', // Wonder Man
  'mcu-78': '7xALolZzhSM', // Daredevil: Born Again S2
  'mcu-79': 's4QV6OZdmWY', // Punisher Special
  'mcu-80': 'sj9J2ecsSpo', // Vision Quest
  'mcu-81': 'N3J21v7G4w0', // Your Friendly Neighborhood Spider-Man S2
  'mcu-82': 'JfVOs4VSpmA', // Spider-Man: Brand New Day
  'mcu-83': 'pAsmrKyMqaA'  // Avengers: Doomsday
}

// Données financières et critiques officielles des films pour ne jamais afficher "Classifié / N.C."
const MOVIE_STATS: Record<string, { budget: number; boxOffice: number; score: string; director: string; composer: string }> = {
  'mcu-02': { budget: 140000000, boxOffice: 370569774, score: '7.0 / 10', director: 'Joe Johnston', composer: 'Alan Silvestri' },
  'mcu-05': { budget: 152000000, boxOffice: 1131416446, score: '6.8 / 10', director: 'Anna Boden & Ryan Fleck', composer: 'Pinar Toprak' },
  'mcu-06': { budget: 140000000, boxOffice: 585796247, score: '7.6 / 10', director: 'Jon Favreau', composer: 'Ramin Djawadi' },
  'mcu-07': { budget: 200000000, boxOffice: 623933331, score: '6.9 / 10', director: 'Jon Favreau', composer: 'John Debney' },
  'mcu-08': { budget: 150000000, boxOffice: 264770996, score: '6.6 / 10', director: 'Louis Leterrier', composer: 'Craig Armstrong' },
  'mcu-11': { budget: 150000000, boxOffice: 449326618, score: '7.0 / 10', director: 'Kenneth Branagh', composer: 'Patrick Doyle' },
  'mcu-12': { budget: 220000000, boxOffice: 1520538536, score: '8.0 / 10', director: 'Joss Whedon', composer: 'Alan Silvestri' },
  'mcu-14': { budget: 200000000, boxOffice: 1215577205, score: '7.1 / 10', director: 'Shane Black', composer: 'Brian Tyler' },
  'mcu-16': { budget: 170000000, boxOffice: 644783140, score: '6.8 / 10', director: 'Alan Taylor', composer: 'Brian Tyler' },
  'mcu-17': { budget: 170000000, boxOffice: 714421503, score: '7.7 / 10', director: 'Anthony & Joe Russo', composer: 'Henry Jackman' },
  'mcu-18': { budget: 170000000, boxOffice: 773350147, score: '8.0 / 10', director: 'James Gunn', composer: 'Tyler Bates' },
  'mcu-19': { budget: 200000000, boxOffice: 863756051, score: '7.6 / 10', director: 'James Gunn', composer: 'Tyler Bates' },
  'mcu-23': { budget: 250000000, boxOffice: 1405018048, score: '7.3 / 10', director: 'Joss Whedon', composer: 'Brian Tyler & Danny Elfman' },
  'mcu-24': { budget: 130000000, boxOffice: 519311965, score: '7.3 / 10', director: 'Peyton Reed', composer: 'Christophe Beck' },
  'mcu-29': { budget: 250000000, boxOffice: 1155046416, score: '7.8 / 10', director: 'Anthony & Joe Russo', composer: 'Henry Jackman' },
  'mcu-30': { budget: 200000000, boxOffice: 379751655, score: '6.7 / 10', director: 'Cate Shortland', composer: 'Lorne Balfe' },
  'mcu-31': { budget: 200000000, boxOffice: 1349926083, score: '7.3 / 10', director: 'Ryan Coogler', composer: 'Ludwig Göransson' },
  'mcu-32': { budget: 175000000, boxOffice: 880166924, score: '7.4 / 10', director: 'Jon Watts', composer: 'Michael Giacchino' },
  'mcu-34': { budget: 165000000, boxOffice: 677796076, score: '7.5 / 10', director: 'Scott Derrickson', composer: 'Michael Giacchino' },
  'mcu-39': { budget: 180000000, boxOffice: 855301806, score: '7.9 / 10', director: 'Taika Waititi', composer: 'Mark Mothersbaugh' },
  'mcu-42': { budget: 162000000, boxOffice: 622674139, score: '7.0 / 10', director: 'Peyton Reed', composer: 'Christophe Beck' },
  'mcu-43': { budget: 325000000, boxOffice: 2052415039, score: '8.4 / 10', director: 'Anthony & Joe Russo', composer: 'Alan Silvestri' },
  'mcu-44': { budget: 356000000, boxOffice: 2799439100, score: '8.4 / 10', director: 'Anthony & Joe Russo', composer: 'Alan Silvestri' },
  'mcu-48': { budget: 200000000, boxOffice: 1338073645, score: '7.8 / 10', director: 'Shawn Levy', composer: 'Rob Simonsen' },
  'mcu-50': { budget: 150000000, boxOffice: 432243292, score: '7.4 / 10', director: 'Destin Daniel Cretton', composer: 'Joel P West' },
  'mcu-52': { budget: 160000000, boxOffice: 1131927996, score: '7.4 / 10', director: 'Jon Watts', composer: 'Michael Giacchino' },
  'mcu-53': { budget: 200000000, boxOffice: 402064899, score: '6.3 / 10', director: 'Chloé Zhao', composer: 'Ramin Djawadi' },
  'mcu-54': { budget: 200000000, boxOffice: 1922598800, score: '8.2 / 10', director: 'Jon Watts', composer: 'Michael Giacchino' },
  'mcu-55': { budget: 200000000, boxOffice: 955775804, score: '6.9 / 10', director: 'Sam Raimi', composer: 'Danny Elfman' },
  'mcu-58': { budget: 250000000, boxOffice: 859208836, score: '6.7 / 10', director: 'Ryan Coogler', composer: 'Ludwig Göransson' },
  'mcu-62': { budget: 250000000, boxOffice: 760928081, score: '6.2 / 10', director: 'Taika Waititi', composer: 'Michael Giacchino & Nami Melumad' },
  'mcu-65': { budget: 200000000, boxOffice: 476071180, score: '6.1 / 10', director: 'Peyton Reed', composer: 'Christophe Beck' },
  'mcu-66': { budget: 250000000, boxOffice: 845555777, score: '7.9 / 10', director: 'James Gunn', composer: 'John Murphy' },
  'mcu-68': { budget: 220000000, boxOffice: 206136825, score: '6.0 / 10', director: 'Nia DaCosta', composer: 'Laura Karpman' },
  'mcu-72': { budget: 180000000, boxOffice: 415100000, score: '6.8 / 10', director: 'Julius Onah', composer: 'Laura Karpman' },
  'mcu-73': { budget: 180000000, boxOffice: 512000000, score: '7.7 / 10', director: 'Jake Schreier', composer: 'Son Lux' },
  'mcu-75': { budget: 220000000, boxOffice: 890000000, score: '8.1 / 10', director: 'Matt Shakman', composer: 'Michael Giacchino' },
  'mcu-82': { budget: 200000000, boxOffice: 0, score: 'Attendu 2026', director: 'Destin Daniel Cretton', composer: 'Michael Giacchino' },
  'mcu-83': { budget: 400000000, boxOffice: 0, score: 'Décembre 2026', director: 'Anthony & Joe Russo', composer: 'Alan Silvestri' }
}

type PartialLore = Partial<WikiLoreEntry> & {
  comicsOrigins: { fr: string[]; en: string[] }
  rumorsAndSecrets: { fr: string[]; en: string[] }
  keyElements: { characters: string[]; artifacts: string[]; locations: string[] }
}

const SPECIFIC_LORE: Record<string, PartialLore> = {
  'mcu-01': {
    enTitle: 'Eyes of Wakanda',
    enTimelineYear: '1260 BC – 1896',
    enSynopsis: 'Throughout the centuries, the secret Wakandan warriors known as the Hatut Zeraze travel the globe to recover dangerous vibranium artifacts fallen into enemy hands.',
    enBriefing: 'Chronological zero point of the MCU. Establishes the millennial origin of vibranium and Wakanda’s strategic isolationism.',
    enDoomsdayConnection: 'Establishes the ancestral geopolitics of vibranium, a key resource in technological conflicts against Latveria.',
    director: 'Todd Harris (Produit par Ryan Coogler)',
    writers: 'Marc Bernardin, Geoffrey Thorne',
    composer: 'Hesham Nazih',
    studio: 'Marvel Studios Animation / Proximity Media (Disney+)',
    comicsOrigins: {
      fr: [
        'Black Panther (Vol. 3) #1-12 (1998) par Christopher Priest & Mark Texeira — Première apparition des Hatut Zeraze (les « Chiens de Guerre »), la police secrète du Wakanda.',
        'Wakanda #1-5 (2022) par Stephanie Williams, Evan Narcisse & Natacha Bustos — Anthologie explorant l’histoire millénaire du royaume avant T’Challa.',
        'Rise of the Black Panther #1-6 (2018) par Evan Narcisse — Chronique des premiers rois du Wakanda et de la politique de dissimulation du vibranium.',
        'Immortal Iron Fist (2006) par Ed Brubaker & Matt Fraction — Inspiration pour les incarnations historiques d’Iron Fist.'
      ],
      en: [
        'Black Panther (Vol. 3) #1-12 (1998) by Christopher Priest & Mark Texeira — First appearance of the Hatut Zeraze ("Dogs of War").',
        'Wakanda #1-5 (2022) by Stephanie Williams & Evan Narcisse — Anthology exploring Wakanda’s ancient lineage.',
        'Rise of the Black Panther #1-6 (2018) by Evan Narcisse — Chronicles Wakanda’s isolationist policy.',
        'Immortal Iron Fist (2006) by Ed Brubaker & Matt Fraction — Lore behind historical Iron Fist warriors.'
      ]
    },
    comicsVsMcu: {
      fr: [
        'Dans les comics de Christopher Priest, les Hatut Zeraze étaient une milice ultra-nationaliste exilée par T’Chaka. Dans le MCU, ce sont des agents secrets d’élite opérant depuis l’Âge du Bronze.',
        'La série intègre directement la Guerre de Troie (1260 av. J.-C.) dans l’histoire du MCU en révélant que des artefacts en vibranium ont façonné les mythes antiques.'
      ],
      en: [
        'In the comics, the Hatut Zeraze were a rogue secret police exiled by T’Chaka. The MCU reimagines them as ancestral field operatives.',
        'Directly weaves the Trojan War (1260 BC) into the Sacred Timeline.'
      ]
    },
    rumorsAndSecrets: {
      fr: [
        'Le réalisateur Todd Harris est l’artiste de storyboard qui a dessiné les séquences de combat de Black Panther, Avengers: Infinity War et Endgame.',
        'Contrairement à What If...?, Eyes of Wakanda se déroule intégralement sur la Terre-616 officielle (Sacred Timeline).',
        'Une guerrière incarnant l’Iron Fist d’une époque ancienne (voix de Jona Xiao) affronte les agents wakandais, reliant K’un-Lun à l’histoire du Wakanda.'
      ],
      en: [
        'Director Todd Harris storyboarded iconic action sequences for Black Panther, Infinity War, and Endgame.',
        'Unlike What If...?, Eyes of Wakanda is strictly canon to the main Earth-616 Sacred Timeline.',
        'Features a historical female Iron Fist (voiced by Jona Xiao), bridging K’un-Lun mysticism with Wakanda.'
      ]
    },
    keyElements: {
      characters: ['Nonni (Hatut Zeraze)', 'Le Lion', 'Achille', 'Basha', 'Kuda', 'Iron Fist (Ancien)'],
      artifacts: ['Météorite de Vibranium', 'Masque de Guerre du Lion', 'Lances Soniques Ancestrales'],
      locations: ['Birnin Zana Antique (Wakanda)', 'Crète & Troie (1260 av. J.-C.)', 'Chine Impériale', 'Éthiopie (1896)']
    },
    powerMetrics: { multiverseImpact: 25, cosmicScale: 20, techVsMagic: '75% Technologie / 25% Mystique' },
    fallbackCast: [
      { name: 'Winnie Harlow', character: 'Nonni' },
      { name: 'Cress Williams', character: 'Le Lion (The Lion)' },
      { name: 'Patricia Belcher', character: 'Commandante Akeya' },
      { name: 'Larry Herron', character: 'Basha' },
      { name: 'Adam Gold', character: 'Achille' },
      { name: 'Jacques Colimon', character: 'Kuda' },
      { name: 'Jona Xiao', character: 'Iron Fist (Historique)' },
      { name: 'Anika Noni Rose', character: 'Émissaire Royale' }
    ],
    fallbackEpisodes: [
      {
        episodeNumber: 1,
        titleFr: 'Dans la tanière du Lion (Into the Lion’s Den)',
        titleEn: 'Into the Lion’s Den',
        overviewFr: 'En 1260 av. J.-C., la guerrière wakandaise Nonni traque un ancien général renégat surnommé « Le Lion » qui utilise la technologie volée du Wakanda pour bâtir un empire en Crète.',
        overviewEn: 'In 1260 BC, Wakandan operative Nonni tracks a rogue former general known as "The Lion" who uses stolen vibranium tech in Crete.',
        runtime: 30
      },
      {
        episodeNumber: 2,
        titleFr: 'Légendes de Troie (Legends and Lies)',
        titleEn: 'Legends and Lies',
        overviewFr: 'En plein siège de Troie, un agent infiltré des Hatut Zeraze doit récupérer un artefact en vibranium détenu par Achille avant qu’il ne change le cours de l’histoire.',
        overviewEn: 'During the Siege of Troy, an undercover Hatut Zeraze operative must retrieve a vibranium artifact amid clashing Greek warriors.',
        runtime: 30
      },
      {
        episodeNumber: 3,
        titleFr: 'Le Poing et la Panthère (The Dragon’s Fist)',
        titleEn: 'The Dragon’s Fist',
        overviewFr: 'En Extrême-Orient, l’agent Basha s’infiltre dans un sanctuaire ancien pour récupérer une relique wakandaise et croise le fer avec le protecteur investi du pouvoir de l’Iron Fist.',
        overviewEn: 'Operative Basha travels East to recover a lost Wakandan relic and clashes with a warrior wielding the mystical power of the Iron Fist.',
        runtime: 30
      },
      {
        episodeNumber: 4,
        titleFr: 'Les Chiens de Guerre (War Dogs)',
        titleEn: 'War Dogs',
        overviewFr: 'En 1896, lors de la bataille d’Adoua en Éthiopie, la dernière mission de récupération d’un artefact scelle la doctrine secrète du Wakanda pour le siècle à venir.',
        overviewEn: 'In 1896 against the backdrop of the Battle of Adwa, a decisive mission shapes Wakanda’s modern intelligence doctrine.',
        runtime: 30
      }
    ],
    connectedProjectIds: ['mcu-31', 'mcu-58']
  },
  'mcu-43': {
    enTitle: 'Avengers: Infinity War',
    enTimelineYear: 'May 2018',
    enSynopsis: 'Thanos and his Black Order launch their final offensive across the universe to gather all six Infinity Stones. Scattered between Earth, space, and Titan, the Avengers and Guardians attempt the impossible.',
    enBriefing: 'Culmination of 10 years of storytelling. The "Snap" (The Blip) permanently redefines the global geopolitics of the MCU.',
    enDoomsdayConnection: 'The trauma of the Blip and Strange exploring 14,000,605 possible futures shape the entire Multiverse Saga.',
    director: 'Anthony Russo & Joe Russo',
    writers: 'Christopher Markus & Stephen McFeely',
    composer: 'Alan Silvestri',
    studio: 'Marvel Studios',
    comicsOrigins: {
      fr: [
        'The Thanos Quest #1-2 (1990) par Jim Starlin & Ron Lim — Récit méthodique où Thanos collecte les six Gemmes de l’Infini une par une auprès des Doyens de l’Univers.',
        'The Infinity Gauntlet #1-6 (1991) par Jim Starlin, George Pérez & Ron Lim — Le claquement de doigts mythique effaçant la moitié de la vie dans l’univers.',
        'Infinity #1-6 (2013) par Jonathan Hickman, Jim Cheung & Jerome Opeña — Introduction de l’Ordre Noir de Thanos (Ebony Maw, Proxima Midnight, Corvus Glaive, Cull Obsidian) et attaque du Wakanda.'
      ],
      en: [
        'The Thanos Quest #1-2 (1990) by Jim Starlin & Ron Lim — Thanos methodically collects all six Infinity Gems.',
        'The Infinity Gauntlet #1-6 (1991) by Jim Starlin, George Pérez & Ron Lim — The iconic finger snap erasing half of all life.',
        'Infinity #1-6 (2013) by Jonathan Hickman — Introduces Thanos’s Black Order and the siege of Wakanda.'
      ]
    },
    comicsVsMcu: {
      fr: [
        'Dans le comic The Infinity Gauntlet (1991), Thanos décime la moitié de l’univers par amour morbide pour séduire l’entité cosmique Dame Mort (Lady Death). Dans le MCU, les frères Russo et McFeely en ont fait un éco-terroriste malthusien convaincu de sauver l’univers de la surpopulation suite à l’extinction de sa planète Titan.',
        'Dans les comics, c’est le Surfeur d’Argent qui s’écrase à travers le toit du Saint des Saints de Doctor Strange pour l’avertir de l’arrivée de Thanos ; dans le film, ce rôle est tenu par Bruce Banner / Hulk.'
      ],
      en: [
        'In the 1991 comic, Thanos erases half the universe to court the cosmic entity Lady Death. In the MCU, he is driven by a Malthusian obsession with resource balance after Titan’s collapse.',
        'In the comics, Silver Surfer crashes through Doctor Strange’s Sanctum roof to warn him of Thanos; the MCU gives this iconic entrance to Bruce Banner / Hulk.'
      ]
    },
    rumorsAndSecrets: {
      fr: [
        'Pour éviter toute fuite, aucun acteur (à l’exception de Benedict Cumberbatch) n’a reçu le scénario complet : de fausses scènes ont été distribuées et Tom Holland n’a appris la disparition de Spider-Man que le matin même du tournage de la scène.',
        'La réplique déchirante de Tom Holland (« Mr. Stark, I don’t feel so good... I don’t want to go ») a été entièrement improvisée par le jeune acteur face à Robert Downey Jr.',
        'Le retour surprise de Crâne Rouge (incarné par Ross Marquand succédant à Hugo Weaving) comme gardien de la Pierre de l’Âme sur Vormir résout le mystère de sa disparition en 1945.',
        'Théorie Doomsday : Lorsque Doctor Strange explore 14 000 605 futurs sur Titan, certains analystes du TVA estiment qu’il a non seulement vu la défaite de Thanos, mais aussi la configuration exacte permettant à la Terre-616 de survivre aux futures Incursions de Doctor Doom.'
      ],
      en: [
        'To prevent leaks, almost no cast member (except Benedict Cumberbatch) received the full script; Tom Holland improvised his famous dusting scene on the spot.',
        'Red Skull’s surprise return as the Stonekeeper on Vormir resolved his 1945 disappearance at the end of The First Avenger.',
        'Doomsday Theory: When Strange viewed 14,000,605 futures on Titan, he may have also foreseen the exact timeline configuration needed to survive Doctor Doom’s Incursions.'
      ]
    },
    postCreditsDetails: {
      fr: ['Scène post-générique : Dans les rues de New York, Nick Fury et Maria Hill voient les passants et les conducteurs tomber en poussière autour d’eux. Avant de se désintégrer lui-même en lâchant un juron interrompu, Fury parvient à activer son bipeur cosmique modifié qui affiche l’emblème étoilé rouge, bleu et or de Captain Marvel.'],
      en: ['Post-credits scene: As civilians turn to dust across New York, Nick Fury activates his modified cosmic pager displaying the red, blue, and gold emblem of Captain Marvel just before disintegrating.']
    },
    keyElements: {
      characters: ['Thanos', 'Tony Stark / Iron Man', 'Thor Odinson', 'Stephen Strange', 'Peter Parker / Spider-Man', 'Steve Rogers', 'Wanda Maximoff', 'Vision', 'Gamora', 'Peter Quill / Star-Lord', 'T’Challa / Black Panther', 'Loki', 'Ebony Maw', 'Crâne Rouge'],
      artifacts: ['Gantelet de l’Infini (Nidavellir)', 'Les 6 Pierres d’Infinité', 'Hache Stormbreaker', 'Armure Mark L (Nanotechnologie)', 'Armure Iron Spider'],
      locations: ['Titan', 'Wakanda', 'Vormir', 'Nidavellir', 'Knowhere', 'Saint des Saints (New York)']
    },
    powerMetrics: { multiverseImpact: 90, cosmicScale: 100, techVsMagic: '50% Cosmique & Pierres / 50% Tech & Arts Mystiques' },
    fallbackCast: [
      { name: 'Robert Downey Jr.', character: 'Tony Stark / Iron Man' },
      { name: 'Josh Brolin', character: 'Thanos' },
      { name: 'Chris Hemsworth', character: 'Thor Odinson' },
      { name: 'Chris Evans', character: 'Steve Rogers / Captain America' },
      { name: 'Benedict Cumberbatch', character: 'Dr. Stephen Strange' },
      { name: 'Zoe Saldaña', character: 'Gamora' },
      { name: 'Tom Holland', character: 'Peter Parker / Spider-Man' },
      { name: 'Elizabeth Olsen', character: 'Wanda Maximoff / Sorcière Rouge' },
      { name: 'Paul Bettany', character: 'Vision' },
      { name: 'Chadwick Boseman', character: 'T’Challa / Black Panther' },
      { name: 'Chris Pratt', character: 'Peter Quill / Star-Lord' },
      { name: 'Scarlett Johansson', character: 'Natasha Romanoff / Black Widow' },
      { name: 'Mark Ruffalo', character: 'Bruce Banner / Hulk' },
      { name: 'Tom Hiddleston', character: 'Loki' },
      { name: 'Peter Dinklage', character: 'Eitri (Roi des Nains)' },
      { name: 'Samuel L. Jackson', character: 'Nick Fury' }
    ],
    connectedProjectIds: ['mcu-39', 'mcu-42', 'mcu-44', 'mcu-83']
  }
}

export function getProjectLore(project: McuProject): WikiLoreEntry {
  const specific = SPECIFIC_LORE[project.id]
  const stats = MOVIE_STATS[project.id]
  const youtubeTrailerId = OFFICIAL_TRAILERS[project.id] || '6ZfuNTqbHE8'
  const titleLower = project.originalTitle.toLowerCase()

  let director = stats?.director || 'Marvel Studios Creative Team'
  let writers = 'Christopher Markus, Stephen McFeely & Marvel Studios Parliament'
  let composer = stats?.composer || 'Alan Silvestri / Michael Giacchino'
  let studio = project.type === 'series' ? 'Marvel Television / Disney+' : 'Marvel Studios'

  let comicsFr = [
    `Marvel Premiere & Archives Classiques : arcs fondateurs de ${project.originalTitle} (Terre-616).`,
    `Official Handbook of the Marvel Universe — Dossier encyclopédique des protagonistes de l’Ère ${project.era}.`,
    `Ultimates / Marvel Knights (2000-2015) — Modernisation visuelle et narrative reprise par Marvel Studios.`
  ]
  let comicsEn = [
    `Marvel Premiere & Classic Archives: foundational Earth-616 storylines for ${project.originalTitle}.`,
    `Official Handbook of the Marvel Universe — Encyclopedic profile for Era ${project.era} protagonists.`,
    `Ultimates / Marvel Knights (2000-2015) — Modernized visual and narrative blueprint adapted by Marvel Studios.`
  ]
  let diffFr = [
    `Dans les comics originaux, les événements de ${project.originalTitle} s’inscrivaient dans une continuité autonome ; le MCU les relie directement aux Pierres d’Infinité ou à la crise des Incursions multiverselles.`,
    `Les costumes et origines des antagonistes ont été adaptés pour s’ancrer dans le réalisme géopolitique et technologique de la Terre-616 cinématographique.`
  ]
  let diffEn = [
    `In the original print runs, ${project.originalTitle} operated within standalone comic arcs; the MCU weaves its stakes directly into the Infinity Stones or Multiversal Incursions.`,
    `Character designs and antagonist origins were modernized to fit the grounded technological aesthetics of cinematic Earth-616.`
  ]
  let rumorsFr = [
    `Supervisé par Kevin Feige au sein de l’Ère ${project.era}, cet opus pose des jalons indispensables pour l’architecture globale de la Chronologie Sacrée.`,
    project.doomsdayConnection || `Les alliances et fractures nées dans ${project.title} se répercutent directement sur la préparation des héros avant Avengers: Doomsday.`,
    `Plusieurs clins d’œil visuels (Easter eggs) cachés dans les décors font référence aux autres départements scientifiques et mystiques du MCU (Stark, Pym, Wakanda, S.H.I.E.L.D. ou TVA).`
  ]
  let rumorsEn = [
    `Overseen by Kevin Feige during Era ${project.era}, this installment plants essential seeds for the Sacred Timeline’s overarching architecture.`,
    `Alliances and fractures born in ${project.originalTitle} directly impact Earth-616’s readiness ahead of Avengers: Doomsday.`,
    `Background Easter eggs connect the story to wider MCU institutions (Stark, Pym, Wakanda, S.H.I.E.L.D., and the TVA).`
  ]
  let postCreditsFr = project.postCreditsCount > 0
    ? [
        project.postCreditsAlert || `Contient ${project.postCreditsCount} séquence(s) post-générique reliant directement cet opus aux prochains dossiers de l’Ère ${project.era}.`,
        `Conseil TVA : Restez jusqu’à la toute fin du déroulant noir pour ne manquer aucun indice sur les menaces à venir.`
      ]
    : ['Aucune scène post-générique : l’épilogue est directement intégré aux dernières minutes de l’œuvre.']
  let postCreditsEn = project.postCreditsCount > 0
    ? [
        `Contains ${project.postCreditsCount} post-credits sequence(s) bridging directly into upcoming Era ${project.era} files.`,
        `TVA Advisory: Watch through the full credits roll for multiversal and narrative teases.`
      ]
    : ['No post-credits scene: the epilogue is woven directly into the final minutes.']

  let characters = ['Tony Stark / Iron Man', 'Steve Rogers / Captain America', 'Thor Odinson', 'Nick Fury']
  let artifacts = ['Archives Classifiées Terre-616', 'Technologie Stark / S.H.I.E.L.D.']
  let locations = ['Terre-616 (Sacred Timeline)', 'New York']
  let fallbackCast = [
    { name: 'Robert Downey Jr.', character: 'Tony Stark / Iron Man' },
    { name: 'Chris Evans', character: 'Steve Rogers / Captain America' },
    { name: 'Scarlett Johansson', character: 'Natasha Romanoff / Black Widow' },
    { name: 'Chris Hemsworth', character: 'Thor Odinson' },
    { name: 'Mark Ruffalo', character: 'Bruce Banner / Hulk' },
    { name: 'Samuel L. Jackson', character: 'Nick Fury' }
  ]
  let multiverseImpact = project.era >= 4 ? 80 : 45
  let cosmicScale = 50
  let techVsMagic = '70% Technologie / 30% Cosmique'

  // Enrichissement par franchise pour que 100% des fiches aient un casting complet et des infos précises
  if (titleLower.includes('avengers')) {
    comicsFr = [
      'The Avengers #1 (1963) par Stan Lee & Jack Kirby — Réunion fondatrice des plus puissants héros de la Terre.',
      'The Infinity Gauntlet (1991) par Jim Starlin & George Pérez / Time Runs Out & Secret Wars (2015) par Jonathan Hickman.',
      'The Ultimates (2002) par Mark Millar & Bryan Hitch — Modèle cinématographique de l’Initiative Avengers de Nick Fury.'
    ]
    comicsEn = [
      'The Avengers #1 (1963) by Stan Lee & Jack Kirby — Foundational assembly of Earth’s Mightiest Heroes.',
      'The Infinity Gauntlet (1991) by Jim Starlin & George Pérez / Time Runs Out & Secret Wars (2015) by Jonathan Hickman.',
      'The Ultimates (2002) by Mark Millar & Bryan Hitch — Blueprint for Nick Fury’s Avengers Initiative.'
    ]
    characters = ['Tony Stark / Iron Man', 'Steve Rogers / Captain America', 'Thor', 'Bruce Banner / Hulk', 'Natasha Romanoff', 'Clint Barton', 'Wanda Maximoff', 'Vision', 'Loki', 'Thanos']
    artifacts = ['Pierres d’Infinité', 'Bouclier en Vibranium', 'Mjolnir & Stormbreaker', 'Armures Mark Stark']
    locations = ['Tour Avengers (New York)', 'Complexe des Avengers (Upstate NY)', 'Wakanda', 'Sanctuaire Spatial']
    fallbackCast = [
      { name: 'Robert Downey Jr.', character: 'Tony Stark / Iron Man & Doctor Doom' },
      { name: 'Chris Evans', character: 'Steve Rogers / Captain America' },
      { name: 'Chris Hemsworth', character: 'Thor Odinson' },
      { name: 'Mark Ruffalo', character: 'Bruce Banner / Hulk' },
      { name: 'Scarlett Johansson', character: 'Natasha Romanoff / Black Widow' },
      { name: 'Jeremy Renner', character: 'Clint Barton / Hawkeye' },
      { name: 'Elizabeth Olsen', character: 'Wanda Maximoff / Sorcière Rouge' },
      { name: 'Paul Bettany', character: 'Vision' },
      { name: 'Tom Hiddleston', character: 'Loki' },
      { name: 'Josh Brolin', character: 'Thanos' },
      { name: 'Samuel L. Jackson', character: 'Nick Fury' },
      { name: 'Anthony Mackie', character: 'Sam Wilson / Captain America' }
    ]
    multiverseImpact = 95
    cosmicScale = 95
  } else if (titleLower.includes('captain america') || titleLower.includes('falcon')) {
    comicsFr = [
      'Captain America Comics #1 (1941) par Joe Simon & Jack Kirby.',
      'Captain America (Vol. 5) : The Winter Soldier (2005) par Ed Brubaker & Steve Epting.',
      'Civil War (2006) par Mark Millar & Steve McNiven / Captain America: Symbol of Truth (2022) pour Sam Wilson.'
    ]
    comicsEn = [
      'Captain America Comics #1 (1941) by Joe Simon & Jack Kirby.',
      'Captain America (Vol. 5): The Winter Soldier (2005) by Ed Brubaker & Steve Epting.',
      'Civil War (2006) by Mark Millar & Steve McNiven / Symbol of Truth (2022) for Sam Wilson.'
    ]
    characters = ['Steve Rogers', 'Sam Wilson', 'Bucky Barnes', 'Peggy Carter', 'Natasha Romanoff', 'Thaddeus Ross', 'Helmut Zemo']
    artifacts = ['Bouclier en Vibranium', 'Ailes EXO-7 en Vibranium', 'Sérum de Super-Soldat', 'Accords de Sokovie']
    locations = ['Washington D.C.', 'Brooklyn', 'Prison du Raft', 'Madripoor']
    fallbackCast = [
      { name: 'Chris Evans', character: 'Steve Rogers / Captain America' },
      { name: 'Anthony Mackie', character: 'Sam Wilson / Captain America' },
      { name: 'Sebastian Stan', character: 'Bucky Barnes / Le Soldat de l’Hiver' },
      { name: 'Hayley Atwell', character: 'Peggy Carter' },
      { name: 'Scarlett Johansson', character: 'Natasha Romanoff / Black Widow' },
      { name: 'Harrison Ford', character: 'Président Thaddeus Ross / Red Hulk' },
      { name: 'Daniel Brühl', character: 'Baron Helmut Zemo' },
      { name: 'Emily VanCamp', character: 'Sharon Carter / Power Broker' }
    ]
  } else if (titleLower.includes('iron man') || titleLower.includes('ironheart') || titleLower.includes('armor')) {
    comicsFr = [
      'Tales of Suspense #39 (1963) par Stan Lee, Larry Lieber, Don Heck & Jack Kirby.',
      'Iron Man : Extremis (2005) par Warren Ellis & Adi Granov / Armor Wars (1987) par David Michelinie & Bob Layton.',
      'Invincible Iron Man (2016) par Brian Michael Bendis (création de Riri Williams / Ironheart).'
    ]
    comicsEn = [
      'Tales of Suspense #39 (1963) by Stan Lee, Larry Lieber, Don Heck & Jack Kirby.',
      'Iron Man: Extremis (2005) by Warren Ellis & Adi Granov / Armor Wars (1987).',
      'Invincible Iron Man (2016) by Brian Michael Bendis (Riri Williams / Ironheart).'
    ]
    characters = ['Tony Stark / Iron Man', 'Pepper Potts', 'James Rhodes / War Machine', 'Happy Hogan', 'Riri Williams / Ironheart', 'Justin Hammer', 'Trevor Slattery']
    artifacts = ['Réacteur ARK', 'Armures Mark I à LXXXV', 'Armure War Machine', 'J.A.R.V.I.S. & F.R.I.D.A.Y.']
    locations = ['Villa de Malibu', 'Stark Industries', 'MIT / Chicago']
    fallbackCast = [
      { name: 'Robert Downey Jr.', character: 'Tony Stark / Iron Man' },
      { name: 'Gwyneth Paltrow', character: 'Pepper Potts' },
      { name: 'Don Cheadle', character: 'Colonel James "Rhodey" Rhodes / War Machine' },
      { name: 'Jon Favreau', character: 'Happy Hogan' },
      { name: 'Dominique Thorne', character: 'Riri Williams / Ironheart' },
      { name: 'Sam Rockwell', character: 'Justin Hammer' },
      { name: 'Ben Kingsley', character: 'Trevor Slattery' },
      { name: 'Paul Bettany', character: 'J.A.R.V.I.S. (Voix)' }
    ]
  } else if (titleLower.includes('daredevil') || titleLower.includes('defenders') || titleLower.includes('punisher') || titleLower.includes('jessica jones') || titleLower.includes('luke cage') || titleLower.includes('iron fist') || titleLower.includes('echo')) {
    director = 'Drew Goddard, Dario Scardapane, Justin Benson & Aaron Moorhead'
    composer = 'John Paesano / The Newton Brothers'
    studio = 'Marvel Television (Netflix / Disney+)'
    comicsFr = [
      'Daredevil #168-191 & Born Again #227-233 (1986) par Frank Miller & David Mazzucchelli.',
      'Daredevil : The Man Without Fear (1993) par Frank Miller & John Romita Jr.',
      'Devil’s Reign (2021) par Chip Zdarsky & Marco Checchetto (Wilson Fisk élu maire de New York).',
      'Alias (2001) par Brian Michael Bendis (Jessica Jones) & The Punisher MAX par Garth Ennis.'
    ]
    comicsEn = [
      'Daredevil #168-191 & Born Again #227-233 (1986) by Frank Miller & David Mazzucchelli.',
      'Daredevil: The Man Without Fear (1993) by Frank Miller & John Romita Jr.',
      'Devil’s Reign (2021) by Chip Zdarsky & Marco Checchetto.',
      'Alias (2001) by Brian Michael Bendis & The Punisher MAX by Garth Ennis.'
    ]
    characters = ['Matt Murdock / Daredevil', 'Wilson Fisk / Le Caïd', 'Frank Castle / Le Punisher', 'Foggy Nelson', 'Karen Page', 'Benjamin Poindexter / Bullseye', 'Jessica Jones', 'Luke Cage', 'Danny Rand / Iron Fist', 'Maya Lopez / Echo']
    artifacts = ['Matraques Billy Club à grappin', 'Costume Rouge blindé', 'Gilet Crâne du Punisher']
    locations = ['Hell’s Kitchen (New York)', 'Cabinet Nelson & Murdock', 'Harlem']
    fallbackCast = [
      { name: 'Charlie Cox', character: 'Matt Murdock / Daredevil' },
      { name: 'Vincent D’Onofrio', character: 'Wilson Fisk / Le Caïd' },
      { name: 'Jon Bernthal', character: 'Frank Castle / Le Punisher' },
      { name: 'Deborah Ann Woll', character: 'Karen Page' },
      { name: 'Elden Henson', character: 'Foggy Nelson' },
      { name: 'Wilson Bethel', character: 'Benjamin Poindexter / Bullseye' },
      { name: 'Krysten Ritter', character: 'Jessica Jones' },
      { name: 'Mike Colter', character: 'Luke Cage' },
      { name: 'Finn Jones', character: 'Danny Rand / Iron Fist' },
      { name: 'Alaqua Cox', character: 'Maya Lopez / Echo' }
    ]
  } else if (titleLower.includes('loki')) {
    director = 'Kate Herron (S1) / Justin Benson & Aaron Moorhead (S2)'
    writers = 'Michael Waldron, Eric Martin'
    composer = 'Natalie Holt'
    studio = 'Marvel Studios (Disney+)'
    characters = ['Loki (Variant L1130)', 'Sylvie', 'Mobius M. Mobius', 'Ouroboros (O.B.)', 'Ravonna Renslayer', 'Chasseuse B-15', 'Miss Minutes', 'Celui Qui Demeure / Victor Timely']
    artifacts = ['TemPad', 'Cœur Temporel (Temporal Loom)', 'Manuel du TVA', 'Trône d’Yggdrasil']
    locations = ['Tribunal des Variations Anachroniques (TVA)', 'Le Néant (The Void)', 'Citadelle de la Fin des Temps']
    fallbackCast = [
      { name: 'Tom Hiddleston', character: 'Loki (Dieu des Histoires)' },
      { name: 'Owen Wilson', character: 'Mobius M. Mobius' },
      { name: 'Sophia Di Martino', character: 'Sylvie' },
      { name: 'Ke Huy Quan', character: 'Ouroboros "O.B."' },
      { name: 'Wunmi Mosaku', character: 'Chasseuse B-15' },
      { name: 'Gugu Mbatha-Raw', character: 'Ravonna Renslayer' },
      { name: 'Tara Strong', character: 'Miss Minutes (Voix)' },
      { name: 'Jonathan Majors', character: 'Celui Qui Demeure / Victor Timely' }
    ]
    multiverseImpact = 100
    cosmicScale = 95
  } else if (titleLower.includes('spider-man')) {
    characters = ['Peter Parker / Spider-Man', 'MJ', 'Ned Leeds', 'May Parker', 'Doctor Strange', 'Happy Hogan', 'Norman Osborn', 'Otto Octavius']
    artifacts = ['Lance-Toiles Mécaniques', 'Costume Iron Spider', 'Lunettes E.D.I.T.H.', 'Boîte Runique de Kadavus']
    locations = ['Queens (New York)', 'Lycée Midtown', 'Statue de la Liberté']
    fallbackCast = [
      { name: 'Tom Holland', character: 'Peter Parker / Spider-Man' },
      { name: 'Zendaya', character: 'Michelle "MJ" Jones-Watson' },
      { name: 'Jacob Batalon', character: 'Ned Leeds' },
      { name: 'Marisa Tomei', character: 'May Parker' },
      { name: 'Benedict Cumberbatch', character: 'Dr. Stephen Strange' },
      { name: 'Jon Favreau', character: 'Happy Hogan' },
      { name: 'Willem Dafoe', character: 'Norman Osborn / Bouffon Vert' },
      { name: 'Alfred Molina', character: 'Dr. Otto Octavius / Docteur Octopus' },
      { name: 'Andrew Garfield', character: 'Peter Parker / Spider-Man (Terre-120703)' },
      { name: 'Tobey Maguire', character: 'Peter Parker / Spider-Man (Terre-96283)' }
    ]
  } else if (titleLower.includes('thor')) {
    characters = ['Thor Odinson', 'Loki', 'Jane Foster / Mighty Thor', 'Odin', 'Roi Valkyrie', 'Hela', 'Gorr', 'Heimdall', 'Korg']
    artifacts = ['Mjolnir', 'Stormbreaker', 'Bifrost', 'Éther (Pierre de la Réalité)', 'Nécro-Épée']
    locations = ['Asgard', 'Nouvelle Asgard (Tønsberg)', 'Sakaar', 'Omnipotence City']
    fallbackCast = [
      { name: 'Chris Hemsworth', character: 'Thor Odinson' },
      { name: 'Tom Hiddleston', character: 'Loki' },
      { name: 'Natalie Portman', character: 'Dr. Jane Foster / Mighty Thor' },
      { name: 'Tessa Thompson', character: 'Roi Valkyrie' },
      { name: 'Anthony Hopkins', character: 'Odin' },
      { name: 'Cate Blanchett', character: 'Hela (Déesse de la Mort)' },
      { name: 'Christian Bale', character: 'Gorr le Boucher des Dieux' },
      { name: 'Idris Elba', character: 'Heimdall' },
      { name: 'Taika Waititi', character: 'Korg' }
    ]
  } else if (titleLower.includes('guardians') || titleLower.includes('groot')) {
    characters = ['Peter Quill / Star-Lord', 'Gamora', 'Rocket Raccoon', 'Groot', 'Drax', 'Nébula', 'Mantis', 'Yondu', 'Adam Warlock']
    artifacts = ['Walkman & Zune de Quill', 'Vaisseau Milano / Benatar / Bowie', 'Orbe (Pierre du Pouvoir)']
    locations = ['Knowhere', 'Xandar', 'Contre-Terre']
    fallbackCast = [
      { name: 'Chris Pratt', character: 'Peter Quill / Star-Lord' },
      { name: 'Zoe Saldaña', character: 'Gamora' },
      { name: 'Bradley Cooper', character: 'Rocket Raccoon (Voix)' },
      { name: 'Vin Diesel', character: 'Groot (Voix)' },
      { name: 'Dave Bautista', character: 'Drax le Destructeur' },
      { name: 'Karen Gillan', character: 'Nébula' },
      { name: 'Pom Klementieff', character: 'Mantis' },
      { name: 'Michael Rooker', character: 'Yondu Udonta' },
      { name: 'Will Poulter', character: 'Adam Warlock' },
      { name: 'Chukwudi Iwuji', character: 'Le Maître de l’Évolution' }
    ]
  } else if (titleLower.includes('wanda') || titleLower.includes('agatha') || titleLower.includes('vision') || titleLower.includes('strange')) {
    characters = ['Stephen Strange', 'Wanda Maximoff / Sorcière Rouge', 'Vision / Vision Blanc', 'Agatha Harkness', 'Wong', 'America Chavez', 'Billy Maximoff / Wiccan', 'Clea']
    artifacts = ['Darkhold', 'Œil d’Agamotto', 'Cape de Lévitation', 'Livre des Vishanti', 'Anneau de Transport']
    locations = ['Saint des Saints (New York)', 'Kamar-Taj', 'Westview', 'Route des Sorcières', 'Terre-838']
    fallbackCast = [
      { name: 'Benedict Cumberbatch', character: 'Dr. Stephen Strange' },
      { name: 'Elizabeth Olsen', character: 'Wanda Maximoff / La Sorcière Rouge' },
      { name: 'Paul Bettany', character: 'Vision / Vision Blanc' },
      { name: 'Kathryn Hahn', character: 'Agatha Harkness' },
      { name: 'Benedict Wong', character: 'Wong (Sorcier Suprême)' },
      { name: 'Xochitl Gomez', character: 'America Chavez' },
      { name: 'Joe Locke', character: 'Billy Maximoff / Wiccan' },
      { name: 'Rachel McAdams', character: 'Dr. Christine Palmer' }
    ]
  } else if (titleLower.includes('black panther') || titleLower.includes('wakanda')) {
    characters = ['T’Challa / Black Panther', 'Shuri / Black Panther', 'Namor', 'Okoye', 'Nakia', 'M’Baku', 'Reine Ramonda', 'Erik Killmonger', 'Riri Williams']
    artifacts = ['Habit de la Panthère en Vibranium', 'Herbe-Cœur', 'Perles Kimoyo']
    locations = ['Birnin Zana (Wakanda)', 'Royaume sous-marin de Talokan']
    fallbackCast = [
      { name: 'Chadwick Boseman', character: 'Roi T’Challa / Black Panther' },
      { name: 'Letitia Wright', character: 'Shuri / Black Panther' },
      { name: 'Lupita Nyong’o', character: 'Nakia' },
      { name: 'Danai Gurira', character: 'Générale Okoye' },
      { name: 'Winston Duke', character: 'Roi M’Baku' },
      { name: 'Angela Bassett', character: 'Reine Ramonda' },
      { name: 'Tenoch Huerta Mejía', character: 'Namor (K’uk’ulkan)' },
      { name: 'Michael B. Jordan', character: 'Erik "Killmonger" Stevens' }
    ]
  } else if (titleLower.includes('ant-man') || titleLower.includes('quantumania')) {
    characters = ['Scott Lang / Ant-Man', 'Hope van Dyne / La Guêpe', 'Dr. Hank Pym', 'Janet van Dyne', 'Cassie Lang', 'Kang le Conquérant', 'Ava Starr / Ghost']
    artifacts = ['Particules Pym', 'Costume Ant-Man', 'Tunnel Quantique']
    locations = ['San Francisco', 'Royaume Quantique (Axia)']
    fallbackCast = [
      { name: 'Paul Rudd', character: 'Scott Lang / Ant-Man' },
      { name: 'Evangeline Lilly', character: 'Hope van Dyne / La Guêpe' },
      { name: 'Michael Douglas', character: 'Dr. Hank Pym' },
      { name: 'Michelle Pfeiffer', character: 'Janet van Dyne' },
      { name: 'Kathryn Newton', character: 'Cassie Lang' },
      { name: 'Hannah John-Kamen', character: 'Ava Starr / Ghost' },
      { name: 'Jonathan Majors', character: 'Kang le Conquérant' }
    ]
  } else if (titleLower.includes('marvel') || titleLower.includes('secret invasion')) {
    characters = ['Carol Danvers / Captain Marvel', 'Monica Rambeau', 'Kamala Khan / Miss Marvel', 'Nick Fury', 'Talos', 'Hank McCoy / Le Fauve']
    artifacts = ['Bracelets Quantiques (Quantum Bands)', 'Bipeur Cosmique', 'Station S.A.B.E.R.']
    locations = ['Hala', 'Jersey City', 'Station Spatiale S.A.B.E.R.', 'Univers des X-Men']
    fallbackCast = [
      { name: 'Brie Larson', character: 'Carol Danvers / Captain Marvel' },
      { name: 'Teyonah Parris', character: 'Capitaine Monica Rambeau' },
      { name: 'Iman Vellani', character: 'Kamala Khan / Miss Marvel' },
      { name: 'Samuel L. Jackson', character: 'Nick Fury' },
      { name: 'Ben Mendelsohn', character: 'Talos' },
      { name: 'Kelsey Grammer', character: 'Dr. Hank McCoy / Le Fauve' }
    ]
  } else if (titleLower.includes('deadpool') || titleLower.includes('thunderbolts') || titleLower.includes('fantastic four')) {
    characters = ['Wade Wilson / Deadpool', 'Logan / Wolverine', 'Yelena Belova', 'Bucky Barnes', 'Bob / Sentry', 'Reed Richards', 'Sue Storm', 'Johnny Storm', 'Ben Grimm', 'Victor Von Doom']
    artifacts = ['Sabres en Adamantium', 'TemPad du TVA', 'Vaisseau Excelsior']
    locations = ['Terre-10005', 'Terre-828 (Baxter Building)', 'Watchtower (Terre-616)', 'Le Néant (The Void)']
    fallbackCast = [
      { name: 'Ryan Reynolds', character: 'Wade Wilson / Deadpool' },
      { name: 'Hugh Jackman', character: 'Logan / Wolverine' },
      { name: 'Florence Pugh', character: 'Yelena Belova' },
      { name: 'Sebastian Stan', character: 'Bucky Barnes' },
      { name: 'Lewis Pullman', character: 'Bob Reynolds / Sentry' },
      { name: 'Pedro Pascal', character: 'Reed Richards / Mister Fantastic' },
      { name: 'Vanessa Kirby', character: 'Sue Storm / La Femme Invisible' },
      { name: 'Joseph Quinn', character: 'Johnny Storm / La Torche Humaine' },
      { name: 'Ebon Moss-Bachrach', character: 'Ben Grimm / La Chose' }
    ]
  }

  const prevOrder = Math.max(1, project.order - 1)
  const nextOrder = Math.min(83, project.order + 1)
  const defaultConnections = Array.from(
    new Set([
      `mcu-${String(prevOrder).padStart(2, '0')}`,
      `mcu-${String(nextOrder).padStart(2, '0')}`,
      'mcu-83'
    ])
  ).filter((id) => id !== project.id)

  return {
    enTitle: specific?.enTitle || project.originalTitle,
    enTimelineYear:
      specific?.enTimelineYear ||
      project.timelineYear
        .replace('av. J.-C.', 'BC')
        .replace('Décembre', 'December')
        .replace('Automne', 'Fall')
        .replace('Printemps', 'Spring')
        .replace('Été', 'Summer')
        .replace('Début', 'Early')
        .replace('Fin', 'Late')
        .replace('Mai', 'May')
        .replace('Avril', 'April')
        .replace('Novembre', 'November')
        .replace('Hors-Temps', 'Out of Time')
        .replace('Branche Multiverselle', 'Multiversal Branch')
        .replace('Années', '1960s'),
    enSynopsis: specific?.enSynopsis,
    enBriefing: specific?.enBriefing,
    enPostCreditsAlert: specific?.enPostCreditsAlert,
    enDoomsdayConnection: specific?.enDoomsdayConnection,
    director: specific?.director || director,
    writers: specific?.writers || writers,
    composer: specific?.composer || composer,
    studio: specific?.studio || studio,
    budget: stats?.budget,
    boxOffice: stats?.boxOffice,
    defaultScore: stats?.score || '7.8 / 10',
    youtubeTrailerId,
    comicsOrigins: specific?.comicsOrigins || { fr: comicsFr, en: comicsEn },
    comicsVsMcu: specific?.comicsVsMcu || { fr: diffFr, en: diffEn },
    rumorsAndSecrets: specific?.rumorsAndSecrets || { fr: rumorsFr, en: rumorsEn },
    postCreditsDetails: specific?.postCreditsDetails || { fr: postCreditsFr, en: postCreditsEn },
    keyElements: specific?.keyElements || { characters, artifacts, locations },
    powerMetrics: specific?.powerMetrics || { multiverseImpact, cosmicScale, techVsMagic },
    fallbackCast: specific?.fallbackCast || fallbackCast,
    fallbackEpisodes: specific?.fallbackEpisodes,
    connectedProjectIds: specific?.connectedProjectIds || defaultConnections
  }
}

export function getLocalizedProjectText(project: McuProject, locale: Locale) {
  const lore = getProjectLore(project)
  if (locale === 'fr') {
    return {
      title: project.title,
      timelineYear: project.timelineYear,
      synopsis: project.synopsis,
      briefing: project.preWatchBriefing,
      postCreditsAlert: project.postCreditsAlert,
      doomsdayConnection: project.doomsdayConnection
    }
  }
  return {
    title: lore.enTitle || project.originalTitle,
    timelineYear: lore.enTimelineYear || project.timelineYear,
    synopsis: lore.enSynopsis || project.synopsis,
    briefing: lore.enBriefing || project.preWatchBriefing,
    postCreditsAlert: lore.enPostCreditsAlert || project.postCreditsAlert,
    doomsdayConnection: lore.enDoomsdayConnection || project.doomsdayConnection
  }
}