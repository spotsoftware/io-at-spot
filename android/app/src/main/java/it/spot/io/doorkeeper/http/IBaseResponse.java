package it.spot.io.doorkeeper.http;

/**
 * Created by andreacorzani on 04/11/14.
 */
public interface IBaseResponse {
    public boolean hasError();
    public void setErrorMessage(String errorMessage);
    public String getErrorMessage();
}
