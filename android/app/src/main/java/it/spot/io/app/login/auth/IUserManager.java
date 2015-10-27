package it.spot.io.app.login.auth;

import it.spot.io.app.login.auth.model.ILoggedUser;

/**
 * @author a.rinaldi
 */
public interface IUserManager {

    ILoggedUser getLoggedUser();

    void setLoggedUser(final ILoggedUser user);
    
}
