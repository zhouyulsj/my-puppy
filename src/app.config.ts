export default defineAppConfig({
  pages: [
    'pages/profile/index',
    'pages/health/index',
    'pages/shopping/index',
    'pages/guide/index',
    'pages/calendar/index',
    'pages/chat/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FF6B35',
    navigationBarTitleText: '毛球健康管家',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#FF6B35',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      { pagePath: 'pages/health/index', text: '健康评估' },
      { pagePath: 'pages/shopping/index', text: '采购清单' },
      { pagePath: 'pages/guide/index', text: '使用指南' },
      { pagePath: 'pages/calendar/index', text: '全年日历' },
      { pagePath: 'pages/chat/index', text: 'AI问答' }
    ]
  }
})
