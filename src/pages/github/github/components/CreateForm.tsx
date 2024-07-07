import { addRule } from '@/services/ant-design-pro/api';
import { PlusOutlined } from '@ant-design/icons';
import { ActionType, ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { FormattedMessage, useIntl, useRequest } from '@umijs/max';
import { Button, Checkbox, Col, Form, Input, message, Row } from 'antd';
import { FC } from 'react';
import { Webhook, createWebhook } from '@/pages/github/github/api';

interface CreateFormProps {
  reload?: ActionType['reload'];
}

const CreateForm: FC<CreateFormProps> = (props) => {
  const { reload } = props;

  const [messageApi, contextHolder] = message.useMessage();

  const { run, loading } = useRequest(createWebhook, {
    manual: true,
    onSuccess: () => {
      messageApi.success('Added successfully');

      reload?.();
    },
    onError: () => {
      messageApi.error('Adding failed, please try again!');
    },
  });

  return (
    <>
      {contextHolder}
      <ModalForm<Webhook>
        title={'New Webhook'}
        trigger={
          <Button type="primary" icon={<PlusOutlined />}>
            <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
          </Button>
        }
        width="50%"
        modalProps={{
          destroyOnClose: true,
          okButtonProps: { loading },
        }}
        onFinish={async (value) => {
          await run(value);
          return true;
        }}
        layout="horizontal"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 16 }}
      >
        <ProFormText label="Name" rules={[{ required: true }]} width="sm" name="name" />
        <ProFormText label="URL" width="md" name="url" rules={[{ required: true }]} />
      </ModalForm>
    </>
  );
};

export default CreateForm;
