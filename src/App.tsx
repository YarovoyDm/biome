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
      <Header />
      <Switch>
        {/* <Route exact={true} path='/feed' component={Feed} /> */}
        <PrivateRoute path='/account/:nick/messages' component={Messages} />
        <PublicRoute path='/auth' component={withRouter(AuthPage)} />
        <PrivateRoute path='/account/:id' component={withRouter(UserPage)} />
      </Switch>
    </div>
  );
}

export default withRouter(App);
