export function indent(str: string, indentNum: number, indentFirst = false): string {
  const indentStr = Array(indentNum).fill(' ').join('');

  return str
    .split('\n')
    .map((line, i) => ((i > 0 || indentFirst) && line.length ? `${indentStr}${line}` : line))
    .join('\n');
}
