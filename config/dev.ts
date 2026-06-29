import type { UserConfigExport } from '@tarojs/cli';
export default {
  logger: {
    quiet: false,
    stats: true,
  },
  mini: {},
  h5: {
    publicPath: '/',
    devServer: {
      open: false, //禁止自动打开浏览器
    },
  },
} satisfies UserConfigExport<'webpack5'>;
