import { request } from '@@/exports';

const serviceApi = {
  url: `${process.env.GITHUB_WEBHOOKS_SERVICE_BASE}`,
  headers: {
    Authorization: process.env.GITHUB_WEBHOOKS_SERVICE_APIKEY as string,
  },
};

// export interface Webhook {
//   id?: number;
//   name: string;
//   url: string;
// }
export interface GitHubRepoType {
  repo: string;
  webhooks: string[]; // real url
  webhooks_name: string[]; // display name
  repo_update: string;
  permission: string;
  owner: string;
  html_url: string;
}

export interface PageRepoInfoResult {
  count: number;
  repos: GitHubRepoType[];
}

export async function getPageRepoInfo({ page, per_page }: { page: number; per_page: number }) {
  return request<{
    data: PageRepoInfoResult;
  }>(`${serviceApi.url}/getPageRepoInfo`, {
    method: 'GET',
    headers: serviceApi.headers,
    params: {
      page,
      per_page,
    },
  });
}

export async function getAllRepoInfo() {
  return request<{
    data: GitHubRepoType[];
  }>(`${serviceApi.url}/getAllRepoInfo`, {
    method: 'POST',
    headers: serviceApi.headers,
  });
}
interface UpdateRepoWebhookRequest {
  owner: string;
  repo: string;
  webhooks: string[];
  events?: string[];
}
export async function updateRepoWebhook(data: UpdateRepoWebhookRequest) {
  return request<any>(`${serviceApi.url}/updateWebhook`, {
    method: 'POST',
    headers: serviceApi.headers,
    data: data,
  });
}

//
// export async function updateWebhook(data: Webhook) {
//   return request<any>(
//     `${webhooksServiceApi.url}/${data.id}`,
//     {
//       method: 'PUT',
//       headers: webhooksServiceApi.headers,
//       data: data
//     });
// }
//
// export async function deleteWebhook(id: number) {
//   return request<any>(
//     `${webhooksServiceApi.url}/${id}`,
//     {
//       method: 'DELETE',
//       headers: webhooksServiceApi.headers
//     });
// }
