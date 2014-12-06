package it.spot.io.doorkeeper.model;

/**
 * Created by andreacorzani on 18/10/14.
 */
public interface ILoggedUser {

    public String getName();
    public void setName(String name);

    public String getId();
    public void setId(String id);

    public String getToken();
    public void setToken(String token);

    public String getEmail();
    public void setEmail(String email);
}
