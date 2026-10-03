// src/utils/poll.js

/**
 * Computes poll tallies from a set of votes.
 * Order-independent.
 * 
 * @param {Array} options - List of option strings
 * @param {Array} votes - Array of { voterId, optionIndex }
 * @returns {Array} - Array of { option, count, voters, percentage, isWinner }
 */
export function tallyVotes(options, votes) {
  // Use a map to keep only the latest vote per voter per option (for multi-select)
  // Actually, if single-select, it's just latest vote per voter overall.
  // The prompt says "you can change your vote", implying the votes array might just be
  // the current active votes, OR it's a CRDT-like log.
  // Let's assume `votes` is an array of the LATEST active votes.
  // wait: "Tallies are computed from the vote set so they are order-independent (unit-tested)"
  // This means we have a set of active votes { voter: Set<optionIndex> }.
  
  const results = options.map(opt => ({
    option: opt,
    count: 0,
    voters: [],
    percentage: 0,
    isWinner: false,
  }));
  
  let totalVotes = 0;
  
  // votes is assumed to be [{ voter: 'Meera', optionIndex: 0 }, ...]
  // We just count them.
  votes.forEach(v => {
    if (v.optionIndex >= 0 && v.optionIndex < results.length) {
      results[v.optionIndex].count++;
      results[v.optionIndex].voters.push(v.voter);
      totalVotes++;
    }
  });
  
  let maxCount = -1;
  results.forEach(r => {
    r.percentage = totalVotes > 0 ? Math.round((r.count / totalVotes) * 100) : 0;
    if (r.count > maxCount) maxCount = r.count;
  });
  
  if (maxCount > 0) {
    results.forEach(r => {
      if (r.count === maxCount) r.isWinner = true;
    });
  }
  
  return results;
}
