package it.spot.io.doorkeeper.model;

/**
 * Created by andreacorzani on 18/10/14.
 */
public class LoggedUser implements ILoggedUser {
    private String mName;
    private String mId;
    private String mToken;
    private String mEmail;

    public LoggedUser(String id, String name, String token, String email){
        this.mId = id;
        this.mName = name;
        this.mToken = token;
        this.mEmail = email;
    }

    @Override
    public String getName() {
        return this.mName;
    }

    @Override
    public void setName(String name) {
        this.mName = name;
    }

    @Override
    public String getId() {
        return this.mId;
    }

    @Override
    public void setId(String id) {
        this.mId = id;
    }

    @Override
    public String getToken() {
        return this.mToken;
    }

    @Override
    public void setToken(String token) {
        this.mToken = token;
    }

    @Override
    public String getEmail() {
        return this.mEmail;
    }

    @Override
    public void setEmail(String email) {
        this.mEmail = email;
    }

}
