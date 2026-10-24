<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  ArrowLeft, ChevronLeft, ChevronRight, Check, Star, Film, Tv, Zap,
  Info, AlertTriangle, ShieldAlert, BookOpen, Sparkles, Users, Play,
  Calendar, DollarSign, Award, MapPin, Cpu, FileText, CheckSquare, Square,
  Layers, Clapperboard, Music, Eye, Link2, Gauge, X, Minimize2, Maximize2
} from 'lucide-vue-next'
import type { McuProject, TmdbWikiDetails } from '../types/mcu'
import { useMcuStore } from '../stores/useMcuStore'
import { fetchProjectPoster, fetchProjectWikiDetails, generateFallbackPoster } from '../services/posterService'
import { getLocalizedProjectText, getProjectLore } from '../data/mcuWikiLore'

const props = defineProps<{
  project: McuProject
}>()

const store = useMcuStore()

const posterUrl = ref<string>('')
const wikiDetails = ref<TmdbWikiDetails | null>(null)
const isLoadingWiki = ref<boolean>(true)
const activeTab = ref<'overview' | 'comics' | 'cast' | 'journal'>('overview')
const revealPostCredits = ref<boolean>(false)

// États pour le lecteur vidéo sur le site (ne charge YouTube que si demandé)
const showTrailerPopup = ref<boolean>(false)
const isMiniFloating = ref<boolean>(false)
const playInlineTrailer = ref<boolean>(false)

const localized = computed(() => getLocalizedProjectText(props.project, store.locale))
const lore = computed(() => getProjectLore(props.project))

const activeYoutubeKey = computed(() => {
  return wikiDetails.value?.trailerYoutubeKey || lore.value.youtubeTrailerId
})

const prevProject = computed(() =>
  store.allProjects.find((p) => p.order === props.project.order - 1) || null
)
const nextProject = computed(() =>
  store.allProjects.find((p) => p.order === props.project.order + 1) ||
  store.allProjects.find((p) => p.order === props.project.order + 1) || null
)

const connectedProjects = computed(() =>
  lore.value.connectedProjectIds
    .map((id) => store.allProjects.find((p) => p.id === id))
    .filter((p): p is McuProject => Boolean(p))
)

const ui = computed(() =>
  store.locale === 'fr'
    ? {
        tabOverview: 'DOSSIER & BANDE-ANNONCE',
        tabComics: 'COMICS, DIFFÉRENCES & SECRETS',
        tabCast: 'CASTING & ÉQUIPE',
        tabJournal: props.project.type === 'series' ? 'ÉPISODES & JOURNAL' : 'JOURNAL DE L’AGENT',
        originalTitle: 'Titre original',
        releaseDate: 'Sortie officielle',
        tmdbScore: 'Score Critique / TMDB',
        budget: 'Budget estimé',
        boxOffice: 'Box-Office mondial',
        directors: 'Réalisation / Showrunner',
        writers: 'Scénario',
        composers: 'Compositeur / Musique',
        studio: 'Studio / Diffuseur',
        episodesCount: 'Format Épisodique',
        keyCharacters: 'Protagonistes & Entités',
        keyArtifacts: 'Artefacts & Technologies',
        keyLocations: 'Lieux & Dimensions',
        officialTrailer: 'BANDE-ANNONCE OFFICIELLE (LECTEUR INTÉGRÉ)',
        clickToLoadVideo: 'Cliquer pour lancer la bande-annonce dans le moniteur TVA',
        watchPreviewBtn: 'APERÇU BANDE-ANNONCE (FENÊTRE SITE)',
        miniPlayerToggle: 'Mode Mini-Fenêtre Flottante',
        expandPlayerToggle: 'Agrandir au centre',
        closePlayer: 'Fermer le lecteur',
        comicsTitle: 'ORIGINES & INSPIRATIONS MARVEL COMICS',
        comicsDiffTitle: 'DIFFÉRENCES MAJEURES : COMICS VS MCU',
        rumorsTitle: 'SECRETS DE PRODUCTION, EASTER EGGS & THÉORIES DOOMSDAY',
        postCreditsSection: 'DÉCRYPTAGE DES SCÈNES POST-GÉNÉRIQUE',
        revealSpoilerBtn: 'Révéler le détail des scènes post-générique',
        hideSpoilerBtn: 'Masquer les détails post-générique',
        mainCast: 'DISTRIBUTION PRINCIPALE',
        crewTitle: 'DIRECTION TECHNIQUE & ARTISTIQUE',
        agentRating: 'ÉVALUATION DE L’AGENT TVA (SUR 10)',
        agentNotes: 'RAPPORT PERSONNEL & THÉORIES DE VISIONNAGE',
        notesPlaceholder: 'Inscrivez vos notes, théories sur les Incursions, easter eggs repérés ou critique personnelle...',
        episodesTracker: 'GUIDE & SUIVI DES ÉPISODES DE LA SAISON',
        epWatched: 'Épisodes archivés',
        markAllEp: 'Tout cocher',
        telemetryTitle: 'TÉLÉMÉTRIE & ANALYSE D’IMPACT TVA',
        multiverseImpact: 'Impact Multiversel / Doomsday',
        cosmicScale: 'Échelle Cosmique & Puissance',
        techMagicRatio: 'Profil Technologique / Mystique',
        connectedFiles: 'DOSSIERS DU MCU DIRECTEMENT CONNECTÉS',
        unlockPosition: 'DÉVERROUILLER CE DOSSIER (DÉSACTIVER LE BOUCLIER SPOILER)'
      }
    : {
        tabOverview: 'DOSSIER & TRAILER',
        tabComics: 'COMICS, DIFFERENCES & SECRETS',
        tabCast: 'CAST & CREW',
        tabJournal: props.project.type === 'series' ? 'EPISODES & LOG' : 'AGENT LOGBOOK',
        originalTitle: 'Original Title',
        releaseDate: 'Official Release',
        tmdbScore: 'Critic / TMDB Rating',
        budget: 'Estimated Budget',
        boxOffice: 'Worldwide Box Office',
        directors: 'Director / Showrunner',
        writers: 'Screenplay / Writers',
        composers: 'Original Music Composer',
        studio: 'Studio / Network',
        episodesCount: 'Episodic Format',
        keyCharacters: 'Key Characters & Entities',
        keyArtifacts: 'Artifacts & Tech',
        keyLocations: 'Locations & Realms',
        officialTrailer: 'OFFICIAL TRAILER (EMBEDDED PLAYER)',
        clickToLoadVideo: 'Click to launch trailer inside the TVA monitor',
        watchPreviewBtn: 'PREVIEW TRAILER (ON-SITE WINDOW)',
        miniPlayerToggle: 'Floating Mini-Window Mode',
        expandPlayerToggle: 'Expand to Center',
        closePlayer: 'Close Player',
        comicsTitle: 'MARVEL COMICS ORIGINS & INSPIRATIONS',
        comicsDiffTitle: 'KEY DIFFERENCES: COMICS VS. MCU',
        rumorsTitle: 'PRODUCTION SECRETS, EASTER EGGS & DOOMSDAY THEORIES',
        postCreditsSection: 'POST-CREDITS SCENES BREAKDOWN',
        revealSpoilerBtn: 'Reveal Post-Credits Scene Breakdown',
        hideSpoilerBtn: 'Hide Post-Credits Details',
        mainCast: 'MAIN CAST',
        crewTitle: 'CREATIVE & TECHNICAL LEADERSHIP',
        agentRating: 'TVA AGENT RATING (OUT OF 10)',
        agentNotes: 'PERSONAL FIELD REPORT & THEORIES',
        notesPlaceholder: 'Write your personal notes, Incursion theories, spotted Easter eggs, or review...',
        episodesTracker: 'SEASON EPISODE GUIDE & TRACKER',
        epWatched: 'Archived episodes',
        markAllEp: 'Check all',
        telemetryTitle: 'TVA IMPACT TELEMETRY & ANALYSIS',
        multiverseImpact: 'Multiversal / Doomsday Impact',
        cosmicScale: 'Cosmic Scale & Power',
        techMagicRatio: 'Tech vs. Mystic Profile',
        connectedFiles: 'DIRECTLY CONNECTED MCU FILES',
        unlockPosition: 'UNLOCK THIS FILE (DISABLE SPOILER SHIELD)'
      }
)

const isClassified = computed(() => {
  return (
    store.spoilerShield &&
    !store.isWatched(props.project.id) &&
    props.project.order > (store.nextMission?.order || 1) + 2
  )
})

const userRating = computed(() => store.ratings[props.project.id] || 0)
const userNote = computed({
  get: () => store.notes[props.project.id] || '',
  set: (val: string) => store.setNote(props.project.id, val)
})

const displayCast = computed(() => {
  if (wikiDetails.value?.cast && wikiDetails.value.cast.length > 0) {
    return wikiDetails.value.cast
  }
  return lore.value.fallbackCast.map((c, idx) => ({
    id: idx + 1,
    name: c.name,
    character: c.character,
    profileUrl: null
  }))
})

const episodesToDisplay = computed(() => {
  const tmdbEps = wikiDetails.value?.episodesList || []
  const fallbackEps = lore.value.fallbackEpisodes || []

  if (tmdbEps.length > 0) {
    return tmdbEps.map((ep, idx) => {
      const fb = fallbackEps[idx]
      const isGeneric = /^Épisode\s+\d+$/i.test(ep.name.trim()) || /^Episode\s+\d+$/i.test(ep.name.trim())
      return {
        episodeNumber: ep.episodeNumber,
        name: isGeneric && fb ? (store.locale === 'fr' ? fb.titleFr : fb.titleEn) : ep.name,
        overview: ep.overview || (fb ? (store.locale === 'fr' ? fb.overviewFr : fb.overviewEn) : ''),
        runtime: ep.runtime || fb?.runtime || Math.round(props.project.durationMinutes / (props.project.episodes || 1)),
        airDate: ep.airDate,
        stillUrl: ep.stillUrl
      }
    })
  }

  if (fallbackEps.length > 0) {
    return fallbackEps.map((fb) => ({
      episodeNumber: fb.episodeNumber,
      name: store.locale === 'fr' ? fb.titleFr : fb.titleEn,
      overview: store.locale === 'fr' ? fb.overviewFr : fb.overviewEn,
      runtime: fb.runtime,
      airDate: String(props.project.releaseYear),
      stillUrl: null
    }))
  }

  const count = props.project.episodes || 0
  const avgRuntime = count > 0 ? Math.round(props.project.durationMinutes / count) : 45
  return Array.from({ length: count }, (_, idx) => ({
    episodeNumber: idx + 1,
    name: `${store.locale === 'fr' ? 'Chapitre' : 'Chapter'} #${String(idx + 1).padStart(2, '0')} — ${localized.value.title}`,
    overview:
      store.locale === 'fr'
        ? `Segment narratif #${idx + 1} de ${localized.value.title} (${localized.value.timelineYear}).`
        : `Narrative chapter #${idx + 1} of ${localized.value.title} (${localized.value.timelineYear}).`,
    runtime: avgRuntime,
    airDate: String(props.project.releaseYear),
    stillUrl: null
  }))
})

async function loadData() {
  isLoadingWiki.value = true
  revealPostCredits.value = false
  playInlineTrailer.value = false
  posterUrl.value = await fetchProjectPoster(props.project)
  wikiDetails.value = await fetchProjectWikiDetails(props.project, store.locale)
  isLoadingWiki.value = false
}

onMounted(loadData)

watch(() => [props.project.id, store.locale], () => {
  loadData()
})

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.src = generateFallbackPoster(props.project)
}

const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${m}m`
}

const formatCurrency = (amount: number) => {
  if (!amount || amount <= 0) return store.locale === 'fr' ? 'Sortie en salle à venir' : 'Upcoming Release'
  return new Intl.NumberFormat(store.locale === 'fr' ? 'fr-FR' : 'en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount)
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function checkAllEpisodes() {
  const total = episodesToDisplay.value.length
  episodesToDisplay.value.forEach((ep) => {
    if (!store.isEpisodeWatched(props.project.id, ep.episodeNumber)) {
      store.toggleEpisode(props.project.id, ep.episodeNumber, total)
    }
  })
}
</script>

<template>
  <div class="space-y-6 animate-fadeIn">
    <!-- FENÊTRE VIDÉO INTÉGRÉE AU SITE (MODAL CENTRÉE OU MINI-FENÊTRE FLOTTANTE) -->
    <div
      v-if="showTrailerPopup"
      :class="
        isMiniFloating
          ? 'fixed bottom-5 right-5 z-50 w-80 sm:w-96 rounded-xl overflow-hidden border-2 border-[#FF9F1C] bg-[#06080C] shadow-2xl transition-all duration-300'
          : 'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4'
      "
    >
      <div
        :class="
          isMiniFloating
            ? 'w-full'
            : 'w-full max-w-4xl rounded-xl overflow-hidden border-2 border-[#FF9F1C] bg-[#0A0D14] shadow-2xl'
        "
      >
        <div class="flex items-center justify-between px-3.5 py-2.5 bg-[#0F141C] border-b border-gray-800 font-mono-tech text-xs">
          <div class="flex items-center gap-2 text-[#FF9F1C] font-bold truncate">
            <Play class="w-3.5 h-3.5 fill-[#FF9F1C] shrink-0" />
            <span class="truncate">TVA MONITOR // {{ localized.title }}</span>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <button
              @click="isMiniFloating = !isMiniFloating"
              class="px-2 py-1 rounded border border-gray-700 hover:border-[#FF9F1C] text-gray-300 hover:text-[#FF9F1C] flex items-center gap-1 cursor-pointer"
              :title="isMiniFloating ? ui.expandPlayerToggle : ui.miniPlayerToggle"
            >
              <Maximize2 v-if="isMiniFloating" class="w-3.5 h-3.5" />
              <Minimize2 v-else class="w-3.5 h-3.5" />
              <span class="hidden sm:inline">{{ isMiniFloating ? ui.expandPlayerToggle : ui.miniPlayerToggle }}</span>
            </button>
            <button
              @click="showTrailerPopup = false"
              class="p-1 rounded border border-gray-700 hover:border-red-500 text-gray-300 hover:text-red-400 cursor-pointer"
              :title="ui.closePlayer"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="aspect-video w-full bg-black">
          <iframe
            :src="`https://www.youtube-nocookie.com/embed/${activeYoutubeKey}?autoplay=1&rel=0`"
            class="w-full h-full"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      </div>
    </div>

    <!-- Barre de navigation supérieure -->
    <div class="flex flex-wrap items-center justify-between gap-3 tva-bg-secondary p-3.5 rounded-lg border tva-border">
      <button
        @click="store.closeProject()"
        class="px-3.5 py-2 rounded border tva-border tva-bg-card hover:border-[#FF9F1C] tva-text-main font-mono-tech text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
      >
        <ArrowLeft class="w-4 h-4 text-[#FF9F1C]" />
        {{ store.t.backToTimeline }}
      </button>

      <div class="flex items-center gap-2 font-mono-tech text-xs">
        <button
          v-if="prevProject"
          @click="store.openProject(prevProject.id)"
          class="px-3 py-2 rounded border tva-border tva-bg-card hover:border-[#FF9F1C] tva-text-secondary hover:tva-text-main flex items-center gap-1 cursor-pointer transition-colors"
          :title="prevProject.title"
        >
          <ChevronLeft class="w-4 h-4 text-[#FF9F1C]" />
          <span class="hidden sm:inline">{{ store.t.prevProject }}</span>
          <span>(#{{ String(prevProject.order).padStart(2, '0') }})</span>
        </button>

        <button
          v-if="nextProject"
          @click="store.openProject(nextProject.id)"
          class="px-3 py-2 rounded border tva-border tva-bg-card hover:border-[#FF9F1C] tva-text-secondary hover:tva-text-main flex items-center gap-1 cursor-pointer transition-colors"
          :title="nextProject.title"
        >
          <span>(#{{ String(nextProject.order).padStart(2, '0') }})</span>
          <span class="hidden sm:inline">{{ store.t.nextProject }}</span>
          <ChevronRight class="w-4 h-4 text-[#FF9F1C]" />
        </button>
      </div>
    </div>

    <!-- Bannière Hero du Dossier Wiki -->
    <div class="relative rounded-xl overflow-hidden border tva-border tva-bg-card shadow-xl">
      <div v-if="wikiDetails?.backdropUrl" class="absolute inset-0 h-80 sm:h-96 w-full">
        <img :src="wikiDetails.backdropUrl" :alt="localized.title" class="w-full h-full object-cover opacity-25" />
        <div class="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-[var(--bg-card)]/85 to-transparent"></div>
      </div>

      <div class="relative z-10 p-5 sm:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
        <div
          @click="showTrailerPopup = true; isMiniFloating = false"
          class="relative w-48 sm:w-56 shrink-0 rounded-lg overflow-hidden border-2 border-[#FF9F1C]/40 shadow-2xl bg-black cursor-pointer group"
        >
          <img
            :src="wikiDetails?.posterUrl || posterUrl"
            :alt="localized.title"
            @error="handleImageError"
            class="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div class="w-12 h-12 rounded-full bg-[#FF9F1C] text-black flex items-center justify-center shadow-lg">
              <Play class="w-6 h-6 fill-black ml-0.5" />
            </div>
          </div>
        </div>

        <div class="flex-1 min-w-0 text-center md:text-left space-y-4 w-full">
          <div class="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs font-mono-tech">
            <span class="px-2.5 py-1 rounded bg-[#FF9F1C]/15 border border-[#FF9F1C]/40 text-[#FF9F1C] font-bold">
              FILE #{{ String(project.order).padStart(2, '0') }} // ERA-0{{ project.era }}
            </span>
            <span class="px-2.5 py-1 rounded tva-bg-inset border tva-border tva-text-secondary font-semibold">
              {{ localized.timelineYear }}
            </span>
            <span class="px-2.5 py-1 rounded tva-bg-inset border tva-border tva-text-secondary flex items-center gap-1">
              <Film v-if="project.type === 'movie'" class="w-3.5 h-3.5 text-[#FF9F1C]" />
              <Tv v-else-if="project.type === 'series'" class="w-3.5 h-3.5 text-[#00D67D]" />
              <Zap v-else class="w-3.5 h-3.5 text-blue-400" />
              {{ store.t.types[project.type] }} • {{ formatDuration(project.durationMinutes) }}
            </span>
            <span class="px-2.5 py-1 rounded border border-[#00D67D]/40 bg-[#00D67D]/10 text-[#00D67D] font-bold">
              {{ store.t.importance[project.importance] }}
            </span>
          </div>

          <div>
            <h1 class="text-2xl sm:text-4xl font-bold tva-text-main tracking-tight">
              {{ localized.title }}
            </h1>
            <p v-if="project.originalTitle !== localized.title" class="text-sm font-mono-tech tva-text-muted mt-1">
              {{ ui.originalTitle }} : {{ project.originalTitle }}
            </p>
            <p v-if="wikiDetails?.tagline" class="italic text-[#FF9F1C] text-sm sm:text-base mt-2">
              « {{ wikiDetails.tagline }} »
            </p>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2 text-left font-mono-tech text-xs">
            <div class="p-3 rounded border tva-border tva-bg-inset">
              <div class="tva-text-muted flex items-center gap-1"><Calendar class="w-3.5 h-3.5 text-[#FF9F1C]" /> {{ ui.releaseDate }}</div>
              <div class="tva-text-main font-bold text-sm mt-1">{{ wikiDetails?.releaseDate || project.releaseYear }}</div>
            </div>

            <div class="p-3 rounded border tva-border tva-bg-inset">
              <div class="tva-text-muted flex items-center gap-1"><Award class="w-3.5 h-3.5 text-[#00D67D]" /> {{ ui.tmdbScore }}</div>
              <div class="tva-text-main font-bold text-sm mt-1">
                {{ wikiDetails?.voteAverage ? `${wikiDetails.voteAverage} / 10` : lore.defaultScore }}
              </div>
            </div>

            <div class="p-3 rounded border tva-border tva-bg-inset">
              <div class="tva-text-muted flex items-center gap-1"><Clapperboard class="w-3.5 h-3.5 text-blue-400" /> {{ ui.directors }}</div>
              <div class="tva-text-main font-bold text-sm mt-1 truncate" :title="wikiDetails?.directors?.join(', ') || lore.director">
                {{ wikiDetails?.directors?.length ? wikiDetails.directors.join(', ') : lore.director }}
              </div>
            </div>

            <div v-if="project.type === 'movie'" class="p-3 rounded border tva-border tva-bg-inset">
              <div class="tva-text-muted flex items-center gap-1"><DollarSign class="w-3.5 h-3.5 text-[#00D67D]" /> {{ ui.boxOffice }}</div>
              <div class="tva-text-main font-bold text-sm mt-1">
                {{ formatCurrency(wikiDetails?.revenue || lore.boxOffice || 0) }}
              </div>
            </div>
            <div v-else class="p-3 rounded border tva-border tva-bg-inset">
              <div class="tva-text-muted flex items-center gap-1"><Layers class="w-3.5 h-3.5 text-[#00D67D]" /> {{ ui.episodesCount }}</div>
              <div class="tva-text-main font-bold text-sm mt-1">
                {{ project.episodes || episodesToDisplay.length || 1 }} EP • {{ wikiDetails?.networks?.[0] || lore.studio.split('/')[0] }}
              </div>
            </div>
          </div>

          <div class="pt-2 flex flex-wrap justify-center md:justify-start items-center gap-3">
            <button
              @click="store.toggleWatched(project.id)"
              class="px-5 py-2.5 rounded font-mono-tech text-xs font-bold border transition-colors flex items-center gap-2 cursor-pointer"
              :class="store.isWatched(project.id)
                ? 'border-[#00D67D] bg-[#00D67D]/15 text-[#00D67D]'
                : 'border-[#FF9F1C] bg-[#FF9F1C] text-black hover:bg-[#FF9F1C]/90'"
            >
              <Check class="w-4 h-4" />
              {{ store.isWatched(project.id) ? store.t.archived : store.t.markWatched }}
            </button>

            <button
              @click="showTrailerPopup = true; isMiniFloating = false"
              class="px-4 py-2.5 rounded font-mono-tech text-xs font-bold border border-[#FF9F1C] tva-bg-inset hover:bg-[#FF9F1C]/15 text-[#FF9F1C] flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Play class="w-3.5 h-3.5 fill-[#FF9F1C]" />
              {{ ui.watchPreviewBtn }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="isClassified"
      class="p-10 rounded-xl border-2 border-dashed border-[#FF9F1C]/50 tva-bg-card text-center space-y-4 font-mono-tech"
    >
      <ShieldAlert class="w-12 h-12 text-[#FF9F1C] mx-auto" />
      <div class="text-lg font-bold tva-text-main">{{ store.t.classifiedData }}</div>
      <p class="text-sm tva-text-muted max-w-md mx-auto">{{ store.t.disableShieldToRead }}</p>
      <button
        @click="store.toggleSpoilerShield()"
        class="px-4 py-2.5 rounded border border-[#FF9F1C] text-[#FF9F1C] hover:bg-[#FF9F1C]/15 text-xs font-bold cursor-pointer"
      >
        {{ ui.unlockPosition }}
      </button>
    </div>

    <template v-else>
      <div class="flex flex-wrap gap-2 border-b tva-border pb-3 font-mono-tech text-xs">
        <button
          @click="activeTab = 'overview'"
          class="px-4 py-2.5 rounded-lg border font-bold flex items-center gap-2 cursor-pointer transition-colors"
          :class="activeTab === 'overview' ? 'border-[#FF9F1C] bg-[#FF9F1C]/15 text-[#FF9F1C]' : 'tva-border tva-bg-card tva-text-secondary hover:tva-text-main'"
        >
          <BookOpen class="w-4 h-4" /> {{ ui.tabOverview }}
        </button>

        <button
          @click="activeTab = 'comics'"
          class="px-4 py-2.5 rounded-lg border font-bold flex items-center gap-2 cursor-pointer transition-colors"
          :class="activeTab === 'comics' ? 'border-[#FF9F1C] bg-[#FF9F1C]/15 text-[#FF9F1C]' : 'tva-border tva-bg-card tva-text-secondary hover:tva-text-main'"
        >
          <Sparkles class="w-4 h-4" /> {{ ui.tabComics }}
        </button>

        <button
          @click="activeTab = 'cast'"
          class="px-4 py-2.5 rounded-lg border font-bold flex items-center gap-2 cursor-pointer transition-colors"
          :class="activeTab === 'cast' ? 'border-[#FF9F1C] bg-[#FF9F1C]/15 text-[#FF9F1C]' : 'tva-border tva-bg-card tva-text-secondary hover:tva-text-main'"
        >
          <Users class="w-4 h-4" /> {{ ui.tabCast }} ({{ displayCast.length }})
        </button>

        <button
          @click="activeTab = 'journal'"
          class="px-4 py-2.5 rounded-lg border font-bold flex items-center gap-2 cursor-pointer transition-colors"
          :class="activeTab === 'journal' ? 'border-[#00D67D] bg-[#00D67D]/15 text-[#00D67D]' : 'tva-border tva-bg-card tva-text-secondary hover:tva-text-main'"
        >
          <FileText class="w-4 h-4" /> {{ ui.tabJournal }}
        </button>
      </div>

      <!-- ONGLET 1 -->
      <div v-if="activeTab === 'overview'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="p-6 rounded-xl border tva-border tva-bg-card space-y-4">
            <h2 class="text-lg font-bold font-mono-tech text-[#FF9F1C] flex items-center gap-2">
              <BookOpen class="w-5 h-5" /> SYNOPSIS & ARCHIVES TVA
            </h2>
            <p class="tva-text-main leading-relaxed text-base">
              {{ localized.synopsis }}
            </p>
            <p
              v-if="wikiDetails?.overview && wikiDetails.overview !== localized.synopsis"
              class="tva-text-secondary leading-relaxed text-sm border-t tva-border pt-4"
            >
              {{ wikiDetails.overview }}
            </p>

            <div v-if="localized.briefing" class="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg tva-text-main text-sm">
              <strong class="flex items-center gap-1.5 font-mono-tech text-xs text-blue-500 mb-1.5">
                <Info class="w-4 h-4" /> {{ store.t.tvaBriefing }}
              </strong>
              {{ localized.briefing }}
            </div>

            <div v-if="localized.doomsdayConnection" class="bg-[#00D67D]/10 border border-[#00D67D]/30 p-4 rounded-lg text-[#00D67D] text-sm font-mono-tech">
              <strong>> {{ store.t.doomsdayProtocol }}</strong> {{ localized.doomsdayConnection }}
            </div>

            <div class="p-4 rounded-lg border tva-border tva-bg-inset space-y-3">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <span class="text-xs font-mono-tech font-bold text-[#FF9F1C]">
                  🎬 {{ ui.postCreditsSection }} ({{ project.postCreditsCount }})
                </span>
                <button
                  @click="revealPostCredits = !revealPostCredits"
                  class="px-2.5 py-1 rounded border tva-border tva-bg-card text-xs font-mono-tech tva-text-main hover:border-[#FF9F1C] flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye class="w-3.5 h-3.5 text-[#FF9F1C]" />
                  {{ revealPostCredits ? ui.hideSpoilerBtn : ui.revealSpoilerBtn }}
                </button>
              </div>

              <div v-if="localized.postCreditsAlert" class="text-xs text-red-500 flex items-start gap-2 font-medium">
                <AlertTriangle class="w-4 h-4 shrink-0 mt-0.5" />
                <span>{{ localized.postCreditsAlert }}</span>
              </div>

              <div v-if="revealPostCredits" class="space-y-2 pt-2 border-t tva-border text-xs tva-text-secondary">
                <p v-for="(detail, i) in lore.postCreditsDetails[store.locale]" :key="i" class="leading-relaxed">
                  • {{ detail }}
                </p>
              </div>
            </div>
          </div>

          <!-- FAÇADE VIDÉO SANS PISTAGE : Ne charge l'iframe YouTube que lorsqu'on clique dessus -->
          <div class="p-6 rounded-xl border tva-border tva-bg-card space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <h2 class="text-base sm:text-lg font-bold font-mono-tech text-[#FF9F1C] flex items-center gap-2">
                <Play class="w-5 h-5" /> {{ ui.officialTrailer }}
              </h2>
              <button
                @click="showTrailerPopup = true; isMiniFloating = true"
                class="px-3 py-1.5 rounded border border-[#FF9F1C]/50 bg-[#FF9F1C]/10 text-[#FF9F1C] font-mono-tech text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-[#FF9F1C]/20"
              >
                <Minimize2 class="w-3.5 h-3.5" /> {{ ui.miniPlayerToggle }}
              </button>
            </div>

            <div class="aspect-video w-full rounded-lg overflow-hidden border tva-border bg-black shadow-lg relative">
              <iframe
                v-if="playInlineTrailer"
                :src="`https://www.youtube-nocookie.com/embed/${activeYoutubeKey}?autoplay=1&rel=0`"
                class="w-full h-full"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
              <div
                v-else
                @click="playInlineTrailer = true"
                class="w-full h-full relative cursor-pointer group flex items-center justify-center"
              >
                <img
                  :src="`https://i.ytimg.com/vi/${activeYoutubeKey}/hqdefault.jpg`"
                  :alt="localized.title"
                  class="w-full h-full object-cover opacity-70 group-hover:scale-105 group-hover:opacity-90 transition-all duration-500"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                <div class="relative z-10 flex flex-col items-center gap-3 p-4 text-center">
                  <div class="w-16 h-16 rounded-full bg-[#FF9F1C] text-black flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play class="w-8 h-8 fill-black ml-1" />
                  </div>
                  <span class="px-3 py-1.5 rounded bg-black/80 border border-[#FF9F1C]/50 text-[#FF9F1C] font-mono-tech text-xs font-bold">
                    {{ ui.clickToLoadVideo }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Colonne latérale -->
        <div class="space-y-6">
          <div class="p-5 rounded-xl border tva-border tva-bg-card space-y-4 font-mono-tech">
            <h3 class="text-xs font-bold text-[#FF9F1C] flex items-center gap-2">
              <Gauge class="w-4 h-4" /> {{ ui.telemetryTitle }}
            </h3>

            <div class="space-y-1.5">
              <div class="flex justify-between text-xs">
                <span class="tva-text-muted">{{ ui.multiverseImpact }}</span>
                <span class="text-[#00D67D] font-bold">{{ lore.powerMetrics.multiverseImpact }}%</span>
              </div>
              <div class="h-2 rounded-full tva-bg-inset overflow-hidden border tva-border">
                <div class="h-full bg-[#00D67D]" :style="{ width: `${lore.powerMetrics.multiverseImpact}%` }"></div>
              </div>
            </div>

            <div class="space-y-1.5">
              <div class="flex justify-between text-xs">
                <span class="tva-text-muted">{{ ui.cosmicScale }}</span>
                <span class="text-[#FF9F1C] font-bold">{{ lore.powerMetrics.cosmicScale }}%</span>
              </div>
              <div class="h-2 rounded-full tva-bg-inset overflow-hidden border tva-border">
                <div class="h-full bg-[#FF9F1C]" :style="{ width: `${lore.powerMetrics.cosmicScale}%` }"></div>
              </div>
            </div>

            <div class="pt-1 text-xs">
              <span class="tva-text-muted block mb-1">{{ ui.techMagicRatio }}</span>
              <span class="px-2.5 py-1 rounded tva-bg-inset border tva-border tva-text-main inline-block font-semibold">
                {{ lore.powerMetrics.techVsMagic }}
              </span>
            </div>
          </div>

          <div class="p-5 rounded-xl border tva-border tva-bg-card space-y-4">
            <h3 class="text-xs font-bold font-mono-tech text-[#FF9F1C] flex items-center gap-2">
              <Users class="w-4 h-4" /> {{ ui.keyCharacters }}
            </h3>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="char in lore.keyElements.characters"
                :key="char"
                class="px-2.5 py-1 rounded text-xs font-mono-tech tva-bg-inset border tva-border tva-text-main"
              >
                {{ char }}
              </span>
            </div>

            <h3 class="text-xs font-bold font-mono-tech text-[#00D67D] flex items-center gap-2 pt-2">
              <Cpu class="w-4 h-4" /> {{ ui.keyArtifacts }}
            </h3>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="art in lore.keyElements.artifacts"
                :key="art"
                class="px-2.5 py-1 rounded text-xs font-mono-tech bg-[#00D67D]/10 border border-[#00D67D]/30 text-[#00D67D]"
              >
                {{ art }}
              </span>
            </div>

            <h3 class="text-xs font-bold font-mono-tech text-blue-400 flex items-center gap-2 pt-2">
              <MapPin class="w-4 h-4" /> {{ ui.keyLocations }}
            </h3>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="loc in lore.keyElements.locations"
                :key="loc"
                class="px-2.5 py-1 rounded text-xs font-mono-tech bg-blue-500/10 border border-blue-500/30 text-blue-400"
              >
                {{ loc }}
              </span>
            </div>
          </div>

          <div class="p-5 rounded-xl border tva-border tva-bg-card space-y-3">
            <h3 class="text-xs font-bold font-mono-tech text-[#FF9F1C] flex items-center gap-2">
              <Link2 class="w-4 h-4" /> {{ ui.connectedFiles }}
            </h3>
            <div class="space-y-2">
              <div
                v-for="conn in connectedProjects"
                :key="conn.id"
                @click="store.openProject(conn.id)"
                class="p-2.5 rounded-lg border tva-border tva-bg-inset hover:border-[#FF9F1C] flex items-center justify-between gap-2 cursor-pointer transition-colors"
              >
                <div class="min-w-0">
                  <div class="text-xs font-mono-tech text-[#FF9F1C]">FILE #{{ String(conn.order).padStart(2, '0') }}</div>
                  <div class="text-xs font-bold tva-text-main truncate">{{ conn.title }}</div>
                </div>
                <ChevronRight class="w-4 h-4 tva-text-muted shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ONGLET 2 -->
      <div v-else-if="activeTab === 'comics'" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="p-6 rounded-xl border tva-border tva-bg-card space-y-4">
            <h2 class="text-base font-bold font-mono-tech text-[#FF9F1C] flex items-center gap-2">
              📚 {{ ui.comicsTitle }}
            </h2>
            <ul class="space-y-3">
              <li
                v-for="(comic, idx) in lore.comicsOrigins[store.locale]"
                :key="idx"
                class="p-3.5 rounded-lg border tva-border tva-bg-inset tva-text-main text-sm leading-relaxed flex items-start gap-3"
              >
                <span class="font-mono-tech text-xs text-[#FF9F1C] font-bold mt-0.5">#0{{ idx + 1 }}</span>
                <span>{{ comic }}</span>
              </li>
            </ul>
          </div>

          <div class="p-6 rounded-xl border tva-border tva-bg-card space-y-4">
            <h2 class="text-base font-bold font-mono-tech text-[#00D67D] flex items-center gap-2">
              🕵️ {{ ui.rumorsTitle }}
            </h2>
            <ul class="space-y-3">
              <li
                v-for="(rumor, idx) in lore.rumorsAndSecrets[store.locale]"
                :key="idx"
                class="p-3.5 rounded-lg border border-[#00D67D]/30 bg-[#00D67D]/5 tva-text-main text-sm leading-relaxed flex items-start gap-3"
              >
                <span class="font-mono-tech text-xs text-[#00D67D] font-bold mt-0.5">INTEL</span>
                <span>{{ rumor }}</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="p-6 rounded-xl border tva-border tva-bg-card space-y-4">
          <h2 class="text-base font-bold font-mono-tech text-blue-400 flex items-center gap-2">
            ⚖️ {{ ui.comicsDiffTitle }}
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="(diff, idx) in lore.comicsVsMcu[store.locale]"
              :key="idx"
              class="p-4 rounded-lg border border-blue-500/30 bg-blue-500/5 tva-text-main text-sm leading-relaxed"
            >
              <span class="font-mono-tech text-xs text-blue-400 font-bold block mb-1">DIVERGENCE #0{{ idx + 1 }}</span>
              {{ diff }}
            </div>
          </div>
        </div>
      </div>

      <!-- ONGLET 3 -->
      <div v-else-if="activeTab === 'cast'" class="space-y-6">
        <div class="p-6 rounded-xl border tva-border tva-bg-card space-y-4">
          <h2 class="text-base font-bold font-mono-tech text-[#00D67D] flex items-center gap-2">
            <Clapperboard class="w-5 h-5" /> {{ ui.crewTitle }}
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono-tech text-xs">
            <div class="p-3.5 rounded-lg border tva-border tva-bg-inset">
              <span class="tva-text-muted block mb-1">{{ ui.directors }}</span>
              <span class="tva-text-main font-bold text-sm">
                {{ wikiDetails?.directors?.length ? wikiDetails.directors.join(', ') : lore.director }}
              </span>
            </div>
            <div class="p-3.5 rounded-lg border tva-border tva-bg-inset">
              <span class="tva-text-muted block mb-1">{{ ui.writers }}</span>
              <span class="tva-text-main font-bold text-sm">
                {{ wikiDetails?.writers?.length ? wikiDetails.writers.join(', ') : lore.writers }}
              </span>
            </div>
            <div class="p-3.5 rounded-lg border tva-border tva-bg-inset">
              <span class="tva-text-muted block mb-1 flex items-center gap-1"><Music class="w-3.5 h-3.5 text-[#FF9F1C]" /> {{ ui.composers }}</span>
              <span class="tva-text-main font-bold text-sm">
                {{ wikiDetails?.composers?.length ? wikiDetails.composers.join(', ') : lore.composer }}
              </span>
            </div>
            <div class="p-3.5 rounded-lg border tva-border tva-bg-inset">
              <span class="tva-text-muted block mb-1">{{ ui.studio }}</span>
              <span class="tva-text-main font-bold text-sm">
                {{ wikiDetails?.networks?.length ? wikiDetails.networks.join(', ') : lore.studio }}
              </span>
            </div>
          </div>
        </div>

        <div class="p-6 rounded-xl border tva-border tva-bg-card space-y-4">
          <h2 class="text-base font-bold font-mono-tech text-[#FF9F1C] flex items-center gap-2">
            <Users class="w-5 h-5" /> {{ ui.mainCast }} ({{ displayCast.length }})
          </h2>

          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div
              v-for="actor in displayCast"
              :key="actor.id + actor.name"
              class="rounded-lg border tva-border tva-bg-inset overflow-hidden flex flex-col hover:border-[#FF9F1C]/50 transition-colors"
            >
              <div class="aspect-[2/3] bg-[#0B0F17] overflow-hidden relative flex items-center justify-center">
                <img
                  v-if="actor.profileUrl"
                  :src="actor.profileUrl"
                  :alt="actor.name"
                  class="w-full h-full object-cover"
                  loading="lazy"
                />
                <div v-else class="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-b from-[#0F141C] to-[#06080C]">
                  <div class="w-14 h-14 rounded-full border-2 border-[#FF9F1C]/50 bg-[#FF9F1C]/10 flex items-center justify-center font-mono-tech text-lg font-bold text-[#FF9F1C] mb-2">
                    {{ getInitials(actor.name) }}
                  </div>
                  <span class="font-mono-tech text-[10px] text-gray-400">TVA DOSSIER</span>
                </div>
              </div>
              <div class="p-2.5 flex-1 flex flex-col justify-between">
                <div class="font-bold text-xs tva-text-main truncate" :title="actor.name">{{ actor.name }}</div>
                <div class="text-xs font-mono-tech text-[#FF9F1C] truncate mt-0.5" :title="actor.character">
                  {{ actor.character }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ONGLET 4 -->
      <div v-else-if="activeTab === 'journal'" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="p-6 rounded-xl border tva-border tva-bg-card space-y-4">
            <h3 class="text-sm font-bold font-mono-tech text-[#FF9F1C]">{{ ui.agentRating }}</h3>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="n in 10"
                :key="n"
                @click="store.setRating(project.id, n)"
                class="w-9 h-9 rounded font-mono-tech text-xs font-bold border transition-all cursor-pointer flex items-center justify-center"
                :class="userRating >= n
                  ? 'border-[#FF9F1C] bg-[#FF9F1C] text-black'
                  : 'tva-border tva-bg-inset tva-text-muted hover:border-[#FF9F1C]'"
              >
                {{ n }}
              </button>
            </div>
            <div v-if="userRating > 0" class="text-xs font-mono-tech text-[#00D67D] flex items-center gap-1">
              <Star class="w-4 h-4 fill-[#00D67D]" /> Note enregistrée : {{ userRating }} / 10
            </div>
          </div>

          <div class="p-6 rounded-xl border tva-border tva-bg-card space-y-3">
            <h3 class="text-sm font-bold font-mono-tech text-[#00D67D]">{{ ui.agentNotes }}</h3>
            <textarea
              v-model="userNote"
              rows="4"
              :placeholder="ui.notesPlaceholder"
              class="w-full p-3 rounded-lg border tva-border tva-bg-inset tva-text-main font-mono-tech text-xs focus:outline-none focus:border-[#00D67D]"
            ></textarea>
          </div>
        </div>

        <div v-if="project.type === 'series' && episodesToDisplay.length > 0" class="p-6 rounded-xl border tva-border tva-bg-card space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h3 class="text-base font-bold font-mono-tech text-[#FF9F1C]">
              {{ ui.episodesTracker }} ({{ (store.watchedEpisodes[project.id] || []).length }} / {{ episodesToDisplay.length }} {{ ui.epWatched }})
            </h3>
            <button
              @click="checkAllEpisodes()"
              class="px-3 py-1.5 rounded border border-[#00D67D] text-[#00D67D] hover:bg-[#00D67D]/15 font-mono-tech text-xs font-bold cursor-pointer"
            >
              {{ ui.markAllEp }}
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="ep in episodesToDisplay"
              :key="ep.episodeNumber"
              @click="store.toggleEpisode(project.id, ep.episodeNumber, episodesToDisplay.length)"
              class="p-4 rounded-lg border flex items-start gap-3.5 cursor-pointer transition-colors"
              :class="store.isEpisodeWatched(project.id, ep.episodeNumber)
                ? 'border-[#00D67D]/50 bg-[#00D67D]/10'
                : 'tva-border tva-bg-inset hover:border-[#FF9F1C]/50'"
            >
              <CheckSquare v-if="store.isEpisodeWatched(project.id, ep.episodeNumber)" class="w-5 h-5 text-[#00D67D] shrink-0 mt-0.5" />
              <Square v-else class="w-5 h-5 tva-text-muted shrink-0 mt-0.5" />

              <div class="min-w-0 flex-1 space-y-1">
                <div class="flex items-center justify-between gap-2 font-mono-tech text-xs">
                  <span class="font-bold tva-text-main">
                    EP {{ String(ep.episodeNumber).padStart(2, '0') }} — {{ ep.name }}
                  </span>
                  <span v-if="ep.runtime" class="text-[#FF9F1C] shrink-0">{{ ep.runtime }}m</span>
                </div>
                <p v-if="ep.overview" class="text-xs tva-text-secondary leading-relaxed">
                  {{ ep.overview }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>