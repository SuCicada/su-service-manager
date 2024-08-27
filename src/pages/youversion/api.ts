import { request } from '@@/exports';
import { eachDayOfInterval, format } from 'date-fns';
import { DailyPray, DailyPrayData, DailyPrayEditData, PrayText } from './struct';

const serviceApi = {
  url: `${process.env.BIBLE_YOUVERSION_SERVICE_BASE}`,
  headers: {},
};

function getDateFromFilename(filename: string) {
  return filename.slice('bible_pray_'.length, filename.length - '.json'.length);
}

function getFilenameFromDate(date: string) {
  return `bible_pray_${date}.json`;
}

export async function getList() {
  let res = await request<{ data: string[] }>(`${serviceApi.url}/list`, {
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
  let res = await request<DailyPrayData>(`${serviceApi.url}/get/${date}`, {
    method: 'GET',
  });
  const editDatas: DailyPrayEditData[] = [
    { title: 'bibleWords', origin: res.bible.bibleWords },
    { title: 'bibleDescription', origin: res.bible.bibleDescription },
    {
      title: 'bibleQuestion',
      origin: res.bible.bibleQuestion,
      // defaultText: `${res.bible.bibleQuestion.question}\n${res.bible.bibleQuestion.answer.join("\n")}`,
    },
    { title: 'biblePray', origin: res.bible.biblePray },

    { title: 'prayPreface', origin: res.pray.prayPreface },
    { title: 'prayPraiseGod', origin: res.pray.prayPraiseGod },
    { title: 'prayThinking', origin: res.pray.prayThinking },
    { title: 'prayWords', origin: res.pray.prayWords },
    { title: 'prayEnd', origin: res.pray.prayEnd },
  ];

  const editDatasRes: DailyPrayEditData[] = editDatas.map((editData) => {
    return {
      ...editData,
      origin: JSON.stringify(
        {
          [editData.title]: editData.origin,
        },
        null,
        2,
      ) as string,
    };
  });
  return {
    origin: res,
    editDatas: editDatasRes,
  };
}

function collectPrayText(data: string | PrayText): string {
  if (typeof data === 'string') {
    return data;
  }
  return `${data.description}`;
}

// export async function createWebhook(data: Webhook) {
//   return request<any>(webhooksServiceApi.url, {
//     method: 'POST',
//     headers: webhooksServiceApi.headers,
//     data: data,
//   });
// }
//
// export async function updateWebhook(data: Webhook) {
//   return request<any>(`${webhooksServiceApi.url}/${data.id}`, {
//     method: 'PUT',
//     headers: webhooksServiceApi.headers,
//     data: data,
//   });
// }
//
// export async function deleteWebhook(id: number) {
//   return request<any>(`${webhooksServiceApi.url}/${id}`, {
//     method: 'DELETE',
//     headers: webhooksServiceApi.headers,
//   });
// }
