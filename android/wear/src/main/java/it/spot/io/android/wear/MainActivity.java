package it.spot.io.android.wear;

import android.os.Bundle;
import android.support.wearable.activity.WearableActivity;
import android.support.wearable.view.BoxInsetLayout;
import android.view.View;
import android.widget.TextView;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

import it.spot.io.lib.proxies.ProxyNotInitializedException;
import it.spot.io.lib.proxies.ProxyNotSupportedException;
import it.spot.io.lib.proxies.ble.BleDoorProxy;
import it.spot.io.lib.proxies.ble.IBleDoorProxy;

public class MainActivity
        extends WearableActivity
        implements IBleDoorProxy.Listener {

    private static final SimpleDateFormat AMBIENT_DATE_FORMAT =
            new SimpleDateFormat("HH:mm", Locale.US);

    private BoxInsetLayout mContainerView;
    private TextView mTextView;
    private TextView mClockView;

    private IBleDoorProxy mDoorProxy;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        setAmbientEnabled();

        this.mDoorProxy = BleDoorProxy.create(this, "", this);
        try {
            if (this.mDoorProxy.init()) {
                this.mDoorProxy.startScanningForDoorController();
            }
        } catch (ProxyNotSupportedException e) {
            e.printStackTrace();
        } catch (ProxyNotInitializedException e) {
            e.printStackTrace();
        }

        mContainerView = (BoxInsetLayout) findViewById(R.id.container);
        mTextView = (TextView) findViewById(R.id.text);
        mClockView = (TextView) findViewById(R.id.clock);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        this.mDoorProxy.destroy();
    }

    @Override
    public void onEnterAmbient(Bundle ambientDetails) {
        super.onEnterAmbient(ambientDetails);
        updateDisplay();
    }

    @Override
    public void onUpdateAmbient() {
        super.onUpdateAmbient();
        updateDisplay();
    }

    @Override
    public void onExitAmbient() {
        updateDisplay();
        super.onExitAmbient();
    }

    private void updateDisplay() {
        if (isAmbient()) {
            mContainerView.setBackgroundColor(getResources().getColor(android.R.color.black));
            mTextView.setTextColor(getResources().getColor(android.R.color.white));
            mClockView.setVisibility(View.VISIBLE);

            mClockView.setText(AMBIENT_DATE_FORMAT.format(new Date()));
        } else {
            mContainerView.setBackground(null);
            mTextView.setTextColor(getResources().getColor(android.R.color.black));
            mClockView.setVisibility(View.GONE);
        }
    }

    // region IBleDoorProxy.Listener implementation

    @Override
    public void onBLEError(String message) {

    }

    @Override
    public void onProxyReady() {
        this.mDoorProxy.openDoor("eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NTQzM2Y5N2NiMDIwODE2MDAyMGYzZGIiLCJpYXQiOjE0Mzc2MzU1Njg1NTYsImV4cCI6MTQzODQ5OTU2ODU1Nn0.uK8Iyf8YuhhqGrLiD4-ndzbuQIWVXT56ZvtNj_Vz1Ak", false);
    }

    @Override
    public void onDoorOpened() {

    }

    // endregion
}
