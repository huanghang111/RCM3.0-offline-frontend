import {RcmConfig} from '@rcm/types';

export const rcmConfig: RcmConfig = {
    // Color themes can be defined in src/app/app.theme.scss
    colorTheme: 'theme-default',
    customScrollbars: true,
    layout: {
        style: 'horizontal-layout-1',
        width: 'fullwidth',
        navbar: {
            primaryBackground: 'fuse-navy-700',
            secondaryBackground: 'fuse-navy-900',
            folded: false,
            hidden: false,
            position: 'top',
            variant: 'vertical-style-1'
        },
        toolbar: {
            background: 'fuse-white-500',
            customBackgroundColor: false,
            hidden: false,
            position: 'above'
        },
        footer: {
            background: 'fuse-navy-900',
            customBackgroundColor: true,
            hidden: false,
            position: 'above-fixed'
        },
        sidepanel: {
            hidden: false,
            position: 'right'
        }
    }
};
