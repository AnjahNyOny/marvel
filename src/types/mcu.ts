export type EraId = 1 | 2 | 3 | 4 | 5
export type ProjectType = 'movie' | 'series' | 'one-shot' | 'special'
export type ImportanceLevel = 'critical' | 'essential' | 'recommended' | 'optional'
export type Locale = 'fr' | 'en'
export type ThemeMode = 'dark' | 'light'

export interface McuProject {
  id: string
  order: number
  title: string
  originalTitle: string
  releaseYear: number
  timelineYear: string
  era: EraId
  type: ProjectType
  durationMinutes: number
  episodes?: number
  importance: ImportanceLevel
  synopsis: string
  preWatchBriefing?: string
  postCreditsCount: number
  postCreditsAlert?: string
  doomsdayConnection?: string
}

export interface FallbackCastItem {
  name: string
  character: string
}

export interface FallbackEpisodeItem {
  episodeNumber: number
  titleFr: string
  titleEn: string
  overviewFr: string
  overviewEn: string
  runtime: number
}

export interface WikiLoreEntry {
  enTitle?: string
  enTimelineYear?: string
  enSynopsis?: string
  enBriefing?: string
  enPostCreditsAlert?: string
  enDoomsdayConnection?: string
  director: string
  writers: string
  composer: string
  studio: string
  budget?: number
  boxOffice?: number
  defaultScore?: string
  youtubeTrailerId: string
  comicsOrigins: {
    fr: string[]
    en: string[]
  }
  comicsVsMcu: {
    fr: string[]
    en: string[]
  }
  rumorsAndSecrets: {
    fr: string[]
    en: string[]
  }
  postCreditsDetails: {
    fr: string[]
    en: string[]
  }
  keyElements: {
    characters: string[]
    artifacts: string[]
    locations: string[]
  }
  powerMetrics: {
    multiverseImpact: number
    cosmicScale: number
    techVsMagic: string
  }
  fallbackCast: FallbackCastItem[]
  fallbackEpisodes?: FallbackEpisodeItem[]
  connectedProjectIds: string[]
}

export interface TmdbCastMember {
  id: number
  name: string
  character: string
  profileUrl: string | null
}

export interface TmdbEpisodeInfo {
  episodeNumber: number
  name: string
  overview: string
  runtime: number | null
  airDate: string | null
  stillUrl: string | null
}

export interface TmdbWikiDetails {
  tmdbId: number
  localizedTitle: string
  tagline: string
  overview: string
  posterUrl: string | null
  backdropUrl: string | null
  releaseDate: string
  voteAverage: number
  voteCount: number
  budget: number
  revenue: number
  status: string
  genres: string[]
  directors: string[]
  writers: string[]
  composers: string[]
  networks: string[]
  cast: TmdbCastMember[]
  trailerYoutubeKey: string | null
  seasonsCount?: number
  episodesList?: TmdbEpisodeInfo[]
}