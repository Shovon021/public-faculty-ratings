import { FacultyMember } from "@/types";

/**
 * Compute Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const an = a.length;
  const bn = b.length;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix: number[][] = [];
  for (let i = 0; i <= bn; i++) matrix[i] = [i];
  for (let j = 0; j <= an; j++) matrix[0][j] = j;

  for (let i = 1; i <= bn; i++) {
    for (let j = 1; j <= an; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[bn][an];
}

/**
 * Check if word fuzzy matches target token allowing minor typos
 */
function isFuzzyMatch(word: string, targetToken: string): boolean {
  if (!word || !targetToken) return false;
  if (targetToken === word) return true;
  if (targetToken.startsWith(word) || word.startsWith(targetToken)) return true;

  // Max allowed edit distance based on query length
  let maxDistance = 0;
  if (word.length >= 7) {
    maxDistance = 2;
  } else if (word.length >= 4) {
    maxDistance = 1;
  } else {
    return false; // Short queries (1-3 chars) should be exact prefix/substring
  }

  const distance = levenshteinDistance(word, targetToken);
  return distance <= maxDistance;
}

/**
 * Calculate search relevance score for a faculty member.
 * Higher score = higher ranking in search results.
 * Score 0 means no match.
 */
export function getFacultyRelevanceScore(faculty: FacultyMember, query: string): number {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return 1;

  const cleanName = faculty.name.toLowerCase();
  const cleanInitials = faculty.initials.toLowerCase();
  const isShortQuery = cleanQuery.length <= 2;

  let score = 0;

  // 1. EXACT INITIALS MATCH: Maximum Priority (e.g. "YS", "DSU", "MHAK", "MI", "DSHR")
  if (cleanInitials === cleanQuery) {
    score += 4000;
  } else if (cleanInitials.startsWith(cleanQuery)) {
    score += 2000;
  }

  // 2. FULL NAME EXACT MATCH OR PREFIX
  if (cleanName === cleanQuery) {
    score += 3500;
  } else if (cleanName.startsWith(cleanQuery)) {
    score += 2500;
  }

  // 3. NAME TOKENS (Individual words in faculty's name, e.g. "Yasin", "Sazid")
  const nameTokens = cleanName
    .replace(/[.,]/g, "")
    .split(/\s+/)
    .filter((t) => t.length > 0 && !["dr", "mr", "ms", "md"].includes(t));

  const queryTokens = cleanQuery.split(/\s+/).filter(Boolean);

  for (const qToken of queryTokens) {
    for (const nToken of nameTokens) {
      if (nToken === qToken) {
        score += 1500;
      } else if (nToken.startsWith(qToken)) {
        score += 1000;
      } else if (!isShortQuery && nToken.includes(qToken)) {
        score += 400;
      } else if (qToken.length >= 4 && isFuzzyMatch(qToken, nToken)) {
        score += 300;
      }
    }
  }

  // 4. NICKNAMES / COMMON ALIASES (e.g. "Ripon sir", "Shamim sir", "Taskeed sir")
  if (faculty.nicknames && faculty.nicknames.length > 0) {
    for (const nick of faculty.nicknames) {
      const cleanNick = nick.toLowerCase();
      if (cleanNick === cleanQuery) {
        score += 2000;
      } else if (cleanNick.startsWith(cleanQuery)) {
        score += 1200;
      } else if (cleanNick.includes(cleanQuery)) {
        score += 600;
      }
    }
  }

  // 5. EMAIL USERNAME MATCH (e.g. "yasin.sazid@ewubd.edu")
  const emailUsername = faculty.email.split("@")[0].toLowerCase();
  if (emailUsername === cleanQuery) {
    score += 2200;
  } else if (emailUsername.startsWith(cleanQuery)) {
    score += 1100;
  }

  // 6. RESEARCH INTERESTS & DESIGNATION
  // CRITICAL: For short queries (<= 2 chars), DO NOT do random substring matches on research
  // interests (e.g. "YS" matching "Embedded Systems"). Only match if whole word matches or query >= 3.
  if (!isShortQuery) {
    // Designation match (e.g. "Professor", "Lecturer")
    if (faculty.designation.toLowerCase().includes(cleanQuery)) {
      score += 150;
    }
    // Office match (e.g. "641", "AB1-303")
    if (faculty.office.toLowerCase().includes(cleanQuery)) {
      score += 300;
    }
    // Research field match
    for (const topic of faculty.researchInterests) {
      const cleanTopic = topic.toLowerCase();
      const topicTokens = cleanTopic.split(/\s+/);
      if (topicTokens.some((t) => t === cleanQuery)) {
        score += 250;
      } else if (topicTokens.some((t) => t.startsWith(cleanQuery))) {
        score += 150;
      } else if (cleanQuery.length >= 4 && cleanTopic.includes(cleanQuery)) {
        score += 60;
      }
    }
  } else if (cleanQuery === "ai" || cleanQuery === "ml" || cleanQuery === "se") {
    // Whitelisted 2-letter academic abbreviations
    for (const topic of faculty.researchInterests) {
      const cleanTopic = topic.toLowerCase();
      if (cleanTopic.split(/\s+/).some((t) => t === cleanQuery)) {
        score += 300;
      }
    }
  }

  return score;
}

/**
 * Filter and Rank faculty members by relevance.
 * Exact initials and name matches always bubble up to the very top.
 */
export function searchAndRankFaculty(facultyList: FacultyMember[], query: string): FacultyMember[] {
  const cleanQuery = query.trim();
  if (!cleanQuery) return facultyList;

  const scoredList = facultyList
    .map((faculty) => ({
      faculty,
      score: getFacultyRelevanceScore(faculty, cleanQuery),
    }))
    .filter((item) => item.score > 0);

  // Sort descending by relevance score first!
  scoredList.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    // Tie-break: highest rated first
    if (b.faculty.reviewCount > 0 && a.faculty.reviewCount > 0) {
      if (b.faculty.rating !== a.faculty.rating) return b.faculty.rating - a.faculty.rating;
      return b.faculty.reviewCount - a.faculty.reviewCount;
    }
    if (b.faculty.reviewCount > 0 && a.faculty.reviewCount === 0) return 1;
    if (a.faculty.reviewCount > 0 && b.faculty.reviewCount === 0) return -1;
    return a.faculty.name.localeCompare(b.faculty.name);
  });

  return scoredList.map((item) => item.faculty);
}

/**
 * Backward-compatible boolean matcher for simple checks
 */
export function matchFacultyQuery(faculty: FacultyMember, query: string): boolean {
  return getFacultyRelevanceScore(faculty, query) > 0;
}
