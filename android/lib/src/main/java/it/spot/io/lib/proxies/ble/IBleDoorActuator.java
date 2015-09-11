package it.spot.io.lib.proxies.ble;

/**
 * @author a.rinaldi
 */
public interface IBleDoorActuator {

    void doActionWithToken(String token, boolean shouldMark, boolean shouldOpen);

    void doActionWithTokenHash(String token, boolean shouldMark, boolean shouldOpen);

    void destroy();

    // region Inner listener interface

    interface Listener {

        void onBLEWriteTokenCompleted(int result);

        void onBLEDeviceDisconnected();

        void onBLEDeviceError(int status, int newState);
    }

    // endregion
}
