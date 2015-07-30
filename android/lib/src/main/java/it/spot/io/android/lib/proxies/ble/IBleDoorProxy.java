package it.spot.io.android.lib.proxies.ble;

import it.spot.io.android.lib.proxies.ProxyNotInitializedException;
import it.spot.io.android.lib.proxies.ProxyNotSupportedException;

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

    void openDoor(String token, boolean mark);

    void destroy();

    // region Inner listener interface

    interface Listener {

        void onProxyReady();

        void onDoorOpened();
    }

    // endregion
}
