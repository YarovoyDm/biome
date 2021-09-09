import React from 'react'
import { RootStateOrAny, useSelector } from 'react-redux'
import { NavLink, Switch, withRouter } from 'react-router-dom'
import * as _ from 'lodash'
import { ReactComponent as User } from '../../images/user.svg';
import { ReactComponent as Message } from '../../images/message.svg';
import { ReactComponent as Settings } from '../../images/settings.svg';
import { ReactComponent as Users } from '../../images/users.svg';

import styles from './dashboard.module.scss'
import { PrivateRoute } from '../../routeComponents';
import SettingsPage from '../settingsPage/settingsPage';
import Messages from '../messages/messages';
import UserPage from '../userPage/userPage';

const Dashboard = () => {
    const user = useSelector((state: RootStateOrAny) => {
        return state.auth.currentUser
    })

    const renderPanelNav = () => {
        const data = [
            { url: `/dashboard/${user.id}`, label: 'Account', icon: () => <User className={styles.navIcon} /> },
            { url: `/dashboard/users`, label: 'Users', icon: () => <Users className={styles.navIcon} /> },
            { url: `/dashboard/${user.id}/messages`, label: 'Messages', icon: () => <Message className={styles.navIcon} /> },
            { url: `/dashboard/${user.id}/settings`, label: 'Settings', icon: () => <Settings className={styles.navIcon} /> }
        ]
        return _.map(data, item => {
            return <NavLink to={item.url}
                className={styles.navItem}
                activeClassName={styles.navItemActive}>
                {item.icon()}
                <div className={styles.navItemText}>{item.label}</div>
            </NavLink>
        })
    }

    return (
        <div className={styles.dahsboard}>
            <div className={styles.dashboardPanel}>
                <div className={styles.panelUserBlock}>
                    <div className={styles.userPhoto}>{user.displayName && user.displayName.split('')[0]}</div>
                    <div className={styles.userNick}>{user.displayName}</div>
                </div>
                <div className={styles.panelNav}>
                    {renderPanelNav()}
                </div>
            </div>
            <div className={styles.dashboardMain}>
                <div className={styles.mainPageResult}>
                    <Switch>
                        <PrivateRoute path='/dashboard/:id/settings' component={SettingsPage} />
                        <PrivateRoute path='/dashboard/:id/messages' component={withRouter(Messages)} />
                        <PrivateRoute path='/dashboard/:id' component={withRouter(UserPage)} />
                    </Switch>
                </div>
                <div className={styles.mainSugg}>
                    1
                </div>
            </div>
        </div>
    )
}

export default Dashboard