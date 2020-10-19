export function createDisjunction(elements: string[]): string {
  if (elements.length === 1) {
    return elements[0];
  } else if (elements.length === 2) {
    return `${elements[0]} or ${elements[1]}`;
  }

  return (
    elements
      .slice(0, elements.length - 1)
      .map((element) => `${element}, `)
      .join('') +
    'or ' +
    elements[elements.length - 1]
  );
}
