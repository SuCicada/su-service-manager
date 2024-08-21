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
import { FormattedMessage, request, useIntl } from '@umijs/max';
import { Button, Drawer, Input, Popconfirm, message, Select } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import type { FormValueType } from './components/UpdateForm';
import UpdateForm from './components/UpdateForm';
import { getPageRepoInfo, GitHubRepoType, updateRepoWebhook } from './api';
import { getWebhooks, updateWebhook, Webhook } from '@/pages/github/webhooks/api';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.RuleListItem) => {
  const hide = message.loading('正在添加');
  try {
    await addRule({ ...fields });
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
const handleRemove = async (selectedRows: API.RuleListItem[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    await removeRule({
      key: selectedRows.map((row) => row.key),
    });
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
  const [currentRow, setCurrentRow] = useState<API.RuleListItem>();
  const [selectedRowsState, setSelectedRows] = useState<GitHubRepoType[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();

  useEffect(() => {
    getWebhooks().then((res) => {
      setWebhooks(res);
    });
  }, []);
  //
  // const webhooks = await getWebhooks();

  const columns: ProColumns<GitHubRepoType>[] = [
    {
      title: 'repo',
      key: 'repo',
      dataIndex: 'repo',
      valueType: 'text',
      editable: false,
      copyable: true,
      render: (dom, entity) => {
        return (
          <>
            {dom}
            <a target="_blank" rel="noopener noreferrer" href={entity.html_url}>
              <FormattedMessage id="pages.searchTable.view" defaultMessage="View" />
            </a>
          </>
          // target="_blank" rel="noopener noreferrer"
          // onClick={() => {
          //   setCurrentRow(entity);
          //   setShowDetail(true);
          // >
          // </a>
        );
      },
    },
    {
      title: 'owner',
      key: 'owner',
      dataIndex: 'owner',
      valueType: 'text',
      editable: false,
    },
    {
      title: 'webhooks_name',
      key: 'webhooks_name',
      dataIndex: 'webhooks_name',
      // disable: true,
      // filters: true,
      // onFilter: true,
      // ellipsis: true,
      valueType: 'select',
      fieldProps: {
        mode: 'multiple',
        // optionFilterProp: 'label',
        defaultValue: ['asa'],
      },
      request: async () => {
        // const webhooks = await getWebhooks();
        return webhooks.map((webhook) => ({
          label: webhook.name,
          value: webhook.url,
        }));
      },
    },
    // {
    //   title: "html_url",
    //   key: 'html_url',
    //   dataIndex: 'html_url',
    //   valueType: 'text',
    //   editable:false,
    // },
    {
      title: 'repo_update',
      key: 'repo_update',
      dataIndex: 'repo_update',
      valueType: 'text',
      editable: false,
    },
    {
      title: 'permission',
      key: 'permission',
      dataIndex: 'permission',
      valueType: 'text',
      editable: false,
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
            action?.startEditable?.(record.repo ?? 0);
          }}
        >
          Edit
        </a>,
        <Popconfirm
          key="delete"
          title="确定要删除这条记录吗？"
          onConfirm={async () => {
            // await deleteWebhook(record.id ?? 0);
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

  const [batchUpdatedWebhooks, setBatchUpdatedWebhooks] = useState<string[]>([]);
  const doBatchUpdate = async (updateRows: GitHubRepoType[]) => {
    const hide = message.loading('updating');
    console.log('batchUpdate', updateRows);
    // const newWebhooks = batchUpdatedWebhooks.map(webhook => webhook.url);
    const promises = updateRows.map((row) => {
      return updateRepoWebhook({
        owner: row.owner,
        repo: row.repo,
        webhooks: batchUpdatedWebhooks,
        events: ['push', 'workflow_run'],
      });
    });
    await Promise.all(promises);
    hide();
    actionRef.current?.reloadAndRest?.();
  };

  return (
    <PageContainer>
      <EditableProTable<GitHubRepoType, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.searchTable.title',
          defaultMessage: 'Enquiry form',
        })}
        actionRef={actionRef}
        search={false}
        rowKey="repo"
        toolBarRender={() =>
          selectedRowsState?.length > 0
            ? [
                <Select
                  key="select"
                  mode="multiple"
                  allowClear
                  style={{ width: 400 }}
                  placeholder="Select an option"
                  options={webhooks.map((webhook) => ({
                    label: webhook.name,
                    value: webhook.url,
                  }))}
                  onChange={(value, option) => {
                    console.log('Selected', value, option);
                    // const newWebhooks = (option as OptionType[]).map((item) => ({
                    //   name: item.label,
                    //   url: item.value,
                    // }))
                    setBatchUpdatedWebhooks(value);
                  }}
                ></Select>,

                <Button
                  type="primary"
                  key="primary"
                  onClick={async () => {
                    await doBatchUpdate(selectedRowsState);
                  }}
                >
                  Batch Update
                </Button>,
              ]
            : []
        }
        // search={{
        //   labelWidth: 120,
        // }}
        // scroll={{ x: 1500 }}
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
            const newWebhooks = row.webhooks_name.map((webhook) => {
              const wh = webhooks.find((item) => item.name === webhook);
              if (wh) {
                return wh.url;
              }
              return webhook;
            });

            await updateRepoWebhook({
              owner: row.owner,
              repo: row.repo,
              webhooks: newWebhooks,
              events: ['push', 'workflow_run'],
            });
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
        // toolBarRender={() => [<CreateForm key="create" reload={actionRef.current?.reload}/>]}
        options={{
          reload: true,
        }}
        request={async (params, sort, filter) => {
          console.log('params', params);
          let res = await getPageRepoInfo({
            page: params.current ?? 0,
            per_page: params.pageSize ?? 0,
          });
          const { count, repos } = res.data;
          const webhooks = await getWebhooks();
          console.log('count', count);
          console.log('webhooks', webhooks);
          const webhooksMap = webhooks.reduce((acc, cur) => {
            acc[cur.url] = cur.name;
            return acc;
          }, {} as { [key: string]: string });
          repos.forEach((item) => {
            item.webhooks_name = item.webhooks.map((webhook) => webhooksMap[webhook]);
            // console.log(item)
          });
          console.log('data', repos);
          // data = data.map((item: object) =>  {return {key:item.id, ...item }})
          return {
            data: repos,
            success: true,
          };
        }}
        columns={columns}
        rowSelection={{
          columnTitle: ' ', // 关闭全选
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
        pagination={{
          showSizeChanger: true,
        }}
      />
      {/*{ JSON.stringify( process.env)}*/}
      {/*---- TEST ---- {`${process.env.TEST}`} aaa*/}
      {/*---- TEST ---- {`${process.env.TEST}`} aaa*/}
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage id="pages.searchTable.chosen" defaultMessage="Chosen" />{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              <FormattedMessage id="pages.searchTable.item" defaultMessage="项" />
              &nbsp;&nbsp;
              {/*<span>*/}
              {/*  <FormattedMessage*/}
              {/*    id="pages.searchTable.totalServiceCalls"*/}
              {/*    defaultMessage="Total number of service calls"*/}
              {/*  />{' '}*/}
              {/*  {selectedRowsState.reduce((pre, item) => pre + item.callNo!, 0)}{' '}*/}
              {/*  <FormattedMessage id="pages.searchTable.tenThousand" defaultMessage="万" />*/}
              {/*</span>*/}
            </div>
          }
        >
          {/*<Button*/}
          {/*  onClick={async () => {*/}
          {/*    await handleRemove(selectedRowsState);*/}
          {/*    setSelectedRows([]);*/}
          {/*    actionRef.current?.reloadAndRest?.();*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <FormattedMessage*/}
          {/*    id="pages.searchTable.batchDeletion"*/}
          {/*    defaultMessage="Batch deletion"*/}
          {/*  />*/}
          {/*</Button>*/}
          <Button
            type="primary"
            onClick={async () => {
              await doBatchUpdate(selectedRowsState);
            }}
          >
            批量修改
            {/*<FormattedMessage*/}
            {/*  id="pages.searchTable.batchApproval"*/}
            {/*  defaultMessage="Batch approval"*/}
            {/*/>*/}
          </Button>
        </FooterToolbar>
      )}
    </PageContainer>
  );
};

export default TableList;
