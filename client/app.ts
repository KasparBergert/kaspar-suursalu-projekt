import { createApp } from 'vue';
import App from './App.vue';
import './styles.css';

export function createQuoraApp() {
    return createApp(App);
}
