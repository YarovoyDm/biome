import React, { useEffect } from 'react';
import './App.css';
import Header from './components/header/header';
import {
  Switch,
} from "react-router-dom";
import AuthPage from './container/authPage/authPage';
import { saveUser } from './redux/action';
import { useDispatch } from 'react-redux'
import {withRouter} from 'react-router'
import UserPage from './container/userPage/userPage';
import {PublicRoute, PrivateRoute} from './routeComponents'
import Messages from './container/messages/messages';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";
import SettingsPage from './container/settingsPage/settingsPage';
import Dashboard from './container/dashboard/dashboard';

function App() {
  const dispatch = useDispatch()
  const auth = getAuth();
  const db = getDatabase();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = ref(db, `users/${user.uid}`)
        onValue(userRef, (snapshot) => {
            dispatch(saveUser(snapshot.val()))
        })
      } else {
        console.log('gg')
        // ...
      }
    });
  })

  return (
    <div>
      {/* <Header /> */}
      <Switch>
        <PrivateRoute path='/dashboard' component={Dashboard} />
        <PublicRoute path='/auth' component={withRouter(AuthPage)} />
      </Switch>
    </div>
  );
}

export default withRouter(App);
