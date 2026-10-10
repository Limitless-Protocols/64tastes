import { dishes, districts, dishesByDistrict } from './data';
import type { DishStat } from './stats';

export const MIN_VOTES = Number(process.env.MIN_VOTES ?? 20);
const M = 10; // how strongly small samples are pulled toward the average
const smooth = (hits: number, votes: number, prior: number) => (hits + M * prior) / (votes + M);

export function buildRankings(stats: DishStat[]) {
  const byId = new Map(stats.map((s) => [s.id, s]));
  const totalVotes = stats.reduce((a, s) => a + s.votes, 0);
  const priorLoved = totalVotes ? stats.reduce((a, s) => a + s.loved, 0) / totalVotes : 0.5;
  const priorOver = totalVotes ? stats.reduce((a, s) => a + s.overrated, 0) / totalVotes : 0.1;

  const eligible = dishes
    .filter((d) => (byId.get(d.id)?.votes ?? 0) >= MIN_VOTES)
    .map((d) => {
      const stat = byId.get(d.id)!;
      return {
        dish: d,
        stat,
        lovedScore: smooth(stat.loved, stat.votes, priorLoved),
        overScore: smooth(stat.overrated, stat.votes, priorOver),
      };
    });

  const mostLoved = [...eligible].sort((a, b) => b.lovedScore - a.lovedScore).slice(0, 10);
  const mostOverrated = eligible
    .filter((r) => r.stat.overrated > 0)
    .sort((a, b) => b.overScore - a.overScore)
    .slice(0, 10);

  const districtRows = districts
    .map((district) => {
      let votes = 0;
      let loved = 0;
      for (const dish of dishesByDistrict[district.id] ?? []) {
        const s = byId.get(dish.id);
        if (s) {
          votes += s.votes;
          loved += s.loved;
        }
      }
      return { district, votes, loved, score: smooth(loved, votes, priorLoved) };
    })
    .filter((r) => r.votes >= MIN_VOTES)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return { mostLoved, mostOverrated, districtRows };
}