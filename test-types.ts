// Test script to verify TypeScript types work correctly
import type { McuProject, EraId, ProjectType, ImportanceLevel, EraMetadata } from './src/types/mcu';
import type { fetchProjectPoster } from './src/services/posterService';

// Test type correctness
const mockEraMetadata: EraMetadata = {
  id: 1,
  code: 'Phase I',
  title: 'The First Avenger',
  period: '1942-1945',
  description: 'The beginning of the Marvel Cinematic Universe'
};

const mockMcuProject: McuProject = {
  id: 'movie_1',
  order: 1,
  title: 'Captain America: The First Avenger',
  originalTitle: 'Captain America: The First Avenger',
  releaseYear: 2011,
  timelineYear: '1942-1945',
  era: 1,
  type: 'movie',
  durationMinutes: 124,
  importance: 'critical',
  synopsis: 'A soldier becomes a superhero',
  preWatchBriefing: 'Watch for the American flag',
  postCreditsCount: 2,
  doomsdayConnection: 'Tesseract discovery'
};

// Test that the types are compatible
console.log('Type verification: OK');

// Test the fetchProjectPoster function signature
const testPoster = await fetchProjectPoster(mockMcuProject);
console.log('Poster service function test: OK');