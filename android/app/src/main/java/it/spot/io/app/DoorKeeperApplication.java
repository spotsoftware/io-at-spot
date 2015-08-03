package it.spot.io.app;

import android.app.Application;

import com.facebook.stetho.Stetho;

import it.spot.io.lib.api.Api;

/**
 * The {@link android.app.Application} class for door keeper app.</br>
 * For the moment it's empty because we don't need it, but who knows.
 *
 * @author Andrea Rinaldi
 */
public class DoorKeeperApplication extends Application {

    public static final String SHARED_PREFERENCE_NAME = "door_keeper_prefs";
    public static final String SHARED_PREFERENCE_TOKEN_KEY = "token";

    public static class MessageConstants {
        public static final int MSG_SIGNATURE = 101;
        public static final int MSG_NOTIFICATION_SET = 102;
        public static final int MSG_AUTHENTICATED = 103;
        public static final int MSG_PROGRESS = 201;
        public static final int MSG_DISMISS = 202;
        public static final int MSG_CLEAR = 301;
    }

    // region Application life cycle

    @Override
    public void onCreate() {
        super.onCreate();
        this.initializeStethoDebug();
        Api.create(this);
    }

    // endregion

    // region Private methods

    private void initializeStethoDebug() {
        Stetho.initialize(
                Stetho.newInitializerBuilder(this)
                        .enableDumpapp(Stetho.defaultDumperPluginsProvider(this))
                        .enableWebKitInspector(Stetho.defaultInspectorModulesProvider(this))
                        .build());
    }

    // endregion
}
