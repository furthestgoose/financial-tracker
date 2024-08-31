
Welcome to the Financial Tracker! This is a React-based application designed to help users manage their finances. With features for account creation and login via Firebase, this app provides a robust solution for financial tracking.

## Features

- **Account Creation**: Users can create an account and securely log in using Firebase Authentication.
- **Financial Management**: Track expenses, income, and other financial metrics.

## Screenshots
![Dark Generic Frame](https://github.com/user-attachments/assets/40d3151f-ffe4-4b5a-b31d-cb65afa023f9)
![Dark Generic Frame (1)](https://github.com/user-attachments/assets/34eea446-aff5-4e2c-8a80-fae1c815360b)
![Dark Generic Frame (2)](https://github.com/user-attachments/assets/5f2dc216-f5ed-48b2-862a-422f3b5164c9)
![Dark Generic Frame (3)](https://github.com/user-attachments/assets/5dc180c6-c485-43a9-8301-b05a2820dcd3)
![Dark Generic Frame (4)](https://github.com/user-attachments/assets/a0df96f8-e5ee-4d15-9d62-d6d418dafe19)
![Dark Generic Frame (5)](https://github.com/user-attachments/assets/779a2bb8-56d1-4e1e-8ae7-87c12b742b8b)
![Dark Generic Frame (6)](https://github.com/user-attachments/assets/15e7fd90-b725-464b-80d1-0c0f29481dd0)
![Dark Generic Frame (7)](https://github.com/user-attachments/assets/bb7e854e-6743-47d3-93aa-f77925ab4328)

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
This project is licensed under the [Creative Commons Licence](https://github.com/furthestgoose/financial-tracker/blob/master/LICENSE)
