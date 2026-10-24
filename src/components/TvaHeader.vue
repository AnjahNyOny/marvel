<script setup lang="ts">
import { useMcuStore } from '../stores/useMcuStore'
import { Shield, ShieldAlert, Activity, Clock, Target, Sun, Moon, Globe } from 'lucide-vue-next'

const store = useMcuStore()
</script>

<template>
  <header class="border-b tva-border tva-bg-secondary px-4 py-5 md:p-6 mb-6 md:mb-8 shadow-md transition-colors duration-300">
    <div class="max-w-7xl mx-auto flex flex-col xl:flex-row justify-between items-center gap-5">
      
      <!-- Titre & Compte à rebours -->
      <div class="flex items-center gap-3 md:gap-4 w-full xl:w-auto justify-between xl:justify-start">
        <div class="flex items-center gap-3 md:gap-4 cursor-pointer" @click="store.closeProject()">
          <Activity class="w-8 h-8 md:w-10 md:h-10 text-[#FF9F1C] shrink-0" />
          <div>
            <h1 class="text-xl sm:text-2xl md:text-3xl font-bold tracking-widest tva-text-main">
              {{ store.t.appTitle }}
            </h1>
            <div class="text-[#00D67D] font-mono-tech text-xs sm:text-sm mt-0.5 font-semibold">
              > {{ store.t.appSubtitle }} {{ store.doomsdayCountdown.daysLeft }} {{ store.t.days }}
            </div>
          </div>
        </div>

        <!-- Boutons rapides Mobile (Langue & Thème) -->
        <div class="flex xl:hidden items-center gap-2">
          <button
            @click="store.toggleLocale()"
            class="px-2.5 py-2 rounded border tva-border tva-bg-card font-mono-tech text-xs font-bold tva-text-main hover:border-[#FF9F1C] transition-colors flex items-center gap-1"
          >
            <Globe class="w-3.5 h-3.5 text-[#FF9F1C]" />
            {{ store.locale.toUpperCase() }}
          </button>
          <button
            @click="store.toggleTheme()"
            class="p-2 rounded border tva-border tva-bg-card tva-text-main hover:border-[#FF9F1C] transition-colors"
            :title="store.theme === 'dark' ? store.t.themeLight : store.t.themeDark"
          >
            <Sun v-if="store.theme === 'dark'" class="w-4 h-4 text-[#FF9F1C]" />
            <Moon v-else class="w-4 h-4 text-[#FF9F1C]" />
          </button>
        </div>
      </div>

      <!-- Statistiques & Contrôles -->
      <div class="flex flex-wrap justify-center items-center gap-2.5 sm:gap-3 text-xs font-mono-tech w-full xl:w-auto">
        
        <div class="flex-1 sm:flex-initial flex flex-col items-center border tva-border tva-bg-inset p-2.5 rounded min-w-[130px]">
          <span class="tva-text-muted flex items-center gap-1">
            <Clock class="w-3 h-3" /> {{ store.t.requiredPace }}
          </span>
          <span class="text-[#FF9F1C] text-base sm:text-lg font-bold">
            {{ store.doomsdayCountdown.hoursPerWeek }}h <span class="text-xs tva-text-muted font-normal">{{ store.t.perWeek }}</span>
          </span>
        </div>

        <div class="flex-1 sm:flex-initial flex flex-col items-center border tva-border tva-bg-inset p-2.5 rounded min-w-[130px]">
          <span class="tva-text-muted flex items-center gap-1">
            <Target class="w-3 h-3" /> {{ store.t.progression }}
          </span>
          <span class="text-[#00D67D] text-base sm:text-lg font-bold">
            {{ store.watchedCount }} / {{ store.totalCount }} <span class="text-xs tva-text-muted font-normal">({{ store.completionPercentage }}%)</span>
          </span>
        </div>

        <button 
          @click="store.toggleSpoilerShield()"
          class="flex items-center justify-center gap-2 px-3 py-3 rounded transition-colors border cursor-pointer font-semibold"
          :class="store.spoilerShield ? 'border-[#FF9F1C] text-[#FF9F1C] bg-[#FF9F1C]/10' : 'tva-border tva-text-muted hover:tva-text-main'"
        >
          <ShieldAlert v-if="store.spoilerShield" class="w-4 h-4 sm:w-5 sm:h-5" />
          <Shield v-else class="w-4 h-4 sm:w-5 sm:h-5" />
          <span>{{ store.t.spoilerShield }} : {{ store.spoilerShield ? store.t.active : store.t.inactive }}</span>
        </button>

        <!-- Boutons Desktop (Langue & Thème) -->
        <div class="hidden xl:flex items-center gap-2">
          <button
            @click="store.toggleLocale()"
            class="px-3 py-3 rounded border tva-border tva-bg-inset font-mono-tech text-xs font-bold tva-text-main hover:border-[#FF9F1C] transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Switch Language (FR / EN)"
          >
            <Globe class="w-4 h-4 text-[#FF9F1C]" />
            {{ store.locale.toUpperCase() }}
          </button>

          <button
            @click="store.toggleTheme()"
            class="p-3 rounded border tva-border tva-bg-inset tva-text-main hover:border-[#FF9F1C] transition-colors cursor-pointer"
            :title="store.theme === 'dark' ? store.t.themeLight : store.t.themeDark"
          >
            <Sun v-if="store.theme === 'dark'" class="w-4 h-4 text-[#FF9F1C]" />
            <Moon v-else class="w-4 h-4 text-[#FF9F1C]" />
          </button>
        </div>
      </div>
    </div>
    
    <!-- Barre de progression visuelle fragmentée -->
    <div class="max-w-7xl mx-auto mt-5 h-2.5 tva-bg-inset rounded-full overflow-hidden flex border tva-border">
      <div 
        v-for="project in store.allProjects" 
        :key="project.id"
        @click="store.openProject(project.id)"
        class="flex-1 border-r border-black/20 last:border-0 transition-colors duration-300 cursor-pointer hover:opacity-80"
        :class="store.isWatched(project.id) ? 'bg-[#00D67D]' : 'bg-transparent'"
        :title="`#${project.order} - ${project.title}`"
      ></div>
    </div>
  </header>
</template>