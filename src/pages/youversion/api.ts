import { request } from '@@/exports';
import { eachDayOfInterval, format } from 'date-fns';
import { DailyPray, DailyPrayData, DailyPrayEditData, FuriganaResponse, PrayText } from './struct';

const serviceApi = {
  youversion: {
    url: `${process.env.BIBLE_YOUVERSION_SERVICE_BASE}`,
    headers: {},
  },
  furigana: {
    url: `${process.env.JAPANESE_FURIGANA_SERVICE_BASE}`,
  },
};

function getDateFromFilename(filename: string) {
  return filename.slice('bible_pray_'.length, filename.length - '.json'.length);
}

function getFilenameFromDate(date: string) {
  return `bible_pray_${date}.json`;
}

export async function getList() {
  let res = await request<{ data: string[] }>(`${serviceApi.youversion.url}/list`, {
    method: 'GET',
  });

  const names = res.data;
  const start = getDateFromFilename(names[0]);
  const end = getDateFromFilename(names[names.length - 1]);
  const expireDates = eachDayOfInterval({
    start: new Date(),
    end: new Date(end),
  }).map((date) => format(date, 'yyyy-MM-dd'));
  const originPair = names.reduce((map, name) => {
    map[name] = 1;
    return map;
  }, {} as { [key: string]: number });

  const result = expireDates.map((date) => {
    const name = getFilenameFromDate(date);
    const found = originPair[name];
    let res: DailyPray;
    if (found) {
      res = {
        date: date,
        name: name,
        status: 1,
      };
    } else {
      res = {
        date: date,
        name: '',
        status: 0,
      };
    }
    res['id'] = res.date;
    return res;
  });

  return result;
}

export async function getOne(date: string) {
  let res = await request<DailyPrayData>(`${serviceApi.youversion.url}/get/${date}`, {
    method: 'GET',
  });
  let record = await getRecord(date);

  const editDatas = [
    { id: 'bibleWords', origin: res.bible.bibleWords },
    { id: 'bibleDescription', origin: res.bible.bibleDescription },
    {
      id: 'bibleQuestion',
      // origin: res.bible.bibleQuestion,
      origin: `${res.bible.bibleQuestion.question}\n${res.bible.bibleQuestion.answer.join('\n')}`,
    },
    { id: 'biblePray', origin: res.bible.biblePray },

    { id: 'prayPreface', origin: res.pray.prayPreface },
    { id: 'prayPraiseGod', origin: res.pray.prayPraiseGod },
    { id: 'prayThinking', origin: res.pray.prayThinking },
    { id: 'prayWords', origin: res.pray.prayWords },
    { id: 'prayEnd', origin: res.pray.prayEnd },
  ];
  console.log('editDatas:', editDatas);
  // const editDatasRes = editDatas.map((editData) => {
  const editDatasRes: DailyPrayEditData[] = editDatas.map((editData) => {
    let origin = collectPrayText(editData.origin);
    origin = origin.replace(/(\n\s*){3,}/g, '\n\n');
    origin = origin.replace(/\u202D/g, '\n[');
    origin = origin.replace(/\u202C/g, ']');
    // origin = origin.replace(/&ldquo;/g, '「');
    // origin = origin.replace(/&rdquo;/g, '」');
    const parser = new DOMParser();
    const doc = parser.parseFromString(origin, 'text/html');
    origin = doc.documentElement.textContent ?? '';
    // [\u202C-\u202E]

    return {
      ...editData,
      title: editData.id,
      origin: origin,
      furigana: record[editData.id] ?? '',
    };
  });
  return {
    origin: res,
    editDatas: editDatasRes,
  };
}

function collectPrayText(data: undefined | string | PrayText | any): string {
  console.log('data:', data);
  if (!data) {
    return '';
  }
  if (typeof data === 'string') {
    return data;
  }
  return data.description ?? '';
}

export async function getFuriganaTemplate(text: string) {
  let res = await request<FuriganaResponse>(`${serviceApi.furigana.url}/convert`, {
    method: 'POST',
    data: {
      text: text,
    },
  });
  let data = res.data;

  let kanjiFuStr = '';
  data.forEach((item) => {
    const [character, type, hiragana, katakana] = item;
    switch (type) {
      case 1:
        kanjiFuStr += `{{${character}|${hiragana}|}}`;
        break;

      case 2:
      default:
        kanjiFuStr += character;
    }
  });
  return kanjiFuStr;
}

export async function saveToDB(date: string, data: DailyPrayEditData) {
  let res = await request(`${serviceApi.youversion.url}/record/save/${date}`, {
    method: 'POST',
    data: {
      title: data.title,
      furigana: data.furigana,
    },
  });
  return res;
}

export async function getRecord(date: string, title?: string) {
  let query = '';
  if (title) {
    query = `title=${title}`;
  }
  let res = await request<string | any>(
    `${serviceApi.youversion.url}/record/get/${date}?${query}`,
    {
      method: 'GET',
    },
  );
  return res.data ?? '';
}

export async function saveAudioToDB(date: string, title: string, audio: string) {
  console.log('saveAudioToDB:', date, title, 'length', audio.length);
  let res = await request(`${serviceApi.youversion.url}/record/audio`, {
    method: 'POST',
    data: {
      date: date,
      title: title,
      audio: audio,
    },
  });
  return res;
}

export async function getAudioFromDB(date: string, title: string) {
  let res = await request<string | any>(
    `${serviceApi.youversion.url}/record/audio?date=${date}&title=${title}`,
    {
      method: 'GET',
    },
  );
  return res.data ?? '';
}
