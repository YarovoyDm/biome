import React from 'react'
import { RootStateOrAny, useSelector } from 'react-redux';
import {
    Switch,
    Route,
    NavLink
} from "react-router-dom";

import styles from './settingsPage.module.scss'

const SettingsPage = () => {
    const user = useSelector((state: RootStateOrAny) => {
        return state.auth.currentUser
    })
    return (
        <div className={styles.settingsPage}>
            <div className={styles.settingsMain}>
                <div className={styles.settingsTitle}>Settings</div>
                <div className={styles.settingsMain}>
                    <div className={styles.settingsNav}>
                        <NavLink to={`/account/${user.id}/settings/general`} exact className="navBar__item" activeClassName="active">General</NavLink>
                        <NavLink to={`/account/${user.id}/settings/privacy-settings`} className="navBar__item" activeClassName="active">Privacy</NavLink>
                    </div>
                    <div className={styles.settingsContent}>
                        <Switch>
                            <Route path='/account/:id/settings/general' exact={true} render={() => <div className="Books__pageName">Избранное</div>} />
                            <Route path='/account/:id/settings/privacy-settings' render={() => <div className="Books__pageName">Библиотека</div>} />
                        </Switch>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SettingsPage