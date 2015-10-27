package it.spot.io.lib.proxies.ble;

import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanResult;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Handler;
import android.util.Log;

import it.spot.io.lib.proxies.ProxyNotInitializedException;
import it.spot.io.lib.proxies.ProxyNotSupportedException;

/**
 * @author a.rinaldi
 */
public class BleDoorProxy
        extends ScanCallback
        implements IBleDoorProxy, IBleDoorActuator.Listener, Runnable {

    public static final int REQUEST_CODE_ENABLE_BT = 100;

    private static final int DEFAULT_SCAN_PERIOD = 30000;
    private static final String LOGTAG = "IO_AT_SPOT_BLE";

    private final Activity mActivity;
    private final Listener mListener;
    private final Handler mHandler;
    private final String mDoorId;

    private boolean mInitialized;
    private boolean mDiscovering;
    private int mScanPeriod;

    private BluetoothDevice mDoorBleDevice;
    private IBleDoorActuator mDoorActuator;
    private BluetoothManager mBtManager;
    private BluetoothAdapter mBtAdapter;
    private BluetoothLeScanner mBleAdapter;
    private BluetoothBondBroadcastReceiver mBondReceiver;

    // region Construction

    protected BleDoorProxy(Activity activity, String doorId, Listener listener) {
        super();
        this.mActivity = activity;
        this.mDoorId = doorId;
        this.mListener = listener;
        this.mHandler = new Handler();

        this.mInitialized = false;
        this.mDiscovering = false;
        this.mScanPeriod = DEFAULT_SCAN_PERIOD;
    }

    public static IBleDoorProxy create(Activity activity, String doorId, Listener listener) {
        return new BleDoorProxy(activity, doorId, listener);
    }

    // endregion

    // region IBleDoorProxy implementation

    /**
     * {@inheritDoc}<br/>
     * You should handle the {@link Activity#onActivityResult(int, int, Intent)} event in you activity,
     * it could get triggered in the case the bluetooth adapter is off when this method gets called. If the
     * request code is {@link #REQUEST_CODE_ENABLE_BT} and the result code is {@link Activity#RESULT_OK}
     * you should call this method again to retry an initialization process.<br/>
     */
    @Override
    public boolean init() throws ProxyNotSupportedException {
        if (!this.mActivity.getPackageManager().hasSystemFeature(PackageManager.FEATURE_BLUETOOTH_LE)) {
            throw new ProxyNotSupportedException("BleDoorProxy is not supported because of missing features on the device.");
        }

        if (this.mBtManager == null) {
            this.mBtManager = (BluetoothManager) this.mActivity.getSystemService(Context.BLUETOOTH_SERVICE);
            this.mBtAdapter = this.mBtManager.getAdapter();
            this.mBleAdapter = this.mBtAdapter.getBluetoothLeScanner();
        }

        if (this.mBtAdapter == null || !this.mBtAdapter.isEnabled()) {
            this.mActivity.startActivityForResult(new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE), REQUEST_CODE_ENABLE_BT);
            return false;
        }

        this.mInitialized = true;
        return true;
    }

    @Override
    public void setScanningPeriod(int period) {
        this.mScanPeriod = period;
    }

    @Override
    public void startScanningForDoorController() throws ProxyNotInitializedException {
        if (!this.mInitialized) {
            throw new ProxyNotInitializedException("BleDoorProxy wasn't properly initialized");
        }
        this.startScan();
    }

    @Override
    public void openDoor(String token, boolean mark) {

        Log.i(LOGTAG, "Token " + token);

        this.mDoorActuator = BleDoorActuator.create(this.mActivity, this.mDoorBleDevice, new IBleDoorActuator.Listener() {

            @Override
            public void onBLEWriteTokenCompleted(int result) {
                mListener.onDoorOpened();
            }

            @Override
            public void onBLEDeviceDisconnected() {
                startScan();
            }

            @Override
            public void onBLEDeviceError(int status, int newState) {
                Log.e(LOGTAG, String.format("onBLEDeviceError with status %d and newState %d", status, newState));
                mListener.onBLEError("An error occurred, please retry");
            }
        });

        this.mDoorActuator.doActionWithToken(token, mark, true);
    }


    @Override
    public void openAndMark(String tokenHash) {
        this.mDoorActuator = BleDoorActuator.create(this.mActivity, this.mDoorBleDevice, this);
        this.mDoorActuator.doActionWithTokenHash(tokenHash, true, true);
    }

    @Override
    public void markOnly(String tokenHash) {
        this.mDoorActuator = BleDoorActuator.create(this.mActivity, this.mDoorBleDevice, this);
        this.mDoorActuator.doActionWithTokenHash(tokenHash, true, false);
    }

    @Override
    public void openOnly(String tokenHash) {
        this.mDoorActuator = BleDoorActuator.create(this.mActivity, this.mDoorBleDevice, this);
        this.mDoorActuator.doActionWithTokenHash(tokenHash, false, true);
    }

    @Override
    public void destroy() {
        this.stopScan();
        this.cancelBondBroadcastReceiver();
        this.destroyDoorActuator();
        this.mHandler.removeCallbacks(this);
    }

    // endregion

    // region ScanCallback methods overriding

    @Override
    public void onScanResult(int callbackType, ScanResult result) {
        Log.d(LOGTAG, "Found device " + result.getDevice().getName() + " with " + result.getRssi() + " rssi");
        if (result.getDevice().getName() != null && result.getDevice().getName().equals(this.mDoorId)) {
            this.mDoorBleDevice = result.getDevice();
            this.mListener.onProxyReady();
            this.stopScan();
        }
    }

    @Override
    public void onScanFailed(int errorCode) {
        super.onScanFailed(errorCode);
        this.mDiscovering = false;
        this.mHandler.removeCallbacks(this);
    }

    // endregion

    // region IBleDoorActuator.Listener implementation

    @Override
    public void onBLEWriteTokenCompleted(int result) {
        mListener.onDoorOpened();
    }

    @Override
    public void onBLEDeviceDisconnected() {
        startScan();
    }

    @Override
    public void onBLEDeviceError(int status, int newState) {
        Log.e(LOGTAG, String.format("onBLEDeviceError with status %d and newState %d", status, newState));
        mListener.onBLEError("An error occurred, please retry");
    }

    // endregion

    // region Runnable implementation

    @Override
    public void run() {
        this.stopScan();
    }

    // endregion

    // region Private methods

    private void startScan() {
        if (!this.mDiscovering) {
            Log.d(LOGTAG, "Start scanning ble devices");

            this.mDiscovering = true;
            this.mBleAdapter.startScan(this);
            // schedules scan stop
            this.mHandler.postDelayed(this, this.mScanPeriod);
        } else {
            Log.d(LOGTAG, "Scanning ble devices already taking place");
        }
    }

    private void stopScan() {
        if (this.mDiscovering) {
            this.mDiscovering = false;
            this.mBleAdapter.stopScan(this);
            this.cancelBondBroadcastReceiver();
        }
    }

    private void cancelBondBroadcastReceiver() {
        if (this.mBondReceiver != null) {
            this.mActivity.unregisterReceiver(this.mBondReceiver);
            this.mBondReceiver = null;
        }
    }

    private void destroyDoorActuator() {
        if (this.mDoorActuator != null) {
            this.mDoorActuator.destroy();
            this.mDoorActuator = null;
        }
    }

    // endregion
}
