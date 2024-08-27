export default [
  { path: '/user', layout: false, routes: [{ path: '/user/login', component: './User/Login' }] },
  { path: '/welcome', name: 'welcome', icon: 'smile', component: './Welcome' },
  {
    path: '/admin',
    icon: 'crown',
    name: 'admin',
    access: 'canAdmin',
    routes: [
      { path: '/admin', redirect: '/admin/sub-page' },
      { path: '/admin/sub-page', component: './Admin' },
    ],
  },
  { icon: 'table', path: '/list', component: './TableList' },
  {
    icon: 'book',
    name: 'youversion',
    path: '/youversion',
    component: './youversion',
    routes: [],
  },
  {
    icon: 'book',
    hideInMenu: true,
    name: 'edit',
    path: '/youversion/edit/:id',
    component: './youversion/edit',
  },
  {
    path: '/github',
    icon: 'crown',
    name: 'github',
    routes: [
      { icon: 'table', name: 'list', path: '/github/github', component: './github/github' },
      { icon: 'table', name: 'webhook', path: '/github/webhooks', component: './github/webhooks' },
    ],
  },
  { icon: 'table', path: '/test', component: './test' },
  { path: '/', redirect: '/welcome' },
  { path: '*', layout: false, component: './404' },
];
