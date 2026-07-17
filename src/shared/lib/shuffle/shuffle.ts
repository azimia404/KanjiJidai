// Fisher-Yates shuffle
export default function shuffle<T>(arr: T[]): T[] {
  console.log("shuffling", arr);
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  console.log("shuffled", copy);
  return copy;
}
