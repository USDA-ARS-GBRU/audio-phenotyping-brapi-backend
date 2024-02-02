# Audio Phenotyping API Back-end

## Prerequisites

Before setting up the project, ensure you have the following installed:

- [Node.js](https://nodejs.org/): JavaScript runtime.
- [MySQL](https://dev.mysql.com/downloads/): Relational database system.
- [Redis](https://redis.io/): Key-value store. Follow the [installation guide](https://redis.io/docs/install/install-redis/) for setting up a Redis server.

## Setting up the Project

1. Clone the repository:

    ```bash
    git clone https://github.com/akshat22/brapi-sample.git
    ```

2. Rename `sample.env` to `config.env` and configure the variables:

    - Database settings
    - Redis server settings
    - Host and port for deploying the application

3. Run the `createaudio.sql` script to set up the local database:

    ```bash
    mysql -u <username> -p < createaudio.sql
    ```

4. Install required packages:

    ```bash
    npm install
    ```

5. Start the application:

    ```bash
    npm start
    ```

6. You can now make API calls using a tool like [Postman](https://www.postman.com/).