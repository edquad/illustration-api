import dev from './config.dev.json';
import qa from './config.qa.json';
import qa2 from  './config.qa2.json';
import sandbox from './config.sandbox.json';

const APP_NAME = 'vite-react-spa';

export function resolveConfig() {
    const hostname = window.location.hostname;
    if(hostname === "localhost") {
        return sandbox;
    } else if (hostname.startsWith(`${APP_NAME}.sandbox1`)) {
        return sandbox;
    } else if (hostname.startsWith(`${APP_NAME}.dev1`)) {
        return dev;
    } else if (hostname.startsWith(`${APP_NAME}.qa1`)) {
        return qa;
    } else if (hostname.startsWith(`${APP_NAME}-qa2.qa1`)) {
        return qa2;
    }
    return sandbox;
}
