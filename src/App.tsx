import React, { useEffect } from 'react';
import './App.css';
import Feed from './components/feed/feed';
import Header from './components/header/header';
import {
  Switch,
  Route,
} from "react-router-dom";
import AuthPage from './container/authPage/authPage';
import { saveUser } from './redux/action';
import { useDispatch } from 'react-redux'
import {withRouter} from 'react-router'
import UserPage from './container/userPage/userPage';
import {PublicRoute, PrivateRoute} from './routeComponents'
import Messages from './container/messages/messages';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import * as _ from 'lodash'
import { getDatabase, ref, child, set, get, remove, update } from "firebase/database";

function App() {
  const dispatch = useDispatch()
  const auth = getAuth();
  const db = getDatabase();
  const dbRef = ref(db);

  useEffect(() => {
    // const localData = window.localStorage.getItem('userID')
    // saveUser({id: localData})
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;
        get(child(dbRef, `users/${uid}`)).then((snapshot) => {
          if (snapshot.exists()) {
            dispatch(saveUser(snapshot.val()))
          } else {
              console.log("No data available");
          }
      }).catch((error) => {
          console.error(error);
      });
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
