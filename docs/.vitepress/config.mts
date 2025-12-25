import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "契约之匣",
    description: "The Casket of Covenant - UE5 游戏项目设计文档",
    lang: 'zh-CN',

    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            { text: '首页', link: '/' },
            { text: '开发指南', link: '/guide/开发公约' },
            { text: '核心系统', link: '/core/系统架构' },
            { text: '关卡设计', link: '/levels/01-耐力之匣/总体策划' },
            { text: '进度', link: '/progress/' }
        ],

        sidebar: {
            '/guide/': [
                {
                    text: '开发指南',
                    items: [
                        { text: '开发公约', link: '/guide/开发公约' }
                    ]
                }
            ],
            '/core/': [
                {
                    text: '核心系统',
                    items: [
                        { text: '系统架构', link: '/core/系统架构' },
                        { text: '整体流程', link: '/core/整体流程' }
                    ]
                },
                {
                    text: '核心类',
                    collapsed: false,
                    items: [
                        { text: 'GI_FiveBox', link: '/core/class/GI_FiveBox' },
                        { text: 'GM_Core', link: '/core/class/GM_Core' },
                        { text: 'GS_Core', link: '/core/class/GS_Core' },
                        { text: 'PS_FiveBox', link: '/core/class/PS_FiveBox' },
                        { text: 'PC_Core', link: '/core/class/PC_Core' },
                        { text: 'BP_Character_Game', link: '/core/class/BP_Character_Game' },
                        { text: 'AIC_Game', link: '/core/class/AIC_Game' }
                    ]
                }
            ],
            '/levels/': [
                {
                    text: '关卡设计',
                    items: [
                        { text: '01-耐力之匣', link: '/levels/01-耐力之匣/总体策划' },
                        { text: '02-逻辑之匣', link: '/levels/02-逻辑之匣/总体策划' },
                        { text: '03-勇气之匣', link: '/levels/03-勇气之匣/总体策划' },
                        { text: '04-洞察之匣', link: '/levels/04-洞察之匣/总体策划' },
                        { text: '05-牺牲之匣', link: '/levels/05-牺牲之匣/总体策划' }
                    ]
                }
            ],
            '/reference/': [
                {
                    text: '参考文档',
                    items: [
                        { text: '命名规范', link: '/reference/命名规范' },
                        { text: '插件整理', link: '/reference/插件整理' },
                        { text: '插件文档链接', link: '/reference/插件文档链接' },
                        { text: '素材整理', link: '/reference/素材整理' }
                    ]
                }
            ],
            '/progress/': [
                {
                    text: '进度跟踪',
                    items: [
                        { text: '进度总览', link: '/progress/' },
                        { text: '核心系统', link: '/progress/00-核心系统' },
                        { text: '耐力之匣', link: '/progress/01-耐力之匣' },
                        { text: '逻辑之匣', link: '/progress/02-逻辑之匣' },
                        { text: '勇气之匣', link: '/progress/03-勇气之匣' },
                        { text: '洞察之匣', link: '/progress/04-洞察之匣' },
                        { text: '牺牲之匣', link: '/progress/05-牺牲之匣' }
                    ]
                }
            ]
        },

        socialLinks: [
            { icon: 'github', link: 'https://github.com/xuezi2003/UE-The-Casket-of-Covenant' }
        ],

        search: {
            provider: 'local',
            options: {
                locales: {
                    root: {
                        translations: {
                            button: {
                                buttonText: '搜索文档',
                                buttonAriaLabel: '搜索文档'
                            },
                            modal: {
                                noResultsText: '无法找到相关结果',
                                resetButtonTitle: '清除查询条件',
                                footer: {
                                    selectText: '选择',
                                    navigateText: '切换'
                                }
                            }
                        }
                    }
                }
            }
        },

        outline: {
            label: '页面导航',
            level: [2, 3]
        },

        docFooter: {
            prev: '上一页',
            next: '下一页'
        },

        lastUpdated: {
            text: '最后更新于',
            formatOptions: {
                dateStyle: 'short',
                timeStyle: 'short'
            }
        }
    }
})
