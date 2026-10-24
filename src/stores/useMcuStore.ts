import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { User } from '@supabase/supabase-js'
import type { EraId, ProjectType, Locale, ThemeMode } from '../types/mcu'
import { MCU_TIMELINE } from '../data/mcuTimeline'
import { TRANSLATIONS } from '../i18n/translations'
import { supabase } from '../services/supabaseClient'

const STORAGE_KEY = 'doomsday_archive_state_v2'
const DOOMSDAY_RELEASE = new Date('2026-12-18T00:00:00')

interface PersistedState {
  watchedIds: string[]
  watchedEpisodes: Record<string, number[]>
  ratings: Record<string, number>
  notes: Record<string, string>
  spoilerShield: boolean
  locale: Locale
  theme: ThemeMode
}

export const useMcuStore = defineStore('mcu', () => {
  const watchedIds = ref<string[]>([])
  const watchedEpisodes = ref<Record<string, number[]>>({})
  const ratings = ref<Record<string, number>>({})
  const notes = ref<Record<string, string>>({})
  const spoilerShield = ref<boolean>(true)
  const locale = ref<Locale>('fr')
  const theme = ref<ThemeMode>('dark')

  // État Multi-Utilisateur Supabase
  const currentUser = ref<User | null>(null)
  const agentName = ref<string>('')
  const isSyncing = ref<boolean>(false)
  const showAuthModal = ref<boolean>(false)
  let isApplyingRemoteState = false
  let syncTimeout: ReturnType<typeof setTimeout> | null = null

  // Navigation vers la page Wiki dédiée
  const selectedProjectId = ref<string | null>(null)

  // Filtres
  const selectedEra = ref<EraId | 'ALL'>('ALL')
  const selectedType = ref<ProjectType | 'ALL'>('ALL')
  const statusFilter = ref<'ALL' | 'WATCHED' | 'UNWATCHED' | 'CRITICAL'>('ALL')
  const searchQuery = ref<string>('')

  // 1. Chargement initial depuis localStorage (Mode Invité ou Cache local)
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('doomsday_archive_state_v1')
    if (raw) {
      const parsed: Partial<PersistedState> = JSON.parse(raw)
      if (Array.isArray(parsed.watchedIds)) watchedIds.value = parsed.watchedIds
      if (parsed.watchedEpisodes) watchedEpisodes.value = parsed.watchedEpisodes
      if (parsed.ratings) ratings.value = parsed.ratings
      if (parsed.notes) notes.value = parsed.notes
      if (typeof parsed.spoilerShield === 'boolean') spoilerShield.value = parsed.spoilerShield
      if (parsed.locale === 'fr' || parsed.locale === 'en') locale.value = parsed.locale
      if (parsed.theme === 'dark' || parsed.theme === 'light') theme.value = parsed.theme
    }
  } catch {
    // ignorer
  }

  // 2. Sauvegarde vers Supabase (avec anti-rebond de 500ms)
  async function pushStateToCloud() {
    if (!supabase || !currentUser.value || isApplyingRemoteState) return
    isSyncing.value = true
    try {
      await supabase.from('tva_agent_archives').upsert({
        user_id: currentUser.value.id,
        agent_name:
          agentName.value ||
          currentUser.value.user_metadata?.agent_name ||
          currentUser.value.email?.split('@')[0] ||
          'Agent TVA',
        watched_ids: watchedIds.value,
        watched_episodes: watchedEpisodes.value,
        ratings: ratings.value,
        notes: notes.value,
        spoiler_shield: spoilerShield.value,
        locale: locale.value,
        theme: theme.value,
        updated_at: new Date().toISOString()
      })
    } catch {
      // ignorer
    } finally {
      isSyncing.value = false
    }
  }

  // 3. Chargement du profil depuis Supabase à la connexion
  async function loadCloudProfile(user: User) {
    if (!supabase) return
    isSyncing.value = true
    try {
      const { data, error } = await supabase
        .from('tva_agent_archives')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) throw error

      if (data) {
        // Un dossier existe déjà dans le cloud : on charge les données de cet agent
        isApplyingRemoteState = true
        watchedIds.value = Array.isArray(data.watched_ids) ? data.watched_ids : []
        watchedEpisodes.value = data.watched_episodes || {}
        ratings.value = data.ratings || {}
        notes.value = data.notes || {}
        if (typeof data.spoiler_shield === 'boolean') spoilerShield.value = data.spoiler_shield
        if (data.locale === 'fr' || data.locale === 'en') locale.value = data.locale
        if (data.theme === 'dark' || data.theme === 'light') theme.value = data.theme
        agentName.value =
          data.agent_name ||
          user.user_metadata?.agent_name ||
          user.email?.split('@')[0] ||
          'Agent TVA'
        setTimeout(() => {
          isApplyingRemoteState = false
        }, 100)
      } else {
        // Premier login : on transfère la progression actuelle du mode invité vers son nouveau compte cloud
        agentName.value =
          user.user_metadata?.agent_name ||
          user.email?.split('@')[0] ||
          'Agent TVA'
        await pushStateToCloud()
      }
    } catch {
      // ignorer
    } finally {
      isSyncing.value = false
    }
  }

  // 4. Écouteur de session Supabase au démarrage
  if (supabase) {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        currentUser.value = data.session.user
        loadCloudProfile(data.session.user)
      }
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user || null
      const previousUserId = currentUser.value?.id
      currentUser.value = newUser

      if (newUser && newUser.id !== previousUserId) {
        loadCloudProfile(newUser)
      }
    })
  }

  // 5. Surveillance des changements (localStorage immédiat + Cloud différé)
  watch(
    [watchedIds, watchedEpisodes, ratings, notes, spoilerShield, locale, theme],
    () => {
      try {
        const payload: PersistedState = {
          watchedIds: watchedIds.value,
          watchedEpisodes: watchedEpisodes.value,
          ratings: ratings.value,
          notes: notes.value,
          spoilerShield: spoilerShield.value,
          locale: locale.value,
          theme: theme.value
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
      } catch {
        // ignorer
      }

      if (currentUser.value && !isApplyingRemoteState) {
        if (syncTimeout) clearTimeout(syncTimeout)
        syncTimeout = setTimeout(() => {
          pushStateToCloud()
        }, 500)
      }
    },
    { deep: true }
  )

  async function signOutAgent() {
    if (supabase) {
      await supabase.auth.signOut()
    }
    isApplyingRemoteState = true
    currentUser.value = null
    agentName.value = ''
    // Réinitialise l'écran pour que l'utilisateur suivant reparte à zéro
    watchedIds.value = []
    watchedEpisodes.value = {}
    ratings.value = {}
    notes.value = {}
    localStorage.removeItem(STORAGE_KEY)
    showAuthModal.value = false
    setTimeout(() => {
      isApplyingRemoteState = false
    }, 100)
  }

  const t = computed(() => TRANSLATIONS[locale.value])

  const allProjects = computed(() => MCU_TIMELINE)
  const totalCount = computed(() => allProjects.value.length)
  const watchedCount = computed(() => watchedIds.value.length)
  const completionPercentage = computed(() =>
    totalCount.value === 0 ? 0 : Math.round((watchedCount.value / totalCount.value) * 100)
  )

  const selectedProject = computed(() => {
    if (!selectedProjectId.value) return null
    return allProjects.value.find((p) => p.id === selectedProjectId.value) || null
  })

  const nextMission = computed(() => {
    return allProjects.value.find((p) => !watchedIds.value.includes(p.id)) || null
  })

  const remainingMinutes = computed(() => {
    return allProjects.value
      .filter((p) => !watchedIds.value.includes(p.id))
      .reduce((acc, p) => acc + p.durationMinutes, 0)
  })

  const doomsdayCountdown = computed(() => {
    const now = new Date()
    const diffMs = DOOMSDAY_RELEASE.getTime() - now.getTime()
    const daysLeft = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
    const weeksLeft = Math.max(1, +(daysLeft / 7).toFixed(1))
    const remainingCount = totalCount.value - watchedCount.value
    const hoursLeft = +(remainingMinutes.value / 60).toFixed(1)
    const hoursPerWeek = +(hoursLeft / weeksLeft).toFixed(1)
    const projectsPerWeek = +(remainingCount / weeksLeft).toFixed(1)

    return {
      daysLeft,
      weeksLeft,
      hoursLeft,
      hoursPerWeek,
      projectsPerWeek,
      remainingCount
    }
  })

  const filteredProjects = computed(() => {
    const q = searchQuery.value.trim().toLowerCase()
    return allProjects.value.filter((project) => {
      if (selectedEra.value !== 'ALL' && project.era !== selectedEra.value) return false
      if (selectedType.value !== 'ALL' && project.type !== selectedType.value) return false

      const watched = watchedIds.value.includes(project.id)
      if (statusFilter.value === 'WATCHED' && !watched) return false
      if (statusFilter.value === 'UNWATCHED' && watched) return false
      if (
        statusFilter.value === 'CRITICAL' &&
        project.importance !== 'critical' &&
        project.importance !== 'essential'
      ) {
        return false
      }

      if (q) {
        const matchTitle = project.title.toLowerCase().includes(q)
        const matchOrig = project.originalTitle.toLowerCase().includes(q)
        const matchSynopsis = project.synopsis.toLowerCase().includes(q)
        const matchYear =
          String(project.releaseYear).includes(q) || project.timelineYear.toLowerCase().includes(q)
        if (!matchTitle && !matchOrig && !matchSynopsis && !matchYear) return false
      }

      return true
    })
  })

  function isWatched(id: string): boolean {
    return watchedIds.value.includes(id)
  }

  function toggleWatched(id: string) {
    const idx = watchedIds.value.indexOf(id)
    if (idx === -1) {
      watchedIds.value.push(id)
    } else {
      watchedIds.value.splice(idx, 1)
    }
  }

  function toggleEpisode(projectId: string, epNumber: number, totalEpisodes?: number) {
    const current = watchedEpisodes.value[projectId] || []
    const idx = current.indexOf(epNumber)
    if (idx === -1) {
      current.push(epNumber)
    } else {
      current.splice(idx, 1)
    }
    watchedEpisodes.value[projectId] = [...current]

    if (totalEpisodes && current.length >= totalEpisodes && !isWatched(projectId)) {
      toggleWatched(projectId)
    }
  }

  function isEpisodeWatched(projectId: string, epNumber: number): boolean {
    return (watchedEpisodes.value[projectId] || []).includes(epNumber)
  }

  function setRating(projectId: string, score: number) {
    ratings.value[projectId] = score
  }

  function setNote(projectId: string, text: string) {
    notes.value[projectId] = text
  }

  function toggleSpoilerShield() {
    spoilerShield.value = !spoilerShield.value
  }

  function toggleLocale() {
    locale.value = locale.value === 'fr' ? 'en' : 'fr'
  }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  function openProject(id: string) {
    selectedProjectId.value = id
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function closeProject() {
    selectedProjectId.value = null
  }

  return {
    watchedIds,
    watchedEpisodes,
    ratings,
    notes,
    spoilerShield,
    locale,
    theme,
    currentUser,
    agentName,
    isSyncing,
    showAuthModal,
    t,
    selectedProjectId,
    selectedProject,
    selectedEra,
    selectedType,
    statusFilter,
    searchQuery,
    allProjects,
    totalCount,
    watchedCount,
    completionPercentage,
    nextMission,
    remainingMinutes,
    doomsdayCountdown,
    filteredProjects,
    isWatched,
    toggleWatched,
    toggleEpisode,
    isEpisodeWatched,
    setRating,
    setNote,
    toggleSpoilerShield,
    toggleLocale,
    toggleTheme,
    openProject,
    closeProject,
    signOutAgent
  }
})