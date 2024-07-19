import { request } from '@@/exports';

const webhooksServiceApi = {
  url: `${process.env.GITHUB_WEBHOOKS_SERVICE_BASE}/webhooks`,
  headers: {
    Authorization: process.env.GITHUB_WEBHOOKS_SERVICE_APIKEY as string,
  },
};

export interface Webhook {
  id?: number;
  name: string;
  url: string;
}
export async function getWebhooks() {
  let res = await request<{ data: Webhook[] }>(webhooksServiceApi.url, {
    method: 'GET',
    headers: webhooksServiceApi.headers,
  });
  return res.data;
}

export async function createWebhook(data: Webhook) {
  return request<any>(webhooksServiceApi.url, {
    method: 'POST',
    headers: webhooksServiceApi.headers,
    data: data,
  });
}

export async function updateWebhook(data: Webhook) {
  return request<any>(`${webhooksServiceApi.url}/${data.id}`, {
    method: 'PUT',
    headers: webhooksServiceApi.headers,
    data: data,
  });
}

export async function deleteWebhook(id: number) {
  return request<any>(`${webhooksServiceApi.url}/${id}`, {
    method: 'DELETE',
    headers: webhooksServiceApi.headers,
  });
}
