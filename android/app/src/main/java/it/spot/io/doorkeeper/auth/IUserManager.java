package it.spot.io.doorkeeper.auth;

import it.spot.io.doorkeeper.model.ILoggedUser;

/**
 * @author a.rinaldi
 */
public interface IUserManager {

    ILoggedUser getLoggedUser();

    void setLoggedUser(final ILoggedUser user);
    
}
