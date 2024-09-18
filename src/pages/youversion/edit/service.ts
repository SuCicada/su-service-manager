export function getVoiceRead(furigana: string) {
  const data = parseFromFuriganaTemplate(furigana);
  return data
    .map((item) => {
      if (typeof item === 'string') {
        return item;
      } else {
        if (item.readVoice) {
          return item.readVoice;
        } else {
          return item.kanji;
        }
      }
    })
    .join('');
}

export function parseFromFuriganaTemplate(templateText: string) {
  const regex = /{{(.*?)\|(.*?)\|(.*?)}}/g;
  let match;
  let data: (string | { kanji: string; showHire: string; readVoice: string })[] = [];
  let index = 0;
  while ((match = regex.exec(templateText))) {
    const raw = templateText.slice(index, match.index);
    const [matchStr, kanji, showHire, readVoice] = match;
    index = regex.lastIndex;
    data.push(raw);
    data.push({ kanji, showHire, readVoice });
  }
  data.push(templateText.slice(index));
  return data;
}
