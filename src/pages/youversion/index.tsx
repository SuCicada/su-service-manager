import { addRule, removeRule, rule, updateRule } from '@/services/ant-design-pro/api';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  CellEditorTable,
  EditableProTable,
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormText,
  ProFormTextArea,
  ProTable,
  Search,
} from '@ant-design/pro-components';
import { Button, Drawer, Input, Popconfirm, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { deleteWebhook, getWebhooks, updateWebhook, Webhook } from '@/pages/github/webhooks/api';
import { syncFromGithubWebhooks } from '@/pages/github/webhooks/service';
import { getList } from '@/pages/youversion/api';

// @ts-ignore
import { history } from 'umi';
import { DailyPray } from '@/pages/youversion/struct';

const TableList: React.FC = () => {
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  /**
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   * */
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  // const [currentRow, setCurrentRow] = useState<API.RuleListItem>();
  const [selectedRowsState, setSelectedRows] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DailyPray[]>([]);
  useEffect(() => {
    (async () => {
      const _data = await getList();
      setData(_data);
    })();
  }, []);
  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const handleEdit = (id: string) => {
    history.push(`/youversion/edit/${id}`);
  };

  const columns: ProColumns<DailyPray>[] = [
    {
      title: 'date',
      key: 'date',
      dataIndex: 'date',
      valueType: 'text',
      // search: true,
      // editable: true,
    },
    {
      title: 'name',
      key: 'name',
      dataIndex: 'name',
      // sorter: (a, b) => a.url.length - b.url.length,
      valueType: 'text',
      // search: false,
      // onCell: (record, rowIndex) => {
      //   console.log('onCell', record, rowIndex);
      //   return {};
      // },
      // onCellClick: (record, e) => {
      //   console.log('onCellClick', record, e);
      // },
    },
    {
      title: 'status',
      key: 'status',
      dataIndex: 'status',
      // sorter: (a, b) => a.url.length - b.url.length,
      valueType: 'text',
      // search: false,
      renderText: (text, record, index) => {
        return text === 1 ? '✅' : '❌';
      },
      // onCell: (record, rowIndex) => {
      //   console.log('onCell', record, rowIndex);
      //   return {};
      // },
      // onCellClick: (record, e) => {
      //   console.log('onCellClick', record, e);
      // },
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 120,
      fixed: 'right',
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            if (record.id) {
              handleEdit(record.id);
            }
            // action?.startEditable?.(record.id ?? 0);
          }}
        >
          Edit
        </a>,
        // <Popconfirm
        //   key="delete"
        //   title="确定要删除这条记录吗？"
        //   onConfirm={async () => {
        //     await deleteWebhook(record.id ?? 0);
        //     actionRef.current?.reloadAndRest?.();
        //   }}
        //   okText="确定"
        //   cancelText="取消"
        // >
        //   <a>Delete</a>
        // </Popconfirm>,
      ],
    },
  ];

  return (
    <>
      <PageContainer>
        <ProTable<DailyPray, API.PageParams>
          loading={loading}
          headerTitle={'查询表格'}
          actionRef={actionRef}
          // beforeSearchSubmit={(params) => {
          //   console.log('beforeSearchSubmit', params);
          //   return params;
          // }}
          // search={{
          //   // filterType: 'query',
          //   layout: 'vertical', // 搜索表单的布局
          //   defaultCollapsed: false, // 默认展开搜索表单
          // }}
          rowKey="id"
          search={false}
          columnsState={{
            onChange: (newColumns) => {
              console.log('newColumns', newColumns);
            },
          }}
          // recordCreatorProps={false}
          onChange={(value) => {
            console.log('onChange', value);
          }}
          toolBarRender={() => [
            // <>
            //   </>,
            // <Button key="syncFromGithubWebhooks" onClick={clickSyncFromGithubWebhooks}>
            //   Sync From Github
            // </Button>,
          ]}
          options={{
            reload: true,
          }}
          // request={async (params, sort, filter) => {
          //   let data = await getList();
          //   console.log('data', data);
          //   // data = data.map((item: object) =>  {return {key:item.id, ...item }})
          //   return {
          //     data: data,
          //     success: true,
          //   };
          // }}
          dataSource={data}
          pagination={{
            // pageSize: 30,
            defaultPageSize: 30,
          }}
          columns={columns}
          // rowSelection={{
          //   onChange: (_, selectedRows) => {
          //     setSelectedRows(selectedRows);
          //   },
          // }}
        />
        {/*{ JSON.stringify( process.env)}*/}
        {/*---- TEST ---- {`${process.env.TEST}`} aaa*/}
        {/*---- TEST ---- {`${process.env.TEST}`} aaa*/}
        {selectedRowsState?.length > 0 && (
          <FooterToolbar
            extra={
              <div>
                sss 已选择{' '}
                <a
                  style={{
                    fontWeight: 600,
                  }}
                >
                  {selectedRowsState.length}
                </a>{' '}
                项 &nbsp;&nbsp;
                <span>
                  服务调用次数总计{' '}
                  {/*{selectedRowsState.reduce((pre, item) => pre + item.callNo!, 0)}{' '}*/}万
                </span>
              </div>
            }
          >
            <Button
              onClick={async () => {
                // await handleRemove(selectedRowsState);
                setSelectedRows([]);
                actionRef.current?.reloadAndRest?.();
              }}
            >
              批量删除
            </Button>
            <Button type="primary">批量审批</Button>
          </FooterToolbar>
        )}
      </PageContainer>
    </>
  );
};
export default TableList;
