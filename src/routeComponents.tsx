import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { RootStateOrAny, useSelector } from 'react-redux'

export const PublicRoute: React.FC<any> = ({component: Component, ...rest}) => {
    const user = useSelector((state: RootStateOrAny) => {
        return state.auth.currentUser.userName
    })  
    return (
        <Route {...rest} render={props => (
            user ?
                <Component {...props} />
            : <Redirect to="/auth" />
        )} />
    );
};

export const PrivateRoute: React.FC<any> = ({component: Component, restricted, ...rest}) => {
    const user = useSelector((state: RootStateOrAny) => {
        return state.auth.currentUser.userName
    })  
    return (
        <Route {...rest} render={props => (
            user && restricted ?
                <Redirect to={`/account/${user}`} />
            : <Component {...props} />
        )} />
    );
};

