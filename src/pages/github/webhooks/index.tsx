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
} from '@ant-design/pro-components';
import { request } from '@umijs/max';
import { Button, Drawer, Input, Popconfirm, message } from 'antd';
import React, { useRef, useState } from 'react';
import type { FormValueType } from './components/UpdateForm';
import UpdateForm from './components/UpdateForm';
import CreateForm from './components/CreateForm';
import { deleteWebhook, getWebhooks, updateWebhook, Webhook } from '@/pages/github/webhooks/api';
import { syncFromGithubWebhooks } from '@/pages/github/webhooks/service';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.RuleListItem) => {
  const hide = message.loading('正在添加');
  try {
    await addRule({
      ...fields,
    });
    hide();
    message.success('Added successfully');
    return true;
  } catch (error) {
    hide();
    message.error('Adding failed, please try again!');
    return false;
  }
};

/**
 * @en-US Update node
 * @zh-CN 更新节点
 *
 * @param fields
 */
const handleUpdate = async (fields: FormValueType) => {
  const hide = message.loading('Configuring');
  try {
    await updateRule({
      name: fields.name,
      desc: fields.desc,
      key: fields.key,
    });
    hide();
    message.success('Configuration is successful');
    return true;
  } catch (error) {
    hide();
    message.error('Configuration failed, please try again!');
    return false;
  }
};

/**
 *  Delete node
 * @zh-CN 删除节点
 *
 * @param selectedRows
 */
const handleRemove = async (selectedRows: Webhook[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    for (let row of selectedRows) {
      if (row.id) {
        await deleteWebhook(row.id);
      }
    }
    // await removeRule({
    //   key: selectedRows.map((row) => row.key),
    // });
    hide();
    message.success('Deleted successfully and will refresh soon');
    return true;
  } catch (error) {
    hide();
    message.error('Delete failed, please try again');
    return false;
  }
};
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

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */

  const columns: ProColumns<Webhook>[] = [
    {
      title: 'name',
      key: 'name',
      dataIndex: 'name',
      valueType: 'text',
      // editable: true,
    },
    {
      title: 'url',
      key: 'url',
      dataIndex: 'url',
      sorter: (a, b) => a.url.length - b.url.length,
      valueType: 'text',
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
            action?.startEditable?.(record.id ?? 0);
          }}
        >
          Edit
        </a>,
        <Popconfirm
          key="delete"
          title="确定要删除这条记录吗？"
          onConfirm={async () => {
            await deleteWebhook(record.id ?? 0);
            actionRef.current?.reloadAndRest?.();
          }}
          okText="确定"
          cancelText="取消"
        >
          <a>Delete</a>
        </Popconfirm>,
      ],
    },
  ];
  const clickSyncFromGithubWebhooks = async () => {
    setLoading(true);
    try {
      // console.log('sleep start');
      await syncFromGithubWebhooks();
      // const sleep = util.promisify(setTimeout);
      // await new Promise(resolve => {
      //   setTimeout(resolve, 1000)
      // });
      // console.log('sleep over');
      actionRef.current?.reloadAndRest?.();
    } finally {
      setLoading(false);
    }
  };
  return (
    <PageContainer>
      <EditableProTable<Webhook, API.PageParams>
        loading={loading}
        headerTitle={'查询表格'}
        actionRef={actionRef}
        search={false}
        rowKey="id"
        // search={{
        //   labelWidth: 120,
        // }}
        columnsState={{
          onChange: (newColumns) => {
            console.log('newColumns', newColumns);
          },
        }}
        editable={{
          type: 'multiple',
          onSave: async (key, row) => {
            console.log('onSave', key, row);
            // await waitTime(2000);
            await updateWebhook({
              id: key,
              ...row,
            } as Webhook);
            actionRef.current?.reloadAndRest?.();
          },
          onChange: (editableKeys, editableRows) => {
            console.log('onChange', editableKeys, editableRows);
          },
          actionRender: (row, config, dom) => {
            return [dom.cancel, dom.save, dom.delete];
          },
          // onValuesChange: (record, dataSource) => {
          //   console.log('onValuesChange', record, dataSource);
          // }
          // onCancel: (key, row,a,b) => {
          //   console.log('onCancel', key, row);
          //   return
          // }
        }}
        recordCreatorProps={false}
        onChange={(value) => {
          console.log('onChange', value);
        }}
        toolBarRender={() => [
          <Button key="syncFromGithubWebhooks" onClick={clickSyncFromGithubWebhooks}>
            Sync From Github
          </Button>,
          <CreateForm key="create" reload={actionRef.current?.reload} />,
        ]}
        options={{
          reload: true,
        }}
        request={async (params, sort, filter) => {
          let data = await getWebhooks();
          console.log('data', data);
          // data = data.map((item: object) =>  {return {key:item.id, ...item }})
          return {
            data: data,
            success: true,
          };
        }}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
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
              await handleRemove(selectedRowsState);
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
  );
};
export default TableList;
