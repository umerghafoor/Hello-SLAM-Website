# Hello SLAM

Hello SLAM is an educational collection of notebooks and a Next.js website that teaches Simultaneous Localization and Mapping (SLAM) techniques (Kalman filters, particle filters, graph-based SLAM, etc.). The interactive site and visualizations are in the `src/` app, and Jupyter notebooks live under `hello-slam/notebooks`.

- Live site: https://hello-slam.optikflows.com/

## Quick start

Install dependencies and run the Next.js site:

```bash
npm install
npm run dev
```

Open the Jupyter notebooks (inside `hello-slam`):

```bash
cd hello-slam
# create a venv or use your Python env, then
pip install -r requirements.txt
./start-notebook.sh
```

Or build and run the `hello-slam` Docker image (Dockerfile included):

```bash
cd hello-slam
docker build -t hello-slam .
docker run --rm -p 8888:8888 hello-slam
```

## Structure

- `src/` — Next.js app and interactive visualizations
- `content/` — MDX lesson content
- `hello-slam/` — Jupyter notebooks, Dockerfile, and helper scripts
- `public/` — static figures and assets

## License
See [hello-slam/LICENSE](hello-slam/LICENSE) for license details.

If you'd like a longer README (badges, contribution guide, deployment notes), I can expand this.
