package it.spot.io.lib.api.shared;

import android.content.Context;

import it.spot.io.lib.api.Api;

/**
 * @author a.rinaldi
 */
public abstract class Client<T> {

    protected T mApiInterface;

    // region Construction

    protected Client(Context context) {
        super();
        this.mApiInterface = Api.create(context).getRestAdapter().create(this.getApiInterface());
    }

    // endregion

    // region Protected methods

    protected abstract Class<T> getApiInterface();

    // endregion
}
