export const delayPromise = (delayInMs: number): Promise<void> => new Promise(resolve => {
  setTimeout(resolve, delayInMs);
});
