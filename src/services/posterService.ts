import type { McuProject, Locale, TmdbWikiDetails, TmdbCastMember, TmdbEpisodeInfo } from '../types/mcu'

// Jeton TMDB V4 actif pré-configuré
const TMDB_BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwM2M2ODlkNzM3MmJkMDg0ZGQ0NjI1NWNmMDJkYmQ3ZiIsIm5iZiI6MTc3MTg3NTQ5Ny40NjgsInN1YiI6IjY5OWNhY2E5N2NiNDZkNWM2NzM3NGNjZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.FHPMhmT6GHvVcHGMwErbBj1uGnPaXZmLD2ryHF_hx8w'

const POSTER_CACHE_KEY = 'mcu_posters_tmdb_v4'
const WIKI_CACHE_KEY = 'mcu_wiki_details_v3'

function getCache<T>(key: string): Record<string, T> {
  try {
    return JSON.parse(localStorage.getItem(key) || '{}')
  } catch {
    return {}
  }
}

function saveToCache<T>(key: string, id: string, value: T) {
  try {
    const cache = getCache<T>(key)
    cache[id] = value
    localStorage.setItem(key, JSON.stringify(cache))
  } catch {
    // Ignorer si quota localStorage atteint
  }
}

export function generateFallbackPoster(project: McuProject): string {
  const accent = project.era === 5 ? '#00D67D' : '#FF9F1C'
  const safeTitle = project.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600">
    <rect width="400" height="600" fill="#0B0F17"/>
    <rect x="16" y="16" width="368" height="568" fill="none" stroke="${accent}" stroke-width="2" stroke-opacity="0.4"/>
    <line x1="16" y1="80" x2="384" y2="80" stroke="${accent}" stroke-width="1" stroke-opacity="0.25"/>
    <text x="32" y="54" fill="${accent}" font-family="monospace" font-size="18" font-weight="bold">FILE #${String(project.order).padStart(2, '0')} // ERA-0${project.era}</text>
    <text x="200" y="290" fill="#F1F5F9" font-family="sans-serif" font-size="22" font-weight="bold" text-anchor="middle">${safeTitle.slice(0, 26)}</text>
    <text x="200" y="325" fill="#94A3B8" font-family="sans-serif" font-size="18" text-anchor="middle">${safeTitle.slice(26, 54)}</text>
    <text x="32" y="555" fill="#64748B" font-family="monospace" font-size="14">${project.timelineYear} • ${project.releaseYear}</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

async function tmdbFetch(url: string) {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${TMDB_BEARER_TOKEN}`
    }
  })
  if (!res.ok) throw new Error(`TMDB HTTP ${res.status}`)
  return res.json()
}

async function findTmdbMatch(project: McuProject, lang: string): Promise<{ id: number; poster_path?: string } | null> {
  const isTv = project.type === 'series'
  const endpoint = isTv ? 'tv' : 'movie'

  const queries = [project.originalTitle.replace(/\*/g, '').trim()]
  if (project.originalTitle.startsWith('Marvel One-Shot:')) {
    queries.push(project.originalTitle.replace('Marvel One-Shot:', '').trim())
  }
  if (project.originalTitle.startsWith("Marvel's ")) {
    queries.push(project.originalTitle.replace("Marvel's ", '').trim())
  }

  for (const q of queries) {
    const encoded = encodeURIComponent(q)
    const data = await tmdbFetch(`https://api.themoviedb.org/3/search/${endpoint}?query=${encoded}&language=${lang}`)
    if (data?.results?.length > 0) {
      const yearMatch = data.results.find((item: any) => {
        const dateStr = item.release_date || item.first_air_date || ''
        const year = parseInt(dateStr.slice(0, 4), 10)
        return !isNaN(year) && Math.abs(year - project.releaseYear) <= 1
      })
      return yearMatch || data.results[0]
    }
  }
  return null
}

function detectSeasonNumber(project: McuProject): number {
  const match = project.title.match(/Saison\s+(\d+)/i)
  return match ? parseInt(match[1], 10) : 1
}

export async function fetchProjectPoster(project: McuProject): Promise<string> {
  const cache = getCache<string>(POSTER_CACHE_KEY)
  if (cache[project.id]) {
    return cache[project.id]
  }

  try {
    const match = await findTmdbMatch(project, 'fr-FR')
    if (match?.poster_path) {
      const tmdbUrl = `https://image.tmdb.org/t/p/w500${match.poster_path}`
      saveToCache(POSTER_CACHE_KEY, project.id, tmdbUrl)
      return tmdbUrl
    }
  } catch {
    // Passage silencieux au fallback
  }

  const fallback = generateFallbackPoster(project)
  saveToCache(POSTER_CACHE_KEY, project.id, fallback)
  return fallback
}

export async function fetchProjectWikiDetails(project: McuProject, locale: Locale): Promise<TmdbWikiDetails | null> {
  const lang = locale === 'fr' ? 'fr-FR' : 'en-US'
  const cacheId = `${project.id}_${locale}`
  const wikiCache = getCache<TmdbWikiDetails>(WIKI_CACHE_KEY)

  // Ne retourner le cache que s'il est valide et riche
  if (wikiCache[cacheId] && wikiCache[cacheId].tmdbId) {
    return wikiCache[cacheId]
  }

  try {
    const isTv = project.type === 'series'
    const endpoint = isTv ? 'tv' : 'movie'
    const match = await findTmdbMatch(project, lang)
    if (!match) return null

    // Pour les séries TV, aggregate_credits est indispensable pour récupérer tous les acteurs
    const creditsParam = isTv ? 'credits,aggregate_credits,videos' : 'credits,videos'
    const detailsUrl = `https://api.themoviedb.org/3/${endpoint}/${match.id}?language=${lang}&append_to_response=${creditsParam}&include_video_language=${locale},en,null`
    const details = await tmdbFetch(detailsUrl)

    // Si le synopsis ou la tagline sont vides en FR, on récupère la fiche EN en complément
    let enDetails: any = null
    if (locale === 'fr' && (!details.overview || !details.tagline)) {
      try {
        enDetails = await tmdbFetch(`https://api.themoviedb.org/3/${endpoint}/${match.id}?language=en-US`)
      } catch {
        // Ignorer
      }
    }

    // Extraction du casting (fusion de aggregate_credits et credits pour les séries)
    const rawAggregateCast: any[] = details.aggregate_credits?.cast || []
    const rawStandardCast: any[] = details.credits?.cast || []
    const combinedCast = rawAggregateCast.length > 0 ? rawAggregateCast : rawStandardCast

    const cast: TmdbCastMember[] = combinedCast.slice(0, 18).map((c) => {
      const roleName =
        c.character ||
        (Array.isArray(c.roles) && c.roles.length > 0 ? c.roles[0].character : '') ||
        'Rôle classifié'
      return {
        id: c.id,
        name: c.name,
        character: roleName,
        profileUrl: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null
      }
    })

    // Extraction de l'équipe technique
    const rawCrew: any[] =
      (details.aggregate_credits?.crew?.length ? details.aggregate_credits.crew : details.credits?.crew) || []

    const directors = Array.from(
      new Set(
        rawCrew
          .filter((c) =>
            ['Director', 'Series Director'].includes(c.job) ||
            (Array.isArray(c.jobs) && c.jobs.some((j: any) => j.job === 'Director'))
          )
          .map((c) => c.name as string)
      )
    ).slice(0, 4)

    if (isTv && Array.isArray(details.created_by) && details.created_by.length > 0) {
      details.created_by.forEach((creator: any) => {
        if (!directors.includes(creator.name)) directors.unshift(creator.name)
      })
    }

    const writers = Array.from(
      new Set(
        rawCrew
          .filter((c) =>
            ['Writer', 'Screenplay', 'Story', 'Creator', 'Series Composition'].includes(c.job) ||
            (Array.isArray(c.jobs) && c.jobs.some((j: any) => ['Writer', 'Screenplay', 'Story'].includes(j.job)))
          )
          .map((c) => c.name as string)
      )
    ).slice(0, 5)

    const composers = Array.from(
      new Set(
        rawCrew
          .filter((c) =>
            ['Original Music Composer', 'Music'].includes(c.job) ||
            (Array.isArray(c.jobs) && c.jobs.some((j: any) => ['Original Music Composer', 'Music'].includes(j.job)))
          )
          .map((c) => c.name as string)
      )
    ).slice(0, 3)

    // Extraction de la meilleure bande-annonce YouTube
    const rawVideos: any[] = details.videos?.results || []
    const youtubeVideos = rawVideos.filter((v) => v.site === 'YouTube')
    const trailer =
      youtubeVideos.find((v) => v.type === 'Trailer' && v.iso_639_1 === locale) ||
      youtubeVideos.find((v) => v.type === 'Trailer' && v.iso_639_1 === 'en') ||
      youtubeVideos.find((v) => v.type === 'Trailer') ||
      youtubeVideos.find((v) => v.type === 'Teaser') ||
      youtubeVideos[0]

    // Extraction des épisodes pour les séries (avec repli en-US si les titres FR sont génériques)
    let episodesList: TmdbEpisodeInfo[] | undefined = undefined
    if (isTv) {
      const seasonNum = detectSeasonNumber(project)
      try {
        const seasonData = await tmdbFetch(
          `https://api.themoviedb.org/3/tv/${match.id}/season/${seasonNum}?language=${lang}`
        )
        let enSeasonData: any = null
        if (locale === 'fr') {
          try {
            enSeasonData = await tmdbFetch(
              `https://api.themoviedb.org/3/tv/${match.id}/season/${seasonNum}?language=en-US`
            )
          } catch {
            // Ignorer
          }
        }

        if (Array.isArray(seasonData?.episodes) && seasonData.episodes.length > 0) {
          episodesList = seasonData.episodes.map((ep: any, idx: number) => {
            const enEp = enSeasonData?.episodes?.[idx]
            const isGenericFrName = !ep.name || /^Épisode\s+\d+$/i.test(ep.name.trim())
            return {
              episodeNumber: ep.episode_number,
              name: isGenericFrName && enEp?.name ? enEp.name : (ep.name || `Episode ${ep.episode_number}`),
              overview: ep.overview || enEp?.overview || '',
              runtime: ep.runtime || enEp?.runtime || null,
              airDate: ep.air_date || null,
              stillUrl: ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : null
            }
          })
        }
      } catch {
        // Ignorer si la saison n'est pas encore détaillée sur TMDB
      }
    }

    const networks = isTv
      ? (details.networks || []).map((n: any) => n.name)
      : (details.production_companies || []).slice(0, 2).map((p: any) => p.name)

    const result: TmdbWikiDetails = {
      tmdbId: match.id,
      localizedTitle: details.title || details.name || project.title,
      tagline: details.tagline || enDetails?.tagline || '',
      overview: details.overview || enDetails?.overview || '',
      posterUrl: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
      backdropUrl: details.backdrop_path ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}` : null,
      releaseDate: details.release_date || details.first_air_date || String(project.releaseYear),
      voteAverage: details.vote_average ? +details.vote_average.toFixed(1) : 0,
      voteCount: details.vote_count || 0,
      budget: details.budget || 0,
      revenue: details.revenue || 0,
      status: details.status || 'Released',
      genres: (details.genres || []).map((g: any) => g.name),
      directors,
      writers,
      composers,
      networks,
      cast,
      trailerYoutubeKey: trailer ? trailer.key : null,
      seasonsCount: details.number_of_seasons,
      episodesList
    }

    saveToCache(WIKI_CACHE_KEY, cacheId, result)
    return result
  } catch {
    return null
  }
}