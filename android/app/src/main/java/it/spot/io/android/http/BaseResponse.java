package it.spot.io.android.http;

/**
 * Created by andreacorzani on 04/11/14.
 */
public class BaseResponse implements IBaseResponse{

    private String mErrorMessage;

    public BaseResponse(){
        this.mErrorMessage = "";
    }

    @Override
    public boolean hasError() {
        return this.mErrorMessage != "";
    }

    @Override
    public void setErrorMessage(String errorMessage) {
        this.mErrorMessage = errorMessage;
    }

    @Override
    public String getErrorMessage() {
        return this.mErrorMessage;
    }
}
