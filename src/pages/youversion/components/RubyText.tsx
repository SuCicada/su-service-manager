import React, { useEffect } from 'react';
import { UpdateFormProps } from '@/pages/youversion/components/ShowForm';
import parse from 'html-react-parser';
import { parseFromFuriganaTemplate } from '@/pages/youversion/edit/service';

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
    // if (!templateText) return;
    const data = parseFromFuriganaTemplate(templateText);
    setWordData(data);
    console.log('data:', data);
  }, [templateText]);

  return (
    <span>
      {wordData.map((item, index) => {
        if (typeof item === 'string') {
          return (
            <span
              key={index}
              // style={{ margin: '0 2px'}}
            >
              {convertToHtml(item)}
            </span>
          );
        } else {
          const { kanji, showHire, readVoice } = item;
          return (
            <span key={index} style={{ margin: '0 2px' }}>
              <ruby>
                {kanji}
                <rp style={{}}>(</rp>
                <rt
                  style={{
                    userSelect: 'none',
                    color: 'red',
                    fontSize: '0.8em',
                  }}
                >
                  {showHire}
                </rt>
                <rp style={{}}>)</rp>
              </ruby>
            </span>
          );
        }
      })}
    </span>
  );
};

export default RubyText;
