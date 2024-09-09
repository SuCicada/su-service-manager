import React, { useEffect } from 'react';
import { UpdateFormProps } from '@/pages/youversion/components/ShowForm';
import parse from 'html-react-parser';

function convertToHtml(str: string): React.ReactNode {
  const htmlStrArr = str.split('').map((item, index) => {
    let res;
    switch (item) {
      case '\n':
        res = '<br/>';
        break;
      case ' ':
        res = '&nbsp;';
        break;
      default:
        res = item;
    }
    return res;
  });
  const htmlStr = htmlStrArr.join('');
  return (
    <>
      {parse(htmlStr)}
      {/* {htmlStrArr.map((item, index) => { */}
      {/* return <span key={index}>{item}</span> */}
      {/* })} */}
    </>
  );
  // .replace(/&/g, "&amp;") // 转义 &
  // .replace(/</g, "&lt;") // 转义 <
  // .replace(/>/g, "&gt;") // 转义 >
  // .replace(/"/g, "&quot;") // 转义 "
  // .replace(/'/g, "&#039;") // 转义 '
}

const RubyText: React.FC<{ templateText: string }> = (props) => {
  const { templateText } = props;

  const [wordData, setWordData] = React.useState<any[]>([]);
  useEffect(() => {
    console.log('templateText', templateText);
    if (!templateText) return;

    const regex = /{{(.*?)\|(.*?)\|(.*?)}}/g;
    let match;
    let data: any[] = [];
    let index = 0;
    while ((match = regex.exec(templateText))) {
      const raw = templateText.slice(index, match.index);
      const [matchStr, kanji, showHire, readVoice] = match;
      index = regex.lastIndex;
      data.push(raw);
      data.push({ kanji, showHire, readVoice });
    }
    data.push(templateText.slice(index));
    setWordData(data);
    console.log('data:', data);
  }, [templateText]);

  return (
    <>
      {wordData.map((item, index) => {
        if (typeof item === 'string') {
          return <span key={index}>{convertToHtml(item)}</span>;
        } else {
          const { kanji, showHire, readVoice } = item;
          return (
            <ruby key={index} style={{}}>
              {kanji}
              <rp style={{ color: 'gray', fontSize: '0.8em', margin: '0 2px' }}>(</rp>
              <rt style={{ fontSize: '0.8em', color: 'red', margin: '0 2px' }}>{showHire}</rt>
              <rp style={{ color: 'gray', fontSize: '0.8em', margin: '0 2px' }}>)</rp>
            </ruby>
          );
        }
      })}
    </>
  );
};

export default RubyText;
