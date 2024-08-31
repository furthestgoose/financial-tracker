<<<<<<< HEAD

=======
>>>>>>> 9f5d010 (ReadME fixed)
Welcome to the FinancePro! This is a React-based application designed to help users manage their finances. With features for account creation and login via Firebase, this app provides a robust solution for financial tracking.

## Features

- **Account Creation**: Users can create an account and securely log in using Firebase Authentication.
- **Financial Management**: Track expenses, income, and other financial metrics.

## Screenshots

## Getting Started

### Prerequisites

To run this project locally, you need the following installed on your machine:

- [Node.js](https://nodejs.org/) (includes npm)
- [Firebase CLI](https://firebase.google.com/docs/cli) (for Firebase services)

### Clone the Repository

First, clone the repository to your local machine:

```bash
git clone https://github.com/yourusername/financial-tracker.git
cd financial-tracker
```

### Install Dependencies
```bash
npm install
```
or
```bash
yarn install
```

### Configure Firebase
To use Firebase Authentication, you need to set up Firebase in your project:
1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new firebase project or use an existing one
3. Register your app with Firebase and get your Firebase configuration details (API key, project ID, etc.).
4. Create a .env file in the root of your project and add the following environment variables with your Firebase credentials:
```plaintext
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```
5. get a FINNHUB API key at [Finhub](https://finnhub.io/)
6. Add to the .env file:
```plaintext
REACT_APP_INVESTMENTS_KEY=your-api-key
```
### Run the Development Server
Start the development server to see the application in action:
```bash
npm start
```
or
```bash
yarn start
```
Open your browser and navigate to http://localhost:3000 to view the application.

### Contributing
If you’d like to contribute to the project, please follow these guidelines:
1. Fork the repository.
2. Create a new branch for your feature or fix.
3. Make your changes and commit them with descriptive messages.
4. Push your branch to GitHub.
5. Open a pull request describing your changes.

### Licence
<<<<<<< HEAD
This project is licensed under the
=======
This project is licensed under the [Creative Commons Licence](https://github.com/furthestgoose/financial-tracker/blob/master/LICENSE)
>>>>>>> 9f5d010 (ReadME fixed)
