import {FuseNavigation} from '@rcm/types';

export const navigation: FuseNavigation[] = [
    {
        id: 'home',
        title: 'Home',
        type: 'group',
        icon: 'home',
        translate: '主页',
        children: [],
        url: './apps/home'
    },
    {
        id: 'log',
        title: 'Log',
        type: 'group',
        icon: 'list',
        translate: '日志',
        children: [],
        url: './apps/log'
    },
    {
        id: 'user',
        title: 'User',
        type: 'group',
        icon: 'account_circle',
        translate: '用户管理',
        children: [],
        url: './apps/user'
    },
    {
        id: 'setting',
        title: 'Setting',
        type: 'group',
        icon: 'settings_applications',
        translate: '设置',
        children: [],
        url: './apps/setting/project-setting'
    },

];
