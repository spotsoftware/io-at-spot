package it.spot.io.lib.api;

import android.content.Context;

import com.facebook.stetho.okhttp.StethoInterceptor;
import com.squareup.okhttp.OkHttpClient;

import it.spot.io.lib.R;
import it.spot.io.lib.api.shared.AuthProvider;
import retrofit.RequestInterceptor;
import retrofit.RestAdapter;
import retrofit.client.OkClient;

/**
 * @author a.rinaldi
 */
public class Api {

    private static final String HEADER_AUTH_TOKEN_KEY = "Authorization";
    private static final String HEADER_AUTH_TOKEN_PLACEHOLDER = "Bearer %s";

    private static Api mInstance = null;

    private final OkHttpClient mHttpClient;
    private final RestAdapter mRestAdapter;

    // region Construction

    protected Api(final Context ctx) {
        super();

        this.mHttpClient = new OkHttpClient();
        this.mHttpClient.networkInterceptors().add(new StethoInterceptor());

        this.mRestAdapter = new RestAdapter.Builder()
                .setEndpoint(ctx.getString(R.string.api_url))
                .setClient(new OkClient(this.mHttpClient))
                .setRequestInterceptor(new RequestInterceptor() {
                    @Override
                    public void intercept(RequestFacade request) {
                        request.addHeader("Authorization", String.format("Bearer %s", AuthProvider.getToken(ctx)));
                    }
                }).build();
    }

    public static Api create(Context ctx) {
        if (mInstance == null) {
            mInstance = new Api(ctx);
        }

        return mInstance;
    }

    public static Api getInstance() {
        return mInstance;
    }

    // endregion

    // region Public methods

    public RestAdapter getRestAdapter() {
        return this.mRestAdapter;
    }

    // endregion
}
