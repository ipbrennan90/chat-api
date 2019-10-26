# Chat API

## Getting Started

### Install dependencies

```console
yarn install
```

### Set up data store

- make sure postgres is installed, if it's not [this](https://www.codementor.io/engineerapart/getting-started-with-postgresql-on-mac-osx-are8jcopb) is a good guide for getting setup.

- copy environment example to new env file:

```console
cp ./.env.example ./.env
```

- fill in the postgres user and password information with your own

- setup the databases:

```console
yarn db:setup
```

### Run the test suite

```console
yarn test
```

### Start the application

```console
yarn start
```

## Running migrations

- initial migrations will be run via the setup script but to run new migrations use the migration script:

```console
yarn db:migrate
```
