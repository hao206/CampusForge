import { buildApp } from './server/app.js';
import { getServerConfig } from './server/config/serverConfig.js';

const config = getServerConfig();
const app = buildApp(config);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
