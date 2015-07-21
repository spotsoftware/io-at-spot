package it.spot.io.android.auth;

import it.spot.io.android.model.ILoggedUser;

/**
 * @author a.rinaldi
 */
public interface IUserManager {

    ILoggedUser getLoggedUser();

    void setLoggedUser(final ILoggedUser user);
    
}
