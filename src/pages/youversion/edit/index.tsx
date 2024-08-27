import React, { useEffect, useState } from 'react';
import { Button, Input, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useParams } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';

import { Editor, Monaco } from '@monaco-editor/react';
import { getOne } from '@/pages/youversion/api';
import { DailyPrayEditData } from '@/pages/youversion/struct';
const { TextArea } = Input;

const LargeEditorList = ({ params }: { params: { id: string } }) => {
  const { id } = useParams();
  const [prayDatas, setPrayDatas] = useState<DailyPrayEditData[]>([]);
  console.log('id:', id);
  useEffect(() => {
    (async () => {
      const data = await getOne(id);
      console.log('data:', data);
      setPrayDatas(data.editDatas);
    })();
  }, []);

  const [rows, setRows] = useState([{ id: 1, left: '', middle: '', right: '' }]);

  const handleInputChange = (id, column, value) => {
    setRows(rows.map((row) => (row.id === id ? { ...row, [column]: value } : row)));
  };

  const addRow = () => {
    const newId = Math.max(...rows.map((r) => r.id), 0) + 1;
    setRows([...rows, { id: newId, left: '', middle: '', right: '' }]);
  };

  const deleteRow = (id) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  return (
    <PageContainer>
      <div>
        {prayDatas.map((prayData) => (
          <div
            key={prayData.title}
            style={{
              height: '100',
              marginBottom: 20,
              display: 'flex',
              gap: 10,
            }}
          >
            {/*<TextArea value={prayData.furigana}*/}
            {/*          onChange={(e) => handleInputChange(prayData.title, 'left', e.target.value)} />*/}

            <Editor
              height="200px"
              defaultLanguage="json"
              value={prayData.furigana}
              onChange={(value, event) => console.log('onChange', value, event)}
              width={300}
              options={{
                wordWrap: 'on',
              }}
            />
            <Editor
              height="200px"
              defaultLanguage="handlebars"
              value={prayData.origin}
              width={300}
              onChange={(value, event) => console.log('onChange', value, event)}
              options={{
                minimap: { enabled: false },
                wordWrap: 'on',
                // readOnly: true,
                lineNumbers: 'off',
                automaticLayout: true,
                scrollBeyondLastLine: false, // 控制编辑器在垂直滚动时是否滚动超过最后一行。
                contextmenu: false, // 禁用右键菜单
                scrollbar: {
                  alwaysConsumeMouseWheel: false, // 默认为true，设置为false后，滚动事件可以传递给父容器
                },
                // scrollbar: {
                //   vertical: 'hidden',
                //   // alwaysConsumeMouseWheel: true, // 默认滚动行为，防止父容器滚动被拦截
                // }
              }}
            />

            <Button
              icon={<DeleteOutlined />}
              onClick={() => deleteRow(row.id)}
              style={{ alignSelf: 'flex-start' }}
            />
          </div>
        ))}
        <Button icon={<PlusOutlined />} onClick={addRow}>
          Add Row
        </Button>
      </div>
    </PageContainer>
  );
};

export default LargeEditorList;
