// list
export interface DailyPray {
  id?: string;
  date: string;
  name: string;
  status: number; // 0: not found, 1: found
}

// get
export interface DailyPrayData {
  bible: DailyPrayDataBible;
  pray: DailyPrayDataPray;
  date: string;
}

export interface DailyPrayDataBible {
  bibleWords: string;
  bibleDescription: string;
  bibleQuestion: {
    question: string;
    answer: string[];
  };
  biblePray: string;
}

export interface DailyPrayDataPray {
  prayPreface: string;
  prayPraiseGod: string | PrayText;
  prayThinking: string | PrayText;
  prayWords: string | PrayText;
  prayEnd: string;
}

export interface PrayText {
  title: string;
  words: string;
  description: string;
}

// edit
export interface DailyPrayEditData {
  readonly title: string;
  readonly origin: string | any;
  furigana?: string;
}
