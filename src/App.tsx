import React, { useEffect } from 'react';
import './App.css';
import Feed from './components/feed/feed';
import Header from './components/header/header';
import {
  Switch,
  Route,
} from "react-router-dom";
import SignUpPage from './container/authPage/authPage';
import { saveUser } from './redux/action';
import { useDispatch } from 'react-redux'
import {withRouter} from 'react-router'
import UserPage from './container/userPage/userPage';
import {PublicRoute, PrivateRoute} from './routeComponents'

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    const userIdLocal = window.localStorage.getItem('userID')
    const userNameLocal = window.localStorage.getItem('userName')
    dispatch(saveUser(userIdLocal, userNameLocal))
  })

  return (
    <div>
      <Header />
      <Switch>
        <Route exact={true} path='/feed' component={Feed} />
        <PublicRoute restricted={true} path='/auth' component={withRouter(SignUpPage)} />
        <PrivateRoute path='/account/:nick' component={withRouter(UserPage)} />
      </Switch>
    </div>
  );
}

export default withRouter(App);
