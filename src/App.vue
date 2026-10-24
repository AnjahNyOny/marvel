<script setup lang="ts">
import { watchEffect } from 'vue'
import { Search } from 'lucide-vue-next'
import { useMcuStore } from './stores/useMcuStore'
import TvaHeader from './components/TvaHeader.vue'
import TvaAuthModal from './components/TvaAuthModal.vue'
import McuCard from './components/McuCard.vue'
import McuWikiPage from './components/McuWikiPage.vue'

const store = useMcuStore()

watchEffect(() => {
  if (typeof document !== 'undefined') {
    document.body.style.backgroundColor = store.theme === 'light' ? '#F4EFE6' : '#06080C'
    document.body.style.color = store.theme === 'light' ? '#1C1917' : '#F3F4F6'
  }
})
</script>

<template>
  <div 
    :class="store.theme === 'light' ? 'theme-light' : 'theme-dark'"
    class="min-h-screen tva-bg-primary tva-text-main font-sans selection:bg-[#FF9F1C] selection:text-black transition-colors duration-300"
  >
    <TvaHeader />
    <TvaAuthModal/>

    <main class="max-w-7xl mx-auto px-3 sm:px-6 pb-20">
      <!-- VUE 1 : PAGE WIKI DÉDIÉE SI UN FILM EST SÉLECTIONNÉ -->
      <McuWikiPage
        v-if="store.selectedProject"
        :project="store.selectedProject"
      />

      <!-- VUE 2 : CHRONOLOGIE COMPLÈTE AVEC FILTRES BILINGUES -->
      <template v-else>
        <!-- Barre de Recherche et Filtres (100% Bilingue FR/EN & Responsive) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8 tva-bg-secondary p-3.5 sm:p-4 rounded-lg border tva-border shadow-md sticky top-3 z-20">
          
          <div class="sm:col-span-2 lg:col-span-1 relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 tva-text-muted" />
            <input 
              v-model="store.searchQuery"
              type="text" 
              :placeholder="store.t.searchPlaceholder" 
              class="w-full tva-bg-inset border tva-border rounded py-2 pl-9 pr-3 tva-text-main font-mono-tech text-xs sm:text-sm focus:outline-none focus:border-[#FF9F1C] transition-colors"
            />
          </div>
          
          <select v-model="store.selectedEra" class="tva-bg-inset border tva-border rounded py-2 px-3 tva-text-main font-mono-tech text-xs sm:text-sm focus:outline-none focus:border-[#FF9F1C] cursor-pointer">
            <option value="ALL">{{ store.t.allEras }}</option>
            <option :value="1">{{ store.t.era1 }}</option>
            <option :value="2">{{ store.t.era2 }}</option>
            <option :value="3">{{ store.t.era3 }}</option>
            <option :value="4">{{ store.t.era4 }}</option>
            <option :value="5">{{ store.t.era5 }}</option>
          </select>

          <select v-model="store.selectedType" class="tva-bg-inset border tva-border rounded py-2 px-3 tva-text-main font-mono-tech text-xs sm:text-sm focus:outline-none focus:border-[#FF9F1C] cursor-pointer">
            <option value="ALL">{{ store.t.allTypes }}</option>
            <option value="movie">{{ store.t.typeMovie }}</option>
            <option value="series">{{ store.t.typeSeries }}</option>
            <option value="one-shot">{{ store.t.typeOneShot }}</option>
            <option value="special">{{ store.t.typeSpecial }}</option>
          </select>

          <select v-model="store.statusFilter" class="tva-bg-inset border tva-border rounded py-2 px-3 tva-text-main font-mono-tech text-xs sm:text-sm focus:outline-none focus:border-[#FF9F1C] cursor-pointer">
            <option value="ALL">{{ store.t.allStatuses }}</option>
            <option value="UNWATCHED">{{ store.t.statusUnwatched }}</option>
            <option value="WATCHED">{{ store.t.statusWatched }}</option>
            <option value="CRITICAL">{{ store.t.statusCritical }}</option>
          </select>
        </div>

        <!-- Liste des 83 cartes -->
        <div class="space-y-5">
          <div v-if="store.filteredProjects.length === 0" class="text-center py-20 tva-text-muted font-mono-tech border border-dashed tva-border rounded-lg tva-bg-secondary">
            {{ store.t.noResults }}
          </div>
          
          <TransitionGroup name="list">
            <McuCard 
              v-for="project in store.filteredProjects" 
              :key="project.id" 
              :project="project" 
            />
          </TransitionGroup>
        </div>
      </template>
    </main>
  </div>
</template>

<style>
.font-mono-tech {
  font-family: 'JetBrains Mono', monospace;
}

/* Thème Sombre : Terminal Void / Latvérie */
.theme-dark {
  --bg-primary: #06080C;
  --bg-secondary: #0A0D14;
  --bg-card: #0F141C;
  --bg-inset: #05070A;
  --border-color: #1F2937;
  --text-main: #F3F4F6;
  --text-secondary: #D1D5DB;
  --text-muted: #9CA3AF;
}

/* Thème Clair : Archives Papier Bureaucratiques TVA */
.theme-light {
  --bg-primary: #F4EFE6;
  --bg-secondary: #EAE2D3;
  --bg-card: #FAF7F2;
  --bg-inset: #EFE9DC;
  --border-color: #C8B9A6;
  --text-main: #1C1917;
  --text-secondary: #44403C;
  --text-muted: #78716C;
}

.tva-bg-primary { background-color: var(--bg-primary) !important; }
.tva-bg-secondary { background-color: var(--bg-secondary) !important; }
.tva-bg-card { background-color: var(--bg-card) !important; }
.tva-bg-inset { background-color: var(--bg-inset) !important; }
.tva-border { border-color: var(--border-color) !important; }
.tva-text-main { color: var(--text-main) !important; }
.tva-text-secondary { color: var(--text-secondary) !important; }
.tva-text-muted { color: var(--text-muted) !important; }

.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.35s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
.list-leave-active {
  position: absolute;
}
</style>