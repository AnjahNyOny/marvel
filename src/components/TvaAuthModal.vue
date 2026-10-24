<script setup lang="ts">
import { ref } from 'vue'
import { X, UserCheck, LogIn, UserPlus, LogOut, ShieldCheck, AlertTriangle, Cloud } from 'lucide-vue-next'
import { useMcuStore } from '../stores/useMcuStore'
import { supabase, isSupabaseConfigured } from '../services/supabaseClient'

const store = useMcuStore()

const isSignupMode = ref(false)
const email = ref('')
const password = ref('')
const codename = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const infoMessage = ref('')

async function handleSubmit() {
  if (!supabase) return
  errorMessage.value = ''
  infoMessage.value = ''
  isLoading.value = true

  try {
    if (isSignupMode.value) {
      const cleanName = codename.value.trim() || email.value.split('@')[0]
      store.agentName = cleanName
      const { data, error } = await supabase.auth.signUp({
        email: email.value.trim(),
        password: password.value,
        options: {
          data: { agent_name: cleanName }
        }
      })
      if (error) throw error

      if (data.session) {
        store.showAuthModal = false
      } else {
        infoMessage.value =
          store.locale === 'fr'
            ? 'Matricule créé ! Vérifiez votre boîte courriel pour confirmer votre compte.'
            : 'Account created! Please check your email inbox to confirm your account.'
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.value.trim(),
        password: password.value
      })
      if (error) throw error
      store.showAuthModal = false
    }
  } catch (err: any) {
    errorMessage.value = err?.message || 'Erreur d’authentification TVA'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div
    v-if="store.showAuthModal"
    class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
    @click.self="store.showAuthModal = false"
  >
    <div class="w-full max-w-md rounded-xl border-2 border-[#FF9F1C] tva-bg-card p-6 shadow-2xl space-y-5 font-mono-tech">
      <!-- En-tête de la modale -->
      <div class="flex items-start justify-between gap-3 border-b tva-border pb-4">
        <div>
          <div class="text-xs text-[#FF9F1C] font-bold flex items-center gap-1.5">
            <ShieldCheck class="w-4 h-4" /> TVA SECURITY PROTOCOL
          </div>
          <h2 class="text-lg font-bold tva-text-main mt-1">
            {{
              store.currentUser
                ? store.t.auth.connectedAs
                : isSignupMode
                  ? store.t.auth.modalTitleSignup
                  : store.t.auth.modalTitleLogin
            }}
          </h2>
        </div>
        <button
          @click="store.showAuthModal = false"
          class="p-1.5 rounded border tva-border tva-text-muted hover:text-[#FF9F1C] hover:border-[#FF9F1C] cursor-pointer"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Avertissement si les clés Supabase ne sont pas encore collées -->
      <div
        v-if="!isSupabaseConfigured"
        class="p-4 rounded-lg border border-red-500/40 bg-red-500/10 text-red-400 text-xs flex items-start gap-2.5"
      >
        <AlertTriangle class="w-5 h-5 shrink-0 mt-0.5" />
        <span>{{ store.t.auth.notConfigured }}</span>
      </div>

      <!-- VUE 1 : AGENT DÉJÀ CONNECTÉ -->
      <div v-else-if="store.currentUser" class="space-y-4">
        <div class="p-4 rounded-lg border tva-border tva-bg-inset space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs tva-text-muted">MATRICULE</span>
            <span class="text-xs text-[#00D67D] flex items-center gap-1 font-bold">
              <Cloud class="w-3.5 h-3.5" /> {{ store.isSyncing ? store.t.auth.syncing : store.t.auth.synced }}
            </span>
          </div>
          <div class="text-base font-bold text-[#FF9F1C]">
            {{ store.agentName || store.currentUser.email }}
          </div>
          <div class="text-xs tva-text-muted truncate">{{ store.currentUser.email }}</div>
        </div>

        <div class="grid grid-cols-2 gap-3 text-center text-xs">
          <div class="p-3 rounded border tva-border tva-bg-inset">
            <span class="tva-text-muted block">DOSSIERS ARCHIVÉS</span>
            <span class="text-base font-bold text-[#00D67D]">{{ store.watchedCount }} / {{ store.totalCount }}</span>
          </div>
          <div class="p-3 rounded border tva-border tva-bg-inset">
            <span class="tva-text-muted block">NOTES & RAPPORTS</span>
            <span class="text-base font-bold text-[#FF9F1C]">{{ Object.keys(store.ratings).length }}</span>
          </div>
        </div>

        <button
          @click="store.signOutAgent()"
          class="w-full py-3 rounded-lg border border-red-500/50 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <LogOut class="w-4 h-4" /> {{ store.t.auth.logoutBtn }}
        </button>
      </div>

      <!-- VUE 2 : FORMULAIRE CONNEXION / INSCRIPTION -->
      <form v-else @submit.prevent="handleSubmit" class="space-y-4">
        <p class="text-xs tva-text-secondary font-sans">
          {{ store.t.auth.modalSubtitle }}
        </p>

        <div v-if="isSignupMode">
          <label class="block text-xs tva-text-muted mb-1">{{ store.t.auth.agentNameLabel }}</label>
          <input
            v-model="codename"
            type="text"
            required
            :placeholder="store.t.auth.agentNamePlaceholder"
            class="w-full p-2.5 rounded border tva-border tva-bg-inset tva-text-main text-xs focus:outline-none focus:border-[#FF9F1C]"
          />
        </div>

        <div>
          <label class="block text-xs tva-text-muted mb-1">{{ store.t.auth.emailLabel }}</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="agent@tva.org"
            class="w-full p-2.5 rounded border tva-border tva-bg-inset tva-text-main text-xs focus:outline-none focus:border-[#FF9F1C]"
          />
        </div>

        <div>
          <label class="block text-xs tva-text-muted mb-1">{{ store.t.auth.passwordLabel }}</label>
          <input
            v-model="password"
            type="password"
            required
            minlength="6"
            placeholder="••••••••"
            class="w-full p-2.5 rounded border tva-border tva-bg-inset tva-text-main text-xs focus:outline-none focus:border-[#FF9F1C]"
          />
        </div>

        <div v-if="store.watchedCount > 0" class="p-3 rounded border border-[#00D67D]/30 bg-[#00D67D]/10 text-[#00D67D] text-[11px] font-sans">
          ✓ {{ store.t.auth.guestNotice }}
        </div>

        <div v-if="errorMessage" class="p-3 rounded border border-red-500/40 bg-red-500/10 text-red-400 text-xs">
          {{ errorMessage }}
        </div>

        <div v-if="infoMessage" class="p-3 rounded border border-[#00D67D]/40 bg-[#00D67D]/10 text-[#00D67D] text-xs">
          {{ infoMessage }}
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-3 rounded-lg bg-[#FF9F1C] text-black font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 cursor-pointer disabled:opacity-50"
        >
          <UserPlus v-if="isSignupMode" class="w-4 h-4" />
          <LogIn v-else class="w-4 h-4" />
          {{ isLoading ? '...' : isSignupMode ? store.t.auth.submitSignup : store.t.auth.submitLogin }}
        </button>

        <div class="pt-2 text-center border-t tva-border">
          <button
            type="button"
            @click="isSignupMode = !isSignupMode; errorMessage = ''; infoMessage = ''"
            class="text-xs text-[#FF9F1C] hover:underline cursor-pointer"
          >
            {{ isSignupMode ? store.t.auth.switchToLogin : store.t.auth.switchToSignup }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>