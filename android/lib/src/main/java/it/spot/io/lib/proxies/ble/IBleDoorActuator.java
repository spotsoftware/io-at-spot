package it.spot.io.lib.proxies.ble;

/**
 * @author a.rinaldi
 */
public interface IBleDoorActuator {

    void openDoor(String token, boolean shouldMark);

    void destroy();

    // region Inner listener interface

    interface Listener {

        void onBLEWriteTokenCompleted(int result);

        void onBLEDeviceDisconnected();

        void onBLEDeviceError(int status, int newState);
    }

    // endregion
}
