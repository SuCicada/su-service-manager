import React, { useEffect, useState } from 'react';
import { Button, Card, Collapse, Divider, Input, message, Space, Switch } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useParams } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import { format } from 'date-fns';

import { Editor, Monaco } from '@monaco-editor/react';
import { getFuriganaTemplate, getOne, getRecord, saveToDB } from '@/pages/youversion/api';
import { DailyPrayEditData } from '@/pages/youversion/struct';
import RubyText from '@/pages/youversion/components/RubyText';

const { TextArea } = Input;

const LargeEditorList = ({ params }: { params: { id: string } }) => {
  const { id } = useParams();
  const date = id ? format(new Date(id), 'yyyyMMdd') : '';
  const [prayDatas, setPrayDatas] = useState<DailyPrayEditData[]>([]);
  const [itemStates, setItemStates] = useState<
    Record<
      string,
      {
        isPreview: boolean;
        furigana: string;
        origin: string;
      }
    >
  >({});
  // const [enablePreview, setEnablePreview] = useState(false);
  // const [prayDatas, setPrayDatas] = useState<Map<string, DailyPrayEditData>>(new Map());
  console.log('id:', id);
  useEffect(() => {
    (async () => {
      if (id) {
        const data = await getOne(id);
        console.log('data:', data);
        setPrayDatas(data.editDatas);
        // setPrayDatas(new Map(data.editDatas.map((editData) => [editData.title, editData])));
        const initialItemStates = data.editDatas.reduce(
          (acc, item) => ({
            ...acc,
            [item.title]: {
              isPreview: !!item.furigana,
              furigana: item.furigana,
              origin: item.origin,
            },
          }),
          {},
        );
        setItemStates(initialItemStates);
      }
    })();
  }, []);

  // const [rows, setRows] = useState([{id: 1, left: '', middle: '', right: ''}]);

  const handleInit = async (id: string) => {
    const res = await getFuriganaTemplate(itemStates[id].origin);
    // console.log(`Initializing ${title}`);
    setItemStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], furigana: res },
    }));
    message.success('Init success');
  };
  const handleSave = async (id: string) => {
    const furigana = itemStates[id].furigana;
    const res = await saveToDB(date, { id, title: id, furigana });
    console.log('res:', res);
    if (res.status !== 'ok') {
      message.error('操作失败！', res.message);
      return;
    }
    message.success('Save success');
  };

  const handleSync = async (id: string) => {
    const res = await getRecord(date, id);
    console.log('res:', res);
    setItemStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], furigana: res },
    }));
    message.success('Sync success');
  };

  const handlePreview = (id: string, checked: boolean) => {
    setItemStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        isPreview: checked,
      },
    }));
  };

  return (
    <PageContainer>
      <Card>
        <Collapse
          // accordion
          // ghost
          size="large"
          items={prayDatas.map((prayData) => ({
            key: prayData.id,
            label: prayData.title,
            collapsible: prayData.origin ? 'header' : 'disabled',
            extra: (
              <Space>
                <Button onClick={() => handleInit(prayData.id)} disabled={!prayData.origin}>
                  Init
                </Button>
                <Button disabled={!prayData.origin} onClick={() => handleSync(prayData.id)}>
                  Sync from DB
                </Button>
                <Switch
                  disabled={!prayData.origin}
                  onChange={(checked) => handlePreview(prayData.id, checked)}
                  checkedChildren="Preview"
                  unCheckedChildren="Origin"
                  checked={itemStates[prayData.id]?.isPreview}
                />
                <Button onClick={() => handleSave(prayData.id)} disabled={!prayData.origin}>
                  Save
                </Button>

                {/*<Button icon={<PlusOutlined/>} onClick={addRow}>*/}
                {/*  Add Row*/}
                {/*</Button>*/}
              </Space>
            ),
            children: (
              <div
                key={prayData.id}
                style={
                  {
                    // border: '1px solid black',
                  }
                }
              >
                {/*<Divider>{prayData.title}</Divider>*/}
                {prayData.origin ? (
                  <div
                    style={{
                      height: '200px',
                      minHeight: '200px',
                      marginBottom: 20,
                      display: 'flex',
                      // border: '1px solid black',
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        border: '1px solid black',
                        // width: '100%',
                        flex: 1,
                      }}
                    >
                      <Editor
                        // height={200}
                        // width={"50%"}
                        defaultLanguage="handlebars"
                        value={itemStates[prayData.id]?.furigana}
                        onChange={(value, event) => {
                          // console.log('onChange', value, event)
                          // itemStates[prayData.id]?.furigana = value;
                          // itemStates[prayData.id] = {...itemStates[prayData.id]};
                          setItemStates((prev) => ({
                            ...prev,
                            [prayData.id]: { ...prev[prayData.id], furigana: value ?? '' },
                          }));
                        }}
                        options={{
                          minimap: { enabled: false },
                          wordWrap: 'on',
                          // readOnly: true,
                          lineNumbers: 'on',
                          automaticLayout: true,
                          scrollBeyondLastLine: false, // 控制编辑器在垂直滚动时是否滚动超过最后一行。
                          contextmenu: false, // 禁用右键菜单
                          scrollbar: {
                            handleMouseWheel: true, // 默认为true，设置为false后，滚动事件可以传递给父容器
                            alwaysConsumeMouseWheel: true, // 默认为true，设置为false后，滚动事件可以传递给父容器
                          },
                          fontSize: 14,
                          lineNumbersMinChars: 2,
                          padding: { top: 0, bottom: 0 },
                          suggest: {
                            showWords: false, // 关闭自动提示
                          },
                          // scrollbar: {
                          //   vertical: 'hidden',
                          //   // alwaysConsumeMouseWheel: true, // 默认滚动行为，防止父容器滚动被拦截
                          // }
                        }}
                      />
                    </div>
                    <div
                      style={{
                        flex: 1,
                        border: '1px solid black',
                        height: '100%',
                        // width: "100%",
                        overflow: 'auto',
                      }}
                    >
                      {itemStates[prayData.id]?.isPreview ? (
                        <RubyText templateText={itemStates[prayData.id]?.furigana} />
                      ) : (
                        <TextArea
                          value={prayData.origin}
                          readOnly
                          style={{
                            height: '100%',
                            // flex: 1,
                            fontSize: 14,
                          }}
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  'なし'
                )}
              </div>
            ),
          }))}
        />
        {/*<Button icon={<PlusOutlined/>} onClick={addRow}>*/}
        {/*  Add Row*/}
        {/*</Button>*/}
      </Card>
    </PageContainer>
  );
};

export default LargeEditorList;
