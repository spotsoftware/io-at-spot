package it.spot.io.lib.proxies.ble;

import android.app.Activity;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothProfile;
import android.util.Log;

import java.io.UnsupportedEncodingException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.UUID;

/**
 * @author a.rinaldi
 */
public class BleDoorActuator
        extends BluetoothGattCallback
        implements IBleDoorActuator {

    private static final String LOGTAG = "IO_AT_SPOT_BLE";

    private static final UUID AUTHENTICATION_SERVICE = UUID.fromString("f000cc40-0451-4000-b000-000000000000");
    private static final UUID READ_DIGITAL_SIG_CHAR = UUID.fromString("f000cc41-0451-4000-b000-000000000000");
    private static final UUID WRITE_TOKEN_CHUNK_CHAR = UUID.fromString("f000cc42-0451-4000-b000-000000000000");
    private static final UUID NOTIFY_AUTHENTICATION_CHAR = UUID.fromString("f000cc43-0451-4000-b000-000000000000");
    private static final UUID WRITE_LAST_TOKEN_CHUNK_CHAR = UUID.fromString("f000cc44-0451-4000-b000-000000000000");
    private static final UUID WRITE_ACCESS_TYPE_CHAR = UUID.fromString("f000cc45-0451-4000-b000-000000000000");
    private static final UUID WRITE_TOKEN_HASH_CHAR = UUID.fromString("f000cc46-0451-4000-b000-000000000000");

    private static final UUID CHARACTERISTIC_UPDATE_NOTIFICATION_DESCRIPTOR_UUID = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb");

    private final Activity mActivity;
    private final BluetoothDevice mDevice;
    private final Listener mListener;

    private BluetoothGatt mConnectedGatt;
    private int mChunkIndex;
    private byte[][] mChunks;
    private String mToken;
    private String mTokenHash;
    private boolean mShouldMark;
    private boolean mShouldOpen;

    // region Construction

    protected BleDoorActuator(Activity activity, BluetoothDevice device, Listener listener) {
        super();

        this.mActivity = activity;
        this.mDevice = device;
        this.mListener = listener;
    }

    public static IBleDoorActuator create(Activity activity, BluetoothDevice device, Listener listener) {
        return new BleDoorActuator(activity, device, listener);
    }

    // endregion

    // region IBleDoorActuator implementation

    @Override
    public void doActionWithToken(String token, boolean shouldMark, boolean shouldOpen) {
        this.mToken = token;
        this.mShouldMark = shouldMark;
        this.mShouldOpen = shouldOpen;
        this.connectToDevice();
    }

    @Override
    public void doActionWithTokenHash(String tokenHash, boolean shouldMark, boolean shouldOpen) {
        Log.i(LOGTAG, "TokenHash " + tokenHash);
        this.mTokenHash = tokenHash;
        this.mShouldMark = shouldMark;
        this.mShouldOpen = shouldOpen;
        this.connectToDevice();
    }

    @Override
    public void destroy() {
        if (mConnectedGatt != null) {
            Log.d(LOGTAG, "Destroying actuator");
            disconnectFromDevice();
            mConnectedGatt = null;
        }
    }

    // endregion

    // region BluetoothGattCallback implementation

    @Override
    public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {


        Log.d(LOGTAG, "Connection State Change: " + status + " -> " + connectionState(newState));
        if (status == BluetoothGatt.GATT_SUCCESS && newState == BluetoothProfile.STATE_CONNECTED) {
            /*
             * Once successfully connected, we must next discover all the services on the
             * device before we can read and write their characteristics.
             */
            gatt.discoverServices();
            // TODO - notify services discovery
        } else if (status == BluetoothGatt.GATT_SUCCESS && newState == BluetoothProfile.STATE_DISCONNECTED) {

            /*
             * If at any point we disconnect, send a message to clear the weather values
             * out of the UI
             */

            //gatt.disconnect();
            //gatt.close();
            //mListener.onBLEDeviceDisconnected();

            disconnectFromDevice();

            // TODO - notify disconnection
        } else if (status != BluetoothGatt.GATT_SUCCESS) {
            /*
             * If there is a failure at any stage, simply disconnect
             */
            //gatt.disconnect();
            //gatt.close();
            //mListener.onBLEDeviceDisconnected();
            disconnectFromDevice();

            mListener.onBLEDeviceError(status, newState);
            // TODO - notify disconnection
        }
    }

    @Override
    public void onServicesDiscovered(BluetoothGatt gatt, int status) {
        Log.d(LOGTAG, "Services discover status: " + (status == BluetoothGatt.GATT_SUCCESS ? "success" : "error"));

        if (mConnectedGatt != null) {
            subscribeAuthenticatedNotification();
        }
    }

    @Override
    public void onCharacteristicRead(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
        //If characteristic is the signature
        if (READ_DIGITAL_SIG_CHAR.equals(characteristic.getUuid())) {
            Log.d(LOGTAG, "Read sig completed");
            if (mConnectedGatt != null) {
                writeAccessTypeCharacteristic();
            }
        }
    }

    @Override
    public void onCharacteristicWrite(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
        //After writing the enable flag, next we read the initial value
        if (status == BluetoothGatt.GATT_SUCCESS) {
            if (WRITE_TOKEN_CHUNK_CHAR.equals(characteristic.getUuid())) {
                writeNextChunk();
                Log.w(LOGTAG, "Write chunk completed");
            } else if (WRITE_LAST_TOKEN_CHUNK_CHAR.equals(characteristic.getUuid())) {
                Log.w(LOGTAG, "Write last chunk completed");
            } else if (WRITE_ACCESS_TYPE_CHAR.equals(characteristic.getUuid())) {
                Log.w(LOGTAG, "Write mark access completed");

                writeTokenHashCharacteristic();
                //writeTokenCharacteristic();
            }
        }
    }

    @Override
    public void onCharacteristicChanged(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic) {

        if (NOTIFY_AUTHENTICATION_CHAR.equals(characteristic.getUuid())) {
            //mMessageHandler.sendMessage(Message.obtain(null, DoorKeeperApplication.MessageConstants.MSG_DISMISS, ""));
            mListener.onBLEWriteTokenCompleted(characteristic.getIntValue(BluetoothGattCharacteristic.FORMAT_UINT32, 0));

            Log.w(LOGTAG, "Notify characteristic changed");

            new Thread(new Runnable() {
                @Override
                public void run() {
                    enableNotification(false);
                }
            }).start();
        }
    }

    @Override
    public void onDescriptorWrite(BluetoothGatt gatt, BluetoothGattDescriptor descriptor, int status) {

        if (descriptor.getValue().equals(BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE)) {
            Log.w(LOGTAG, "Notifications enabled");
            readSignatureCharacteristic();
        } else {
            Log.w(LOGTAG, "Notifications disabled");
            disconnectFromDevice();
        }
    }

    @Override
    public void onReadRemoteRssi(BluetoothGatt gatt, int rssi, int status) {
        Log.d(LOGTAG, "Remote RSSI: " + rssi);
    }

    // endregion

    // region Private methods

    private void connectToDevice() {

        //Obtain the discovered device to connect with
        Log.d(LOGTAG, "Connecting to " + this.mDevice.getName());

        this.mConnectedGatt = this.mDevice.connectGatt(this.mActivity, false, this);
        if (this.mConnectedGatt == null) {
            Log.d(LOGTAG, "Connected gatt is null");
        } else {
            Log.d(LOGTAG, "Connected gatt is NOT null");
        }

        //Display progress UI
        // TODO - notify MSG_PROGRESS, "Connecting to " + this.mDevice.getName() + "..."));
    }

    private void disconnectFromDevice() {
        //Obtain the discovered device to connect with
        Log.d(LOGTAG, "Disconnecting from " + this.mDevice.getName());
        this.mConnectedGatt.disconnect();
        this.mConnectedGatt.close();
        this.mListener.onBLEDeviceDisconnected();
        //Display progress UI
        // TODO - notify MSG_PROGRESS, "Connecting to " + this.mDevice.getName() + "..."));
    }

    private void readSignatureCharacteristic() {
        // TODO - notify MSG_PROGRESS, "Reading signature..."));
        BluetoothGattCharacteristic characteristic = this.mConnectedGatt.getService(AUTHENTICATION_SERVICE)
                .getCharacteristic(READ_DIGITAL_SIG_CHAR);

        Log.d(LOGTAG, "Reading signature characteristic");

        characteristic.getValue();

        this.mConnectedGatt.readCharacteristic(characteristic);
    }

    private static byte[][] chunkArray(byte[] array, int chunkSize) {
        int numOfChunks = (int) Math.ceil((double) array.length / chunkSize);
        byte[][] output = new byte[numOfChunks][];

        for (int i = 0; i < numOfChunks; ++i) {
            int start = i * chunkSize;
            int length = Math.min(array.length - start, chunkSize);

            byte[] temp = new byte[length];
            System.arraycopy(array, start, temp, 0, length);
            output[i] = temp;
        }

        return output;
    }

    private void writeNextChunk() {
        BluetoothGattCharacteristic tokenChunkCharacteristic = mConnectedGatt.getService(AUTHENTICATION_SERVICE)
                .getCharacteristic(WRITE_TOKEN_CHUNK_CHAR);

        BluetoothGattCharacteristic lastTokenChunkCharacteristic = mConnectedGatt.getService(AUTHENTICATION_SERVICE)
                .getCharacteristic(WRITE_LAST_TOKEN_CHUNK_CHAR);

        if (mChunkIndex < mChunks.length - 1) {
            tokenChunkCharacteristic.setValue(mChunks[mChunkIndex]);
            mConnectedGatt.writeCharacteristic(tokenChunkCharacteristic);
            Log.d(LOGTAG, "Write token chunk" + mChunkIndex);
            mChunkIndex++;
        } else {
            lastTokenChunkCharacteristic.setValue(mChunks[mChunks.length - 1]);
            mConnectedGatt.writeCharacteristic(lastTokenChunkCharacteristic);
            Log.d(LOGTAG, "Write last token chunk");
        }
    }

    private void enableNotification(boolean enable) {
        BluetoothGattCharacteristic characteristic = mConnectedGatt.getService(AUTHENTICATION_SERVICE)
                .getCharacteristic(NOTIFY_AUTHENTICATION_CHAR);

        //Enable local notifications
        this.mConnectedGatt.setCharacteristicNotification(characteristic, enable);

        //Enabled remote notifications
        BluetoothGattDescriptor descriptor = characteristic.getDescriptor(CHARACTERISTIC_UPDATE_NOTIFICATION_DESCRIPTOR_UUID);
        descriptor.setValue(enable ? BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE : BluetoothGattDescriptor.DISABLE_NOTIFICATION_VALUE);
        boolean operation = this.mConnectedGatt.writeDescriptor(descriptor);

        Log.d(LOGTAG, "Write enable notification " + operation);
        if (!operation) {
            Log.d(LOGTAG, "Write enable notification fail");
            //enableNotification(enable);
        }
    }

    private void writeAccessTypeCharacteristic() {
        BluetoothGattCharacteristic accessTypeCharacteristic = this.mConnectedGatt.getService(AUTHENTICATION_SERVICE)
                .getCharacteristic(WRITE_ACCESS_TYPE_CHAR);
        ByteBuffer bb = ByteBuffer.allocate(4);
        bb.order(ByteOrder.LITTLE_ENDIAN);
        int access_type = -1;
        if (this.mShouldOpen && this.mShouldMark) {
            access_type = 0;
        } else if (this.mShouldOpen) {
            access_type = 1;
        } else if (this.mShouldMark) {
            access_type = 2;
        }
        bb.putInt(access_type);
        accessTypeCharacteristic.setValue(bb.array());

        if (this.mConnectedGatt.writeCharacteristic(accessTypeCharacteristic)) {
            Log.d(LOGTAG, "Write access type characteristic " + access_type);
        } else {
            Log.d(LOGTAG, "Write access type characteristic " + access_type + " FAILED");
        }
    }

    private void writeTokenHashCharacteristic() {
        String data = mTokenHash;
        byte[] tokenHash = hexStringToByteArray(data);
        BluetoothGattCharacteristic tokenHashCharacteristic = mConnectedGatt.getService(AUTHENTICATION_SERVICE)
                .getCharacteristic(WRITE_TOKEN_HASH_CHAR);
        tokenHashCharacteristic.setValue(tokenHash);

        if (this.mConnectedGatt.writeCharacteristic(tokenHashCharacteristic)) {
            Log.d(LOGTAG, "Written token has characteristic " + tokenHash);
        } else {
            Log.d(LOGTAG, "Written token has characteristic " + tokenHash + " FAILED");
        }
    }

//    private void writeTokenCharacteristic() {
//
//        String data = mToken;
//
//        // TODO - notify MSG_PROGRESS, "Authenticating..."));
//        try {
//            mChunks = chunkArray(data.getBytes("UTF-8"), 20);
//        } catch (UnsupportedEncodingException e) {
//            e.printStackTrace();
//        }
//        mChunkIndex = 0;
//
//        writeNextChunk();
//    }

    /*
     * Enable notification of changes on the data characteristic for each sensor
     * by writing the ENABLE_NOTIFICATION_VALUE flag to that characteristic's
     * configuration descriptor.
     */
    private void subscribeAuthenticatedNotification() {
        enableNotification(true);
    }

    private String connectionState(int status) {
        switch (status) {
            case BluetoothProfile.STATE_CONNECTED:
                return "Connected";
            case BluetoothProfile.STATE_DISCONNECTED:
                return "Disconnected";
            case BluetoothProfile.STATE_CONNECTING:
                return "Connecting";
            case BluetoothProfile.STATE_DISCONNECTING:
                return "Disconnecting";
            default:
                return String.valueOf(status);
        }
    }

    public static byte[] hexStringToByteArray(String s) {
        int len = s.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(s.charAt(i), 16) << 4)
                    + Character.digit(s.charAt(i + 1), 16));
        }
        return data;
    }

    // endregion
}
