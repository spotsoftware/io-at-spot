package it.spot.io.android.lib.ble;

import it.spot.io.android.lib.ProxyNotInitializedException;
import it.spot.io.android.lib.ProxyNotSupportedException;

/**
 * @author a.rinaldi
 */
public interface IBleDoorProxy {

    /**
     * Initializes the proxy, checking for ble feature availability and setting up all the managers and adapters
     * needed.
     *
     * @return {@code true} if everything was fine, {@code false} otherwise
     */
    boolean init() throws ProxyNotSupportedException;

    void setScanningPeriod(int period);

    void startScanningForDoorController() throws ProxyNotInitializedException;

    void destroy();

    // region Inner listener interface

    interface Listener {

        void onProxyReady();
    }

    // endregion
}
