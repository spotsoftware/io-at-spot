package it.spot.io.app.login.auth.model;

import android.os.Parcel;
import android.os.Parcelable;

/**
 * @author a.rinaldi
 */
public class LoggedUser implements ILoggedUser {

    // { Properties

    private String mName;
    private String mId;
    private String mToken;
    private String mTokenHash;
    private String mEmail;

    // }

    // { Construction

    public LoggedUser(final String id, final String name, final String token, final String email, final String tokenHash) {
        super();

        this.mId = id;
        this.mName = name;
        this.mToken = token;
        this.mEmail = email;
        this.mTokenHash = tokenHash;
    }

    public LoggedUser(final Parcel in) {
        super();

        this.mId = in.readString();
        this.mName = in.readString();
        this.mToken = in.readString();
        this.mEmail = in.readString();
        this.mTokenHash = in.readString();
    }

    // }

    // { ILoggedUser implementation

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
    public String getTokenHash() {
        return this.mTokenHash;
    }

    @Override
    public void setTokenHash(String tokenHash) {
        this.mTokenHash = tokenHash;
    }

    @Override
    public String getEmail() {
        return this.mEmail;
    }

    @Override
    public void setEmail(String email) {
        this.mEmail = email;
    }

    // }

    // { Parcelable implementation

    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(final Parcel dest, final int flags) {
        dest.writeString(this.mId);
        dest.writeString(this.mName);
        dest.writeString(this.mToken);
        dest.writeString(this.mEmail);
        dest.writeString(this.mTokenHash);
    }

    public static final Parcelable.Creator CREATOR = new Parcelable.Creator() {
        public ILoggedUser createFromParcel(Parcel in) {
            return new LoggedUser(in);
        }

        public ILoggedUser[] newArray(int size) {
            return new ILoggedUser[size];
        }
    };

    // }

}
