<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Check, Info, Film, Tv, Zap, AlertTriangle, ShieldAlert, BookOpen, Star } from 'lucide-vue-next'
import type { McuProject } from '../types/mcu'
import { useMcuStore } from '../stores/useMcuStore'
import { fetchProjectPoster, generateFallbackPoster } from '../services/posterService'
import { getLocalizedProjectText, getProjectLore } from '../data/mcuWikiLore'

const props = defineProps<{
  project: McuProject
}>()

const store = useMcuStore()
const posterUrl = ref<string>('')
const isLoading = ref(true)
const cardRef = ref<HTMLElement | null>(null)

const localized = computed(() => getLocalizedProjectText(props.project, store.locale))
const lore = computed(() => getProjectLore(props.project))
const userRating = computed(() => store.ratings[props.project.id] || 0)

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      fetchProjectPoster(props.project).then((url) => {
        posterUrl.value = url
        isLoading.value = false
      })
      observer.disconnect()
    }
  }, { rootMargin: '250px' })

  if (cardRef.value) {
    observer.observe(cardRef.value)
  }
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

const getImportanceColor = (imp: string) => {
  switch (imp) {
    case 'critical': return 'text-[#FF9F1C] border-[#FF9F1C]/40 bg-[#FF9F1C]/10'
    case 'essential': return 'text-[#00D67D] border-[#00D67D]/40 bg-[#00D67D]/10'
    case 'recommended': return 'text-blue-400 border-blue-400/40 bg-blue-400/10'
    default: return 'tva-text-muted tva-border tva-bg-inset'
  }
}
</script>

<template>
  <div 
    ref="cardRef"
    class="flex flex-col md:flex-row gap-4 p-4 rounded-lg border transition-all duration-300"
    :class="[
      store.isWatched(project.id)
        ? 'tva-bg-secondary tva-border opacity-70 hover:opacity-100'
        : 'tva-bg-card tva-border hover:border-[#FF9F1C]/60 shadow-lg',
      { 'ring-1 ring-[#FF9F1C]': store.nextMission?.id === project.id }
    ]"
  >
    <!-- Affiche cliquable (ouvre le dossier Wiki) -->
    <div 
      @click="store.openProject(project.id)"
      class="relative w-full md:w-48 h-72 md:h-auto shrink-0 bg-black rounded overflow-hidden cursor-pointer group border tva-border"
    >
      <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center text-gray-500 font-mono-tech text-xs">
        LOADING...
      </div>
      <img
        v-else
        :src="posterUrl"
        :alt="localized.title"
        @error="handleImageError"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      
      <!-- Overlay au survol -->
      <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center">
        <span class="px-3 py-1.5 rounded bg-[#FF9F1C] text-black font-mono-tech text-xs font-bold flex items-center gap-1.5">
          <BookOpen class="w-3.5 h-3.5" /> {{ store.t.openDossier }}
        </span>
      </div>

      <!-- Badge Vu -->
      <div v-if="store.isWatched(project.id)" class="absolute top-2 right-2 bg-[#00D67D] text-black rounded-full p-1.5 shadow-lg">
        <Check class="w-4 h-4 stroke-[3]" />
      </div>

      <!-- Badge Note personnelle -->
      <div v-if="userRating > 0" class="absolute bottom-2 left-2 bg-black/85 border border-[#FF9F1C]/50 text-[#FF9F1C] px-2 py-0.5 rounded font-mono-tech text-xs flex items-center gap-1">
        <Star class="w-3 h-3 fill-[#FF9F1C]" /> {{ userRating }}/10
      </div>
    </div>

    <!-- Contenu de la carte -->
    <div class="flex-1 flex flex-col min-w-0">
      <div class="flex flex-wrap justify-between items-start gap-2 mb-2">
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 text-xs font-mono-tech mb-1 tva-text-muted">
            <span>FILE #{{ String(project.order).padStart(2, '0') }}</span>
            <span>•</span>
            <span class="text-[#FF9F1C] font-semibold">{{ localized.timelineYear }}</span>
            <span>•</span>
            <span>{{ project.releaseYear }}</span>
          </div>
          <h3 
            @click="store.openProject(project.id)"
            class="text-xl font-bold truncate tva-text-main hover:text-[#FF9F1C] cursor-pointer transition-colors"
          >
            {{ localized.title }}
          </h3>
        </div>
        
        <div class="flex items-center gap-2 shrink-0">
          <button 
            @click="store.openProject(project.id)"
            class="px-3 py-2 font-mono-tech text-xs rounded transition-colors border tva-border tva-bg-inset tva-text-main hover:border-[#FF9F1C] hover:text-[#FF9F1C] flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen class="w-3.5 h-3.5 text-[#FF9F1C]" />
            <span class="hidden sm:inline">{{ store.t.openDossier }}</span>
          </button>

          <button 
            @click="store.toggleWatched(project.id)"
            class="px-3.5 py-2 font-mono-tech text-xs rounded transition-colors border font-semibold cursor-pointer"
            :class="store.isWatched(project.id) ? 'border-[#00D67D]/60 text-[#00D67D] bg-[#00D67D]/10 hover:bg-[#00D67D]/20' : 'border-[#FF9F1C] text-[#FF9F1C] hover:bg-[#FF9F1C]/15'"
          >
            {{ store.isWatched(project.id) ? store.t.archived : store.t.markWatched }}
          </button>
        </div>
      </div>

      <!-- Badges techniques -->
      <div class="flex flex-wrap gap-2 text-xs font-mono-tech mb-4">
        <span class="px-2 py-1 rounded border tva-border tva-bg-inset flex items-center gap-1 tva-text-secondary">
          <Film v-if="project.type === 'movie'" class="w-3 h-3 text-[#FF9F1C]" />
          <Tv v-else-if="project.type === 'series'" class="w-3 h-3 text-[#00D67D]" />
          <Zap v-else class="w-3 h-3 text-blue-400" />
          {{ store.t.types[project.type] }}
        </span>
        <span class="px-2 py-1 rounded border tva-border tva-bg-inset tva-text-secondary">
          {{ formatDuration(project.durationMinutes) }}
        </span>
        <span v-if="project.episodes" class="px-2 py-1 rounded border tva-border tva-bg-inset tva-text-secondary">
          {{ project.episodes }} EP
        </span>
        <span class="px-2 py-1 rounded border font-semibold" :class="getImportanceColor(project.importance)">
          {{ store.t.importance[project.importance] }}
        </span>
        <span class="px-2 py-1 rounded border tva-border tva-bg-inset tva-text-muted hidden sm:inline-flex items-center gap-1">
          📚 {{ lore.comicsOrigins[store.locale].length }} Comics • 🕵️ {{ lore.rumorsAndSecrets[store.locale].length }} Secrets
        </span>
      </div>

      <!-- Corps de la carte -->
      <div class="flex-1 text-sm tva-text-secondary space-y-3">
        <template v-if="store.spoilerShield && !store.isWatched(project.id) && project.order > (store.nextMission?.order || 1) + 2">
           <div class="h-full flex flex-col items-center justify-center p-5 border border-dashed tva-border rounded tva-bg-inset tva-text-muted font-mono-tech text-center">
             <ShieldAlert class="w-6 h-6 mb-2 text-[#FF9F1C] opacity-75" />
             {{ store.t.classifiedData }}<br/>{{ store.t.disableShieldToRead }}
           </div>
        </template>
        <template v-else>
          <p class="leading-relaxed">{{ localized.synopsis }}</p>
          
          <div v-if="localized.briefing" class="bg-blue-500/10 border border-blue-500/30 p-3 rounded tva-text-main">
            <strong class="flex items-center gap-1 font-mono-tech text-xs text-blue-500 mb-1">
              <Info class="w-4 h-4"/> {{ store.t.tvaBriefing }}
            </strong>
            {{ localized.briefing }}
          </div>

          <div v-if="project.postCreditsCount > 0" class="flex flex-col gap-1">
             <span class="text-xs font-mono-tech tva-text-muted">
               {{ store.t.postCreditsCount }} {{ project.postCreditsCount }}
             </span>
             <div v-if="localized.postCreditsAlert" class="bg-red-500/10 border border-red-500/30 p-2.5 rounded text-red-500 text-xs flex items-start gap-2 font-medium">
               <AlertTriangle class="w-4 h-4 shrink-0 mt-0.5" />
               <span>{{ localized.postCreditsAlert }}</span>
             </div>
          </div>
          
          <div v-if="localized.doomsdayConnection" class="bg-[#00D67D]/10 border border-[#00D67D]/30 p-2.5 rounded text-[#00D67D] text-xs font-mono-tech mt-2 font-medium">
            > {{ store.t.doomsdayProtocol }} {{ localized.doomsdayConnection }}
          </div>
        </template>
      </div>
    </div>
  </div>
</template>