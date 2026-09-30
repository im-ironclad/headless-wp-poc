# web: Next.js frontend

See the [root README](../README.md) for setup and [docs/03-frontend-adapter.md](../docs/03-frontend-adapter.md) for architecture.

```bash
yarn dev             # http://localhost:3000 (needs ./wordpress/setup.sh + .env.local)
yarn test            # unit + component tests
yarn test:contract   # against the running WordPress
yarn lint && yarn typecheck && yarn build
```
