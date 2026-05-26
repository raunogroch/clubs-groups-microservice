export function calculateCoachesChanges(
  currentCoaches: string[],
  validatedCoaches: string[],
) {
  const currentSet = new Set(currentCoaches);
  const validatedSet = new Set(validatedCoaches);

  const addedCoaches = validatedCoaches.filter((id) => !currentSet.has(id));

  const removedCoaches = currentCoaches.filter((id) => !validatedSet.has(id));

  return {
    addedCoaches,
    removedCoaches,
  };
}
