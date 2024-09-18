import React, { useEffect, useState } from 'react';
import { Button, message, Select } from 'antd';

const TTSAudio = ({ text, audioBase64, setAudioBase64 }) => {
  const ttsTypes = [
    { value: 'lain_style_bert_vits2', label: 'Lain' },
    { value: 'gtts', label: 'Google' },
    { value: 'edge-tts', label: 'Edge' },
    { value: 'openai-tts', label: 'OpenAI' },
  ];
  const [audioUrl, setAudioUrl] = useState('');
  const [tts, setTts] = useState(ttsTypes[0].value);
  const audioRef = React.createRef<HTMLAudioElement>();

  useEffect(() => {
    if (audioBase64) {
      const { arrayBuffer, audioUrl } = base64AudioToBufferAndUrl(audioBase64);
      setAudioUrl(audioUrl);
    }
  }, [audioBase64]);

  const playAudio = async () => {
    const res = await getAudioData(text, tts);
    if (res?.audioUrl) {
      setAudioUrl(res.audioUrl);
      setAudioBase64(res.audioBase64);
      message.success('Play success');
    }
  };
  return (
    // <div style={{display: 'flex', alignItems: 'center', padding: '10px 0'}}>
    <>
      <Select
        // defaultValue={ttsTypes[0].value}
        value={tts}
        style={{
          width: 80,
          // flex: 1
        }}
        options={ttsTypes}
        onChange={(value, option) => {
          // const res = await getAudioData(text, value);
          // if (res?.audioUrl) {
          //   setAudioUrl(res.audioUrl)
          //   setAudioData(res.audioData)
          // }
          setTts(value);
        }}
      />
      <Button
        onClick={async () => {
          await playAudio();
        }}
      >
        Play
      </Button>
      <audio
        controls
        style={{
          flex: 4,
          // maxWidth: "400px"
        }}
        ref={audioRef}
        src={audioUrl}
        onCanPlay={(e) => {
          e.currentTarget.playbackRate = 1;
          e.currentTarget.play();
        }}
      >
        <source src="your-audio-file.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </>
  );
};

export default TTSAudio;

export const getAudioData = async (text: string, ttsEngine: string) => {
  console.log('getAudioData', text);
  if (!text) {
    console.error('text is empty');
    return;
  }
  let response = await fetch(process.env.TTS_HUB_SERVICE_SERVER as string, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // "Access-Control-Allow-Origin": "*"
    },
    mode: 'cors',
    body: JSON.stringify({
      // tts_engine: "gtts",
      voice: 'fable',
      tts_engine: ttsEngine,
      text: text,
      // speaker: speaker,
      language: 'ja',
      speed: 1,
    }),
  });
  // .then(async response => {
  // const audioData = await response.arrayBuffer()
  const data = await response.json();
  // const jsonData = await response.headers.get('Response-Data')
  // const json = jsonData ? JSON.parse(jsonData) : {}
  // console.log(data)
  let sampling_rate = data['sampling_rate'];
  let audioBase64 = data['audio'];
  // let arrayBuffer = Buffer.from(audioBase64, "base64");

  const { arrayBuffer, audioUrl } = base64AudioToBufferAndUrl(audioBase64);
  return {
    sampling_rate,
    audioBase64,
    audioBytes: arrayBuffer,
    audioUrl,
  };
  // })
  // .catch(error => {
  //   console.error(error);
  // });
};

const base64AudioToBufferAndUrl = (base64: string) => {
  let binaryString = window.atob(base64);
  let len = binaryString.length;
  let arrayBuffer = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    arrayBuffer[i] = binaryString.charCodeAt(i);
  }

  const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
  const audioUrl = URL.createObjectURL(blob);
  return { arrayBuffer, audioUrl };
};
