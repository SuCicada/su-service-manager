import { getAllRepoInfo, getPageRepoInfo } from '@/pages/github/github/api';
import { createWebhook, getWebhooks } from '@/pages/github/webhooks/api';
import CryptoJS from 'crypto-js';

export const syncFromGithubWebhooks = async () => {
  const res = await getAllRepoInfo();
  const repos = res.data;

  const webhooks = repos.flatMap((repo) => {
    return repo.webhooks;
  });

  const myWebhooks = await getWebhooks();
  // not in myWebhooks
  let toCreate = webhooks.filter((url) => {
    return !myWebhooks.some((hook) => hook.url === url);
  });

  toCreate = [...new Set(toCreate)];

  for (const url of toCreate) {
    try {
      const name = CryptoJS.MD5(url).toString();
      await createWebhook({ name, url });
      console.log('createWebhook', name, url);
    } catch (e) {
      console.error('createWebhook', e);
    }
  }
};
