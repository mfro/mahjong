module.exports = {
  publicPath: '',

  outputDir: 'dist',

  pages: {
    index: {
      title: 'tetris',
      entry: 'src/main.ts',
      filename: 'index.html',
      template: 'src/main.html',
    },
  },
};
