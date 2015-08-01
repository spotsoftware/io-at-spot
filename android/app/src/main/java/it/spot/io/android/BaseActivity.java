package it.spot.io.android;

import android.app.ProgressDialog;
import android.os.Bundle;
import android.support.v7.app.ActionBarActivity;
import android.widget.Toast;

/**
 * An abstract extension of Android's Activity which provides generic utilities.</br>
 * Please, note that the "Base" prefix sucks.
 *
 * @author Andrea Corzani
 */
public abstract class BaseActivity
        extends ActionBarActivity
        implements BaseActivityInterface {

    protected ProgressDialog mProgressDialog;

    // { ActionBarActivity methods overriding

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    // }

    // { Protected methods

    protected void handleGenericError(final String message) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show();
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
