package it.spot.io.doorkeeper.proximity.ble;

import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothProfile;
import android.content.IntentFilter;
import android.os.Handler;
import android.os.Message;
import android.util.Log;

import java.io.UnsupportedEncodingException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.UUID;

import it.spot.io.doorkeeper.DoorKeeperApplication;

/**
 * Created by andreacorzani on 18/10/14.
 */
public class BleHelper extends BluetoothGattCallback implements IBleHelper, BluetoothAdapter.LeScanCallback {

    private static final String TAG = "BleHelper";

    /* User Authentication Service */
    private static final UUID AUTHENTICATION_SERVICE = UUID.fromString("f000cc40-0451-4000-b000-000000000000");
    private static final UUID READ_DIGITAL_SIG_CHAR = UUID.fromString("f000cc41-0451-4000-b000-000000000000");
    private static final UUID WRITE_TOKEN_CHUNK_CHAR = UUID.fromString("f000cc42-0451-4000-b000-000000000000");
    private static final UUID WRITE_LAST_TOKEN_CHUNK_CHAR = UUID.fromString("f000cc44-0451-4000-b000-000000000000");
    private static final UUID WRITE_MARK_ACCESS_CHAR = UUID.fromString("f000cc45-0451-4000-b000-000000000000");
    private static final UUID NOTIFY_AUTHENTICATION_CHAR = UUID.fromString("f000cc43-0451-4000-b000-000000000000");
    /* Client Configuration Descriptor */
    private static final UUID CLIENT_CHARACTERISTIC_CONFIG = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb");

    private static final String DEVICE_NAME = "raspy";
    private final BleBondingBroadcastReceiver mBondingBroadcastReceiver;
    private boolean mIsActive;
    private BluetoothAdapter mBluetoothAdapter;
    private BluetoothDevice mDevice;
    private BluetoothGatt mConnectedGatt;
    private Activity mActivity;
    private Handler mMessageHandler, mHandler;
    private IBleListener mListener;
    private int mChunkIndex;
    private byte[][] mChunks;
    private String mToken;

    // { Construction
    private Runnable mStopRunnable = new Runnable() {
        @Override
        public void run() {
            stopScan();
        }
    };

    // }

    // { IBleHelper implementation
    private Runnable mStartRunnable = new Runnable() {
        @Override
        public void run() {
            startScan();
        }
    };

    public BleHelper(IBleListener listener, BluetoothAdapter adapter, Activity activity, Handler messageHandler) {
        super();

        this.mIsActive = false;

        this.mBluetoothAdapter = adapter;
        this.mActivity = activity;
        this.mMessageHandler = messageHandler;
        this.mListener = listener;

        this.mBondingBroadcastReceiver = new BleBondingBroadcastReceiver(this.mMessageHandler, this.mListener);

        mHandler = new Handler();
    }

    public static byte[][] chunkArray(byte[] array, int chunkSize) {
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

    @Override
    public void readSignature() {
        connectToDevice();
    }

    @Override
    public void writeToken(String token, boolean mark) {
        if (mConnectedGatt != null) {
            this.mToken = token;
            writeMarkCharacteristic(mark);
        }
    }

    @Override
    public boolean adapterIsOff() {
        return mBluetoothAdapter == null || !mBluetoothAdapter.isEnabled();
    }

    @Override
    public void stop() {
        //Disconnect from any active tag connection
        if (mConnectedGatt != null) {
            mConnectedGatt.disconnect();
            mConnectedGatt.close();
            mConnectedGatt = null;
        }
    }

    // }

    // { Private methods

    @Override
    public void pause() {
        mHandler.removeCallbacks(mStopRunnable);
        mHandler.removeCallbacks(mStartRunnable);
        mActivity.unregisterReceiver(mBondingBroadcastReceiver);
        mBluetoothAdapter.stopLeScan(this);

        this.mIsActive = false;
    }

    @Override
    public boolean isActive() {
        return this.mIsActive;
    }

    @Override
    public void resume() {
        this.startScan();
        this.mActivity.registerReceiver(this.mBondingBroadcastReceiver, new IntentFilter(BluetoothDevice.ACTION_BOND_STATE_CHANGED));
        this.mIsActive = true;
    }

    private void startScan() {
        //mHandler.postDelayed(mStartRunnable, 100);
        this.mBluetoothAdapter.startLeScan(this);
        //mHandler.postDelayed(mStopRunnable, 5000);
    }

    // }

    // { BluetoothGattCallback abstract method implementation

    private void stopScan() {

        mBluetoothAdapter.stopLeScan(this);
    }

    // }

    // { Private runnables

    private void connectToDevice() {

        stopScan();

        //Obtain the discovered device to connect with
        Log.i(TAG, "Connecting to " + this.mDevice.getName());

        this.mConnectedGatt = this.mDevice.connectGatt(this.mActivity, false, this);

        //Display progress UI
        this.mMessageHandler.sendMessage(Message.obtain(null, DoorKeeperApplication.MessageConstants.MSG_PROGRESS, "Connecting to " + this.mDevice.getName() + "..."));
    }

    private void readSignatureCharacteristic() {
        this.mMessageHandler.sendMessage(Message.obtain(null, DoorKeeperApplication.MessageConstants.MSG_PROGRESS, "Reading signature..."));
        BluetoothGattCharacteristic characteristic = this.mConnectedGatt.getService(AUTHENTICATION_SERVICE)
                .getCharacteristic(READ_DIGITAL_SIG_CHAR);

        Log.d(TAG, "Reading signature characteristic");

        characteristic.getValue();

        this.mConnectedGatt.readCharacteristic(characteristic);
    }

    // }

    @Override
    public void onLeScan(BluetoothDevice device, int rssi, byte[] bytes) {

        Log.i(TAG, "New LE Device: " + device.getName() + " @ " + rssi);

        if (DEVICE_NAME.equals(device.getName())) {

            this.stopScan();

            this.mDevice = device;

            if (this.mDevice.getBondState() == BluetoothDevice.BOND_NONE) {

                boolean bondingStatus = this.mDevice.createBond();

                if (bondingStatus) {
                    this.mMessageHandler.sendMessage(Message.obtain(null, DoorKeeperApplication.MessageConstants.MSG_PROGRESS, "Bonding to " + this.mDevice.getName() + "..."));
                } else {
                    this.mMessageHandler.sendMessage(Message.obtain(null, DoorKeeperApplication.MessageConstants.MSG_DISMISS, "Bonding error."));
                }
            } else {
                this.mListener.onBLEDeviceReady();
            }
        }
    }

    private void writeNextChunk() {

        BluetoothGattCharacteristic tokenChunkCharacteristic = mConnectedGatt.getService(AUTHENTICATION_SERVICE)
                .getCharacteristic(WRITE_TOKEN_CHUNK_CHAR);

        BluetoothGattCharacteristic lastTokenChunkCharacteristic = mConnectedGatt.getService(AUTHENTICATION_SERVICE)
                .getCharacteristic(WRITE_LAST_TOKEN_CHUNK_CHAR);

        if (mChunkIndex < mChunks.length - 1) {
            tokenChunkCharacteristic.setValue(mChunks[mChunkIndex]);
            mConnectedGatt.writeCharacteristic(tokenChunkCharacteristic);
            Log.i(TAG, "Write token chunk" + mChunkIndex);
            mChunkIndex++;
        } else {
            lastTokenChunkCharacteristic.setValue(mChunks[mChunks.length - 1]);
            mConnectedGatt.writeCharacteristic(lastTokenChunkCharacteristic);
            Log.i(TAG, "Write last token chunk");
        }

    }


    private void enableNotification(boolean enable) {
        BluetoothGattCharacteristic characteristic;
        if (enable) {

            Log.d(TAG, "Set notifications");
        } else {
            Log.d(TAG, "Remove notifications");
        }

        characteristic = mConnectedGatt.getService(AUTHENTICATION_SERVICE)
                .getCharacteristic(NOTIFY_AUTHENTICATION_CHAR);

        //Enable local notifications
        mConnectedGatt.setCharacteristicNotification(characteristic, enable);

        //Enabled remote notifications
        BluetoothGattDescriptor descriptor = characteristic.getDescriptor(CLIENT_CHARACTERISTIC_CONFIG);
        descriptor.setValue(enable ? BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE : BluetoothGattDescriptor.DISABLE_NOTIFICATION_VALUE);
        mConnectedGatt.writeDescriptor(descriptor);
    }

    private void writeMarkCharacteristic(boolean mark) {

        BluetoothGattCharacteristic markAccessCharacteristic = mConnectedGatt.getService(AUTHENTICATION_SERVICE)
                .getCharacteristic(WRITE_MARK_ACCESS_CHAR);
        ByteBuffer bb = ByteBuffer.allocate(4);
        bb.order(ByteOrder.LITTLE_ENDIAN);
        bb.putInt(mark ? 1 : 0);
        markAccessCharacteristic.setValue(bb.array());
        mConnectedGatt.writeCharacteristic(markAccessCharacteristic);
        Log.i(TAG, "Write mark access characteristic " + mark);
    }

    private void writeTokenCharacteristic() {

        String data = mToken;

        mMessageHandler.sendMessage(Message.obtain(null, DoorKeeperApplication.MessageConstants.MSG_PROGRESS, "Authenticating..."));
        try {
            mChunks = chunkArray(data.getBytes("UTF-8"), 20);
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        mChunkIndex = 0;

        writeNextChunk();
    }

    /*
     * Enable notification of changes on the data characteristic for each sensor
     * by writing the ENABLE_NOTIFICATION_VALUE flag to that characteristic's
     * configuration descriptor.
     */
    private void subscribeAuthenticatedNotification() {
        enableNotification(true);
    }

    @Override
    public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
        Log.d(TAG, "Connection State Change: " + status + " -> " + connectionState(newState));
        if (status == BluetoothGatt.GATT_SUCCESS && newState == BluetoothProfile.STATE_CONNECTED) {
                    /*
                     * Once successfully connected, we must next discover all the services on the
                     * device before we can read and write their characteristics.
                     */
            gatt.discoverServices();
            mMessageHandler.sendMessage(Message.obtain(null, DoorKeeperApplication.MessageConstants.MSG_PROGRESS, "Discovering Services..."));
        } else if (status == BluetoothGatt.GATT_SUCCESS && newState == BluetoothProfile.STATE_DISCONNECTED) {
                    /*
                     * If at any point we disconnect, send a message to clear the weather values
                     * out of the UI
                     */
            gatt.close();
            gatt.disconnect();
            mHandler.sendMessage(Message.obtain(null, DoorKeeperApplication.MessageConstants.MSG_DISMISS, "Disconnected..."));
            //startScan();
            mActivity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    startScan();
                }
            });
        } else if (status != BluetoothGatt.GATT_SUCCESS) {
                    /*
                     * If there is a failure at any stage, simply disconnect
                     */
            gatt.close();
            gatt.disconnect();
        }
    }

    @Override
    public void onServicesDiscovered(BluetoothGatt gatt, int status) {
        Log.d(TAG, "Services Discovered: " + status);

        if (mConnectedGatt != null) {
            subscribeAuthenticatedNotification();
        }
    }

    @Override
    public void onCharacteristicRead(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
        //If characteristic is the signature
        if (READ_DIGITAL_SIG_CHAR.equals(characteristic.getUuid())) {

            Log.w(TAG, "Read sig completed");

            mListener.onBLEReadSignatureCompleted(characteristic.getValue());

            //After reading the initial value, next we enable notifications
            //
        }

    }

    @Override
    public void onCharacteristicWrite(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
        //After writing the enable flag, next we read the initial value
        if(status == BluetoothGatt.GATT_SUCCESS) {
            if (WRITE_TOKEN_CHUNK_CHAR.equals(characteristic.getUuid())) {
                writeNextChunk();
                Log.w(TAG, "Write chunk completed");
            } else if (WRITE_LAST_TOKEN_CHUNK_CHAR.equals(characteristic.getUuid())) {
                Log.w(TAG, "Write last chunk completed");
            } else if (WRITE_MARK_ACCESS_CHAR.equals(characteristic.getUuid())) {
                Log.w(TAG, "Write mark access completed");

                writeTokenCharacteristic();
            }
        }
    }

    @Override
    public void onCharacteristicChanged(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic) {

        if (NOTIFY_AUTHENTICATION_CHAR.equals(characteristic.getUuid())) {
            mMessageHandler.sendMessage(Message.obtain(null, DoorKeeperApplication.MessageConstants.MSG_DISMISS, ""));
            enableNotification(false);

            mListener.onBLEWriteTokenCompleted(characteristic.getIntValue(BluetoothGattCharacteristic.FORMAT_UINT32, 0));
            Log.w(TAG, "Notification of authorization received");
        }
    }

    @Override
    public void onDescriptorWrite(BluetoothGatt gatt, BluetoothGattDescriptor descriptor, int status) {

        if (descriptor.getValue().equals(BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE)) {
            Log.w(TAG, "Notifications enabled");
            readSignatureCharacteristic();
        } else {
            Log.w(TAG, "Notifications disabled");
        }
    }


    @Override
    public void onReadRemoteRssi(BluetoothGatt gatt, int rssi, int status) {
        Log.d(TAG, "Remote RSSI: " + rssi);
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

}
