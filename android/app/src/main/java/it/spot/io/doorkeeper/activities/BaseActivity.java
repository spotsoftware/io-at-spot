package it.spot.io.doorkeeper.activities;

import android.app.AlertDialog;
import android.app.ProgressDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.os.Bundle;
import android.support.v4.view.WindowCompat;
import android.support.v7.app.ActionBarActivity;
import android.widget.Toast;

import it.spot.io.doorkeeper.R;

/**
 * An abstract extension of Android's Activity which provides generic utilities.</br>
 * Please, note that the "Base" prefix sucks.
 *
 * @author Andrea Corzani
 */
public abstract class BaseActivity extends ActionBarActivity {

    protected ProgressDialog mProgressDialog;

    // { ActionBarActivity methods overriding

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        this.supportRequestWindowFeature(WindowCompat.FEATURE_ACTION_BAR);
    }

    // }

    // { Protected methods

    protected void handleGenericError(final String message) {
        final Context context = this;

        this.runOnUiThread(new Runnable() {

            @Override
            public void run() {
                AlertDialog.Builder builder = new AlertDialog.Builder(context);
                builder
                        .setTitle(R.string.error_generic_title)
                        .setMessage(message)
                        .setNeutralButton(android.R.string.ok, new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialog, int which) {
                                dialog.cancel();
                            }
                        })
                        .create()
                        .show();
            }
        });
    }

    protected void handleGenericError(final int msgResourceId) {
        this.handleGenericError(this.getString(msgResourceId));
    }

    /**
     * This method simply shows a system progress dialog accepting resource identifiers for title and content message.
     *
     * @param titleResourceId the resource id for the dialog title
     * @param textResourceId  the resource id for the dialog message
     */
    protected void showProgressDialog(final int titleResourceId, final int textResourceId) {
        if (this.mProgressDialog != null) {
            this.mProgressDialog.dismiss();
        }
        this.mProgressDialog = ProgressDialog.show(this, this.getString(titleResourceId), this.getString(textResourceId), true);
    }

    /**
     * This method hides the progress dialog, if previously opened.
     */
    protected void hideProgressDialog() {
        if (this.mProgressDialog != null) {
            this.mProgressDialog.dismiss();
            this.mProgressDialog = null;
        }
    }

    // }

}
