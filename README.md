# How Rare

How Rare is a small React app for estimating the odds of opening a specific Magic: The Gathering card from booster packs. Search for a card, pick the booster model, and see probability, expected copies, and pack curve insights based on Scryfall data.

## Run locally

1. Install dependencies:
   ```bash
   yarn install
   ```
2. Start the dev server:
   ```bash
   yarn dev
   ```
3. Open the app:
   ```
   http://localhost:5173
   ```

### Other useful commands

```bash
# Build for production
yarn build

# Preview the production build
yarn preview

# Lint the codebase
yarn lint
```

## Update the dataset

1. Download the Scryfall bulk data file ("Default Cards") and save it to:
   ```
   bulk/default-cards.json
   ```
   The bulk data list and download link are available at https://scryfall.com/docs/api/bulk-data.
2. Process the data into the app’s JSON files:
   ```bash
   yarn process-cards
   ```
   This generates:
   - `bulk/processed-cards.ndjson`
   - `public/sets.json`
   - `public/card-names.json`
