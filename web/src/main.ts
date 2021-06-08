import { createApp } from 'vue';
import { framework } from '@mfro/vue-ui';
import App from './main.vue';

import { tiles } from './tiles';
import { newLocalGame } from './game';

const game = newLocalGame(0);

const app = createApp(App, {
  tiles,
  game,
});

app.use(framework);

app.mount('#app');
