import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { RootStateOrAny, useSelector } from 'react-redux'

export const PublicRoute: React.FC<any> = ({component: Component, restricted,  ...rest}) => {
    const userID = window.localStorage.getItem('userID')

    return (
        <Route {...rest} render={props => (
            userID && restricted ?
                <Redirect to={`/account/${userID}`} />
                :
                <Component {...props} />
        )} />
    );
};

export const PrivateRoute: React.FC<any> = ({component: Component, restricted, ...rest}) => {
    const userID = window.localStorage.getItem('userID')
    return (
        <Route {...rest} render={props => (
            !userID ?
                <Redirect to={`/auth`} />
            : <Component {...props} />
        )} />
    );
};

